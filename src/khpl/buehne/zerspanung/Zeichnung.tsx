import { Achse, Bild, Hilfslinie, Mass } from './Bild'
import { KOMMA, STRICH } from './stil'
import { FASE, GROESSTMASS, KLEINSTMASS, LAENGE, NENNMASS, TOLERANZ } from './kanon'
import { KONTUR } from './weg'

/**
 * Z1 — die technische Zeichnung, und der erste Zoom des Tages.
 *
 * **Vektor, nicht Foto einer Zeichnung** (khpl-tag-zerspanung.md §6 Z1). Der
 * Unterschied ist nicht Ästhetik: Eine Zeichnung, die aus denselben Werten
 * kommt wie der Werkzeugweg in Z3 und das Teil in Z5, *ist* dasselbe Teil. Ein
 * abfotografiertes Blatt wäre nur ein Bild davon.
 *
 * **Der Toleranzzoom braucht eine Detailansicht, keinen stärkeren Zoom.** Das
 * ist die eine Stelle, an der eine naheliegende Umsetzung falsch gewesen wäre:
 * 0,021 mm auf einem Ø-20-Teil sind ein Zehntausendstel der Bildbreite. Wer
 * einfach weiterzoomt, sieht am Ende eine gerade Linie und hat nichts erklärt.
 * Zeichnungen lösen das seit jeher mit einer herausgezogenen **Einzelheit** —
 * ein Kreis auf der Kontur, daneben dieselbe Stelle stark überhöht. Deshalb
 * fährt die Zeichnung auf den Kreis zu *und* die Einzelheit fährt ein.
 *
 * ⚠️ Die Überhöhung steht als Wort im Bild („stark überhöht“). Ein Maßstab
 * („M 1000:1“) stünde da als Zahl, die niemand nachgerechnet hat — und dieser
 * Tag erfindet keine Zahlen (§11).
 */

/** x ∈ [-44, 19], y ∈ [-27, 22] — Millimeter, Ursprung an der Stirnfläche. */
const SICHT = '-44 -27 63 49'
/** Mitte der Ansicht — die Einzelheit legt sich genau darauf. */
const SICHT_MITTE = [-12.5, -2.5] as const

/** Wo die Einzelheit auf der Kontur sitzt: mitten auf der Ø-20-Mantellinie. */
const EINZELHEIT = [-14, -NENNMASS / 2] as const
const EINZELHEIT_R = 4.2

/** Wie weit die Zeichnung auf die Einzelheit zufährt, während sie einfährt. */
const ZOOM = 4.2

export function Zeichnung({
  massHervorgehoben = false,
  toleranzfeld = false,
}: {
  massHervorgehoben?: boolean
  toleranzfeld?: boolean
}) {
  return (
    <Bild
      viewBox={SICHT}
      massstab={toleranzfeld ? ZOOM : 1}
      mitte={EINZELHEIT}
      ueber={<Einzelheit sichtbar={toleranzfeld} />}
    >
      <g
        style={{
          opacity: toleranzfeld ? 0.22 : 1,
          transition: 'opacity 0.55s cubic-bezier(0.2, 0, 0, 1)',
        }}
      >
        <Achse von={-42} bis={8} />

        {/* Das Teil im Schnitt. Keine Füllung: eine Zeichnung ist Linie. */}
        <path
          d={KONTUR}
          fill="none"
          stroke="currentColor"
          strokeWidth={STRICH.voll}
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          className="text-kh-paper"
        />

        {/* Die Kante, an der die Fase endet — sichtbar, weil das Teil rund
            ist: aus der Fase wird im Bild ein Kreis und damit eine Linie. */}
        <line
          x1={-FASE}
          y1={-NENNMASS / 2}
          x2={-FASE}
          y2={NENNMASS / 2}
          stroke="currentColor"
          strokeWidth={STRICH.fein}
          vectorEffect="non-scaling-stroke"
          className="text-kh-line-strong"
        />

        {/* -- Ø 20 h7: das Maß, um das der ganze Tag geht ------------------ */}
        <Mass
          von={[-26, -NENNMASS / 2]}
          bis={[-26, NENNMASS / 2]}
          hervor={massHervorgehoben}
        />
        <line
          x1={-26}
          y1={-NENNMASS / 2}
          x2={-26}
          y2={-18.5}
          stroke="currentColor"
          strokeWidth={STRICH.fein}
          vectorEffect="non-scaling-stroke"
          className={massHervorgehoben ? 'text-kh-orange' : 'text-kh-line-strong'}
        />
        <text
          x={-26}
          y={-20}
          textAnchor="middle"
          fontSize={4.4}
          className={`font-display ${massHervorgehoben ? 'fill-kh-orange' : 'fill-kh-paper'}`}
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          Ø {NENNMASS} h7
        </text>

        {/* -- Länge -------------------------------------------------------- */}
        <Hilfslinie von={[-LAENGE, NENNMASS / 2]} bis={[-LAENGE, 20]} />
        <Hilfslinie von={[0, NENNMASS / 2]} bis={[0, 20]} />
        <Mass von={[-LAENGE, 18]} bis={[0, 18]} />
        <text
          x={-LAENGE / 2}
          y={16.2}
          textAnchor="middle"
          fontSize={3.6}
          className="fill-kh-paper/70 font-display"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {LAENGE}
        </text>

        {/* -- Fase: Hinweislinie an die Kante, wie in der Zeichnung -------- */}
        <path
          d={`M ${-FASE / 2} ${NENNMASS / 2 - FASE / 2} L 7 15.5 L 13.5 15.5`}
          fill="none"
          stroke="currentColor"
          strokeWidth={STRICH.fein}
          vectorEffect="non-scaling-stroke"
          className="text-kh-line-strong"
        />
        <circle
          cx={-FASE / 2}
          cy={NENNMASS / 2 - FASE / 2}
          r={0.55}
          className="fill-kh-line-strong"
        />
        <text
          x={7}
          y={14.1}
          fontSize={3}
          className="fill-kh-paper/70 font-display"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {FASE} × 45°
        </text>

        {/* -- Der Kreis, aus dem die Einzelheit gezogen wird --------------- */}
        <circle
          cx={EINZELHEIT[0]}
          cy={EINZELHEIT[1]}
          r={EINZELHEIT_R}
          fill="none"
          stroke="currentColor"
          strokeWidth={STRICH.fein}
          vectorEffect="non-scaling-stroke"
          className={toleranzfeld ? 'text-kh-orange' : 'text-kh-line-strong'}
        />
        <text
          x={EINZELHEIT[0]}
          y={EINZELHEIT[1] - EINZELHEIT_R - 1.6}
          textAnchor="middle"
          fontSize={3}
          className="fill-kh-mute font-display"
        >
          X
        </text>
      </g>
    </Bild>
  )
}

