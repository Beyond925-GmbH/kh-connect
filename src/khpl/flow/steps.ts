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
  /**
   * Die Überschrift des Screens — die Pointe aus flow 11. „Halb zwölf“,
   * „Jetzt du“. Gehört ins `<h1>` und sonst nirgendwohin.
   */
  titel: string
  /**
   * Der Name des Schritts, wie ihn das Board führt (flow 2 und 3).
   *
   * Zwei Felder, weil sie zwei Aufgaben haben. „Jetzt du“ ist als Überschrift
   * richtig und als Zeile in einer Liste sinnlos — erst recht als gesperrter
   * Zukunftsschritt. Das Sheet „Dein Weg“ beantwortet „Was habe ich bisher
   * gemacht?“ und braucht Etiketten, keine Pointen; ui-shell 4 zeigt in seinem
   * Beispiel genau diese Board-Namen.
   */
  kurz: string
  art: StepArt
  /** Nächster Step. `null` nur am Ende der Hauptlinie (M10). */
  weiter: StepId | null
  /** Abstecher, die von diesem Step abzweigen (Reihenfolge = Anzeigereihenfolge). */
  abstecher: readonly StepId[]
  /** Elternschritt eines Abstechers. Bei Hauptschritten `null`. */
  eltern: StepId | null
  /**
   * Bleibt immer im Angebot, auch wenn er schon besucht wurde.
   *
   * Nur die drei Karrierekarten: flow 7 M9 verlangt „alle drei bleiben
   * jederzeit erreichbar“, und die Studium-Karte „darf sich nicht hinter den
   * anderen verstecken“. Ein gewöhnlicher Abstecher verschwindet dagegen,
   * sobald er genommen wurde.
   */
  immerOffen?: boolean
}

/**
 * Als Objektliteral mit `satisfies`, nicht als Liste plus
 * `Object.fromEntries(...) as Record<…>`: die Zuweisung würde einen fehlenden
 * Eintrag verschweigen. Kommt der in ui-shell 9.1 angekündigte `GAP` zwischen
 * M7 und M8 dazu, soll das ein Typfehler sein und nicht zur Laufzeit
 * `undefined`.
 */
