import { BEGRIFFE, type Begriffseintrag } from './begriffe'

/**
 * Das Glossar des Anlagenmechanik-Tages (Spec 9, khpl-tage.md §6.1 V6).
 *
 * **Eigene Datei je Beruf**, und der Grund steht in khpl-tage.md 0c: derselbe
 * Begriff heißt in zwei Gewerken nicht dasselbe. Der Bestandseintrag
 * „Stundensatz 50–90 € im Zimmererhandwerk" ist das Musterbeispiel — er ist
 * hier durch nichts ersetzt, weil dieser Tag über die Kundendienststunde
 * anders redet (Spec 6, A1: „bezahlt wird, dass jemand weiß, wo er hinschauen
 * muss").
 *
 * **Drei Einträge sind aus dem Bestand wiederverwendet** statt kopiert
 * (Spec 9): `PSA`, `Gewerk`, `laufender Meter`. Sie zeigen auf dieselbe
 * Definition wie beim Dachdecker — zwei Fassungen desselben Begriffs sind
 * genau der Fehler, den `kehlbalken` in `begriffe.ts` schon einmal produziert
 * hat.
 *
 * ⚠️ **Die zwölf neuen Definitionstexte sind `ENTWURF – UNGEPRÜFT` und
 * fachlich abzunehmen** (Spec 11). Hier ist eine falsche Definition peinlicher
 * als anderswo, weil der Besucher sie für die Antwort hält. Was an Zahlen
 * darin steht, ist `BELEGT` und trägt seine Quelle im Kommentar:
 * Fülldruck und Sicherheitsventil aus `belege/anlagenmechanik.md` 5, die
 * Jahresarbeitszahl aus 2, die Einsatzgrenze der Wärmepumpe aus 3.
 */

