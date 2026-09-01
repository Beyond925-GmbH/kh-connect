import { baueGraph, type Angebot, type StepDef } from '@/khpl/flow/steps'
import type { BerufDef, StepBild } from './typen'

/**
 * Dachdecker/Dachdeckerin — der gebaute Tag. Siebzehn Steps, M1 bis M10 plus
 * sieben Abstecher.
 *
 * Die Steps standen bis zur Einführung der vier Berufe als `STEPS` in
 * `flow/steps.ts`. Inhaltlich ist am Ablauf **nichts** verändert worden:
 * dieselben siebzehn Steps, dieselben Titel, dieselbe Reihenfolge, dieselben
 * Abstecher. Nur ihr Ort ist neu, und mit ihm die Zuständigkeit.
 *
 * Dazugekommen sind die drei Angaben, die vorher als Konstanten in `StepShell`
 * und im Store lagen und in Wahrheit Aussagen über *diesen* Tagesablauf sind:
 * wo der Karriere-Link auftaucht, was zum Karriere-Bereich gehört, wo der Skip
 * landet.
 *
 * **Die Recherche darunter ist auf Zimmerer/Zimmerin geschrieben.** Die
 * Zahlen hängen an diesem Ausbildungsberuf: Ausbildungsvergütung nach Holzbau
 * Deutschland, die AusbauBAusbV von 2026, „Zimmerermeister:in" als
 * Aufstiegstitel, der Stundensatz „im Zimmererhandwerk". Was davon für
 * Dachdecker:innen anders ist, ist **noch nicht nachgezogen** — die Stellen
 * stehen in `steps/dachdecker/karrierewege.ts` und `glossar/begriffe.ts` und
 * sind dort markiert. Bis dahin trägt dieser Beruf einen Dachdecker-Namen über
 * Zimmerer-Zahlen.
 */

/**
 * Das Id-Vokabular dieses Berufs. Es gehört hierher und nicht mehr in die
 * Hülle: jeder der vier Berufe hat ein M5, und eine gemeinsame Union darüber
 * wäre keine Prüfung, sondern eine Kollision.
 *
 * Was es weiterhin fängt, sind Schreibfehler — `weiter: 'M11'` ist ein
 * Typfehler. Was die alte `Record<StepId, StepDef>`-Form dagegen nie gefangen
 * hat, prüft jetzt `baueGraph` beim Laden: Verweise, die ins Leere zeigen.
 */
type Id =
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

/**
 * Damit auch `weiter`, `eltern` und `abstecher` an die Ids gebunden sind und
 * nicht bloß `string` bleiben — sonst fängt `satisfies` nur Schreibfehler in
 * der eigenen `id` und ausgerechnet nicht die in den Verweisen.
 */
type ZimmererStep = Omit<StepDef, 'id' | 'weiter' | 'eltern' | 'abstecher'> & {
  id: Id
  weiter: Id | null
  eltern: Id | null
  abstecher: readonly Id[]
}

/**
 * In `kurz` steht bewusst kein Fachwort: die Zeile wird an genau einer Stelle
 * gerendert (`shell/DeinWeg.tsx`), und dort nur auf den **noch gesperrten**
 * Zeilen — also ausgerechnet da, wo jemand den Screen noch nicht gesehen hat
 * und das Wort ohne jede Erklärung lesen muss. „Kalkulation“ oder
 * „3D-Visualisierung“ trug dort niemand; deshalb heißt es „Preis rechnen,
 * Vertrag“ und „Der Plan in 3D“. Die Titel selbst sind davon unberührt.
 */
