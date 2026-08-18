import { useMemo } from 'react'
import * as THREE from 'three'
import type { ThreeEvent } from '@react-three/fiber'
import type { Bauteil as BauteilDaten } from './teileliste'
import {
  ABDUNKLUNG_ANTEIL,
  ABDUNKLUNG_ZIEL,
  AUSWAHL_EMISSIV,
  AUSWAHL_INTENSITAET,
} from './bauteil-texte'
import type { TapErkennung } from './useTapErkennung'

const SCHWARZ = new THREE.Color('#000000')
const EMISSIV = new THREE.Color(AUSWAHL_EMISSIV)
const DUNKEL = new THREE.Color(ABDUNKLUNG_ZIEL)

/**
 * Ein Mesh: geteilte Geometrie, Material, Zeiger-Behandlung, Hervorhebung.
 * `e.stopPropagation()` in jedem Handler — sonst trifft ein Tap den Sparren
 * *und* die dahinterliegende Pfette, und die Karte zeigt den falschen Begriff.
 */
export function Bauteil({
  teil,
  geometrie,
  grundfarbe,
  hervorgehoben,
  gedimmt,
  tap,
  onTap,
}: {
  teil: BauteilDaten
  geometrie: THREE.BufferGeometry
  grundfarbe: string
  hervorgehoben: boolean
  gedimmt: boolean
  tap: TapErkennung
  onTap: (teil: BauteilDaten) => void
}) {
  const farbe = useMemo(() => {
    const c = new THREE.Color(grundfarbe)
    if (gedimmt) c.lerp(DUNKEL, ABDUNKLUNG_ANTEIL)
    return c
  }, [grundfarbe, gedimmt])

  const skalierung = useMemo<[number, number, number]>(() => {
    const spiegel = teil.spiegelZ ? -1 : 1
    if (teil.form === 'box' || teil.form === 'zone') {
      return [teil.groesse[0], teil.groesse[1], teil.groesse[2] * spiegel]
    }
    return [1, 1, spiegel]
  }, [teil.form, teil.groesse, teil.spiegelZ])

  const zeigerAb = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    tap.merken(e)
  }
  const zeigerAuf = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    if (tap.istTap(e)) onTap(teil)
  }

  return (
    <mesh
      geometry={geometrie}
      position={teil.position}
      rotation={teil.rotation}
      scale={skalierung}
      castShadow={teil.wirftSchatten}
      receiveShadow={teil.empfaengtSchatten}
      onPointerDown={zeigerAb}
      onPointerUp={zeigerAuf}
    >
      {teil.form === 'zone' ? (
        // Unsichtbares Pick-Volumen: der Raycaster trifft es weiterhin.
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      ) : (
        <meshStandardMaterial
          color={farbe}
          roughness={teil.typ === 'windrispe' ? 0.35 : 0.82}
          metalness={teil.typ === 'windrispe' ? 0.6 : 0}
          flatShading
          emissive={hervorgehoben ? EMISSIV : SCHWARZ}
          emissiveIntensity={hervorgehoben ? AUSWAHL_INTENSITAET : 0}
        />
      )}
    </mesh>
  )
}
