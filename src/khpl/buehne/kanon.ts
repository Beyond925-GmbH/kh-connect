/**
 * Three-freie Konstanten der Buehnen. Eigene Datei aus demselben Grund wie
 * `Dachstuhl3DFallback`: ein Wert-Export neben einer lazy Komponente wird von
 * Steps statisch importiert und zieht dann `three` in den Erststart (README,
 * `INEFFECTIVE_DYNAMIC_IMPORT`). Steps importieren Laufzeit-Werte der Buehnen
 * ausschliesslich von hier oder aus `aufbauabschnitte.ts` — aus den
 * Buehnen-Modulen selbst nur `import type`.
 */

/** Dauer der Anfahrt M4→M5 in Sekunden (Beschluss-Fenster 4–6 s). */
export const ANFAHRT_DAUER = 4.5
