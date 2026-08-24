import type { Begriffseintrag } from './begriffe'

/**
 * Das Glossar des Zerspanungs-Tages (khpl-tag-zerspanung.md §9, khpl-tage.md
 * §6.1 V6).
 *
 * **Eigene Datei je Beruf, und zwar aus einem inhaltlichen Grund.** `Ausschuss`
 * steht bereits im Dachdecker-Glossar — dort ist es ein Balken, der drei
 * Zentimeter zu kurz ist, hier ein Teil, das die Toleranz verfehlt. Zwei
 * Glossare, zwei Einträge; ein gemeinsames Glossar hätte einen der beiden
 * still überschrieben.
 *
 * `CAD` und `PSA` sind laut §9 „wiederverwendbar aus dem Bestand“ und stehen
 * trotzdem hier: die Bestandsfassung von `CAD` erklärt den Holzbau
 * („daraus entsteht direkt der Abbundplan“), und `PSA` endet dort mit der
 * Baustelle. Beides gilt in einer Halle nicht.
 *
 * **`Stundensatz` fehlt bewusst.** Der Bestandseintrag nennt 50–90 € im
 * Bauhandwerk; für diesen Beruf ist das unpassend, weil hier mit
 * Maschinenstundensätzen gerechnet wird (`belege/ausbildung-karriere.md`,
 * „Was in der App falsch ist“). Ein Begriff, der nicht stimmt, wird nicht
 * umformuliert, sondern weggelassen.
 *
 * ⚠️ **Alle Definitionstexte sind `ENTWURF – UNGEPRÜFT`** und laut §11 vor der
 * Messe **fachlich abzunehmen** — von einem Menschen aus dem Gewerk. Hier ist
 * eine falsche Definition peinlicher als anderswo, weil der Besucher sie für
 * die Antwort hält. Wo Zahlen vorkommen, sind sie belegt und die Fundstelle
 * steht am Eintrag.
 */

