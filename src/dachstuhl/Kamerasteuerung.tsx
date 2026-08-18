import { useEffect, useRef, useState } from 'react'
import type { ComponentRef } from 'react'
import { useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import type { Ansicht } from './kamera'
import { KAMERA, START_KAMERA } from './kamera'

/**
 * OrbitControls nach Bauplan 5.5.
 *
 * Bewusst ohne Azimut-Limit: ein Dachstuhl ist von allen Seiten interessant,
 * und wer beim Drehen gegen eine unsichtbare Wand laeuft, haelt das fuer einen
 * Fehler. Die Polarwinkel-Limits bleiben — von unten durch die Rohdecke oder
 * senkrecht von oben soll niemand schauen.
 */
export function Kamerasteuerung({
  ansicht,
  attraktor,
  abstand = 1,
}: {
  ansicht: Ansicht | null
  attraktor: boolean
  /**
   * Faktor auf den Kameraabstand. Die Presets sind fuer den Vollbild-Prototyp
   * gesetzt; in einem Step liegen Textkarte und Fuss ueber der Szene, und das
   * Modell braucht mehr Luft, damit First und Traufe nicht angeschnitten sind.
   */
  abstand?: number
}) {
  const kamera = useThree((zustand) => zustand.camera)
  const steuerung = useRef<ComponentRef<typeof OrbitControls>>(null)
  const [autoDrehen, setAutoDrehen] = useState(false)

  useEffect(() => {
    const preset = ansicht ? KAMERA[ansicht] : START_KAMERA
    const ziel = new THREE.Vector3(...preset.ziel)
    // Vom Ziel aus skalieren, nicht vom Ursprung: sonst wandert mit dem Abstand
    // auch der Blickwinkel.
    kamera.position
      .set(...preset.position)
      .sub(ziel)
      .multiplyScalar(abstand)
      .add(ziel)
    kamera.lookAt(ziel)
    kamera.updateProjectionMatrix()
    const s = steuerung.current
    if (s) {
      s.target.copy(ziel)
      s.update()
    }
  }, [ansicht, kamera, abstand])

  // Attraktor-Modus: nach 8 s ohne Eingabe dreht das Modell von selbst weiter.
  useEffect(() => {
    if (!attraktor) {
      setAutoDrehen(false)
      return
    }
    let uhr = 0
    const zuruecksetzen = () => {
      setAutoDrehen(false)
      window.clearTimeout(uhr)
      uhr = window.setTimeout(() => setAutoDrehen(true), 8000)
    }
    zuruecksetzen()
    window.addEventListener('pointerdown', zuruecksetzen)
    return () => {
      window.clearTimeout(uhr)
      window.removeEventListener('pointerdown', zuruecksetzen)
    }
  }, [attraktor])

  return (
    <OrbitControls
      ref={steuerung}
      makeDefault
      enabled={ansicht === null}
      enableDamping
      dampingFactor={0.08}
      enablePan={false}
      rotateSpeed={0.6}
      minDistance={9 * abstand}
      maxDistance={22 * abstand}
      minPolarAngle={Math.PI * 0.2}
      maxPolarAngle={Math.PI * 0.48}
      autoRotate={ansicht === null && autoDrehen}
      autoRotateSpeed={0.4}
      touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }}
    />
  )
}
