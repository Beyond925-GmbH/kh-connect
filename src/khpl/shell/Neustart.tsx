import { useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { setzeZurueck } from '@/khpl/store/fortschritt'

/**
 * Der sichtbare Reset — **auf jedem Screen an derselben Stelle**.
 *
 * Bis hierher gab es den Reset an drei Orten und auf keinem Screen zuverlässig:
 * im Sheet „Dein Weg“ (nur auf Steps, zwei Taps tief), im Idle-Dialog (nur,
 * wenn man zwei Minuten wartet) und hinter der Fünf-Tap-Geste (nur, wenn man
 * sie kennt). Am Messestand ist der häufigste Fall aber der banalste: einer
 * ist fertig, der nächste steht schon daneben, und das Standpersonal hat
 * dafür **einen** Griff verdient, den es nicht suchen muss.
 *
 * **Warum ein Kreis und keine Pille mit Text.** Die Leiste trägt auf den
 * dichtesten Screens schon Zurück, Rail und „Karriere-Wege“. Ein vierter
 * beschrifteter Knopf wäre dort die Zeile gesprengt; der 52-px-Kreis hängt
 * sich stattdessen als zweites Element an den rechten Knopf und liest sich mit
 * ihm als eine Gruppe. Die Beschriftung übernimmt `aria-label` — und für die,
 * die den Kreis nicht deuten, bleiben Sheet und Idle-Dialog daneben bestehen.
 *
 * **Es fragt vorher.** Der Knopf sitzt in Reichweite eines Besuchers, der
 * mitten in seinem Tag steckt; ein Tap darf ihm nicht den Vormittag löschen.
 * Der Rückfragetext ist derselbe wie im Sheet: was gelöscht wird, steht da,
 * nicht „Bist du sicher?“.
 */
export function NeustartKnopf({ className = '' }: { className?: string }) {
  const [fragt, setFragt] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          // Splash und Berufsliste starten bei einem Tap ins Leere selbst
          // etwas — der Knopf darf das nicht mit auslösen.
          e.stopPropagation()
          setFragt(true)
        }}
        data-testid="neustart"
        aria-label="Für den nächsten Besucher neu starten"
        className={`grid size-[52px] shrink-0 place-items-center rounded-kh-pill bg-black/35 text-kh-paper/60 backdrop-blur-md transition-transform active:scale-90 ${className}`}
      >
        <RotateCcw className="size-5" strokeWidth={2} />
      </button>

      {fragt && (
        <div
          onClick={(e) => e.stopPropagation()}
          data-testid="neustart-dialog"
          className="fixed inset-0 z-[70] grid animate-fade-up place-items-center bg-black/70 p-6 backdrop-blur-sm"
        >
          <div className="flex w-[min(28rem,92vw)] flex-col gap-4 rounded-kh-lg border-t-4 border-kh-orange bg-kh-raised p-7 shadow-[0_28px_80px_rgba(0,0,0,0.7)]">
            <h2 className="kh-titel-klein">Für den Nächsten neu starten?</h2>
            <p className="text-[1.0625rem] text-kh-mute">
              Löscht Helm, Antworten und den Fortschritt in{' '}
              <strong className="font-semibold text-kh-paper">allen vier</strong> Berufen.
              Das lässt sich nicht rückgängig machen.
            </p>
            <div className="flex flex-col items-stretch gap-2 sm:flex-row">
              <Button
                onClick={() => {
                  setFragt(false)
                  setzeZurueck()
                }}
                data-testid="neustart-ja"
                variant="weiter"
                className="flex-1"
              >
                Ja, neu starten
              </Button>
              <Button
                variant="neben"
                onClick={() => setFragt(false)}
                data-testid="neustart-nein"
                className="flex-1"
              >
                Abbrechen
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
