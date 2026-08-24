/**
 * Die Handschrift dieses Tages: Strichstärke und Zahlensatz.
 *
 * **Eigene Datei, damit `Bild.tsx` nur Komponenten exportiert** — dieselbe
 * Trennung, die `buehne/kanon.ts` von den 3D-Bühnen trennt, hier nur aus dem
 * kleineren Grund: Ein Modul, das Komponenten *und* Werte ausgibt, verliert
 * Fast Refresh, und der Bau eines Tages besteht zur Hälfte aus Nachjustieren.
 */

/**
 * Strichstärken in **Bildschirmpunkten**, nicht in Millimetern.
 *
 * Alles, was Zeichnung ist — Kontur, Maßlinien, Werkzeugweg —, trägt
 * `vector-effect: non-scaling-stroke` und damit eine feste Strichstärke, egal
 * wie tief gezoomt wird. Genau so verhält sich eine technische Zeichnung am
 * Rechner: Der Zoom zeigt mehr Details, er macht die Linien nicht fett.
 * Bauteile dagegen (Futter, Rohling, Bügel) sind Flächen mit echter
 * Ausdehnung und werden mitskaliert.
 */
export const STRICH = {
  /** Hilfs-, Maß- und Mittellinien. */
  fein: 1,
  /** Sichtbare Kanten, Werkzeugweg. Dieselbe Stärke in Z1 und Z3 — §6 Z3. */
  voll: 2,
} as const

/**
 * Wie ein Bauteil aussieht: Futter, Rohling, Bügel, Trommel, Kiste.
 *
 * **Fläche allein trägt nicht.** `kh-raised` auf `kh-surface` ist ein
 * Helligkeitsunterschied von wenigen Prozent — am Schreibtisch erkennbar, auf
 * einem iPad unter Hallenlicht nicht. Was die Teile lesbar macht, ist die
 * **Kante**: eine helle Umrisslinie in `STRICH.voll`. Das ist zugleich die
 * Handschrift, die zum Tag gehört — die Werkzeuge dieses Berufs sind die
 * Zeichnung, der Werkzeugweg und die Zahl, und alle drei sind Linie.
 */
export const BAUTEIL = 'fill-kh-raised stroke-kh-paper/55'

/**
 * Millimeter mit drei Stellen hinter dem Komma — der Satz, in dem `20,000` und
 * `19,979` erst zu einem Paar werden. Ohne die Nullen liest sich das
 * Größtmaß als `20` und damit als runde Zahl statt als Grenze.
 */
export const KOMMA = new Intl.NumberFormat('de-DE', {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
})