export const STEPS: Record<StepId, StepDef> = {
  M1: {
    id: 'M1',
    titel: 'Der erste Termin',
    kurz: 'Anfrage & Ortstermin',
    art: 'haupt',
    weiter: 'M2',
    abstecher: [],
    eltern: null,
  },
  M2: {
    id: 'M2',
    titel: 'Was kostet dieses Dach?',
    kurz: 'Angebots-Kalkulation, Vertrag',
    art: 'haupt',
    weiter: 'M3',
    abstecher: [],
    eltern: null,
  },
  M3: {
    id: 'M3',
    titel: 'Aus dem Angebot wird ein Auftrag',
    kurz: 'Auftrag & Planung',
    art: 'haupt',
    weiter: 'M4',
    abstecher: ['B3.1', 'B3.2'],
    eltern: null,
  },
  'B3.1': {
    id: 'B3.1',
    titel: 'Bestellt wird nach Plan',
    kurz: 'Material bestellen',
    art: 'abstecher',
    weiter: 'M4',
    abstecher: [],
    eltern: 'M3',
  },
  'B3.2': {
    id: 'B3.2',
    titel: 'Vom Plan in den Kopf',
    kurz: '3D-Visualisierung',
    art: 'abstecher',
    weiter: 'M4',
    abstecher: [],
    eltern: 'M3',
  },
  M4: {
    id: 'M4',
    titel: 'Ein Balken, ein Maß',
    kurz: 'Material vorbereiten',
    art: 'haupt',
    weiter: 'M5',
    abstecher: ['B4.1'],
    eltern: null,
  },
  'B4.1': {
    id: 'B4.1',
    titel: 'Beladen',
    kurz: 'Lagerhalle, Beladen',
    art: 'abstecher',
    weiter: 'M5',
    abstecher: [],
    eltern: 'M4',
  },
  M5: {
    id: 'M5',
    titel: 'Aufrichten',
    kurz: 'Dach aufrichten I',
    art: 'haupt',
    weiter: 'M6',
    abstecher: ['B5.1'],
    eltern: null,
  },
  'B5.1': {
    id: 'B5.1',
    titel: 'Niemand macht das allein',
    kurz: 'Teamarbeit',
    art: 'abstecher',
    weiter: 'M6',
    abstecher: [],
    eltern: 'M5',
  },
  M6: {
    id: 'M6',
    titel: 'Halb zwölf',
    kurz: 'Mittagspause',
    art: 'haupt',
    weiter: 'M7',
    abstecher: [],
    eltern: null,
  },
  M7: {
    id: 'M7',
    titel: 'Jetzt du',
    kurz: 'Dach aufrichten II',
    art: 'haupt',
    weiter: 'M8',
    abstecher: [],
    eltern: null,
  },
  M8: {
    id: 'M8',
    titel: 'Feierabend',
    kurz: 'Feierabend',
    art: 'haupt',
    weiter: 'M9',
    abstecher: [],
    eltern: null,
  },
  M9: {
    id: 'M9',
    titel: 'Und danach?',
    kurz: 'Karriere-Schritte',
    art: 'haupt',
    weiter: 'M10',
    abstecher: ['B9.1', 'B9.2', 'B9.3'],
    eltern: null,
  },
  'B9.1': {
    id: 'B9.1',
    titel: 'Meister',
    kurz: 'Meister',
    art: 'abstecher',
    weiter: 'M10',
    abstecher: [],
    eltern: 'M9',
    immerOffen: true,
  },
  'B9.2': {
    id: 'B9.2',
    titel: 'Techniker',
    kurz: 'Techniker',
    art: 'abstecher',
    weiter: 'M10',
    abstecher: [],
    eltern: 'M9',
    immerOffen: true,
  },
  'B9.3': {
    id: 'B9.3',
    titel: 'Studium',
    kurz: 'Studium',
    art: 'abstecher',
    weiter: 'M10',
    abstecher: [],
    eltern: 'M9',
    immerOffen: true,
  },
  M10: {
    id: 'M10',
    titel: 'Dein nächster Schritt',
    kurz: 'CTA',
    art: 'haupt',
    weiter: null,
    abstecher: [],
    eltern: null,
  },
}

/** Alle Steps in Board-Reihenfolge — Abstecher direkt hinter ihrem Elternschritt. */
export const ALLE_STEPS: StepDef[] = Object.values(STEPS)

/** Die Hauptlinie in Erzählreihenfolge. Länge = Segmentzahl der Rail. */
export const HAUPTSCHRITTE: StepDef[] = ALLE_STEPS.filter((s) => s.art === 'haupt')

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
 *
 * Ein Abstecher ohne Elternschritt ist ein Datenfehler und keine Situation, aus
 * der sich sinnvoll weiterrechnen ließe: `railIndex` gäbe -1 zurück, die Leiste
 * zeigte „Schritt 0 von 10“, und `wegzustand` hielte plötzlich jeden Step für
 * besucht. Lieber laut scheitern, solange noch jemand zusieht.
 */
export function bezugsHauptschritt(id: StepId): StepId {
  const def = STEPS[id]
  if (def.art === 'haupt') return def.id
  if (def.eltern === null) {
    throw new Error(`Abstecher ${id} hat keinen Elternschritt.`)
  }
  return def.eltern
}

/**
 * Position in der Rail. Ein Abstecher hat kein eigenes Segment und zählt
 * deshalb wie sein Elternschritt (khpl-ui-shell.md 4).
 */
export function railIndex(id: StepId): number {
  const bezug = bezugsHauptschritt(id)
  return HAUPTSCHRITTE.findIndex((s) => s.id === bezug)
}
