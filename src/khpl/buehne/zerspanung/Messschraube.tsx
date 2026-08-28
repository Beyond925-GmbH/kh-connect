import { motion } from 'motion/react'
import { Bild } from './Bild'
import { STAHL, TEIL, mm, type MessungZustand } from './kanon'

/**
 * Z4 — **die Bügelmessschraube.** Das Werkzeug, an dem dieser Beruf hängt:
 * nicht die Maschine entscheidet, ob ein Teil gut ist, sondern die Messung.
 *
 * Gezeigt wird der Bolzen im Querschnitt zwischen Amboss und Messspindel;
 * die Spindel fährt zu, wenn gemessen wird, und die digitale Anzeige trägt
 * den Wert. Eine digitale Schraube, keine Skalentrommel — so sehen die
 * Messmittel in einer heutigen Fertigung aus, und ein Wert, den man ablesen
 * kann, ist hier der Inhalt des Screens.
 */

/** Messachse. */
const ACHSE = 96

/** Querschnitt des Lagersitzes: Ø 25 im Maßstab der Bühne. */
const R = (TEIL.sitzDurchmesser / 2) * 3.2
const TEIL_X = 152

/** Amboss-Fläche links, Spindel-Fläche rechts — geschlossen. */
const AMBOSS = TEIL_X - R
const SPINDEL = TEIL_X + R

/** Wie weit die Spindel offen steht, bevor gemessen wird. */
const OFFEN = 26

export function Messschraube({ zustand }: { zustand: MessungZustand }) {
  const { wert, misst } = zustand
  const zu = misst || wert !== null

  return (
    <Bild testid="messschraube-buehne">
      {() => (
        <svg
          viewBox="0 0 320 240"
          preserveAspectRatio="xMidYMid meet"
          className="size-full"
        >
          <defs>
            {/* Schraffur für den Querschnitt — so zeichnet man geschnittenes
                Material, und so sieht der Bolzen nach Teil aus, nicht nach
                Kreis. */}
            <pattern
              id="z4-schraffur"
              width="7"
              height="7"
              patternTransform="rotate(45)"
              patternUnits="userSpaceOnUse"
            >
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="7"
                stroke={STAHL.linieMatt}
                strokeWidth="1.4"
              />
            </pattern>
          </defs>

          {/* Der Bügel: das C, das alles trägt. */}
          <path
            d={[
              `M ${AMBOSS - 22} ${ACHSE - 22}`,
              `h 26 v 44 h -14`,
              `C ${AMBOSS - 34} ${ACHSE + 78}, ${TEIL_X - 40} ${ACHSE + 104}, ${TEIL_X + 18} ${ACHSE + 104}`,
              `C ${SPINDEL + 52} ${ACHSE + 104}, ${SPINDEL + 68} ${ACHSE + 62}, ${SPINDEL + 64} ${ACHSE + 20}`,
              `l -20 2`,
              `C ${SPINDEL + 60} ${ACHSE + 52}, ${SPINDEL + 42} ${ACHSE + 84}, ${TEIL_X + 16} ${ACHSE + 84}`,
              `C ${TEIL_X - 30} ${ACHSE + 84}, ${AMBOSS - 20} ${ACHSE + 64}, ${AMBOSS - 8} ${ACHSE + 26}`,
              `h -14 Z`,
            ].join(' ')}
            fill={STAHL.flaeche}
            stroke={STAHL.linieMatt}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Amboss — die feste Messfläche links. */}
          <rect
            x={AMBOSS - 16}
            y={ACHSE - 13}
            width="16"
            height="26"
            rx="2"
            fill={STAHL.blank}
            stroke={STAHL.linie}
            strokeWidth="1.5"
          />

          {/* Der Bolzen im Querschnitt, mit Schraffur und Glanzkante. */}
          <circle
            cx={TEIL_X}
            cy={ACHSE}
            r={R}
            fill={STAHL.tiefe}
            stroke={STAHL.linie}
            strokeWidth="2"
          />
          <circle
            cx={TEIL_X}
            cy={ACHSE}
            r={R - 1.5}
            fill="url(#z4-schraffur)"
            opacity="0.5"
          />
          <path
            d={`M ${TEIL_X - R * 0.62} ${ACHSE - R * 0.62} A ${R * 0.88} ${R * 0.88} 0 0 1 ${TEIL_X + R * 0.3} ${ACHSE - R * 0.83}`}
            fill="none"
            stroke={STAHL.glanz}
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.55"
          />

          {/* Spindel, Skalenhülse und Ratsche — die ganze rechte Seite fährt
              beim Messen zu. Die Ratsche ist der Grund, warum zwei Menschen
              dasselbe messen: sie begrenzt die Kraft. */}
          <motion.g
            initial={false}
            animate={{ x: zu ? 0 : OFFEN }}
            transition={{ duration: misst ? 1.1 : 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <rect
              x={SPINDEL}
              y={ACHSE - 7}
              width="52"
              height="14"
              rx="2"
              fill={STAHL.blank}
              stroke={STAHL.linie}
              strokeWidth="1.5"
            />
            <rect
              x={SPINDEL + 50}
              y={ACHSE - 17}
              width="46"
              height="34"
              rx="4"
              fill={STAHL.flaeche}
              stroke={STAHL.linie}
              strokeWidth="1.5"
            />
            {/* Rändelung der Trommel. */}
            {Array.from({ length: 6 }, (_, i) => (
              <line
                key={i}
                x1={SPINDEL + 56 + i * 7}
                y1={ACHSE - 17}
                x2={SPINDEL + 56 + i * 7}
                y2={ACHSE + 17}
                stroke={STAHL.linieMatt}
                strokeWidth="1"
              />
            ))}
            <rect
              x={SPINDEL + 96}
              y={ACHSE - 10}
              width="18"
              height="20"
              rx="3"
              fill={STAHL.flaeche}
              stroke={STAHL.linie}
              strokeWidth="1.5"
            />
          </motion.g>

          {/* Die Anzeige, unten auf dem Bügel. */}
          <g data-testid="messschraube-anzeige">
            <rect
              x={TEIL_X - 46}
              y={ACHSE + 40}
              width="92"
              height="34"
              rx="6"
              fill="#0b0e11"
              stroke={STAHL.linieMatt}
              strokeWidth="1.5"
            />
            <motion.text
              key={wert === null ? 'leer' : mm(wert)}
              x={TEIL_X + 24}
              y={ACHSE + 64}
              textAnchor="end"
              fontSize="19"
              fontWeight="700"
              fill={wert === null ? STAHL.linieMatt : STAHL.glanz}
              style={{ fontVariantNumeric: 'tabular-nums' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: wert !== null && misst ? 1.0 : 0 }}
            >
              {wert === null ? '--,--' : mm(wert)}
            </motion.text>
            <text x={TEIL_X + 30} y={ACHSE + 63} fontSize="9" fill={STAHL.linieMatt}>
              mm
            </text>
          </g>
        </svg>
      )}
    </Bild>
  )
}
