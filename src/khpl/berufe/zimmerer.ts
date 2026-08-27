import { baueGraph, type Angebot, type StepDef } from '@/khpl/flow/steps'
import type { BerufDef, StepBild } from './typen'

/**
 * Zimmerer/Zimmerin — **Holzrahmenbau**. Fünfzehn Steps, C1 bis C9 plus sechs
 * Abstecher.
 *
 * Der Tag ist die umgekehrte Form des Dachdecker-Tages: erst drinnen, dann
 * draußen; erst flach, dann senkrecht. Ein Wandelement entsteht morgens liegend
 * auf dem Abbundtisch und hängt mittags am Kran (`khpl-tag-zimmerer.md` 1).
 * Ausdrücklich **kein zweiter Dachstuhl** — dieselbe Bühne zweimal machte die
 * beiden im Merkmalsraum ohnehin dichtesten Berufe ununterscheidbar.
 *
 * **Sein Id-Präfix ist `C`** (khpl-tage.md §6.1 V4). `M`/`B` gehören dem
 * Dachdecker, `Z` der Zerspanung, `A` der Anlagenmechanik. Sichtbar ist davon
 * nichts — die Rail zeigt „Schritt 4 von 9“, nie eine Id.
 *
 * ⚠️ **Zahlen und Fachaussagen sind am 24.08.2026 recherchiert**
 * (`belege/zimmerer.md`, `belege/ausbildung-karriere.md`). Was dort
 * `NICHT BELEGBAR` heißt, steht auf keinem Screen: die Zahl der Elemente je
 * Haus und die Personenzahl beim Einkranen kommen deshalb nirgends vor.
 * `FREIGEGEBEN` bleibt weiterhin der Kreishandwerkerschaft vorbehalten.
 */

/**
 * Das Id-Vokabular dieses Berufs. Bindet `weiter`, `eltern` und `abstecher` an
 * dieselben Ids — sonst fängt `satisfies` nur Schreibfehler in der eigenen `id`
 * und ausgerechnet nicht die in den Verweisen.
 */
type Id =
  | 'C1'
  | 'C1.1'
  | 'C2'
  | 'C3'
  | 'C3.1'
  | 'C4'
  | 'C5'
  | 'C5.1'
  | 'C6'
  | 'C7'
  | 'C8'
  | 'C8.1'
  | 'C8.2'
  | 'C8.3'
  | 'C9'

type ZimmererStep = Omit<StepDef, 'id' | 'weiter' | 'eltern' | 'abstecher'> & {
  id: Id
  weiter: Id | null
  eltern: Id | null
  abstecher: readonly Id[]
}

/**
 * Die Reihenfolge dieser Liste **ist** die Board-Reihenfolge: Abstecher stehen
 * direkt hinter ihrem Elternschritt, `haupt` und die Segmentzahl der Rail
 * fallen daraus ab. Titel und `kurz` wörtlich aus `khpl-tag-zimmerer.md` 3
 * und 4 (`VALIDIERT`) — mit einer Ausnahme, die am C2-Eintrag begründet ist.
 */
