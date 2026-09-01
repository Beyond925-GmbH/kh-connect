import type { StepId } from '@/khpl/flow/steps'

/**
 * Die drei Karrierewege.
 *
 * **Die Meister-Karte trägt seit dem 25.08.2026 Dachdecker-Zahlen.** Vorher
 * standen dort die Werte des Zimmererhandwerks unter einer
 * Dachdecker-Überschrift; sie sind einzeln als falsch nachgewiesen, und die
 * drei neuen Tage führen längst ihren eigenen Spaltensatz. Ersetzt
 * wurden: „1.120 Stunden, in Vollzeit etwa ein Jahr“ → rund 1.530 Stunden,
 * August bis Mai; „8.000 bis 10.000 Euro“ → rund 13.500 Euro; „rund 45.000 Euro
 * im Jahr“ → rund 54.000 Euro.
 *
 * **Diese Zahlen sind eigens für den Dachdecker recherchiert**, Stand
 * 24.08.2026. Die Quelle steht je Abschnitt im Kommentar:
 *
 * | Aussage | Quelle |
 * | --- | --- |
 * | Lehrgang 12.000 € + Prüfung 1.550 € ≈ 13.500 €, ca. 1.530 h, Aug–Mai | Lorenz-Burmann-Schule Eslohe, HWK Südwestfalen, Kursjahr 2026/27 |
 * | Aufstiegs-BAföG → höchstens rund ein Viertel Eigenanteil | AFBG, Sätze seit 8/2024 |
 * | NRW-Meisterprämie 2.500 € | Land NRW — gilt hier, weil Handwerk |
 * | Meister Ø rund 54.000 €/Jahr | Stepstone 10/2025: 4.541 €/Monat — Portaldaten |
 * | Studium ohne Abitur nach BBHZVO, TH OWL Detmold | BBHZVO — Detmold/Holzbau passt für dieses Gewerk |
 *
 * Es bleibt eine Formulierungsregel: was aus Gehalts- und Handwerkerportalen
 * stammt, erscheint **nur als Spanne oder mit „rund“**, nie als exakter Wert
 * und nie als Versprechen. Die Texte unten halten das ein — beim Ändern
 * mitdenken. Was sich nicht belegen ließ, steht nicht da: der Bestandssatz
 * „mit Erfahrung deutlich mehr“ ist ersatzlos entfallen, für das
 * Dachdeckerhandwerk gibt es dazu keinen belastbaren Wert.
 *
 * Die Meistergründungsprämie NRW (seit 1.1.2025 11.500 €, im Einzelfall bis
 * 16.000 € — nicht „bis 15.000“, das war die Deckelung des Aufstiegs-BAföG)
 * ist bewusst **nicht** aufgenommen: ob eine Gründungsprämie an einem
 * Schüler:innen-Stand die richtige Botschaft ist, ist offen. Für begleitende
 * Eltern
 * wäre sie eine — das entscheidet die Kreishandwerkerschaft, nicht der Code.
 *
 * B9.2 nannte als Technikerfachrichtung „Holztechnik oder Bautechnik“ und
 * B9.3 das Biberacher Modell — die Recherche weist beides dem Zimmerer zu.
 * Aufgelöst nach der Regel „streichen statt weichzeichnen“: Holztechnik
 * entfällt (für Dachdecker kommt allenfalls Bautechnik in Frage), das
 * Biberacher Modell entfällt ersatzlos (ein reines Zimmerer-Modell; einen
 * belegten Dachdecker-Ersatz gibt es nicht). Der Detmold-Anker in B9.3 ist
 * für Dachdecker ausdrücklich belegt und bleibt.
 */

