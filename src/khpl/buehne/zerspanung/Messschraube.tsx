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

/**
 * x ∈ [0, 116], y ∈ [-28, 44]. Eigene Welt: hier ist ein Millimeter groß.
 * Rechts steht der Weg mit drin, den die Trommel beim Aufdrehen zurücklegt.
 */
const SICHT = '0 -28 116 72'

/**
 * Hochkant: x ∈ [0, 113], y ∈ [-44, 44].
 *
 * Eine Mikrometerschraube ist ein liegendes Gerät; im stehenden Feld blieb sie
 * auf halber Breite stehen und ließ oben wie unten ein Drittel leer. Was
 * dagegen hilft, ist Bühne, keine Aussage: die **Toleranzzone rückt nach
 * oben**, in die Höhe, die sonst niemand benutzt — sie ist ohnehin stark
 * überhöht; wie hoch sie über der Fläche schwebt, ist keine Zahl, sondern
 * Platz.
 *
 * **Rechts endet der Ausschnitt hinter der offenen Ratsche** (sie steht bei
 * maximal geöffneter Spindel bei x ≈ 112). Die Vorfassung schnitt bei 106 und
 * ließ die Trommel „von der Kante her ins Bild fahren“ — auf dem Schirm las
 * sich das aber nicht als Fahrt, sondern als angeschnittenes Gerät: Der erste
 * Blick trifft immer den offenen Zustand, und da fehlte die halbe Ratsche.
 * Beim Zudrehen fährt sie jetzt nach links und lässt rechts Luft zurück.
 */
const SICHT_HOCH = '0 -44 113 88'

const TEIL = [24, 0] as const
const TEIL_R = NENNMASS / 2

/** Trommelmitte und -radius im Seitenriss. */
const TROMMEL = { x1: 74, x2: 96, r: 10.5 }

/** Steigung der Messspindel: eine Umdrehung, ein halber Millimeter. */
const STEIGUNG = 0.5

/**
 * Wo die Toleranzzone über dem Teil liegt und wie hoch sie gezeichnet wird.
 *
 * **Sie liegt über der Schraube, nicht in ihr.** In der ersten Fassung stand
 * sie so dicht am Teil, dass der Balken den Rohling schnitt und die beiden
 * Marken über der Skalentrommel lagen — der Beleg für „die Zahl liegt drin“
 * kreuzte ausgerechnet die Kontur, um die es geht. Zwischen Teilkante
 * (`-TEIL_R`) und Zonenunterkante bleibt jetzt ein Streifen frei, den die
 * gestrichelte Hinweislinie überbrückt.
 *
 * **`von` steht bei 14 und nicht mehr bei 9.** Die Marke des Messwerts läuft
 * vier Millimeter über die Zone hinaus nach links; bei 9 begann sie damit bei
 * 5, also am Rand des Ausschnitts, und sah aus wie angeschnitten. Jetzt liegt
 * zwischen Band und Bühnenkante eine Handbreit, und die Zone beginnt genau über
 * der linken Teilkante (`TEIL[0] − TEIL_R` = 14), auf die sie sich bezieht.
 */
interface Zone {
  oben: number
  hoch: number
  von: number
  bis: number
  /** Schriftgrad von Größt- und Kleinstmaß neben dem Band. */
  grad: number
}

const ZONE_QUER: Zone = { oben: -23, hoch: 6, von: 14, bis: 44, grad: 3.4 }
/** Hochkant sitzt dieselbe Zone höher und trägt größere Zahlen. */
const ZONE_HOCH: Zone = { oben: -37, hoch: 8, von: 14, bis: 44, grad: 4.2 }

/**
 * Wie weit die Marke außerhalb der Zone laufen darf, in Zeichnungseinheiten.
 * Weiter oben endet die Ansicht (`SICHT` beginnt bei −28), weiter unten fängt
 * das Teil an.
 */
const MARKE_UEBERSTAND = 4

/**
 * Um wie viel der Weg der Messspindel überhöht wird.
 *
 * Zwischen offener Anzeige (20,590) und Endwert (19,987) liegen sechs
 * Zehntelmillimeter. Maßstäblich sind das auf einem Ø-20-Teil rund fünf
 * Bildschirmpunkte — die Schraube stünde vor und nach dem Zudrehen an
 * derselben Stelle, und die Handlung „dreh sie zu“ lebte allein von der
 * Ziffernanzeige. Überhöht ist sie sichtbar. Dieselbe Ehrlichkeit wie beim
 * Toleranzfeld in Z1: gezeigt wird die **Bewegung**, nicht ihr Maß.
 */
const SPINDEL_UEBERHOEHT = 14

