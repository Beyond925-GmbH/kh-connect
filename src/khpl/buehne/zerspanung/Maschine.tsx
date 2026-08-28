import { motion } from 'motion/react'
import { Bild, Mass, Pfeilspitze } from './Bild'
import { BAUTEIL, STRICH } from './stil'
import { LAENGE, NENNMASS, ROHLING_DURCHMESSER, type NullWahl } from './kanon'
import { KONTUR } from './weg'

/**
 * Z2 — halbnah in die Maschine: Futter, Rohling, Revolver.
 *
 * **Schematisch und nicht fotorealistisch, und das ist eine Entscheidung.**
 * Der Tag baut keine 3D-Welt (khpl-tag-zerspanung.md §7); seine Werkzeuge sind
 * Zeichnung, Werkzeugweg und Zahl. Eine gerenderte Maschine wäre der einzige
 * Screen mit einer anderen Handschrift — und ausgerechnet der, auf dem man
 * *lesen* soll, was wo sitzt. Linien zeigen das besser als Chrom.
 *
 * **Die Maschine steht von Anfang an da, leer.** Drei Handgriffe füllen sie —
 * der Rohling wird gespannt, das Werkzeug kommt in den Revolver, seine Länge
 * wird vermessen — und jeder zeichnet sich sichtbar ein. Der erste Screen
 * zeigt deshalb nicht nichts, sondern **eine Maschine, in der noch nichts
 * ist** — genau das ist die Aussage: „wie viel passiert, bevor irgendetwas
 * passiert“ (§6 Z2). Der vierte Handgriff ist die Übung: der Nullpunkt, als
 * Wahl zwischen drei benannten Orten (`kanon.ts`, `NullWahl`) mit einer
 * gestrichelten Vorschau dessen, was das Programm ab dort täte.
 *
 * **Die Maße hier sind Bühnenmaße.** Futter, Backen und Revolver haben keine
 * Zahl, die irgendwo belegt wäre, und dürfen deshalb auf keinem Screen als
 * Maß erscheinen — sie sind der Maßstab, in dem das Teil steht, mehr nicht.
 * Nur `ROHLING_DURCHMESSER`, `NENNMASS` und `LAENGE` kommen aus `kanon.ts`,
 * und die Backen greifen genau am Rohlingdurchmesser: Der Rohling sitzt fest,
 * weil er anliegt, nicht weil er zufällig ungefähr passt.
 *
 * **Der Nullpunkt ist der Höhepunkt des Screens** (§6 Z2). Wo ist Null? Nicht
 * in der Maschine — am Werkstück, von dir festgelegt. Deshalb sitzt das
 * Zeichen an der Stirnfläche auf der Achse und leuchtet auf, wenn es steht:
 * gelbgrün, die Farbe, die im ganzen Produkt „das hast du geschafft“ heißt.
 * Z zeigt nach rechts aus dem Material heraus, X nach oben — dieselbe
 * Richtungsangabe, mit der das Programm in Z3 dann `Z-35.` schreibt.
 */

/**
 * Wie die Maschine im Feld steht — **je Lage einmal.**
 *
 * Eine Drehmaschine ist breit: Futter links, Werkstück in der Mitte, Revolver
 * rechts oben. Im stehenden Feld bleibt davon eine Zeichnung auf halber Höhe
 * und darüber wie darunter ein leeres Drittel. Was dagegen hilft, ist keine
 * andere Skalierung, sondern eine andere **Aufstellung**: hochkant schwenkt der
 * Revolver über die Schneide statt neben sie. Er sitzt damit fachlich richtiger
 * (er steht ohnehin über dem Werkzeug) und der Ausschnitt wird zwölf Millimeter
 * schmaler und zwölf höher — die Maschine wird größer, nicht kleiner.
 */
interface Aufstellung {
  /** `min-x min-y breite hoehe` in Millimetern. */
  sicht: string
  /** Mitte der Revolverscheibe. */
  revolver: readonly [number, number]
  /** Wo der Werkzeughalter aus der Scheibe tritt. */
  halter: readonly [number, number]
}

/**
 * x ∈ [-68, 40], y ∈ [-49, 29]. Dieselbe Millimeterwelt wie die Zeichnung.
 * Drei Millimeter mehr Luft rechts als in der ersten Fassung: die Scheibe endet
 * bei 34 und stand vorher auf der Kante, was sich wie ein Anschnitt las.
 */
