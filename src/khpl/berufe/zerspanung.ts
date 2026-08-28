import type { BerufDef } from './typen'

/**
 * Zerspanungsmechaniker/-mechanikerin — angekündigt, kein Tag.
 *
 * Der Beruf steht im Angebot und im Trichter: seine Karte liegt in der
 * Berufsliste, sein Merkmalsvektor geht in das Matching ein. Was fehlt, ist der
 * begehbare Tag — `graph: null` heißt genau das (siehe `typen.ts`), und die
 * Karte führt damit auf `shell/BerufBald.tsx` statt in eine Station.
 *
 * **Der gebaute Tag ist ausgebaut worden.** Steps (`steps/zerspanung/`),
 * Bühnen (`buehne/zerspanung/`), Glossar (`glossar/zerspanung.ts`) und die
 * Antwort-Schlüssel `z*` in `store/fortschritt.ts` sind entfernt; die
 * Vorlagen dazu stehen weiter in `khpl-tag-zerspanung.md` und `belege/
 * zerspanung.md`. Wer ihn neu baut, hängt hier `bilder`, `auftrag` und
 * `graph` wieder an — an der Hülle ist dafür nichts zu ändern.
 */
export const ZERSPANUNGSMECHANIKER: BerufDef = {
  id: 'zerspanungsmechaniker',
  name: 'Zerspanungsmechaniker/-mechanikerin',
  kurz: 'Zerspanung',
  zeile: 'Metall auf den Hundertstel. Du programmierst, die CNC fräst.',
  /**
   * ⚠️ **Unverändert.** Der Vektor speist den Trichter; wer ihn ändert, ändert
   * die Empfehlung für alle vier Berufe (khpl-tage.md §5).
   */
  merkmale: {
    anpacken: 0.5,
    praezision: 1,
    technik: 1,
    draussen: 0.05,
    hoehe: 0.05,
    team: 0.4,
    sinn: 0.3,
  },
  /** Karte in der Berufsliste und Hintergrund des „In Arbeit“-Screens. */
  medien: {
    karte: '/medien/media/zerspanungsmechaniker/card.webp',
    heroPoster: '/medien/media/zerspanungsmechaniker/hero-poster.webp',
    hero: '/medien/media/zerspanungsmechaniker/hero.mp4',
  },
  /** Ohne Steps trägt kein Screen ein Motiv. */
  bilder: {},
  graph: null,
}
