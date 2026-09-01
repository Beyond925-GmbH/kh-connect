import { baueGraph, type Angebot, type StepDef } from '@/khpl/flow/steps'
import type { BerufDef, StepBild } from './typen'

/**
 * Zerspanungsmechaniker/-mechanikerin — der Tag als Route.
 *
 * Neun Hauptschritte, sechs Abstecher. **Sein Id-Präfix ist `Z`**: `Z1`–`Z9`
 * auf der Hauptlinie, Abstecher mit `.`-Suffix (`Z3.1`).
 *
 * **Was diesen Tag von den anderen drei unterscheidet:** er hat keinen
 * Kunden und keinen Ortswechsel — er hat eine Maschine und ein Maß. Die
 * Dramaturgie ist die einer Serie: ein Auftrag (200 Teile), und alles läuft
 * auf die Freigabe des ersten Teils zu (Z4), denn ab da wird jeder Fehler
 * zweihundertmal gebaut. Der Feierabend ist eine Übergabe: die Maschine
 * läuft weiter, wenn man geht — kein anderer Tag endet so.
 *
 * **Dieser Tag hat kein `three`.** Seine Bühnen sind Zeichnungen —
 * Genauigkeits-Leiter, technische Zeichnung, Werkzeugweg, Messschraube — und
 * liegen unter `buehne/zerspanung/`.
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
    titel: 'Wie viel darf danebenliegen?',
    kurz: 'Genauigkeit',
    art: 'haupt',
    weiter: 'Z2',
    abstecher: ['Z1.1'],
    eltern: null,
  },
  {
    id: 'Z1.1',
    titel: 'Locker, satt oder fest',
    kurz: 'Zusammensitzen',
    art: 'abstecher',
    weiter: 'Z2',
    abstecher: [],
    eltern: 'Z1',
  },
  {
    id: 'Z2',
    titel: 'Fest, sonst fliegt es',
    kurz: 'Einrichten',
    art: 'haupt',
    weiter: 'Z3',
    abstecher: [],
    eltern: null,
  },
  {
    id: 'Z3',
    titel: 'Die Sprache der Maschine',
    kurz: 'Programm',
    art: 'haupt',
    weiter: 'Z4',
    abstecher: ['Z3.1'],
    eltern: null,
  },
  {
    id: 'Z3.1',
    titel: 'Ein Tippfehler in Stahl',
    kurz: 'Testlauf',
    art: 'abstecher',
    weiter: 'Z4',
    abstecher: [],
    eltern: 'Z3',
  },
  {
    id: 'Z4',
    titel: 'Das erste Teil entscheidet',
    kurz: 'Erstes Teil',
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
  zeile:
    'Metall auf ein Hundertstel genau — dünner als ein Haar. Du programmierst, die Maschine fräst.',
  /**
   * **Der Merkmalsvektor bleibt, wie er war.** Er speist den Trichter; wer ihn
   * ändert, ändert die Empfehlung für alle vier Berufe.
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
   * Die Motivliste dieses Tages — am Stück, damit die Redaktionsentscheidung
   * an einer einzigen Stelle fällt (`typen.ts`, `bilder`). Sie ist kurz, und
   * das ist Absicht: die drei Übungs-Kerne des Tages sind **gezeichnet** (Z1
   * technische Zeichnung, Z3 Werkzeugweg, Z4 Messschraube —
   * `buehne/zerspanung/`), dort steht kein Foto dahinter. Z3 trägt sein Foto
   * nur im ersten Kapitel — die Maschine kennenlernen —, danach übernimmt die
   * Zeichnung.
   *
   * Jeder Eintrag zeigt auf eine Datei, die unter `public/medien/` wirklich
   * liegt (geprüft am 28.08.2026); Motivbeschreibungen in
   * `MEDIEN-INVENTAR.md`, Herkunft in `MEDIEN.md`. Kein Motiv doppelt sich
   * innerhalb des Tages — mit zwei bewussten Ausnahmen: Z3 und sein
   * Abstecher Z3.1 teilen sich den Bediener an der Maschine, denn beide
   * Screens spielen an derselben Stelle der Halle; Z1 und Z7 teilen sich die
   * abgelegten Messwerkzeuge als Klammer um den Tag (siehe dort). `card.webp` trägt Z5,
   * weil es das einzige Motiv mit Menschen in der Runde ist — und die Pause
   * der menschliche Moment dieses Tages.
   *
   * `b91-meister.webp` (gewerkeneutrale Karriere-Motive) ist bewusst
   * **nicht** verwendet: das Bild zeigt eine Holzwerkstatt und passt nicht
   * vor einen Metallberuf. Z8.1 trägt stattdessen das eigene Meister-Motiv.
   */
  bilder: {
    // Messwerkzeuge auf dunklem Grund — die Werkbank unter der
    // Genauigkeits-Leiter. **Das einzige bewusst doppelte Motiv dieses
    // Tages neben Z3/Z3.1:** es trägt auch Z7. Die beiden liegen an den
    // Enden des Tages und zeigen dasselbe Werkzeug in zwei Rollen — morgens
    // die Frage, wie genau es sein muss, abends dieselben Lehren, abgelegt.
    // Auf Z1 läuft es stark abgedunkelt hinter der Zeichnung (`Z1.tsx`),
    // auf Z7 vollflächig.
    Z1: { src: '/medien/media/zerspanungsmechaniker/z4-messraum.webp', pos: '55% 35%' },
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
    // Bediener an der CNC-Maschine — der Auftakt von Z3: erst die echte
    // Maschine kennenlernen, dann ihre Sprache (die Bühne wechselt danach
    // zur Werkzeugweg-Zeichnung).
    Z3: { src: '/medien/media/zerspanungsmechaniker/gallery-2.webp', pos: '50% 40%' },
    // Bediener wacht an der dunklen Maschine — der erste vorsichtige Testlauf.
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
    // Die zwei gewerkeneutralen Karriere-Motive.
    'Z8.2': { src: '/medien/schritte/b92-techniker.webp', pos: '50% 40%' },
    'Z8.3': { src: '/medien/schritte/b93-studium.webp', pos: '50% 40%' },
    // Der CTA: die drehende Welle aus dem Hero, unter der Markenzone.
    Z9: { src: '/medien/media/zerspanungsmechaniker/hero-poster.webp', pos: '50% 50%' },
  } satisfies Partial<Record<Id, StepBild>>,
  /**
   * Takt 1 und 2 der Auftragsannahme (`typen.ts`, `vorstellung`).
   * Aus dem Tag destilliert: Programm (Z3), Serie (Z6),
   * Messen (Z4/Z1.1), Einrichten (Z2). „Dünner als ein Haar" übersetzt das
   * Hundertstel, das der Tag überall voraussetzt, in ein Bild, das man
   * kennt. Die Umgebung beschreibt den Ort, ohne die Rolle vorwegzunehmen:
   * das „Du bist Azubi“ gehört dem Fiktions-Takt.
   */
  vorstellung: {
    titel: ['Du hast dir', 'die Zerspanung ausgesucht.'],
    was: 'Zerspanungsmechaniker fertigen Teile aus Metall — so genau, dass sie später in Motoren und Maschinen exakt passen.',
    aufgaben: [
      'Eine computergesteuerte Maschine so einstellen, dass 200 Teile gleich werden',
      'Der Maschine mit einem Programm sagen, wo sie fräsen soll',
      'Jedes Maß nachmessen — auf ein Hundertstel Millimeter, dünner als ein Haar',
      'Das Metallstück festspannen, bevor es losgeht',
    ],
    umgebung: {
      titel: ['Maschinen so ', 'groß wie Autos.'],
      text: 'Gearbeitet wird drinnen, in einer großen Halle. Es riecht nach Öl, die Maschinen brummen. Jede ist so groß wie ein Auto — und an jeder steht ein Mensch, der ihr sagt, was sie tun soll.',
    },
  },
  /** Takt 3 der Auftragsannahme — ab hier spricht die Geschichte. */
  auftrag: {
    etikett: 'Deine Maschine',
    titel: ['200 Teile mit,', 'höchster Präzision.'],
    text: 'Du bist Azubi in der Zerspanung. Es ist sechs Uhr, die Hallenbeleuchtung geht gerade an und deine Maschine ist noch kalt. Der Ausbilder legt dir eine Zeichnung hin: 200 Bolzen für ein Getriebe müssen gefertigt werden. Bis du dabei?',
    knopf: 'Schicht übernehmen',
  },
  graph: baueGraph(STEPS, {
    erster: 'Z1',
    /** Jeder Abstecher einzeln getextet — nie eine Schablone. */
    angebote: {
      'Z1.1': {
        einladung: 'Locker, satt oder fest?',
        beschreibung:
          'Wie zwei Teile zusammensitzen können — und wie man das vorher festlegt.',
      },
      'Z3.1': {
        einladung: 'Und wenn du dich vertippst?',
        beschreibung:
          'Was es kostet, wenn das Werkzeug ins Teil kracht — und wie man das vorher merkt.',
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
        beschreibung: 'Am Plan arbeiten statt an der Maschine.',
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
