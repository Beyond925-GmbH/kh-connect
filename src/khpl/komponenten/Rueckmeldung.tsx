import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Check, X } from 'lucide-react'

/**
 * Die Antwort der App auf eine Aktion — in M4, B4.1 und M7 dieselbe.
 *
 * Für jemanden, der im Vorbeigehen dreißig Sekunden investiert, ist die
 * Rückmeldung der ganze Ertrag. Deshalb sind die beiden Fälle hier nicht zwei
 * Graustufen, sondern zwei verschiedene Ereignisse:
 *
 * **Richtig** kommt in Warnwestengelb, springt einmal über, und das Häkchen
 * dreht sich dabei ein. Gelbgrün ist im ganzen System für genau das
 * reserviert — es taucht sonst nirgends als Fläche auf, und deshalb heißt es
 * hier etwas.
 *
 * **Falsch** bleibt ruhig: dunkler Grund, oranger Rand, ein einzelnes
 * Kopfschütteln. Kein Rot. Rot bewertet, und bewertet wird hier nicht (flow
 * 6.6 — kein Punktestand, keine Note). Ein falscher Zuschnitt ist kein Fehler
 * des Besuchers, sondern die Lektion des Screens.
 *
 * Kein Ton (flow 5 „Stumm“). Bei „Bewegung reduzieren“ nimmt `MotionConfig` im
 * KioskGuard beiden Varianten die Bewegung; die Farbe trägt dann allein.
 *
 * **Sie holt sich selbst ins Bild.** Seit die auslösende Handlung im
 * angehefteten Fuß sitzt („Schnitt setzen“), kann die Antwort darauf weiter oben
 * im scrollenden Teil des Panels liegen — auf M4 lag sie unterhalb der Kante.
 * Ein Knopf, dessen Wirkung man nicht sieht, ist schlimmer als keiner. `nearest`
 * scrollt dabei nur so weit wie nötig und reißt den Rest der Übung nicht weg.
 */
export function Rueckmeldung({
  ok,
  text,
  testid,
}: {
  /** `null` = noch keine Rückmeldung. */
  ok: boolean | null
  text: string | null
  testid?: string
}) {
  const anker = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (text === null || ok === null) return
    anker.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [text, ok])

  return (
    <div ref={anker}>
      <AnimatePresence mode="wait" initial={false}>
        {text !== null && ok !== null && (
          <motion.p
            key={text}
            initial={ok ? { opacity: 0, y: 14, scale: 0.94 } : { opacity: 0, x: 0 }}
            animate={
              ok ? { opacity: 1, y: 0, scale: 1 } : { opacity: 1, x: [0, -9, 8, -5, 0] }
            }
            exit={{ opacity: 0, scale: 0.97 }}
            transition={
              ok
                ? { type: 'spring', stiffness: 440, damping: 20 }
                : { duration: 0.38, ease: 'easeOut' }
            }
            data-testid={testid}
            data-ok={ok}
            className={`flex items-start gap-3 rounded-kh px-4 py-3.5 text-[1.0625rem] leading-snug ${
              ok
                ? 'bg-kh-signal font-semibold text-[#0E0D0B]'
                : 'border-2 border-kh-orange/45 bg-kh-orange/10 text-kh-paper/90'
            }`}
          >
            <motion.span
              aria-hidden
              initial={ok ? { rotate: -120, scale: 0.4 } : false}
              animate={ok ? { rotate: 0, scale: 1 } : {}}
              transition={{ type: 'spring', stiffness: 400, damping: 16, delay: 0.06 }}
              className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full ${
                ok ? 'bg-[#0E0D0B] text-kh-signal' : 'bg-kh-orange text-[#0E0D0B]'
              }`}
            >
              {ok ? (
                <Check className="size-4" strokeWidth={3.5} />
              ) : (
                <X className="size-4" strokeWidth={3.5} />
              )}
            </motion.span>
            <span>{text}</span>
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
