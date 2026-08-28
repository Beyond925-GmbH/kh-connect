import { motion } from 'motion/react'
import { Bild } from './Bild'
import { STAHL, TEIL, WARM, type SatzId, type WegZustand } from './kanon'

/**
 * Z3 — **der Werkzeugweg.** Dasselbe Teil wie auf der Zeichnung (Z1), jetzt
 * in der Maschine: Futter links, Bolzen gespannt, und über der Kontur die
 * Bahn des Drehmeißels — vier NC-Sätze, vier Stücke Weg.
 *
 * Die Bühne führt vor, das Panel bedient: tippt der Besucher einen Satz an,
 * fährt das Werkzeug hier genau dieses Stück. Eilgang (`G0`) ist gestrichelt
 * und kalt — er schneidet nichts. Vorschub (`G1`) ist warm: da läuft der
 * Span. Die Bahn liegt **auf der Kontur**, weil der Schlichtgang genau sie
 * abfährt — die Zeichnung wird zur Bewegung.
 */

/** Maßstab: Millimeter → Zeicheneinheiten. */
const S = 3.2

/** Drehachse des Teils. */
const MITTE = 150

/** Linke Kante des Teils (im Futter). */
const LINKS = 80

const schaftR = (TEIL.schaftDurchmesser / 2) * S
const sitzR = (TEIL.sitzDurchmesser / 2) * S
const schulter = LINKS + TEIL.schaftLaenge * S
const stirn = schulter + TEIL.sitzLaenge * S
const fase = TEIL.fase * S

/** Ein Punkt der Bahn: `x` = Z-Achse (Länge), `y` = X-Achse (Durchmesser). */
interface P {
  x: number
  y: number
}

/** Radius von Durchmesser 23 — der Startdurchmesser der Fase. */
const fasenAnsatz = 11.5 * S

/** Wo das Werkzeug wartet, bevor der erste Satz läuft. */
const PARK: P = { x: 252, y: 72 }

/**
 * Die vier Sätze als Bahnstücke. Zahlen aus dem Programm in Z3:
 * X ist ein **Durchmesser** (Drehmaschinen-Konvention), Z die Länge ab
 * Stirnfläche — deshalb rechnet `y` mit dem halben X.
 */
const BAHN: Record<SatzId, { von: P; bis: P; schnitt: boolean; dauer: number }> = {
  // N10 G0 X23 Z2 — Eilgang vor die Stirn.
  n10: {
    von: PARK,
    bis: { x: stirn + 2 * S, y: MITTE - fasenAnsatz },
    schnitt: false,
    dauer: 0.7,
  },
  // N20 G1 Z0 — mit Vorschub an die Kante.
  n20: {
    von: { x: stirn + 2 * S, y: MITTE - fasenAnsatz },
    bis: { x: stirn, y: MITTE - fasenAnsatz },
    schnitt: true,
    dauer: 0.9,
  },
  // N30 G1 X25 Z-1 — die Fase, schräg über die Kante.
  n30: {
    von: { x: stirn, y: MITTE - fasenAnsatz },
    bis: { x: stirn - fase, y: MITTE - sitzR },
    schnitt: true,
    dauer: 0.9,
  },
  // N40 G1 Z-22 — die Mantellinie entlang, bis zur Schulter.
  n40: {
    von: { x: stirn - fase, y: MITTE - sitzR },
    bis: { x: schulter, y: MITTE - sitzR },
    schnitt: true,
    dauer: 2.2,
  },
}

