import type { StepId } from '@/khpl/flow/steps'

/**
 * Die drei Karrierewege des Zimmerer-Tages.
 *
 * **Eigene Datei je Beruf, und das ist keine Aufräumarbeit, sondern eine
 * Korrektur.** Der Bestand führt Zimmerer-Zahlen unter einem Dachdecker-Namen,
 * und dieselben Zahlen wären ohne die Recherche vom 24.08.2026 in zwei weitere
 * Berufe kopiert worden, in die sie erst recht nicht gehören: zwischen 937 €
 * und 1.243 € im ersten Lehrjahr liegt ein Drittel, zwischen 5.600 € und
 * 13.500 € Meisterkosten mehr als das Doppelte.
 *
 * **Alle Zahlen hier sind eigens für den Zimmerer recherchiert**, Stand
 * 24.08.2026. Quelle je Wert:
 *
 * | Aussage | Quelle |
 * | --- | --- |
 * | Meisterlehrgang ~10.100 €, Okt–Mai, 1.200 h | BBZ Arnsberg, Kursjahr 2026/27 |
 * | Meister Ø ~49.000 €/Jahr, Einstieg 35.000–45.000 | Gehaltsportale |
 * | NRW-Meisterprämie 2.500 € | Land NRW — gilt hier, weil Handwerk |
 * | Techniker Holz-/Bautechnik, 2 J. Vollzeit, schulgeldfrei | Recherche 24.08.2026 |
 * | Techniker-Verdienst 2.750–3.800 € Einstieg | Gehaltsportale |
 * | Studium ohne Abitur nach BBHZVO | BBHZVO |
 * | TH OWL Detmold, Holzbau, 7 Semester | Recherche 24.08.2026 — passt für diesen Beruf |
 * | Biberacher Modell, 5 Jahre 3 Monate | Recherche 24.08.2026 — **reines Zimmerer-Modell** |
 *
 * Formulierungsregel: was aus Gehaltsportalen stammt, erscheint **nur als
 * Spanne oder mit „rund“** — nie als exakter Wert und nie als Versprechen.
 *
 * ⚠️ **Was diese Karten bewusst *nicht* tun.** In 25 Gesprächen hat **niemand**
 * von sich aus über Geld gesprochen, und die
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
     * ⚠️ **Zwei Anforderungen ziehen hier gegeneinander.** „Eigener Betrieb,
     * eigene Azubis“ ist der Satz, der zum Antippen bringt — und zugleich
     * beschreibt er den Meister als **Besitzstand**, während der einzige
     * befragte Zimmerermeister von Disposition, Kalkulation und Dauerstress
     * erzählt, nicht von Besitz.
     *
     * Aufgelöst wie folgt: der **Knopf** trägt den einladenden Wortlaut (er
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
        // Was ein Meister tatsächlich tut, aus dem Gespräch mit einem
        // Zimmerermeister (Interview, 02.07.2026). SEMA und AutoCAD nennt er
        // selbst beim Namen.
        frage: 'Was du den Tag über machst',
        antwort:
          'Den nächsten Tag planen. Wände am Computer zeichnen, mit Programmen wie SEMA oder AutoCAD. Ausrechnen, was ein Auftrag kostet. Material bestellen. Und dafür sorgen, dass die richtigen Leute zur richtigen Zeit an der richtigen Stelle sind. Ein Meister, den wir gefragt haben, sagt dazu auch: Vieles läuft nicht so, wie es geplant war.',
      },
      {
        frage: 'Wie lange',
        antwort:
          'In Vollzeit von Oktober bis Mai, rund 1.200 Stunden Unterricht — ungefähr so viel wie ein ganzes Schuljahr. Wer nebenbei weiter arbeitet, braucht zwei bis drei Jahre.',
      },
      {
        frage: 'Was es kostet',
        antwort:
          'Rund 10.100 Euro für Kurs und Prüfung — so viel wie ein gebrauchtes Auto. Einen großen Teil davon zahlt der Staat dazu; das nennt sich Aufstiegs-BAföG. Und wer besteht, bekommt in Nordrhein-Westfalen 2.500 Euro Meisterprämie obendrauf.',
      },
      {
        frage: 'Was du verdienst',
        antwort:
          'Als Zimmerermeister:in im Schnitt rund 49.000 Euro im Jahr — das sind grob 4.000 im Monat. Zum Einstieg etwa 35.000 bis 45.000 im Jahr.',
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
          'Ein zweiter Abschluss nach der Ausbildung: staatlich geprüfte:r Techniker:in, für Holztechnik oder Bautechnik. Du planst, rechnest und leitest, statt selbst in der Halle zu stehen.',
      },
      {
        frage: 'Wie lange',
        antwort: 'Zwei Jahre Fachschule in Vollzeit, drei bis vier neben dem Beruf.',
      },
      {
        frage: 'Was es kostet',
        antwort:
          'An den staatlichen Schulen in NRW kostet der Unterricht nichts. Du zahlst nur kleinere Gebühren und dein Material. Private Schulen verlangen deutlich mehr.',
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
        // Das Verwaltungswort „fachgebunden" ist ganz gestrichen: der Satz
        // sagt selbst, was die Regel einschränkt.
        antwort:
          'Weil sie den Weg nicht zumacht, sondern aufmacht. Mit dem Meisterbrief darfst du in Nordrhein-Westfalen jedes Fach an jeder Hochschule studieren. Ohne Abitur, ohne Aufnahmeprüfung. Als Techniker:in genauso. Auch mit dem Gesellenbrief und drei Jahren Arbeit im Beruf geht es. Dann kannst du aber nur ein Fach wählen, das zu deinem Beruf passt — Bauingenieur zum Beispiel.',
      },
      {
        frage: 'Und das geht hier',
        antwort:
          'Die Hochschule TH OWL bildet in Detmold Bauingenieure aus, mit einem eigenen Schwerpunkt Holzbau. Bachelor, dreieinhalb Jahre, 30 Kilometer von hier.',
      },
      {
        frage: 'Beides gleichzeitig',
        antwort:
          'In Biberach gibt es einen Weg, der Ausbildung, Meister und Studium zusammenlegt: fünf Jahre und drei Monate. Am Ende hast du alle drei Abschlüsse — Geselle, Meister, Bachelor.',
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
