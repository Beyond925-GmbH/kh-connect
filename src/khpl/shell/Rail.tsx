import { motion } from 'motion/react'
import { HAUPTSCHRITTE, railIndex } from '@/khpl/flow/steps'
import { wegzustand } from '@/khpl/flow/uebergaenge'
import type { Fortschritt } from '@/khpl/store/fortschritt'

/**
 * Die Progress-Rail aus khpl-ui-shell.md 4 — ein Segment pro **Hauptschritt**.
 * Abstecher bekommen kein Segment; sie erscheinen nur im Sheet „Dein Weg“.
 *
 * Die Segmentzahl kommt aus `HAUPTSCHRITTE.length`, nie aus einer Konstanten
 * (ui-shell 9, Punkt 1). Ein Tap öffnet S3.
 *
 * **Der Zählstand ist jetzt das lauteste Element der Leiste.** Vorher stand
 * dort „4 / 10“ in 15 px Barlow 200 neben zehn 10-px-Strichen; das einzige
 * Element, das „du kommst voran“ sagt, war das unauffälligste auf dem Screen.
 * Jetzt trägt die Ziffer Anton und ist so groß wie ein Knopf — und die
 * Segmente sind Blöcke, keine Striche. Zurückgelegtes ist Orange, das
 * aktuelle Segment glüht, alles davor liegt als leere Kerbe da.
 *
 * Die Leiste schwebt seit dem Umbau über der Bühne und hat keinen eigenen
 * Grund. Deshalb sitzt die ganze Rail auf einer eigenen dunklen Pille: auf
 * einem hellen Foto wäre sie sonst weg.
 */
export function Rail({
  fortschritt,
  onOeffnen,
}: {
  fortschritt: Fortschritt
  onOeffnen: () => void
}) {
  const jetzt = railIndex(fortschritt.currentStepId)
  const gesamt = HAUPTSCHRITTE.length

  return (
    <button
      type="button"
      onClick={onOeffnen}
      data-testid="rail"
      aria-label={`Dein Weg öffnen — Schritt ${jetzt + 1} von ${gesamt}`}
      className="group flex h-[52px] min-w-0 shrink items-center gap-3 rounded-kh-pill bg-black/35 pr-4 pl-3 backdrop-blur-md transition-transform active:scale-95"
    >
      <span className="flex items-baseline gap-0.5 font-display leading-none">
        <motion.span
          key={jetzt}
          initial={{ y: -8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="text-[1.75rem] text-kh-orange tabular-nums"
        >
          {jetzt + 1}
        </motion.span>
        <span className="text-[1.125rem] text-kh-paper/45 tabular-nums">/{gesamt}</span>
      </span>

      <span className="flex items-center gap-[3px]" aria-hidden>
        {HAUPTSCHRITTE.map((s, i) => {
          const zustand = i === jetzt ? 'aktuell' : wegzustand(s.id, fortschritt)
          return (
            <motion.span
              key={s.id}
              data-segment={zustand}
              // Nur die Breite animiert: das aktuelle Segment fährt beim
              // Schrittwechsel aus, statt umzuspringen. Die Farbe wechselt
              // sofort — ein Balken, der langsam die Farbe wechselt, sieht
              // nach Ladezustand aus.
              animate={{ width: zustand === 'aktuell' ? 26 : 11 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className={`h-3 rounded-full ${
                zustand === 'aktuell'
                  ? 'bg-kh-orange shadow-[0_0_14px_rgba(255,159,42,0.85)]'
                  : zustand === 'besucht'
                    ? 'bg-kh-orange/55'
                    : 'bg-white/18'
              }`}
            />
          )
        })}
      </span>
    </button>
  )
}
