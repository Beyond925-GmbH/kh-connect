import type { StepId } from '@/khpl/flow/steps'

/**
 * Die drei Karrierewege des Zimmerer-Tages (khpl-tag-zimmerer.md 6, C8).
 *
 * **Eigene Datei je Beruf, und das ist keine Aufräumarbeit, sondern eine
 * Korrektur** (khpl-tage.md §6.1 V2 und 0c). Der Bestand führt
 * Zimmerer-Zahlen unter einem Dachdecker-Namen, und dieselben Zahlen wären ohne
 * die Recherche vom 24.08.2026 in zwei weitere Berufe kopiert worden, in die
 * sie erst recht nicht gehören: zwischen 937 € und 1.243 € im ersten Lehrjahr
 * liegt ein Drittel, zwischen 5.600 € und 13.500 € Meisterkosten mehr als das
 * Doppelte.
 *
 * **Alle Zahlen hier stammen aus `belege/ausbildung-karriere.md`, Spalte
 * Zimmerer**, Stand 24.08.2026. Verdikt je Wert:
 *
 * | Aussage | Verdikt |
 * | --- | --- |
 * | Meisterlehrgang ~10.100 €, Okt–Mai, 1.200 h | `BELEGT` (BBZ Arnsberg, Kursjahr 2026/27) |
 * | Meister Ø ~49.000 €/Jahr, Einstieg 35.000–45.000 | `TEILWEISE BELEGT` (Gehaltsportale) |
 * | NRW-Meisterprämie 2.500 € | `BELEGT` — gilt hier, weil Handwerk |
 * | Techniker Holz-/Bautechnik, 2 J. Vollzeit, schulgeldfrei | `BELEGT` |
 * | Techniker-Verdienst 2.750–3.800 € Einstieg | `TEILWEISE BELEGT` (Portale) |
 * | Studium ohne Abitur nach BBHZVO | `BELEGT` |
 * | TH OWL Detmold, Holzbau, 7 Semester | `BELEGT` — passt für diesen Beruf |
 * | Biberacher Modell, 5 Jahre 3 Monate | `BELEGT` — **reines Zimmerer-Modell** |
 *
 * Formulierungsregel, die auch nach einer Freigabe gilt: was aus Gehaltsportalen
 * stammt, erscheint **nur als Spanne oder mit „rund“** — nie als exakter Wert
 * und nie als Versprechen.
 *
 * ⚠️ **Was diese Karten bewusst *nicht* tun.** khpl-tage.md 0 hält fest, dass in
 * 25 Gesprächen **niemand** von sich aus über Geld gesprochen hat, und die
 * Karrierekarten des Bestands tragen fast nur Zahlen. Deshalb steht auf jeder
 * Karte zuerst, was man in diesem Weg **tut**, und erst danach, was er kostet
 * und bringt.
 */

export interface Karriereweg {
  id: StepId
  /** Kartentitel in C8 und Überschrift des Info-Screens. */
  titel: string
  /** Der eine Satz auf der Karte in C8. */
  koeder: string
  abschnitte: { frage: string; antwort: string }[]
  /** Der personalisierte Aufhänger in C9. */
  aufhaenger: string
}

