import { useCallback, useEffect, useRef } from 'react'

/**
 * Der Staff-Ausgang: fünf schnelle Taps, dann „Neu starten
 * / App neu laden“. Für den Fall, dass etwas hängt und der nächste Besucher
 * schon wartet.
 *
 * **Warum das hier ein eigenes Modul ist.** Der erste Anlauf legte eine
 * unsichtbare 48-px-Fläche über die linke obere Ecke — quer über den
 * Zurück-Button. Zwei Folgen, beide schlecht: die linke Hälfte von „Zurück“
 * reagierte nicht mehr, und fünf Taps darauf öffneten das Personalmenü
 * ausgerechnet dem Jugendlichen, der davon nichts sehen soll.
 *
 * Es gibt keine Bildschirmecke, die auf allen Screens frei ist: oben links
 * sitzt Zurück, oben rechts der Karriere-Link, unten rechts *Weiter*, unten
 * links die Textkarte. Deshalb hängt die Geste jetzt an Flächen, die der
 * jeweilige Screen selbst als leer kennt — der Dehnfuge in der Leiste und dem
 * Logo auf dem Splash — statt an einer Koordinate, die nichts über den Screen
 * darunter weiß.
 */

/** Fünf Taps innerhalb dieser Spanne zählen als Geste. */
const FENSTER_MS = 2500
const NOETIGE_TAPS = 5

let oeffner: (() => void) | null = null

/** Der KioskGuard hängt hier sein Dialogfenster ein. */
export function useStaffDialogAnmeldung(oeffnen: () => void) {
  useEffect(() => {
    oeffner = oeffnen
    return () => {
      if (oeffner === oeffnen) oeffner = null
    }
  }, [oeffnen])
}

/**
 * Gibt einen Tap-Handler zurück. Auf ein Element legen, das auf diesem Screen
 * garantiert keine Funktion hat.
 */
export function useStaffAusgang() {
  const taps = useRef<number[]>([])

  return useCallback(() => {
    const jetzt = Date.now()
    taps.current = [...taps.current, jetzt].filter((t) => jetzt - t < FENSTER_MS)
    if (taps.current.length >= NOETIGE_TAPS) {
      taps.current = []
      oeffner?.()
    }
  }, [])
}