/**
 * Einzelheit X — die Mantellinie, stark überhöht.
 *
 * Oben das **Größtmaß**, unten das **Kleinstmaß**, dazwischen der ganze
 * Spielraum, den dieses Teil hat. Die Zone ist gelbgrün, weil „liegt drin“ im
 * ganzen System diese Farbe hat (Z5 setzt sie im Panel genauso ein) — und weil
 * Rot in diesem Produkt nicht vorkommt.
 *
 * Sie liegt **außerhalb** der zoomenden Gruppe: die Zeichnung fährt auf den
 * Kreis zu, die Einzelheit steht still und wird eingeblendet. Zwei Bewegungen,
 * eine Aussage.
 */
function Einzelheit({ sichtbar }: { sichtbar: boolean }) {
  const [mx, my] = SICHT_MITTE
  const radius = 22
  /** Wo im Bild das Größtmaß liegt, und wie hoch die Zone gezeichnet wird. */
  const oben = my - 3
  const hoch = 7.5
  const unten = oben + hoch

  return (
    <g
      style={{
        opacity: sichtbar ? 1 : 0,
        transition: `opacity 0.45s ${sichtbar ? '0.25s' : '0s'} cubic-bezier(0.2, 0, 0, 1)`,
      }}
    >
      <defs>
        <clipPath id="zerspanung-einzelheit">
          <circle cx={mx} cy={my} r={radius} />
        </clipPath>
      </defs>

      <circle cx={mx} cy={my} r={radius} className="fill-kh-ink/95" />

      <g clipPath="url(#zerspanung-einzelheit)">
        {/* Das Material unter der Mantellinie. */}
        <rect
          x={mx - radius}
          y={unten}
          width={radius * 2}
          height={radius * 2}
          className="fill-kh-raised"
        />
        {/* Die Zone, in der die Oberfläche liegen darf. */}
        <rect
          x={mx - radius}
          y={oben}
          width={radius * 2}
          height={hoch}
          className="fill-kh-signal/12"
        />

        {[oben, unten].map((y, i) => (
          <line
            key={y}
            x1={mx - radius}
            y1={y}
            x2={mx + radius}
            y2={y}
            stroke="currentColor"
            strokeWidth={STRICH.voll}
            strokeDasharray={i === 0 ? undefined : '7 4'}
            vectorEffect="non-scaling-stroke"
            className="text-kh-signal"
          />
        ))}

        <g className="text-kh-signal">
          <Mass von={[mx + 3, oben]} bis={[mx + 3, unten]} />
        </g>
        <text
          x={mx + 6}
          y={my + 1.4}
          fontSize={5.4}
          className="fill-kh-signal font-display"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {TOLERANZ.toLocaleString('de-DE', { minimumFractionDigits: 3 })}
        </text>

        <text
          x={mx - radius + 3}
          y={oben - 1.8}
          fontSize={3.6}
          className="fill-kh-paper/75 font-display"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {KOMMA.format(GROESSTMASS)}
        </text>
        <text
          x={mx - radius + 3}
          y={unten + 4.6}
          fontSize={3.6}
          className="fill-kh-paper/75 font-display"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {KOMMA.format(KLEINSTMASS)}
        </text>
      </g>

      <circle
        cx={mx}
        cy={my}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={STRICH.voll}
        vectorEffect="non-scaling-stroke"
        className="text-kh-line-strong"
      />
      {/* Die Fahne steht **innen**: Sie gehört zur Einzelheit, nicht zur
          Zeichnung, und am oberen Bildrand wäre sie das Erste, was ein
          knapperer Bildausschnitt abschneidet. */}
      <text
        x={mx - radius + 4}
        y={my - radius + 7}
        fontSize={3.4}
        className="fill-kh-mute font-display"
      >
        X — stark überhöht
      </text>
    </g>
  )
}