const QUER: Aufstellung = {
  sicht: '-68 -49 108 78',
  revolver: [20, -30],
  halter: [12, -20],
}

/** x ∈ [-68, 28], y ∈ [-58, 32] — der Revolver steht über der Schneide. */
const HOCH: Aufstellung = {
  sicht: '-68 -58 96 90',
  revolver: [12, -40],
  halter: [8, -30],
}

/** Stirnfläche der Spannbacken. Ab hier nach links ist Futter, kein Werkstück. */
const BACKEN_STIRN = -37

const ROHLING_R = ROHLING_DURCHMESSER / 2

/** Die linke obere Ecke einer Ansicht — Bezug für `transform-origin`. */
function ursprung(sicht: string): readonly [number, number] {
  const [x, y] = sicht.split(/\s+/).map(Number)
  return [x, y]
}

/**
 * Wo die drei antippbaren Nullpunkt-Orte auf der Bühne liegen — Bühnenmaße,
 * keine Fachaussage (`kanon.ts`, `NullWahl`). Der Halter wandert mit der
 * Blattlage, deshalb ist `werkzeug` eine Funktion der Aufstellung.
 */
function nullOrte(lage: Aufstellung): Record<NullWahl, readonly [number, number]> {
  return {
    // Auf der Achse, mitten im Spindelkörper: „die Maschine weiß doch, wo ihr
    // Futter ist“ — der naheliegendste falsche Ort.
    futter: [-49, 0],
    werkzeug: lage.halter,
    stirn: [0, 0],
  }
}

/** Wie die drei Orte auf der Bühne heißen. Namen, keine Wertung. */
const ORT_NAME: Record<NullWahl, string> = {
  futter: 'Futter',
  werkzeug: 'Werkzeug',
  stirn: 'Werkstück',
}

export function Maschine({
  ruestschritte = 0,
  wahl = null,
  onWahl,
  gefertigt = false,
}: {
  /** Wie viele der drei Handgriffe erledigt sind — 0 bis 3. */
  ruestschritte?: number
  /** Der zuletzt angetippte Nullpunkt-Ort. `null` = noch keiner. */
  wahl?: NullWahl | null
  /** Solange gesetzt, sind die drei Orte antippbar. */
  onWahl?: (wahl: NullWahl) => void
  /** Der Nullpunkt sitzt, das erste Teil ist gedreht. */
  gefertigt?: boolean
}) {
  const gespannt = ruestschritte >= 1
  const bestueckt = ruestschritte >= 2
  const vermessen = ruestschritte >= 3

  return (
    <Bild viewBox={QUER.sicht} viewBoxHoch={HOCH.sicht}>
      {(hoch) => {
        const lage = hoch ? HOCH : QUER
        const orte = nullOrte(lage)

        return (
          <>
            <Futter offen={!gespannt} />

            <g
              style={{
                // Nach dem Drehen bleibt der Rohling als Schatten stehen —
                // dieselbe Deckkraft wie in Z3 (`Werkzeugweg`), denn es ist
                // derselbe Moment: man sieht, was abgetragen wurde.
                opacity: gespannt ? (gefertigt ? 0.34 : 1) : 0,
                transition: 'opacity 0.4s cubic-bezier(0.2, 0, 0, 1)',
              }}
            >
              <Rohteil von={-46} bis={2} />
            </g>

            <Revolver bestueckt={bestueckt} lage={lage} />
            <Werkzeuglaenge sichtbar={vermessen && !gefertigt} lage={lage} />

            {/* Das fertige Teil — dieselbe Kontur, die Z1 zeichnet und Z3
                fährt, und sie steht nur dann da, wenn ab der richtigen Stelle
                gezählt wurde. */}
            {gefertigt && (
              <motion.path
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, ease: [0.2, 0, 0, 1] }}
                d={KONTUR}
                className="fill-kh-paper/22 stroke-kh-paper"
                strokeWidth={STRICH.voll}
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            )}

            {/* Wohin das Programm ab dem gewählten Ort zählen würde: die
                Kontur aus der Zeichnung, gestrichelt an den Ort gelegt. Am
                Futter verschwindet sie in der Spannung, am Werkzeug hängt sie
                in der Luft — die Vorschau ist die halbe Lektion. */}
            {!gefertigt && wahl && (
              <motion.g
                key={wahl}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.35, ease: [0.2, 0, 0, 1] }}
                transform={`translate(${orte[wahl][0]} ${orte[wahl][1]})`}
                pointerEvents="none"
              >
                <path
                  d={KONTUR}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={STRICH.voll}
                  strokeDasharray="6 4"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                  className="text-kh-orange"
                />
              </motion.g>
            )}

            {/* Die drei Orte. Limette heißt „hier kannst du hin“ (R8) — der
                gewählte trägt das Fadenkreuz, die anderen pulsen leise. */}
            {vermessen &&
              !gefertigt &&
              onWahl &&
              (Object.keys(orte) as NullWahl[]).map((id) => (
                <Ort
                  key={id}
                  id={id}
                  punkt={orte[id]}
                  name={ORT_NAME[id]}
                  gewaehlt={wahl === id}
                  onTippen={() => onWahl(id)}
                />
              ))}

            <Nullpunkt sichtbar={gefertigt} leuchtet={gefertigt} />
          </>
        )
      }}
    </Bild>
  )
}

