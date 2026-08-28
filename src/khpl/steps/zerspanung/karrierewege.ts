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
          'Industriemeister:in Metall — die IHK-Weiterbildung über dem Facharbeiterbrief. Du führst eine Schicht oder eine Fertigung, planst Aufträge und Personal und darfst selbst ausbilden.',
      },
      {
        frage: 'Wie lange',
        antwort:
          'In Vollzeit rund ein halbes Jahr, neben dem Beruf meist zwei bis zweieinhalb Jahre — viele machen es abends und samstags neben der Schicht.',
      },
      {
        frage: 'Was es kostet',
        antwort:
          'Lehrgang und Prüfung zusammen meist zwischen rund 6.000 und 9.000 Euro. Das Aufstiegs-BAföG — ein staatlicher Zuschuss für Weiterbildungen wie diese — übernimmt davon den größten Teil; wer besteht, zahlt am Ende etwa ein Viertel selbst.',
      },
      {
        frage: 'Was du verdienst',
        antwort:
          'Je nach Betrieb und Schichtmodell meist zwischen rund 50.000 und 65.000 Euro im Jahr — die Metall- und Elektroindustrie gehört zu den am besten bezahlten Branchen.',
      },
    ],
    aufhaenger:
      'Vielleicht wusstest du nicht, dass du mit dem Industriemeister an jeder Hochschule in NRW studieren darfst.',
  },
  {
    id: 'Z8.2',
    titel: 'Techniker',
    koeder: 'Fertigung planen statt rüsten.',
    abschnitte: [
      {
        frage: 'Was ist das',
        antwort:
          'Staatlich geprüfte:r Techniker:in Maschinenbautechnik. Du legst fest, wie ein Teil gefertigt wird: Werkzeuge, Spannmittel, Programme, Taktzeiten — die Arbeit vor der Maschine wird zur Arbeit am Plan.',
      },
      {
        frage: 'Wie lange',
        antwort: 'Zwei Jahre Fachschule in Vollzeit, drei bis vier neben dem Beruf.',
      },
      {
        frage: 'Was es kostet',
        antwort:
          'An den öffentlichen Fachschulen in NRW kostet der Unterricht nichts — nur Gebühren und Material.',
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
    id: 'Z8.3',
    titel: 'Studium',
    koeder: 'Ja, das geht — auch ohne Abitur.',
    abschnitte: [
      {
        frage: 'Warum erst eine Ausbildung?',
        antwort:
          'Weil sie den Weg nicht zumacht, sondern aufmacht. In Nordrhein-Westfalen berechtigen Industriemeister- und Technikerabschluss zur Einschreibung in jeden Studiengang an jeder Hochschule des Landes — ohne Abitur, ohne Aufnahmeprüfung.',
      },
      {
        frage: 'Und ohne Meister?',
        antwort:
          'Mit bestandener Abschlussprüfung und drei Jahren im Beruf darfst du fachgebunden studieren — alles, was zu deiner Ausbildung passt. Auch dafür braucht es keine Zugangsprüfung.',
      },
      {
        frage: 'Was dann',
        antwort:
          'Maschinenbau — und das direkt vor der Haustür: die Universität Paderborn bildet Maschinenbauer:innen aus. Wer heute Teile fertigt, rechnet dann aus, wie die Maschinen von morgen aussehen.',
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
  'Vielleicht hat dich heute etwas überrascht — ein Hundertstel zum Beispiel.'
