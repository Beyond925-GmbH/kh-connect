import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'

/**
 * rAF-Treiber fuer den Aufbau-Fortschritt.
 *
 * Der Fortschritt lebt in einem Ref, nicht im State: `useFrame` liest ihn
 * jeden Frame, ohne dass React neu rendert — und ein fester Wert aus der
 * URL haelt die Animation exakt an, was fuer Screenshots die Bedingung ist.
 */

const HALTEZEIT = 2.5

export interface AufbauOptionen {
  /** Fester Zeitpunkt aus `?t=`. Ist er gesetzt, laeuft kein rAF. */
  fest: number | null
  dauer?: number
  loop?: boolean
  pausiert?: boolean
  onTick?: (t: number) => void
}

export interface Aufbausteuerung {
  /** Fortschritt 0..1. Wird jeden Frame gelesen, nie als State gehalten. */
  fortschritt: RefObject<number>
  /** Von aussen springen (Zeitleistenregler, Zuruecksetzen). */
  springe: (t: number) => void
}

export function useAufbau({
  fest,
  dauer = 14,
  loop = true,
  pausiert = false,
  onTick,
}: AufbauOptionen): Aufbausteuerung {
  const fortschritt = useRef(fest ?? 0)
  const halten = useRef(0)
  const rueckmeldung = useRef(onTick)

  useEffect(() => {
    rueckmeldung.current = onTick
  })

  useEffect(() => {
    if (fest !== null) {
      fortschritt.current = fest
      rueckmeldung.current?.(fest)
      return
    }

    let id = 0
    let letzte = performance.now()

    const schritt = (jetzt: number) => {
      const dt = Math.min((jetzt - letzte) / 1000, 0.1)
      letzte = jetzt

      if (!pausiert) {
        if (halten.current > 0) {
          halten.current -= dt
          if (halten.current <= 0) fortschritt.current = 0
        } else {
          fortschritt.current += dt / dauer
          if (fortschritt.current >= 1) {
            fortschritt.current = 1
            halten.current = loop ? HALTEZEIT : Number.POSITIVE_INFINITY
          }
        }
      }

      rueckmeldung.current?.(fortschritt.current)
      id = requestAnimationFrame(schritt)
    }

    id = requestAnimationFrame(schritt)
    return () => cancelAnimationFrame(id)
  }, [fest, dauer, loop, pausiert])

  const springe = useRef((t: number) => {
    fortschritt.current = t < 0 ? 0 : t > 1 ? 1 : t
    halten.current = 0
    rueckmeldung.current?.(fortschritt.current)
  })

  return { fortschritt, springe: springe.current }
}
