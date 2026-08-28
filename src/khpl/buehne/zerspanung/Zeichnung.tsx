import { motion } from 'motion/react'
import { Bild } from './Bild'
import { STAHL, TEIL, WARM, type MassId, type ZeichnungZustand } from './kanon'

/**
 * Z1 — **die technische Zeichnung.** Die eigene Bildsprache dieses Berufs
 * ist kein Foto und kein Schema, sondern das Blatt: Konturen, Mittellinie,
 * Maßpfeile, Schriftfeld. Hier fängt jeder Auftrag an.
 *
 * Die Zeichnung ist die Bedienung: die vier Maße sind antippbar, un-getippte
 * tragen den wartenden Ring (dieselbe Einladung wie die Verlustflächen in
 * A3). Das gefundene entscheidende Maß bleibt warm markiert — Orange gehört
 * der Welt, und das Maß ist die Welt dieses Tages.
 *
 * Gezeichnet wird aus `TEIL` in `kanon.ts` — dieselben Zahlen, die auch der
 * Werkzeugweg (Z3) und die Messschraube (Z4) benutzen. Eine Welt, viele
 * Zustände.
 */

/** Maßstab der Zeichnung: Millimeter → Zeicheneinheiten. */
const S = 3.4

/** Mittellinie des Teils. */
const MITTE = 96

/** Linke Kante des Teils (Schaftende). */
const LINKS = 86

const schaftR = (TEIL.schaftDurchmesser / 2) * S
const sitzR = (TEIL.sitzDurchmesser / 2) * S
const schulter = LINKS + TEIL.schaftLaenge * S
const stirn = schulter + TEIL.sitzLaenge * S
const fase = TEIL.fase * S

/** Wo jedes Maß beschriftet ist und wo sein Tap-Ziel liegt. */
const ORTE: Record<MassId, { x: number; y: number; label: string }> = {
  laenge: { x: (LINKS + stirn) / 2, y: 178, label: `${TEIL.gesamt}` },
  schaft: { x: 58, y: MITTE, label: `⌀${TEIL.schaftDurchmesser}` },
  sitz: { x: 262, y: MITTE, label: `⌀${TEIL.sitzDurchmesser} h7` },
  fase: { x: 168, y: 26, label: '1 × 45°' },
}

export function Zeichnung({
  zustand,
  onMass,
}: {
  zustand: ZeichnungZustand
  /** Ohne Handler ist das Blatt nur noch Bild — nach dem Lösen. */
  onMass?: (id: MassId) => void
}) {
  return (
    <Bild testid="zeichnung-buehne">
      {() => (
        <svg
          viewBox="0 0 320 240"
          preserveAspectRatio="xMidYMid meet"
          className="size-full"
        >
          {/* Das Blatt: ein Rahmen, kein Papier — die Zeichnung steht auf dem
              Bühnenschwarz wie auf einem dunklen CAD-Schirm. */}
          <rect
            x="8"
            y="6"
            width="304"
            height="228"
            rx="3"
            fill={STAHL.tiefe}
            stroke={STAHL.linieMatt}
            strokeWidth="1.5"
          />

          {/* Mittellinie, strichpunktiert über beide Enden hinaus. */}
          <line
            x1={LINKS - 14}
            y1={MITTE}
            x2={stirn + 16}
            y2={MITTE}
            stroke={STAHL.linieMatt}
            strokeWidth="1"
            strokeDasharray="10 3 2 3"
          />

          {/* Die Kontur des Bolzens: hinten der Schaft Ø20, vorn der
              Lagersitz Ø25 mit Fase an der Stirn. */}
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
            fill="rgb(198 210 220 / 0.06)"
            stroke={STAHL.linie}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* Kante der Fase, als Linie über die Stirn. */}
          <line
            x1={stirn - fase}
            y1={MITTE - sitzR + fase}
            x2={stirn - fase}
            y2={MITTE + sitzR - fase}
            stroke={STAHL.linie}
            strokeWidth="1"
            opacity="0.6"
          />

          {/* --- Bemaßung ------------------------------------------------- */}

          {/* Gesamtlänge 38, unter dem Teil. */}
          <g stroke={STAHL.linieMatt} strokeWidth="1">
            <line x1={LINKS} y1={MITTE + sitzR + 6} x2={LINKS} y2={ORTE.laenge.y + 5} />
            <line x1={stirn} y1={MITTE + sitzR + 6} x2={stirn} y2={ORTE.laenge.y + 5} />
            <line x1={LINKS} y1={ORTE.laenge.y} x2={stirn} y2={ORTE.laenge.y} />
          </g>
          <Pfeil x={LINKS} y={ORTE.laenge.y} nach="links" />
          <Pfeil x={stirn} y={ORTE.laenge.y} nach="rechts" />

          {/* Ø20, links neben dem Schaftende. */}
          <g stroke={STAHL.linieMatt} strokeWidth="1">
            <line x1={LINKS - 4} y1={MITTE - schaftR} x2={70} y2={MITTE - schaftR} />
            <line x1={LINKS - 4} y1={MITTE + schaftR} x2={70} y2={MITTE + schaftR} />
            <line x1={74} y1={MITTE - schaftR} x2={74} y2={MITTE + schaftR} />
          </g>
          <Pfeil x={74} y={MITTE - schaftR} nach="oben" />
          <Pfeil x={74} y={MITTE + schaftR} nach="unten" />

          {/* Ø25 h7, rechts neben der Stirn — das Maß, um das es geht. */}
          <g stroke={STAHL.linieMatt} strokeWidth="1">
            <line x1={stirn + 4} y1={MITTE - sitzR} x2={246} y2={MITTE - sitzR} />
            <line x1={stirn + 4} y1={MITTE + sitzR} x2={246} y2={MITTE + sitzR} />
            <line x1={242} y1={MITTE - sitzR} x2={242} y2={MITTE + sitzR} />
          </g>
          <Pfeil x={242} y={MITTE - sitzR} nach="oben" />
          <Pfeil x={242} y={MITTE + sitzR} nach="unten" />

          {/* Fase, mit Hinweislinie zur oberen Stirnkante. */}
          <line
            x1={stirn - fase / 2}
            y1={MITTE - sitzR + fase / 2}
            x2={ORTE.fase.x + 18}
            y2={ORTE.fase.y + 7}
            stroke={STAHL.linieMatt}
            strokeWidth="1"
          />

          {/* Schriftfeld unten rechts — das Blatt sagt, was es ist. */}
          <g fontSize="7.5" fill={STAHL.linie}>
            <rect
              x="196"
              y="196"
              width="112"
              height="34"
              fill="none"
              stroke={STAHL.linieMatt}
              strokeWidth="1"
            />
            <line x1="196" y1="207" x2="308" y2="207" stroke={STAHL.linieMatt} />
            <text x="201" y="204" fontWeight="600" fill={STAHL.blank}>
              Bolzen · C45
            </text>
            <text x="201" y="216">
              Stückzahl: 200
            </text>
            <text x="201" y="226">
              Maße in mm · ISO 2768-m
            </text>
          </g>

          {/* --- Die vier Maße als Ziele ---------------------------------- */}
          {(Object.keys(ORTE) as MassId[]).map((id) => (
            <Mass key={id} id={id} zustand={zustand} onMass={onMass} />
          ))}
        </svg>
      )}
    </Bild>
  )
}

