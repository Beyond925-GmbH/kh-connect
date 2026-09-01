import { BEGRIFFE, type Begriffseintrag } from './begriffe'

/**
 * Das Glossar des Anlagenmechanik-Tages.
 *
 * **Eigene Datei je Beruf**, und der Grund ist inhaltlich: derselbe
 * Begriff heißt in zwei Gewerken nicht dasselbe. Der Bestandseintrag
 * „Stundensatz 50–90 € im Zimmererhandwerk" ist das Musterbeispiel — er ist
 * hier durch nichts ersetzt, weil dieser Tag über die Kundendienststunde
 * anders redet: bezahlt wird, dass jemand weiß, wo er hinschauen muss.
 *
 * **Drei Einträge sind aus dem Bestand wiederverwendet** statt kopiert:
 * `PSA`, `Gewerk`, `laufender Meter`. Sie zeigen auf dieselbe
 * Definition wie beim Dachdecker — zwei Fassungen desselben Begriffs sind
 * genau der Fehler, den `kehlbalken` in `begriffe.ts` schon einmal produziert
 * hat.
 *
 * **Die elf neuen Definitionstexte gehören fachlich gegengelesen.** Hier ist
 * eine falsche Definition peinlicher als anderswo, weil der Besucher sie für
 * die Antwort hält. Die Zahlen darin tragen ihre Quelle im Kommentar
 * darüber: Fülldruck und Sicherheitsventil, die Jahresarbeitszahl und die
 * Einsatzgrenze der Wärmepumpe.
 */

