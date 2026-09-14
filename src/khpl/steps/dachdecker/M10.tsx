import { LayoutGrid, ArrowRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StepFoto } from '@/khpl/buehne/Foto'
import { StepShell } from '@/khpl/shell/StepShell'
import { useStand } from '@/khpl/stand'
import { starteKarriereSkip, useFortschritt, zeigeBerufe } from '@/khpl/store/fortschritt'

export function M10() {
  const { answers } = useFortschritt()
  const stand = useStand()
  const gemacht = [
    answers.m1?.ausgewertet && 'Drei Stellen auf der Baustelle angesehen',
    answers.m4?.getroffen && 'Einen Balken zugeschnitten',
    answers.b41?.fertig && 'Den Transporter beladen',
    answers.m5?.fertig && 'Den Unterbau aufgerichtet',
    answers.m7?.fertig && 'Den Dachstuhl ergänzt',
  ].filter((s): s is string => !!s)
  return (
    <StepShell
      id="M10"
      auftrag={null}
      ansage={null}
      interaktionOffen={false}
      buehne={<StepFoto id="M10" />}
      interaktion={
        <div className="flex flex-col gap-4">
          <p className="text-xl font-semibold">
            {gemacht.length
              ? 'Das hast du ausprobiert:'
              : 'Du hast dir den Beruf angesehen.'}
          </p>
          {gemacht.length > 0 && (
            <ul className="flex flex-col gap-2 text-base">
              {gemacht.map((s) => (
                <li key={s} className="flex items-center gap-2">
                  <Check className="size-4 shrink-0 text-kh-signal" aria-hidden />
                  {s}
                </li>
              ))}
            </ul>
          )}
          <p className="text-lg leading-snug text-kh-paper/85">
            {stand.name
              ? `${stand.name} beantwortet am Stand deine Fragen zur Ausbildung.`
              : 'Am Stand beantworten wir deine Fragen zur Ausbildung.'}
          </p>
          <Button
            variant="neben"
            onClick={starteKarriereSkip}
            data-testid="m10-karriere"
            className="self-start"
          >
            Ausbildung und Aufstieg
            <ArrowRight className="size-4" aria-hidden />
          </Button>
        </div>
      }
      fuss={
        <Button variant="weiter" onClick={zeigeBerufe} data-testid="m10-noch-einen">
          <LayoutGrid className="size-5" aria-hidden />
          Zurück zu den Berufen
        </Button>
      }
    />
  )
}
