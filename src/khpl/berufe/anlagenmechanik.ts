import { baueGraph, type Angebot, type StepDef } from '@/khpl/flow/steps'
import type { BerufDef, StepBild } from './typen'

/**
 * Anlagenmechaniker/-mechanikerin SHK — der Tag als Route.
 *
 * Neun Hauptschritte, sechs Abstecher.
 *
 * **Was diesen Tag von den anderen drei unterscheidet:** er wechselt den Ort.
 * Morgens eine Störung bei Frau Osei, danach die große Sanierung, dazwischen
 * Mittag im Transporter. `A1 → „Weiter zur zweiten Adresse"` ist der einzige
 * Weiter-Text der vier Tage, der einen Ortswechsel ankündigt — das ist die Form
 * dieses Tages in vier Wörtern.
 *
 * **Sein Id-Präfix ist `A`**: `A1`–`A9` auf der Hauptlinie, Abstecher mit
 * `.`-Suffix (`A8.1`).
 *
 * **Dieser Tag hat kein `three`.** Seine Bühnen sind Zeichnungen —
 * Anlagenausschnitt, Kellerschnitt, Gebäudeschnitt — und liegen unter
 * `buehne/anlagenmechanik/`.
 *
 * **Die Merkmale sind gesetzt, nicht recherchiert**, und werden hier nicht
 * geändert: wer einen Vektor anfasst, verschiebt die Empfehlung für alle vier
 * Berufe.
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
 * Die Hauptlinie mit ihren Abstechern, Reihenfolge = Board-Reihenfolge. Der
 * Titel ist die Pointe des Screens, `kurz` sein Board-Name. Zwei Titel nennen
 * bewusst nur die Tätigkeit (A3, A4) — Begründung am Eintrag.
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
    kurz: 'Alter Keller',
    art: 'haupt',
    weiter: 'A3',
    abstecher: [],
    eltern: null,
  },
  {
    id: 'A3',
    // Die frühere Pointe („Wie viel Wärme braucht ein Haus?") stand fast
    // wortgleich noch einmal im Auftragsband darunter — dieselbe Dopplung wie
    // beim Dachdecker M2. Die Headline nennt jetzt die Tätigkeit.
    titel: 'Wärmebedarf schätzen',
    // „Heizlast" stand hier als Board-Name, seit der Screen das Wort trug —
    // seit dem Schätz-Umbau kommt es auf keinem Screen mehr vor, und ein
    // Fachwort, das nur auf dem Board steht, erklärt niemand.
    kurz: 'Wärmebedarf',
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
    // Die frühere Pointe („Der kürzeste Weg ist nicht der richtige") nahm dem
    // Haken der Ansage das Wort vorweg — er sagt denselben Satz. Die Headline
    // nennt jetzt die Tätigkeit; die Pointe bleibt der Übung.
    titel: 'Leitung verlegen',
    kurz: 'Weg der Rohre',
    art: 'haupt',
    weiter: 'A5',
    abstecher: ['A4.1'],
    eltern: null,
  },
  {
    id: 'A4.1',
    titel: 'Löten, pressen, stecken',
    kurz: 'Rohrverbindungen',
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
    kurz: 'Erster Start',
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
  // Der Merkmalsvektor bleibt, wie er war. `sinn: 1` ist
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
    // **Kein `szenario`.** Für die Auftragsannahme gibt es kein eigenes Video;
    // `Auftragsannahme` fällt von selbst auf Hero-Poster und Hero-Loop zurück.
    // Ein Eintrag auf eine Datei, die es nicht gibt, wäre ein schwarzer Screen
    // am Stand.
  },
  /**
   * Die Motivliste dieses Tages — am Stück, damit die Redaktionsentscheidung
   * an einer einzigen Stelle fällt (`typen.ts`, `bilder`). Sie ist kurz, und das
   * ist Absicht: **der Tag ist überwiegend gezeichnet**, Fotos trägt er nur an
   * wenigen Stellen. Wo hier nichts steht, ist die Bühne eine Zeichnung — oder
   * es fehlt ein Motiv, und dann steht das unten.
   *
   * Jeder Eintrag zeigt auf eine Datei, die unter `public/medien/` **wirklich
   * liegt**; geprüft am 24.08.2026.
   *
   * **Drei Motive fehlen:** A1.1 (Notdienst), A5 (im Transporter) und das
   * Szenario-Video der Auftragsannahme. A1.1 und A5 tragen deshalb **die
   * Transporter-Zeichnung** statt eines geliehenen Fotos — für A5 trägt die
   * Zeichnung den Screen genauso gut wie ein Foto, und A1.1 bekommt dieselbe
   * bei Nacht. Kommen die Fotos, treten sie an ihre Stelle;
   * ein Eintrag hier reicht dafür nicht mehr aus, die beiden Steps rufen die
   * Zeichnung direkt auf.
   *
   * Ungenutzt und bewusst nicht vergeben: `gallery-3.webp` (Umwälzpumpe und
   * Regelung — **GRUNDFOS und POTTERTON sind darauf lesbar**) und
   * `quiz-waermepumpe.webp` (Wärmepumpe an der Fassade — **„alpha innotec"
   * formatfüllend lesbar**). Beide fallen unter das Ausschlusskriterium
   * „kein lesbares Firmenlogo im Bild" (MEDIEN-INVENTAR).
   */
  bilder: {
    /*
      Wärmepumpe im Garten — der Abstecher rechnet sie gegen den Ölkessel.

      **Retuschiert, weil ein Firmenlogo drauf stand.** Das Motiv passt inhaltlich
      genau auf A3.1, trug aber formatfüllend „alpha innotec" auf dem Gerät. Am
      Stand hätte die Kreishandwerkerschaft damit ausgesehen wie ein
      Herstellerwerbeträger. `pos` verschieben half nicht, das Logo saß mittig
      auf dem Gerät.

      Deshalb ist die Datei **retuschiert** (Schriftzug und das kleine Emblem
      auf der schwarzen Seite herausgerechnet, Umgebung interpoliert);
      `public/medien/media/anlagenmechaniker/**` liegt in der Hoheit dieses
      Tages. Das Ausschlusskriterium gilt beim nächsten Motiv genauso — es ist
      keine Einzelfallentscheidung.
    */
    'A3.1': { src: '/medien/media/anlagenmechaniker/gallery-1.webp', pos: '50% 50%' },
    // Rohrverteiler. Passt nur halb: der Abstecher handelt von
    // Löten, Pressen und Stecken, das Motiv zeigt das Ergebnis, nicht den
    // Handgriff. Bis ein besseres da ist, trägt es den Screen.
    'A4.1': { src: '/medien/media/anlagenmechaniker/gallery-2.webp', pos: '50% 50%' },
    // Die drei Karriere-Motive sind gewerkeneutral und gehören allen vier
    // Tagen gemeinsam.
    'A8.1': { src: '/medien/schritte/b91-meister.webp', pos: '50% 40%' },
    'A8.2': { src: '/medien/schritte/b92-techniker.webp', pos: '50% 40%' },
    'A8.3': { src: '/medien/schritte/b93-studium.webp', pos: '50% 40%' },
    /*
      A9 — der CTA. Für ihn gibt es kein eigenes Motiv, und ohne Eintrag stand
      auf der hochkanten Stele unter der Paderborner Silhouette rund ein Drittel
      Bildhöhe reines Orange (Abnahme, A9). Eine leere Farbfläche fordert
      niemanden auf, mit einem Menschen zu sprechen.

      Deshalb **das Kartenmotiv dieses Berufs** auf dem letzten Screen: das
      einzige verbliebene SHK-Foto ohne lesbares
      Firmenlogo — gallery-3 und quiz-waermepumpe scheiden dafür aus
      (MEDIEN-INVENTAR), gallery-1 und gallery-2 tragen bereits A3.1
      und A4.1. Es zeigt einen Menschen bei der Arbeit an einer Anlage; genau
      darum geht es auf diesem Screen.

      `pos` sitzt bei 65 %, weil hochkant nur rund ein Drittel der Bildbreite
      stehen bleibt: dort liegen die behandschuhten Hände am grünen Messblock —
      die Arbeit. Links davon ist nur der Hinterkopf (das Foto ist eine
      Rückenansicht, ein Gesicht gibt es nirgends im Bild; die Nachprüfung vom
      25.08. hatte den 28-%-Ausschnitt genau deshalb moniert). Quer deckt das
      Bild die Fläche ohnehin ganz ab.
    */
    A9: { src: '/medien/media/anlagenmechaniker/card.webp', pos: '65% 45%' },
  } satisfies Partial<Record<Id, StepBild>>,
  /**
   * Takt 1 und 2 der Auftragsannahme (`typen.ts`, `vorstellung`).
   * Aus dem Tag destilliert: Rohre (A4/A4.1), Störung (A1),
   * Kesseltausch (A2–A6), Übergabe (A7). Die Umgebung erzählt die Form dieses
   * Tages — er wechselt den Ort, und am Ende steht ein Mensch, dem geholfen
   * wurde (`sinn: 1`) — und beschreibt ihn, ohne die Rolle vorwegzunehmen:
   * das „Du bist Azubi“ gehört dem Fiktions-Takt.
   */
  vorstellung: {
    titel: ['Du hast dir', 'die Anlagenmechanik ausgesucht.'],
    was: 'Anlagenmechaniker sorgen dafür, dass in Häusern das Wasser läuft und die Heizung warm wird.',
    aufgaben: [
      'Rohre so verlegen, dass nichts tropft',
      'Eine kaputte Heizung wieder zum Laufen bringen',
      'Alten Ölkessel raus, neue Wärmepumpe rein',
      'Den Leuten erklären, wie ihre neue Anlage funktioniert',
    ],
    umgebung: {
      titel: ['Jeden Tag', 'eine andere Adresse.'],
      text: 'Unterwegs sein gehört dazu — mit dem Transporter voller Werkzeug. Gearbeitet wird bei den Leuten zu Hause: im Keller, im Bad, an der Heizung. Oft sagt am Ende jemand danke, weil das Wasser wieder warm ist.',
    },
  },
  /**
   * Takt 3 der Auftragsannahme — ab hier spricht die Geschichte.
   *
   * **Was nicht verhandelbar ist:** hier steht ein Mensch am anderen Ende,
   * kein „der Kunde".
   */
  auftrag: {
    etikett: 'Deine erste Adresse',
    titel: ['Zwei Adressen.', 'Ein Tag.'],
    text: 'Du bist Azubi in einem SHK-Betrieb — Sanitär, Heizung, Klima. Sieben Uhr, der Transporter ist gepackt. Der Chef gibt dir einen Zettel: erst zu Frau Osei, da kommt kein warmes Wasser mehr. Danach die Große — Ölkessel raus, Wärmepumpe rein.',
    knopf: 'Einsteigen',
  },
  graph: baueGraph(STEPS, {
    erster: 'A1',
    /**
     * Jeder Abstecher ist einzeln getextet — nie eine „Mehr
     * erfahren"-Schablone. Die Einladung muss den Inhalt versprechen, sonst
     * tippt man sie nur der Vollständigkeit halber an.
     */
    angebote: {
      'A1.1': {
        einladung: 'Und wenn samstags die Heizung ausfällt?',
        beschreibung:
          'Wer nachts und am Wochenende rausfährt — und was man dafür bekommt.',
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
        beschreibung: 'Planen und berechnen statt in den Keller.',
      },
      'A8.3': { einladung: 'Studium', beschreibung: 'Ja, das geht — auch ohne Abitur.' },
    } satisfies Partial<Record<Id, Angebot>>,
    /**
     * Die drei Abstecher tragen **denselben** Text wie ihr Elternschritt und
     * nicht einen eigenen: sie münden in denselben nächsten Hauptschritt, und
     * wer den Notdienst-Abstecher gelesen hat, fährt danach genauso „zur
     * zweiten Adresse" wie der, der ihn übersprungen hat. Ein eigener Text
     * wäre hier ein Unterschied ohne Anlass.
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
     * Der Karriere-Link steht auf jedem zweiten Hauptschritt.
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
