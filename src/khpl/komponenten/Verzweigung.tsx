import { ArrowRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { StepId } from '@/khpl/flow/steps'
import { weiterText } from '@/khpl/flow/uebergaenge'
import { useGraph, useFortschritt } from '@/khpl/store/fortschritt'

/** Weiter führt direkt ins nächste Spiel. Zusätzliche Themen sind freiwillig. */
export function Verzweigung({
  weiterVon,
  onWeiter,
  ohneWeiter = false,
  geschafft = null,
  aktion = null,
  uebungOffen = false,
}: {
  offen: StepId[]
  weiterVon: StepId
  onAbstecher: (id: StepId) => void
  onWeiter: () => void
  ohneWeiter?: boolean
  geschafft?: string | null
  aktion?: React.ReactNode
  uebungOffen?: boolean
}) {
  const graph = useGraph()
  const { detourReturnTo } = useFortschritt()
  return (
    <div className="contents">
      <div className="contents">
        {geschafft && !uebungOffen && (
          <p
            data-testid="geschafft"
            role="status"
            className="mr-auto flex items-center gap-2 text-sm font-semibold text-kh-signal"
          >
            <Check className="size-4" aria-hidden />
            {geschafft}
          </p>
        )}
        {!ohneWeiter &&
          (uebungOffen ? (
            <>
              <Button
                variant="leise"
                size="sm"
                onClick={onWeiter}
                data-testid="weiter"
                aria-label="Aufgabe überspringen"
              >
                Überspringen
              </Button>
              {aktion && (
                <div className="ml-auto flex max-w-full basis-full flex-wrap justify-end gap-2 sm:basis-auto [&>div]:flex-wrap [&>div]:justify-end [&_button]:max-sm:px-4 [&_button]:max-sm:text-base">
                  {aktion}
                </div>
              )}
            </>
          ) : (
            <Button onClick={onWeiter} variant="weiter" data-testid="weiter">
              {detourReturnTo ? 'Zurück zum Beruf' : weiterText(graph, weiterVon)}
              <ArrowRight className="size-5" aria-hidden />
            </Button>
          ))}
      </div>
    </div>
  )
}
