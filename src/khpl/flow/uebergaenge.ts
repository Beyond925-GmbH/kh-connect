import type { StepGraph, StepId } from './steps'
import { bezugsHauptschritt, railIndex, step } from './steps'
import type { Fortschritt } from '@/khpl/store/fortschritt'

/**
 * Die Regeln der Übergänge. Die **Texte** dazu liegen seit den vier Berufen im
 * Graphen des jeweiligen Berufs (`graph.angebote`, `graph.weiterTexte`) — sie
 * standen hier als Tabellen nach StepId, und jeder Beruf hat ein B3.1.
 *
 * khpl-ui-shell.md 5: „Hat ein Step mehrere Abstecher (M3 → B3.1, B3.2), werden
 * beide als Karten angeboten; nach dem ersten steht die zweite weiterhin zur
 * Wahl.“ Ein Abstecher mündet trotzdem immer vorwärts (Board-Regel 3) — der
 * Rückweg auf M3 existiert nicht, das Angebot wandert mit.
 */

export function einladung(graph: StepGraph, id: StepId): string {
  return graph.angebote[id]?.einladung ?? step(graph, id).titel
}

export function beschreibung(graph: StepGraph, id: StepId): string | null {
  return graph.angebote[id]?.beschreibung ?? null
}

export function weiterText(graph: StepGraph, id: StepId): string {
  return graph.weiterTexte[id] ?? 'Weiter'
}

/**
 * Abstecher, die von hier aus noch offen sind. Ein bereits genommener taucht
 * nicht wieder auf — außer er ist als `immerOffen` markiert.
 *
 * Die Ausnahme sind die drei Karrierekarten. Ohne sie verschwindet eine Karte,
 * sobald sie einmal geöffnet wurde: wer im Skip „Studium“ liest und später
 * regulär auf M9 landet, bekäme dort nur noch zwei Karten zu sehen — und flow 7
 * M9 verlangt das Gegenteil.
 */
export function offeneAbstecher(
  graph: StepGraph,
  id: StepId,
  fortschritt: Fortschritt,
): StepId[] {
  const bezug = bezugsHauptschritt(graph, id)
  return step(graph, bezug).abstecher.filter(
    (a) =>
      a !== id && (step(graph, a).immerOffen || !fortschritt.branchesTaken.includes(a)),
  )
}

/** Marke eines Steps im Sheet „Dein Weg“ (khpl-ui-shell.md 4). */
export type Wegzustand = 'aktuell' | 'besucht' | 'offen'

/**
 * Ob ein Step im Sheet als ✓, ● oder ○ erscheint — und damit auch, ob er
 * antippbar ist.
 *
 * Gemessen wird gegen die Hochwassermarke, nicht gegen die aktuelle Position:
 * wer zum Nachlesen auf M2 zurückspringt, soll M3 bis M5 weiter als besucht
 * sehen und auch wieder hinspringen können. Zugleich bleibt alles gesperrt,
 * was noch niemand gesehen hat — sonst bräche das Paar `Teach:` (M5) →
 * `Abfrage:` (M7) und die Pointe M9 → M10.
 */
export function wegzustand(
  graph: StepGraph,
  id: StepId,
  fortschritt: Fortschritt,
): Wegzustand {
  if (id === fortschritt.currentStepId) return 'aktuell'
  if (!fortschritt.visited.includes(id)) return 'offen'
  return railIndex(graph, id) <= railIndex(graph, fortschritt.hoechsterStep)
    ? 'besucht'
    : 'offen'
}
