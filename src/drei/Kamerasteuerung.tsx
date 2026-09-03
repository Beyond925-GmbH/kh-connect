import { useEffect, useRef, useState } from 'react'
import type { ComponentRef } from 'react'
import { useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import type { Huelle } from '@/dachstuhl/mass'
import type { Ansicht, Sichtfeld } from './kamera'
import { KAMERA, START_ANSICHT, passeEin } from './kamera'

/**
 * Bewusst ohne Azimut-Limit: ein Dachstuhl ist von allen Seiten interessant,
 * und wer beim Drehen gegen eine unsichtbare Wand laeuft, haelt das fuer einen
 * Fehler. Die Polarwinkel-Limits bleiben — von unten durch die Rohdecke oder
 * senkrecht von oben soll niemand schauen.
 */
export function Kamerasteuerung({
  ansicht,
  huelle,
  attraktor,
  sichtfeld,
  gesperrt = false,
}: {
  ansicht: Ansicht | null
  huelle: Huelle
  attraktor: boolean
  /** Verdeckte Anteile der Leinwand — s. `Sichtfeld` in `kamera.ts`. */
  sichtfeld?: Sichtfeld
  /** Haelt die freie Drehung an, ohne die Ansicht zu wechseln — z. B. waehrend der Fahrt (M5). */
  gesperrt?: boolean
}) {
  const kamera = useThree((zustand) => zustand.camera)
  const breite = useThree((zustand) => zustand.size.width)
  const hoehe = useThree((zustand) => zustand.size.height)
  const steuerung = useRef<ComponentRef<typeof OrbitControls>>(null)
  const [autoDrehen, setAutoDrehen] = useState(false)
  const [distanz, setDistanz] = useState(18)
  // Die zuletzt eingepasste Distanz und ob der letzte Lauf frei war — damit
  // eine Neueinpassung in der freien Ansicht den Blick des Besuchers behaelt.
  const eingepasst = useRef<{ distanz: number; frei: boolean } | null>(null)

  // Die Kamera wird eingepasst, nicht gesetzt: aus Huelle, Blickrichtung und
  // Seitenverhaeltnis folgt die Distanz. Beim Drehen des iPads laeuft der
  // Effekt erneut, weil `breite`/`hoehe` sich aendern.
  // Als Zahlen ausgepackt: ein Objektliteral aus dem Step waere bei jedem
  // Rendern neu, und der Effekt liefe endlos.
  const sfL = sichtfeld?.links ?? 0
  const sfR = sichtfeld?.rechts ?? 0
  const sfO = sichtfeld?.oben ?? 0
  const sfU = sichtfeld?.unten ?? 0

  useEffect(() => {
    if (hoehe <= 0) return
    const s = steuerung.current
    let preset = KAMERA[ansicht ?? START_ANSICHT]
    // Verhaeltnis der aktuellen zur eingepassten Distanz — der Zoom des
    // Besuchers, der die Neueinpassung ueberleben soll.
    let zoom = 1
    // Freie Ansicht, und der Besucher hat schon einen Blick: die Huelle
    // waechst mit dem Baustand (M5, `huelleBeiT`) und die Leinwand aendert
    // ihre Groesse — beides passt neu ein, keins davon darf die Kamera auf
    // den Startblick zuruecksetzen. Eingepasst wird deshalb entlang der
    // Richtung, in die gerade geschaut wird; nur Ziel und Distanz folgen der
    // neuen Huelle.
    const vorher = eingepasst.current
    if (ansicht === null && vorher?.frei && s) {
      const blick = kamera.position.clone().sub(s.target)
      if (blick.lengthSq() > 1e-6) {
        preset = { ...preset, richtung: [blick.x, blick.y, blick.z] }
        zoom = blick.length() / vorher.distanz
      }
    }
    const lage = passeEin(preset, huelle, breite / hoehe, {
      links: sfL,
      rechts: sfR,
      oben: sfO,
      unten: sfU,
    })
    const ziel = new THREE.Vector3(...lage.ziel)
    kamera.position.set(...lage.position)
    if (zoom !== 1) kamera.position.sub(ziel).multiplyScalar(zoom).add(ziel)
    kamera.lookAt(ziel)
    kamera.updateProjectionMatrix()
    setDistanz(lage.distanz)
    eingepasst.current = { distanz: lage.distanz, frei: ansicht === null }
    if (s) {
      // Die Zoomgrenzen muessen VOR dem `update()` stehen, nicht erst im
      // naechsten Rendern: `update()` klemmt die Kamera sofort auf die noch
      // geltenden Grenzen. Beim ersten Lauf sind das die des Startwerts
      // (18 m → hoechstens 24,3 m) — die eingepasste Distanz liegt in einem
      // Step aber bei ueber 30 m, weil das Modell nur die freie Flaeche neben
      // dem Panel bekommt. Ergebnis war ein um ein Drittel zu nah stehendes
      // Modell, das rechts aus dem Bild lief; der Nachzug ueber den State kam
      // zu spaet, weil `update()` nur klemmt und nie wieder aufmacht.
      if (ansicht === null) {
        s.minDistance = lage.distanz * 0.5
        s.maxDistance = lage.distanz * 1.35
      }
      s.target.copy(ziel)
      s.update()
    }
  }, [ansicht, huelle, kamera, breite, hoehe, sfL, sfR, sfO, sfU])

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
      enabled={ansicht === null && !gesperrt}
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
