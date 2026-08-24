import type { BerufDef } from './typen'

/**
 * Anlagenmechaniker/-mechanikerin SHK — **angekündigt, noch nicht gebaut**
 * (`graph: null`). Warum ein angekündigter Beruf trotzdem im Angebot steht,
 * steht in `zimmerer.ts`; hier gilt dasselbe.
 *
 * **Was zu tun ist, um ihn fertigzustellen:** `graph` mit `baueGraph` füllen
 * (Vorbild: `dachdecker.ts`), `auftrag` schreiben, `bilder` mit den Motiven
 * seiner Steps belegen, Medien nach `public/medien/media/anlagenmechaniker/`
 * legen.
 *
 * **Sein Id-Präfix ist `A`** (khpl-tage.md §6.1 V4): `A1`–`An` auf der
 * Hauptlinie, Abstecher mit `.`-Suffix (`A5.1`).
 *
 * ⚠️ **Merkmale und Texte hier sind gesetzt, nicht recherchiert.**
 */
export const ANLAGENMECHANIKER: BerufDef = {
  id: 'anlagenmechaniker',
  name: 'Anlagenmechaniker/-mechanikerin SHK',
  kurz: 'Anlagenmechanik',
  zeile: 'Wärmepumpe statt Ölkessel. Du baust die Energiewende ein.',
  merkmale: {
    anpacken: 0.8,
    praezision: 0.7,
    technik: 0.85,
    draussen: 0.3,
    hoehe: 0.15,
    team: 0.5,
    sinn: 1,
  },
  medien: {
    karte: '/medien/media/anlagenmechaniker/card.webp',
    heroPoster: '/medien/media/anlagenmechaniker/hero-poster.webp',
    hero: '/medien/media/anlagenmechaniker/hero.mp4',
  },
  bilder: {},
  graph: null,
}
