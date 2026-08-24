import { useCallback } from 'react'
import { step, type StepId } from '@/khpl/flow/steps'
import { offeneAbstecher } from '@/khpl/flow/uebergaenge'
import { Verzweigung } from '@/khpl/komponenten/Verzweigung'
import { geheZu, useFortschritt, useGraph } from '@/khpl/store/fortschritt'

/**
 * Verdrahtet den Fuß eines Steps mit dem Store. Jeder Step benutzt dieselben
 * zwei Wege — Abstecher oder weiter auf der Hauptlinie —, deshalb steht die
 * Logik einmal hier und nicht fünfzehnmal in den Steps.
 */
export function useStepNavigation(id: StepId) {
  const graph = useGraph()
  const fortschritt = useFortschritt()
  const offen = offeneAbstecher(graph, id, fortschritt)

  const weiter = useCallback(() => {
    const ziel = step(graph, id).weiter
    if (ziel) geheZu(ziel)
  }, [graph, id])

  const zumAbstecher = useCallback((ziel: StepId) => geheZu(ziel), [])

  return { fortschritt, offen, weiter, zumAbstecher }
}

export function StepFuss({
  id,
  ohneWeiter,
  geschafft,
  aktion,
  uebungOffen,
}: {
  id: StepId
  /**
   * Ohne Angabe aus dem Graphen abgeleitet: M10 hat kein `weiter`, und ein
   * Button, der nichts tut, ist schlimmer als keiner.
   */
  ohneWeiter?: boolean
  /** Kurze Bestätigung, sobald die Übung gelöst ist. Siehe `Verzweigung`. */
  geschafft?: string | null
  /** Die Handlung, die die Übung abschließt. Siehe `Verzweigung`. */
  aktion?: React.ReactNode
  /** Solange die Übung ungelöst ist. Siehe `Verzweigung`. */
  uebungOffen?: boolean
}) {
  const graph = useGraph()
  const { offen, weiter, zumAbstecher } = useStepNavigation(id)

  return (
    <Verzweigung
      offen={offen}
      weiterVon={id}
      onAbstecher={zumAbstecher}
      onWeiter={weiter}
      ohneWeiter={ohneWeiter ?? step(graph, id).weiter === null}
      geschafft={geschafft}
      aktion={aktion}
      uebungOffen={uebungOffen}
    />
  )
}
