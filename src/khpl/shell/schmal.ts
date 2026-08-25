import { useEffect, useState } from 'react'

/**
 * Handybreite hochkant — die eine Lage, in der sich Panel und Bühne dieselben
 * 844 Pixel teilen müssen.
 *
 * **Steht in der Hülle, weil es alle vier Tage betrifft.** Zuerst gebaut für
 * Z1/Z2, dann gebraucht von C4 und C6: dieselbe Klemme, dieselbe Antwort. Ein
 * zweiter Haken mit einer zweiten Schwelle wäre genau die Doppelung, die schon
 * bei den drei Bühnen-Messern schiefgegangen ist.
 *
 * Auf Steps mit Klappgriff deckelt die Hülle das Panel dort auf 62 % Höhe,
 * damit die Zeichnung eine Bühne bleibt. Der Preis: Was nicht in die 62 %
 * passt, liegt unter der Scrollkante — und das darf der Fachtext sein, nie
 * die Übung. Steps, die auf schmalen Screens zu viel tragen, fragen hier und
 * kürzen ihren Text, statt den Slider oder den Handgriff zu verstecken.
 *
 * **639 px, nicht 480.** Die Schwelle muss dieselbe sein wie die, an der die
 * Hülle ihre eigenen Schmal-Regeln zieht (`max-sm`, also unter 640 px) — sonst
 * entsteht ein Fenster, in dem die eine Seite schon schmal rechnet und die
 * andere noch nicht. Bei 480 war genau das der Fall: zwischen 481 und 639 px
 * hochkant griff der 62-%-Deckel des Panels bereits, die Kürzung des Textes
 * aber noch nicht, und der Regler auf Z1 lag 83 px unter der Scrollkante. Das
 * iPad hochkant (820 px) zeigt weiter die volle Fassung.
 */
const SCHMAL = '(orientation: portrait) and (max-width: 639.98px)'

export function useSchmal(): boolean {
  const [schmal, setSchmal] = useState(() => window.matchMedia(SCHMAL).matches)
  useEffect(() => {
    const abfrage = window.matchMedia(SCHMAL)
    const auf = () => setSchmal(abfrage.matches)
    abfrage.addEventListener('change', auf)
    return () => abfrage.removeEventListener('change', auf)
  }, [])
  return schmal
}
