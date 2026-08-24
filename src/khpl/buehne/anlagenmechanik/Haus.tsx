import { useEffect, useRef } from 'react'
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from 'motion/react'
import {
  BAUTEILE,
  FUELLDRUCK,
  KALT,
  SICHERHEITSVENTIL_BAR,
  WAERMELAUF_DAUER,
  WARM,
  druckverlust,
  type BauteilId,
  type BuehnenZustand,
  type KnotenId,
} from './kanon'
import {
  ALLE_KNOTEN,
  BAUTEIL_ORTE,
  HAUS,
  HEIZKOERPER,
  RAHMEN,
  RICHTIGER_WEG,
  START,
  STRANG,
  STRANGVERTEILUNG_Y,
  TRAGENDE_WAND,
  TREPPE_ORT,
  WAERMEPUMPE_ORT,
  WELT,
  ZIEL,
  istVerstellt,
  kamera,
  knotenBei,
  knotenPunkt,
  pfadDatenWeich,
  zieheNach,
  type Punkt,
} from './zeichnung'

/** Alles außer A1 spielt in dieser einen Welt. */
type HausZustand = Exclude<BuehnenZustand, { szene: 'anlage' }>

/**
 * **Das Haus im Schnitt** — der Keller und was darüber liegt, in einer
 * Zeichnung und fünf Zuständen: leer und alt (A2), das ganze Haus (A3), mit
 * Raster (A4), mit Wärme (A6), fertig (A7).
 *
 * Die `viewBox` ist in allen fünf dieselbe; was sich ändert, ist der
 * Kamerarahmen auf der Gruppe darin (`RAHMEN`, `kamera`). Das ist der Grund,
 * warum A2 und A4 sichtbar **derselbe Keller** sind und nicht zwei Bilder, die
 * einander ähneln — „eine Welt, viele Zustände" (khpl-tage.md 1, Mechanismus
 * 2), nur gezeichnet statt gebaut.
 *
 * **Bewegungsgefühl: Fluss.** Alles, was sich hier bewegt, wandert an einer
 * Linie entlang: die Vliesbahn rollt aus, die Wärme läuft den Weg hinauf, den
 * der Besucher in A4 gezogen hat. Keine Sprünge, keine Takte — die bewusste
 * Gegenbewegung zu den Rastersprüngen der Zerspanung und zur Pendelmasse des
 * Zimmerers. Bei `prefers-reduced-motion` stehen die Endzustände sofort.
 */
