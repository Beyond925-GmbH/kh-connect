import type { MerkmalGewichte } from './merkmale'
import { FRAGEN_GEWICHT, type Signal } from './matching'

export type RadioStil = 'hiphop' | 'pop' | 'techno' | 'rock' | 'schlager'

export interface Sender {
  name: string
  mhz: number
  farbe: string
  bpm: number
  stil: RadioStil
}

/** Musik ist eine freiwillige Sitzungsoption und kein Matching-Signal. */
export const RADIO_SENDER: readonly Sender[] = [
  { name: 'Hip-Hop', mhz: 89, farbe: '#A78BFA', bpm: 88, stil: 'hiphop' },
  { name: 'Pop', mhz: 93.2, farbe: '#F472B6', bpm: 116, stil: 'pop' },
  { name: 'Techno', mhz: 97.6, farbe: '#22D3EE', bpm: 132, stil: 'techno' },
  { name: 'Rock', mhz: 101.8, farbe: '#F87171', bpm: 122, stil: 'rock' },
  { name: 'Schlager', mhz: 106, farbe: '#FBBF24', bpm: 126, stil: 'schlager' },
]

const RADIO_TEXTE: Record<RadioStil, string> = {
  hiphop: 'Bass, bis die Halle wackelt.',
  pop: 'Die Charts, zum Mitsingen.',
  techno: 'Vier Viertel, volle Drehzahl.',
  rock: 'Gitarren, laut und ehrlich.',
  schlager: 'Après-Ski auf dem Gerüst.',
}

export interface Antwortmoeglichkeit {
  id: string
  text: string
  gewichte: MerkmalGewichte
  bild?: string
  fokus?: string
  neutral?: boolean
  sender?: Sender
}

export interface Frage {
  id: string
  art: 'bilder' | 'hoehe' | 'radio'
  frage: string
  etikett: string
  antworten: readonly Antwortmoeglichkeit[]
  buehne?: string
}

/** Persönliches Radio, danach zwei erste Eindrücke. Unsicherheit bleibt neutral. */
export const FRAGEN: readonly Frage[] = [
  {
    id: 'musik',
    art: 'radio',
    frage: 'Was läuft bei dir?',
    etikett: 'Baustellenradio',
    buehne: '/medien/media/zimmerer/hero-poster.webp',
    antworten: [
      ...RADIO_SENDER.map((sender) => ({
        id: sender.stil,
        text: RADIO_TEXTE[sender.stil],
        gewichte: {},
        neutral: true,
        sender,
      })),
      { id: 'offen', text: 'Überspringen', gewichte: {}, neutral: true },
    ],
  },
  {
    id: 'umgebung',
    art: 'bilder',
    frage: 'Wo wärst du gern?',
    etikett: 'Wähle dein Bild',
    antworten: [
      {
        id: 'draussen',
        text: 'Draußen auf der Baustelle',
        gewichte: { draussen: 1, anpacken: 0.3 },
        bild: '/medien/media/zimmerer/card.webp',
        fokus: '30% 45%',
      },
      {
        id: 'werkstatt',
        text: 'Drinnen in der Werkstatt',
        gewichte: { technik: 0.8, praezision: 0.6 },
        bild: '/medien/media/zerspanungsmechaniker/gallery-3.webp',
        fokus: '35% 50%',
      },
      {
        id: 'unterwegs',
        text: 'Unterwegs bei Menschen',
        gewichte: { team: 0.7, sinn: 0.8, technik: 0.3 },
        bild: '/medien/schritte/m1-ortstermin.webp',
      },
      { id: 'offen', text: 'Weiß ich noch nicht', gewichte: {}, neutral: true },
    ],
  },
  {
    id: 'taetigkeit',
    art: 'bilder',
    frage: 'Was würdest du ausprobieren?',
    etikett: 'Wähle dein Bild',
    antworten: [
      {
        id: 'bauen',
        text: 'Etwas zusammenbauen',
        gewichte: { anpacken: 1, team: 0.5, draussen: 0.4 },
        bild: '/medien/schritte/intro-aufrichten.webp',
      },
      {
        id: 'maschine',
        text: 'Eine Maschine steuern',
        gewichte: { technik: 1, praezision: 0.9 },
        bild: '/medien/media/zerspanungsmechaniker/hero-poster.webp',
      },
      {
        id: 'reparieren',
        text: 'Etwas wieder zum Laufen bringen',
        gewichte: { technik: 0.7, sinn: 1, anpacken: 0.3 },
        bild: '/medien/media/anlagenmechaniker/hero-poster.webp',
        fokus: '65% 40%',
      },
      { id: 'offen', text: 'Weiß ich noch nicht', gewichte: {}, neutral: true },
    ],
  },
]

export function frage(id: string): Frage | null {
  return FRAGEN.find((f) => f.id === id) ?? null
}

export const FRAGEN_BILDER = FRAGEN.flatMap((f) =>
  f.antworten.flatMap((a) => (a.bild ? [a.bild] : [])),
)

/** Nur aktuelle, bewusst gewählte Antworten dürfen eine Empfehlung verändern. */
export function signaleAusAntworten(gefragt: Readonly<Record<string, string>>): Signal[] {
  return FRAGEN.flatMap((f) => {
    const antwort = f.antworten.find((a) => a.id === gefragt[f.id])
    if (!antwort || antwort.neutral) return []
    return [{ gewichte: antwort.gewichte, faktor: FRAGEN_GEWICHT, zitierbar: true }]
  })
}