/**
 * Ein antippbarer Nullpunkt-Ort. Die Trefferfläche ist deutlich größer als
 * das Zeichen — am Kiosk wird mit ausgestrecktem Arm getippt, nicht mit der
 * Maus gezielt.
 */
function Ort({
  id,
  punkt,
  name,
  gewaehlt,
  onTippen,
}: {
  id: NullWahl
  punkt: readonly [number, number]
  name: string
  gewaehlt: boolean
  onTippen: () => void
}) {
  const [x, y] = punkt

  return (
    <g
      transform={`translate(${x} ${y})`}
      onClick={onTippen}
      role="button"
      aria-label={`Nullpunkt: ${name}`}
      aria-pressed={gewaehlt}
      className="cursor-pointer"
      data-testid={`z2-ort-${id}`}
    >
      <circle r={8} fill="transparent" />
      {gewaehlt ? (
        <g className="stroke-kh-signal" strokeWidth={STRICH.voll} pointerEvents="none">
          <line x1={-6} y1={0} x2={6} y2={0} vectorEffect="non-scaling-stroke" />
          <line x1={0} y1={-6} x2={0} y2={6} vectorEffect="non-scaling-stroke" />
          <circle r={3.2} fill="none" vectorEffect="non-scaling-stroke" />
        </g>
      ) : (
        <motion.circle
          r={3.2}
          fill="none"
          className="stroke-kh-signal"
          strokeWidth={STRICH.voll}
          vectorEffect="non-scaling-stroke"
          animate={{ opacity: [1, 0.35, 1] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          pointerEvents="none"
        />
      )}
      {/* Das Werkstück-Label steht **unter** seinem Punkt: darüber liegen
          Werkzeughalter und Längenbemaßung, und ein Label im Maßpfeil ist
          keins. Die anderen beiden haben nach oben Luft. */}
      <text
        y={id === 'stirn' ? 14 : gewaehlt ? -8.5 : -6.5}
        textAnchor="middle"
        fontSize={3.4}
        pointerEvents="none"
        className={`font-display ${gewaehlt ? 'fill-kh-signal' : 'fill-kh-mute'}`}
      >
        {name}
      </text>
    </g>
  )
}

/**
 * Futter und Backen im Längsschnitt. Die Backen fahren beim Spannen zu — fünf
 * Millimeter, die man sieht, und danach liegt der Rohling an.
 *
 * Exportiert, weil Z3 dieselbe Maschine zeigt: der Werkzeugweg entsteht in
 * genau dieser Spannung, und der Rohling, der beim Luftschnitt ungedreht
 * stehen bleibt, hängt nur dann glaubwürdig im Futter, wenn es dasselbe
 * Futter ist.
 */
export function Futter({ offen = false }: { offen?: boolean }) {
  const versatz = offen ? 5 : 0
  const backe = `M -47 -23 L ${BACKEN_STIRN} -23 L ${BACKEN_STIRN} ${-ROHLING_R} L -42 ${-ROHLING_R} L -42 -16.5 L -47 -16.5 Z`

  return (
    <g>
      <rect
        x={-64}
        y={-26}
        width={18}
        height={52}
        rx={2}
        className={BAUTEIL}
        strokeWidth={STRICH.voll}
        vectorEffect="non-scaling-stroke"
      />
      {/* Die Spindelnase — die Stufe, an der das Futter sitzt. */}
      <line
        x1={-52}
        y1={-26}
        x2={-52}
        y2={26}
        stroke="currentColor"
        strokeWidth={STRICH.fein}
        vectorEffect="non-scaling-stroke"
        className="text-kh-paper/55"
      />

      {[-1, 1].map((seite) => (
        <g
          key={seite}
          style={{
            transform: `translate(0, ${-seite * versatz}px)`,
            transformBox: 'view-box',
            transition: 'transform 0.5s cubic-bezier(0.2, 0, 0, 1)',
          }}
        >
          <path
            d={backe}
            transform={seite === 1 ? undefined : 'scale(1 -1)'}
            className={BAUTEIL}
            strokeWidth={STRICH.voll}
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </g>
      ))}
    </g>
  )
}

/** Das Rohteil: rund, ungedreht, `ROHLING_DURCHMESSER` dick. */
export function Rohteil({ von, bis }: { von: number; bis: number }) {
  return (
    <rect
      x={von}
      y={-ROHLING_R}
      width={bis - von}
      height={ROHLING_R * 2}
      className={BAUTEIL}
      strokeWidth={STRICH.voll}
      vectorEffect="non-scaling-stroke"
    />
  )
}

/** Wo die Schneide sitzt, wenn sie in Position steht. */
const SCHNEIDE = [1.5, -ROHLING_R - 0.6] as const
const REVOLVER_R = 14

/**
 * Der Werkzeugrevolver. Er steht von Anfang an da; **bestücken** heißt, dass
 * er auf die Station mit dem Schlichtdrehmeißel aus `T0101` schwenkt und das
 * Werkzeug in Position steht. Eine harte Rastung, keine Feder — der Revolver
 * einer Drehmaschine schwingt nicht aus.
 */
export function Revolver({ bestueckt, lage }: { bestueckt: boolean; lage: Aufstellung }) {
  const [cx, cy] = lage.revolver
  const [ux, uy] = ursprung(lage.sicht)
  const ecken = Array.from({ length: 12 }, (_, i) => {
    const w = (i / 12) * Math.PI * 2
    return `${cx + Math.cos(w) * REVOLVER_R},${cy + Math.sin(w) * REVOLVER_R}`
  }).join(' ')

  return (
    <g>
      <g
        style={{
          transform: `rotate(${bestueckt ? 0 : -22}deg)`,
          transformBox: 'view-box',
          transformOrigin: `${cx - ux}px ${cy - uy}px`,
          transition: 'transform 0.5s cubic-bezier(0.2, 0, 0, 1)',
        }}
      >
        <polygon
          points={ecken}
          className={BAUTEIL}
          strokeWidth={STRICH.voll}
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        {/* Die leeren Stationen — dort sitzen die anderen elf Werkzeuge. */}
        {Array.from({ length: 12 }, (_, i) => {
          const w = (i / 12) * Math.PI * 2 + Math.PI / 12
          return (
            <line
              key={i}
              x1={cx + Math.cos(w) * (REVOLVER_R - 4)}
              y1={cy + Math.sin(w) * (REVOLVER_R - 4)}
              x2={cx + Math.cos(w) * REVOLVER_R}
              y2={cy + Math.sin(w) * REVOLVER_R}
              stroke="currentColor"
              strokeWidth={STRICH.fein}
              vectorEffect="non-scaling-stroke"
              className="text-kh-paper/55"
            />
          )
        })}
        <circle
          cx={cx}
          cy={cy}
          r={3.6}
          fill="none"
          stroke="currentColor"
          strokeWidth={STRICH.fein}
          vectorEffect="non-scaling-stroke"
          className="text-kh-paper/70"
        />
      </g>

      {/* Der Halter und die Schneide, die gleich schneidet. */}
      <g
        style={{
          opacity: bestueckt ? 1 : 0,
          transition: 'opacity 0.4s 0.15s cubic-bezier(0.2, 0, 0, 1)',
        }}
      >
        <path
          d={`M ${lage.halter[0]} ${lage.halter[1]} L ${SCHNEIDE[0] + 1.4} ${SCHNEIDE[1] - 1.8}`}
          stroke="currentColor"
          strokeWidth={5}
          strokeLinecap="round"
          className="text-kh-raised"
        />
        <path
          d={`M ${lage.halter[0]} ${lage.halter[1]} L ${SCHNEIDE[0] + 1.4} ${SCHNEIDE[1] - 1.8}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={STRICH.fein}
          vectorEffect="non-scaling-stroke"
          className="text-kh-paper/70"
        />
        <polygon
          points={`${SCHNEIDE[0]},${SCHNEIDE[1]} ${SCHNEIDE[0] + 5},${SCHNEIDE[1] - 2.5} ${SCHNEIDE[0] + 3},${SCHNEIDE[1] - 6}`}
          className="fill-kh-paper"
        />
      </g>
    </g>
  )
}

/**
 * Werkzeuge vermessen: wie weit die Schneide aus dem Revolver heraussteht, in
 * Z und in X. Ohne Zahlen — welche dort stünden, hängt an Maschine und
 * Halter, und der Screen behauptet nichts, was er nicht belegen kann.
 */
function Werkzeuglaenge({ sichtbar, lage }: { sichtbar: boolean; lage: Aufstellung }) {
  const ecke = [lage.revolver[0], SCHNEIDE[1]] as const

  return (
    <g
      style={{
        opacity: sichtbar ? 1 : 0,
        transition: 'opacity 0.4s cubic-bezier(0.2, 0, 0, 1)',
      }}
    >
      {/* Die beiden Maße treffen sich in der Ecke unter dem Revolver: X, wie
          weit die Schneide heraussteht, und Z, wie weit sie vorsteht. */}
      <Mass von={lage.revolver} bis={ecke} hervor />
      <Mass von={SCHNEIDE} bis={ecke} hervor />
    </g>
  )
}

/**
 * Der Werkstücknullpunkt an der Stirnfläche, auf der Achse — das Zeichen aus
 * der Zeichnungsnorm: ein Kreis, zwei gegenüberliegende Viertel gefüllt.
 */
function Nullpunkt({ sichtbar, leuchtet }: { sichtbar: boolean; leuchtet: boolean }) {
  const r = 2.8

  return (
    <g
      className={leuchtet ? 'text-kh-signal' : 'text-kh-paper'}
      style={{
        opacity: sichtbar ? 1 : 0,
        transition: 'opacity 0.4s cubic-bezier(0.2, 0, 0, 1)',
      }}
    >
      {/* Z läuft aus dem Material heraus, X radial nach außen. Dieselbe
          Richtung, die das Programm in Z3 mit `Z-35.` benutzt. */}
      <line
        x1={r + 1.4}
        y1={0}
        x2={17}
        y2={0}
        stroke="currentColor"
        strokeWidth={STRICH.fein}
        vectorEffect="non-scaling-stroke"
      />
      <Pfeilspitze x={18.5} y={0} winkel={0} />
      <text x={20.5} y={1.5} fontSize={4} fill="currentColor" className="font-display">
        Z
      </text>

      <line
        x1={0}
        y1={-r - 1.4}
        x2={0}
        y2={-19}
        stroke="currentColor"
        strokeWidth={STRICH.fein}
        vectorEffect="non-scaling-stroke"
      />
      <Pfeilspitze x={0} y={-20.5} winkel={-90} />
      <text
        x={0}
        y={-23}
        textAnchor="middle"
        fontSize={4}
        fill="currentColor"
        className="font-display"
      >
        X
      </text>

      {/* Von hier aus wird gerechnet: 35 Millimeter weit, vierhundertmal. */}
      <line
        x1={-LAENGE}
        y1={-NENNMASS / 2}
        x2={-LAENGE}
        y2={ROHLING_R + 7}
        stroke="currentColor"
        strokeWidth={STRICH.fein}
        strokeDasharray="4 4"
        vectorEffect="non-scaling-stroke"
        opacity={0.4}
      />
      <line
        x1={0}
        y1={r + 1.4}
        x2={0}
        y2={ROHLING_R + 7}
        stroke="currentColor"
        strokeWidth={STRICH.fein}
        strokeDasharray="4 4"
        vectorEffect="non-scaling-stroke"
        opacity={0.4}
      />

      <circle
        cx={0}
        cy={0}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth={STRICH.voll}
        vectorEffect="non-scaling-stroke"
      />
      <path d={`M 0 0 L 0 ${-r} A ${r} ${r} 0 0 1 ${r} 0 Z`} fill="currentColor" />
      <path d={`M 0 0 L 0 ${r} A ${r} ${r} 0 0 1 ${-r} 0 Z`} fill="currentColor" />
    </g>
  )
}