export function Haus({
  zustand,
  onBauteil,
  onPfad,
  onAbgewiesen,
  onWaermeAngekommen,
}: {
  zustand: HausZustand
  onBauteil?: (id: BauteilId) => void
  onPfad?: (pfad: readonly KnotenId[]) => void
  onAbgewiesen?: (knoten: KnotenId) => void
  onWaermeAngekommen?: () => void
}) {
  const ruhig = useReducedMotion() ?? false
  const szene = zustand.szene

  /**
   * Der Weg der Wärme. In A6 und A7 ist das **der Weg aus A4** und kein
   * anderer — ohne das ist A6 eine Animation, mit ihm ist es sein Haus.
   * Kommt nichts an, weil der Besucher A4 übersprungen hat, läuft sie den
   * richtigen Weg; ein Signaturmoment ohne Leitung wäre keiner.
   */
  const pfad =
    szene === 'raster'
      ? zustand.pfad
      : szene === 'inbetriebnahme' || szene === 'uebergabe'
        ? zustand.pfad.length > 1
          ? zustand.pfad
          : RICHTIGER_WEG
        : []

  const waermeZiel =
    szene === 'uebergabe'
      ? 1
      : szene === 'inbetriebnahme'
        ? zustand.waerme
        : szene === 'haus' && zustand.aufgeloest
          ? 1
          : 0

  /**
   * **Der Preis eines verlustreichen Weges, in der Währung dieses Screens.**
   * „Wer einen zu verlustreichen Weg fertigbaut, darf ihn behalten: in A6
   * läuft die Wärme dann sichtbar langsamer los" (Spec 6, A4) — eine Folge,
   * keine Note. Gerechnet aus dem, was der Step schickt, damit sein
   * Ersatzwecker und diese Wanderung dieselbe Dauer meinen.
   */
  const dauer =
    WAERMELAUF_DAUER * (1 + (szene === 'inbetriebnahme' ? druckverlust(zustand.pfad) : 0))

  const waerme = useWaerme(waermeZiel, dauer, ruhig, onWaermeAngekommen)
  // Drei Etappen, die ineinander überlaufen: erst der Keller, dann die
  // Stränge, dann die Räume. Der Fluss soll nicht dreimal neu anfangen.
  const waermeLeitung = useTransform(waerme, [0, 0.45], [0, 1], { clamp: true })
  const waermeStrang = useTransform(waerme, [0.35, 0.8], [0, 1], { clamp: true })
  const waermeRaum = useTransform(waerme, [0.65, 1], [0, 1], { clamp: true })

  const feld = useRef<SVGGElement>(null)

  const leitungD = pfadDatenWeich(pfad)
  const zeigtBestand = szene === 'keller' || szene === 'haus'
  const zeigtLeitung = leitungD !== ''

  function weltPunkt(e: React.PointerEvent<SVGElement>): Punkt | null {
    const ctm = feld.current?.getScreenCTM()
    if (!ctm) return null
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse())
    return { x: p.x, y: p.y }
  }

  function beruehre(e: React.PointerEvent<SVGElement>) {
    if (szene !== 'raster' || zustand.fertig) return
    const p = weltPunkt(e)
    if (!p) return
    const id = knotenBei(p.x, p.y)
    if (!id) return
    const zug = zieheNach(zustand.pfad, id)
    if (zug.art === 'weiter' || zug.art === 'zurueck') onPfad?.(zug.pfad)
    else if (zug.art === 'wand') onAbgewiesen?.(zug.knoten)
  }

  return (
    <svg
      viewBox={`0 0 ${WELT.breite} ${WELT.hoehe}`}
      preserveAspectRatio="xMidYMid meet"
      className="size-full touch-none"
      role="img"
      aria-label="Gebäudeschnitt mit Heizungskeller"
    >
      <Defs />
      <rect width={WELT.breite} height={WELT.hoehe} fill="url(#am-grund-haus)" />

      <g ref={feld} transform={kamera(RAHMEN[szene])} clipPath="url(#am-sicht)">
        <Erdreich />
        <Huelle />
        <Raeume warm={waermeRaum} />

        {/* Der Keller — Treppe und tragende Wand stehen in jedem Zustand. */}
        <Kellertreppe />
        <TragendeWandZeichnung
          gezeigt={szene === 'raster'}
          abgewiesen={szene === 'raster' ? zustand.abgewiesen : null}
          ruhig={ruhig}
        />

        {zeigtBestand ? (
          <Bestand
            angetippt={szene === 'keller' ? zustand.angetippt : []}
            offen={szene === 'keller' ? zustand.offen : null}
            onBauteil={szene === 'keller' ? onBauteil : undefined}
          />
        ) : (
          <>
            <VerteilerKasten warm={waermeStrang} />
            <Waermepumpe warm={waermeStrang} />
          </>
        )}

        {szene === 'keller' && <Vliesbahn ausgerollt={zustand.vlies} ruhig={ruhig} />}

        {/* Stränge und Heizkörper: kalt gezeichnet, warm darübergelegt. */}
        <Straenge warm={waermeStrang} />
        {HEIZKOERPER.map((hk) => (
          <Heizkoerper key={hk.id} hk={hk} warm={waermeRaum} />
        ))}

        {szene === 'haus' && (
          <Waermebedarf
            gezeigt={zustand.schaetzungKw !== null && !zustand.aufgeloest}
            ruhig={ruhig}
          />
        )}

        {zeigtLeitung && <Leitung d={leitungD} warm={waermeLeitung} />}

        {szene === 'raster' && (
          <Rasterfeld
            pfad={zustand.pfad}
            fertig={zustand.fertig}
            ruhig={ruhig}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId)
              beruehre(e)
            }}
            onPointerMove={(e) => {
              if (e.buttons === 0 && e.pointerType === 'mouse') return
              if (!e.currentTarget.hasPointerCapture(e.pointerId)) return
              beruehre(e)
            }}
          />
        )}

        {szene === 'inbetriebnahme' && (
          <Manometer bar={zustand.druckBar} imFenster={zustand.imFenster} />
        )}
      </g>

      {szene === 'uebergabe' && <Feierabendlicht />}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Die Wärme
// ---------------------------------------------------------------------------

/**
 * Der eine bewegte Wert dieser Bühne. Er läuft dem Zielwert **weich**
 * hinterher, statt ihn zu übernehmen: der Step sagt „jetzt ganz", die
 * Zeichnung braucht dafür `dauer` Sekunden, und genau diese Sekunden sind der
 * Signaturmoment.
 *
 * `onWaermeAngekommen` feuert, wenn die Wärme oben **angekommen** ist — nicht,
 * wenn der Step sie losgeschickt hat.
 */
function useWaerme(
  ziel: number,
  dauer: number,
  ruhig: boolean,
  onAngekommen?: () => void,
): MotionValue<number> {
  const wert = useMotionValue(0)
  const melde = useRef(onAngekommen)
  melde.current = onAngekommen

  useEffect(() => {
    const fertig = () => {
      if (ziel >= 1) melde.current?.()
    }
    if (ruhig) {
      wert.set(ziel)
      fertig()
      return
    }
    const strecke = Math.abs(ziel - wert.get())
    if (strecke < 0.001) {
      fertig()
      return
    }
    const steuerung = animate(wert, ziel, {
      duration: dauer * strecke,
      ease: [0.32, 0, 0.2, 1],
      onComplete: fertig,
    })
    return () => steuerung.stop()
  }, [ziel, dauer, ruhig, wert])

  return wert
}

