import type { StepId } from './steps'
import { STEPS, bezugsHauptschritt, railIndex } from './steps'
import type { Fortschritt } from '@/khpl/store/fortschritt'

/**
 * Die Texte der Übergänge. Sie stehen hier und nicht im Step, weil ein Abstecher
 * von zwei Stellen aus angeboten wird: von seinem Elternschritt **und** von
 * seinem Geschwister-Abstecher.
 *
 * khpl-ui-shell.md 5: „Hat ein Step mehrere Abstecher (M3 → B3.1, B3.2), werden
 * beide als Karten angeboten; nach dem ersten steht die zweite weiterhin zur
 * Wahl.“ Ein Abstecher mündet trotzdem immer vorwärts (Board-Regel 3) — der
 * Rückweg auf M3 existiert nicht, das Angebot wandert mit.
 *
 * Buttontexte wörtlich aus khpl-flow.md 11. „Keine generische
 * ‚Mehr erfahren‘-Schablone“ (6.7).
 */

/** Einladungstext eines Abstechers — das, was auf dem Button steht. */
const EINLADUNG: Record<string, string> = {
  'B3.1': 'Woher kommt das Holz?',
  'B3.2': 'Wie wird aus einem Plan ein Dach?',
  'B4.1': 'Wie kommt das Holz zur Baustelle?',
  'B5.1': 'Warum arbeitet hier niemand allein?',
  'B9.1': 'Meister',
  'B9.2': 'Techniker',
  'B9.3': 'Studium',
}

/** Text der Hauptlinien-Fortsetzung. Ohne Eintrag schlicht „Weiter“. */
const WEITER: Partial<Record<StepId, string>> = {
  M3: 'Weiter in die Werkstatt',
  M4: 'Weiter zur Baustelle',
  'B3.1': 'Weiter zur Werkstatt',
  'B3.2': 'Weiter zur Werkstatt',
  M5: 'Weiter zur Pause',
  'B4.1': 'Weiter zur Baustelle',
  'B5.1': 'Weiter zur Pause',
  M9: 'Weiter',
}

export function einladung(id: StepId): string {
  return EINLADUNG[id] ?? STEPS[id].titel
}

export function weiterText(id: StepId): string {
  return WEITER[id] ?? 'Weiter'
}

/**
 * Abstecher, die von hier aus noch offen sind. Ein bereits genommener taucht
 * nicht wieder auf, und ein Abstecher bietet sich nicht selbst an.
 */
export function offeneAbstecher(id: StepId, fortschritt: Fortschritt): StepId[] {
  const bezug = bezugsHauptschritt(id)
  return STEPS[bezug].abstecher.filter(
    (a) => a !== id && !fortschritt.branchesTaken.includes(a),
  )
}

/** Marke eines Steps im Sheet „Dein Weg“ (khpl-ui-shell.md 4). */
export type Wegzustand = 'aktuell' | 'besucht' | 'offen'

/**
 * Ob ein Step im Sheet als ✓, ● oder ○ erscheint — und damit auch, ob er
 * antippbar ist.
 *
 * Die zweite Bedingung ist die Sperre gegen Sprünge nach vorn: besucht zählt
 * nur, was **nicht hinter** dem aktuellen Stand liegt. Sonst bräche das Paar
 * `Teach:` (M5) → `Abfrage:` (M7) und die Pointe M9 → M10 — und der
 * Karriere-Skip, der M9 vorzeitig in die Historie schreibt, würde neun von zehn
 * Segmenten aufsperren.
 */
export function wegzustand(id: StepId, fortschritt: Fortschritt): Wegzustand {
  if (id === fortschritt.currentStepId) return 'aktuell'
  if (!fortschritt.visited.includes(id)) return 'offen'
  return railIndex(id) <= railIndex(fortschritt.currentStepId) ? 'besucht' : 'offen'
}
