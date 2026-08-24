import type { BerufDef } from './typen'

/**
 * Zerspanungsmechaniker/-mechanikerin — **angekündigt, noch nicht gebaut**
 * (`graph: null`). Warum ein angekündigter Beruf trotzdem im Angebot steht,
 * steht in `zimmerer.ts`; hier gilt dasselbe.
 *
 * **Was zu tun ist, um ihn fertigzustellen:** `graph` mit `baueGraph` füllen
 * (Vorbild: `dachdecker.ts`), `auftrag` schreiben, `bilder` mit den Motiven
 * seiner Steps belegen, Medien nach
 * `public/medien/media/zerspanungsmechaniker/` legen.
 *
 * **Sein Id-Präfix ist `Z`** (khpl-tage.md §6.1 V4): `Z1`–`Zn` auf der
 * Hauptlinie, Abstecher mit `.`-Suffix (`Z5.1`).
 *
 * ⚠️ **Merkmale und Texte hier sind gesetzt, nicht recherchiert.**
 */
export const ZERSPANUNGSMECHANIKER: BerufDef = {
  id: 'zerspanungsmechaniker',
  name: 'Zerspanungsmechaniker/-mechanikerin',
  kurz: 'Zerspanung',
  zeile: 'Metall auf den Hundertstel. Du programmierst, die CNC fräst.',
  merkmale: {
    anpacken: 0.5,
    praezision: 1,
    technik: 1,
    draussen: 0.05,
    hoehe: 0.05,
    team: 0.4,
    sinn: 0.3,
  },
  medien: {
    karte: '/medien/media/zerspanungsmechaniker/card.webp',
    heroPoster: '/medien/media/zerspanungsmechaniker/hero-poster.webp',
    hero: '/medien/media/zerspanungsmechaniker/hero.mp4',
  },
  bilder: {},
  graph: null,
}
