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
 */

/** Mindestweg quer, damit ein Scroll-Versuch nicht als Wisch durchgeht. */
const MIN_WEG = 70
/** Maximaler Weg hoch/runter, damit eine Diagonale nicht zählt. */
const MAX_ABWEICHUNG = 60
const MAX_DAUER = 700

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
  const start = useRef<{ x: number; y: number; t: number } | null>(null)
  const handler = useRef({ onLinks, onRechts })

  useEffect(() => {
    handler.current = { onLinks, onRechts }
  })

  useEffect(() => {
    const el = ziel.current
    if (!el || !aktiv) return

    const ab = (e: PointerEvent) => {
      const auf = e.target
      // Ein Regler, eine Zieh-Karte oder das Canvas beansprucht die Geste selbst.
      if (
        auf instanceof Element &&
        auf.closest('[data-wisch="aus"], input[type="range"], canvas, [role="slider"]')
      ) {
        start.current = null
        return
      }
      start.current = { x: e.clientX, y: e.clientY, t: performance.now() }
    }

    const auf = (e: PointerEvent) => {
      const s = start.current
      start.current = null
      if (!s) return
      const dx = e.clientX - s.x
      const dy = e.clientY - s.y
      if (performance.now() - s.t > MAX_DAUER) return
      if (Math.abs(dy) > MAX_ABWEICHUNG) return
      if (Math.abs(dx) < MIN_WEG) return
      if (dx < 0) handler.current.onLinks()
      else handler.current.onRechts()
    }

    const abbruch = () => {
      start.current = null
    }

    el.addEventListener('pointerdown', ab)
    el.addEventListener('pointerup', auf)
    el.addEventListener('pointercancel', abbruch)
    return () => {
      el.removeEventListener('pointerdown', ab)
      el.removeEventListener('pointerup', auf)
      el.removeEventListener('pointercancel', abbruch)
    }
  }, [ziel, aktiv])
}
