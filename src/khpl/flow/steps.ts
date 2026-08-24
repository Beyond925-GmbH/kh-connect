/**
 * Die **Form** eines Berufs-Graphen aus khpl-flow.md 2–4 — nicht mehr seine
 * Daten.
 *
 * Bis zur Einführung der vier Berufe stand hier der Zimmerer-Graph als
 * Konstante. Er liegt jetzt in `berufe/zimmerer.ts`, und diese Datei trägt nur
 * noch die Typen und die Rechenregeln, die für **jeden** Beruf gelten. Was
 * dabei ausdrücklich erhalten bleibt:
 *
 * - Regel 3 des Boards: ein Abstecher springt nicht zurück, sondern mündet in
 *   denselben nächsten Hauptschritt wie sein Elternschritt. Deshalb trägt jeder
 *   Step nur ein `weiter` — der Unterschied zwischen Haupt und Abstecher steckt
 *   allein in `art`.
 * - Die Rail zählt `graph.haupt.length`, nie eine Konstante: khpl-ui-shell.md 9
 *   hält ausdrücklich fest, dass die Segmentzahl datengetrieben bleiben muss.
 *   Mit vier Berufen ist sie zusätzlich pro Beruf verschieden.
 *
 * **`StepId` ist jetzt `string`, und das ist kein Nachlassen.** Die
 * Ausschöpfungsprüfung, die die Vorfassung über eine geschlossene Union hatte,
 * wandert dorthin, wo die Daten liegen: `berufe/zimmerer.ts` deklariert seine
 * eigene Union und prüft die Steps mit `satisfies` dagegen. Eine gemeinsame
 * Union über vier Berufe wäre dagegen keine Prüfung, sondern eine Kollision —
 * jeder Beruf hat ein M5, und keines davon ist dasselbe.
 */

export type StepId = string

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
  /** Nächster Step. `null` nur am Ende der Hauptlinie. */
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
 * Der Text eines Abstecher-Angebots.
 *
 * Er steht am Graphen und nicht am Step, weil ein Abstecher von zwei Stellen
 * aus angeboten wird: von seinem Elternschritt **und** von seinem
 * Geschwister-Abstecher (khpl-ui-shell.md 5).
 */
export interface Angebot {
  /** Das, was auf dem Button steht. */
  einladung: string
  /**
   * Die Zeile darunter — im Wege-Dialog die Erklärung unter der Einladung.
   * Ohne sie ist „Woher kommt das Holz?“ nur eine Frage; mit ihr steht
   * daneben, was einen hinter dem Tap erwartet.
   */
  beschreibung: string
}

/**
 * Ein fertig gerechneter Tagesablauf. Wird einmal je Beruf über `baueGraph`
 * erzeugt und danach nur noch gelesen.
 */
export interface StepGraph {
  steps: Readonly<Record<StepId, StepDef>>
  /** Alle Steps in Board-Reihenfolge — Abstecher direkt hinter ihrem Elternschritt. */
  alle: readonly StepDef[]
  /** Die Hauptlinie in Erzählreihenfolge. Länge = Segmentzahl der Rail. */
  haupt: readonly StepDef[]
  erster: StepId
  /**
   * Hauptschritte, auf denen der Karriere-Link erscheint (khpl-ui-shell.md 6).
   *
   * Stand vorher als `SKIP_AUF` in `StepShell` — also in der Hülle, obwohl es
   * eine Aussage über den Tagesablauf eines bestimmten Berufs ist. Ein Beruf
   * mit fünf Stationen will den Link nicht an denselben Stellen wie einer mit
   * zehn.
   */
  karriereSkipAuf: readonly StepId[]
  /**
   * Der Karriere-Bereich — der Teil des Graphen, den der Skip öffnet. Wer ihn
   * verlässt, hat den Skip beendet (siehe `skipStand` im Store).
   */
  karriereBereich: readonly StepId[]
  /** Wo der Karriere-Skip landet. */
  karriereEinstieg: StepId
  /**
   * Einladungstexte der Abstecher.
   *
   * Lagen bis zu den vier Berufen als Tabelle in `uebergaenge.ts`, nach
   * StepId geschlüsselt — und jeder Beruf hat ein B3.1. Der Dachdecker hätte
   * dort „Woher kommt das Holz?“ geerbt, ohne dass irgendwo etwas rot wird.
   */
  angebote: Readonly<Record<StepId, Angebot>>
  /** Text der Hauptlinien-Fortsetzung. Ohne Eintrag schlicht „Weiter“. */
  weiterTexte: Readonly<Record<StepId, string>>
}

