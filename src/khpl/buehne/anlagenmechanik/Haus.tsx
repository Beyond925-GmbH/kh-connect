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
  SKALA_MAX,
  WAERMELAUF_DAUER,
  WARM,
  amKreis,
  bogen,
  druckverlust,
  winkel,
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
  VERLUSTFLAECHEN,
  START,
  STRANG,
  STRANGVERTEILUNG_Y,
  THERMOSTAT_ORTE,
  TRAGENDE_WAND,
  TREPPE_ORT,
  UMGEBUNG,
  WAERMEPUMPE_ORT,
  WELT,
  ZIEL,
  amZiel,
  istVerstellt,
  kamera,
  knotenBei,
  knotenPunkt,
  pfadDatenWeich,
  sichtfeld,
  viewBoxVon,
  zieheNach,
  type Punkt,
  type Rahmen,
} from './zeichnung'

/**
 * Alles, was im Haus spielt. Draußen bleiben nur die beiden eigenen
 * Zeichnungen: der Anlagenausschnitt aus A1 und der Transporter aus A5/A1.1.
 */
type HausZustand = Exclude<BuehnenZustand, { szene: 'anlage' } | { szene: 'transporter' }>

/**
 * **Das Haus im Schnitt** — der Keller und was darüber liegt, in einer
 * Zeichnung und fünf Zuständen: leer und alt (A2), das ganze Haus (A3), mit
 * Raster (A4), mit Wärme (A6), fertig (A7).
 *
 * Die `viewBox` ist in allen fünf dieselbe; was sich ändert, ist der
 * Kamerarahmen auf der Gruppe darin (`RAHMEN`, `kamera`). Das ist der Grund,
 * warum A2 und A4 sichtbar **derselbe Keller** sind und nicht zwei Bilder, die
 * einander ähneln — **eine Welt, viele Zustände**, nur gezeichnet statt
 * gebaut.
 *
 * **Bewegungsgefühl: Fluss.** Alles, was sich hier bewegt, wandert an einer
 * Linie entlang: die Vliesbahn rollt aus, die Wärme läuft den Weg hinauf, den
 * der Besucher in A4 gezogen hat. Keine Sprünge, keine Takte — die bewusste
 * Gegenbewegung zu den Rastersprüngen der Zerspanung und zur Pendelmasse des
 * Zimmerers. Bei `prefers-reduced-motion` stehen die Endzustände sofort.
 */