/** Ein kleiner Maßpfeil. */
function Pfeil({
  x,
  y,
  nach,
}: {
  x: number
  y: number
  nach: 'links' | 'rechts' | 'oben' | 'unten'
}) {
  const d = {
    links: `M ${x} ${y} l 7 -2.4 v 4.8 Z`,
    rechts: `M ${x} ${y} l -7 -2.4 v 4.8 Z`,
    oben: `M ${x} ${y} l -2.4 7 h 4.8 Z`,
    unten: `M ${x} ${y} l -2.4 -7 h 4.8 Z`,
  }[nach]
  return <path d={d} fill={STAHL.linieMatt} />
}

/**
 * Ein Maß: Beschriftung, Tap-Ziel und die drei Zustände — wartend (Ring),
 * gelesen (still), gefunden (warm).
 */
function Mass({
  id,
  zustand,
  onMass,
}: {
  id: MassId
  zustand: ZeichnungZustand
  onMass?: (id: MassId) => void
}) {
  const ort = ORTE[id]
  const gelesen = zustand.angetippt.includes(id)
  const offen = zustand.offen === id
  const kritisch = id === 'sitz' && zustand.gefunden

  return (
    <g
      onClick={onMass ? () => onMass(id) : undefined}
      style={{ cursor: onMass ? 'pointer' : undefined }}
      data-testid={`zeichnung-mass-${id}`}
    >
      {/* Trefferfläche — großzügig, unsichtbar. */}
      <circle cx={ort.x} cy={ort.y} r="24" fill="transparent" />

      {/* Der wartende Ring auf allem, was noch nicht gelesen ist. */}
      {onMass && !gelesen && (
        <motion.circle
          cx={ort.x}
          cy={ort.y}
          r={13}
          fill="none"
          stroke="#d8f63c"
          strokeWidth="1.6"
          // `initial` nennt den ersten Frame ausdrücklich: ohne ihn schreibt
          // motion beim Mounten einmal `r="undefined"` in das Attribut, und
          // die Konsole meldet auf jedem Ring einen Rendering-Fehler.
          initial={{ r: 13, opacity: 0.75 }}
          animate={{ r: [13, 18, 13], opacity: [0.75, 0.2, 0.75] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Das gefundene Maß bleibt warm eingefasst. */}
      {kritisch && (
        <motion.circle
          cx={ort.x}
          cy={ort.y}
          r="19"
          fill="rgb(255 159 42 / 0.10)"
          stroke={WARM.linie}
          strokeWidth="2"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 320, damping: 18 }}
          style={{ transformOrigin: `${ort.x}px ${ort.y}px` }}
        />
      )}

      <text
        x={ort.x}
        y={ort.y + 4}
        textAnchor="middle"
        fontSize="12"
        fontWeight="700"
        fill={kritisch ? WARM.linie : offen ? STAHL.glanz : STAHL.blank}
        stroke={STAHL.tiefe}
        strokeWidth="4"
        paintOrder="stroke"
      >
        {ort.label}
      </text>
    </g>
  )
}
