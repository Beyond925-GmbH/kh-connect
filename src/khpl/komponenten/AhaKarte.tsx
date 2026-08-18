import { useId, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Der gelegentliche Einwurf aus khpl-flow.md 6.4 — kurze Karte, die *nach*
 * einer Interaktion einfährt. Kein Pflichtelement: sie sitzt dort, wo sie
 * etwas umdreht, nicht auf jedem Screen.
 *
 * **Sie klappt auf, statt einfach dazustehen.** Vorher fuhr der ganze Absatz
 * von allein ein. Auf Screens mit zwei Karten standen damit bis zu neunzig
 * Wörter Zusatztext da, die niemand angefordert hatte — bei einem Publikum,
 * das im Vorbeigehen dreißig Sekunden investiert, ist das der Punkt, an dem
 * weggeschaut wird. Als Zeile mit Pluszeichen kostet derselbe Inhalt zwei
 * Zeilen Platz, und wer ihn liest, hat sich dafür entschieden.
 *
 * Der Preis ist ein Tap. Das ist hier kein Preis, sondern der Zweck: die
 * Lese-Steps (M3, B3.1, B5.1, M6) hatten sonst überhaupt nichts zu tun.
 *
 * Das Framing ist die Belohnung, nicht die Ansage (khpl-ui-shell.md 5) —
 * deshalb hat die Komponente kein `sichtbar`-Default: der Step entscheidet
 * bewusst, wann sie kommt.
 */
export function AhaKarte({
  sichtbar,
  eyebrow = 'Übrigens',
  verzoegerung = 0,
  className,
  children,
}: {
  sichtbar: boolean
  /**
   * Die Zeile auf dem geschlossenen Streifen — sie muss neugierig machen,
   * ohne die Pointe zu verraten. `null` fällt auf „Übrigens“ zurück: ein
   * Streifen ganz ohne Beschriftung wäre nicht antippbar, weil nichts
   * dransteht.
   */
  eyebrow?: string | null
  /** Sekunden. Für Steps mit mehreren Karten, die nacheinander einfahren. */
  verzoegerung?: number
  className?: string
  children: React.ReactNode
}) {
  const [offen, setOffen] = useState(false)
  const inhaltId = useId()
  const beschriftung = eyebrow ?? 'Übrigens'

  return (
    <AnimatePresence initial={false}>
      {sichtbar && (
        <motion.aside
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.42, delay: verzoegerung, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            'overflow-hidden rounded-kh border-l-4 border-kh-orange bg-kh-band-soft',
            className,
          )}
        >
          <button
            type="button"
            onClick={() => setOffen((o) => !o)}
            aria-expanded={offen}
            aria-controls={inhaltId}
            data-testid="aha-schalter"
            className="flex min-h-[56px] w-full items-center justify-between gap-3 px-5 py-3 text-left transition-colors hover:bg-kh-band"
          >
            <span className="kh-eyebrow">{beschriftung}</span>
            <motion.span
              aria-hidden
              animate={{ rotate: offen ? 45 : 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="grid size-8 shrink-0 place-items-center rounded-full bg-kh-orange text-white"
            >
              <Plus className="size-5" strokeWidth={2.25} />
            </motion.span>
          </button>

          <AnimatePresence initial={false}>
            {offen && (
              <motion.div
                id={inhaltId}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              >
                <div
                  data-auswaehlbar
                  className="px-5 pb-4 text-[1.0625rem] leading-[1.5] text-kh-ink sm:text-[1.125rem]"
                >
                  {children}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
