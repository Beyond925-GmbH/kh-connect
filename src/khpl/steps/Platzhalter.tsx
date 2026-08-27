import { step, type StepId } from '@/khpl/flow/steps'
import { StepShell } from '@/khpl/shell/StepShell'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { useGraph } from '@/khpl/store/fortschritt'

/**
 * Ein Step, dessen Inhalt noch nicht gebaut ist. Er hält den Graphen von der
 * ersten Stunde an vollständig begehbar — Rail, Sheet, Abstecher, Skip und
 * Wiedereinstieg lassen sich damit prüfen, bevor eine einzige Übung steht.
 *
 * Wird im Lauf der Umsetzung Schritt für Schritt ersetzt und verschwindet mit
 * dem letzten Step aus dem Bündel.
 */
export function Platzhalter({ id }: { id: StepId }) {
  const def = step(useGraph(), id)

  return (
    <StepShell
      id={id}
      // TODO(vereinfachung): Auftragszeile und Ansage nachtragen — khpl-vereinfachung.md §6.
      auftrag={null}
      ansage={null}
      titelZusatz={def.art === 'abstecher' ? 'Abstecher' : undefined}
      buehne={<div className="size-full bg-kh-surface" />}
      warum={<p>Dieser Schritt ist noch nicht gebaut.</p>}
      fuss={<StepFuss id={id} />}
    />
  )
}
