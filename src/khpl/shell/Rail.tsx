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
      className="group flex h-11 min-w-0 shrink items-center gap-3 rounded-kh px-3 transition-colors hover:bg-kh-band-soft"
    >
      <span className="flex items-center gap-[3px]" aria-hidden>
        {HAUPTSCHRITTE.map((s, i) => {
          const zustand = i === jetzt ? 'aktuell' : wegzustand(s.id, fortschritt)
          return (
            <span
              key={s.id}
              data-segment={zustand}
              className={
                zustand === 'aktuell'
                  ? 'h-[7px] w-6 rounded-full bg-kh-orange'
                  : zustand === 'besucht'
                    ? 'h-[7px] w-3.5 rounded-full bg-kh-orange/55'
                    : 'h-[7px] w-3.5 rounded-full bg-kh-rule'
              }
            />
          )
        })}
      </span>
      <span className="hidden text-[13px] whitespace-nowrap text-kh-grey/80 tabular-nums sm:inline">
        Schritt {jetzt + 1} von {HAUPTSCHRITTE.length}
      </span>
    </button>
  )
}
