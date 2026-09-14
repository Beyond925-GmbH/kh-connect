import { Check, LayoutGrid, ArrowRight, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StepFoto } from '@/khpl/buehne/Foto'
import { StepShell } from '@/khpl/shell/StepShell'
import { useStand } from '@/khpl/stand'
import {
  beendeKarriereSkip,
  starteKarriereSkip,
  useFortschritt,
  zeigeBerufe,
} from '@/khpl/store/fortschritt'

export function Z9() {
  const f = useFortschritt()
  const a = f.answers
  const stand = useStand()
  const taten = [
    { fertig: !!a.z2?.gespannt, text: 'Rohteil eingespannt' },
    { fertig: !!a.z3?.gefunden, text: 'Werkzeugweg gesteuert' },
    { fertig: !!a.z4?.freigegeben, text: 'Maß passend eingestellt' },
    { fertig: !!a.z6?.stabil, text: 'Serie kontrolliert' },
  ].filter((t) => t.fertig)
  return (
    <StepShell
      id="Z9"
      auftrag={null}
      ansage={null}
      interaktionOffen={false}
      buehne={<StepFoto id="Z9" />}
      interaktion={
        <div className="flex flex-col gap-4">
          <p className="kh-titel-klein">Dein Einblick ist komplett.</p>
          {taten.length > 0 ? (
            <div>
              <p className="kh-etikett mb-2">Das hast du ausprobiert</p>
              <ul className="grid gap-2">
                {taten.map((t) => (
                  <li key={t.text} className="flex items-center gap-2 text-kh-paper">
                    <Check className="size-5 shrink-0 text-kh-signal" aria-hidden />
                    {t.text}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-kh-paper/80">
              Du kannst die Spiele jederzeit ausprobieren oder einen anderen Beruf
              kennenlernen.
            </p>
          )}
          <p className="text-kh-paper/80">
            {stand.name
              ? `Möchtest du mehr wissen? Sprich mit ${stand.name} am Stand.`
              : 'Möchtest du mehr wissen? Sprich mit uns am Stand.'}
          </p>
          <Button
            variant="neben"
            onClick={starteKarriereSkip}
            className="justify-between"
            data-testid="z9-karriere"
          >
            Ausbildung und Karriere
            <ArrowRight className="size-5" aria-hidden />
          </Button>
        </div>
      }
      fuss={
        <div className="flex flex-wrap justify-end gap-2">
          {f.detourReturnTo !== null && (
            <Button variant="neben" onClick={beendeKarriereSkip}>
              <ChevronLeft className="size-5" aria-hidden />
              Zurück zum Spiel
            </Button>
          )}
          <Button variant="weiter" onClick={zeigeBerufe} data-testid="z9-noch-einen">
            <LayoutGrid className="size-5" aria-hidden />
            Zurück zu den Berufen
          </Button>
        </div>
      }
    />
  )
}
