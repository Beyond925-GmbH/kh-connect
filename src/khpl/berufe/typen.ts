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

/**
 * **Jeder Beruf hat sein eigenes Step-Id-Präfix.**
 *
 * | Beruf | Präfix | Beispiel |
 * | --- | --- | --- |
 * | Dachdecker | `M` / `B` | `M5`, `B5.1` |
 * | Zimmerer | `C` | `C5`, `C5.1` |
 * | Zerspanung | `Z` | `Z5`, `Z3.1` |
 * | Anlagenmechanik | `A` | `A5`, `A5.1` |
 *
 * Der Grund ist nicht Ordnungsliebe. Vier Berufe mit vier verschiedenen `M5`
 * sind in Logs, im `answers`-Objekt und in jedem Debug-Blick nicht
 * auseinanderzuhalten — und `store/fortschritt.ts` führt `Antworten` und
 * `pruefeAntworten` für alle vier gemeinsam. Erst disjunkte Präfixe machen
 * `m1`, `c1`, `z1` und `a1` zu vier Schlüsseln statt zu einem Streit.
 *
 * Der Dachdecker behält `M`/`B`: er ist gebaut, und es gibt keinen Grund, den
 * einzigen fertigen Tag dafür anzufassen. Sichtbar ist davon ohnehin nichts —
 * die Rail zeigt „Schritt 4 von 9“, nie eine Id.
 */
export type BerufId =
  'zimmerer' | 'dachdecker' | 'zerspanungsmechaniker' | 'anlagenmechaniker'

/**
 * Ein Motiv für einen Step, mit Bildmittelpunkt.
 *
 * **`pos` ist kein Stil, sondern Bildinhalt.** `object-fit: cover` schneidet
 * quer und hoch unterschiedlich zu: ein Motiv, dessen Person am rechten Rand
 * steht, verliert sie auf dem Handy hochkant. Deshalb steht der Bildmittelpunkt
 * je Foto hier und nicht im Layout.
 */
export interface StepBild {
  src: string
  /** `object-position`, z. B. `'50% 40%'`. Ohne Angabe: mittig. */
  pos?: string
}

export interface BerufMedien {
  /** Standbild für die Karte in der Berufsliste. 16:9. */
  karte: string
  /** Poster des Hero-Loops — trägt den Screen, bis das Video da ist. */
  heroPoster: string
  /** Kurzer Loop, Ton egal (wird stumm abgespielt). Fehlt er, bleibt das Poster. */
  hero?: string
  /** Das längere Szenario-Video für die Auftragsannahme. */
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
   * Welches Motiv welcher Step trägt — die Motivliste dieses Berufs.
   *
   * Stand bis zum Parallelbau als flacher `Record<StepId, Bild>` in
   * `buehne/Foto.tsx`. Vier Berufe mit je einem `M1` sprengen das, deshalb
   * hängt die Liste jetzt am Beruf und `StepFoto` liest sie über den aktiven.
   * Das redaktionelle Argument bleibt gewahrt: je
   * Beruf steht die Liste weiterhin an einem Stück, nur eben in seiner Datei —
   * man muss überblicken können, welcher Screen noch kein eigenes Bild hat und
   * wo sich ein Motiv doppelt. Herkunft und Urheber:innen jeder Datei stehen
   * in `MEDIEN.md`.
   *
   * Ein Step ohne Eintrag trägt keine Foto-Bühne. Beim Dachdecker sind das
   * B3.2, M5 und M7: dort *ist* die Bühne die Interaktion, nämlich das
   * 3D-Modell.
   */
  bilder: Readonly<Record<string, StepBild>>
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
  /**
   * Takt 1 und 2 der Auftragsannahme — die Meta-Erklärung vor der Geschichte.
   *
   * Der Screen war lange rein in-fiction; am Stand zeigte sich, dass viele mit
   * dem ersten Step anfingen, ohne zu wissen, was der Beruf überhaupt ist.
   * Deshalb erklärt er jetzt in zwei Takten erst den Beruf und seinen Ort,
   * bevor `auftrag` die Fiktion setzt (Begründung ausführlich in
   * `shell/Auftragsannahme.tsx`).
   *
   * Die Inhalte gehören zum Beruf, nicht zur Hülle — dieselbe Aufteilung wie
   * bei `auftrag`. Fehlt das Feld, zeigt der Screen nur den Fiktions-Takt:
   * ein Beruf soll begehbar sein, sobald sein Graph steht, auch wenn die Copy
   * fehlt.
   *
   * Heißt bewusst **nicht** `intro`: `bilder.intro` ist bereits vergeben —
   * das Motiv des Intro-Screens. Zwei Felder gleichen Namens mit Bild- und
   * Textinhalt wären in jedem Diff eine Verwechslung.
   */
  vorstellung?: {
    /**
     * Takt 1: Zwei Zeilen, die zweite in Orange (wie `auftrag.titel`).
     * Je Beruf getextet statt aus `kurz` gebaut: „Du hast dir Zerspanung
     * ausgesucht“ ohne Artikel liest sich als Plakat kaputt — der Satz
     * braucht je Beruf seinen eigenen Artikel und Fall.
     */
    titel: readonly [string, string]
    /** Takt 1: Was dieser Beruf IST — ein Satz, Alltagssprache. */
    was: string
    /**
     * Takt 1: 2–4 typische Aufgaben. Konkret und greifbar („Rohre so
     * verlegen, dass nichts tropft“), keine Broschürensätze.
     */
    aufgaben: readonly string[]
    /** Takt 2: Wo man in diesem Beruf arbeitet und wie es dort ist. */
    umgebung: {
      /** Zwei Zeilen; die zweite steht in Orange (wie `auftrag.titel`). */
      titel: readonly [string, string]
      text: string
    }
  }
  /**
   * Takt 3 der Auftragsannahme — der In-Fiction-Einstieg: „Heute bist du
   * Azubi, dein Auftrag ist …“. Ab hier spricht die Geschichte, nicht mehr
   * die App.
   */
  auftrag?: {
    etikett: string
    /** Zwei Zeilen; die zweite steht in Orange. */
    titel: readonly [string, string]
    text: string
    knopf: string
  }
}
