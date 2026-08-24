import { baueGraph, type Angebot, type StepDef } from '@/khpl/flow/steps'
import type { BerufDef, StepBild } from './typen'

/**
 * Anlagenmechaniker/-mechanikerin SHK — der Tag als Route.
 *
 * Neun Hauptschritte, sechs Abstecher. Struktur, Reihenfolge, Übungen und
 * Texte stehen in `khpl-tag-anlagenmechanik.md` und sind dort am 24.08.2026
 * **abgenommen** (`VALIDIERT`); der Wortlaut unten ist von dort übernommen und
 * wird nicht neu erfunden.
 *
 * **Was diesen Tag von den anderen drei unterscheidet:** er wechselt den Ort.
 * Morgens eine Störung bei Frau Osei, danach die große Sanierung, dazwischen
 * Mittag im Transporter. `A1 → „Weiter zur zweiten Adresse"` ist der einzige
 * Weiter-Text der vier Tage, der einen Ortswechsel ankündigt — das ist die Form
 * dieses Tages in vier Wörtern.
 *
 * **Sein Id-Präfix ist `A`** (khpl-tage.md §6.1 V4): `A1`–`A9` auf der
 * Hauptlinie, Abstecher mit `.`-Suffix (`A8.1`).
 *
 * **Dieser Tag hat kein `three`** (Spec 7). Seine Bühnen sind Zeichnungen —
 * Anlagenausschnitt, Kellerschnitt, Gebäudeschnitt — und liegen unter
 * `buehne/anlagenmechanik/`.
 *
 * ⚠️ **Die Merkmale sind gesetzt, nicht recherchiert** und werden hier nicht
 * geändert (khpl-tage.md 5): wer einen Vektor anfasst, verschiebt die
 * Empfehlung für alle vier Berufe.
 */

/**
 * Das Id-Vokabular dieses Berufs — dieselbe Konstruktion wie beim Dachdecker:
 * die Union gehört zu den Daten und nicht in die Hülle, weil jeder der vier
 * Berufe seine eigene hat.
 */
type Id =
  | 'A1'
  | 'A1.1'
  | 'A2'
  | 'A3'
  | 'A3.1'
  | 'A4'
  | 'A4.1'
  | 'A5'
  | 'A6'
  | 'A7'
  | 'A8'
  | 'A8.1'
  | 'A8.2'
  | 'A8.3'
  | 'A9'

/** Bindet auch `weiter`, `eltern` und `abstecher` an die Ids. */
type AnlagenmechanikStep = Omit<StepDef, 'id' | 'weiter' | 'eltern' | 'abstecher'> & {
  id: Id
  weiter: Id | null
  eltern: Id | null
  abstecher: readonly Id[]
}

/**
 * Die Hauptlinie mit ihren Abstechern, Reihenfolge = Board-Reihenfolge.
 * Titel sind die Pointen aus Spec 3 und 4, `kurz` die Board-Namen aus
 * derselben Tabelle und aus dem Gesamtdiagramm (Spec 5).
 */
