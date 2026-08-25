import { Bild } from './Bild'
import { BAUTEIL, STRICH } from './stil'
import { FASE, LAENGE, NENNMASS } from './kanon'

/**
 * Z6 — die Sichtkiste, und **eins ist markiert.**
 *
 * „Sie füllt sich, während man hinsieht — die Maschine läuft weiter, auch ohne
 * den Besucher“ (khpl-tag-zerspanung.md §6 Z6). Deshalb kommen die Teile
 * gestaffelt herein und nicht auf einen Schlag: Der Screen zeigt nicht einen
 * Füllstand, er zeigt ein Füllen.
 *
 * ⚠️ **Der Füllstand kommt vom Step, nicht von einer Uhr in der Bühne.** Wenn
 * Z6 die Kiste weiter volllaufen lassen will, hebt er `fuellstand` — eine
 * Bühne, die von sich aus weiterzählt, würde jeden Wert überschreiben, den der
 * Step setzt, und wäre beim Zurückspringen an einer anderen Stelle als der
 * Fortschritt.
 *
 * **Die Zahl 400 steht hier nicht.** Sie ist ein Rechenbeispiel und keine
 * Branchenzahl (§6 Z6, `belege/zerspanung.md` 8); der Fachtext im Panel darf
 * sie als solches benutzen, die Bühne zählt nichts vor. Was sie zeigt, ist die
 * tragfähige Fassung: eine Kiste, die voller wird, und darin das erste Stück.
 */

/** x ∈ [-14, 104], y ∈ [-6, 76]. Platz links für die Fahne an Nr. 1. */
const SICHT = '-14 -6 118 82'

/**
 * Fürs stehende Feld: x ∈ [-6, 98], y ∈ [-18, 78].
 *
 * Quer steht die Kiste rechts neben dem Panel in einem stehenden Streifen,
 * und dort bindet die Breite. Die acht Millimeter, die die Fahne links
 * braucht, kosten in diesem Feld ein Achtel der Zeichnungsgröße — deshalb
 * wandert die Fahne hier nach **oben**, in die Höhe, die das liegende Format
 * der Kiste ohnehin frei lässt, und der Ausschnitt wird schmaler statt
 * breiter. Ohne diese Lage war die Kiste die einzige Ansicht des Tages mit
 * nur einem Blatt.
 */
const SICHT_HOCH = '-6 -18 104 96'

/**
 * Drei mal vier Plätze. Mehr wären Streusel — und ein Teil, das man nicht als
 * Drehteil erkennt, ist auf diesem Screen kein Teil, sondern Muster.
 */
const SPALTEN = 3
const REIHEN = 4
const PLAETZE = SPALTEN * REIHEN

/** Ein Teil im Kasten, im selben Längenverhältnis wie das echte. */
const TEIL_H = 12
const TEIL_L = (TEIL_H * LAENGE) / NENNMASS
const TEIL_FASE = (TEIL_H * FASE) / NENNMASS

const SPALTE_X = 17
const SPALTE_ABSTAND = 22
const REIHE_Y = 52
const REIHE_ABSTAND = 14

