import { baueGraph, type Angebot, type StepDef } from '@/khpl/flow/steps'
import type { BerufDef, StepBild } from './typen'

/**
 * Zerspanungsmechaniker/-mechanikerin — der Tag als Zoom.
 *
 * Dreizehn Steps: acht auf der Hauptlinie (Z1–Z8), fünf Abstecher. Damit ist er
 * der kürzeste der vier Tage, und das ist eine Aussage über den Beruf, keine
 * Kürzung (`khpl-tag-zerspanung.md` §1): dieser Beruf hat keine Anfrage, kein
 * Angebot, keinen Ortstermin, keinen Kunden. Der Tag fängt an, wo eine
 * Zeichnung auf dem Tisch liegt — die beiden Dachdecker-Schritte „Auftrag
 * gewinnen“ fallen ersatzlos weg.
 *
 * **Der Tag bewegt sich durch den Maßstab statt durch Orte.** Die Zeichnung in
 * Millimetern (Z1), das Rüsten in Zehnteln (Z2), das Messen in Hundertsteln
 * (Z5), das Werkzeug in Tausendsteln (Z4). Der Satz, um den er gebaut ist:
 * *Du machst eins. Die Maschine macht vierhundert.*
 *
 * **Sein Id-Präfix ist `Z`** (khpl-tage.md §6.1 V4). Abstecher tragen wie
 * überall ein `.`-Suffix (`Z1.1`).
 *
 * ⚠️ **Zahlen.** Struktur, Schrittfolge und Texte sind am 24.08.2026
 * abgenommen (`VALIDIERT`); die Zahlen des Tages tragen ihren Status je
 * Einzelwert und stehen in `belege/zerspanung.md` und
 * `belege/ausbildung-karriere.md`. Was dort `NICHT BELEGBAR` heißt, erscheint
 * auf keinem Screen.
 */

/**
 * Das Id-Vokabular dieses Berufs. Es gehört hierher und nicht in die Hülle:
 * jeder der vier Berufe hat ein M5, und eine gemeinsame Union darüber wäre
 * keine Prüfung, sondern eine Kollision (siehe `dachdecker.ts`).
 */
type Id =
  | 'Z1'
  | 'Z1.1'
  | 'Z2'
  | 'Z2.1'
  | 'Z3'
  | 'Z4'
  | 'Z5'
  | 'Z6'
  | 'Z7'
  | 'Z7.1'
  | 'Z7.2'
  | 'Z7.3'
  | 'Z8'

/**
 * Damit auch `weiter`, `eltern` und `abstecher` an die Ids gebunden sind und
 * nicht bloß `string` bleiben — sonst fängt `satisfies` nur Schreibfehler in
 * der eigenen `id` und ausgerechnet nicht die in den Verweisen.
 */
type ZerspanungStep = Omit<StepDef, 'id' | 'weiter' | 'eltern' | 'abstecher'> & {
  id: Id
  weiter: Id | null
  eltern: Id | null
  abstecher: readonly Id[]
}

