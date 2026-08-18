/**
 * Der Step-Graph aus khpl-flow.md 2–4. Einzige Quelle der Wahrheit für
 * Reihenfolge, Abstecher und Rail-Segmentzahl.
 *
 * Regel 3 des Boards: ein Abstecher springt nicht zurück, sondern mündet in
 * denselben nächsten Hauptschritt wie sein Elternschritt. Deshalb trägt jeder
 * Step nur ein `weiter` — der Unterschied zwischen Haupt und Abstecher steckt
 * allein in `art`.
 *
 * Die Rail zählt `HAUPTSCHRITTE.length`, nie eine Konstante: khpl-ui-shell.md 9
 * hält ausdrücklich fest, dass die Segmentzahl datengetrieben bleiben muss.
 */

export type StepId =
  | 'M1'
  | 'M2'
  | 'M3'
  | 'B3.1'
  | 'B3.2'
  | 'M4'
  | 'B4.1'
  | 'M5'
  | 'B5.1'
  | 'M6'
  | 'M7'
  | 'M8'
  | 'M9'
  | 'B9.1'
  | 'B9.2'
  | 'B9.3'
  | 'M10'

export type StepArt = 'haupt' | 'abstecher'

export interface StepDef {
  id: StepId
  /** Titel in der Leiste und im Sheet „Dein Weg“. */
  titel: string
  art: StepArt
  /** Nächster Step. `null` nur am Ende der Hauptlinie (M10). */
  weiter: StepId | null
  /** Abstecher, die von diesem Step abzweigen (Reihenfolge = Anzeigereihenfolge). */
  abstecher: StepId[]
  /** Elternschritt eines Abstechers. Bei Hauptschritten `null`. */
  eltern: StepId | null
}

const roh: StepDef[] = [
  {
    id: 'M1',
    titel: 'Der erste Termin',
    art: 'haupt',
    weiter: 'M2',
    abstecher: [],
    eltern: null,
  },
  {
    id: 'M2',
    titel: 'Was kostet dieses Dach?',
    art: 'haupt',
    weiter: 'M3',
    abstecher: [],
    eltern: null,
  },
  {
    id: 'M3',
    titel: 'Aus dem Angebot wird ein Auftrag',
    art: 'haupt',
    weiter: 'M4',
    abstecher: ['B3.1', 'B3.2'],
    eltern: null,
  },
  {
    id: 'B3.1',
    titel: 'Bestellt wird nach Plan',
    art: 'abstecher',
    weiter: 'M4',
    abstecher: [],
    eltern: 'M3',
  },
  {
    id: 'B3.2',
    titel: 'Vom Plan in den Kopf',
    art: 'abstecher',
    weiter: 'M4',
    abstecher: [],
    eltern: 'M3',
  },
  {
    id: 'M4',
    titel: 'Ein Balken, ein Maß',
    art: 'haupt',
    weiter: 'M5',
    abstecher: ['B4.1'],
    eltern: null,
  },
  {
    id: 'B4.1',
    titel: 'Beladen',
    art: 'abstecher',
    weiter: 'M5',
    abstecher: [],
    eltern: 'M4',
  },
  {
    id: 'M5',
    titel: 'Aufrichten',
    art: 'haupt',
    weiter: 'M6',
    abstecher: ['B5.1'],
    eltern: null,
  },
  {
    id: 'B5.1',
    titel: 'Niemand macht das allein',
    art: 'abstecher',
    weiter: 'M6',
    abstecher: [],
    eltern: 'M5',
  },
  {
    id: 'M6',
    titel: 'Halb zwölf',
    art: 'haupt',
    weiter: 'M7',
    abstecher: [],
    eltern: null,
  },
  {
    id: 'M7',
    titel: 'Jetzt du',
    art: 'haupt',
    weiter: 'M8',
    abstecher: [],
    eltern: null,
  },
  {
    id: 'M8',
    titel: 'Feierabend',
    art: 'haupt',
    weiter: 'M9',
    abstecher: [],
    eltern: null,
  },
  {
    id: 'M9',
    titel: 'Und danach?',
    art: 'haupt',
    weiter: 'M10',
    abstecher: ['B9.1', 'B9.2', 'B9.3'],
    eltern: null,
  },
  {
    id: 'B9.1',
    titel: 'Meister',
    art: 'abstecher',
    weiter: 'M10',
    abstecher: [],
    eltern: 'M9',
  },
  {
    id: 'B9.2',
    titel: 'Techniker',
    art: 'abstecher',
    weiter: 'M10',
    abstecher: [],
    eltern: 'M9',
  },
  {
    id: 'B9.3',
    titel: 'Studium',
    art: 'abstecher',
    weiter: 'M10',
    abstecher: [],
    eltern: 'M9',
  },
  {
    id: 'M10',
    titel: 'Dein nächster Schritt',
    art: 'haupt',
    weiter: null,
    abstecher: [],
    eltern: null,
  },
]

export const STEPS: Record<StepId, StepDef> = Object.fromEntries(
  roh.map((s) => [s.id, s]),
) as Record<StepId, StepDef>

/** Die Hauptlinie in Erzählreihenfolge. Länge = Segmentzahl der Rail. */
export const HAUPTSCHRITTE: StepDef[] = roh.filter((s) => s.art === 'haupt')

/** Alle Steps in Board-Reihenfolge — Abstecher direkt hinter ihrem Elternschritt. */
export const ALLE_STEPS: StepDef[] = roh

export const ERSTER_STEP: StepId = 'M1'

export function istStepId(wert: unknown): wert is StepId {
  return typeof wert === 'string' && Object.hasOwn(STEPS, wert)
}

export function step(id: StepId): StepDef {
  return STEPS[id]
}

export function istHaupt(id: StepId): boolean {
  return STEPS[id].art === 'haupt'
}

/**
 * Der Hauptschritt, unter dem dieser Step einsortiert wird — er selbst, wenn er
 * einer ist, sonst sein Elternschritt.
 */
export function bezugsHauptschritt(id: StepId): StepId {
  const def = STEPS[id]
  return def.art === 'haupt' ? def.id : (def.eltern as StepId)
}

/**
 * Position in der Rail. Ein Abstecher hat kein eigenes Segment und zählt
 * deshalb wie sein Elternschritt (khpl-ui-shell.md 4).
 */
export function railIndex(id: StepId): number {
  const bezug = bezugsHauptschritt(id)
  return HAUPTSCHRITTE.findIndex((s) => s.id === bezug)
}