// ---------------------------------------------------------------------------
// Hülle
// ---------------------------------------------------------------------------

function Defs() {
  return (
    <defs>
      {/* Beschneidet die Kamerafahrt auf die `viewBox` — siehe `kamera`. */}
      <clipPath id="am-sicht" clipPathUnits="userSpaceOnUse">
        <rect x={0} y={0} width={WELT.breite} height={WELT.hoehe} />
      </clipPath>
      <radialGradient id="am-grund-haus" cx="50%" cy="44%" r="74%">
        <stop offset="0%" stopColor={KALT.flaeche} stopOpacity={0.9} />
        <stop offset="100%" stopColor={KALT.flaeche} stopOpacity={0} />
      </radialGradient>
      <pattern
        id="am-erdreich"
        width={9}
        height={9}
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(45)"
      >
        <line x1={0} y1={0} x2={0} y2={9} stroke={KALT.linieMatt} strokeWidth={1.1} />
      </pattern>
      <pattern
        id="am-tragend"
        width={7}
        height={7}
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(45)"
      >
        <line x1={0} y1={0} x2={0} y2={7} stroke={KALT.linie} strokeWidth={1.6} />
      </pattern>
      <radialGradient id="am-raum" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor={WARM.linie} stopOpacity={0.24} />
        <stop offset="100%" stopColor={WARM.linie} stopOpacity={0} />
      </radialGradient>
      <radialGradient id="am-feierabend" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stopColor={WARM.linie} stopOpacity={0.13} />
        <stop offset="100%" stopColor={WARM.linie} stopOpacity={0} />
      </radialGradient>
    </defs>
  )
}

function Erdreich() {
  const { aussenLinks, aussenRechts, gelaende, kellerBoden } = HAUS
  const unten = kellerBoden + 16
  return (
    <g>
      <rect
        x={-40}
        y={gelaende}
        width={aussenLinks + 40}
        height={unten - gelaende}
        fill="url(#am-erdreich)"
        opacity={0.5}
      />
      <rect
        x={aussenRechts}
        y={gelaende}
        width={WELT.breite - aussenRechts + 40}
        height={unten - gelaende}
        fill="url(#am-erdreich)"
        opacity={0.5}
      />
      {/* Unter der Sohle. Ohne das steht der Keller im Nichts, sobald der
          Rahmen hoch genug ist, um darunter zu blicken. */}
      <rect
        x={-40}
        y={unten}
        width={WELT.breite + 80}
        height={90}
        fill="url(#am-erdreich)"
        opacity={0.5}
      />
      <line
        x1={-40}
        y1={gelaende}
        x2={WELT.breite + 40}
        y2={gelaende}
        stroke={KALT.linie}
        strokeWidth={2}
      />
    </g>
  )
}

/** Wände, Dach, Decken, Kellersohle — die Linien, an denen alles hängt. */
function Huelle() {
  const h = HAUS
  return (
    <g fill="none" stroke={KALT.linie} strokeWidth={2.6} strokeLinejoin="round">
      {/* Keller */}
      <path
        d={`M${h.aussenLinks} ${h.gelaende} V${h.kellerBoden + 8} H${h.aussenRechts} V${h.gelaende}`}
        fill={KALT.flaeche}
        fillOpacity={0.55}
      />
      <path
        d={`M${h.innenLinks} ${h.kellerDecke} V${h.kellerBoden} H${h.innenRechts} V${h.kellerDecke} Z`}
      />
      {/* Kellerdecke */}
      <path
        d={`M${h.aussenLinks} ${h.gelaende} H${h.aussenRechts} V${h.kellerDecke} H${h.aussenLinks} Z`}
        fill={KALT.flaeche}
        fillOpacity={0.9}
      />
      {/* Außenwände über Grund */}
      <path
        d={`M${h.aussenLinks} ${h.gelaende} V${h.traufe} M${h.aussenRechts} ${h.gelaende} V${h.traufe}`}
      />
      <path
        d={`M${h.innenLinks} ${h.gelaende} V${h.traufe} M${h.innenRechts} ${h.gelaende} V${h.traufe}`}
        strokeWidth={1.6}
        opacity={0.7}
      />
      {/* Geschossdecke */}
      <path
        d={`M${h.aussenLinks} ${h.deckeOg} H${h.aussenRechts} M${h.aussenLinks} ${h.deckeOg + 6} H${h.aussenRechts}`}
        strokeWidth={1.8}
      />
      {/* Dach */}
      <path
        d={`M${h.dachLinks} ${h.traufe} L160 ${h.first} L${h.dachRechts} ${h.traufe}`}
      />
      <path
        d={`M${h.aussenLinks} ${h.traufe} L160 ${h.first + 9} L${h.aussenRechts} ${h.traufe} Z`}
        strokeWidth={1.6}
        opacity={0.55}
      />
      <path
        d={`M${h.dachLinks} ${h.traufe} H${h.dachRechts}`}
        strokeWidth={1.6}
        opacity={0.6}
      />
    </g>
  )
}