export const BEGRIFFE_ANLAGENMECHANIK = {
  // -------------------------------------------------------------------------
  // Wiederverwendet aus dem Bestand — eine Definition, ein Ort
  // -------------------------------------------------------------------------

  psa: BEGRIFFE.psa,
  gewerk: BEGRIFFE.gewerk,
  // Der Bestandstext nennt als Beispiele „Balken, Pfetten, Rinnen" — das ist
  // die Sprache der Bauberufe. Für dieses Gewerk wären es Rohrleitungen. Der
  // Eintrag bleibt trotzdem wiederverwendet: eine gewerkespezifische Fassung
  // wäre eine Änderung für alle Tage und gehört nicht in diesen hier.
  'laufender-meter': BEGRIFFE['laufender-meter'],

  // -------------------------------------------------------------------------
  // Neu — elf Einträge
  // -------------------------------------------------------------------------

  // `heizlast` stand hier für A3 (fachlich nach DIN EN 12831). Seit dem
  // Schätz-Umbau sagt kein Screen das Wort mehr — A3 übersetzt die Zahl in
  // Wasserkocher, und ein Glossareintrag ohne <Fachwort>-Anker ist toter
  // Inhalt. Wer das Wort wieder auf einen Screen bringt, holt den Eintrag aus
  // der Historie zurück.

  waermepumpe: {
    label: 'Wärmepumpe',
    erklaerung:
      'Sie macht keine Wärme, sie holt sie: aus der Luft draußen. Auch Luft bei null Grad steckt voller Wärme — richtig leer wäre sie erst bei minus 273 Grad. Die Wärmepumpe holt der Luft diese Wärme heraus und macht sie mit Strom heiß genug fürs Heizen. Heutige Geräte schaffen das bis etwa minus 20 Grad; sie brauchen dann nur mehr Strom für dieselbe Wärme.',
  },
  jahresarbeitszahl: {
    label: 'Jahresarbeitszahl',
    // Dieser Eintrag lohnt sich nur mit einem echten Wert dahinter, und den
    // gibt es: Fraunhofer-ISE-Feldprojekt „WP-QS im Bestand", 77 reale
    // Anlagen in Bestandsgebäuden, Luft/Wasser im Mittel JAZ 3,4.
    erklaerung:
      'Wie viel Wärme eine Wärmepumpe übers Jahr aus dem Strom macht, den sie verbraucht — der Wert, an dem man eine Anlage misst. Forscher (Fraunhofer ISE) haben das vier Jahre lang an 77 Anlagen in echten Häusern gemessen: Luft-Wärmepumpen lagen im Mittel bei 3,4. Aus einer Kilowattstunde Strom werden also gut drei Kilowattstunden Wärme.',
  },
  'vorlauf-ruecklauf': {
    label: 'Vorlauf und Rücklauf',
    erklaerung:
      'Zwei Rohre, ein Kreis. Im Vorlauf läuft das warme Wasser von der Heizung zu den Heizkörpern, im Rücklauf kommt es abgekühlt zurück. Wie weit es dabei abkühlt, sagt, wie viel Wärme im Raum geblieben ist.',
  },
  verteiler: {
    label: 'Verteiler',
    erklaerung:
      'Die Stelle im Keller, an der sich die Leitung aus der Heizung auf die einzelnen Heizkreise aufteilt — Erdgeschoss, Obergeschoss, Bad. Hier gehen alle Vorläufe ab und alle Rückläufe wieder zusammen.',
  },
  umwaelzpumpe: {
    label: 'Umwälzpumpe',
    erklaerung:
      'Sie schiebt das Wasser durch die Rohre. Ohne sie bliebe die Wärme dort, wo sie entsteht, und käme oben nie an.',
  },
  ausdehnungsgefaess: {
    label: 'Ausdehnungsgefäß',
    erklaerung:
      'Wasser dehnt sich aus, wenn es warm wird. Das Ausdehnungsgefäß fängt diesen Zuwachs auf — ein Stahlbehälter mit einem Luftpolster darin, das nachgibt wie ein Ball, den man eindrückt. Ohne es würde der Druck bei jedem Aufheizen steigen, bis das Sicherheitsventil Wasser ablässt.',
  },
  sicherheitsventil: {
    label: 'Sicherheitsventil',
    // Der Ansprechdruck ist zeitstabil: typische EFH-Anlagen 2,5 bar.
    erklaerung:
      'Das Ventil, das die Anlage vor zu viel Druck schützt. Bei einer üblichen Anlage im Einfamilienhaus öffnet es bei 2,5 bar — ungefähr so viel Druck wie in einem Autoreifen — und lässt Wasser ab. Dass es das tut, ist kein Defekt, sondern seine Aufgabe; die Ursache liegt woanders.',
  },
  'hydraulischer-abgleich': {
    label: 'hydraulischer Abgleich',
    erklaerung:
      'Die Einstellung, mit der jeder Heizkörper genau die Wassermenge bekommt, die er braucht. Ohne sie nehmen die Räume nah an der Pumpe zu viel und die entfernten zu wenig: vorne zu warm, hinten kalt. Gerechnet wird vorher, eingestellt wird an den Ventilen.',
  },
  zirkulation: {
    label: 'Zirkulation',
    erklaerung:
      'Eine zusätzliche Leitung, die das warme Wasser zwischen Speicher und Wasserhahn in Bewegung hält. Sie ist der Grund, warum in größeren Häusern sofort warmes Wasser kommt und nicht erst nach einer halben Minute — und einer der Punkte, an denen man nachsieht, wenn keins mehr kommt.',
  },
  inbetriebnahme: {
    label: 'Inbetriebnahme',
    erklaerung:
      'Der letzte Schritt einer Montage: Anlage füllen, entlüften, Druck aufbauen, die Regelung einstellen, starten — und prüfen, ob sie tut, was sie soll. Erst danach wird sie übergeben.',
  },
  shk: {
    label: 'SHK',
    // `SHK` gehört zwingend ins Glossar: die Berufsbezeichnung selbst ist die
    // erste Hürde. Der Begriff wird in A5 zusätzlich als eine der drei
    // Pausenfragen eingelöst.
    // „Bereiche" statt „Gewerke": im Erklärtext eines Chips darf kein zweites
    // Fachwort stecken. Wortgleich gehalten mit der Pausenfrage in A5.
    erklaerung:
      'Sanitär, Heizung, Klima. Drei Bereiche in einem Beruf: Wasser und Abwasser im Bad, die Heizung im Keller, Lüftung und Kühlung. Deshalb heißt der Beruf so lang — Anlagenmechaniker/-mechanikerin SHK.',
  },
} as const satisfies Record<string, Begriffseintrag>

export type AnlagenmechanikBegriffId = keyof typeof BEGRIFFE_ANLAGENMECHANIK

export function istAnlagenmechanikBegriff(
  wert: string,
): wert is AnlagenmechanikBegriffId {
  return Object.hasOwn(BEGRIFFE_ANLAGENMECHANIK, wert)
}