export const KARRIEREWEGE: Karriereweg[] = [
  {
    id: 'C8.1',
    titel: 'Meister',
    /**
     * ⚠️ **Widerspruch in der Spec, gemeldet statt gelöst.**
     * khpl-tag-zimmerer.md 4 validiert diesen Wortlaut als Einladungstext;
     * derselbe Abschnitt 6 verlangt, die Meister-Karte umzuschreiben, weil
     * „Eigener Betrieb, eigene Azubis“ den Meister als **Besitzstand**
     * beschreibt — und der einzige befragte Zimmerermeister von Disposition,
     * Kalkulation und Dauerstress erzählt, nicht von Besitz.
     *
     * Aufgelöst wie folgt: der **Knopf** trägt den validierten Wortlaut (er
     * steht im Graphen, `berufe/zimmerer.ts`), die **Karte** trägt die
     * Korrektur — sie steht gleich im zweiten Abschnitt und ist der längste.
     * Für den Teil des Publikums, der gern organisiert, ist das der
     * attraktivere Weg; die ehrliche Karte gewinnt hier mehr Leute als die
     * schöne.
     */
    koeder: 'Eigener Betrieb, eigene Azubis.',
    abschnitte: [
      {
        frage: 'Was ist das',
        antwort:
          'Der Meisterbrief im Zimmererhandwerk. Damit darfst du einen eigenen Betrieb führen und selbst ausbilden.',
      },
      {
        // Der Befund aus khpl-tag-zimmerer.md 6: was ein Meister tatsächlich
        // tut, aus dem Gespräch mit einem Zimmerermeister (`INTERVIEW`,
        // 02.07.2026). SEMA und AutoCAD nennt er selbst beim Namen.
        frage: 'Was du den Tag über machst',
        antwort:
          'Arbeitsvorbereitung, Zeichnungen am Rechner mit SEMA oder AutoCAD, Aufträge kalkulieren, Material bestellen und disponieren — und dafür sorgen, dass die richtigen Leute zur richtigen Zeit an der richtigen Stelle sind. Ein Meister, den wir gefragt haben, sagt dazu auch: Vieles läuft nicht so, wie es geplant war.',
      },
      {
        frage: 'Wie lange',
        antwort:
          'Der Vollzeitlehrgang läuft von Oktober bis Mai, rund 1.200 Stunden. Neben dem Beruf zwei bis drei Jahre.',
      },
      {
        frage: 'Was es kostet',
        antwort:
          'Rund 10.100 Euro für Lehrgang und Prüfung. Das Aufstiegs-BAföG übernimmt einen großen Teil davon, und wer besteht, bekommt in Nordrhein-Westfalen 2.500 Euro Meisterprämie.',
      },
      {
        frage: 'Was du verdienst',
        antwort:
          'Als Zimmerermeister:in im Schnitt rund 49.000 Euro im Jahr, zum Einstieg etwa 35.000 bis 45.000.',
      },
    ],
    aufhaenger:
      'Vielleicht wusstest du nicht, dass du mit dem Meisterbrief an jeder Hochschule in NRW studieren darfst.',
  },
  {
    id: 'C8.2',
    titel: 'Techniker',
    koeder: 'Planen und rechnen statt in die Halle.',
    abschnitte: [
      {
        frage: 'Was ist das',
        antwort:
          'Staatlich geprüfte:r Techniker:in, Fachrichtung Holztechnik oder Bautechnik. Du planst, rechnest und leitest, statt selbst in der Halle zu stehen.',
      },
      {
        frage: 'Wie lange',
        antwort: 'Zwei Jahre Fachschule in Vollzeit, drei bis vier neben dem Beruf.',
      },
      {
        frage: 'Was es kostet',
        antwort:
          'An den öffentlichen Fachschulen und Berufskollegs in NRW ist der Weg schulgeldfrei — es bleiben Gebühren und Material. Private Anbieter verlangen deutlich mehr.',
      },
      {
        frage: 'Der Punkt, den kaum jemand kennt',
        antwort:
          'Der Abschluss steht offiziell auf derselben Stufe wie ein Bachelor. Der Titel heißt sogar so: Bachelor Professional in Technik.',
      },
      {
        frage: 'Was du verdienst',
        antwort: 'Zum Einstieg rund 2.750 bis 3.800 Euro im Monat, je nach Betrieb.',
      },
    ],
    aufhaenger:
      'Vielleicht wusstest du nicht, dass der Techniker offiziell auf Bachelor-Niveau steht.',
  },
  {
    id: 'C8.3',
    titel: 'Studium',
    koeder: 'Ja, das geht — auch ohne Abitur.',
    abschnitte: [
      {
        frage: 'Warum erst eine Ausbildung?',
        antwort:
          'Weil sie den Weg nicht zumacht, sondern aufmacht. In Nordrhein-Westfalen berechtigt der Meisterbrief — und auch der Techniker — zur Einschreibung in jeden Studiengang an jeder Hochschule des Landes. Ohne Abitur, ohne Zugangsprüfung. Mit dem Gesellenbrief und drei Jahren im Beruf geht es fachgebunden.',
      },
      {
        frage: 'Und das geht hier',
        antwort:
          'Die TH OWL hat ihren Fachbereich Bauingenieurwesen in Detmold, mit einem eigenen Fachgebiet Holzbau. Bachelor, sieben Semester, 30 Kilometer von hier.',
      },
      {
        frage: 'Beides gleichzeitig',
        antwort:
          'In Biberach gibt es ein Modell, das Ausbildung, Meister und Ingenieurstudium zusammenlegt: fünf Jahre und drei Monate. Am Ende hast du den Gesellenbrief, den Meister und den Bachelor.',
      },
    ],
    aufhaenger:
      'Vielleicht wusstest du nicht, dass du als Handwerker:in studieren kannst — ohne Abitur, 30 Kilometer von hier.',
  },
]

export function karriereweg(id: StepId): Karriereweg | undefined {
  return KARRIEREWEGE.find((k) => k.id === id)
}

/** Fällt zurück, wenn in C8 nichts angesehen wurde. */
export const AUFHAENGER_OHNE =
  'Vielleicht war heute etwas dabei, das du nicht erwartet hast.'