export function Messschraube({
  messwert = NENNMASS,
  toleranzUeberlagerung = false,
  korrigiert = false,
}: {
  messwert?: number
  toleranzUeberlagerung?: boolean
  korrigiert?: boolean
}) {
  /**
   * Wie weit Spindel und Trommel noch offen stehen — überhöht, siehe
   * `SPINDEL_UEBERHOEHT`. Unter dem Nennmaß liegt die Spindel an; weiter kann
   * sie nicht, dort ist das Teil.
   */
  const offen = Math.max(0, (messwert - NENNMASS) * SPINDEL_UEBERHOEHT)

  return (
    <Bild viewBox={SICHT} viewBoxHoch={SICHT_HOCH}>
      {(hoch) => (
        <>
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
          {/*
            Die Messspindel. Sie ist das eine Bauteil, das beim Zudrehen wandert —
            zusammen mit Trommel und Ratsche weiter unten, und **ohne** die
            Skalenhülse, die zum Bügel gehört. Der Weg ist überhöht
            (`SPINDEL_UEBERHOEHT`): sechs Zehntel wären auf dieser Bühne fünf
            Bildschirmpunkte, und ein Zudrehen, das man nicht sieht, ist keins.
          */}
          <g transform={`translate(${offen} 0)`}>
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
          </g>

          {/*
            Das Teil, von der Stirnseite: der Durchmesser, um den es geht.

            **Es darf nicht aussehen wie das Gerät.** In der ersten Fassung war es
            derselbe `kh-raised`-Grund mit derselben hellen Kante wie Amboss,
            Spindel und Bügel — zwischen zwei Klötzen lag ein dritter Klotz, und
            „dreh sie zu, bis sie anliegt“ hatte optisch kein Gegenüber. Jetzt trägt
            es eine deutlich hellere Fläche und die kräftigste Kante der Bühne: das
            Gerät ist Werkzeug, das Teil ist die Sache. Dieselbe Rangfolge, mit der
            Z1 die Kontur von der Bemaßung trennt.
          */}
          <circle
            cx={TEIL[0]}
            cy={TEIL[1]}
            r={TEIL_R}
            className="fill-kh-paper/20 stroke-kh-paper"
            strokeWidth={STRICH.voll * 1.35}
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
            className="text-kh-paper/75"
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
            className="text-kh-paper/80"
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
              className="text-kh-paper/80"
            />
          ))}

          {/* Skalentrommel und Ratsche — sie wandern über die feste Hülse, und
            genau das ist die Anzeige. */}
          <g transform={`translate(${offen} 0)`}>
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
          </g>

          <Toleranzzone
            wert={messwert}
            zone={hoch ? ZONE_HOCH : ZONE_QUER}
            sichtbar={toleranzUeberlagerung || korrigiert}
            gut={korrigiert}
          />
        </>
      )}
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
  zone,
  sichtbar,
  gut,
}: {
  wert: number
  zone: Zone
  sichtbar: boolean
  gut: boolean
}) {
  const unten = zone.oben + zone.hoch
  // Überhöhung: die ganze Zone ist `zone.hoch` hoch, also liegt ein Wert um
  // `hoch / TOLERANZ` je Millimeter daneben. Gekappt, damit ein weit
  // danebenliegender Wert nicht aus dem Bild fährt.
  const lage = Math.max(
    zone.oben - MARKE_UEBERSTAND,
    Math.min(
      unten + MARKE_UEBERSTAND,
      zone.oben + ((GROESSTMASS - wert) / TOLERANZ) * zone.hoch,
    ),
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
        x={zone.von}
        y={zone.oben}
        width={zone.bis - zone.von}
        height={zone.hoch}
        className="fill-kh-signal/14"
      />
      {[zone.oben, unten].map((y, i) => (
        <line
          key={y}
          x1={zone.von}
          y1={y}
          x2={zone.bis}
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
          x1={zone.von - 4}
          y1={lage}
          x2={zone.bis}
          y2={lage}
          stroke="currentColor"
          strokeWidth={STRICH.voll}
          vectorEffect="non-scaling-stroke"
          style={{ transition: 'none' }}
        />
        <polygon
          points={`${zone.bis},${lage} ${zone.bis - 3.4},${lage - 1.9} ${zone.bis - 3.4},${lage + 1.9}`}
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
        className="text-kh-mute"
      />

      <text
        x={zone.bis + 4}
        y={zone.oben + 1.2}
        fontSize={zone.grad}
        className="fill-kh-paper/90 font-display"
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {KOMMA.format(GROESSTMASS)}
      </text>
      <text
        x={zone.bis + 4}
        y={unten + 1.2}
        fontSize={zone.grad}
        className="fill-kh-paper/90 font-display"
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {KOMMA.format(KLEINSTMASS)}
      </text>
    </g>
  )
}
