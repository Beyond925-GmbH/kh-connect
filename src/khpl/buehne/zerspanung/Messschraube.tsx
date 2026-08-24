import { Bild } from './Bild'
import { BAUTEIL, KOMMA, STRICH } from './stil'
import { FASE, GROESSTMASS, KLEINSTMASS, NENNMASS, TOLERANZ } from './kanon'

/**
 * Z5 — ganz nah: Mikrometerschraube, Teil, Ziffern.
 *
 * **Sie heißt hier Mikrometerschraube.** Im Betrieb sagt niemand
 * „Bügelmessschraube“; zwei der vier Gespräche nennen sie so, und der Screen
 * folgt den Gesprächen (khpl-tag-zerspanung.md §6 Z5).
 *
 * **Die Zahl steht im Panel, nicht auf der Bühne.** Z5 trägt den Messwert in
 * `kh-zahl` und darunter das Toleranzband — das ist die Anzeige. Die Bühne
 * doppelt sie nicht, sie zeigt, **woher der Wert kommt**: die Trommel dreht
 * sich mit, und über dem Teil liegt dieselbe Toleranzzone, die Z1 als
 * Einzelheit gezeigt hat. Vier Minuten später, an derselben Fläche.
 *
 * **Die Trommel dreht sich echt.** Eine metrische Messschraube macht je
 * Umdrehung eine halbe Millimeterstrecke, und die Striche liegen längs auf
 * dem Mantel — im Seitenriss wandern sie deshalb nach oben und unten und
 * laufen an den Rändern zusammen. Genau das rechnet `Trommelstriche`. Beschriftet
 * ist nichts: eine Skala mit erfundenen Zahlen wäre ein Fachfehler auf dem
 * Screen, der vom Messen handelt.
 *
 * **Die Zone ist stark überhöht.** 0,021 mm sind auf einem Ø-20-Teil nicht
 * darstellbar, und der Screen tut auch nicht so. Was er zeigt, ist die Lage:
 * liegt die Fläche in der Zone oder darüber oder darunter.
 */

/** x ∈ [0, 108], y ∈ [-28, 44]. Eigene Welt: hier ist ein Millimeter groß. */
const SICHT = '0 -28 108 72'

const TEIL = [24, 0] as const
const TEIL_R = NENNMASS / 2

/** Trommelmitte und -radius im Seitenriss. */
const TROMMEL = { x1: 74, x2: 96, r: 10.5 }

/** Steigung der Messspindel: eine Umdrehung, ein halber Millimeter. */
const STEIGUNG = 0.5

/** Wo die Toleranzzone über dem Teil liegt und wie hoch sie gezeichnet wird. */
const ZONE = { oben: -15, hoch: 6, von: 9, bis: 39 }

export function Messschraube({
  messwert = NENNMASS,
  toleranzUeberlagerung = false,
  korrigiert = false,
}: {
  messwert?: number
  toleranzUeberlagerung?: boolean
  korrigiert?: boolean
}) {
  return (
    <Bild viewBox={SICHT}>
      {/* Der Bügel. Ein Bauteil mit Ausdehnung, deshalb Fläche und nicht Linie. */}
      <path
        d="M 12 4 L 12 38 L 68 38 L 68 4 L 60 4 L 60 30 L 20 30 L 20 4 Z"
        className={BAUTEIL}
        strokeWidth={STRICH.voll}
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />

      {/* Amboss links, Messspindel rechts — dazwischen liegt das Teil an. */}
      <rect
        x={5}
        y={-7}
        width={9}
        height={14}
        rx={1}
        className={BAUTEIL}
        strokeWidth={STRICH.voll}
        vectorEffect="non-scaling-stroke"
      />
      <rect
        x={34}
        y={-5.5}
        width={24}
        height={11}
        rx={1}
        className={BAUTEIL}
        strokeWidth={STRICH.voll}
        vectorEffect="non-scaling-stroke"
      />

      {/* Das Teil, von der Stirnseite: der Durchmesser, um den es geht. */}
      <circle
        cx={TEIL[0]}
        cy={TEIL[1]}
        r={TEIL_R}
        className="fill-kh-raised stroke-kh-paper"
        strokeWidth={STRICH.voll}
        vectorEffect="non-scaling-stroke"
      />
      {/* Die Fasenkante: dieselbe Fase, die Z1 mit „2 × 45°“ bemaßt. */}
      <circle
        cx={TEIL[0]}
        cy={TEIL[1]}
        r={TEIL_R - FASE}
        fill="none"
        stroke="currentColor"
        strokeWidth={STRICH.fein}
        vectorEffect="non-scaling-stroke"
        className="text-kh-paper/50"
      />

      {/* Skalenhülse mit ihrer Längsstrichmarke. */}
      <rect
        x={56}
        y={-8.5}
        width={24}
        height={17}
        rx={1.5}
        className={BAUTEIL}
        strokeWidth={STRICH.voll}
        vectorEffect="non-scaling-stroke"
      />
      <line
        x1={58}
        y1={0}
        x2={79}
        y2={0}
        stroke="currentColor"
        strokeWidth={STRICH.fein}
        vectorEffect="non-scaling-stroke"
        className="text-kh-paper/60"
      />
      {Array.from({ length: 9 }, (_, i) => (
        <line
          key={i}
          x1={59 + i * 2.2}
          y1={0}
          x2={59 + i * 2.2}
          y2={i % 2 === 0 ? -4.4 : -2.6}
          stroke="currentColor"
          strokeWidth={STRICH.fein}
          vectorEffect="non-scaling-stroke"
          className="text-kh-paper/60"
        />
      ))}

      {/* Skalentrommel mit ihren Längsstrichen. */}
      <rect
        x={TROMMEL.x1}
        y={-TROMMEL.r}
        width={TROMMEL.x2 - TROMMEL.x1}
        height={TROMMEL.r * 2}
        rx={2.5}
        className={BAUTEIL}
        strokeWidth={STRICH.voll}
        vectorEffect="non-scaling-stroke"
      />
      <Trommelstriche wert={messwert} />
      <rect
        x={96}
        y={-4.5}
        width={8}
        height={9}
        rx={2}
        className={BAUTEIL}
        strokeWidth={STRICH.voll}
        vectorEffect="non-scaling-stroke"
      />

      <Toleranzzone
        wert={messwert}
        sichtbar={toleranzUeberlagerung || korrigiert}
        gut={korrigiert}
      />
    </Bild>
  )
}

