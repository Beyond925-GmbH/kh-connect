import type { MerkmalGewichte } from './merkmale'

/**
 * Vier Stationen, jede überspringbar. Keine davon ist ein Formular.
 *
 * **Warum vier und nicht acht.** Zwischen „Tippen zum Starten“ und dem ersten
 * Inhalt liegen mit dem Trichter drei Screens. Das Budget dafür sind 45
 * Sekunden; jede Station kostet davon rund fünf. Was eine fünfte zusätzlich
 * träfe, trifft auch die Berufsliste, auf der ohnehin jeder Beruf offen liegt.
 *
 * **Bild schlägt Satz.** Die erste Fassung stellte vier Textfragen auf
 * schwarzem Grund — vor einem Publikum, das täglich TikTok bedient, sind vier
 * Textscreens hintereinander ein Formular. Jetzt trägt jede Station ein
 * Motiv oder ein Gerät, und der Text ist die Bildunterschrift:
 *
 *   `bilder` — drei Motive, eines antippen. Die Antwort **ist** das Bild.
 *   `hoehe`  — der eigene Helm wird am Gerüst nach oben gezogen; die Zone,
 *              in der er landet, ist die Antwort.
 *   `radio`  — ein Senderregler; der eingestellte Sender ist die Antwort.
 *
 * Die Gewichte sind unverändert gegenüber der Textfassung — die Interaktion
 * ist neu, die Messung nicht.
 *
 * **Die dritte Station ist die wichtige.** Zimmerer und Dachdecker sind im
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

export type FrageArt = 'bilder' | 'hoehe' | 'radio'

/**
 * Das Klangmuster eines Senders — `radioklang.ts` synthetisiert daraus eine
 * leise Loop per Web Audio. Eigene Dateien gibt es bewusst nicht: der Bestand
 * hat keine einzige Tonspur, Stock-Musik hätte Lizenzfragen, und der Kiosk
 * muss offline laufen.
 */
export type RadioStil = 'hiphop' | 'pop' | 'techno' | 'rock' | 'schlager'

export interface Sender {
  /** Sendername, versal gesetzt — Anton verträgt keine Kleinbuchstaben. */
  name: string
  /** Frequenz in MHz. Anzeige mit Komma, Position auf dem Band daraus. */
  mhz: number
  /**
   * Das Bühnenlicht des Senders: färbt Lichtstimmung über dem Motiv, Pegel,
   * Anzeige und Sendermarke. Auf dem warmen Schwarz gewählt, mit Abstand zu
   * Marken-Orange und Signal-Gelbgrün.
   */
  farbe: string
  /** Schläge pro Minute — Takt der Loop **und** des Pegels. */
  bpm: number
  stil: RadioStil
}

export interface Antwortmoeglichkeit {
  id: string
  text: string
  gewichte: MerkmalGewichte
  /** Motiv bei `bilder` (Wahlfläche) und `radio` (Bühne hinter dem Gerät). */
  bild?: string
  /** Bildmittelpunkt als `object-position`, wo die Mitte nicht trägt. */
  fokus?: string
  /** Nur bei `radio`: der Sender, der diese Antwort spielt. */
  sender?: Sender
}

export interface Frage {
  id: string
  art: FrageArt
  /** Steht als Plakatzeile auf dem Screen. Kurz halten — Anton ist groß. */
  frage: string
  /** Die Handlungsanweisung über der Plakatzeile — was man hier tut. */
  etikett: string
  /**
   * Bei `hoehe`: von **oben nach unten** sortiert — die erste Antwort ist der
   * First, die letzte der Boden. `Hoehenwahl` teilt die Strecke danach auf.
   */
  antworten: readonly Antwortmoeglichkeit[]
  /** Nur bei `hoehe`: das Motiv hinter dem Gerüst. */
  buehne?: string
}