export function Haus({
  seiten,
  zustand,
  onBauteil,
  onVerlust,
  onPfad,
  onAbgewiesen,
  onWaermeAngekommen,
}: {
  /** Das Seitenverhältnis der Bühnenfläche — die `viewBox` richtet sich danach. */
  seiten: number
  zustand: HausZustand
  onBauteil?: (id: BauteilId) => void
  /** A3 — eine der vier Verlustflächen wurde angetippt. */
  onVerlust?: (id: string) => void
  onPfad?: (pfad: readonly KnotenId[]) => void
  onAbgewiesen?: (knoten: KnotenId) => void
  onWaermeAngekommen?: () => void
}) {
  const ruhig = useReducedMotion() ?? false
  const szene = zustand.szene
  const sicht = sichtfeld(seiten)

  /**
   * Der Kamerarahmen der Szene.
   *
   * Die frühere Ausnahme für A6 auf flachen Flächen — ab Seitenverhältnis
   * 1,8 der Keller mit dem Manometer statt des ganzen Hauses
   * (`RAHMEN_INBETRIEBNAHME_BAND`, die Konstante liegt weiter in
   * `zeichnung.ts`) — ist mit dem A6-Panelumbau **bewusst stillgelegt**: die
   * ablesbare Druckanzeige ist seitdem die große Uhr im Panel
   * (`steps/anlagenmechanik/A6.tsx`, `Manometer`), das kleine Manometer hier
   * ist Requisite, und das Band zeigte direkt über der großen Uhr eine
   * zweite, redundante. Dazu kommt: das hohe Füll-Panel schiebt hochkant
   * jedes Tablet über die alte Schwelle, und jede Rückmeldungszeile ändert
   * die Panelhöhe — eine Schwelle ohne Totband hieße eine Kamera, die mitten
   * in der Übung zwischen Band und Haus umspringt. Ein klein gedrücktes Haus
   * ist als Kulisse der ruhigere Handel; sobald die Anlage läuft, zieht sich
   * das Panel ohnehin zusammen, und die Wärme steigt im vollen Hausschnitt.
   */
  const blickfeld = RAHMEN[szene]

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
   * Wer einen zu verlustreichen Weg fertigbaut, darf ihn behalten: in A6
   * läuft die Wärme dann sichtbar langsamer los — eine Folge,
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
      viewBox={viewBoxVon(sicht)}
      preserveAspectRatio="xMidYMid meet"
      className="size-full touch-none"
      role="img"
      aria-label="Gebäudeschnitt mit Heizungskeller"
    >
      <Defs />
      {/* Der Grundton liegt auf der ganzen Fläche und läuft an allen vier
          Rändern auf null aus — er ist eine Vignette und keine Platte. */}
      <rect
        x={sicht.x}
        y={sicht.y}
        width={sicht.b}
        height={sicht.h}
        fill="url(#am-grund-haus)"
      />

      <g ref={feld} transform={kamera(blickfeld, sicht)}>
        <Himmel />
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
            {/* Im Raster sind die beiden Kästen Anfang und Ende der Aufgabe —
                dort tragen sie die Farbe der Leitung, sonst die des Bestands. */}
            <VerteilerKasten warm={waermeStrang} markiert={szene === 'raster'} />
            <Waermepumpe warm={waermeStrang} markiert={szene === 'raster'} />
          </>
        )}

        {szene === 'keller' && <Vliesbahn ausgerollt={zustand.vlies} ruhig={ruhig} />}

        {/* Stränge und Heizkörper: kalt gezeichnet, warm darübergelegt. */}
        <Straenge warm={waermeStrang} />
        {HEIZKOERPER.map((hk) => (
          <Heizkoerper key={hk.id} hk={hk} warm={waermeRaum} />
        ))}

        {/* Nach den Heizkörpern, damit die Ventile ihre Taps behalten. */}
        {zeigtBestand && (
          <Thermostatventile
            angetippt={
              szene === 'keller' && zustand.angetippt.includes('thermostatventile')
            }
            offen={szene === 'keller' && zustand.offen === 'thermostatventile'}
            onBauteil={szene === 'keller' ? onBauteil : undefined}
          />
        )}

        {szene === 'haus' && (
          <>
            <Waermebedarf gezeigt={!zustand.aufgeloest} ruhig={ruhig} />
            {VERLUSTFLAECHEN.map((f) => (
              <Verlustpfeil
                key={f.id}
                flaeche={f}
                gefunden={zustand.verluste.includes(f.id)}
                offen={zustand.offen === f.id}
                ruhig={ruhig}
                onTipp={zustand.aufgeloest ? undefined : onVerlust}
              />
            ))}
          </>
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
          <Manometer bar={zustand.druckBar} imFenster={zustand.imFenster} ruhig={ruhig} />
        )}
      </g>

      {szene === 'uebergabe' && <Feierabendlicht sicht={sicht} />}
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
      {/*
        **Kein `clipPath` mehr.** Er beschnitt die Kameragruppe auf die Welt und
        war die Reißleine gegen den Überschuss, den `meet` in einer zu hohen
        Fläche stehen ließ. Seit die `viewBox` das Verhältnis der Fläche hat
        (`sichtfeld`), ist der Rand des SVG-Elements der Rand der Bühne — und
        was hochkant zusätzlich sichtbar wird, soll sichtbar werden: Erdreich
        und Himmel sind großzügig über die Welt hinausgezeichnet. Ein Clip auf
        einen gemessenen Wert wäre außerdem genau das, was er verhindern soll:
        bei jeder Verzögerung eine harte Kante mitten im Bild.
      */}
      {/*
        Der Grundton. `r="50%"` um die Mitte heißt: die Ellipse berührt alle
        vier Kanten und ist dort auf null — deshalb gibt es keinen Rand, an dem
        Grau auf Schwarz stößt. Vorher lag der Rand mit rund 37 % Deckung mitten
        im Bild und las sich als „getönte Platte" (Abnahme, A1/A6/A8).
      */}
      <radialGradient id="am-grund-haus" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor={KALT.flaeche} stopOpacity={0.9} />
        <stop offset="70%" stopColor={KALT.flaeche} stopOpacity={0.34} />
        <stop offset="100%" stopColor={KALT.flaeche} stopOpacity={0} />
      </radialGradient>
      {/* Der Himmel über dem Haus: unten am Gelände am dichtesten, nach oben
          auf null. Er hat keine Oberkante, die man sehen könnte. */}
      <linearGradient
        id="am-himmel-haus"
        gradientUnits="userSpaceOnUse"
        x1={0}
        y1={-UMGEBUNG}
        x2={0}
        y2={HAUS.gelaende}
      >
        <stop offset="0%" stopColor={KALT.flaeche} stopOpacity={0} />
        <stop offset="55%" stopColor={KALT.flaeche} stopOpacity={0.18} />
        <stop offset="100%" stopColor={KALT.flaeche} stopOpacity={0.62} />
      </linearGradient>
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
      {/*
        **Feierabend im Hellen** — vier Feierabende, vier Lichter. Der erste
        Anlauf blieb mit 13 % unter der
        Wahrnehmungsschwelle — auf dem Screen war A7 genauso dunkel wie A2, und
        das Unterscheidungsmerkmal dieses Tages war einfach nicht da. Jetzt ein
        flächiger warmer Schein, der oben am hellsten ist und nach unten
        ausläuft: das Haus liegt im Nachmittagslicht, der Keller bekommt den
        Rest davon ab.
      */}
      <radialGradient id="am-feierabend" cx="50%" cy="30%" r="78%">
        <stop offset="0%" stopColor={WARM.linie} stopOpacity={0.32} />
        <stop offset="45%" stopColor={WARM.linie} stopOpacity={0.15} />
        <stop offset="100%" stopColor={WARM.schimmer} stopOpacity={0.04} />
      </radialGradient>
      <linearGradient id="am-feierabend-band" x1="0" y1="0" x2="0.25" y2="1">
        <stop offset="0%" stopColor={WARM.linie} stopOpacity={0.17} />
        <stop offset="60%" stopColor={WARM.linie} stopOpacity={0.05} />
        <stop offset="100%" stopColor={WARM.linie} stopOpacity={0} />
      </linearGradient>
    </defs>
  )
}