/** Der Schein in den Räumen, sobald es warm ist. Ungefüllt, nur ein Verlauf. */
function Raeume({ warm }: { warm: MotionValue<number> }) {
  const h = HAUS
  const raeume = [
    {
      x: h.innenLinks,
      y: h.traufe + 6,
      b: h.innenRechts - h.innenLinks,
      h: h.deckeOg - h.traufe - 6,
    },
    {
      x: h.innenLinks,
      y: h.deckeOg + 6,
      b: h.innenRechts - h.innenLinks,
      h: h.gelaende - h.deckeOg - 6,
    },
  ]
  return (
    <motion.g style={{ opacity: warm }}>
      {raeume.map((r) => (
        <rect key={r.y} x={r.x} y={r.y} width={r.b} height={r.h} fill="url(#am-raum)" />
      ))}
    </motion.g>
  )
}

// ---------------------------------------------------------------------------
// Keller — was in jedem Zustand steht
// ---------------------------------------------------------------------------

/**
 * Die Kellertreppe. Sie ist der Grund, warum der kurze Weg in A4 überhaupt
 * Bögen hat — ohne etwas im Raum wäre die kürzeste Leitung auch die geradeste.
 */
function Kellertreppe() {
  const t = TREPPE_ORT
  const stufen = 7
  const dx = (t.untenX - t.obenX) / stufen
  const dy = (t.untenY - t.obenY) / stufen
  let d = `M${t.obenX} ${t.obenY}`
  for (let i = 0; i < stufen; i++) {
    d += ` l${dx} 0 l0 ${dy}`
  }
  return (
    <g fill="none" stroke={KALT.linieMatt} strokeWidth={2} strokeLinejoin="round">
      <path
        d={`M${t.obenX} ${t.obenY} L${t.untenX} ${t.untenY} L${t.untenX} ${t.untenY + 10} L${t.obenX} ${t.obenY + 10} Z`}
        fill={KALT.flaeche}
        fillOpacity={0.7}
      />
      <path d={d} stroke={KALT.linie} />
    </g>
  )
}

/**
 * Die tragende Wand. In A4 tritt sie hervor — dort ist sie die Regel, die man
 * nicht sieht, wenn man nur auf die Länge schaut. Wer durch sie hindurch will,
 * bekommt einen kurzen Ruck und **einen Satz vom Step**; die Zeichnung sagt
 * nichts.
 */