export const BEGRIFFE_ANLAGENMECHANIK = {
  // -------------------------------------------------------------------------
  // Wiederverwendet aus dem Bestand — eine Definition, ein Ort
  // -------------------------------------------------------------------------

  psa: BEGRIFFE.psa,
  gewerk: BEGRIFFE.gewerk,
  // ⚠️ Der Bestandstext nennt als Beispiele „Balken, Pfetten, Rinnen" — das ist
  // die Sprache der Bauberufe. Für dieses Gewerk wären es Rohrleitungen. Spec 9
  // führt den Eintrag ausdrücklich als wiederverwendbar; ob er umformuliert
  // gehört, entscheidet die Abnahme und nicht dieser Tag.
  'laufender-meter': BEGRIFFE['laufender-meter'],

  // -------------------------------------------------------------------------
  // Neu — zwölf Einträge, `ENTWURF – UNGEPRÜFT`
  // -------------------------------------------------------------------------

  /** A3. Fachlich nach DIN EN 12831, `BELEGT` (`belege/anlagenmechanik.md` 1). */
  heizlast: {
    label: 'Heizlast',
    erklaerung:
      'Wie viel Leistung ein Gebäude braucht, damit es auch am kältesten Auslegungstag warm bleibt — in Kilowatt. Sie hängt an Dämmung, Fläche und Fenstern, nicht am Wunschdenken. Wird sie zu groß angesetzt, ist die Anlage zu groß, teurer und läuft schlechter. Gerechnet wird sie nach DIN EN 12831.',
  },
  waermepumpe: {
    label: 'Wärmepumpe',
    erklaerung:
      'Sie macht keine Wärme, sie holt sie: aus der Luft draußen. Auch Luft bei null Grad steckt voller Wärme — richtig leer wäre sie erst bei minus 273 Grad. Die Wärmepumpe entzieht der Luft diese Wärme und hebt sie mit Strom auf Heiztemperatur. Heutige Geräte schaffen das bis etwa minus 20 Grad; sie brauchen dann nur mehr Strom je Kilowattstunde Wärme.',
  },
  jahresarbeitszahl: {
    label: 'Jahresarbeitszahl',
    // Spec 9 lässt diesen Eintrag nur zu, „wenn ein belegter Wert dazu
    // vorliegt". Er liegt vor: Fraunhofer-ISE-Feldprojekt „WP-QS im Bestand",
    // 77 reale Anlagen in Bestandsgebäuden, Luft/Wasser im Mittel JAZ 3,4
    // (`belege/anlagenmechanik.md` 2).
    erklaerung:
      'Wie viel Wärme eine Wärmepumpe übers Jahr aus einer Kilowattstunde Strom macht — der Wert, an dem sich die Anlage messen lässt. In einer vierjährigen Feldmessung des Fraunhofer ISE an 77 Anlagen in bestehenden Häusern lag sie bei Luft-Wärmepumpen im Mittel bei 3,4. Aus einer Kilowattstunde Strom werden also gut drei Kilowattstunden Wärme.',
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
      'Wasser dehnt sich aus, wenn es warm wird. Das Ausdehnungsgefäß nimmt diesen Zuwachs auf — ein Stahlbehälter mit einer Membran und einem Luftpolster dahinter. Ohne es stiege der Druck bei jedem Aufheizen, bis das Sicherheitsventil abbläst.',
  },
  sicherheitsventil: {
    label: 'Sicherheitsventil',
    // Ansprechdruck `BELEGT` (`belege/anlagenmechanik.md` 5, zeitstabil):
    // typische EFH-Anlagen 2,5 bar.
    erklaerung:
      'Das Ventil, das die Anlage vor zu hohem Druck schützt. Bei einer üblichen Anlage im Einfamilienhaus öffnet es bei 2,5 bar und lässt Wasser ab. Dass es abbläst, ist kein Defekt, sondern seine Aufgabe — die Ursache liegt woanders.',
  },
  'hydraulischer-abgleich': {
    label: 'hydraulischer Abgleich',
    erklaerung:
      'Die Einstellung, mit der jeder Heizkörper genau die Wassermenge bekommt, die er braucht. Ohne sie nehmen die Räume nah an der Pumpe zu viel und die entfernten zu wenig: vorne zu warm, hinten kalt. Gerechnet wird vorher, eingestellt wird an den Ventilen.',
  },
  zirkulation: {
    label: 'Zirkulation',
    erklaerung:
      'Eine zusätzliche Leitung, die das warme Wasser zwischen Speicher und Zapfstelle in Bewegung hält. Sie ist der Grund, warum in größeren Häusern sofort warmes Wasser kommt und nicht erst nach einer halben Minute — und einer der Punkte, an denen man nachsieht, wenn keins mehr kommt.',
  },
  inbetriebnahme: {
    label: 'Inbetriebnahme',
    erklaerung:
      'Der letzte Schritt einer Montage: Anlage füllen, entlüften, Druck aufbauen, die Regelung einstellen, starten — und prüfen, ob sie tut, was sie soll. Erst danach wird sie übergeben.',
  },
  shk: {
    label: 'SHK',
    // Spec 9: „**`SHK` gehört zwingend dazu.** Die Berufsbezeichnung selbst ist
    // die erste Hürde." Der Begriff wird in A5 zusätzlich als eine der drei
    // Pausenfragen eingelöst.
    erklaerung:
      'Sanitär, Heizung, Klima. Drei Gewerke in einem Beruf: Wasser und Abwasser im Bad, die Heizung im Keller, Lüftung und Kühlung. Deshalb heißt der Beruf so lang — Anlagenmechaniker/-mechanikerin SHK.',
  },
} as const satisfies Record<string, Begriffseintrag>

export type AnlagenmechanikBegriffId = keyof typeof BEGRIFFE_ANLAGENMECHANIK

export function istAnlagenmechanikBegriff(
  wert: string,
): wert is AnlagenmechanikBegriffId {
  return Object.hasOwn(BEGRIFFE_ANLAGENMECHANIK, wert)
}
