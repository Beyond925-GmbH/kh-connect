import type { StepId } from '@/khpl/flow/steps'

/**
 * Die drei Karrierewege dieses Tages (Z7.1–Z7.3).
 *
 * **Eine eigene Datei je Beruf, weil die vier Berufe sich in *jeder*
 * untersuchten Dimension unterscheiden** (khpl-tage.md §0c, khpl-tage.md §6.1
 * V2). Die Bestandsinhalte in `steps/dachdecker/karrierewege.ts` sind
 * Zimmerer-Wege und gelten hier ausdrücklich **nicht**: Meisterkosten,
 * Technikerfachrichtung und Studien-Anker sind andere.
 *
 * **Der Unterschied, an dem alles hängt: Zerspanung ist ein IHK-Beruf.** Kein
 * Handwerksmeister, sondern Industriemeister Metall — deutlich günstiger und
 * kürzer als die drei Handwerksmeister. Und deshalb steht auf diesen Karten
 * **weder die NRW-Meisterprämie noch die Meistergründungsprämie**: beides sind
 * Handwerksförderungen, und beide gelten für diesen Weg nicht
 * (`belege/ausbildung-karriere.md` §5). Ein Karrierescreen, der sie zeigt,
 * verspricht ausgerechnet diesem Beruf Geld, das es für ihn nicht gibt.
 *
 * **Zahlen und Stand.** Alles unten aus `belege/ausbildung-karriere.md`,
 * recherchiert am 24.08.2026, Verdikt und Quelle je Wert dort. Es gilt die
 * Formulierungsregel des Bestands: was aus Gehaltsportalen stammt, erscheint
 * **nur als Spanne oder mit „rund“**, nie als exakter Wert und nie als
 * Versprechen — hier steht eine Zahl vor einem Vierzehnjährigen.
 *
 * ⚠️ **Kein Studien-Anker mit Namen.** Der Detmold-Anker des Bestands (TH OWL,
 * Holzbau) passt für Zimmerer und Dachdecker, nicht hier; das Biberacher
 * Modell ist ein reines Zimmerer-Modell. Belegt ist für diesen Beruf nur die
 * **Fachrichtung** — Maschinenbau. Eine konkrete Hochschule steht deshalb
 * nicht auf der Karte, solange keine recherchiert ist (§11: „eigener
 * Studien-Anker nötig“).
 */

export interface Karriereweg {
  id: StepId
  /** Kartentitel in Z7 und Überschrift des Info-Screens. */
  titel: string
  /** Der eine Satz auf der Karte in Z7. */
  koeder: string
  abschnitte: { frage: string; antwort: string }[]
  /** Der personalisierte Aufhänger in Z8. */
  aufhaenger: string
}

export const KARRIEREWEGE: Karriereweg[] = [
  {
    id: 'Z7.1',
    titel: 'Meister',
    koeder: 'Eigener Betrieb, eigene Azubis.',
    abschnitte: [
      {
        frage: 'Was ist das',
        antwort:
          'Der Industriemeister Metall. In diesem Beruf ist es kein Handwerksmeister, sondern ein Abschluss vor der Industrie- und Handelskammer. Damit führst du eine Fertigung, planst Aufträge und bildest selbst aus.',
      },
      {
        frage: 'Wie lange',
        antwort:
          'Rund 1.050 Stunden. In Vollzeit sind das vier bis sechs Monate, neben dem Beruf zwei bis drei Jahre.',
      },
      {
        frage: 'Was es kostet',
        antwort:
          'Rund 5.600 bis 5.900 Euro für Lehrgang und Prüfung — der günstigste und kürzeste Meisterweg der vier Berufe an diesem Stand. Aufstiegs-BAföG übernimmt davon einen großen Teil.',
      },
      {
        frage: 'Was du verdienst',
        antwort:
          'Im Schnitt rund 57.000 Euro im Jahr. Die Spanne ist weit: sie hängt an Betrieb, Schicht und Verantwortung.',
      },
    ],
    aufhaenger:
      'Vielleicht wusstest du nicht, dass du mit dem Meistertitel an jeder Hochschule in NRW studieren darfst.',
  },
  {
    id: 'Z7.2',
    titel: 'Techniker',
    koeder: 'Konstruieren und planen statt an der Maschine.',
    abschnitte: [
      {
        frage: 'Was ist das',
        antwort:
          'Staatlich geprüfte:r Techniker:in, Fachrichtung Maschinenbautechnik — mancherorts mit Schwerpunkt Zerspanungstechnik. Du konstruierst, planst und rechnest, statt selbst an der Maschine zu stehen.',
      },
      {
        frage: 'Wie lange',
        antwort:
          'Zwei Jahre Fachschule in Vollzeit, drei bis vier neben dem Beruf. Mindestens 2.400 Stunden.',
      },
      {
        frage: 'Was es kostet',
        antwort:
          'An den öffentlichen Fachschulen und Berufskollegs in NRW zahlst du kein Schulgeld, nur Gebühren und Material. Private Anbieter verlangen mehrere tausend Euro.',
      },
      {
        frage: 'Der Punkt, den kaum jemand kennt',
        antwort:
          'Der Abschluss steht offiziell auf derselben Stufe wie ein Bachelor. Der Titel heißt sogar so: Bachelor Professional in Technik.',
      },
    ],
    aufhaenger:
      'Vielleicht wusstest du nicht, dass der Techniker offiziell auf Bachelor-Niveau steht.',
  },
  {
    id: 'Z7.3',
    titel: 'Studium',
    koeder: 'Ja, das geht — auch ohne Abitur.',
    abschnitte: [
      {
        frage: 'Warum erst eine Ausbildung?',
        antwort:
          'Weil sie den Weg nicht zumacht, sondern aufmacht. In Nordrhein-Westfalen berechtigt der Meistertitel — der Industriemeister genauso — und ebenso der Techniker zur Einschreibung in jeden Studiengang an jeder Hochschule des Landes. Ohne Abitur, ohne Aufnahmeprüfung.',
      },
      {
        frage: 'Und ohne Meister?',
        antwort:
          'Mit dem Facharbeiterbrief und drei Jahren im Beruf darfst du fachgebunden studieren: alles, was fachlich zu deiner Ausbildung passt. Bei diesem Beruf ist das Maschinenbau.',
      },
      {
        frage: 'Was der Zugang nicht ersetzt',
        antwort:
          'Die Zulassung. Wo es einen Numerus clausus gibt, gilt weiterhin das normale Vergabeverfahren — der Zugang bringt dich an die Hochschule, nicht an jedem anderen vorbei.',
      },
    ],
    aufhaenger:
      'Vielleicht wusstest du nicht, dass du als Facharbeiter:in studieren kannst — ohne Abitur.',
  },
]

export function karriereweg(id: StepId): Karriereweg | undefined {
  return KARRIEREWEGE.find((k) => k.id === id)
}

/** Fällt zurück, wenn in Z7 nichts angesehen wurde. */
export const AUFHAENGER_OHNE =
  'Vielleicht war heute etwas dabei, das du nicht erwartet hast.'
