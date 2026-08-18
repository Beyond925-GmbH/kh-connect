import type { RefObject } from 'react'
import type * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import type { Einheit } from './teileliste'
import { fortschritt, sichtbar } from './zeitachse'

/**
 * Der Animationstreiber (Bauplan 4). Liest nur `fortschritt`, schreibt nie
 * React-State. Alles, was hier passiert, ist eine reine Funktion von t —
 * darum liefert derselbe t-Wert immer dasselbe Bild.
 */
export function Aufbau({
  einheiten,
  schritte,
  fortschrittRef,
  gruppen,
  reduziert,
}: {
  einheiten: Einheit[]
  schritte: Map<number, number>
  fortschrittRef: RefObject<number>
  gruppen: RefObject<Map<string, THREE.Group>>
  reduziert: boolean
}) {
  useFrame(() => {
    const t = fortschrittRef.current
    for (const e of einheiten) {
      const g = gruppen.current.get(e.id)
      if (!g) continue

      const n = schritte.get(e.phase) ?? 1
      g.visible = sichtbar(t, e.phase, e.animIndex, n)
      if (!g.visible) continue

      const w = fortschritt(t, e.phase, e.animIndex, n)
      // Bei `prefers-reduced-motion` bleibt die Zeitachse, die Einflugstrecke
      // faellt weg: die Bauteile erscheinen nur noch.
      const rest = reduziert ? 0 : 1 - w

      g.position.set(
        e.position[0] + e.einflug[0] * rest,
        e.position[1] + e.einflug[1] * rest,
        e.position[2] + e.einflug[2] * rest,
      )
      g.rotation.x = e.rotation[0] + e.neigung * rest
      if (e.wachstum) g.scale.z = reduziert ? 1 : Math.max(w, 0.0001)
    }
  })

  return null
}