const STEPS = [
  {
    id: 'C1',
    titel: 'Der Stapel steht schon da',
    kurz: 'Halle, Stückliste',
    art: 'haupt',
    weiter: 'C2',
    abstecher: ['C1.1'],
    eltern: null,
  },
  {
    id: 'C1.1',
    titel: 'Die Maschine hat heute Nacht gearbeitet',
    kurz: 'Abbund',
    art: 'abstecher',
    weiter: 'C2',
    abstecher: [],
    eltern: 'C1',
  },
  {
    id: 'C2',
    // Nicht mehr der validierte Wortlaut „Zweiundsechzig Komma fünf": der
    // stand als ausgeschriebene Lösung dauerhaft über dem laufenden
    // Schätz-Regler — wortwörtlich das Negativbeispiel aus Designregel R6.
    // Der Titel nennt jetzt das Thema, nie den gesuchten Wert; die
    // ausgeschriebene Zahl ist als Titel der Auflösung gewandert (C2.tsx).
    titel: 'Das Raster, das keiner sich ausdenkt',
    kurz: 'Ständerwerk',
    art: 'haupt',
    weiter: 'C3',
    abstecher: [],
    eltern: null,
  },
  {
    id: 'C3',
    titel: 'Eine Wand ist ein Sandwich',
    kurz: 'Dämmen und beplanken',
    art: 'haupt',
    weiter: 'C4',
    abstecher: ['C3.1'],
    eltern: null,
  },
  {
    id: 'C3.1',
    titel: 'Holz ist der einzige Baustoff, der…',
    kurz: 'Holz und Klima',
    art: 'abstecher',
    weiter: 'C4',
    abstecher: [],
    eltern: 'C3',
  },
  {
    id: 'C4',
    titel: 'Hier kommt das Fenster hin',
    kurz: 'Fensterausschnitt',
    art: 'haupt',
    weiter: 'C5',
    abstecher: [],
    eltern: null,
  },
  {
    id: 'C5',
    titel: 'Elf Uhr, das Element geht raus',
    kurz: 'Verladen und Fahrt',
    art: 'haupt',
    weiter: 'C6',
    abstecher: ['C5.1'],
    eltern: null,
  },
  {
    /**
     * ⚠️ **Gemeldeter Widerspruch, nicht gelöst** (khpl-tage.md, Präambel).
     * Die Spec bietet C5.1 in der Aha-Karte von **C6** ein zweites Mal an,
     * „falls es übersprungen wurde“. Das ginge nur, wenn C6 den Abstecher
     * führte — dann führte sein `weiter: 'C6'` aber auf den Screen zurück, von
     * dem man kommt, und khpl-tage.md 3 verbietet Schleifen ausdrücklich.
     * C5.1 hängt deshalb allein an C5. Die Aha-Karte in C6 kann den Inhalt
     * nennen, sie kann ihn nicht verlinken.
     */
    id: 'C5.1',
    titel: 'Warum niemand unter der Last steht',
    kurz: 'Sicherheit am Kran',
    art: 'abstecher',
    weiter: 'C6',
    abstecher: [],
    eltern: 'C5',
  },
  {
    id: 'C6',
    titel: 'Am Haken',
    kurz: 'Kran, Versetzen',
    art: 'haupt',
    weiter: 'C7',
    abstecher: [],
    eltern: null,
  },
  {
    id: 'C7',
    titel: 'Heute früh war da eine Betonplatte',
    kurz: 'Feierabend',
    art: 'haupt',
    weiter: 'C8',
    abstecher: [],
    eltern: null,
  },
  {
    id: 'C8',
    titel: 'Und danach?',
    kurz: 'Karriere-Schritte',
    art: 'haupt',
    weiter: 'C9',
    abstecher: ['C8.1', 'C8.2', 'C8.3'],
    eltern: null,
  },
  {
    id: 'C8.1',
    titel: 'Meister',
    kurz: 'Meister',
    art: 'abstecher',
    weiter: 'C9',
    abstecher: [],
    eltern: 'C8',
    immerOffen: true,
  },
  {
    id: 'C8.2',
    titel: 'Techniker',
    kurz: 'Techniker',
    art: 'abstecher',
    weiter: 'C9',
    abstecher: [],
    eltern: 'C8',
    immerOffen: true,
  },
  {
    id: 'C8.3',
    titel: 'Studium',
    kurz: 'Studium',
    art: 'abstecher',
    weiter: 'C9',
    abstecher: [],
    eltern: 'C8',
    immerOffen: true,
  },
  {
    id: 'C9',
    // Nicht 'CTA': `kurz` steht im Sheet und auf dem Weitermachen-Knopf des
    // Splash. „Weitermachen bei ‚CTA‘“ ist Board-Sprache, keine Besuchersprache.
    titel: 'Dein nächster Schritt',
    kurz: 'Dein nächster Schritt',
    art: 'haupt',
    weiter: null,
    abstecher: [],
    eltern: null,
  },
] as const satisfies readonly ZimmererStep[]

