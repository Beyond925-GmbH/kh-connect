/** Feste Kamerapositionen der Debug-Schnittstelle (Bauplan 6.2). */

export type Ansicht = 'iso' | 'front' | 'seite' | 'oben' | 'traufe'

export const ANSICHTEN: Ansicht[] = ['iso', 'front', 'seite', 'oben', 'traufe']

export interface Kamerapreset {
  position: [number, number, number]
  ziel: [number, number, number]
  beschreibung: string
}

export const KAMERA: Record<Ansicht, Kamerapreset> = {
  iso: {
    position: [9.5, 6.5, 9.0],
    ziel: [0, 2.0, 0],
    beschreibung: 'Dreiviertelblick',
  },
  front: {
    position: [13.5, 2.4, 0],
    ziel: [0, 2.2, 0],
    beschreibung: 'Giebelansicht',
  },
  seite: {
    position: [0, 2.4, 15.0],
    ziel: [0, 2.2, 0],
    beschreibung: 'Traufseite',
  },
  oben: {
    // Die 0,01 verhindert, dass Blickrichtung und Up-Vektor kollinear werden.
    position: [0.01, 16.0, 0.01],
    ziel: [0, 0.5, 0],
    beschreibung: 'Draufsicht',
  },
  traufe: {
    position: [7.0, 0.6, 8.5],
    ziel: [0, 1.6, 0],
    beschreibung: 'Traufe von unten',
  },
}

export const FOV = 40

/** Freie Ansicht ohne Parameter. */
export const START_KAMERA = KAMERA.iso