export function Kiste({ fuellstand = 0 }: { fuellstand?: number }) {
  const anzahl = Math.round(Math.max(0, Math.min(1, fuellstand)) * PLAETZE)

  return (
    <Bild viewBox={SICHT} viewBoxHoch={SICHT_HOCH}>
      {(hoch) => (
        <>
          {/* Der Kasten. Durchsichtig, deshalb sieht man, wie viel drin ist —
          das ist der ganze Grund, warum es eine Sichtkiste ist. */}
          <path
            d="M 8 6 L 92 6 L 84 68 L 16 68 Z"
            className="fill-kh-paper/8 stroke-kh-paper/80"
            strokeWidth={STRICH.voll}
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d="M 4 -1 L 96 -1 L 92 7 L 8 7 Z"
            className={BAUTEIL}
            strokeWidth={STRICH.voll}
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />

          {Array.from({ length: PLAETZE }, (_, i) => {
            const spalte = i % SPALTEN
            const reihe = Math.floor(i / SPALTEN)
            const x = SPALTE_X + spalte * SPALTE_ABSTAND
            const y = REIHE_Y - reihe * REIHE_ABSTAND
            const drin = i < anzahl
            const deins = i === 0

            return (
              <g
                key={i}
                style={{
                  opacity: drin ? 1 : 0,
                  transform: `translate(0, ${drin ? 0 : -9}px)`,
                  transformBox: 'view-box',
                  transitionProperty: 'opacity, transform',
                  transitionDuration: '0.32s',
                  transitionTimingFunction: 'cubic-bezier(0.2, 0, 0, 1)',
                  transitionDelay: `${i * 0.07}s`,
                }}
              >
                <path
                  d={teilPfad(x, y)}
                  className={deins ? 'fill-kh-signal/20 stroke-kh-signal' : BAUTEIL}
                  strokeWidth={STRICH.voll}
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              </g>
            )
          })}

          {/* Nr. 1. Das erste Teil des Tages, und das einzige, das jemand
          angefasst hat, der heute zum ersten Mal an einer Maschine stand.
          Quer zeigt die Fahne nach links, im stehenden Feld nach oben — dort
          läuft der Anschluss durch die offene Kiste, an der Wand entlang und
          links an den Teilen vorbei; durch Glas darf er, dafür ist es Glas. */}
          <g
            className="text-kh-signal"
            style={{
              opacity: anzahl > 0 ? 1 : 0,
              transition: 'opacity 0.4s 0.5s cubic-bezier(0.2, 0, 0, 1)',
            }}
          >
            {hoch ? (
              <line
                x1={6}
                y1={-8}
                x2={SPALTE_X}
                y2={REIHE_Y + TEIL_H / 2}
                stroke="currentColor"
                strokeWidth={STRICH.fein}
                vectorEffect="non-scaling-stroke"
              />
            ) : (
              <line
                x1={SPALTE_X}
                y1={REIHE_Y + TEIL_H / 2}
                x2={-4}
                y2={REIHE_Y + TEIL_H / 2}
                stroke="currentColor"
                strokeWidth={STRICH.fein}
                vectorEffect="non-scaling-stroke"
              />
            )}
            <circle cx={SPALTE_X} cy={REIHE_Y + TEIL_H / 2} r={1.3} fill="currentColor" />
            <text
              x={hoch ? 0 : -12}
              y={hoch ? -10 : REIHE_Y + TEIL_H / 2 - 2.6}
              fontSize={7}
              fill="currentColor"
              className="font-display"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              Nr. 1
            </text>
          </g>

          {/* Der Boden, auf dem die Kiste steht. Hallenlicht, kein Feierabendlicht:
          draußen ist es hell oder dunkel, und in der Halle merkt man es nicht. */}
          <line
            x1={-6}
            y1={68}
            x2={98}
            y2={68}
            stroke="currentColor"
            strokeWidth={STRICH.voll}
            vectorEffect="non-scaling-stroke"
            className="text-kh-mute/70"
          />
        </>
      )}
    </Bild>
  )
}

/** Ein Drehteil von der Seite: hinten stumpf, vorn die Fase aus `kanon.ts`. */
function teilPfad(x: number, y: number): string {
  return [
    `M ${x} ${y}`,
    `L ${x + TEIL_L - TEIL_FASE} ${y}`,
    `L ${x + TEIL_L} ${y + TEIL_FASE}`,
    `L ${x + TEIL_L} ${y + TEIL_H - TEIL_FASE}`,
    `L ${x + TEIL_L - TEIL_FASE} ${y + TEIL_H}`,
    `L ${x} ${y + TEIL_H}`,
    'Z',
  ].join(' ')
}
