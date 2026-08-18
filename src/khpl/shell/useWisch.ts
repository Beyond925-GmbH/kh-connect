import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'

/**
 * Wischen als zweiter Weg für Weiter und Zurück (khpl-flow.md 6.1).
 *
 * „Drag-Gesten haben immer Vorrang vor Swipe-Navigation“ — deshalb schaltet
 * jeder Screen mit Drag & Drop (M4, M7, B4.1) und das 3D-Modell (B3.2) die
 * Erkennung über `aktiv={false}` ab, statt sich auf Event-Reihenfolge zu
 * verlassen. Zusätzlich ignoriert die Erkennung jeden Start auf einem Element,
 * das sich selbst als ziehbar markiert.
 *
 * Drei Fallen, die hier ausdrücklich behandelt sind:
 *
 * 1. **Zwei Finger.** Ein zweiter Zeiger überschrieb sonst den Startpunkt des
 *    ersten, und das Loslassen wurde gegen den falschen Ursprung gemessen — ein
 *    Aufziehen mit zwei Fingern (das die App ohnehin unterdrückt, weshalb es
 *    jeder zweimal versucht) blätterte damit einen Schritt weiter. Es zählt nur
 *    der primäre Zeiger, und ein zweiter bricht die Geste ab.
 * 2. **Loslassen woanders.** `pointerup` hängt am `window`, nicht am Element:
 *    endet der Wisch über der Leiste oder außerhalb, ging er sonst verloren.
 * 3. **Doppelte Navigation.** Endet ein Wisch nach links auf dem
 *    Weiter-Button, feuern sonst Klick *und* Wisch — zwei Schritte aus einer
 *    Geste. Endet die Geste über einem Bedienelement, gewinnt das Element.
 */

/** Mindestweg quer, damit ein Zittern beim Tippen nicht als Wisch durchgeht. */
const MIN_WEG = 70
/** Maximaler Weg hoch/runter, damit eine Diagonale nicht zählt. */
const MAX_ABWEICHUNG = 60
const MAX_DAUER = 700

const EIGENE_GESTE = '[data-wisch="aus"], input, canvas, [role="slider"]'
const BEDIENELEMENT = 'button, a, input, select, textarea, [role="button"]'

export function useWisch({
  ziel,
  aktiv,
  onLinks,
  onRechts,
}: {
  ziel: RefObject<HTMLElement | null>
  aktiv: boolean
  /** Wisch nach links = vorwärts. */
  onLinks: () => void
  /** Wisch nach rechts = zurück. */
  onRechts: () => void
}) {
  const start = useRef<{ id: number; x: number; y: number; t: number } | null>(null)
  const handler = useRef({ onLinks, onRechts })

  useEffect(() => {
    handler.current = { onLinks, onRechts }
  })

  useEffect(() => {
    const el = ziel.current
    if (!el || !aktiv) return

    const abbruch = () => {
      start.current = null
    }

    const ab = (e: PointerEvent) => {
      // Zweiter Finger: die Geste gehört nicht mehr uns.
      if (start.current !== null || !e.isPrimary) {
        abbruch()
        return
      }
      const auf = e.target
      if (auf instanceof Element && auf.closest(EIGENE_GESTE)) return
      start.current = {
        id: e.pointerId,
        x: e.clientX,
        y: e.clientY,
        t: performance.now(),
      }
    }

    const auf = (e: PointerEvent) => {
      const s = start.current
      if (!s || e.pointerId !== s.id) return
      start.current = null

      // Der Klick des Bedienelements hat Vorrang, sonst zählt eine Geste zweimal.
      if (e.target instanceof Element && e.target.closest(BEDIENELEMENT)) return

      const dx = e.clientX - s.x
      const dy = e.clientY - s.y
      if (performance.now() - s.t > MAX_DAUER) return
      if (Math.abs(dy) > MAX_ABWEICHUNG) return
      if (Math.abs(dx) < MIN_WEG) return
      if (dx < 0) handler.current.onLinks()
      else handler.current.onRechts()
    }

    el.addEventListener('pointerdown', ab)
    window.addEventListener('pointerup', auf)
    window.addEventListener('pointercancel', abbruch)
    return () => {
      el.removeEventListener('pointerdown', ab)
      window.removeEventListener('pointerup', auf)
      window.removeEventListener('pointercancel', abbruch)
      start.current = null
    }
  }, [ziel, aktiv])
}
