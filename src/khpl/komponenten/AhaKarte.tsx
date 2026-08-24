import { useId, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { HelpCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Der gelegentliche Einwurf aus khpl-flow.md 6.4 — jetzt als **Einblendung
 * über der Bühne**, nicht mehr als Kasten im Panel.
 *
 * **Warum der Umbau.** Die Karte war zuletzt ein oranger Aufklapp-Streifen
 * unten im Panel: Etikett links, Pluszeichen rechts. Am Stand hat sie
 * praktisch niemand angetippt. Sie stand dort, wo der Screen ohnehin schon zu
 * Ende gelesen war, sie sah aus wie eine Überschrift, und sie machte das Panel
 * bei jedem gelösten Schritt eine Zeile höher — ausgerechnet in dem Moment, in
 * dem der Screen fertig sein sollte.
 *
 * Jetzt kommt sie **hereingeflogen**, sobald der Moment da ist: eine schmale
 * Sprechblase mit einem Fragezeichen und genau einer Zeile — der Frage, nicht
 * der Antwort. Wer sie antippt, klappt die Antwort auf; wer sie ignoriert,
 * verliert nichts. Sie liegt oberhalb des Panels und wächst nach **oben** in
 * die Bühne hinein, nicht in den Text hinunter.
 *
 * Drei Regeln, die den Unterschied machen:
 *
 *  1. **Nur die Frage steht draußen.** Nicht der Inhalt, nicht ein Etikett.
 *     Ein Streifen, auf dem „Übrigens“ steht, verspricht nichts.
 *  2. **Das Fragezeichen ist die Einladung.** Ein rundes, gefülltes Zeichen
 *     links vor der Zeile — dasselbe Signal wie bei den Begriffs-Popovern,
 *     also schon gelernt, wenn die erste Karte kommt.
 *  3. **Sie lässt sich wegtippen.** Was aufgeklappt war, darf zu; was zu war,
 *     bleibt liegen. Nichts an ihr blockiert den Weg nach vorn.
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
   * Die eine Zeile, die draußen steht. Sie muss neugierig machen, ohne die
   * Pointe zu verraten — sie ist der ganze Grund, warum jemand tippt.
   */
  eyebrow?: string | null
  /** Sekunden. Für Steps mit mehreren Karten, die nacheinander einfahren. */
  verzoegerung?: number
  className?: string
  children: React.ReactNode
}) {
  const [offen, setOffen] = useState(false)
  const [weg, setWeg] = useState(false)
  const inhaltId = useId()
  const frage = eyebrow ?? 'Übrigens'

  return (
    <AnimatePresence initial={false}>
      {sichtbar && !weg && (
        <motion.aside
          // `layout` trägt den Übergang von der Blase zur Karte: Breite und
          // Höhe ändern sich beide, und ohne Layout-Animation ist das ein
          // Sprung mitten in der Bewegung, die gerade eingeladen hat.
          layout
          initial={{ opacity: 0, y: 14, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{
            duration: 0.42,
            delay: verzoegerung,
            ease: [0.22, 1, 0.36, 1],
            layout: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
          }}
          data-testid="aha"
          data-offen={offen}
          className={cn(
            // Eigener, deutlich hellerer Grund als das Panel: sie schwebt über
            // der Bühne und muss dort auch auf einem hellen Foto stehen.
            'pointer-events-auto w-fit max-w-full origin-bottom-left overflow-hidden rounded-kh-lg border-2 border-kh-orange/60 bg-[#1B1509]/92 shadow-[0_18px_50px_rgba(0,0,0,0.55)] backdrop-blur-md',
            className,
          )}
        >
          {/* `layout="position"` an den Kindern: die Hülle darf ihre Größe
              animieren, ihr Inhalt darf dabei nicht mitskaliert werden —
              sonst zieht sich die Schrift während des Aufklappens in die
              Breite. */}
          <motion.div layout="position" className="flex items-start">
            <button
              type="button"
              onClick={() => setOffen((o) => !o)}
              aria-expanded={offen}
              aria-controls={inhaltId}
              data-testid="aha-schalter"
              className="flex min-h-[56px] flex-1 items-center gap-3 py-2.5 pr-4 pl-3 text-left transition-transform active:scale-[0.985]"
            >
              <motion.span
                aria-hidden
                animate={offen ? {} : { scale: [1, 1.14, 1] }}
                transition={{
                  duration: 1.6,
                  repeat: offen ? 0 : Infinity,
                  repeatDelay: 2.4,
                }}
                className="grid size-9 shrink-0 place-items-center rounded-full bg-kh-orange text-[#0E0D0B]"
              >
                <HelpCircle className="size-5" strokeWidth={2.75} />
              </motion.span>
              <span className="min-w-0 text-[1.0625rem] leading-snug font-semibold text-balance text-kh-paper">
                {frage}
              </span>
            </button>

            {/* Erst wenn sie offen ist, gibt es ein Schließen — vorher wäre ein
                X neben einer Frage die Einladung, sie loszuwerden. */}
            {offen && (
              <button
                type="button"
                onClick={() => setWeg(true)}
                aria-label="Einwurf schließen"
                data-testid="aha-schliessen"
                className="grid size-[52px] shrink-0 place-items-center text-kh-paper/45 transition-transform active:scale-90"
              >
                <X className="size-5" strokeWidth={2.5} />
              </button>
            )}
          </motion.div>

          <AnimatePresence initial={false}>
            {offen && (
              <motion.div
                id={inhaltId}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.div
                  layout="position"
                  data-auswaehlbar
                  className="max-w-[46ch] px-4 pt-0.5 pb-4 text-[1.0625rem] leading-[1.45] text-kh-paper/90 sm:text-[1.125rem]"
                >
                  {children}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