/**
 * **Der Himmel — die Umgebung über dem Gelände.**
 *
 * Er ist ausgespart, wo das Haus steht: sonst läge Himmel im Wohnzimmer. Die
 * Silhouette folgt Dach, Traufe und Außenwänden, der Rest ist ein Verlauf, der
 * zum Gelände hin dichter wird und nach oben auf null läuft.
 *
 * Es gibt ihn, seit die Bühne hochkant wirklich gefüllt wird: über dem First
 * stand vorher Schwarz mit der Kante der Zeichnung darin. Jetzt steht dort
 * Himmel, und das Haus steht in etwas statt in nichts.
 */
function Himmel() {
  const h = HAUS
  const links = -UMGEBUNG
  const rechts = WELT.breite + UMGEBUNG
  const oben = -UMGEBUNG
  const flaeche = `M${links} ${oben} H${rechts} V${h.gelaende} H${links} Z`
  const haus =
    `M${h.aussenLinks} ${h.gelaende} V${h.traufe} L${h.dachLinks} ${h.traufe} ` +
    `L160 ${h.first} L${h.dachRechts} ${h.traufe} L${h.aussenRechts} ${h.traufe} ` +
    `V${h.gelaende} Z`
  return <path d={`${flaeche} ${haus}`} fillRule="evenodd" fill="url(#am-himmel-haus)" />
}

