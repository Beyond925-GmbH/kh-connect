import { baueGraph, type Angebot, type StepDef } from '@/khpl/flow/steps'
import type { BerufDef, StepBild } from './typen'

/**
 * Zerspanungsmechaniker/-mechanikerin — der Tag als Route.
 *
 * Neun Hauptschritte, sechs Abstecher. **Sein Id-Präfix ist `Z`**
 * (khpl-tage.md §6.1 V4): `Z1`–`Z9` auf der Hauptlinie, Abstecher mit
 * `.`-Suffix (`Z3.1`).
 *
 * **Was diesen Tag von den anderen drei unterscheidet:** er hat keinen
 * Kunden und keinen Ortswechsel — er hat eine Maschine und ein Maß. Die
 * Dramaturgie ist die einer Serie: ein Auftrag (200 Teile), und alles läuft
 * auf die Freigabe des ersten Teils zu (Z4), denn ab da wird jeder Fehler
 * zweihundertmal gebaut. Der Feierabend ist eine Übergabe: die Maschine
 * läuft weiter, wenn man geht — kein anderer Tag endet so.
 *
 * **Dieser Tag hat kein `three`.** Seine Bühnen sind Zeichnungen —
 * technische Zeichnung, Werkzeugweg, Messschraube — und liegen unter
 * `buehne/zerspanung/`.
 *
 * **Er ist ein Industrieberuf (IHK), kein Handwerk.** Das trägt bis in die
 * Karrieretexte: Industriemeister:in Metall statt Handwerksmeister, keine
 * NRW-Meisterprämie (`steps/zerspanung/karrierewege.ts`).
 */

/** Das Id-Vokabular dieses Berufs — dieselbe Konstruktion wie überall. */
type Id =
  | 'Z1'
  | 'Z1.1'
  | 'Z2'
  | 'Z3'
  | 'Z3.1'
  | 'Z4'
  | 'Z5'
  | 'Z6'
  | 'Z6.1'
  | 'Z7'
  | 'Z8'
  | 'Z8.1'
  | 'Z8.2'
  | 'Z8.3'
  | 'Z9'

/** Bindet auch `weiter`, `eltern` und `abstecher` an die Ids. */
type ZerspanungStep = Omit<StepDef, 'id' | 'weiter' | 'eltern' | 'abstecher'> & {
  id: Id
  weiter: Id | null
  eltern: Id | null
  abstecher: readonly Id[]
}

/** Die Hauptlinie mit ihren Abstechern, Reihenfolge = Board-Reihenfolge. */
const STEPS = [
  {
    id: 'Z1',
    titel: 'Das Teil gibt es noch nicht',
    kurz: 'Zeichnung',
    art: 'haupt',
    weiter: 'Z2',
    abstecher: ['Z1.1'],
    eltern: null,
  },
  {
    id: 'Z1.1',
    titel: 'Warum so genau?',
    kurz: 'Passungen',
    art: 'abstecher',
    weiter: 'Z2',
    abstecher: [],
    eltern: 'Z1',
  },
  {
    id: 'Z2',
    titel: 'Fest, sonst fliegt es',
    kurz: 'Rüsten',
    art: 'haupt',
    weiter: 'Z3',
    abstecher: [],
    eltern: null,
  },
  {
    id: 'Z3',
    titel: 'Vier Sätze, ein Weg',
    kurz: 'Programm',
    art: 'haupt',
    weiter: 'Z4',
    abstecher: ['Z3.1'],
    eltern: null,
  },
  {
    id: 'Z3.1',
    titel: 'Ein Tippfehler in Stahl',
    kurz: 'Einfahren',
    art: 'abstecher',
    weiter: 'Z4',
    abstecher: [],
    eltern: 'Z3',
  },
  {
    id: 'Z4',
    titel: 'Das erste Teil entscheidet',
    kurz: 'Probeteil',
    art: 'haupt',
    weiter: 'Z5',
    abstecher: [],
    eltern: null,
  },
  {
    id: 'Z5',
    titel: 'Halb zehn, Pausenraum',
    kurz: 'Pause',
    art: 'haupt',
    weiter: 'Z6',
    abstecher: [],
    eltern: null,
  },
  {
    id: 'Z6',
    titel: 'Jetzt macht sie es 200-mal',
    kurz: 'Serie',
    art: 'haupt',
    weiter: 'Z7',
    abstecher: ['Z6.1'],
    eltern: null,
  },
  {
    id: 'Z6.1',
    titel: 'Wo landen deine Teile?',
    kurz: 'Teile & Späne',
    art: 'abstecher',
    weiter: 'Z7',
    abstecher: [],
    eltern: 'Z6',
  },
  {
    id: 'Z7',
    titel: 'Halb drei, Übergabe',
    kurz: 'Feierabend',
    art: 'haupt',
    weiter: 'Z8',
    abstecher: [],
    eltern: null,
  },
  {
    id: 'Z8',
    titel: 'Und danach?',
    kurz: 'Karriere-Schritte',
    art: 'haupt',
    weiter: 'Z9',
    abstecher: ['Z8.1', 'Z8.2', 'Z8.3'],
    eltern: null,
  },
  {
    id: 'Z8.1',
    titel: 'Industriemeister',
    kurz: 'Industriemeister',
    art: 'abstecher',
    weiter: 'Z9',
    abstecher: [],
    eltern: 'Z8',
    immerOffen: true,
  },
  {
    id: 'Z8.2',
    titel: 'Techniker',
    kurz: 'Techniker',
    art: 'abstecher',
    weiter: 'Z9',
    abstecher: [],
    eltern: 'Z8',
    immerOffen: true,
  },
  {
    id: 'Z8.3',
    titel: 'Studium',
    kurz: 'Studium',
    art: 'abstecher',
    weiter: 'Z9',
    abstecher: [],
    eltern: 'Z8',
    immerOffen: true,
  },
  {
    id: 'Z9',
    titel: 'Dein nächster Schritt',
    kurz: 'Dein nächster Schritt',
    art: 'haupt',
    weiter: null,
    abstecher: [],
    eltern: null,
  },
] as const satisfies readonly ZerspanungStep[]