const STEPS = [
  {
    id: 'M1',
    titel: 'Der erste Termin',
    kurz: 'Anfrage & Ortstermin',
    art: 'haupt',
    weiter: 'M2',
    abstecher: [],
    eltern: null,
  },
  {
    id: 'M2',
    titel: 'Preis schätzen',
    kurz: 'Preis rechnen, Vertrag',
    art: 'haupt',
    weiter: 'M3',
    abstecher: [],
    eltern: null,
  },
  {
    id: 'M3',
    titel: 'Jetzt wird gezeichnet',
    kurz: 'Auftrag & Planung',
    art: 'haupt',
    weiter: 'M4',
    abstecher: ['B3.1', 'B3.2'],
    eltern: null,
  },
  {
    id: 'B3.1',
    titel: 'Holz bestellen',
    kurz: 'Material bestellen',
    art: 'abstecher',
    weiter: 'M4',
    abstecher: [],
    eltern: 'M3',
  },
  {
    id: 'B3.2',
    titel: 'Vom Plan in den Kopf',
    kurz: 'Der Plan in 3D',
    art: 'abstecher',
    weiter: 'M4',
    abstecher: [],
    eltern: 'M3',
  },
  {
    id: 'M4',
    titel: 'Balken zuschneiden',
    kurz: 'Material vorbereiten',
    art: 'haupt',
    weiter: 'M5',
    abstecher: ['B4.1'],
    eltern: null,
  },
  {
    id: 'B4.1',
    titel: 'Beladen',
    kurz: 'Lagerhalle, Beladen',
    art: 'abstecher',
    weiter: 'M5',
    abstecher: [],
    eltern: 'M4',
  },
  {
    id: 'M5',
    titel: 'Dach bauen',
    kurz: 'Dach aufrichten I',
    art: 'haupt',
    weiter: 'M6',
    abstecher: ['B5.1'],
    eltern: null,
  },
  {
    id: 'B5.1',
    titel: 'Niemand macht das allein',
    kurz: 'Teamarbeit',
    art: 'abstecher',
    weiter: 'M6',
    abstecher: [],
    eltern: 'M5',
  },
  {
    id: 'M6',
    titel: 'Halb zwölf',
    kurz: 'Mittagspause',
    art: 'haupt',
    weiter: 'M7',
    abstecher: [],
    eltern: null,
  },
  {
    id: 'M7',
    titel: 'Jetzt du',
    kurz: 'Dach aufrichten II',
    art: 'haupt',
    weiter: 'M8',
    abstecher: [],
    eltern: null,
  },
  {
    id: 'M8',
    titel: 'Feierabend',
    kurz: 'Feierabend',
    art: 'haupt',
    weiter: 'M9',
    abstecher: [],
    eltern: null,
  },
  {
    id: 'M9',
    titel: 'Und danach?',
    kurz: 'Karriere-Schritte',
    art: 'haupt',
    weiter: 'M10',
    abstecher: ['B9.1', 'B9.2', 'B9.3'],
    eltern: null,
  },
  {
    id: 'B9.1',
    titel: 'Meister',
    kurz: 'Meister',
    art: 'abstecher',
    weiter: 'M10',
    abstecher: [],
    eltern: 'M9',
    immerOffen: true,
  },
  {
    id: 'B9.2',
    titel: 'Techniker',
    kurz: 'Techniker',
    art: 'abstecher',
    weiter: 'M10',
    abstecher: [],
    eltern: 'M9',
    immerOffen: true,
  },
  {
    id: 'B9.3',
    titel: 'Studium',
    kurz: 'Studium',
    art: 'abstecher',
    weiter: 'M10',
    abstecher: [],
    eltern: 'M9',
    immerOffen: true,
  },
  {
    id: 'M10',
    titel: 'Dein nächster Schritt',
    // Nicht 'CTA': `kurz` steht im Sheet und auf dem Weitermachen-Knopf des
    // Splash. „Weitermachen bei ‚CTA‘“ ist Board-Sprache, keine Besuchersprache.
    kurz: 'Dein nächster Schritt',
    art: 'haupt',
    weiter: null,
    abstecher: [],
    eltern: null,
  },
] as const satisfies readonly ZimmererStep[]

