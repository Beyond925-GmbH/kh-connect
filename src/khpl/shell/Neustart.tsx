import { useState } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { setzeZurueck } from '@/khpl/store/fortschritt'

export function NeustartKnopf({ className = '' }: { className?: string }) {
  const [offen, setOffen] = useState(false)
  return (
    <Dialog.Root open={offen} onOpenChange={setOffen}>
      <Dialog.Trigger
        data-testid="neustart"
        aria-label="Für den nächsten Besucher neu starten"
        onClick={(e) => e.stopPropagation()}
        className={`grid size-[48px] shrink-0 place-items-center rounded-kh-pill bg-kh-ink/80 text-kh-paper/80 ${className}`}
      >
        <RotateCcw className="size-5" aria-hidden />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-[70] bg-black/70" />
        <Dialog.Popup
          data-testid="neustart-dialog"
          className="fixed left-1/2 top-1/2 z-[71] flex w-[min(28rem,92vw)] -translate-x-1/2 -translate-y-1/2 flex-col gap-4 rounded-kh-lg border border-kh-line-strong bg-kh-raised p-6 shadow-xl"
        >
          <Dialog.Title className="text-2xl font-semibold">
            Neue Sitzung starten?
          </Dialog.Title>
          <Dialog.Description className="text-lg leading-snug text-kh-paper/85">
            Ausrüstung, Antworten und Fortschritt werden zurückgesetzt. Danach kann die
            nächste Person starten.
          </Dialog.Description>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="neben"
              onClick={() => setOffen(false)}
              data-testid="neustart-nein"
            >
              Abbrechen
            </Button>
            <Button
              onClick={() => {
                setOffen(false)
                setzeZurueck()
              }}
              data-testid="neustart-ja"
            >
              Neu starten
            </Button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