function TragendeWandZeichnung({
  gezeigt,
  abgewiesen,
  ruhig,
}: {
  gezeigt: boolean
  abgewiesen: KnotenId | null
  ruhig: boolean
}) {
  const w = TRAGENDE_WAND
  return (
    <g>
      <rect
        x={w.x}
        y={w.oben}
        width={w.breite}
        height={w.unten - w.oben}
        fill="url(#am-tragend)"
        stroke={KALT.linie}
        strokeWidth={gezeigt ? 2.2 : 1.6}
        opacity={gezeigt ? 1 : 0.6}
      />
      {abgewiesen !== null && !ruhig && (
        <motion.rect
          key={`${abgewiesen}-${w.x}`}
          x={w.x - 2}
          y={w.oben - 2}
          width={w.breite + 4}
          height={w.unten - w.oben + 4}
          fill="none"
          stroke={KALT.linie}
          strokeWidth={2.6}
          initial={{ opacity: 0.95 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        />
      )}
    </g>
  )
}

// ---------------------------------------------------------------------------
// A2 — der Bestand
// ---------------------------------------------------------------------------

/**
 * Die sechs Bauteile aus `BAUTEILE`, jedes antippbar. **Kein Falsch, kein
 * Richtig** — was jedes tut und ob es bleibt, ist Text des Steps.
 *
 * Alles, was zur alten Anlage gehört, steht links der tragenden Wand. Die
 * rechte Kammer ist leer: dort kommt in A4 die Wärmepumpe hin, und das ist der
 * Grund, warum die Leitung durch die Wand muss.
 */
function Bestand({
  angetippt,
  offen,
  onBauteil,
}: {
  angetippt: readonly BauteilId[]
  offen: BauteilId | null
  onBauteil?: (id: BauteilId) => void
}) {
  return (
    <g>
      {/* Die alten Leitungen: Kessel → Pumpe → Verteiler, alles auf einer Seite. */}
      <path
        d="M169 188 V160 H80 V164"
        fill="none"
        stroke={KALT.linieMatt}
        strokeWidth={2.4}
        strokeLinejoin="round"
      />
      <path d="M120 165 V160" fill="none" stroke={KALT.linieMatt} strokeWidth={2.4} />
      {BAUTEILE.map((bauteil) => (
        <BauteilFigur
          key={bauteil.id}
          id={bauteil.id}
          label={bauteil.label}
          angetippt={angetippt.includes(bauteil.id)}
          offen={offen === bauteil.id}
          onBauteil={onBauteil}
        />
      ))}
    </g>
  )
}

function BauteilFigur({
  id,
  label,
  angetippt,
  offen,
  onBauteil,
}: {
  id: BauteilId
  label: string
  angetippt: boolean
  offen: boolean
  onBauteil?: (id: BauteilId) => void
}) {
  const o = BAUTEIL_ORTE[id]
  if (!o) return null
  const stroke = offen ? WARM.linie : angetippt ? KALT.linie : KALT.linieMatt

  return (
    <g
      className={onBauteil ? 'cursor-pointer' : undefined}
      onPointerDown={onBauteil ? () => onBauteil(id) : undefined}
    >
      <title>{label}</title>
      {id === 'pumpe' ? (
        <circle
          cx={o.x + o.b / 2}
          cy={o.y + o.h / 2}
          r={o.b / 2}
          fill={KALT.flaeche}
          stroke={stroke}
          strokeWidth={2.4}
        />
      ) : id === 'thermostatventile' ? null : (
        <rect
          x={o.x}
          y={o.y}
          width={o.b}
          height={o.h}
          rx={id === 'ausdehnungsgefaess' || id === 'tank' ? 7 : 3}
          fill={KALT.flaeche}
          stroke={stroke}
          strokeWidth={2.4}
        />
      )}
      {id === 'kessel' && (
        <path
          d={`M${o.x + 9} ${o.y + o.h - 10} q5 -7 0 -13 q8 5 5 13 M${o.x + 20} ${o.y + o.h - 10} q5 -7 0 -13 q8 5 5 13`}
          fill="none"
          stroke={stroke}
          strokeWidth={1.8}
          strokeLinecap="round"
          opacity={0.8}
        />
      )}
      {id === 'verteiler' && (
        <path
          d={`M${o.x + 4} ${o.y + 8} H${o.x + o.b - 4} M${o.x + 4} ${o.y + 16} H${o.x + o.b - 4}`}
          stroke={stroke}
          strokeWidth={1.8}
        />
      )}
      {/*
        Die Thermostatventile sitzen nicht im Keller, sondern am Heizkörper
        darüber — deshalb zeichnen sie keinen eigenen Körper, sondern nur den
        Kopf am Anschluss des Erdgeschoss-Heizkörpers.
      */}
      {id === 'thermostatventile' && (
        <g stroke={stroke} strokeWidth={2.2} fill="none">
          <circle cx={o.x + 4} cy={o.y + o.h / 2} r={5} fill={KALT.flaeche} />
          <path d={`M${o.x + 1} ${o.y + o.h / 2 - 3.5} V${o.y + o.h / 2 + 3.5}`} />
        </g>
      )}
      {angetippt && !offen && (
        <circle cx={o.x + o.b - 2} cy={o.y + 2} r={3.4} fill={KALT.linie} opacity={0.9} />
      )}
      {/* Trefferfläche: großzügig, unabhängig davon, wie klein das Symbol ist —
          und um das Symbol zentriert, auch wenn es größer als das Minimum ist. */}
      <rect
        x={o.x + o.b / 2 - Math.max(32, o.b) / 2}
        y={o.y + o.h / 2 - Math.max(32, o.h) / 2}
        width={Math.max(32, o.b)}
        height={Math.max(32, o.h)}
        fill="transparent"
      />
    </g>
  )
}

/**
 * **Die Vliesbahn.** Bevor irgendetwas ausgebaut wird, wird die fremde Wohnung
 * geschützt (`INTERVIEW`, Spec 6 A2) — die eine Sache, die diesen Beruf von
 * allen anderen im Angebot trennt: du arbeitest in der Wohnung von jemandem.
 *
 * Sie rollt aus, sie springt nicht auf: der Handgriff ist der Inhalt.
 */
function Vliesbahn({ ausgerollt, ruhig }: { ausgerollt: boolean; ruhig: boolean }) {
  const links = 96
  const breite = 108
  const y = HAUS.kellerBoden - 7
  return (
    <motion.g
      initial={false}
      animate={{ opacity: ausgerollt ? 1 : 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.rect
        x={links}
        y={y}
        height={7}
        rx={1.5}
        // Ein Vlies ist weder kalt noch warm — ein stumpfes Papiergrau, lokal
        // und ohne Token (Spec 7).
        fill="rgba(206,198,184,0.42)"
        stroke="rgba(206,198,184,0.7)"
        strokeWidth={1.2}
        initial={false}
        animate={{ width: ausgerollt ? breite : 0 }}
        transition={ruhig ? { duration: 0 } : { duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      />
    </motion.g>
  )
}

// ---------------------------------------------------------------------------
// A4 · A6 · A7 — die neue Anlage
// ---------------------------------------------------------------------------

function VerteilerKasten({ warm }: { warm: MotionValue<number> }) {
  const o = BAUTEIL_ORTE.verteiler
  return (
    <g>
      <rect
        x={o.x}
        y={o.y}
        width={o.b}
        height={o.h}
        rx={3}
        fill={KALT.flaeche}
        stroke={KALT.linie}
        strokeWidth={2.4}
      />
      <motion.g style={{ opacity: warm }}>
        <path
          d={`M${o.x + 4} ${o.y + 9} H${o.x + o.b - 4} M${o.x + 4} ${o.y + 17} H${o.x + o.b - 4}`}
          stroke={WARM.linie}
          strokeWidth={2}
          strokeLinecap="round"
        />
      </motion.g>
    </g>
  )
}

/** Die Wärmepumpe. Sie macht keine Wärme — sie holt sie. */
function Waermepumpe({ warm }: { warm: MotionValue<number> }) {
  const o = WAERMEPUMPE_ORT
  return (
    <g>
      <rect
        x={o.x}
        y={o.y}
        width={o.b}
        height={o.h}
        rx={4}
        fill={KALT.flaeche}
        stroke={KALT.linie}
        strokeWidth={2.4}
      />
      <path
        d={`M${o.x + 4} ${o.y + 12} H${o.x + o.b - 4} M${o.x + 4} ${o.y + 19} H${o.x + o.b - 4}`}
        stroke={KALT.linieMatt}
        strokeWidth={1.6}
      />
      {/* Die Leitung von draußen: sie kommt durch die Kellerwand herein. */}
      <path
        d={`M${o.x + o.b} ${o.y + 14} H${HAUS.innenRechts + 8}`}
        stroke={KALT.linie}
        strokeWidth={2.4}
        fill="none"
      />
      <motion.circle
        cx={o.x + o.b / 2}
        cy={o.y + o.h - 14}
        r={7}
        fill="none"
        stroke={WARM.linie}
        strokeWidth={2.2}
        style={{ opacity: warm }}
      />
    </g>
  )
}

/**
 * **Die Leitung des Besuchers.** Ab A4 gehört der Weg der Rohre ihm; in A6
 * läuft die Wärme genau diese Linie entlang und keine andere.
 *
 * Der warme Strich liegt als zweite Lage über dem kalten und wird über
 * `pathLength` aufgedeckt — ein Verlauf, der an der Linie entlangwandert, und
 * keine Fläche, die aufblendet.
 */
function Leitung({ d, warm }: { d: string; warm: MotionValue<number> }) {
  const da = useAngefangen(warm)
  const schimmer = useTransform(da, (v) => v * 0.5)
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} stroke={KALT.linie} strokeWidth={4.5} />
      <motion.path
        d={d}
        stroke={WARM.schimmer}
        strokeWidth={12}
        style={{ pathLength: warm, opacity: schimmer }}
      />
      <motion.path
        d={d}
        stroke={WARM.linie}
        strokeWidth={4.5}
        style={{ pathLength: warm, opacity: da }}
      />
    </g>
  )
}

/**
 * Ein Torwert: 0, solange die Wärme noch gar nicht losgelaufen ist.
 *
 * Ohne ihn zeichnet ein Pfad mit `pathLength: 0` und runder Kappe einen orangen
 * Punkt an seinen Anfang — auf jedem Screen, auf dem noch gar nichts warm ist.
 * Ein Fleck, den niemand erklären kann, ist schlimmer als eine fehlende
 * Animation.
 */
function useAngefangen(warm: MotionValue<number>): MotionValue<number> {
  return useTransform(warm, [0, 0.02], [0, 1], { clamp: true })
}

/** Die beiden Steigstränge vom Verteiler nach oben. */
function Straenge({ warm }: { warm: MotionValue<number> }) {
  const ende = knotenPunkt(ZIEL)
  const linksD = ende
    ? `M${ende.x} ${ende.y} H${STRANG.links} V${STRANG.oben}`
    : `M${STRANG.links} ${BAUTEIL_ORTE.verteiler.y} V${STRANG.oben}`
  const rechtsD = `M${STRANG.links} ${STRANGVERTEILUNG_Y} H${STRANG.rechts} V${STRANG.oben}`
  const da = useAngefangen(warm)
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={linksD} stroke={KALT.linie} strokeWidth={2.8} />
      <path d={rechtsD} stroke={KALT.linie} strokeWidth={2.8} />
      <motion.path
        d={linksD}
        stroke={WARM.linie}
        strokeWidth={2.8}
        style={{ pathLength: warm, opacity: da }}
      />
      <motion.path
        d={rechtsD}
        stroke={WARM.linie}
        strokeWidth={2.8}
        style={{ pathLength: warm, opacity: da }}
      />
    </g>
  )
}

function Heizkoerper({
  hk,
  warm,
}: {
  hk: (typeof HEIZKOERPER)[number]
  warm: MotionValue<number>
}) {
  const mitteY = hk.y + hk.hoehe / 2
  const strang = hk.kopf === 'links' ? STRANG.links : STRANG.rechts
  const anschluss = strang < hk.x ? hk.x : hk.x + hk.breite
  const rippen = [0.2, 0.4, 0.6, 0.8]
  return (
    <g>
      <path
        d={`M${strang} ${mitteY} H${anschluss}`}
        stroke={KALT.linie}
        strokeWidth={2}
        fill="none"
      />
      <rect
        x={hk.x}
        y={hk.y}
        width={hk.breite}
        height={hk.hoehe}
        rx={2.5}
        fill={KALT.flaeche}
        stroke={KALT.linie}
        strokeWidth={2}
      />
      {rippen.map((r) => (
        <line
          key={r}
          x1={hk.x + hk.breite * r}
          y1={hk.y + 3}
          x2={hk.x + hk.breite * r}
          y2={hk.y + hk.hoehe - 3}
          stroke={KALT.linieMatt}
          strokeWidth={1.4}
        />
      ))}
      <motion.g style={{ opacity: warm }}>
        <rect
          x={hk.x}
          y={hk.y}
          width={hk.breite}
          height={hk.hoehe}
          rx={2.5}
          fill={WARM.linie}
          fillOpacity={0.14}
          stroke={WARM.linie}
          strokeWidth={2}
        />
        <path
          d={`M${strang} ${mitteY} H${anschluss}`}
          stroke={WARM.linie}
          strokeWidth={2}
          fill="none"
        />
      </motion.g>
    </g>
  )
}

// ---------------------------------------------------------------------------
// A3 — der Wärmebedarf
// ---------------------------------------------------------------------------

/**
 * Solange geschätzt wird, verliert das Haus Wärme: durch Dach, Wände und
 * Fenster. **Ohne Zahl und ohne Skala** — der Reglerwert steht im Panel, und
 * eine Bühne, die ihn in eine Pfeillänge übersetzt, würde eine Genauigkeit
 * behaupten, die sie nicht hat.
 */
function Waermebedarf({ gezeigt, ruhig }: { gezeigt: boolean; ruhig: boolean }) {
  const pfeile = [
    { x: 104, y: 43, dx: -9, dy: -11 },
    { x: 216, y: 43, dx: 9, dy: -11 },
    { x: HAUS.aussenLinks, y: 88, dx: -14, dy: 0 },
    { x: HAUS.aussenLinks, y: 130, dx: -14, dy: 0 },
    { x: HAUS.aussenRechts, y: 88, dx: 14, dy: 0 },
    { x: HAUS.aussenRechts, y: 130, dx: 14, dy: 0 },
  ]
  return (
    <motion.g
      initial={false}
      animate={{ opacity: gezeigt ? 1 : 0 }}
      transition={{ duration: 0.5 }}
    >
      {pfeile.map((p, i) => (
        <motion.path
          key={`${p.x}-${p.y}`}
          d={`M${p.x} ${p.y} l${p.dx * 1.6} ${p.dy * 1.6}`}
          stroke={KALT.linie}
          strokeWidth={2.2}
          strokeLinecap="round"
          fill="none"
          animate={ruhig ? undefined : { opacity: [0, 0.9, 0], pathLength: [0.2, 1, 1] }}
          transition={
            ruhig
              ? undefined
              : { duration: 2.6, repeat: Infinity, delay: i * 0.28, ease: 'easeOut' }
          }
        />
      ))}
    </motion.g>
  )
}

// ---------------------------------------------------------------------------
// A4 — das Raster
// ---------------------------------------------------------------------------

function Rasterfeld({
  pfad,
  fertig,
  ruhig,
  onPointerDown,
  onPointerMove,
}: {
  pfad: readonly KnotenId[]
  fertig: boolean
  ruhig: boolean
  onPointerDown: (e: React.PointerEvent<SVGRectElement>) => void
  onPointerMove: (e: React.PointerEvent<SVGRectElement>) => void
}) {
  const weg = pfad.length > 0 ? pfad : [START]
  const kopf = knotenPunkt(weg[weg.length - 1])
  const start = knotenPunkt(START)
  const ziel = knotenPunkt(ZIEL)

  return (
    <g>
      {ALLE_KNOTEN.map((id) => {
        const p = knotenPunkt(id)
        if (!p) return null
        const verstellt = istVerstellt(id)
        const belegt = weg.includes(id)
        return (
          <circle
            key={id}
            cx={p.x}
            cy={p.y}
            r={belegt ? 2.6 : 2}
            fill={belegt ? KALT.linie : KALT.linieMatt}
            opacity={verstellt ? 0.18 : belegt ? 1 : 0.6}
          />
        )
      })}

      {start && (
        <circle
          cx={start.x}
          cy={start.y}
          r={6}
          fill="none"
          stroke={KALT.linie}
          strokeWidth={2}
        />
      )}
      {ziel && (
        <circle
          cx={ziel.x}
          cy={ziel.y}
          r={6}
          fill="none"
          stroke={KALT.linie}
          strokeWidth={2}
          strokeDasharray={fertig ? undefined : '3 3'}
        />
      )}

      {/* Wo es weitergeht. Ein ruhiger Puls, kein Blinken. */}
      {kopf && !fertig && !ruhig && (
        <motion.circle
          cx={kopf.x}
          cy={kopf.y}
          r={6}
          fill="none"
          stroke={KALT.linie}
          strokeWidth={2}
          initial={{ scale: 0.8, opacity: 0.85 }}
          animate={{ scale: 1.8, opacity: 0 }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
          style={{ transformOrigin: `${kopf.x}px ${kopf.y}px` }}
        />
      )}

      {/* Die Ziehfläche liegt über allem und deckt den ganzen Keller ab. */}
      <rect
        x={HAUS.innenLinks}
        y={HAUS.kellerDecke}
        width={HAUS.innenRechts - HAUS.innenLinks}
        height={HAUS.kellerBoden - HAUS.kellerDecke}
        fill="transparent"
        style={{ touchAction: 'none' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
      />
    </g>
  )
}

// ---------------------------------------------------------------------------
// A6 — das Manometer
// ---------------------------------------------------------------------------

const SKALA_MAX = 4

function winkel(bar: number): number {
  return 135 + (Math.min(Math.max(bar, 0), SKALA_MAX) / SKALA_MAX) * 270
}

function amKreis(cx: number, cy: number, r: number, grad: number): Punkt {
  const rad = (grad * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function bogen(cx: number, cy: number, r: number, von: number, bis: number): string {
  const a = amKreis(cx, cy, r, von)
  const b = amKreis(cx, cy, r, bis)
  const gross = bis - von > 180 ? 1 : 0
  return `M${a.x} ${a.y} A${r} ${r} 0 ${gross} 1 ${b.x} ${b.y}`
}

/**
 * Das Manometer. Zielfenster **1,2–1,8 bar** und Ansprechdruck des
 * Sicherheitsventils bei **2,5 bar** stehen als `FUELLDRUCK` und
 * `SICHERHEITSVENTIL_BAR` in `kanon.ts` und sind `BELEGT`, zeitstabil
 * (Spec 11). Die Skala bis 4 bar ist eine Zeichenentscheidung — so sieht ein
 * Heizungsmanometer aus.
 *
 * Kein Rot. Das Fenster ist warm markiert, alles andere kalt — die Anzeige
 * bewertet nicht, sie zeigt.
 */
function Manometer({ bar, imFenster }: { bar: number; imFenster: boolean }) {
  const cx = 208
  const cy = 196
  const r = 17
  const zeiger = amKreis(cx, cy, r - 4, winkel(bar))
  const sv = amKreis(cx, cy, r, winkel(SICHERHEITSVENTIL_BAR))
  const svAussen = amKreis(cx, cy, r + 4, winkel(SICHERHEITSVENTIL_BAR))

  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={r + 4}
        fill={KALT.flaeche}
        stroke={KALT.linie}
        strokeWidth={2}
      />
      <path
        d={bogen(cx, cy, r, winkel(0), winkel(SKALA_MAX))}
        fill="none"
        stroke={KALT.linieMatt}
        strokeWidth={2}
      />
      <path
        d={bogen(cx, cy, r, winkel(FUELLDRUCK.min), winkel(FUELLDRUCK.max))}
        fill="none"
        stroke={WARM.linie}
        strokeWidth={3.4}
        strokeLinecap="round"
        opacity={0.9}
      />
      <path
        d={`M${sv.x} ${sv.y} L${svAussen.x} ${svAussen.y}`}
        stroke={KALT.linie}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <motion.path
        d={`M${cx} ${cy} L${zeiger.x} ${zeiger.y}`}
        stroke={imFenster ? WARM.linie : KALT.linie}
        strokeWidth={2.4}
        strokeLinecap="round"
        initial={false}
        animate={{ d: `M${cx} ${cy} L${zeiger.x} ${zeiger.y}` }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      />
      <circle cx={cx} cy={cy} r={2.4} fill={imFenster ? WARM.linie : KALT.linie} />
    </g>
  )
}

/**
 * **Feierabend im Hellen.** Dieser Tag endet nachmittags im Wohnhaus einer
 * Familie, nicht auf einem Dach im Abendlicht — vier Feierabende, vier
 * Lichter (Spec 6, A7). Ein sehr flacher Schein, weit unter allem, was als
 * gefüllte Fläche durchginge.
 */
function Feierabendlicht() {
  return (
    <rect
      x={0}
      y={0}
      width={WELT.breite}
      height={WELT.hoehe}
      fill="url(#am-feierabend)"
      style={{ mixBlendMode: 'screen' }}
    />
  )
}