const STEPS = [
  {
    id: 'A1',
    titel: 'Kein warmes Wasser',
    kurz: 'Störungsdienst',
    art: 'haupt',
    weiter: 'A2',
    abstecher: ['A1.1'],
    eltern: null,
  },
  {
    id: 'A1.1',
    titel: 'Wer fährt eigentlich nachts?',
    kurz: 'Notdienst',
    art: 'abstecher',
    weiter: 'A2',
    abstecher: [],
    eltern: 'A1',
  },
  {
    id: 'A2',
    titel: 'Vierzig Jahre Keller',
    kurz: 'Bestandsaufnahme',
    art: 'haupt',
    weiter: 'A3',
    abstecher: [],
    eltern: null,
  },
  {
    id: 'A3',
    titel: 'Wie viel Wärme braucht ein Haus?',
    kurz: 'Heizlast',
    art: 'haupt',
    weiter: 'A4',
    abstecher: ['A3.1'],
    eltern: null,
  },
  {
    id: 'A3.1',
    titel: 'Wärmepumpe gegen Ölkessel',
    kurz: 'Wärmepumpe vs. Ölkessel',
    art: 'abstecher',
    weiter: 'A4',
    abstecher: [],
    eltern: 'A3',
  },
  {
    id: 'A4',
    titel: 'Der kürzeste Weg ist nicht der richtige',
    kurz: 'Leitungsführung',
    art: 'haupt',
    weiter: 'A5',
    abstecher: ['A4.1'],
    eltern: null,
  },
  {
    id: 'A4.1',
    titel: 'Löten, pressen, stecken',
    kurz: 'Verbindungstechniken',
    art: 'abstecher',
    weiter: 'A5',
    abstecher: [],
    eltern: 'A4',
  },
  {
    id: 'A5',
    titel: 'Halb eins, im Transporter',
    kurz: 'Mittag',
    art: 'haupt',
    weiter: 'A6',
    abstecher: [],
    eltern: null,
  },
  {
    id: 'A6',
    titel: 'Es läuft',
    kurz: 'Inbetriebnahme',
    art: 'haupt',
    weiter: 'A7',
    abstecher: [],
    eltern: null,
  },
  {
    id: 'A7',
    titel: 'Jetzt erklärst du es',
    kurz: 'Übergabe, Feierabend',
    art: 'haupt',
    weiter: 'A8',
    abstecher: [],
    eltern: null,
  },
  {
    id: 'A8',
    titel: 'Und danach?',
    kurz: 'Karriere-Schritte',
    art: 'haupt',
    weiter: 'A9',
    abstecher: ['A8.1', 'A8.2', 'A8.3'],
    eltern: null,
  },
  {
    id: 'A8.1',
    titel: 'Meister',
    kurz: 'Meister',
    art: 'abstecher',
    weiter: 'A9',
    abstecher: [],
    eltern: 'A8',
    immerOffen: true,
  },
  {
    id: 'A8.2',
    titel: 'Techniker',
    kurz: 'Techniker',
    art: 'abstecher',
    weiter: 'A9',
    abstecher: [],
    eltern: 'A8',
    immerOffen: true,
  },
  {
    id: 'A8.3',
    titel: 'Studium',
    kurz: 'Studium',
    art: 'abstecher',
    weiter: 'A9',
    abstecher: [],
    eltern: 'A8',
    immerOffen: true,
  },
  {
    id: 'A9',
    titel: 'Dein nächster Schritt',
    // Nicht „CTA“: `kurz` steht im Sheet und auf dem Weitermachen-Knopf des
    // Splash — Board-Sprache gehört nicht vor den Besucher.
    kurz: 'Dein nächster Schritt',
    art: 'haupt',
    weiter: null,
    abstecher: [],
    eltern: null,
  },
] as const satisfies readonly AnlagenmechanikStep[]