export function Werkzeugweg({ zustand }: { zustand: WegZustand }) {
  const { aktiv, gesehen, geloest } = zustand
  const werkzeugZiel = aktiv
    ? BAHN[aktiv].bis
    : gesehen.length > 0
      ? letzterPunkt(gesehen)
      : PARK

  return (
    <Bild testid="werkzeugweg-buehne">
      {() => (
        <svg
          viewBox="0 0 320 240"
          preserveAspectRatio="xMidYMid meet"
          className="size-full"
        >
          {/* Futter: Körper und zwei sichtbare Backen, die den Schaft greifen. */}
          <rect
            x="16"
            y={MITTE - 62}
            width="52"
            height="124"
            rx="6"
            fill={STAHL.flaeche}
            stroke={STAHL.linieMatt}
            strokeWidth="1.5"
          />
          <rect
            x="60"
            y={MITTE - schaftR - 16}
            width="34"
            height="16"
            rx="2"
            fill={STAHL.flaeche}
            stroke={STAHL.linie}
            strokeWidth="1.5"
          />
          <rect
            x="60"
            y={MITTE + schaftR}
            width="34"
            height="16"
            rx="2"
            fill={STAHL.flaeche}
            stroke={STAHL.linie}
            strokeWidth="1.5"
          />

          {/* Drehachse. */}
          <line
            x1="20"
            y1={MITTE}
            x2={stirn + 28}
            y2={MITTE}
            stroke={STAHL.linieMatt}
            strokeWidth="1"
            strokeDasharray="10 3 2 3"
          />

          {/* Das Teil — dieselbe Kontur wie auf der Zeichnung. */}
          <path
            d={[
              `M ${LINKS} ${MITTE - schaftR}`,
              `H ${schulter}`,
              `V ${MITTE - sitzR}`,
              `H ${stirn - fase}`,
              `L ${stirn} ${MITTE - sitzR + fase}`,
              `V ${MITTE + sitzR - fase}`,
              `L ${stirn - fase} ${MITTE + sitzR}`,
              `H ${schulter}`,
              `V ${MITTE + schaftR}`,
              `H ${LINKS}`,
              'Z',
            ].join(' ')}
            fill="rgb(198 210 220 / 0.08)"
            stroke={STAHL.linie}
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* Achsenkreuz der Drehmaschine: Z längs, X quer. */}
          <g
            stroke={STAHL.linieMatt}
            strokeWidth="1.5"
            fill={STAHL.linieMatt}
            fontSize="9"
          >
            <line x1="262" y1="212" x2="294" y2="212" />
            <path d="M 294 212 l -6 -2.4 v 4.8 Z" />
            <line x1="262" y1="212" x2="262" y2="184" />
            <path d="M 262 184 l -2.4 6 h 4.8 Z" />
            <text x="298" y="215" stroke="none">
              Z
            </text>
            <text x="258" y="178" stroke="none" textAnchor="middle">
              X
            </text>
          </g>

          {/* Schon gefahrene Bahnstücke bleiben stehen. */}
          {gesehen.map((id) => (
            <Bahnstueck key={id} id={id} betont={geloest && id === 'n30'} />
          ))}

          {/* Das gerade angetippte Stück fährt sichtbar. */}
          {aktiv && (
            <Bahnstueck id={aktiv} animiert betont={geloest && aktiv === 'n30'} />
          )}

          {/* Das Werkzeug: Halter von oben, Schneidplatte als Spitze. Es
              springt an den Anfang seines Satzes und fährt dann — deshalb
              der `key`: jeder Satz ist eine eigene Fahrt. */}
          <motion.g
            key={aktiv ?? 'park'}
            initial={aktiv ? { x: BAHN[aktiv].von.x, y: BAHN[aktiv].von.y } : false}
            animate={{ x: werkzeugZiel.x, y: werkzeugZiel.y }}
            transition={{
              duration: aktiv ? BAHN[aktiv].dauer : 0.4,
              ease: aktiv && BAHN[aktiv].schnitt ? 'linear' : [0.22, 1, 0.36, 1],
            }}
          >
            {/* Koordinatenursprung der Gruppe ist die Werkzeugspitze. */}
            <g>
              <rect
                x="1"
                y="-58"
                width="14"
                height="46"
                rx="2"
                fill={STAHL.flaeche}
                stroke={STAHL.linieMatt}
                strokeWidth="1.5"
              />
              <path
                d="M 0 0 L 12 -14 L 3 -16 Z"
                fill={STAHL.blank}
                stroke={STAHL.linie}
                strokeWidth="1"
              />
              {/* Der Span: nur, solange wirklich geschnitten wird. */}
              {aktiv && BAHN[aktiv].schnitt && (
                <motion.circle
                  r="4"
                  fill={WARM.heiss}
                  animate={{ opacity: [0.9, 0.35, 0.9], scale: [1, 1.5, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                />
              )}
            </g>
          </motion.g>
        </svg>
      )}
    </Bild>
  )
}

/** Wo das Werkzeug nach den bisher gefahrenen Sätzen steht. */
function letzterPunkt(gesehen: readonly SatzId[]): P {
  const reihenfolge: SatzId[] = ['n10', 'n20', 'n30', 'n40']
  const letzter = [...reihenfolge].reverse().find((id) => gesehen.includes(id))
  return letzter ? BAHN[letzter].bis : PARK
}

function Bahnstueck({
  id,
  animiert = false,
  betont = false,
}: {
  id: SatzId
  animiert?: boolean
  betont?: boolean
}) {
  const b = BAHN[id]
  const farbe = b.schnitt ? (betont ? WARM.heiss : WARM.linie) : STAHL.linie

  return (
    <motion.line
      x1={b.von.x}
      y1={b.von.y}
      x2={b.bis.x}
      y2={b.bis.y}
      stroke={farbe}
      strokeWidth={betont ? 4 : b.schnitt ? 3 : 2}
      strokeLinecap="round"
      strokeDasharray={b.schnitt ? undefined : '6 5'}
      initial={animiert ? { pathLength: 0 } : false}
      animate={{ pathLength: 1 }}
      transition={{
        duration: animiert ? b.dauer : 0,
        ease: b.schnitt ? 'linear' : [0.22, 1, 0.36, 1],
      }}
      opacity={b.schnitt ? 0.95 : 0.7}
      data-testid={`weg-${id}`}
    />
  )
}
