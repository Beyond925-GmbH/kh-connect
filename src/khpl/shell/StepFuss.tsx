import { useCallback } from 'react'
import { STEPS, type StepId } from '@/khpl/flow/steps'
import { offeneAbstecher } from '@/khpl/flow/uebergaenge'
import { Verzweigung } from '@/khpl/komponenten/Verzweigung'
import { geheZu, useFortschritt } from '@/khpl/store/fortschritt'

/**
 * Verdrahtet den Fuß eines Steps mit dem Store. Jeder Step benutzt dieselben
 * zwei Wege — Abstecher oder weiter auf der Hauptlinie —, deshalb steht die
 * Logik einmal hier und nicht fünfzehnmal in den Steps.
 */
export function useStepNavigation(id: StepId) {
  const fortschritt = useFortschritt()
  const offen = offeneAbstecher(id, fortschritt)

  const weiter = useCallback(() => {
    const ziel = STEPS[id].weiter
    if (ziel) geheZu(ziel)
  }, [id])

  const zumAbstecher = useCallback((ziel: StepId) => geheZu(ziel), [])

  return { fortschritt, offen, weiter, zumAbstecher }
}

export function StepFuss({
  id,
  onWeiter,
  ohneWeiter,
}: {
  id: StepId
  /** Überschreibt den Standardweg — für Steps, die vorher etwas merken. */
  onWeiter?: () => void
  ohneWeiter?: boolean
}) {
  const { offen, weiter, zumAbstecher } = useStepNavigation(id)

  return (
    <Verzweigung
      offen={offen}
      weiterVon={id}
      onAbstecher={zumAbstecher}
      onWeiter={onWeiter ?? weiter}
      ohneWeiter={ohneWeiter}
    />
  )
}