export const FRAGEN: readonly Frage[] = [
  {
    /**
     * Die persönliche Station — als **Auftakt**, direkt nach dem Helm. Sie
     * trägt **keine Gewichte**: Musikgeschmack sagt nichts darüber, ob jemand
     * aufs Dach gehört, und ein erfundenes Signal wäre genau die Astrologie,
     * die das Matching sonst vermeidet (vgl. Helmfarbe in `helm.ts`: reiner
     * Ausdruck). Ihre Aufgabe: die erste Frage der App ist eine, auf die
     * jeder Fünfzehnjährige sofort eine Antwort hat — und sie bringt den
     * Griff bei, den die Höhenstation am Ende wiederholt. Die Sachlage
     * messen die drei Stationen danach.
     *
     * Fünf Sender statt drei: drei Richtungen waren ein Geschmackstest mit
     * Durchfallquote. Pop und Schlager sind keine Verlegenheit, sondern die
     * Hälfte jedes Baustellenradios.
     *
     * Frequenzen mit ≥ 4,2 MHz Abstand — die Fangzone beim Loslassen
     * (`Radio.tsx`, `FANG_MHZ`) darf sich nicht überlappen, sonst gehören
     * Bandstücke zwei Sendern.
     */
    id: 'musik',
    art: 'radio',
    frage: 'Was läuft bei dir?',
    etikett: 'Baustellenradio',
    // Zwei Lachende an der Werkbank: das persönlichste Motiv des Bestands
    // für die persönlichste Station.
    buehne: '/medien/media/zimmerer/hero-poster.webp',
    antworten: [
      {
        id: 'hiphop',
        text: 'Bass, bis die Halle wackelt.',
        gewichte: {},
        sender: { name: 'Hip-Hop', mhz: 89.0, farbe: '#A78BFA', bpm: 88, stil: 'hiphop' },
      },
      {
        id: 'pop',
        text: 'Die Charts, zum Mitsingen.',
        gewichte: {},
        sender: { name: 'Pop', mhz: 93.2, farbe: '#F472B6', bpm: 116, stil: 'pop' },
      },
      {
        id: 'techno',
        text: 'Vier Viertel, volle Drehzahl.',
        gewichte: {},
        sender: { name: 'Techno', mhz: 97.6, farbe: '#22D3EE', bpm: 132, stil: 'techno' },
      },
      {
        id: 'rock',
        text: 'Gitarren, laut und ehrlich.',
        gewichte: {},
        sender: { name: 'Rock', mhz: 101.8, farbe: '#F87171', bpm: 122, stil: 'rock' },
      },
      {
        id: 'schlager',
        text: 'Après-Ski auf dem Gerüst.',
        gewichte: {},
        sender: {
          name: 'Schlager',
          mhz: 106.0,
          farbe: '#FBBF24',
          bpm: 126,
          stil: 'schlager',
        },
      },
    ],
  },
  {
    id: 'ort',
    art: 'bilder',
    frage: 'Wo willst du morgens hin?',
    etikett: 'Tipp dein Bild an',
    antworten: [
      {
        id: 'draussen',
        text: 'Raus. Baustelle, frische Luft.',
        gewichte: { draussen: 1, hoehe: 0.3 },
        bild: '/medien/media/zimmerer/card.webp',
        fokus: '30% 45%',
      },
      {
        id: 'halle',
        text: 'In die Halle, an die Maschine.',
        gewichte: { technik: 0.7, praezision: 0.5 },
        bild: '/medien/media/zerspanungsmechaniker/gallery-3.webp',
        fokus: '35% 50%',
      },
      {
        id: 'beides',
        text: 'Mal so, mal so — auch beim Kunden.',
        gewichte: { draussen: 0.4, technik: 0.3 },
        bild: '/medien/schritte/m1-ortstermin.webp',
      },
    ],
  },
  {
    id: 'dach',
    art: 'bilder',
    frage: 'Ein Dach. Was reizt dich mehr?',
    etikett: 'Tipp dein Bild an',
    antworten: [
      {
        id: 'tragwerk',
        text: 'Das Tragwerk, das alles hält.',
        gewichte: { anpacken: 1, praezision: 0.4, hoehe: 0.3 },
        bild: '/medien/schritte/m9-karriere.webp',
      },
      {
        id: 'huelle',
        text: 'Die Hülle, die dicht hält.',
        gewichte: { draussen: 0.9, anpacken: 0.6, hoehe: 0.4 },
        bild: '/medien/schritte/m8-feierabend.webp',
        fokus: '50% 62%',
      },
      {
        id: 'technik',
        text: 'Ehrlich gesagt: die Technik darin.',
        gewichte: { technik: 1, sinn: 0.5 },
        bild: '/medien/media/anlagenmechaniker/card.webp',
        fokus: '65% 40%',
      },
    ],
  },
  {
    id: 'hoehe',
    art: 'hoehe',
    frage: 'Wie weit oben fühlst du dich wohl?',
    etikett: 'Zieh deinen Helm hoch',
    // Der Dachstuhl von unten, jemand läuft über die Balken — nicht
    // `gallery-2`/`m9-karriere`: das wäre dasselbe Motiv wie die
    // Tragwerk-Kachel der Station davor.
    buehne: '/medien/media/zimmerer/szenario-poster.webp',
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
]

export function frage(id: string): Frage | null {
  return FRAGEN.find((f) => f.id === id) ?? null
}

/**
 * Alle Motive des Trichters, zum Vorwärmen auf der Helmwahl: die erste
 * Bildfrage darf nicht mit drei nachladenden Kacheln aufmachen.
 */
export const FRAGEN_BILDER: readonly string[] = FRAGEN.flatMap((f) => [
  ...(f.buehne ? [f.buehne] : []),
  ...f.antworten.flatMap((a) => (a.bild ? [a.bild] : [])),
])
