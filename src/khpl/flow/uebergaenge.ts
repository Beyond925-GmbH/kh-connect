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

interface Angebot {
  /** Das, was auf dem Button steht. */
  einladung: string
  /**
   * Die Zeile darunter. ui-shell 5 zeigt das Angebot dreizeilig:
   * „Noch eine Minute? / Schau dir an, wie das Material bestellt wird. /
   * [ Ja, zeig mir das ]“. Ohne die mittlere Zeile liest sich „Noch eine
   * Minute?“ wie eine Rückfrage, ob man wirklich weitermachen will.
   */
  beschreibung: string
}

const ANGEBOTE: Partial<Record<StepId, Angebot>> = {
  'B3.1': {
    einladung: 'Woher kommt das Holz?',
    beschreibung: 'Schau dir an, wie das Material bestellt wird.',
  },
  'B3.2': {
    einladung: 'Wie wird aus einem Plan ein Dach?',
    beschreibung: 'Dreh einen Dachstuhl in 3D und tipp die Bauteile an.',
  },
  'B4.1': {
    einladung: 'Wie kommt das Holz zur Baustelle?',
    beschreibung: 'Belade den Transporter — und vergiss nichts.',
  },
  'B5.1': {
    einladung: 'Warum arbeitet hier niemand allein?',
    beschreibung: 'Eine Minute darüber, wie auf dem Dach gearbeitet wird.',
  },
  'B9.1': { einladung: 'Meister', beschreibung: 'Eigener Betrieb, eigene Azubis.' },
  'B9.2': { einladung: 'Techniker', beschreibung: 'Planen und rechnen statt aufs Dach.' },
  'B9.3': { einladung: 'Studium', beschreibung: 'Ja, das geht — auch ohne Abitur.' },
}

/** Text der Hauptlinien-Fortsetzung. Ohne Eintrag schlicht „Weiter“. */
const WEITER: Partial<Record<StepId, string>> = {
  M3: 'Weiter in die Werkstatt',
  'B3.1': 'Weiter zur Werkstatt',
  'B3.2': 'Weiter zur Werkstatt',
  M4: 'Weiter zur Baustelle',
  'B4.1': 'Weiter zur Baustelle',
  M5: 'Weiter zur Pause',
  'B5.1': 'Weiter zur Pause',
}

export function einladung(id: StepId): string {
  return ANGEBOTE[id]?.einladung ?? STEPS[id].titel
}

export function beschreibung(id: StepId): string | null {
  return ANGEBOTE[id]?.beschreibung ?? null
}

export function weiterText(id: StepId): string {
  return WEITER[id] ?? 'Weiter'
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
export function offeneAbstecher(id: StepId, fortschritt: Fortschritt): StepId[] {
  const bezug = bezugsHauptschritt(id)
  return STEPS[bezug].abstecher.filter(
    (a) => a !== id && (STEPS[a].immerOffen || !fortschritt.branchesTaken.includes(a)),
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
export function wegzustand(id: StepId, fortschritt: Fortschritt): Wegzustand {
  if (id === fortschritt.currentStepId) return 'aktuell'
  if (!fortschritt.visited.includes(id)) return 'offen'
  return railIndex(id) <= railIndex(fortschritt.hoechsterStep) ? 'besucht' : 'offen'
}
