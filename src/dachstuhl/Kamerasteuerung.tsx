import { useEffect, useRef, useState } from 'react'
import type { ComponentRef } from 'react'
import { useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import type { Huelle } from './mass'
import type { Ansicht } from './kamera'
import { KAMERA, START_ANSICHT, passeEin } from './kamera'

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
  huelle,
  attraktor,
}: {
  ansicht: Ansicht | null
  huelle: Huelle
  attraktor: boolean
}) {
  const kamera = useThree((zustand) => zustand.camera)
  const breite = useThree((zustand) => zustand.size.width)
  const hoehe = useThree((zustand) => zustand.size.height)
  const steuerung = useRef<ComponentRef<typeof OrbitControls>>(null)
  const [autoDrehen, setAutoDrehen] = useState(false)
  const [distanz, setDistanz] = useState(18)

  // Die Kamera wird eingepasst, nicht gesetzt: aus Huelle, Blickrichtung und
  // Seitenverhaeltnis folgt die Distanz. Beim Drehen des iPads laeuft der
  // Effekt erneut, weil `breite`/`hoehe` sich aendern.
  useEffect(() => {
    if (hoehe <= 0) return
    const preset = KAMERA[ansicht ?? START_ANSICHT]
    const lage = passeEin(preset, huelle, breite / hoehe)
    kamera.position.set(...lage.position)
    const ziel = new THREE.Vector3(...lage.ziel)
    kamera.lookAt(ziel)
    kamera.updateProjectionMatrix()
    setDistanz(lage.distanz)
    const s = steuerung.current
    if (s) {
      s.target.copy(ziel)
      s.update()
    }
  }, [ansicht, huelle, kamera, breite, hoehe])

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
      // Die Zoomgrenzen haengen an der eingepassten Distanz statt an festen
      // Metern: im Hochformat steht die Kamera weiter weg, und eine feste
      // Obergrenze von 22 m haette das Modell dort wieder angeschnitten.
      minDistance={ansicht === null ? distanz * 0.5 : 0}
      maxDistance={ansicht === null ? distanz * 1.35 : Infinity}
      // Die Limits schuetzen die freie Bedienung. Bei einer festen Ansicht
      // muessen sie weg: `update()` klemmt den Polarwinkel auch bei
      // `enabled={false}`, und genau das hat den Traufblick nach oben gekippt.
      minPolarAngle={ansicht === null ? Math.PI * 0.2 : 0}
      maxPolarAngle={ansicht === null ? Math.PI * 0.48 : Math.PI}
      autoRotate={ansicht === null && autoDrehen}
      autoRotateSpeed={0.4}
      touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }}
    />
  )
}
