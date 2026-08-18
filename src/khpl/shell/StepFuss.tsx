import { useCallback } from 'react'
import { STEPS, type StepId } from '@/khpl/flow/steps'
import { offeneAbstecher } from '@/khpl/flow/uebergaenge'
import { Verzweigung } from '@/khpl/komponenten/Verzweigung'
import { geheZu, useFortschritt } from '@/khpl/store/fortschritt'
import { useWeiter } from './WeiterKontext'

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
  ohneWeiter,
  gedaempft,
}: {
  id: StepId
  /**
   * Ohne Angabe aus dem Graphen abgeleitet: M10 hat kein `weiter`, und ein
   * Button, der nichts tut, ist schlimmer als keiner.
   */
  ohneWeiter?: boolean
  /** Solange die Übung dieses Steps offen ist. */
  gedaempft?: boolean
}) {
  const { offen, weiter, zumAbstecher } = useStepNavigation(id)
  // Denselben Weg wie der Wisch nach links — nie einen zweiten.
  const nachVorn = useWeiter(weiter)

  return (
    <Verzweigung
      offen={offen}
      weiterVon={id}
      onAbstecher={zumAbstecher}
      onWeiter={nachVorn}
      ohneWeiter={ohneWeiter ?? STEPS[id].weiter === null}
      gedaempft={gedaempft}
    />
  )
}
