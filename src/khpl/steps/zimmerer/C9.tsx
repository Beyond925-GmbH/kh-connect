import { lazy, Suspense } from 'react'
import { Check, ChevronLeft, LayoutGrid } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dachstuhl3DFallback } from '@/khpl/buehne/Dachstuhl3DFallback'
import { useStand } from '@/khpl/stand'
import { StepShell } from '@/khpl/shell/StepShell'
import {
  beendeKarriereSkip,
  useFortschritt,
  zeigeBerufe,
  oeffneVertiefung,
} from '@/khpl/store/fortschritt'
import { tatsaechlicheTaten } from './rueckblick'
const Wandelement3D = lazy(() => import('@/khpl/buehne/zimmerer/Wandelement3D'))

export function C9() {
  const fortschritt = useFortschritt()
  const stand = useStand()
  const imSkip = fortschritt.detourReturnTo !== null
  const taten = tatsaechlicheTaten(fortschritt.answers)
  return (
    <StepShell
      id="C9"
      auftrag={null}
      ansage={null}
      buehneInteraktiv
      interaktionOffen={false}
      buehne={
        <Suspense fallback={<Dachstuhl3DFallback text="Deine Wand am Haus" />}>
          <Wandelement3D
            zustand="haus"
            ausschnitt={fortschritt.answers.c4?.ausschnitt}
            deinElement
          />
        </Suspense>
      }
      interaktion={
        <div className="flex flex-col gap-4">
          <div>
            <p className="kh-etikett text-kh-mute">Dein Einblick ins Zimmererhandwerk</p>
            <p className="kh-titel-klein mt-1 text-kh-signal">
              {taten.length
                ? 'Das hast du selbst gemacht.'
                : 'Vom Holz bis zur Hauswand.'}
            </p>
          </div>
          {taten.length > 0 && (
            <ul className="flex flex-col gap-2" data-testid="c9-rueckblick">
              {taten.map((tat) => (
                <li
                  key={tat}
                  className="flex items-start gap-2 text-[1.0625rem] leading-snug"
                >
                  <Check aria-hidden className="mt-0.5 size-5 shrink-0 text-kh-signal" />
                  {tat}
                </li>
              ))}
            </ul>
          )}
          <p className="text-[1.0625rem] leading-snug">
            {stand.name
              ? `Probiere das Handwerk mit ${stand.name} am Stand aus.`
              : 'Probiere das Handwerk mit uns am Stand aus.'}
          </p>
          {stand.rolle && <p className="text-[1rem] text-kh-mute">{stand.rolle}</p>}
          <button
            type="button"
            onClick={() => oeffneVertiefung('C8')}
            className="min-h-[44px] w-fit text-left text-[1rem] underline underline-offset-4"
            data-testid="c9-karriere"
          >
            Was kommt nach der Ausbildung?
          </button>
        </div>
      }
      fuss={
        <div className="flex flex-wrap justify-end gap-3">
          {imSkip && (
            <Button variant="neben" onClick={beendeKarriereSkip}>
              <ChevronLeft className="size-5" />
              Zurück zum Beruf
            </Button>
          )}
          <Button variant="weiter" onClick={zeigeBerufe} data-testid="c9-noch-einen">
            <LayoutGrid className="size-5" />
            Zurück zu den Berufen
          </Button>
        </div>
      }
    />
  )
}
