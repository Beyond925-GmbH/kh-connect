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
 *
 * **Die Stärken sind eine Stufe höher als in der ersten Fassung.** Am
 * Schreibtisch trug 1,25 px; auf einer stehenden Stele, aus zwei Metern und bei
 * Tageslicht durch die Hallentür, war eine halbtransparente Haarlinie auf
 * Fast-Schwarz nicht mehr da. Der Zoom macht die Linien nicht fett — die
 * Grundstärke muss deshalb von sich aus tragen.
 */
export const STRICH = {
  /** Hilfs-, Maß- und Mittellinien. */
  fein: 1.6,
  /** Sichtbare Kanten, Werkzeugweg. Dieselbe Stärke in Z1 und Z3 — §6 Z3. */
  voll: 3.4,
} as const

/**
 * Die Farbe der Bemaßung: Maßlinien, Pfeilspitzen, Mittelachse, Hinweislinien.
 *
 * **Nicht `kh-line-strong`.** Das Token ist 26 % Weiß auf `kh-surface` und
 * damit ein Rahmenton für Flächen, kein Zeichenton — auf der Stele blieb davon
 * bei Tageslicht nichts übrig. `kh-mute` ist ein deckender Grauton aus
 * demselben Satz und liest sich wie der weiche Bleistift, mit dem eine
 * Zeichnung bemaßt wird: sichtbar, aber leiser als die Kontur.
 */
export const BEMASSUNG = 'text-kh-mute'
/** Maßhilfslinien — dieselbe Familie, eine Spur zurückgenommen. */
export const HILFE = 'text-kh-mute/70'

/**
 * Wie ein Bauteil aussieht: Futter, Rohling, Bügel, Trommel, Kiste.
 *
 * **Fläche allein trägt nicht.** `kh-raised` auf `kh-surface` ist ein
 * Helligkeitsunterschied von wenigen Prozent — am Schreibtisch erkennbar, auf
 * einem iPad unter Hallenlicht nicht. Was die Teile lesbar macht, ist die
 * **Kante**: eine helle Umrisslinie in `STRICH.voll`. Das ist zugleich die
 * Handschrift, die zum Tag gehört — die Werkzeuge dieses Berufs sind die
 * Zeichnung, der Werkzeugweg und die Zahl, und alle drei sind Linie.
 *
 * Die Kante steht inzwischen **voll** in `kh-paper`. Zwei Stufen Deckkraft
 * hintereinander (erst /70, dann /80) waren jedes Mal am Schreibtisch genug und
 * auf der Stele nicht — Tageslicht frisst den Rest eines Grautons auf
 * Fast-Schwarz. Am Schreibtisch steht das Gerät aber nicht.
 */
export const BAUTEIL = 'fill-kh-raised stroke-kh-paper'

/**
 * Millimeter mit drei Stellen hinter dem Komma — der Satz, in dem `20,000` und
 * `19,979` erst zu einem Paar werden. Ohne die Nullen liest sich das
 * Größtmaß als `20` und damit als runde Zahl statt als Grenze.
 */
export const KOMMA = new Intl.NumberFormat('de-DE', {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
})