export const ZIMMERER: BerufDef = {
  id: 'zimmerer',
  name: 'Zimmerer/Zimmerin',
  kurz: 'Zimmerer',
  zeile: 'Das Tragwerk, das alles hält. Balken, Abbund, Aufrichten.',
  /**
   * **Unverändert aus `berufe/angekuendigt.ts`** (khpl-tag-zimmerer.md 8). Der
   * Vektor wird von diesem Tag ausdrücklich **nicht** geändert: Zimmerer und
   * Dachdecker werden allein über Frage 3 (Tragwerk gegen Hülle) getrennt, und
   * eine Verschiebung hier verschiebt die Empfehlung für alle vier Berufe
   * (khpl-tage.md 5).
   *
   * Was der Tag dafür einlösen muss: `technik 0.5` über C1.1 (Abbund und CAD),
   * `hoehe 0.95` über C6 (der Kran), `draussen 0.9` über C5–C7 — ohne die
   * bricht dieser Wert.
   */
  merkmale: {
    anpacken: 1,
    praezision: 0.65,
    technik: 0.5,
    draussen: 0.9,
    hoehe: 0.95,
    team: 0.8,
    sinn: 0.6,
  },
  /**
   * ⚠️ **Die Motive unter `media/zimmerer/` gehören der Sache nach hierher und
   * sind trotzdem an den gebauten Tag vergeben** (khpl-tage.md 7): im Repo
   * liegt kein einziges Dachdecker-Motiv, deshalb zeigt `dachdecker.ts` auf
   * Karte, Hero und Szenario dieses Ordners. Der Tausch ist eine
   * Redaktionsentscheidung und passiert, wenn Dachdecker-Motive vorliegen —
   * dieser Tag nimmt sie ihm nicht weg.
   *
   * **`karte` nimmt deshalb ein anderes Motiv aus demselben Ordner.**
   * `card.webp` bleibt beim gebauten Tag — zwei Karten mit demselben Foto
   * nebeneinander wären ein zweiter Fehler. Ein Pfad ins Leere ist aber auch
   * keiner: `BerufBild` fängt ihn zwar mit seinem typografischen Ersatz ab,
   * am Stand steht dann jedoch die einzige neu spielbare Karte ohne Motiv
   * neben der vollflächig bebilderten — und der Browser holt bei jedem
   * Listenaufruf eine 404. `gallery-2.webp` (Blick von unten in den
   * Holzrahmenbau, junger Mann auf dem Sparrenwerk) liegt seit jeher im Repo,
   * wird von keinem Beruf benutzt und zeigt genau das, was dieser Tag baut.
   * `public/medien/media/zimmerer/**` gehört ohnehin diesem Tag
   * (khpl-tage.md 6.2) — es wird also niemandem etwas weggenommen. Ein eigenes
   * Zimmerer-Motiv steht trotzdem weiter auf der Medienliste.
   *
   * ⚠️ **`heroPoster` darf das nicht.** `shell/Auftragsannahme.tsx` liest
   * `szenarioPoster ?? heroPoster` und rendert es als nacktes `<img>` ohne
   * `onError` — ein toter Pfad wäre dort ein 404-Motiv auf dem **ersten**
   * Screen des Durchlaufs (S5), vollflächig. Deshalb steht hier das
   * vorhandene Werkstatt-Standbild. Es nimmt dem gebauten Tag nichts weg: der
   * zeigt auf S5 `szenario-poster.webp`, und kein Screen zeigt beide Berufe
   * nebeneinander. Der fehlende Rückfall in der Hülle ist gemeldet, nicht
   * geändert (khpl-tage.md 6.2).
   */
  medien: {
    karte: '/medien/media/zimmerer/gallery-2.webp',
    heroPoster: '/medien/media/zimmerer/hero-poster.webp',
  },
  /**
   * Die Motivliste dieses Tages — am Stück, wie es eine Redaktionsentscheidung
   * verlangt (khpl-tage.md §6.1 V3).
   *
   * **Sie ist kurz, und das ist die Ansage des Tages:** der Kern ist 3D, C1 bis
   * C7 tragen das Wandelement in seinen sieben Zuständen. Fotos braucht dieser
   * Tag nur an wenigen Stellen (khpl-tag-zimmerer.md 10).
   *
   * ⚠️ **Vier davon tragen einen Platzhalter, keinen Eigenbedarf.** Für C3.1,
   * C5.1, C8 und C9 führt die Spec kein eigenes Motiv; die erste Fassung ließ
   * die Bühne dort deshalb leer. Auf der hochkanten Stele ist das ein schwarzes
   * Feld über zwei Dritteln der Höhe — es sieht nicht nach Absicht aus,
   * sondern nach einem Bild, das nicht geladen hat, und es trifft
   * ausgerechnet den Sicherheits-Abstecher mit dem stärksten Zitat des Tages
   * und den Einstieg in den Karrierebereich. Bis die Fotoliste abgearbeitet
   * ist, steht dort deshalb je ein vorhandenes, thematisch tragendes Motiv.
   * **Der Medienbedarf bleibt gemeldet** (khpl-tag-zimmerer.md 10: Halle mit
   * Abbundtisch und liegendem Element · Element am Kran, von unten · fertiges
   * Holzrahmenhaus am selben Tag).
   */
  bilder: {
    // CNC-Fräser trägt Holz ab, Späne fliegen — maschineller Abbund. Das Motiv
    // liegt seit jeher im Repo und wird von keinem Beruf benutzt; die Spec
    // nennt es für diesen Screen „passt exakt“.
    'C1.1': { src: '/medien/media/zimmerer/gallery-1.webp', pos: '50% 50%' },
    // PLATZHALTER. Holz und Klima: ein Mann sitzt auf einem Balken und
    // verschraubt ihn — verbautes Holz, und darum geht es auf dem Screen. Kein
    // Klimamotiv, aber das Gegenteil eines schwarzen Rechtecks.
    'C3.1': { src: '/medien/media/zimmerer/gallery-3.webp', pos: '50% 45%' },
    // PLATZHALTER. Sicherheit am Kran: Maßnehmen am Sparren, mit Helm und
    // Handschuh. Die PSA ist das, was der Screen erzählt; das Element am Haken
    // bleibt C6 vorbehalten und wird hier ausdrücklich nicht vorweggenommen.
    'C5.1': { src: '/medien/media/zimmerer/quiz-abbund.webp', pos: '50% 45%' },
    // PLATZHALTER. Karriere-Übersicht: Blick von unten ins Sparrenwerk, aus dem
    // gemeinsamen `schritte/`-Bestand wie b91–b93 — dieselbe Rolle wie beim
    // gebauten Tag, und kein Screen zeigt zwei Berufe nebeneinander.
    C8: { src: '/medien/schritte/m9-karriere.webp', pos: '50% 45%' },
    // Die drei Karrierefotos bleiben gemeinsam: sie zeigen niemandes Gewerk
    // (khpl-tage.md §6.1 V2).
    'C8.1': { src: '/medien/schritte/b91-meister.webp', pos: '50% 40%' },
    'C8.2': { src: '/medien/schritte/b92-techniker.webp', pos: '50% 40%' },
    'C8.3': { src: '/medien/schritte/b93-studium.webp', pos: '50% 40%' },
    // PLATZHALTER. Der CTA: ohne Motiv blieb auf der hochkanten Stele
    // zwischen Paderborn-Silhouette und Panel rund ein Drittel Bildhöhe
    // reines Orange (Abnahme-Befund) — und eine leere Farbfläche fordert
    // niemanden auf, mit einem Menschen zu sprechen. `gallery-2` (Blick von
    // unten in den Holzrahmenbau, junger Mann im Sparrenwerk) trägt zwar
    // schon die Berufskarte, liegt hier aber unter der orangen Markenzone
    // (`mix-blend-multiply`) und liest sich als Zeichnung mit Mensch darin,
    // nicht als zweite Karte — kein Screen zeigt beide nebeneinander.
    // Bewusst nicht `intro-aufrichten.webp`: das ist der CTA des
    // Dachdecker-Tages, und zwei Tage mit demselben Schlussbild wären der
    // Fehler, den die Karten-Entscheidung oben gerade vermeidet.
    C9: { src: '/medien/media/zimmerer/gallery-2.webp', pos: '50% 40%' },
  } satisfies Partial<Record<Id | 'intro', StepBild>>,
  /** Wortlaut `VALIDIERT` (khpl-tag-zimmerer.md 6, S5). */
  auftrag: {
    etikett: 'Dein erster Auftrag',
    titel: ['Bau heute', 'eine Wand.'],
    text: 'Du bist Azubi in einer Zimmerei. Sechs Uhr, die Halle ist noch kalt. Auf dem Abbundtisch liegt ein Stapel Holz, das gestern noch ein Baum war und heute Nachmittag eine Hauswand ist.',
    knopf: 'Auftrag annehmen',
  },
  graph: baueGraph(STEPS, {
    erster: 'C1',
    /**
     * Einladungstexte wörtlich aus khpl-tag-zimmerer.md 4 (`VALIDIERT`). Jeder
     * einzeln getextet — nie eine „Mehr erfahren“-Schablone (khpl-tage.md 3).
     */
    angebote: {
      'C1.1': {
        einladung: 'Wer hat das alles zugeschnitten?',
        beschreibung: 'Die Abbundanlage — und wer ihr sagt, was sie tun soll.',
      },
      'C3.1': {
        einladung: 'Warum baut überhaupt jemand aus Holz?',
        beschreibung: 'Eine Minute über Holz, CO₂ und einen Satz, der so nicht stimmt.',
      },
      'C5.1': {
        einladung: 'Was passiert, wenn der Kran schwingt?',
        beschreibung: 'Vier Leute, eine Last, und wer wen im Blick hat.',
      },
      /**
       * ⚠️ **Gemeldeter Widerspruch, nicht gelöst.** Die Spec validiert diesen
       * Wortlaut in 4 — und schreibt in 6 (C8), die Meister-Karte dürfe den
       * Beruf nicht als Besitzstand verkaufen, weil der einzige befragte
       * Zimmerermeister von Disposition, Kalkulation und Dauerstress erzählt.
       * Der Knopf trägt hier den validierten Wortlaut; die Korrektur steht in
       * `steps/zimmerer/karrierewege.ts`, wo die Karte selbst liegt.
       */
      'C8.1': { einladung: 'Meister', beschreibung: 'Eigener Betrieb, eigene Azubis.' },
      'C8.2': {
        einladung: 'Techniker',
        beschreibung: 'Planen und rechnen statt in die Halle.',
      },
      'C8.3': { einladung: 'Studium', beschreibung: 'Ja, das geht — auch ohne Abitur.' },
    } satisfies Partial<Record<Id, Angebot>>,
    /**
     * Hauptlinien-Fortsetzungen wörtlich aus khpl-tag-zimmerer.md 4
     * (`VALIDIERT`). Die drei Abstecher erben den Text ihres Elternschritts:
     * sie münden in denselben Hauptschritt, also steht dieselbe Tür am Ende.
     */
    weiterTexte: {
      C1: 'Weiter an den Tisch',
      'C1.1': 'Weiter an den Tisch',
      C2: 'Weiter zur Dämmung',
      C3: 'Weiter zum Fenster',
      'C3.1': 'Weiter zum Fenster',
      C4: 'Weiter zum Anhänger',
      C5: 'Weiter zur Baustelle',
      'C5.1': 'Weiter zur Baustelle',
      C6: 'Weiter zum Feierabend',
    } satisfies Partial<Record<Id, string>>,
    /**
     * Der Karriere-Link taucht auf S5 und danach auf jedem zweiten
     * Hauptschritt auf (khpl-ui-shell.md 6).
     *
     * **C7 fehlt hier bewusst**: C8 *ist* der nächste Schritt danach, und ein
     * Abstecher, der einen Schritt vor sein Ziel abkürzt, schickt den Besucher
     * im Kreis (Begründung wörtlich aus `berufe/dachdecker.ts`).
     */
    karriereSkipAuf: ['C2', 'C4', 'C6'],
    karriereBereich: ['C8', 'C8.1', 'C8.2', 'C8.3', 'C9'],
    karriereEinstieg: 'C8',
  }),
}
