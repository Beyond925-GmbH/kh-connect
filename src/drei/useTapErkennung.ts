import { useRef } from 'react'

/**
 * Tap gegen Dreh-Geste. OrbitControls hat keinen eigenen
 * Schwellwert — ohne diese Messung wird jedes Verwackeln beim Drehen zum
 * Fehl-Tap auf ein Bauteil.
 */

const MAX_BEWEGUNG = 8
const MAX_DAUER = 400

interface Zeiger {
  clientX: number
  clientY: number
}

export interface TapErkennung {
  merken: (e: Zeiger) => void
  istTap: (e: Zeiger) => boolean
}

export function useTapErkennung(): TapErkennung {
  const start = useRef<{ x: number; y: number; t: number } | null>(null)

  const erkennung = useRef<TapErkennung>({
    merken: (e) => {
      start.current = { x: e.clientX, y: e.clientY, t: performance.now() }
    },
    istTap: (e) => {
      const s = start.current
      if (!s) return false
      const bewegung = Math.hypot(e.clientX - s.x, e.clientY - s.y)
      const dauer = performance.now() - s.t
      return bewegung < MAX_BEWEGUNG && dauer < MAX_DAUER
    },
  })

  return erkennung.current
}