export const ZERSPANUNGSMECHANIKER: BerufDef = {
  id: 'zerspanungsmechaniker',
  name: 'Zerspanungsmechaniker/-mechanikerin',
  kurz: 'Zerspanung',
  zeile: 'Metall auf den Hundertstel. Du programmierst, die CNC fräst.',
  /**
   * ⚠️ **Unverändert.** Der Vektor speist den Trichter; wer ihn ändert, ändert
   * die Empfehlung für alle vier Berufe (khpl-tage.md §5).
   */
  merkmale: {
    anpacken: 0.5,
    praezision: 1,
    technik: 1,
    draussen: 0.05,
    hoehe: 0.05,
    team: 0.4,
    sinn: 0.3,
  },
  medien: {
    karte: '/medien/media/zerspanungsmechaniker/card.webp',
    heroPoster: '/medien/media/zerspanungsmechaniker/hero-poster.webp',
    hero: '/medien/media/zerspanungsmechaniker/hero.mp4',
    // Kein `szenario`: für die Auftragsannahme gibt es kein eigenes Video —
    // sie fällt von selbst auf Hero-Poster und Hero-Loop zurück.
  },
  /**
   * Die Motivliste dieses Tages — am Stück, wie die Redaktionsentscheidung
   * es verlangt (`typen.ts`, `bilder`). Sie ist kurz, und das ist Absicht:
   * die drei Übungs-Kerne des Tages sind **gezeichnet** (Z1 technische
   * Zeichnung, Z3 Werkzeugweg, Z4 Messschraube — `buehne/zerspanung/`),
   * dort steht kein Foto dahinter.
   *
   * Jeder Eintrag zeigt auf eine Datei, die unter `public/medien/` wirklich
   * liegt (geprüft am 28.08.2026); Motivbeschreibungen in
   * `MEDIEN-INVENTAR.md`, Herkunft in `MEDIEN.md`. Kein Motiv doppelt sich
   * innerhalb des Tages; `card.webp` trägt Z5, weil es das einzige Motiv
   * mit Menschen ist — und die Pause der menschliche Moment dieses Tages.
   *
   * `b91-meister.webp` (gewerkeneutrale Karriere-Motive) ist bewusst
   * **nicht** verwendet: das Bild zeigt eine Holzwerkstatt und passt nicht
   * vor einen Metallberuf. Z8.1 trägt stattdessen das eigene Meister-Motiv.
   */
  bilder: {
    // Werkzeug über dem Stahlmaßstab — Präzision als Bild.
    'Z1.1': {
      src: '/medien/media/zerspanungsmechaniker/quiz-praezision.webp',
      pos: '50% 50%',
    },
    // Gespanntes Teil im Dreibackenfutter — genau der Handgriff von Z2.
    Z2: {
      src: '/medien/media/zerspanungsmechaniker/schaetzen-spindel.webp',
      pos: '50% 45%',
    },
    // Bediener wacht an der dunklen Maschine — das Einfahren.
    'Z3.1': { src: '/medien/media/zerspanungsmechaniker/gallery-2.webp', pos: '50% 40%' },
    // Drei aus der Schicht, ein Bildschirm — die Pause redet.
    Z5: { src: '/medien/media/zerspanungsmechaniker/card.webp', pos: '50% 30%' },
    // Die Kiste voller gleicher Teile — die Serie als Bild.
    Z6: { src: '/medien/media/zerspanungsmechaniker/z6-kiste.webp', pos: '50% 55%' },
    // Fräser und fliegende Späne — wohin mit ihnen, fragt der Abstecher.
    'Z6.1': { src: '/medien/media/zerspanungsmechaniker/gallery-1.webp', pos: '50% 50%' },
    // Messwerkzeuge, abgelegt auf dunklem Grund — der Tag ist durch.
    Z7: { src: '/medien/media/zerspanungsmechaniker/z4-messraum.webp', pos: '50% 45%' },
    // Kühlschmierstoff in voller Fahrt — der Beruf in Bewegung.
    Z8: { src: '/medien/media/zerspanungsmechaniker/gallery-3.webp', pos: '40% 50%' },
    // Ein Älterer erklärt einem Jüngeren etwas an der Werkbank.
    'Z8.1': {
      src: '/medien/media/zerspanungsmechaniker/z7-meister.webp',
      pos: '50% 40%',
    },
    // Die zwei gewerkeneutralen Karriere-Motive (khpl-tage.md §6.1 V2).
    'Z8.2': { src: '/medien/schritte/b92-techniker.webp', pos: '50% 40%' },
    'Z8.3': { src: '/medien/schritte/b93-studium.webp', pos: '50% 40%' },
    // Der CTA: die drehende Welle aus dem Hero, unter der Markenzone.
    Z9: { src: '/medien/media/zerspanungsmechaniker/hero-poster.webp', pos: '50% 50%' },
  } satisfies Partial<Record<Id, StepBild>>,
  /** S5 — die Auftragsannahme, in-fiction, ohne Meta-Erklärung. */
  auftrag: {
    etikett: 'Deine Maschine',
    titel: ['200 Teile.', 'Ein Hundertstel.'],
    text: 'Du bist Azubi in der Zerspanung. Sechs Uhr, die Halle riecht nach Kühlschmierstoff, deine Maschine ist noch kalt. Der Ausbilder legt dir eine Zeichnung hin: 200 Bolzen für ein Getriebe, bis Freitag. Ab dem ersten Span bist du dran.',
    knopf: 'Schicht übernehmen',
  },
  graph: baueGraph(STEPS, {
    erster: 'Z1',
    /** Jeder Abstecher einzeln getextet — nie eine Schablone. */
    angebote: {
      'Z1.1': {
        einladung: 'Warum so genau?',
        beschreibung: 'Passungen — wie Tausendstel entscheiden, ob ein Lager sitzt.',
      },
      'Z3.1': {
        einladung: 'Und wenn du dich vertippst?',
        beschreibung: 'Was ein Crash kostet — und das Verfahren dagegen.',
      },
      'Z6.1': {
        einladung: 'Wo landen deine Teile?',
        beschreibung: 'Vom Getriebe bis zur Späne-Kiste — nichts endet im Müll.',
      },
      'Z8.1': {
        einladung: 'Industriemeister',
        beschreibung: 'Die Schicht führen, Azubis ausbilden.',
      },
      'Z8.2': {
        einladung: 'Techniker',
        beschreibung: 'Fertigung planen statt rüsten.',
      },
      'Z8.3': { einladung: 'Studium', beschreibung: 'Ja, das geht — auch ohne Abitur.' },
    } satisfies Partial<Record<Id, Angebot>>,
    /**
     * Weiter-Texte als Ortsangaben des Tages. Die Abstecher tragen denselben
     * Text wie ihr Elternschritt: sie münden in denselben nächsten
     * Hauptschritt.
     */
    weiterTexte: {
      Z1: 'Weiter an die Maschine',
      'Z1.1': 'Weiter an die Maschine',
      Z2: 'Weiter zum Programm',
      Z3: 'Weiter zum ersten Teil',
      'Z3.1': 'Weiter zum ersten Teil',
      Z4: 'Weiter in die Pause',
      Z5: 'Weiter zur Serie',
      Z6: 'Weiter zum Feierabend',
      'Z6.1': 'Weiter zum Feierabend',
    } satisfies Partial<Record<Id, string>>,
    /**
     * Der Karriere-Link auf drei ruhigen Stellen der ersten Tageshälfte —
     * nicht auf Z7: Z8 ist der nächste Schritt danach, und ein Abstecher,
     * der einen Schritt vor sein Ziel abkürzt, schickt den Besucher durch
     * denselben Bereich zweimal.
     */
    karriereSkipAuf: ['Z2', 'Z4', 'Z6'],
    karriereBereich: ['Z8', 'Z8.1', 'Z8.2', 'Z8.3', 'Z9'],
    karriereEinstieg: 'Z8',
  }),
}
