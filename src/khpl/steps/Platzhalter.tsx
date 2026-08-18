import { STEPS, type StepId } from '@/khpl/flow/steps'
import { StepShell } from '@/khpl/shell/StepShell'
import { StepFuss, useStepNavigation } from '@/khpl/shell/StepFuss'

/**
 * Ein Step, dessen Inhalt noch nicht gebaut ist. Er hält den Graphen von der
 * ersten Stunde an vollständig begehbar — Rail, Sheet, Abstecher, Skip und
 * Wiedereinstieg lassen sich damit prüfen, bevor eine einzige Übung steht.
 *
 * Wird im Lauf der Umsetzung Schritt für Schritt ersetzt und verschwindet mit
 * dem letzten Step aus dem Bündel.
 */
export function Platzhalter({ id }: { id: StepId }) {
  const { weiter } = useStepNavigation(id)
  const def = STEPS[id]

  return (
    <StepShell
      id={id}
      titelZusatz={def.art === 'abstecher' ? 'Abstecher' : undefined}
      onWeiter={weiter}
      buehne={<div className="size-full bg-kh-band" />}
      fachtext={<p>Dieser Schritt ist noch nicht gebaut.</p>}
      fuss={<StepFuss id={id} />}
    />
  )
}