export const ANLAGENMECHANIKER: BerufDef = {
  id: 'anlagenmechaniker',
  name: 'Anlagenmechaniker/-mechanikerin SHK',
  kurz: 'Anlagenmechanik',
  zeile: 'Wärmepumpe statt Ölkessel. Du baust die Energiewende ein.',
  // Unverändert aus `berufe/angekuendigt.ts` übernommen (Spec 8). `sinn: 1` ist
  // der höchste Sinnwert im ganzen Angebot; A1 und A3 lösen ihn ein — zuerst
  // ein Mensch, dem geholfen wurde, dann die Bilanz.
  merkmale: {
    anpacken: 0.8,
    praezision: 0.7,
    technik: 0.85,
    draussen: 0.3,
    hoehe: 0.15,
    team: 0.5,
    sinn: 1,
  },
  medien: {
    karte: '/medien/media/anlagenmechaniker/card.webp',
    heroPoster: '/medien/media/anlagenmechaniker/hero-poster.webp',
    hero: '/medien/media/anlagenmechaniker/hero.mp4',
    // **Kein `szenario`.** Für die Auftragsannahme gibt es kein eigenes Video
    // (Spec 10); `Auftragsannahme` fällt von selbst auf Hero-Poster und
    // Hero-Loop zurück. Ein Eintrag auf eine Datei, die es nicht gibt, wäre ein
    // schwarzer Screen am Stand.
  },
  /**
   * Die Motivliste dieses Tages — am Stück, wie es die Redaktionsentscheidung
   * verlangt (typen.ts, `bilder`). Sie ist kurz, und das ist Absicht: **der Tag
   * ist überwiegend gezeichnet**, Fotos trägt er nur an wenigen Stellen
   * (Spec 7 und 10). Wo hier nichts steht, ist die Bühne eine Zeichnung — oder
   * es fehlt ein Motiv, und dann steht das unten.
   *
   * Jeder Eintrag zeigt auf eine Datei, die unter `public/medien/` **wirklich
   * liegt**; geprüft am 24.08.2026.
   *
   * ⚠️ **Drei Motive fehlen** (Spec 10): A1.1 (Notdienst), A5 (im Transporter)
   * und das Szenario-Video der Auftragsannahme. Sie bleiben ohne Eintrag —
   * diese Steps tragen dann keine Foto-Bühne. Ungenutzt und bewusst nicht
   * vergeben: `gallery-3.webp` (Umwälzpumpe und Regelung) und
   * `quiz-waermepumpe.webp` (Wärmepumpe an der Fassade).
   */
  bilder: {
    // Wärmepumpe im Garten — der Abstecher rechnet sie gegen den Ölkessel.
    'A3.1': { src: '/medien/media/anlagenmechaniker/gallery-1.webp', pos: '50% 50%' },
    // Rohrverteiler. ⚠️ Passt nur halb (Spec 10): der Abstecher handelt von
    // Löten, Pressen und Stecken, das Motiv zeigt das Ergebnis, nicht den
    // Handgriff. Bis ein besseres da ist, trägt es den Screen.
    'A4.1': { src: '/medien/media/anlagenmechaniker/gallery-2.webp', pos: '50% 50%' },
    // Die drei Karriere-Motive sind gewerkeneutral und gehören allen vier
    // Tagen gemeinsam (khpl-tage.md §6.1 V2).
    'A8.1': { src: '/medien/schritte/b91-meister.webp', pos: '50% 40%' },
    'A8.2': { src: '/medien/schritte/b92-techniker.webp', pos: '50% 40%' },
    'A8.3': { src: '/medien/schritte/b93-studium.webp', pos: '50% 40%' },
  } satisfies Partial<Record<Id, StepBild>>,
  /**
   * S5 — die Auftragsannahme, in-fiction, ohne Meta-Erklärung. Wortlaut aus
   * Spec 6, `VALIDIERT`.
   *
   * ⚠️ Der Name „Frau Osei" ist laut Spec ein Platzhalter und gehört mit der
   * Copy abgenommen. **Was nicht verhandelbar ist:** hier steht ein Mensch am
   * anderen Ende, kein „der Kunde".
   */
  auftrag: {
    etikett: 'Deine erste Adresse',
    titel: ['Zwei Adressen.', 'Ein Tag.'],
    text: 'Du bist Azubi im SHK-Betrieb. Sieben Uhr, der Transporter ist gepackt. Der Chef gibt dir einen Zettel: erst zu Frau Osei, da kommt kein warmes Wasser mehr. Danach die Große — Ölkessel raus, Wärmepumpe rein.',
    knopf: 'Einsteigen',
  },
  graph: baueGraph(STEPS, {
    erster: 'A1',
    /**
     * Einladungstexte wörtlich aus Spec 4 (`VALIDIERT`). Jeder Abstecher ist
     * einzeln getextet — nie eine „Mehr erfahren"-Schablone
     * (khpl-tage.md 1, Mechanismus 7).
     */
    angebote: {
      'A1.1': {
        einladung: 'Und wenn samstags die Heizung ausfällt?',
        beschreibung: 'Notdienst — wer fährt, und wie das bezahlt wird.',
      },
      'A3.1': {
        einladung: 'Lohnt sich das überhaupt?',
        beschreibung: 'Zwei Anlagen, dasselbe Haus, eine Rechnung.',
      },
      'A4.1': {
        einladung: 'Drei Arten, zwei Rohre zu verbinden',
        beschreibung: 'Löten, pressen, stecken — und wann was.',
      },
      'A8.1': { einladung: 'Meister', beschreibung: 'Eigener Betrieb, eigene Azubis.' },
      'A8.2': {
        einladung: 'Techniker',
        beschreibung: 'Planen und auslegen statt in den Keller.',
      },
      'A8.3': { einladung: 'Studium', beschreibung: 'Ja, das geht — auch ohne Abitur.' },
    } satisfies Partial<Record<Id, Angebot>>,
    /**
     * Weiter-Texte aus Spec 4 (`VALIDIERT`).
     *
     * Die drei Abstecher tragen **denselben** Text wie ihr Elternschritt und
     * nicht einen eigenen: sie münden in denselben nächsten Hauptschritt, und
     * wer den Notdienst-Abstecher gelesen hat, fährt danach genauso „zur
     * zweiten Adresse" wie der, der ihn übersprungen hat. Neue Formulierungen
     * wären an dieser Stelle erfundene Copy.
     */
    weiterTexte: {
      A1: 'Weiter zur zweiten Adresse',
      'A1.1': 'Weiter zur zweiten Adresse',
      A2: 'Weiter zum Rechnen',
      A3: 'Weiter zu den Rohren',
      'A3.1': 'Weiter zu den Rohren',
      A4: 'Weiter zur Pause',
      'A4.1': 'Weiter zur Pause',
      A5: 'Weiter in den Keller',
      A6: 'Weiter nach oben',
    } satisfies Partial<Record<Id, string>>,
    /**
     * Der Karriere-Link (Spec 4): `['A2', 'A4', 'A6']`.
     *
     * **Nicht auf A7** — A8 ist der nächste Schritt danach, und ein Abstecher,
     * der einen Schritt vor sein Ziel abkürzt, schickt den Besucher durch
     * denselben Bereich zweimal.
     */
    karriereSkipAuf: ['A2', 'A4', 'A6'],
    karriereBereich: ['A8', 'A8.1', 'A8.2', 'A8.3', 'A9'],
    karriereEinstieg: 'A8',
  }),
}
