import { Achse, Bild, Hilfslinie, Mass } from './Bild'
import { BEMASSUNG, KOMMA, STRICH } from './stil'
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

/**
 * Wo die Bemaßung liegt — **je Blattlage einmal.**
 *
 * Quer steht das Blatt so, wie eine Welle gezeichnet wird: Durchmesser links
 * neben dem Teil, Länge darunter, Fasenhinweis rechts. Hochkant ist genau das
 * der Grund, warum die Zeichnung im Feld schwimmt — sie ist breit, weil ihre
 * Bemaßung breit ist. Also rückt hochkant die Bemaßung nach **oben und unten**:
 * dieselben Maße, dieselben Zahlen, dieselbe Norm, nur auf die Achse verteilt,
 * die im stehenden Feld Platz hat. Der Ausschnitt wird dadurch schmaler und die
 * Zeichnung größer statt kleiner.
 */
interface Blattlage {
  /** `min-x min-y breite hoehe` in Millimetern. */
  sicht: string
  achse: readonly [number, number]
  /** Ø 20 h7: bis wohin die Maßlinie hochläuft, wo die Zahl steht, wie groß. */
  durchmesser: { leiter: number; zahl: number; grad: number }
  /** Die Länge: Maßlinie, Ende der Hilfslinien, Zahl, Schriftgrad. */
  laenge: { linie: number; hilfe: number; zahl: number; grad: number }
  /** Der Fasenhinweis: Knick, Ende der Fahne, Fuß der Zahl, Schriftgrad. */
  fase: { knick: readonly [number, number]; ende: number; zahl: number; grad: number }
}

const QUER: Blattlage = {
  sicht: '-44 -27 63 49',
  achse: [-42, 8],
  durchmesser: { leiter: -18.5, zahl: -20, grad: 4.4 },
  laenge: { linie: 18, hilfe: 20, zahl: 16.2, grad: 3.6 },
  fase: { knick: [7, 15.5], ende: 13.5, zahl: 14.1, grad: 3 },
}

/**
 * Hochkant: x ∈ [-40, 22], y ∈ [-37, 33]. Gegenüber `QUER` sechs Millimeter
 * schmaler und einundzwanzig höher — in einem Feld von rund 3 : 4 füllt das die
 * Höhe bis auf einen Rand, statt oben wie unten ein Drittel frei zu lassen.
 */
const HOCH: Blattlage = {
  sicht: '-40 -37 62 70',
  achse: [-38, 10],
  durchmesser: { leiter: -28, zahl: -30, grad: 6 },
  laenge: { linie: 27, hilfe: 29, zahl: 24.8, grad: 5 },
  fase: { knick: [6, 20], ende: 10, zahl: 18.6, grad: 3.6 },
}

/** Wo die Einzelheit auf der Kontur sitzt: mitten auf der Ø-20-Mantellinie. */
const EINZELHEIT = [-14, -NENNMASS / 2] as const
const EINZELHEIT_R = 4.2

/** Wie weit die Zeichnung auf die Einzelheit zufährt, während sie einfährt. */
const ZOOM = 4.2

/** Die Mitte einer Blattlage — dorthin legt sich die Einzelheit. */
function mitteVon(lage: Blattlage): readonly [number, number] {
  const [minX, minY, breite, hoehe] = lage.sicht.split(/\s+/).map(Number)
  return [minX + breite / 2, minY + hoehe / 2]
}