/**
 * Die Striche der Trommel im Seitenriss. Fünfzig Stück auf dem Umfang; sichtbar
 * ist die vordere Hälfte, und je näher ein Strich an der Silhouette liegt,
 * desto flacher steht er zum Betrachter — deshalb `Math.cos` als Deckkraft.
 */
function Trommelstriche({ wert }: { wert: number }) {
  const drehung = (wert / STEIGUNG) * Math.PI * 2

  return (
    <g>
      {Array.from({ length: 50 }, (_, i) => {
        const winkel = (i / 50) * Math.PI * 2 - drehung
        const tiefe = Math.cos(winkel)
        if (tiefe <= 0.06) return null
        const y = Math.sin(winkel) * (TROMMEL.r - 1.2)
        const lang = i % 5 === 0
        return (
          <line
            key={i}
            x1={TROMMEL.x1 + 2}
            y1={y}
            x2={TROMMEL.x1 + 2 + (lang ? 9 : 5)}
            y2={y}
            stroke="currentColor"
            strokeWidth={STRICH.fein}
            vectorEffect="non-scaling-stroke"
            className="text-kh-paper"
            opacity={0.25 + tiefe * 0.6}
          />
        )
      })}
    </g>
  )
}

/**
 * Die Toleranzzone über der gemessenen Fläche — die Antwort auf eine falsche
 * Eingabe, und kein Tadel: Man sieht, wo die Fläche liegt. Gelbgrün, weil
 * „liegt drin“ im ganzen Produkt diese Farbe hat; die Marke ist orange, weil
 * sie der eigene Messwert ist. Rot kommt nicht vor (khpl-tage.md §3).
 */
function Toleranzzone({
  wert,
  sichtbar,
  gut,
}: {
  wert: number
  sichtbar: boolean
  gut: boolean
}) {
  const unten = ZONE.oben + ZONE.hoch
  // Überhöhung: die ganze Zone ist `ZONE.hoch` hoch, also liegt ein Wert um
  // `hoch / TOLERANZ` je Millimeter daneben. Gekappt, damit ein weit
  // danebenliegender Wert nicht aus dem Bild fährt.
  const lage = Math.max(
    ZONE.oben - 7,
    Math.min(unten + 7, ZONE.oben + ((GROESSTMASS - wert) / TOLERANZ) * ZONE.hoch),
  )
  const ton = gut ? 'text-kh-signal' : 'text-kh-orange'

  return (
    <g
      style={{
        opacity: sichtbar ? 1 : 0,
        transform: `translate(0, ${sichtbar ? 0 : -6}px)`,
        transformBox: 'view-box',
        transition:
          'opacity 0.4s cubic-bezier(0.2, 0, 0, 1), transform 0.4s cubic-bezier(0.2, 0, 0, 1)',
      }}
    >
      <rect
        x={ZONE.von}
        y={ZONE.oben}
        width={ZONE.bis - ZONE.von}
        height={ZONE.hoch}
        className="fill-kh-signal/14"
      />
      {[ZONE.oben, unten].map((y, i) => (
        <line
          key={y}
          x1={ZONE.von}
          y1={y}
          x2={ZONE.bis}
          y2={y}
          stroke="currentColor"
          strokeWidth={STRICH.fein}
          strokeDasharray={i === 0 ? undefined : '6 3'}
          vectorEffect="non-scaling-stroke"
          className="text-kh-signal"
        />
      ))}

      {/* Wo die gemessene Fläche wirklich liegt. */}
      <g className={ton}>
        <line
          x1={ZONE.von - 3}
          y1={lage}
          x2={ZONE.bis}
          y2={lage}
          stroke="currentColor"
          strokeWidth={STRICH.voll}
          vectorEffect="non-scaling-stroke"
          style={{ transition: 'none' }}
        />
        <polygon
          points={`${ZONE.bis},${lage} ${ZONE.bis - 3.4},${lage - 1.9} ${ZONE.bis - 3.4},${lage + 1.9}`}
          fill="currentColor"
        />
      </g>

      {/* Die Hinweislinie zur Fläche, um die es geht. */}
      <line
        x1={TEIL[0]}
        y1={-TEIL_R}
        x2={TEIL[0]}
        y2={unten}
        stroke="currentColor"
        strokeWidth={STRICH.fein}
        strokeDasharray="3 3"
        vectorEffect="non-scaling-stroke"
        className="text-kh-line-strong"
      />

      <text
        x={ZONE.bis + 4}
        y={ZONE.oben + 1.2}
        fontSize={3.4}
        className="fill-kh-paper/75 font-display"
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {KOMMA.format(GROESSTMASS)}
      </text>
      <text
        x={ZONE.bis + 4}
        y={unten + 1.2}
        fontSize={3.4}
        className="fill-kh-paper/75 font-display"
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {KOMMA.format(KLEINSTMASS)}
      </text>
    </g>
  )
}
