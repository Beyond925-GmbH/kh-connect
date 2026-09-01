import type { StepId } from '@/khpl/flow/steps'

/**
 * Die drei Karrierewege dieses Berufs (Z8.1–Z8.3).
 *
 * **Zerspanungsmechaniker:in ist ein Industrieberuf — die Prüfung macht die
 * IHK, nicht die Handwerkskammer.** Daran hängt fast jede Zahl auf diesen
 * Karten, und deshalb ist hier nichts aus den anderen Tagen kopiert:
 *
 *  - Der Aufstieg heißt **Industriemeister:in Metall**, nicht
 *    Handwerksmeister. Die NRW-Meisterprämie (2.500 €) gilt nur für
 *    bestandene **Handwerks**-Meisterprüfungen und kommt hier deshalb
 *    **nicht** vor — sie zu versprechen wäre falsch.
 *  - Die Technikerfachrichtung ist **Maschinenbautechnik**, nicht Holz-
 *    oder Versorgungstechnik.
 *  - Der Studien-Anker ist regional und geprüft unaufwendig: die
 *    Universität Paderborn bildet Maschinenbauer:innen aus.
 *
 * Der Hochschulzugang in NRW (§ 49 Abs. 4 HG NRW mit BBHZVO) unterscheidet
 * nicht nach Kammer: auch Industriemeister und staatlich geprüfte Techniker
 * dürfen jeden Studiengang an jeder Hochschule des Landes studieren, und
 * die Abschlussprüfung plus drei Jahre Beruf öffnen den fachgebundenen Weg.
 *
 * **Formulierungsregel wie überall:** was aus Gehaltsportalen oder
 * Anbieterlisten stammt, erscheint nur als Spanne oder mit „rund“, nie als
 * exakter Wert und nie als Versprechen. ⚠️ Kosten- und Gehaltsspannen sind
 * fachlich abzunehmen.
 */

export interface Karriereweg {
  id: StepId
  /** Kartentitel in Z8 und Überschrift des Abstechers. */
  titel: string
  /** Der eine Satz auf der Karte in Z8. */
  koeder: string
  abschnitte: { frage: string; antwort: string }[]
  /** Der personalisierte Aufhänger auf dem CTA-Screen Z9. */
  aufhaenger: string
}

export const KARRIEREWEGE: Karriereweg[] = [
  {
    id: 'Z8.1',
    titel: 'Industriemeister',
    koeder: 'Die Schicht führen, Azubis ausbilden.',
    abschnitte: [
      {
        frage: 'Was ist das',
        antwort:
          'Industriemeister:in Metall — die nächste Stufe nach der Ausbildung. Geprüft wird bei der IHK, der Industrie- und Handelskammer. Du führst dann eine Schicht, teilst Aufträge und Leute ein und darfst selbst Azubis ausbilden.',
      },
      {
        frage: 'Wie lange',
        antwort:
          'In Vollzeit rund ein halbes Jahr. Neben dem Beruf dauert es zwei bis zweieinhalb Jahre — viele lernen abends und samstags, nach der Schicht.',
      },
      {
        frage: 'Was es kostet',
        antwort:
          'Kurs und Prüfung zusammen meist rund 6.000 bis 9.000 Euro — so viel wie ein gebrauchtes Auto. Das Aufstiegs-BAföG — Geld vom Staat für genau solche Weiterbildungen — übernimmt davon den größten Teil. Wer besteht, zahlt am Ende etwa ein Viertel selbst.',
      },
      {
        frage: 'Was du verdienst',
        antwort:
          'Je nach Betrieb und Schicht meist rund 50.000 bis 65.000 Euro im Jahr. Das sind grob 4.000 bis 5.400 Euro im Monat, bevor Steuern und Abgaben abgehen. In der Metallindustrie wird gut bezahlt.',
      },
    ],
    aufhaenger:
      'Vielleicht wusstest du nicht, dass du mit dem Industriemeister an jeder Hochschule in NRW studieren darfst.',
  },
  {
    id: 'Z8.2',
    titel: 'Techniker',
    koeder: 'Am Plan arbeiten statt an der Maschine.',
    abschnitte: [
      {
        frage: 'Was ist das',
        antwort:
          'Staatlich geprüfte:r Techniker:in, Fachrichtung Maschinenbautechnik. Du legst fest, wie ein Teil gebaut wird: welches Werkzeug, wie das Teil festgehalten wird, welches Programm, wie lange ein Stück dauern darf. Du stehst dann nicht mehr an der Maschine — du planst für alle, die dort stehen.',
      },
      {
        frage: 'Wie lange',
        antwort: 'Zwei Jahre Fachschule in Vollzeit, drei bis vier neben dem Beruf.',
      },
      {
        frage: 'Was es kostet',
        antwort:
          'An den staatlichen Fachschulen in NRW kostet der Unterricht nichts. Du zahlst nur ein paar Gebühren und dein Material.',
      },
      {
        frage: 'Der Punkt, den kaum jemand kennt',
        antwort:
          'Der Abschluss zählt offiziell genauso viel wie ein Bachelor an der Uni. Er heißt sogar so: Bachelor Professional in Technik.',
      },
    ],
    aufhaenger:
      'Vielleicht wusstest du nicht, dass der Techniker offiziell auf Bachelor-Niveau steht.',
  },
  {
    id: 'Z8.3',
    titel: 'Studium',
    koeder: 'Ja, das geht — auch ohne Abitur.',
    abschnitte: [
      {
        frage: 'Warum erst eine Ausbildung?',
        antwort:
          'Weil sie den Weg nicht zumacht, sondern aufmacht. Wer in Nordrhein-Westfalen den Industriemeister oder den Techniker hat, darf sich an jeder Hochschule des Landes für jedes Fach einschreiben — ohne Abitur, ohne Aufnahmeprüfung.',
      },
      {
        frage: 'Und ohne Meister?',
        antwort:
          'Auch dann. Mit bestandener Abschlussprüfung und drei Jahren im Beruf darfst du alles studieren, was zu deiner Ausbildung passt. Auch dafür brauchst du keine extra Prüfung.',
      },
      {
        frage: 'Was dann',
        antwort:
          'Maschinenbau — und das direkt vor der Haustür: An der Universität Paderborn kannst du das studieren. Wer heute Teile fertigt, rechnet dann aus, wie die Maschinen von morgen aussehen.',
      },
    ],
    aufhaenger:
      'Vielleicht wusstest du nicht, dass von der CNC-Maschine ein direkter Weg an die Uni führt — ohne Abitur.',
  },
]

export function karriereweg(id: StepId): Karriereweg | undefined {
  return KARRIEREWEGE.find((k) => k.id === id)
}

/** Fällt zurück, wenn in Z8 nichts angesehen wurde. */
export const AUFHAENGER_OHNE =
  'Vielleicht hat dich heute etwas überrascht — zum Beispiel, wie winzig ein Hundertstel Millimeter ist.'
