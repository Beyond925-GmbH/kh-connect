import type { MerkmalGewichte } from './merkmale'

/**
 * S2 — vier Fragen, jede überspringbar.
 *
 * **Warum vier und nicht acht.** Zwischen „Tippen zum Starten“ und dem ersten
 * Inhalt liegen mit dem Trichter drei Screens. Das Budget dafür sind 45
 * Sekunden; jede Frage kostet davon rund fünf. Was eine fünfte Frage
 * zusätzlich träfe, trifft auch die Berufsliste, auf der ohnehin jeder Beruf
 * offen liegt.
 *
 * **Die dritte Frage ist die wichtige.** Zimmerer und Dachdecker sind im
 * Merkmalsraum fast deckungsgleich — beide draußen, beide hoch oben, beide auf
 * demselben Dach. Ohne eine Frage, die ausdrücklich zwischen *Tragwerk* und
 * *Hülle* trennt, entscheidet zwischen ihnen das Rauschen der anderen
 * Antworten. Deshalb fragt sie nach dem Ergebnis, nicht nach dem Material:
 * „was hält“ gegen „was dicht ist“ ist eine Wahl, die auch jemand treffen
 * kann, der beide Berufe nicht kennt.
 *
 * Antworten dürfen negativ gewichten. „Lieber Boden unter den Füßen“ ist kein
 * fehlendes Ja zu Höhe, sondern ein Nein — und ohne das landet jeder
 * Höhenängstliche trotzdem auf dem Dach, weil ihn nichts davon wegzieht.
 */

export interface Antwortmoeglichkeit {
  id: string
  text: string
  gewichte: MerkmalGewichte
}

export interface Frage {
  id: string
  /** Steht als Plakatzeile auf dem Screen. Kurz halten — Anton ist groß. */
  frage: string
  antworten: readonly Antwortmoeglichkeit[]
}

export const FRAGEN: readonly Frage[] = [
  {
    id: 'ort',
    frage: 'Wo willst du morgens hin?',
    antworten: [
      {
        id: 'draussen',
        text: 'Raus. Baustelle, frische Luft.',
        gewichte: { draussen: 1, hoehe: 0.3 },
      },
      {
        id: 'halle',
        text: 'In die Halle, an die Maschine.',
        gewichte: { technik: 0.7, praezision: 0.5 },
      },
      {
        id: 'beides',
        text: 'Mal so, mal so.',
        gewichte: { draussen: 0.4, technik: 0.3 },
      },
    ],
  },
  {
    id: 'hoehe',
    frage: 'Zehn Meter über dem Boden, auf einem Balken. Und?',
    antworten: [
      {
        id: 'her-damit',
        text: 'Beste Aussicht der Stadt.',
        gewichte: { hoehe: 1, draussen: 0.5 },
      },
      {
        id: 'gesichert',
        text: 'Mit Sicherung geht das klar.',
        gewichte: { hoehe: 0.4, team: 0.3 },
      },
      {
        id: 'lieber-nicht',
        text: 'Lieber Boden unter den Füßen.',
        gewichte: { hoehe: -1, praezision: 0.3 },
      },
    ],
  },
  {
    id: 'dach',
    frage: 'Ein Dach besteht aus zwei Dingen. Was reizt dich mehr?',
    antworten: [
      {
        id: 'tragwerk',
        text: 'Das Tragwerk, das alles hält.',
        gewichte: { anpacken: 1, praezision: 0.4, hoehe: 0.3 },
      },
      {
        id: 'huelle',
        text: 'Die Hülle, die dicht hält.',
        gewichte: { draussen: 0.9, anpacken: 0.6, hoehe: 0.4 },
      },
      {
        id: 'technik',
        text: 'Ehrlich gesagt: die Technik darin.',
        gewichte: { technik: 1, sinn: 0.5 },
      },
    ],
  },
  {
    id: 'ergebnis',
    frage: 'Was soll am Ende dastehen?',
    antworten: [
      {
        id: 'gross',
        text: 'Etwas Großes, das man von der Straße sieht.',
        gewichte: { anpacken: 0.8, team: 0.6, draussen: 0.3 },
      },
      {
        id: 'genau',
        text: 'Ein Teil, das auf den Hundertstel passt.',
        gewichte: { praezision: 1, technik: 0.6 },
      },
      {
        id: 'sinnvoll',
        text: 'Ein Haus, das keine Energie mehr verschwendet.',
        gewichte: { sinn: 1, technik: 0.5 },
      },
    ],
  },
]

export function frage(id: string): Frage | null {
  return FRAGEN.find((f) => f.id === id) ?? null
}