const STEPS = [
  {
    id: 'Z1',
    // R6: Der alte Titel „Null Komma null zwei eins“ sprach die Zahl aus, die
    // der Slider gerade erraten soll — wer lesen kann, kannte die Antwort vor
    // dem ersten Zug. Die ausgeschriebene Zahl steht jetzt dort, wo sie stark
    // ist: als Zwischentitel der Auflösung (`Z1.tsx`, `Aufloesung`).
    titel: 'Der Spielraum, den niemand sieht',
    kurz: 'Zeichnung und Toleranz',
    art: 'haupt',
    weiter: 'Z2',
    abstecher: ['Z1.1'],
    eltern: null,
  },
  {
    id: 'Z1.1',
    titel: 'Wer zeichnet das?',
    kurz: 'Konstruktion',
    art: 'abstecher',
    weiter: 'Z2',
    abstecher: [],
    eltern: 'Z1',
  },
  {
    id: 'Z2',
    titel: 'Alles muss sitzen, bevor irgendwas läuft',
    kurz: 'Rüsten und Nullpunkt',
    art: 'haupt',
    weiter: 'Z3',
    abstecher: ['Z2.1'],
    eltern: null,
  },
  {
    id: 'Z2.1',
    titel: 'Warum es überall spritzt',
    kurz: 'Kühlschmierstoff',
    art: 'abstecher',
    weiter: 'Z3',
    abstecher: [],
    eltern: 'Z2',
  },
  {
    id: 'Z3',
    titel: 'Zeile für Zeile',
    kurz: 'Das Programm',
    art: 'haupt',
    weiter: 'Z4',
    abstecher: [],
    eltern: null,
  },
  {
    id: 'Z4',
    titel: 'Der stillste Raum der Firma',
    kurz: 'Der Messraum',
    art: 'haupt',
    weiter: 'Z5',
    abstecher: [],
    eltern: null,
  },
  {
    id: 'Z5',
    titel: 'Und, passt es?',
    kurz: 'Messen und korrigieren',
    art: 'haupt',
    weiter: 'Z6',
    abstecher: [],
    eltern: null,
  },
  {
    id: 'Z6',
    titel: 'Deins ist das erste',
    kurz: 'Feierabend',
    art: 'haupt',
    weiter: 'Z7',
    abstecher: [],
    eltern: null,
  },
  {
    id: 'Z7',
    titel: 'Und danach?',
    kurz: 'Karriere-Schritte',
    art: 'haupt',
    weiter: 'Z8',
    abstecher: ['Z7.1', 'Z7.2', 'Z7.3'],
    eltern: null,
  },
  {
    id: 'Z7.1',
    titel: 'Meister',
    kurz: 'Meister',
    art: 'abstecher',
    weiter: 'Z8',
    abstecher: [],
    eltern: 'Z7',
    immerOffen: true,
  },
  {
    id: 'Z7.2',
    titel: 'Techniker',
    kurz: 'Techniker',
    art: 'abstecher',
    weiter: 'Z8',
    abstecher: [],
    eltern: 'Z7',
    immerOffen: true,
  },
  {
    id: 'Z7.3',
    titel: 'Studium',
    kurz: 'Studium',
    art: 'abstecher',
    weiter: 'Z8',
    abstecher: [],
    eltern: 'Z7',
    immerOffen: true,
  },
  {
    id: 'Z8',
    titel: 'Dein nächster Schritt',
    // Nicht 'CTA': `kurz` steht im Sheet und auf dem Weitermachen-Knopf des
    // Splash — Board-Sprache gehört nicht vor den Besucher.
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
   * ⚠️ **Unverändert aus `berufe/angekuendigt.ts` übernommen.** Der Vektor
   * speist bereits den Trichter; wer ihn beim Ausbau ändert, ändert die
   * Empfehlung für alle vier Berufe (khpl-tage.md §5).
   *
   * Das gilt ausdrücklich auch für `team: 0.4`, obwohl drei von vier
   * Gesprächen das Team unaufgefordert loben, zweimal wörtlich als „wie eine
   * kleine Familie“ (khpl-tag-zerspanung.md §8). Der Wert bleibt hier stehen;
   * die Entscheidung darüber gehört an eine Stelle, die alle vier Berufe im
   * Blick hat. **Der Tag zeigt das Team trotzdem** — in der Schichtübergabe
   * (S5), im gemeinsamen Fehlersuchen (Z3) und in Z2.
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
  /**
   * Kein Szenario-Video im Bestand (khpl-tag-zerspanung.md §10). Ohne
   * `szenario` fällt die Auftragsannahme von selbst auf `hero` und
   * `heroPoster` zurück — genau so vorgesehen, kein Notbehelf.
   */
  medien: {
    karte: '/medien/media/zerspanungsmechaniker/card.webp',
    heroPoster: '/medien/media/zerspanungsmechaniker/hero-poster.webp',
    hero: '/medien/media/zerspanungsmechaniker/hero.mp4',
  },
  /**
   * Die Motivliste dieses Tages — am Stück, wie es die Redaktionsentscheidung
   * verlangt (khpl-tage.md §6.1 V3). **Nur Dateien, die im Repo liegen**;
   * Herkunft in `MEDIEN.md`, Beschreibungen in `MEDIEN-INVENTAR.md`.
   *
   * Die Hälfte der Steps steht bewusst nicht darin. Dieser Tag baut seine
   * Bühne aus Zeichnung, Werkzeugweg und Zahl (§7) — Z1, Z2, Z3, Z5 und Z6
   * tragen kein Foto, sondern `buehne/zerspanung/`. Für Z6 (Kiste mit Teilen)
   * gibt es zusätzlich **kein passendes Motiv im Bestand**; es ist neben dem
   * Szenario-Video die zweite echte Medienlücke des Tages und die wichtigere,
   * weil sie die Pointe trägt (§10).
   *
   * `gallery-1.webp` trägt seit dem Ausbau Z7, `schaetzen-spindel.webp` seit
   * dem Review Z7.1 — der Bestand ist damit ausgeschöpft.
   */
  bilder: {
    /*
      Bediener an der CNC-Maschine — der Screen, der `technik: 1` mit trägt.

      **Der Ausschnitt sitzt links, nicht mittig.** Das Motiv ist 16 : 9; auf
      der stehenden Stele bleibt davon ein Streifen von nicht einmal einem
      Drittel der Bildbreite, und die untere Hälfte liegt unter dem Panel.
      Mittig blieben davon die Linearführung und ein helles Brett übrig — das
      liest sich nach Holz. Links steht die Frässpindel mit dem Werkzeug: der
      einzige Ausschnitt dieses Bildes, der auch hochkant nach Maschine
      aussieht. Der zweite Wert wirkt nicht — bei 16 : 9 in einem 9 : 16-Rahmen
      deckt `cover` die volle Höhe ab, beschnitten wird ausschließlich seitlich.

      TODO: Der Screen fragt „Wer zeichnet das?“ und erklärt die Kette vom
      CAD-Arbeitsplatz zur Maschine — das Motiv zeigt nur ihr Ende. Ein
      CAD-Bildschirm mit Metallteil fehlt im Bestand (`m3-cad.webp` zeigt ein
      Holzhaus und damit ein fremdes Gewerk); bis dahin trägt die Maschine.
    */
    'Z1.1': { src: '/medien/media/zerspanungsmechaniker/gallery-2.webp', pos: '22% 45%' },
    // Kühlmittel spritzt über das Werkstück. Genau das Motiv, das der
    // Abstecher erklärt.
    'Z2.1': { src: '/medien/media/zerspanungsmechaniker/gallery-3.webp', pos: '50% 50%' },
    // Werkzeug über einem Stahlmaßstab: das ruhigste, sauberste Motiv des
    // Bestands und damit der beste Kandidat für den Messraum (§6 Z4).
    Z4: {
      src: '/medien/media/zerspanungsmechaniker/quiz-praezision.webp',
      pos: '50% 50%',
    },
    // §10 führt für Z7 keinen Slot — ohne Eintrag bliebe die Bühne des
    // Karriere-Screens leer, und das wäre die einzige Stelle des Tages, an der
    // sie das täte: hochkant ein schwarzes oberes Drittel, das sich wie ein
    // Ladefehler liest. `gallery-1.webp` (Fräser trägt Metall ab, Späne
    // fliegen) steht im Bestand ungenutzt und ist das Motiv mit Vorwärtsdrang
    // — anders als `schaetzen-spindel.webp`, das neben `gallery-3` (Z2.1)
    // zweimal dasselbe Kühlmittel zeigte.
    Z7: { src: '/medien/media/zerspanungsmechaniker/gallery-1.webp', pos: '55% 55%' },
    /*
      Z7.1 trägt nicht mehr das geteilte Meisterfoto (`b91-meister.webp`):
      das zeigt eine Holzwerkstatt, und der Text daneben sagt ausdrücklich
      „kein Handwerksmeister, sondern Industriemeister **Metall**“ — Bild und
      Satz widersprachen sich wörtlich (R13/R14). `schaetzen-spindel.webp`
      (Werkzeug im Futter einer Metall-CNC, sauber, unverkennbar dieses
      Gewerk) ist der beste Ersatz im Bestand; ein echtes
      Industriemeister-Motiv mit Mensch steht in
      `ui-review/medien-luecken-zerspanung.md`.

      Techniker und Studium bleiben gemeinsam — dort zeigt kein Bild ein
      fremdes Gewerk (khpl-tage.md §6.1 V2).
    */
    'Z7.1': {
      src: '/medien/media/zerspanungsmechaniker/schaetzen-spindel.webp',
      pos: '50% 50%',
    },
    'Z7.2': { src: '/medien/schritte/b92-techniker.webp', pos: '50% 40%' },
    'Z7.3': { src: '/medien/schritte/b93-studium.webp', pos: '50% 40%' },
    /*
      Zum Schluss Menschen, keine Maschine: hier soll jemand aufstehen und an
      den Stand gehen. „Team am Maschinenbildschirm“ ist das einzige Motiv im
      Bestand, auf dem in diesem Beruf jemand mit jemandem redet.

      **Nur der erste Wert entscheidet.** Das Motiv ist 16 : 9; auf der
      stehenden Stele deckt `cover` die volle Höhe ab und beschneidet
      ausschließlich seitlich, quer (16 : 9) fällt gar kein Schnitt an. Der
      zweite Wert steht deshalb nur der Vollständigkeit halber da — die
      senkrechte Lage ist auf diesem Bild in keiner Ausrichtung verschiebbar.

      ⚠️ **Die Schädeldecken fehlen schon in der Vorlage.** Alle drei Köpfe
      berühren im Original die obere Kante; kein Ausschnitt der Welt holt sie
      zurück, und ein tiefer gesetztes Bild ergäbe eine waagerechte Naht mitten
      durch die Stirnen. Was der Ausschnitt entscheiden kann, ist, ob im
      stehenden Streifen **Gesichter** stehen oder Rümpfe. Bei 50 % stand darin
      der junge Kollege und hinter ihm eine Schulter — zwei angeschnittene
      Kinne, keine Szene. Bei 70 % liegen zwei vollständige Profile im
      Streifen, beide im Gespräch nach rechts gewandt, dazwischen die Hand mit
      dem Tablet: der Moment, den dieser Screen als Aufforderung braucht.
    */
    Z8: { src: '/medien/media/zerspanungsmechaniker/card.webp', pos: '70% 45%' },
  } satisfies Partial<Record<Id, StepBild>>,
  /**
   * S5 — die Auftragsannahme, `VALIDIERT` (khpl-tag-zerspanung.md §6).
   *
   * Sie trägt hier mehr Last als bei den anderen drei: weil der Tag keinen
   * Schritt „Auftrag gewinnen“ hat, macht sie die **Schichtübergabe** — und
   * deshalb kann Z1 sofort mit der Zeichnung anfangen.
   *
   * Die Viertelstunde vor der Schicht ist `INTERVIEW` (Einblicke
   * Zerspanungsmechanikerin, 09.07.2026): „Man sollte in der Regel 'ne
   * Viertelstunde eher da sein, da man in der Regel noch 'ne Schichtübergabe
   * hat.“ Die Schichtzeiten selbst bleiben **betriebsspezifisch** — ein
   * Betrieb ist kein Tarifvertrag (§11).
   */
  auftrag: {
    etikett: 'Deine Frühschicht',
    titel: ['Vierhundert Teile.', 'Eins machst du.'],
    text: 'Viertel vor sechs. Die Nachtschicht übergibt: was gelaufen ist, was noch läuft, was klemmt. Dann steht da eine Zeichnung und ein Zettel — 400 Stück bis Freitag. Die Maschine kann das. Sie weiß nur noch nicht, wie.',
    knopf: 'Schicht übernehmen',
  },
  graph: baueGraph(STEPS, {
    erster: 'Z1',
    /** Einladungstexte wörtlich aus khpl-tag-zerspanung.md §4 (`VALIDIERT`). */
    angebote: {
      'Z1.1': {
        einladung: 'Woher kommt die Zeichnung?',
        beschreibung: 'Jemand hat das konstruiert. Schau dir an, wer.',
      },
      'Z2.1': {
        einladung: 'Warum spritzt da überall was?',
        beschreibung: 'Kühlschmierstoff — und was ohne ihn passiert.',
      },
      'Z7.1': { einladung: 'Meister', beschreibung: 'Eigener Betrieb, eigene Azubis.' },
      'Z7.2': {
        einladung: 'Techniker',
        beschreibung: 'Konstruieren und planen statt an der Maschine.',
      },
      'Z7.3': { einladung: 'Studium', beschreibung: 'Ja, das geht — auch ohne Abitur.' },
    } satisfies Partial<Record<Id, Angebot>>,
    /**
     * Wörtlich aus §4. `Z3 → „Start drücken“` ist der einzige Weiter-Text der
     * ganzen Anwendung, der eine Handlung in der Fiktion **ist**, statt sie
     * anzukündigen — an dieser Stelle ist Weitergehen wirklich der Knopfdruck.
     *
     * Die beiden Abstecher erben den Text ihres Elternschritts: sie münden in
     * denselben nächsten Hauptschritt und sollen dorthin nicht anders
     * einladen als die Hauptlinie.
     */
    weiterTexte: {
      Z1: 'Weiter an die Maschine',
      'Z1.1': 'Weiter an die Maschine',
      Z2: 'Weiter zur Steuerung',
      'Z2.1': 'Weiter zur Steuerung',
      Z3: 'Start drücken',
      Z4: 'Weiter zur Messbank',
      Z5: 'Weiter zum Feierabend',
    } satisfies Partial<Record<Id, string>>,
    /**
     * Zwei Stellen statt drei — der Tag ist kürzer (§4).
     *
     * **Nicht auf Z5**, denn Z6 liegt dann unmittelbar vor dem Ziel Z7: ein
     * Abstecher, der einen Schritt vor sein Ziel abkürzt, schickt den Besucher
     * über Z7 → Z8 → zurück auf Z5 → weiter zu Z6 → Z7 — derselbe Bereich
     * zweimal (dieselbe Regel wie bei `dachdecker.ts`).
     */
    karriereSkipAuf: ['Z1', 'Z3'],
    karriereBereich: ['Z7', 'Z7.1', 'Z7.2', 'Z7.3', 'Z8'],
    karriereEinstieg: 'Z7',
  }),
}
