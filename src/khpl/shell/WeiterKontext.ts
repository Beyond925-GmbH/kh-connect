import { createContext, useContext } from 'react'

/**
 * Es gibt pro Step genau **einen** Weg nach vorn.
 *
 * Vorher gab es zwei: `StepShell` nahm ein `onWeiter` für den Wisch nach links,
 * `StepFuss` ein zweites für den Button. Steps wie M1, M2, M4 und M7 müssen vor
 * dem Weitergehen ihre Antwort sichern — wird das nur am Button verdrahtet,
 * geht ein Wisch daran vorbei und der Rückblick in M8 verliert diesen Schritt.
 * Der Fehler wäre still, nur per Touch und nur manchmal reproduzierbar.
 *
 * Deshalb: der Step gibt seinen Weiter-Weg einmal an `StepShell`, und der Fuß
 * holt sich denselben Weg hier ab.
 */
export const WeiterKontext = createContext<(() => void) | null>(null)

export function useWeiter(standard: () => void): () => void {
  return useContext(WeiterKontext) ?? standard
}