export interface Karriereweg {
  id: StepId
  /** Kartentitel in M9 und Überschrift des Info-Screens. */
  titel: string
  /** Der eine Satz auf der Karte in M9. */
  koeder: string
  abschnitte: { frage: string; antwort: string }[]
  /** Der personalisierte Aufhänger in M10. */
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
        // Der Titel heißt im Dachdeckerhandwerk „Dachdeckermeister/in“.
        antwort:
          'Der Meisterbrief im Dachdeckerhandwerk. Damit darfst du einen eigenen Betrieb führen und selbst ausbilden.',
      },
      {
        frage: 'Wie lange',
        // Vollzeit ca. 8 Monate von August bis Mai, ca. 1.530 h
        // (Lorenz-Burmann-Schule Eslohe); berufsbegleitend 2–3 Jahre. Die
        // Stundenzahl gilt für diesen Anbieter.
        antwort:
          'Rund 1.530 Stunden Unterricht — mehr, als du in einem Schuljahr in der Schule sitzt. In Vollzeit dauert das von August bis Mai, neben dem Beruf zwei bis drei Jahre.',
      },
      {
        frage: 'Was es kostet',
        // 12.000 € Lehrgang (Eslohe) + 1.550 € Prüfungsgebühr (HWK
        // Südwestfalen, alle vier Teile) ≈ 13.500 €, zzgl. Teil III/IV.
        // Die Preise gelten für diesen Anbieter. Aufstiegs-BAföG: 50 %
        // Zuschuss auf Lehrgangs- und Prüfungskosten, dazu 50 %
        // Darlehenserlass bei bestandener Prüfung → höchstens rund ein
        // Viertel Eigenanteil. Der Körper-Anker: ein Viertel ≈ 3.400 €,
        // Azubi-Vergütung 3. Lehrjahr Dachdecker 1.400 €/Monat → knapp
        // zweieinhalb Monatslöhne. Die Details (Name Aufstiegs-BAföG,
        // NRW-Meisterprämie 2.500 €) sind im Review aus dem Screentext
        // gekürzt worden; sie bleiben hier dokumentiert, falls ein
        // Eltern-Handout sie braucht.
        antwort:
          'Rund 13.500 Euro für Kurs und Prüfung. Der Staat zahlt den größten Teil dazu. Wer besteht, zahlt am Ende etwa ein Viertel selbst — das sind knapp zweieinhalb Monatslöhne eines Azubis.',
      },
      {
        frage: 'Was du verdienst',
        // Ø ca. 4.500 €/Monat (Stepstone 10/2025: 4.541 €) → rund 54.000 €/Jahr
        // Portaldaten, deshalb nur mit „rund“ und ohne Zusatz nach oben:
        // eine belastbare Erfahrungsspanne gibt es für dieses Gewerk nicht.
        // Der Körper-Anker: 4.500 €/Monat gegen 1.400 € Azubi-Vergütung im
        // 3. Lehrjahr ≈ Faktor 3,2 — „etwa dreimal“ hält auch nach der
        // Tariferhöhung 10/2026 (1.460 €, Faktor 3,1).
        antwort:
          'Als Dachdeckermeister:in im Schnitt rund 54.000 Euro im Jahr — etwa dreimal so viel wie ein Azubi im dritten Lehrjahr.',
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
          'Ein zweiter Abschluss nach der Ausbildung: staatlich geprüfte:r Techniker:in für Bautechnik. Du planst, rechnest und leitest, statt selbst auf dem Dach zu stehen.',
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
          'Weil sie den Weg nicht zumacht, sondern aufmacht. Mit dem Meisterbrief darfst du in Nordrhein-Westfalen jedes Fach an jeder Hochschule studieren. Als Techniker:in genauso. Ohne Abitur, ohne Aufnahmeprüfung.',
      },
      {
        frage: 'Und das geht hier',
        antwort:
          'Die Hochschule TH OWL bildet in Detmold Bauingenieure aus, mit einem eigenen Schwerpunkt Holzbau. Bachelor, dreieinhalb Jahre, 30 Kilometer von hier.',
      },
    ],
    aufhaenger:
      'Vielleicht wusstest du nicht, dass du als Handwerker:in studieren kannst — ohne Abitur, 30 Kilometer von hier.',
  },
]

export function karriereweg(id: StepId): Karriereweg | undefined {
  return KARRIEREWEGE.find((k) => k.id === id)
}

/** Fällt zurück, wenn in M9 nichts angesehen wurde. */
export const AUFHAENGER_OHNE =
  'Vielleicht war heute etwas dabei, das du nicht erwartet hast.'
