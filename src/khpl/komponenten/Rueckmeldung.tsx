import { AnimatePresence, motion } from 'motion/react'
import { Check, X } from 'lucide-react'

/**
 * Die Antwort der App auf eine Aktion — in M4, B4.1 und M7 dieselbe.
 *
 * Vorher war beides grau: richtig und falsch bekamen denselben blassen Balken
 * mit demselben grauen Text. Die Abnahme hat das zu Recht als das Kernproblem
 * benannt — „nichts feiert, nichts reagiert“. Für jemanden, der im Vorbeigehen
 * dreißig Sekunden investiert, ist die Rückmeldung der ganze Ertrag.
 *
 * Also: richtig fährt in Markenorange ein und macht einen kurzen Satz nach
 * oben; falsch bleibt ruhig und schüttelt einmal den Kopf. Kein Punktestand,
 * keine Note, kein Ton (flow 5 „Stumm“, 6.6 „kein Punktestand“) — nur der
 * Unterschied zwischen „das sitzt“ und „noch nicht“.
 *
 * Bei „Bewegung reduzieren“ nimmt `MotionConfig` im KioskGuard beiden
 * Varianten die Bewegung; die Farbe trägt dann allein.
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
  return (
    <AnimatePresence mode="wait" initial={false}>
      {text !== null && ok !== null && (
        <motion.p
          key={text}
          initial={ok ? { opacity: 0, y: 10, scale: 0.98 } : { opacity: 0, x: 0 }}
          animate={
            ok ? { opacity: 1, y: 0, scale: 1 } : { opacity: 1, x: [0, -7, 6, -4, 0] }
          }
          exit={{ opacity: 0 }}
          transition={
            ok
              ? { type: 'spring', stiffness: 420, damping: 22 }
              : { duration: 0.36, ease: 'easeOut' }
          }
          data-testid={testid}
          data-ok={ok}
          className={`flex items-start gap-2.5 rounded-kh px-4 py-3 text-[15px] leading-snug ${
            ok
              ? 'bg-kh-orange text-white'
              : 'border border-kh-rule bg-kh-band-soft text-kh-grey'
          }`}
        >
          <span
            aria-hidden
            className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full ${
              ok ? 'bg-white/25 text-white' : 'bg-kh-band text-kh-grey'
            }`}
          >
            {ok ? (
              <Check className="size-3.5" strokeWidth={3} />
            ) : (
              <X className="size-3.5" strokeWidth={3} />
            )}
          </span>
          <span className={ok ? 'font-normal' : ''}>{text}</span>
        </motion.p>
      )}
    </AnimatePresence>
  )
}