export const BEGRIFFE_ZERSPANUNG = {
  toleranz: {
    label: 'Toleranz',
    erklaerung:
      'Der erlaubte Spielraum um ein Maß. Kein Teil wird exakt so groß wie gezeichnet, deshalb sagt die Zeichnung dazu, wie weit es abweichen darf. Innerhalb der Toleranz ist das Teil gut, außerhalb nicht — und enger heißt nicht besser, enger heißt teurer.',
  },
  passung: {
    label: 'Passung',
    // BELEGT nach ISO 286 (belege/zerspanung.md 1): IT7 im Nennmaßbereich
    // 18–30 mm ist 21 µm, die Lage „h“ setzt das obere Abmaß auf null. Die
    // Breite hängt am Nennmaß — bei Ø 50 wären es 25 µm. Maß und Toleranz
    // gehören deshalb immer zusammen.
    erklaerung:
      'Buchstabe und Zahl hinter einem Maß sagen, wie genau es sein muss. Ø 20 h7 heißt: höchstens 20,000 Millimeter, mindestens 19,979 — der ganze Spielraum ist 0,021 Millimeter. Der Buchstabe sagt, wo die Toleranz liegt, die Zahl, wie breit sie ist.',
  },
  rohling: {
    label: 'Rohling',
    erklaerung:
      'Das Stück Metall, bevor es bearbeitet wird: eine abgesägte Stange, ein Guss- oder ein Schmiedeteil. Er ist überall etwas größer als das fertige Teil — was zu viel ist, wird abgespant.',
  },
  ruesten: {
    label: 'Rüsten',
    // BELEGT als Prinzip nach REFA (belege/zerspanung.md 3): Auftragszeit =
    // Rüstzeit + Stückzahl × Stückzeit. In der Kleinserie dominiert die
    // Rüstzeit. Ein konkretes Verhältnis ist NICHT BELEGBAR und steht deshalb
    // hier auch nicht.
    erklaerung:
      'Die Maschine auf einen Auftrag vorbereiten: Rohling spannen, Werkzeuge bestücken, ihre Längen vermessen, den Nullpunkt setzen, das Programm laden. Dabei entsteht kein einziges Teil — und bei kleinen Stückzahlen ist es trotzdem der größte Zeitblock des Auftrags.',
  },
  werkstuecknullpunkt: {
    label: 'Werkstücknullpunkt',
    // Der Nebensatz einer Auszubildenden löst den Begriff vollständig auf
    // (INTERVIEW, Einblicke Zerspanungsmechanikerin): „damit die Maschine
    // weiß, wo sich das Werkstück grade befindet“. Der Text versucht nicht,
    // das zu verbessern.
    erklaerung:
      'Der Punkt, von dem aus die Maschine rechnet. Er liegt nicht in der Maschine, sondern am Werkstück, und du legst ihn fest — damit die Maschine weiß, wo sich das Werkstück gerade befindet. Verschiebt er sich um einen Zehntelmillimeter, sind alle Teile um einen Zehntel falsch.',
  },
  werkzeugkorrektur: {
    label: 'Werkzeugkorrektur',
    // INTERVIEW (Ausbildung Zerspanungsmechaniker, 01.07.2026): „In der
    // Maschine. Werkzeugkorrektor. … Radius oder Länge.“
    erklaerung:
      'Ein Wert in der Steuerung, mit dem Länge oder Radius eines Werkzeugs nachgestellt wird. Misst du am fertigen Teil ein paar Hundertstel zu viel, änderst du nicht das Programm, sondern den Korrekturwert — und das nächste Teil passt.',
  },
  vorschub: {
    label: 'Vorschub',
    erklaerung:
      'Wie weit das Werkzeug bei jeder Umdrehung am Werkstück entlangwandert, angegeben in Millimetern je Umdrehung. Viel Vorschub geht schnell, wenig Vorschub gibt die glattere Oberfläche.',
  },
  drehzahl: {
    label: 'Drehzahl',
    // BELEGT (belege/zerspanung.md 6): n = 1000·vc / (π·D); vc 180–250 m/min
    // beim Stahldrehen ergibt bei Ø 20 rund 3.200 min⁻¹. „Mehrere tausend“ ist
    // die sichere Aussage, eine feste Zahl wäre es nicht.
    erklaerung:
      'Wie oft sich das Werkstück in der Minute dreht. Sie hängt am Durchmesser und am Werkstoff: je dünner das Teil, desto schneller muss es sich drehen. Bei einer Welle von 20 Millimetern aus Stahl sind das mehrere tausend Umdrehungen pro Minute.',
  },
  span: {
    label: 'Span',
    // BELEGT (belege/zerspanung.md 6): 350 °C bis über 1.100 °C in der
    // Zerspanzone, rund 80 % der Wärme gehen in den Span.
    erklaerung:
      'Das Material, das die Schneide abhebt. Er nimmt den größten Teil der Wärme mit hinaus — deshalb sind die Späne heiß und das Werkstück bleibt es nicht. Genau daher kommt auch der Name des Berufs.',
  },
  kuehlschmierstoff: {
    label: 'Kühlschmierstoff',
    erklaerung:
      'Die Flüssigkeit, die während der Bearbeitung auf die Schneide läuft: sie kühlt, schmiert und spült die Späne weg. Ohne sie wird das Werkzeug heiß, dehnt sich aus — und das Maß wandert.',
  },
  buegelmessschraube: {
    label: 'Bügelmessschraube',
    // INTERVIEW, zwei Gespräche: im Betrieb heißt sie Mikrometerschraube. Der
    // Screen nennt sie deshalb so, das Glossar erklärt beide Namen.
    erklaerung:
      'Das Messgerät für Außenmaße: Du drehst sie zu, bis sie am Teil anliegt, und liest Hundertstelmillimeter ab. Im Betrieb sagt fast niemand Bügelmessschraube — dort heißt sie Mikrometerschraube.',
  },
  cnc: {
    label: 'CNC',
    // INTERVIEW (Einblicke Zerspanungsmechanikerin): „eine konventionelle
    // Maschine is in der Regel handbetrieben … die haben kein Bildschirm.“
    erklaerung:
      'Computerized Numerical Control: Die Maschine fährt ihre Wege nach einem Programm ab, nicht nach Handrädern. Eine konventionelle Maschine hat Räder mit Zahlen darauf und keinen Bildschirm — in der Ausbildung kommen beide vor.',
  },
  cam: {
    label: 'CAM',
    erklaerung:
      'Computer Aided Manufacturing: die Software zwischen Konstruktion und Maschine. Aus dem Modell rechnet sie die Werkzeugwege und daraus das Programm, das die Steuerung liest.',
  },
  cad: {
    label: 'CAD',
    erklaerung:
      'Computer Aided Design — Konstruieren am Rechner. Am Anfang jedes Teils steht ein Modell oder eine Zeichnung; daraus wird über CAM das Programm, nach dem die Maschine fährt.',
  },
  ausschuss: {
    label: 'Ausschuss',
    // Nicht derselbe Eintrag wie beim Dachdecker (dort: ein Balken, der zu
    // kurz ist). Die Asymmetrie ist die eigentliche Lektion des Tages, siehe
    // §6 Z5.
    erklaerung:
      'Ein Teil, das die Toleranz verfehlt und sich nicht mehr retten lässt. Zu dick darf nacharbeiten — Material kann man noch abnehmen. Zu dünn ist Ausschuss: drankleben kann man nichts.',
  },
  psa: {
    label: 'PSA',
    erklaerung:
      'Persönliche Schutzausrüstung: Sicherheitsschuhe, Schutzbrille, Gehörschutz, eng anliegende Kleidung. Was jeder am Körper trägt, bevor er in die Halle geht — an einer laufenden Maschine hat kein loser Ärmel etwas zu suchen.',
  },
} as const satisfies Record<string, Begriffseintrag>

export type BegriffZerspanungId = keyof typeof BEGRIFFE_ZERSPANUNG

export function istBegriffZerspanungId(wert: string): wert is BegriffZerspanungId {
  return Object.hasOwn(BEGRIFFE_ZERSPANUNG, wert)
}
