import type { StepId } from '@/khpl/flow/steps'

/**
 * Die drei Karrierewege (khpl-flow.md 7 B9.1–B9.3 und 11).
 *
 * **Die Meister-Karte trägt seit dem 25.08.2026 Dachdecker-Zahlen.** Vorher
 * standen dort die Werte des Zimmererhandwerks unter einer
 * Dachdecker-Überschrift — khpl-tage.md 0c weist sie einzeln als falsch nach,
 * und die drei neuen Tage führen längst ihren eigenen Spaltensatz. Ersetzt
 * wurden: „1.120 Stunden, in Vollzeit etwa ein Jahr“ → rund 1.530 Stunden,
 * August bis Mai; „8.000 bis 10.000 Euro“ → rund 13.500 Euro; „rund 45.000 Euro
 * im Jahr“ → rund 54.000 Euro.
 *
 * **Diese Zahlen stammen aus `belege/ausbildung-karriere.md`, Spalte
 * Dachdecker**, recherchiert am 24.08.2026. Verdikt und Quelle stehen je
 * Abschnitt im Kommentar:
 *
 * | Aussage | Verdikt |
 * | --- | --- |
 * | Lehrgang 12.000 € + Prüfung 1.550 € ≈ 13.500 €, ca. 1.530 h, Aug–Mai | `BELEGT` (Lorenz-Burmann-Schule Eslohe, HWK Südwestfalen, Kursjahr 2026/27) |
 * | Aufstiegs-BAföG → höchstens rund ein Viertel Eigenanteil | `BELEGT` (AFBG, Sätze seit 8/2024) |
 * | NRW-Meisterprämie 2.500 € | `BELEGT` — gilt hier, weil Handwerk |
 * | Meister Ø rund 54.000 €/Jahr | `TEILWEISE BELEGT` (Stepstone 10/2025: 4.541 €/Monat) |
 * | Studium ohne Abitur nach BBHZVO, TH OWL Detmold | `BELEGT` — Detmold/Holzbau passt für dieses Gewerk |
 *
 * Es bleibt eine Formulierungsregel, die auch nach einer Freigabe gilt: was aus
 * Gehalts- und Handwerkerportalen stammt, erscheint **nur als Spanne oder mit
 * „rund“**, nie als exakter Wert und nie als Versprechen. Die Texte unten
 * halten das ein — beim Ändern mitdenken. Was `NICHT BELEGBAR` war, steht nicht
 * da: der Bestandssatz „mit Erfahrung deutlich mehr“ ist ersatzlos entfallen,
 * für das Dachdeckerhandwerk gibt es dazu keinen Wert im Beleg.
 *
 * Die Meistergründungsprämie NRW (seit 1.1.2025 11.500 €, im Einzelfall bis
 * 16.000 € — nicht „bis 15.000“, das war die Deckelung des Aufstiegs-BAföG)
 * ist bewusst **nicht** aufgenommen: flow 7 stellt selbst die Frage, ob das an
 * einem Schüler:innen-Stand die richtige Botschaft ist. Für begleitende Eltern
 * wäre sie eine — das entscheidet die Kreishandwerkerschaft, nicht der Code.
 *
 * B9.2 nannte als Technikerfachrichtung „Holztechnik oder Bautechnik“ und
 * B9.3 das Biberacher Modell — der Beleg (6 und 7) weist beides dem Zimmerer
 * zu. Aufgelöst nach der Regel „streichen statt weichzeichnen“: Holztechnik
 * entfällt (für Dachdecker steht im Beleg allenfalls Bautechnik), das
 * Biberacher Modell entfällt ersatzlos (ein reines Zimmerer-Modell; einen
 * belegten Dachdecker-Ersatz gibt es nicht). Der Detmold-Anker in B9.3 ist
 * für Dachdecker ausdrücklich belegt (Beleg 7) und bleibt.
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
        // Der Titel heißt im Dachdeckerhandwerk „Dachdeckermeister/in“
        // (belege 5, Spalte Dachdecker). `BELEGT`.
        antwort:
          'Der Meisterbrief im Dachdeckerhandwerk. Damit darfst du einen eigenen Betrieb führen und selbst ausbilden.',
      },
      {
        frage: 'Wie lange',
        // Vollzeit ca. 8 Monate von August bis Mai, ca. 1.530 h
        // (Lorenz-Burmann-Schule Eslohe); berufsbegleitend 2–3 Jahre
        // (belege 5, Spalte Dachdecker). `BELEGT` für diesen Anbieter.
        antwort:
          'Teil I und II sind rund 1.530 Stunden — in Vollzeit von August bis Mai, neben dem Beruf zwei bis drei Jahre.',
      },
      {
        frage: 'Was es kostet',
        // 12.000 € Lehrgang (Eslohe) + 1.550 € Prüfungsgebühr (HWK
        // Südwestfalen, alle vier Teile) ≈ 13.500 €, zzgl. Teil III/IV.
        // `BELEGT` für diesen Anbieter. Aufstiegs-BAföG: 50 % Zuschuss auf
        // Lehrgangs- und Prüfungskosten, dazu 50 % Darlehenserlass bei
        // bestandener Prüfung → höchstens rund ein Viertel Eigenanteil.
        // NRW-Meisterprämie 2.500 € nach bestandener Handwerks-Meisterprüfung —
        // gilt hier, weil Dachdecker ein Handwerksberuf ist. Beides `BELEGT`.
        antwort:
          'Rund 13.500 Euro für Lehrgang und Prüfung. Das Aufstiegs-BAföG übernimmt davon den größten Teil — wer besteht, zahlt am Ende etwa ein Viertel selbst. Nordrhein-Westfalen legt noch 2.500 Euro Meisterprämie drauf.',
      },
      {
        frage: 'Was du verdienst',
        // Ø ca. 4.500 €/Monat (Stepstone 10/2025: 4.541 €) → rund 54.000 €/Jahr
        // (belege 5 und khpl-tage.md 0c, Spalte Dachdecker).
        // `TEILWEISE BELEGT` — Portaldaten, deshalb nur mit „rund“ und ohne
        // Zusatz nach oben: eine Erfahrungsspanne steht für dieses Gewerk in
        // keinem Beleg.
        antwort: 'Als Dachdeckermeister:in im Schnitt rund 54.000 Euro im Jahr.',
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
          'Staatlich geprüfte:r Techniker:in, Fachrichtung Bautechnik. Du planst, rechnest und leitest, statt selbst auf dem Dach zu stehen.',
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
    ],
    aufhaenger:
      'Vielleicht wusstest du nicht, dass du als Handwerker:in studieren kannst — ohne Abitur, 30 Kilometer von hier.',
  },
]

export function karriereweg(id: StepId): Karriereweg | undefined {
  return KARRIEREWEGE.find((k) => k.id === id)
}

/** Fällt zurück, wenn in M9 nichts angesehen wurde (flow 11, M10). */
export const AUFHAENGER_OHNE =
  'Vielleicht war heute etwas dabei, das du nicht erwartet hast.'
