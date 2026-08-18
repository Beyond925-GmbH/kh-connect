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
 * Die Zeile „Schritt 5 von 10“ steht hier statt eines zweiten Titels: den Titel
 * trägt die Textkarte des Steps (flow 6.2), die Leiste trägt die Ortsangabe
 * (flow 6.1). Zweimal derselbe Satz auf einem 10-Zoll-Screen liest sich falsch.
 *
 * **Der Fortschritt muss man sehen können.** Die Segmente waren 7 px hoch und
 * die Zählzeile 13 px, auf schmalen Screens ganz ausgeblendet — damit war das
 * einzige Element, das „du kommst voran“ sagt, das unauffälligste auf dem
 * Screen. Jetzt sind die Balken 10 px hoch, der zurückgelegte Teil trägt volles
 * Markenorange statt 55 % Deckkraft, das aktuelle Segment wächst beim Wechsel
 * animiert auf seine Länge, und die Zählung steht immer da.
 */
export function Rail({
  fortschritt,
  onOeffnen,
}: {
  fortschritt: Fortschritt
  onOeffnen: () => void
}) {
  const jetzt = railIndex(fortschritt.currentStepId)

  return (
    <button
      type="button"
      onClick={onOeffnen}
      data-testid="rail"
      aria-label={`Dein Weg öffnen — Schritt ${jetzt + 1} von ${HAUPTSCHRITTE.length}`}
      className="group flex h-12 min-w-0 shrink items-center gap-2.5 rounded-kh px-2 transition-colors hover:bg-kh-band-soft sm:gap-3 sm:px-3"
    >
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
              animate={{ width: zustand === 'aktuell' ? 30 : 14 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className={`h-[10px] rounded-full ${
                zustand === 'aktuell'
                  ? 'bg-kh-orange'
                  : zustand === 'besucht'
                    ? 'bg-kh-orange/70'
                    : 'bg-kh-rule'
              }`}
            />
          )
        })}
      </span>
      <span className="text-[0.9375rem] whitespace-nowrap text-kh-grey tabular-nums sm:text-base">
        <span className="font-normal text-kh-ink">{jetzt + 1}</span>
        <span className="text-kh-grey/70"> / {HAUPTSCHRITTE.length}</span>
      </span>
    </button>
  )
}
