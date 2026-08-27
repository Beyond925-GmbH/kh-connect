/**
 * Die Gesten der Anwendung — die vollständige Liste, und sie soll kurz bleiben.
 *
 * **Warum das eine eigene Datei ist.** Die Ansage (`Ansage.tsx`) erscheint
 * **je Geste, nicht je Screen**. Wer auf A4 gelernt hat, dass man mit dem
 * Finger eine Linie zieht, bekommt auf C4 keine zweite Erklärung derselben
 * Bewegung. Damit das trägt, muss es eine geschlossene Liste geben, gegen die
 * der Store zählen kann — und der Store darf `Ansage.tsx` nicht importieren
 * (React, `motion`), sondern nur diesen Typ.
 *
 * Praktisch heißt das: **zwei bis drei Ansagen je Tag**, nicht fünfzehn.
 *
 * `tippen` steht ausdrücklich mit in der Liste, obwohl es **nie** eine Ansage
 * bekommt (`ANSAGEWUERDIG`). Ein Antippen erklärt sich selbst; die Geste
 * trotzdem zu benennen ist billiger, als sie zu vergessen — ein Step, der
 * `geste: 'tippen'` schreibt, sagt damit „hier ist nichts zu erklären“, und
 * das ist eine Aussage, keine Lücke.
 */
export type Geste =
  /** Antippen. Braucht nie eine Ansage. */
  | 'tippen'
  /** Mit dem Finger eine Strecke über die Bühne ziehen — A4, M4, C6. */
  | 'ziehen-frei'
  /** Einen Regler schieben — M2, C2, Z1, Z5, A3, A6. */
  | 'ziehen-regler'
  /** Eine Karte an ihren Platz ziehen — M7, B4.1. */
  | 'ziehen-karte'
  /** Ein Modell mit dem Finger drehen — C6, M5. */
  | 'drehen'

export const GESTEN = [
  'tippen',
  'ziehen-frei',
  'ziehen-regler',
  'ziehen-karte',
  'drehen',
] as const satisfies readonly Geste[]

export function istGeste(wert: unknown): wert is Geste {
  return typeof wert === 'string' && (GESTEN as readonly string[]).includes(wert)
}

/**
 * Gesten, die eine Ansage bekommen. Alles außer `tippen`.
 *
 * Als Menge und nicht als `!== 'tippen'`, damit eine künftige selbsterklärende
 * Geste hier eingetragen wird, statt eine zweite Sonderregel zu bekommen.
 */
const ANSAGEWUERDIG = new Set<Geste>([
  'ziehen-frei',
  'ziehen-regler',
  'ziehen-karte',
  'drehen',
])

export function brauchtAnsage(geste: Geste): boolean {
  return ANSAGEWUERDIG.has(geste)
}

/**
 * Der feste Wortlaut für die vier Rate-Regler (M2, C2, Z1, A3).
 *
 * Diese vier Screens fragen nach einer Zahl, die niemand wissen kann — und
 * genau das ist ihre Pointe. Ohne Ansage ist das eine verdeckte Prüfung, die
 * man verliert; mit ihr ist es ein Angebot. Der Wortlaut steht hier und nicht
 * viermal in den Steps, damit er auf allen vier Tagen derselbe ist.
 *
 * **Er sagt das Warum, nicht nur „rate ruhig“.** „Rate einfach“ ohne Grund
 * liest sich als Aufgabe, deren Regeln man nicht kennt. Der Grund ist der
 * Vergleich: erst die eigene Zahl, dann die echte — dazwischen liegt die
 * Erkenntnis.
 */
export const RATEN_HAKEN =
  'Wissen kann das niemand — rate. Gleich siehst du deine Zahl neben der echten.'