export const DACHDECKER: BerufDef = {
  id: 'dachdecker',
  name: 'Dachdecker/Dachdeckerin',
  kurz: 'Dachdecker',
  zeile: 'Ein Dach, von der ersten Messung bis zum Richtfest. Zehn Meter über dem Boden.',
  // Draußen bei jedem Wetter, hoch oben, im Team — und mehr Technik, als der
  // Beruf von außen hergibt: geplant wird am Rechner (M3, B3.1).
  merkmale: {
    anpacken: 0.9,
    praezision: 0.5,
    technik: 0.35,
    draussen: 1,
    hoehe: 1,
    team: 0.7,
    sinn: 0.7,
  },
  medien: {
    karte: '/medien/media/zimmerer/card.webp',
    heroPoster: '/medien/media/zimmerer/hero-poster.webp',
    hero: '/medien/media/zimmerer/hero.mp4',
    szenario: '/medien/media/zimmerer/szenario.mp4',
    szenarioPoster: '/medien/media/zimmerer/szenario-poster.webp',
  },
  /**
   * Die Motivliste dieses Tages — am Stück, damit die Redaktionsentscheidung
   * an einer einzigen Stelle fällt. Steps ohne Eintrag tragen keine
   * Foto-Bühne, sondern das 3D-Modell: B3.2, M5, M7. Dort *ist* die Bühne die
   * Interaktion.
   */
  bilder: {
    // Der Einstieg bleibt beim Werkstatt-Standbild: der Text dort handelt vom
    // Chef, der das Telefon weglegt, und das ist eine Werkstattszene.
    intro: { src: '/medien/media/zimmerer/hero-poster.webp', pos: '50% 40%' },
    M1: { src: '/medien/schritte/m1-ortstermin.webp', pos: '50% 40%' },
    // Auf M2 wird geschätzt, was *dieses Dach* kostet — also muss dort auch
    // eins liegen. Der Dachstuhl selbst (dasselbe Motiv wie M10) trägt die
    // Frage besser als der Schreibtisch mit Taschenrechner, der hier vorher
    // lag. TODO: eigenes Motiv, damit sich M2 und M10 nicht spiegeln.
    M2: { src: '/medien/schritte/intro-aufrichten.webp', pos: '50% 45%' },
    M3: { src: '/medien/schritte/m3-cad.webp', pos: '60% 50%' },
    'B3.1': { src: '/medien/schritte/b31-lager.webp', pos: '50% 45%' },
    M4: { src: '/medien/schritte/m4-zuschnitt.webp', pos: '55% 45%' },
    // Regal voller Konstruktionsvollholz in der Halle — genau das, wovon der
    // Fachtext spricht („In der Halle liegt mehr, als du brauchst“).
    //
    // Nicht das naheliegende `schaetzen-balken.webp`, obwohl es Material zeigt,
    // das von Hand bewegt wird: darauf ist ein Firmenlogo auf dem Polohemd
    // lesbar. MEDIEN-INVENTAR führt genau das als Ausschlusskriterium und hat
    // aus demselben Grund schon zwei andere Motive aussortiert.
    'B4.1': { src: '/medien/schritte/b41-lagerhalle.webp', pos: '50% 50%' },
    'B5.1': { src: '/medien/schritte/b51-team.webp', pos: '50% 45%' },
    M6: { src: '/medien/schritte/m6-pause.webp', pos: '50% 45%' },
    M8: { src: '/medien/schritte/m8-feierabend.webp', pos: '50% 55%' },
    M9: { src: '/medien/schritte/m9-karriere.webp', pos: '50% 45%' },
    'B9.1': { src: '/medien/schritte/b91-meister.webp', pos: '50% 40%' },
    'B9.2': { src: '/medien/schritte/b92-techniker.webp', pos: '50% 40%' },
    'B9.3': { src: '/medien/schritte/b93-studium.webp', pos: '50% 40%' },
    // Der Abschluss zeigt einen Menschen und ein fertiges Sparrenwerk, keine
    // Skyline: hier soll jemand aufstehen und an den Stand gehen. Bewusst nicht
    // dasselbe Motiv wie der Einstieg — Anfang und Ende sollen sich nicht
    // spiegeln, sondern auseinanderliegen.
    M10: { src: '/medien/schritte/intro-aufrichten.webp', pos: '50% 45%' },
  } satisfies Partial<Record<Id | 'intro', StepBild>>,
  /**
   * Takt 1 und 2 der Auftragsannahme (`typen.ts`, `vorstellung`).
   *
   * Die Aufgaben beschreiben **das Dachdecker-Handwerk, nicht diesen Tag**:
   * der Tag ist ein umetikettierter Zimmerer-Ablauf (siehe Kopf der Datei),
   * aber Takt 1 ist die App in eigener Stimme — sie darf keine Zimmerer-Arbeit
   * als Dachdecker-Alltag ausgeben. Deshalb Ziegel, Dämmung, Dachfenster
   * statt Balken und CAD.
   */
  vorstellung: {
    titel: ['Du hast dir', 'den Dachdecker ausgesucht.'],
    was: 'Dachdecker machen Häuser oben dicht. Sie bauen Dächer — damit es drinnen trocken und warm bleibt.',
    aufgaben: [
      'Ziegel so verlegen, dass kein Tropfen durchkommt',
      'Folie und Dämmung unters Dach packen, damit keine Wärme entwischt',
      'Ein Dachfenster einbauen — und zwar dicht',
      'Oben im Team anpacken — einer allein deckt kein Dach',
    ],
    umgebung: {
      titel: ['Der Arbeitsplatz liegt', 'über der Straße.'],
      text: 'Gearbeitet wird draußen, bei Sonne und bei Wind. Mal auf einem Wohnhaus, mal auf einer Schule — jede Baustelle ist woanders. Von oben sieht man die ganze Stadt. Und ohne Sicherung geht niemand aufs Dach.',
    },
  },
  // Der Text stammt aus dem Zimmerer-Tag („Du bist Azubi in einer Zimmerei").
  // Der Betrieb ist hier ausgetauscht, der Rest steht unverändert.
  auftrag: {
    etikett: 'Dein erster Auftrag',
    titel: ['Bau heute', 'ein Dach.'],
    text: 'Du bist Azubi in einem Dachdeckerbetrieb. Der Chef legt das Telefon weg und dreht sich zu dir um: altes Haus, das Dach muss neu. Er fragt, ob du mitkommst.',
    knopf: 'Auftrag annehmen',
  },
  graph: baueGraph(STEPS, {
    erster: 'M1',
    /**
     * Jeder Abstecher ist einzeln getextet — nie eine generische
     * „Mehr erfahren“-Schablone. Die Einladung muss den Inhalt versprechen,
     * sonst tippt man sie nur der Vollständigkeit halber an.
     */
    angebote: {
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
      'B9.2': {
        einladung: 'Techniker',
        beschreibung: 'Planen und rechnen statt aufs Dach.',
      },
      'B9.3': { einladung: 'Studium', beschreibung: 'Ja, das geht — auch ohne Abitur.' },
    } satisfies Partial<Record<Id, Angebot>>,
    weiterTexte: {
      M3: 'Weiter in die Werkstatt',
      'B3.1': 'Weiter zur Werkstatt',
      'B3.2': 'Weiter zur Werkstatt',
      M4: 'Weiter zur Baustelle',
      'B4.1': 'Weiter zur Baustelle',
      M5: 'Weiter zur Pause',
      'B5.1': 'Weiter zur Pause',
    } satisfies Partial<Record<Id, string>>,
    /**
     * Der Karriere-Link taucht in der Auftragsannahme und danach auf jedem
     * zweiten Hauptschritt auf. Nie auf Abstecher-Screens, nie während eine
     * Interaktion offen ist. So begegnet er jedem Besucher mehrfach, ohne je
     * zu drängen.
     *
     * **M8 fehlt hier bewusst**: M9 *ist* der nächste Schritt nach M8. Ein
     * Abstecher, der einen Schritt vor sein Ziel abkürzt, schickt den Besucher
     * über M9 → M10 → zurück auf M8 → weiter zu M9 — derselbe Bereich zweimal,
     * mit einer Rückkehr-Leiste dazwischen.
     */
    karriereSkipAuf: ['M2', 'M4', 'M6'],
    karriereBereich: ['M9', 'B9.1', 'B9.2', 'B9.3', 'M10'],
    karriereEinstieg: 'M9',
  }),
}
