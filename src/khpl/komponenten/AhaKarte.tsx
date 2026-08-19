import { useId, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Der gelegentliche Einwurf aus khpl-flow.md 6.4 — kurze Karte, die *nach*
 * einer Interaktion einfährt. Kein Pflichtelement: sie sitzt dort, wo sie
 * etwas umdreht, nicht auf jedem Screen.
 *
 * **Sie klappt auf, statt einfach dazustehen.** Als Absatz standen auf Screens
 * mit zwei Karten bis zu neunzig Wörter Zusatztext da, die niemand angefordert
 * hatte — bei einem Publikum, das im Vorbeigehen dreißig Sekunden investiert,
 * ist das der Punkt, an dem weggeschaut wird. Als Zeile mit Pluszeichen kostet
 * derselbe Inhalt zwei Zeilen Platz, und wer ihn liest, hat sich dafür
 * entschieden.
 *
 * Der Preis ist ein Tap. Das ist hier kein Preis, sondern der Zweck: die
 * Lese-Steps (M3, B3.1, B5.1, M6) hätten sonst überhaupt nichts zu tun.
 *
 * **Der geschlossene Streifen sieht seit dem Umbau aus wie ein Knopf**, nicht
 * wie ein Kasten mit einem Icon rechts. Er hat einen vollen orangen Rand, das
 * Pluszeichen sitzt in einem gefüllten Kreis, und beim Drücken sinkt er ein.
 * Vorher stand da ein hellgrauer Balken mit einer grauen Kleinzeile darauf —
 * das las sich wie eine Überschrift, und Überschriften tippt niemand an.
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
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.45, delay: verzoegerung, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            'shrink-0 overflow-hidden rounded-kh border-2 border-kh-orange/45 bg-kh-orange/10',
            className,
          )}
        >
          <button
            type="button"
            onClick={() => setOffen((o) => !o)}
            aria-expanded={offen}
            aria-controls={inhaltId}
            data-testid="aha-schalter"
            className="flex min-h-[60px] w-full items-center justify-between gap-3 px-4 py-3 text-left transition-transform active:scale-[0.985]"
          >
            <span className="kh-etikett">{beschriftung}</span>
            <motion.span
              aria-hidden
              animate={{ rotate: offen ? 135 : 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 22 }}
              className="grid size-9 shrink-0 place-items-center rounded-full bg-kh-orange text-[#0E0D0B]"
            >
              <Plus className="size-5" strokeWidth={3} />
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
                  className="px-4 pb-4 text-[1.0625rem] leading-[1.45] text-kh-paper/90 sm:text-[1.125rem]"
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
