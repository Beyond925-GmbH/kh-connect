import { AnimatePresence, motion } from 'motion/react'
import { cn } from '@/lib/utils'

/**
 * Der gelegentliche Einwurf aus khpl-flow.md 6.4 — kurze Karte, die *nach*
 * einer Interaktion einfährt. Kein Pflichtelement: sie sitzt dort, wo sie
 * etwas umdreht, nicht auf jedem Screen.
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
  /** Kleine Zeile über dem Text. `null` blendet sie aus. */
  eyebrow?: string | null
  /** Sekunden. Für Steps mit mehreren Karten, die nacheinander einfahren. */
  verzoegerung?: number
  className?: string
  children: React.ReactNode
}) {
  return (
    <AnimatePresence initial={false}>
      {sichtbar && (
        <motion.aside
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.42, delay: verzoegerung, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            'rounded-kh border-l-4 border-kh-orange bg-kh-band-soft px-5 py-4',
            className,
          )}
        >
          {eyebrow !== null && (
            <p className="mb-1 text-[13px] font-normal tracking-[0.14em] text-kh-orange-text uppercase">
              {eyebrow}
            </p>
          )}
          <div className="text-[16px] leading-[1.5] text-kh-ink">{children}</div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
