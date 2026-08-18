import type { StepId } from '@/khpl/flow/steps'

/**
 * Die drei Karrierewege (khpl-flow.md 7 B9.1–B9.3 und 11).
 *
 * **Alle Zahlen `FREIGEGEBEN`** (recherchiert und am 18.08.2026 von der
 * Kreishandwerkerschaft freigegeben, Quellen in flow 10). Es bleibt eine
 * Formulierungsregel, die auch nach der Freigabe gilt: was aus Gehalts- und
 * Handwerkerportalen stammt, erscheint **nur als Spanne oder mit „rund“**, nie
 * als exakter Wert und nie als Versprechen. Die Texte unten halten das ein —
 * beim Ändern mitdenken.
 *
 * Die Meistergründungsprämie NRW (seit 2025 11.500 €, gestaffelt bis 15.000 €)
 * ist bewusst **nicht** aufgenommen: flow 7 stellt selbst die Frage, ob das an
 * einem Schüler:innen-Stand die richtige Botschaft ist. Für begleitende Eltern
 * wäre sie eine — das entscheidet die Kreishandwerkerschaft, nicht der Code.
 */

export interface Karriereweg {
  id: StepId
  /** Kartentitel in M9 und Überschrift des Info-Screens. */
  titel: string
  /** Der eine Satz auf der Karte in M9. */
  koeder: string
  abschnitte: { frage: string; antwort: string }[]
  /** Der personalisierte Aufhänger in M10 (flow 11, M10). */
  aufhaenger: string
}

export const KARRIEREWEGE: Karriereweg[] = [
  {
    id: 'B9.1',
    titel: 'Meister',
    koeder: 'Eigener Betrieb, eigene Azubis.',
    abschnitte: [
      {
        frage: 'Was ist das',
        antwort:
          'Der Meisterbrief. Damit darfst du einen eigenen Betrieb führen und selbst ausbilden.',
      },
      {
        frage: 'Wie lange',
        antwort:
          'Teil I und II sind rund 1.120 Stunden — in Vollzeit etwa ein Jahr, neben dem Beruf zwei bis drei.',
      },
      {
        frage: 'Was es kostet',
        antwort:
          'Rund 8.000 bis 10.000 Euro für Lehrgang und Prüfung. Aufstiegs-BAföG übernimmt einen großen Teil davon.',
      },
      {
        frage: 'Was du verdienst',
        antwort:
          'Als Zimmerermeister:in im Schnitt rund 45.000 Euro im Jahr, mit Erfahrung deutlich mehr.',
      },
    ],
    aufhaenger:
      'Vielleicht wusstest du nicht, dass du mit dem Meisterbrief an jeder Hochschule in NRW studieren darfst.',
  },
  {
    id: 'B9.2',
    titel: 'Techniker',
    koeder: 'Planen und rechnen statt aufs Dach.',
    abschnitte: [
      {
        frage: 'Was ist das',
        antwort:
          'Staatlich geprüfte:r Techniker:in, Fachrichtung Holztechnik oder Bautechnik. Du planst, rechnest und leitest, statt selbst auf dem Dach zu stehen.',
      },
      {
        frage: 'Wie lange',
        antwort: 'Zwei Jahre Fachschule in Vollzeit, drei bis vier neben dem Beruf.',
      },
      {
        frage: 'Der Punkt, den kaum jemand kennt',
        antwort:
          'Der Abschluss steht offiziell auf derselben Stufe wie ein Bachelor. Der Titel heißt sogar so: Bachelor Professional in Technik.',
      },
      {
        frage: 'Was du verdienst',
        antwort: 'Einstieg rund 3.200 Euro im Monat, mit Erfahrung bis etwa 5.200.',
      },
    ],
    aufhaenger:
      'Vielleicht wusstest du nicht, dass der Techniker offiziell auf Bachelor-Niveau steht.',
  },
  {
    id: 'B9.3',
    titel: 'Studium',
    koeder: 'Ja, das geht — auch ohne Abitur.',
    abschnitte: [
      {
        frage: 'Warum erst eine Ausbildung?',
        antwort:
          'Weil sie den Weg nicht zumacht, sondern aufmacht. In Nordrhein-Westfalen berechtigt der Meisterbrief — und auch der Techniker — zur Einschreibung in jeden Studiengang an jeder Hochschule des Landes. Ohne Abitur, ohne Aufnahmeprüfung.',
      },
      {
        frage: 'Und das geht hier',
        antwort:
          'Die TH OWL hat ihren Fachbereich Bauingenieurwesen in Detmold, mit einem eigenen Fachgebiet Holzbau. Bachelor, sieben Semester, 30 Kilometer von hier.',
      },
      {
        frage: 'Beides gleichzeitig',
        antwort:
          'Es gibt Modelle, die Ausbildung, Meister und Ingenieurstudium zusammenlegen — in Biberach dauert das Ganze gut fünf Jahre. Am Ende hast du den Gesellenbrief, den Meister und den Bachelor.',
      },
    ],
    aufhaenger:
      'Vielleicht wusstest du nicht, dass du als Zimmerer studieren kannst — ohne Abitur, 30 Kilometer von hier.',
  },
]

export function karriereweg(id: StepId): Karriereweg | undefined {
  return KARRIEREWEGE.find((k) => k.id === id)
}

/** Fällt zurück, wenn in M9 nichts angesehen wurde (flow 11, M10). */
export const AUFHAENGER_OHNE =
  'Vielleicht war heute etwas dabei, das du nicht erwartet hast.'