export function Zeichnung({
  massHervorgehoben = false,
  toleranzfeld = false,
}: {
  massHervorgehoben?: boolean
  toleranzfeld?: boolean
}) {
  return (
    <Bild
      viewBox={QUER.sicht}
      viewBoxHoch={HOCH.sicht}
      massstab={toleranzfeld ? ZOOM : 1}
      mitte={EINZELHEIT}
      ueber={(hoch) => (
        <Einzelheit sichtbar={toleranzfeld} mitte={mitteVon(hoch ? HOCH : QUER)} />
      )}
    >
      {(hoch) => {
        const lage = hoch ? HOCH : QUER

        return (
          <>
            {/*
              Zwei Ebenen, zwei Geschwindigkeiten im Zoom — und beide enden bei
              null.

              Die erste Fassung ließ die Zeichnung bei 0,22 stehen, damit unter
              der Einzelheit noch ein Zusammenhang zu ahnen war. Bei 4,2-fachem
              Zoom bleibt davon aber kein Zusammenhang übrig, sondern **Reste**:
              Die Einzelheit deckt die Mitte ab, und was seitlich neben ihr
              herausragt, sind zwei Stummel Mantellinie am Bildrand und, bevor
              der Rahmen kam, ein halber Riesenbuchstabe aus der Bemaßung.
              Genau das stand nach der Auflösung von Z1 dauerhaft links im Bild.

              Also verschwindet beides — die **Bemaßung zuerst** (0,3 s: sie
              wird als Erstes unlesbar groß), die **Kontur langsamer** (0,55 s
              gegen 0,7 s Fahrt: man sieht sie noch auf den Kreis zulaufen und
              in ihm aufgehen). Zwei Bewegungen, eine Aussage — nur ohne Rest.
            */}
            <g
              style={{
                opacity: toleranzfeld ? 0 : 1,
                transition: 'opacity 0.55s cubic-bezier(0.2, 0, 0, 1)',
              }}
            >
              <Achse von={lage.achse[0]} bis={lage.achse[1]} />

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

              {/* Die Kante, an der die Fase endet — sichtbar, weil das Teil
                  rund ist: aus der Fase wird im Bild ein Kreis und damit eine
                  Linie. */}
              <line
                x1={-FASE}
                y1={-NENNMASS / 2}
                x2={-FASE}
                y2={NENNMASS / 2}
                stroke="currentColor"
                strokeWidth={STRICH.fein}
                vectorEffect="non-scaling-stroke"
                className={BEMASSUNG}
              />

              {/* Der Kreis, aus dem die Einzelheit gezogen wird. Er bleibt im
                  Zoom stehen: er ist die Stelle, auf die gefahren wird. */}
              <circle
                cx={EINZELHEIT[0]}
                cy={EINZELHEIT[1]}
                r={EINZELHEIT_R}
                fill="none"
                stroke="currentColor"
                strokeWidth={STRICH.fein}
                vectorEffect="non-scaling-stroke"
                className={toleranzfeld ? 'text-kh-orange' : BEMASSUNG}
              />
            </g>

            <g
              style={{
                opacity: toleranzfeld ? 0 : 1,
                transition: 'opacity 0.3s cubic-bezier(0.2, 0, 0, 1)',
              }}
            >
              {/* -- Ø 20 h7: das Maß, um das der ganze Tag geht ------------ */}
              <Mass
                von={[-26, -NENNMASS / 2]}
                bis={[-26, NENNMASS / 2]}
                hervor={massHervorgehoben}
              />
              <line
                x1={-26}
                y1={-NENNMASS / 2}
                x2={-26}
                y2={lage.durchmesser.leiter}
                stroke="currentColor"
                strokeWidth={STRICH.fein}
                vectorEffect="non-scaling-stroke"
                className={massHervorgehoben ? 'text-kh-orange' : BEMASSUNG}
              />
              <text
                x={-26}
                y={lage.durchmesser.zahl}
                textAnchor="middle"
                fontSize={lage.durchmesser.grad}
                className={`font-display ${massHervorgehoben ? 'fill-kh-orange' : 'fill-kh-paper'}`}
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                Ø {NENNMASS} h7
              </text>

              {/* -- Länge -------------------------------------------------- */}
              <Hilfslinie
                von={[-LAENGE, NENNMASS / 2]}
                bis={[-LAENGE, lage.laenge.hilfe]}
              />
              <Hilfslinie von={[0, NENNMASS / 2]} bis={[0, lage.laenge.hilfe]} />
              <Mass von={[-LAENGE, lage.laenge.linie]} bis={[0, lage.laenge.linie]} />
              <text
                x={-LAENGE / 2}
                y={lage.laenge.zahl}
                textAnchor="middle"
                fontSize={lage.laenge.grad}
                className="fill-kh-paper/90 font-display"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {LAENGE}
              </text>

              {/* -- Fase: Hinweislinie an die Kante, wie in der Zeichnung -- */}
              <path
                d={`M ${-FASE / 2} ${NENNMASS / 2 - FASE / 2} L ${lage.fase.knick[0]} ${lage.fase.knick[1]} L ${lage.fase.ende} ${lage.fase.knick[1]}`}
                fill="none"
                stroke="currentColor"
                strokeWidth={STRICH.fein}
                vectorEffect="non-scaling-stroke"
                className={BEMASSUNG}
              />
              <circle
                cx={-FASE / 2}
                cy={NENNMASS / 2 - FASE / 2}
                r={0.55}
                className="fill-kh-mute"
              />
              <text
                x={lage.fase.knick[0]}
                y={lage.fase.zahl}
                fontSize={lage.fase.grad}
                className="fill-kh-paper/90 font-display"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {FASE} × 45°
              </text>

              <text
                x={EINZELHEIT[0]}
                y={EINZELHEIT[1] - EINZELHEIT_R - 1.6}
                textAnchor="middle"
                fontSize={3.4}
                className="fill-kh-mute font-display"
              >
                X
              </text>
            </g>
          </>
        )
      }}
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
function Einzelheit({
  sichtbar,
  mitte,
}: {
  sichtbar: boolean
  /** Die Mitte der geltenden Blattlage — hochkant eine andere als quer. */
  mitte: readonly [number, number]
}) {
  const [mx, my] = mitte
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
          className="fill-kh-paper/90 font-display"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {KOMMA.format(GROESSTMASS)}
        </text>
        <text
          x={mx - radius + 3}
          y={unten + 4.6}
          fontSize={3.6}
          className="fill-kh-paper/90 font-display"
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
        className="text-kh-mute"
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
