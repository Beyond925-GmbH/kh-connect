import type { StepGraph } from '@/khpl/flow/steps'
import type { MerkmalVektor } from '@/khpl/match/merkmale'

/**
 * Ein Beruf ist Daten.
 *
 * Die App zeigte bis hierhin genau einen Beruf, und der stand als Konstanten
 * über `flow/`, `shell/` und `steps/` verteilt. Vier Berufe gehen so nicht:
 * jede Aussage über *diesen* Beruf — der Graph seines Tages, wo der
 * Karriere-Link auftaucht, welches Video der Splash zeigt — muss an einer
 * Stelle stehen, die man kopieren und füllen kann.
 *
 * Das ist diese Stelle. Ein neuer Beruf ist eine Datei in `berufe/` plus
 * Medien unter `public/medien/media/<id>/` — kein Eingriff in die Hülle.
 */

export type BerufId =
  'zimmerer' | 'dachdecker' | 'zerspanungsmechaniker' | 'anlagenmechaniker'

export interface BerufMedien {
  /** Standbild für die Karte in der Berufsliste. 16:9. */
  karte: string
  /** Poster des Hero-Loops — trägt den Screen, bis das Video da ist. */
  heroPoster: string
  /** Kurzer Loop, Ton egal (wird stumm abgespielt). Fehlt er, bleibt das Poster. */
  hero?: string
  /** Das längere Szenario-Video für die Auftragsannahme (S5). */
  szenario?: string
  szenarioPoster?: string
}

export interface BerufDef {
  id: BerufId
  /** Voll ausgeschrieben, wie die Innung ihn führt: „Zimmerer/Zimmerin“. */
  name: string
  /**
   * Ein Wort für Leiste, Karte und Sheet. Die Langform passt in keine Pille
   * und liest sich auf einem Knopf wie ein Formularfeld.
   */
  kurz: string
  /** Eine Zeile für die Karte in der Berufsliste. Kein Werbesatz, ein Bild. */
  zeile: string
  /**
   * Wofür dieser Beruf im Matching steht — 0..1 je Merkmal.
   *
   * Nicht als Selbstbeschreibung gedacht, sondern als Vergleichsgröße gegen
   * den Vektor des Besuchers (`match/matching.ts`). Zwei Berufe dürfen sich
   * ähneln; sie dürfen nur nicht identisch sein, sonst entscheidet Rauschen.
   */
  merkmale: MerkmalVektor
  medien: BerufMedien
  /**
   * Der Tagesablauf. **`null` heißt: angekündigt, aber noch nicht gebaut.**
   *
   * Der Unterschied ist absichtlich im Typ und nicht in einem Flag: jede
   * Stelle, die einen Graphen braucht, muss den Fall behandeln, in dem es
   * keinen gibt — die Berufsliste, der Vorschlag, der Wiedereinstieg. Ein
   * boolesches `fertig` hätte dieselbe Information getragen und keine einzige
   * dieser Stellen zum Nachdenken gezwungen.
   */
  graph: StepGraph | null
  /** Der Einstiegs-Screen (S5) — in-fiction, ohne Meta-Erklärung. */
  auftrag?: {
    etikett: string
    /** Zwei Zeilen; die zweite steht in Orange. */
    titel: readonly [string, string]
    text: string
    knopf: string
  }
}
