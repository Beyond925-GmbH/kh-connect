/**
 * Die Merkmale, an denen Besucher und Berufe verglichen werden.
 *
 * Sieben Achsen, mehr nicht. Jede zusätzliche Achse braucht eine Frage, die sie
 * misst, sonst steht sie bei jedem Besucher auf null und verschiebt nur die
 * Normierung.
 *
 * `sinn` ist die einzige, die nicht von einer Tätigkeit handelt, sondern vom
 * Ergebnis — Wärmepumpe, Dachbegrünung, Holz als CO₂-Speicher. Sie ist für
 * Anlagenmechaniker:in SHK der stärkste Trennwert und für das Publikum die
 * greifbarste Frage überhaupt.
 */

export const MERKMALE = [
  'anpacken',
  'praezision',
  'technik',
  'draussen',
  'hoehe',
  'team',
  'sinn',
] as const

export type MerkmalId = (typeof MERKMALE)[number]

/** Voller Vektor, alle Merkmale gesetzt, Werte 0..1. */
export type MerkmalVektor = Readonly<Record<MerkmalId, number>>

/** Teilsignal an einer Antwort oder Wahl, Werte typischerweise -1..+1. */
export type MerkmalGewichte = Readonly<Partial<Record<MerkmalId, number>>>

/**
 * Wie das Merkmal dem Besucher zurückgesagt wird: „Du magst …“.
 *
 * Deshalb Verbalphrasen und keine Substantive — „Präzision“ ist eine Kategorie,
 * „auf den Zehntelmillimeter genau arbeiten“ ist etwas, das jemand über sich
 * gesagt hat.
 */
export const MERKMAL_TEXTE: Readonly<Record<MerkmalId, string>> = {
  anpacken: 'selbst anpacken und etwas bauen, das man sieht',
  praezision: 'genau arbeiten, bis auf den Zehntelmillimeter',
  technik: 'Technik und Maschinen',
  draussen: 'draußen sein, bei jedem Wetter',
  hoehe: 'hoch hinaus — Höhe macht dir nichts aus',
  team: 'im Team arbeiten, nicht allein',
  sinn: 'Arbeit, die beim Klima etwas bewegt',
}

export function leererVektor(): Record<MerkmalId, number> {
  return Object.fromEntries(MERKMALE.map((m) => [m, 0])) as Record<MerkmalId, number>
}