export interface GraphKonfig {
  erster: StepId
  karriereSkipAuf: readonly StepId[]
  karriereBereich: readonly StepId[]
  karriereEinstieg: StepId
  angebote: Readonly<Record<StepId, Angebot>>
  weiterTexte: Readonly<Record<StepId, string>>
}

/**
 * Baut den Graphen aus einer Step-Liste. Die Reihenfolge der Liste **ist** die
 * Board-Reihenfolge; `haupt` und die Segmentzahl der Rail fallen daraus ab.
 *
 * **Und prüft ihn.** Die Vorfassung hielt den Graphen als
 * `Record<StepId, StepDef>` und ließ den Compiler einen fehlenden Eintrag
 * melden. Mit vier Berufen gibt es diese eine Union nicht mehr — dafür prüft
 * das hier jetzt, was der Compiler nie geprüft hat: ein `weiter`, ein `eltern`
 * oder ein `abstecher`, der ins Leere zeigt. Genau das ist der Fehler, den man
 * beim Schreiben eines neuen Berufs macht, und er fällt beim ersten Rendern
 * auf, nicht erst bei dem Besucher, der den Abstecher nimmt.
 */
export function baueGraph(alle: readonly StepDef[], konfig: GraphKonfig): StepGraph {
  const steps: Record<StepId, StepDef> = {}
  for (const s of alle) steps[s.id] = s

  const pruefe = (id: StepId | null, wo: string) => {
    if (id !== null && !Object.hasOwn(steps, id)) {
      throw new Error(`${wo} zeigt auf den unbekannten Step „${id}“.`)
    }
  }
  for (const s of alle) {
    pruefe(s.weiter, `${s.id}.weiter`)
    pruefe(s.eltern, `${s.id}.eltern`)
    s.abstecher.forEach((a) => pruefe(a, `${s.id}.abstecher`))
  }
  Object.keys(konfig.angebote).forEach((id) => pruefe(id, 'angebote'))
  Object.keys(konfig.weiterTexte).forEach((id) => pruefe(id, 'weiterTexte'))
  pruefe(konfig.erster, 'erster')
  pruefe(konfig.karriereEinstieg, 'karriereEinstieg')
  konfig.karriereSkipAuf.forEach((id) => pruefe(id, 'karriereSkipAuf'))
  konfig.karriereBereich.forEach((id) => pruefe(id, 'karriereBereich'))

  return {
    steps,
    alle,
    haupt: alle.filter((s) => s.art === 'haupt'),
    ...konfig,
  }
}

export function istStepId(graph: StepGraph, wert: unknown): wert is StepId {
  return typeof wert === 'string' && Object.hasOwn(graph.steps, wert)
}

/**
 * Ein Step im Graphen. Eine unbekannte Id ist ein Datenfehler und keine
 * Situation, aus der sich sinnvoll weiterrechnen ließe — lieber laut scheitern,
 * solange noch jemand zusieht.
 */
export function step(graph: StepGraph, id: StepId): StepDef {
  const def = graph.steps[id]
  if (!def) throw new Error(`Unbekannter Step „${id}“.`)
  return def
}

export function istHaupt(graph: StepGraph, id: StepId): boolean {
  return step(graph, id).art === 'haupt'
}

/**
 * Der Hauptschritt, unter dem dieser Step einsortiert wird — er selbst, wenn er
 * einer ist, sonst sein Elternschritt.
 *
 * Ein Abstecher ohne Elternschritt ist ein Datenfehler und keine Situation, aus
 * der sich sinnvoll weiterrechnen ließe: `railIndex` gäbe -1 zurück, die Leiste
 * zeigte „Schritt 0 von 10“, und `wegzustand` hielte plötzlich jeden Step für
 * besucht.
 */
export function bezugsHauptschritt(graph: StepGraph, id: StepId): StepId {
  const def = step(graph, id)
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
export function railIndex(graph: StepGraph, id: StepId): number {
  const bezug = bezugsHauptschritt(graph, id)
  return graph.haupt.findIndex((s) => s.id === bezug)
}