function Erdreich() {
  const { aussenLinks, aussenRechts, gelaende, kellerBoden } = HAUS
  const unten = kellerBoden + 16
  const links = -UMGEBUNG
  const rechts = WELT.breite + UMGEBUNG
  return (
    <g>
      <rect
        x={links}
        y={gelaende}
        width={aussenLinks - links}
        height={unten - gelaende}
        fill="url(#am-erdreich)"
        opacity={0.5}
      />
      <rect
        x={aussenRechts}
        y={gelaende}
        width={rechts - aussenRechts}
        height={unten - gelaende}
        fill="url(#am-erdreich)"
        opacity={0.5}
      />
      {/* Unter der Sohle. Ohne das steht der Keller im Nichts, sobald der
          Rahmen hoch genug ist, um darunter zu blicken — und hochkant ist er
          das inzwischen immer. */}
      <rect
        x={links}
        y={unten}
        width={rechts - links}
        height={UMGEBUNG}
        fill="url(#am-erdreich)"
        opacity={0.5}
      />
      <line
        x1={links}
        y1={gelaende}
        x2={rechts}
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
      {/*
        Die Thermostatventile fehlen hier bewusst: sie sitzen nicht im Keller,
        sondern oben am Heizkörper, und sie müssen **über** den Heizkörpern
        liegen — sonst schluckt der Heizkörper, der später im DOM steht, den
        Tap. Sie kommen als eigene Gruppe nach ihnen (`Thermostatventile`).
      */}
      {BAUTEILE.filter((b) => b.id !== 'thermostatventile').map((bauteil) => (
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
  /*
    Das offene Bauteil hebt sich **kalt** heraus, nicht orange.

    Die Vorfassung nahm dafür `WARM.linie`. Damit stand Orange schon in A2 im
    Keller — vier Screens, bevor die Anlage läuft — und nahm dem Farbumschlag
    in A6 einen Teil seiner Wirkung. Die Farbregel dieses Tages sagt für A2
    ausdrücklich: Kalte Palette — der Keller ist grau und blau, und er bleibt
    es bis A6. Ein hellerer Strich und ein Ring machen dieselbe
    Auswahl sichtbar, ohne die Temperatur vorwegzunehmen.
  */
  const stroke = offen ? KALT.wahl : angetippt ? KALT.linie : KALT.linieMatt

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
      ) : (
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
      {angetippt && !offen && (
        <circle cx={o.x + o.b - 2} cy={o.y + 2} r={3.4} fill={KALT.linie} opacity={0.9} />
      )}
      {/* Der Ring um das offene Bauteil — die Auswahl, kalt. */}
      {offen && (
        <rect
          x={o.x - 5}
          y={o.y - 5}
          width={o.b + 10}
          height={o.h + 10}
          rx={6}
          fill="none"
          stroke={KALT.wahl}
          strokeWidth={1.8}
          opacity={0.55}
        />
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
 * **Die Thermostatventile — an jedem Heizkörper eins**, und deshalb vier
 * Marken statt einer.
 *
 * Zwei Gründe, warum sie eine eigene Gruppe sind und nicht eine `BauteilFigur`
 * wie die anderen fünf:
 *
 *  1. **Der Text und das Bild sollen dasselbe sagen.** A2 sagt „an jedem
 *     Heizkörper eins"; markiert wurde bisher genau eines. Jetzt leuchtet die
 *     ganze Gruppe auf, und der Satz stimmt auch auf der Zeichnung.
 *  2. **Jede Marke bekommt ihre eigene Trefferfläche.** Die Vorfassung legte
 *     eine einzige Fläche über die Gruppe, und deren Mitte lag mitten auf dem
 *     Erdgeschoss-Heizkörper — der steht im DOM später und schluckte den Tap.
 *     Deshalb steht diese Gruppe **nach** den Heizkörpern.
 *
 * Zwei der vier Ventile liegen im Kellerrahmen von A2 über der Bildkante: sie
 * sitzen im Obergeschoss. Der Tap auf die beiden sichtbaren öffnet dieselbe
 * Karte im Panel, und die redet ohnehin über alle vier.
 */
function Thermostatventile({
  angetippt,
  offen,
  onBauteil,
}: {
  angetippt: boolean
  offen: boolean
  onBauteil?: (id: BauteilId) => void
}) {
  const stroke = offen ? KALT.wahl : angetippt ? KALT.linie : KALT.linieMatt
  return (
    <g
      className={onBauteil ? 'cursor-pointer' : undefined}
      onPointerDown={onBauteil ? () => onBauteil('thermostatventile') : undefined}
    >
      <title>Thermostatventile</title>
      {THERMOSTAT_ORTE.map((v) => (
        <g key={v.id}>
          <g stroke={stroke} strokeWidth={2.2} fill="none">
            <circle cx={v.x} cy={v.y} r={5} fill={KALT.flaeche} />
            <path d={`M${v.x - 3.5} ${v.y - 3.5} V${v.y + 3.5}`} />
          </g>
          {offen && (
            <circle
              cx={v.x}
              cy={v.y}
              r={10}
              fill="none"
              stroke={KALT.wahl}
              strokeWidth={1.8}
              opacity={0.55}
            />
          )}
          {/* Eigene Trefferfläche je Ventil — 32 Einheiten, wie bei den
              anderen Bauteilen. */}
          <rect x={v.x - 16} y={v.y - 16} width={32} height={32} fill="transparent" />
        </g>
      ))}
    </g>
  )
}

/**
 * **Die Vliesbahn.** Bevor irgendetwas ausgebaut wird, wird die fremde Wohnung
 * geschützt — die eine Sache, die diesen Beruf von
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
        // und ohne Token.
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

function VerteilerKasten({
  warm,
  markiert = false,
}: {
  warm: MotionValue<number>
  markiert?: boolean
}) {
  const o = BAUTEIL_ORTE.verteiler
  return (
    <g>
      <title>Verteiler</title>
      <rect
        x={o.x}
        y={o.y}
        width={o.b}
        height={o.h}
        rx={3}
        fill={KALT.flaeche}
        stroke={markiert ? KALT.rohr : KALT.linie}
        strokeWidth={markiert ? 2.8 : 2.4}
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
function Waermepumpe({
  warm,
  markiert = false,
}: {
  warm: MotionValue<number>
  markiert?: boolean
}) {
  const o = WAERMEPUMPE_ORT
  return (
    <g>
      <title>Wärmepumpe</title>
      <rect
        x={o.x}
        y={o.y}
        width={o.b}
        height={o.h}
        rx={4}
        fill={KALT.flaeche}
        stroke={markiert ? KALT.rohr : KALT.linie}
        strokeWidth={markiert ? 2.8 : 2.4}
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
 *
 * **Sie ist kein Strich, sondern ein Rohr** — und das ist der dritte Anlauf.
 * Zuerst lag sie in `KALT.linie`, also in der Farbe von Kellerwänden, Hülle
 * und Bestand, nur breiter. Dann in einem helleren Blaugrau, und die Abnahme
 * hielt fest: „nur eine Helligkeitsstufe in derselben Graufamilie, streckenweise
 * deckungsgleich mit der Kellerwand" — das Fadenobjekt des Tages blieb auf der
 * Stele schwach.
 *
 * Jetzt hat sie einen eigenen **Charakter statt einer eigenen Helligkeit**,
 * aus vier Lagen:
 *
 *  1. **Der Dämmschlauch** — breit, weich, halbdurchsichtig. Er ist der Grund,
 *     warum ein Rohr im Keller doppelt so dick aussieht wie es ist, und er
 *     steht als Aha-Karte ohnehin auf diesem Screen (GEG § 69, Anlage 8).
 *  2. **Der Mantel**, fast schwarz: er trennt die Leitung von allem, worüber
 *     sie läuft, auch wenn sie auf einer Wandlinie liegt.
 *  3. **Das Rohr** in `KALT.rohr` — die Materialfarbe eines blanken Rohrs,
 *     nicht die nächste Graustufe. Innerhalb der Bühne ist Material erlaubt;
 *     die Farbregel — Kalt und Warm nur auf der Bühne — bleibt unberührt,
 *     Orange bleibt A6 vorbehalten.
 *  4. **Das Glanzlicht** als schmaler heller Kern darin: dunkle Kanten, helle
 *     Mitte — das ist der Unterschied zwischen einer Linie und einem Zylinder.
 *
 * Darüber erst das Warm aus A6, über `pathLength` aufgedeckt — ein Verlauf,
 * der an der Linie entlangwandert, und keine Fläche, die aufblendet.
 */
function Leitung({ d, warm }: { d: string; warm: MotionValue<number> }) {
  const da = useAngefangen(warm)
  const schimmer = useTransform(da, (v) => v * 0.5)
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} stroke={KALT.rohr} strokeWidth={13} opacity={0.12} />
      <path d={d} stroke={KALT.rohrMantel} strokeWidth={9.5} opacity={0.92} />
      <path d={d} stroke={KALT.rohr} strokeWidth={5.4} />
      <path d={d} stroke={KALT.rohrGlanz} strokeWidth={2.2} />
      <motion.path
        d={d}
        stroke={WARM.schimmer}
        strokeWidth={13}
        style={{ pathLength: warm, opacity: schimmer }}
      />
      <motion.path
        d={d}
        stroke={WARM.linie}
        strokeWidth={5}
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
 * Fenster. **Ohne Zahl und ohne Skala** — geraten wird im Panel, und eine
 * Bühne, die die Zahl in eine Pfeillänge übersetzt, würde eine Genauigkeit
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
  /*
    „Da bist du" — und zwar nach derselben großzügigen Regel, nach der der
    Screen *Leitung liegt* freigibt (`amZiel`). Sobald sie greift, hört das
    Pulsen auf und der Zielring wird geschlossen: die Zeichnung sagt dasselbe
    wie der Knopf, sonst steht ein aktiver Knopf neben einem Ziel, das weiter
    nach Aufmerksamkeit ruft.
  */
  const erreicht = fertig || amZiel(pfad)

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

      {/*
        **Woher und wohin — sichtbar, bevor jemand zieht.**

        Vorher standen hier zwei dünne graue Ringe in derselben Farbe wie das
        halbe Bild; die Abnahme las Wärmepumpe und Verteiler als „dieselben
        grauen Kästen wie alles andere" und landete zweimal eine Rasterzeile
        neben dem Ziel. Jetzt tragen beide Enden die Farbe der Leitung, die
        gleich dazwischen liegt: der Start als gefüllter Punkt („hier hängt sie
        schon"), das Ziel als offener Ring mit Fadenkreuz, der pulst, bis der
        Weg angekommen ist. Die Anschlusskästen selbst hebt `Waermepumpe` und
        `VerteilerKasten` im Rasterzustand mit.
      */}
      {start && (
        <g>
          <circle
            cx={start.x}
            cy={start.y}
            r={8.5}
            fill={KALT.rohrMantel}
            opacity={0.8}
          />
          <circle
            cx={start.x}
            cy={start.y}
            r={8.5}
            fill="none"
            stroke={KALT.rohr}
            strokeWidth={2.4}
          />
          <circle cx={start.x} cy={start.y} r={3.6} fill={KALT.rohrGlanz} />
        </g>
      )}
      {ziel && (
        <g>
          <circle cx={ziel.x} cy={ziel.y} r={9} fill={KALT.rohrMantel} opacity={0.8} />
          {!erreicht && !ruhig && (
            <motion.circle
              cx={ziel.x}
              cy={ziel.y}
              r={9}
              fill="none"
              stroke={KALT.rohr}
              strokeWidth={2}
              initial={{ scale: 1, opacity: 0.7 }}
              animate={{ scale: 1.9, opacity: 0 }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
              style={{ transformOrigin: `${ziel.x}px ${ziel.y}px` }}
            />
          )}
          <circle
            cx={ziel.x}
            cy={ziel.y}
            r={9}
            fill="none"
            stroke={erreicht ? KALT.rohrGlanz : KALT.rohr}
            strokeWidth={2.4}
            strokeDasharray={erreicht ? undefined : '4 3.5'}
          />
          <path
            d={`M${ziel.x - 4.5} ${ziel.y} H${ziel.x + 4.5} M${ziel.x} ${ziel.y - 4.5} V${ziel.y + 4.5}`}
            stroke={KALT.rohrGlanz}
            strokeWidth={1.8}
            strokeLinecap="round"
            opacity={0.85}
          />
        </g>
      )}

      {/* Wo es weitergeht. Ein ruhiger Puls, kein Blinken. */}
      {kopf && !erreicht && !ruhig && (
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

/**
 * Das Manometer. Zielfenster **1,2–1,8 bar** und Ansprechdruck des
 * Sicherheitsventils bei **2,5 bar** stehen als `FUELLDRUCK` und
 * `SICHERHEITSVENTIL_BAR` in `kanon.ts` — zeitstabile Praxiswerte. Skala und
 * Zeigergeometrie (`SKALA_MAX`, `winkel`, `amKreis`,
 * `bogen`) kommen ebenfalls von dort: die große Uhr im Panel von A6 zeigt
 * dieselbe Skala, und zwei Kopien derselben Rechnung wären irgendwann zwei
 * Zeiger, die sich widersprechen.
 *
 * Kein Rot. Das Fenster ist warm markiert, alles andere kalt — die Anzeige
 * bewertet nicht, sie zeigt.
 */
function Manometer({
  bar,
  imFenster,
  ruhig,
}: {
  bar: number
  imFenster: boolean
  /** `prefers-reduced-motion`: der Zeiger springt, statt nachzuschwingen —
   *  im selben Takt wie die große Uhr im Panel von A6. */
  ruhig: boolean
}) {
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
        transition={
          ruhig ? { duration: 0 } : { duration: 0.35, ease: [0.22, 1, 0.36, 1] }
        }
      />
      <circle cx={cx} cy={cy} r={2.4} fill={imFenster ? WARM.linie : KALT.linie} />
    </g>
  )
}

/**
 * **Feierabend im Hellen.** Dieser Tag endet nachmittags im Wohnhaus einer
 * Familie, nicht auf einem Dach im Abendlicht: vier Feierabende, vier
 * Lichter. Das ist das Unterscheidungsmerkmal dieses Tages gegenüber den
 * anderen drei, und es muss **zu sehen** sein: zwei Lagen im Screen-Modus,
 * eine flächige und ein schräg einfallendes Band. Warm auf der Bühne ist
 * ausdrücklich erlaubt, gefüllt ist hier nichts — die eine gefüllte
 * orange Fläche des Screens bleibt *Weiter*.
 */
function Feierabendlicht({ sicht }: { sicht: Rahmen }) {
  const rechts = sicht.x + sicht.b
  const unten = sicht.y + sicht.h
  return (
    <g style={{ mixBlendMode: 'screen' }}>
      <rect
        x={sicht.x}
        y={sicht.y}
        width={sicht.b}
        height={sicht.h}
        fill="url(#am-feierabend)"
      />
      {/* Das Licht kommt von schräg oben links herein — wie durch ein Fenster. */}
      <path
        d={`M${sicht.x} ${sicht.y} H${sicht.x + sicht.b * 0.62} L${rechts - sicht.b * 0.76} ${unten} H${sicht.x} Z`}
        fill="url(#am-feierabend-band)"
      />
    </g>
  )
}

// ---------------------------------------------------------------------------
// A3 — wo die Wärme hinausgeht
// ---------------------------------------------------------------------------

/**
 * Ein Wärmeverlust als Pfeil nach außen.
 *
 * ---
 *
 * **Seit dem zweiten A3-Umbau reine Anzeige.** Zwischenzeitlich waren die
 * vier Flächen eine Suchaufgabe — antippbar, mit Ring als Affordanz und einem
 * Anteil je Fläche im Panel. A3 ist inzwischen wieder der eine Schätzmoment
 * des Tages und auf einen Bogen gekürzt (siehe `steps/anlagenmechanik/A3.tsx`):
 * der Step reicht kein `onVerlust` mehr herein, und die Pfeile erscheinen
 * erst mit der Auflösung — als Bild dafür, wo die Wärme rausgeht, nicht als
 * Aufgabe. Ring und Tipp-Fläche bleiben gebaut; sie kosten nichts, solange
 * `onTipp` fehlt, und die Bühne schreibt den Steps nicht vor, wie sie ihre
 * Zustände fahren.
 *
 * **Die Dicke, keine Zahl je Fläche** (`VERLUSTFLAECHEN`): Der Anteil ist
 * relativ, wie der Druckverlust in A4 — eine Zahl je Fläche wäre erfunden.
 */
function Verlustpfeil({
  flaeche,
  gefunden,
  offen,
  ruhig,
  onTipp,
}: {
  flaeche: (typeof VERLUSTFLAECHEN)[number]
  gefunden: boolean
  offen: boolean
  ruhig: boolean
  onTipp?: (id: string) => void
}) {
  const { x, y, dx, dy, staerke } = flaeche
  // Die Dicke trägt den Anteil. Zwei bis sechs Einheiten: dünner verschwindet
  // auf der Stele, dicker sieht nach Rohr aus statt nach Verlust.
  const dicke = 2 + staerke * 4
  const spitze = 3 + staerke * 3
  const laenge = Math.hypot(dx, dy)
  const ex = x + dx
  const ey = y + dy
  // Einheitsvektor quer zur Richtung — für die Pfeilspitze.
  const qx = -dy / laenge
  const qy = dx / laenge

  return (
    <g>
      {gefunden && (
        <g pointerEvents="none">
          <line
            x1={x}
            y1={y}
            x2={ex}
            y2={ey}
            stroke={WARM.linie}
            strokeWidth={dicke}
            strokeLinecap="round"
            opacity={offen ? 1 : 0.7}
          />
          <path
            d={`M ${ex + (dx / laenge) * 5} ${ey + (dy / laenge) * 5} L ${
              ex + qx * spitze
            } ${ey + qy * spitze} L ${ex - qx * spitze} ${ey - qy * spitze} Z`}
            fill={WARM.linie}
            opacity={offen ? 1 : 0.7}
          />
        </g>
      )}

      {/* Solange nicht gefunden: ein limetter Ring auf der Fläche. Ist
          die Bühne die Interaktion, trägt das antippbare Objekt die
          Affordanz. */}
      {!gefunden && onTipp && (
        <motion.circle
          cx={x}
          cy={y}
          r={9}
          fill="none"
          className="stroke-kh-signal"
          strokeWidth={2.4}
          initial={{ opacity: 0.9 }}
          animate={ruhig ? { opacity: 0.9 } : { opacity: [0.9, 0.3, 0.9] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      <text
        x={x + dx * 0.55 + qx * 11}
        y={y + dy * 0.55 + qy * 11 + 3}
        textAnchor="middle"
        fontSize={7}
        fill={gefunden ? WARM.linie : KALT.linie}
        stroke="#0E0D0B"
        strokeWidth={2.4}
        paintOrder="stroke"
        strokeLinejoin="round"
        pointerEvents="none"
      >
        {flaeche.label}
      </text>

      <circle
        cx={x}
        cy={y}
        r={16}
        fill="transparent"
        className={onTipp ? 'cursor-pointer' : undefined}
        onPointerDown={onTipp ? () => onTipp(flaeche.id) : undefined}
      >
        <title>{flaeche.label}</title>
      </circle>
    </g>
  )
}
