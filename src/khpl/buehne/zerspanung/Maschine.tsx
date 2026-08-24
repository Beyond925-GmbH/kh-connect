import { Bild, Mass, Pfeilspitze } from './Bild'
import { BAUTEIL, STRICH } from './stil'
import { LAENGE, NENNMASS, ROHLING_DURCHMESSER } from './kanon'

/**
 * Z2 — halbnah in die Maschine: Futter, Rohling, Revolver.
 *
 * **Schematisch und nicht fotorealistisch, und das ist eine Entscheidung.**
 * Der Tag baut keine 3D-Welt (khpl-tag-zerspanung.md §7); seine Werkzeuge sind
 * Zeichnung, Werkzeugweg und Zahl. Eine gerenderte Maschine wäre der einzige
 * Screen mit einer anderen Handschrift — und ausgerechnet der, auf dem man
 * *lesen* soll, was wo sitzt. Linien zeigen das besser als Chrom.
 *
 * **Die Maschine steht von Anfang an da, leer.** Vier Handgriffe füllen sie:
 * der Rohling wird gespannt, das Werkzeug kommt in den Revolver, seine Länge
 * wird vermessen, der Nullpunkt wird gesetzt. Der erste Screen zeigt deshalb
 * nicht nichts, sondern **eine Maschine, in der noch nichts ist** — genau das
 * ist die Aussage: „wie viel passiert, bevor irgendetwas passiert" (§6 Z2).
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
 * gelbgrün, die Farbe, die im ganzen Produkt „das hast du geschafft" heißt.
 * Z zeigt nach rechts aus dem Material heraus, X nach oben — dieselbe
 * Richtungsangabe, mit der das Programm in Z3 dann `Z-35.` schreibt.
 */

/** x ∈ [-68, 37], y ∈ [-49, 29]. Dieselbe Millimeterwelt wie die Zeichnung. */
const SICHT = '-68 -49 105 78'
const [SICHT_X, SICHT_Y] = [68, 49]

/** Stirnfläche der Spannbacken. Ab hier nach links ist Futter, kein Werkstück. */
export const BACKEN_STIRN = -37

const ROHLING_R = ROHLING_DURCHMESSER / 2

export function Maschine({
  ruestschritte = 0,
  nullpunkt = false,
}: {
  ruestschritte?: number
  nullpunkt?: boolean
}) {
  const gespannt = ruestschritte >= 1
  const bestueckt = ruestschritte >= 2
  const vermessen = ruestschritte >= 3
  const genullt = ruestschritte >= 4 || nullpunkt

  return (
    <Bild viewBox={SICHT}>
      <Futter offen={!gespannt} />

      <g
        style={{
          opacity: gespannt ? 1 : 0,
          transition: 'opacity 0.4s cubic-bezier(0.2, 0, 0, 1)',
        }}
      >
        <Rohteil von={-46} bis={2} />
      </g>

      <Revolver bestueckt={bestueckt} />
      <Werkzeuglaenge sichtbar={vermessen} />
      <Nullpunkt sichtbar={genullt} leuchtet={nullpunkt} />
    </Bild>
  )
}

/**
 * Futter und Backen im Längsschnitt. Die Backen fahren beim Spannen zu — fünf
 * Millimeter, die man sieht, und danach liegt der Rohling an.
 *
 * Exportiert, weil Z3 dieselbe Maschine zeigt: der Werkzeugweg läuft auf
 * genau diese Backen zu, und die Kollision hat nur dann einen Ort, wenn es
 * derselbe Ort ist.
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
        className="text-kh-paper/30"
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
const REVOLVER_MITTE = [20, -30] as const
const REVOLVER_R = 14

/**
 * Der Werkzeugrevolver. Er steht von Anfang an da; **bestücken** heißt, dass
 * er auf die Station mit dem Schlichtdrehmeißel aus `T0101` schwenkt und das
 * Werkzeug in Position steht. Eine harte Rastung, keine Feder — der Revolver
 * einer Drehmaschine schwingt nicht aus.
 */
export function Revolver({ bestueckt }: { bestueckt: boolean }) {
  const ecken = Array.from({ length: 12 }, (_, i) => {
    const w = (i / 12) * Math.PI * 2
    const [cx, cy] = REVOLVER_MITTE
    return `${cx + Math.cos(w) * REVOLVER_R},${cy + Math.sin(w) * REVOLVER_R}`
  }).join(' ')

  return (
    <g>
      <g
        style={{
          transform: `rotate(${bestueckt ? 0 : -22}deg)`,
          transformBox: 'view-box',
          transformOrigin: `${REVOLVER_MITTE[0] + SICHT_X}px ${REVOLVER_MITTE[1] + SICHT_Y}px`,
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
          const [cx, cy] = REVOLVER_MITTE
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
              className="text-kh-paper/30"
            />
          )
        })}
        <circle
          cx={REVOLVER_MITTE[0]}
          cy={REVOLVER_MITTE[1]}
          r={3.6}
          fill="none"
          stroke="currentColor"
          strokeWidth={STRICH.fein}
          vectorEffect="non-scaling-stroke"
          className="text-kh-paper/45"
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
          d={`M 12 -20 L ${SCHNEIDE[0] + 1.4} ${SCHNEIDE[1] - 1.8}`}
          stroke="currentColor"
          strokeWidth={5}
          strokeLinecap="round"
          className="text-kh-raised"
        />
        <path
          d={`M 12 -20 L ${SCHNEIDE[0] + 1.4} ${SCHNEIDE[1] - 1.8}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={STRICH.fein}
          vectorEffect="non-scaling-stroke"
          className="text-kh-paper/45"
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
function Werkzeuglaenge({ sichtbar }: { sichtbar: boolean }) {
  return (
    <g
      style={{
        opacity: sichtbar ? 1 : 0,
        transition: 'opacity 0.4s cubic-bezier(0.2, 0, 0, 1)',
      }}
    >
      {/* Die beiden Maße treffen sich in der Ecke unter dem Revolver: X, wie
          weit die Schneide heraussteht, und Z, wie weit sie vorsteht. */}
      <Mass von={REVOLVER_MITTE} bis={[REVOLVER_MITTE[0], SCHNEIDE[1]]} hervor />
      <Mass von={SCHNEIDE} bis={[REVOLVER_MITTE[0], SCHNEIDE[1]]} hervor />
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
