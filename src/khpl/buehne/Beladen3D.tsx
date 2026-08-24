import { useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { SZENE_FARBEN } from '@/dachstuhl/bauteil-texte'
import { Gespann } from '@/dachstuhl/fahrzeug'
import type { RequisitId } from '@/dachstuhl/fahrzeug'
import { FOV, passeEin } from '@/dachstuhl/kamera'
import type { Huelle } from '@/dachstuhl/mass'
import { useSichtfeld } from '@/khpl/shell/SichtfeldKontext'

/**
 * B4.1 — das echte Drop-Ziel: Transporter und Anhänger in Dreiviertelansicht
 * auf dem Hof. Die Textkarten bleiben die Drag-Quelle im Panel; angenommene
 * Teile materialisieren hier als einfache Requisiten, die Ladung wächst
 * sichtbar. Dein Sparren liegt von Anfang an markiert drauf.
 *
 * **Lazy-Grenze** wie `Dachstuhl3D`: nur über `lazy(() => import(...))`
 * einbinden, keine Wert-Exporte neben der Default-Komponente.
 */

export interface Beladen3DProps {
  /**
   * Ids der korrekt verladenen Teile (B4.1-Antwortformat). Jede Requisite
   * animiert beim Materialisieren selbst (`Erscheinen` in `fahrzeug.tsx`) —
   * ein eigener „zuletzt“-Kanal ist dafür nicht nötig.
   */
  geladen: readonly string[]
}

const REQUISITEN: readonly RequisitId[] = ['anker', 'psa', 'werkzeug', 'leiter']

const PRESET = {
  richtung: [9.5, 5.0, 8.5] as [number, number, number],
  ausschnitt: 'gesamt' as const,
  beschreibung: 'Dreiviertelblick auf das Gespann',
}

/** Gespann-Hülle im lokalen Rahmen (Ursprung = Mitte Anhänger-Ladefläche). */
const HUELLE: Huelle = {
  // z etwas weiter als die Fahrzeugbreite: die Requisiten stehen an der
  // kamerazugewandten Flanke (bis z ≈ 1,55) und sollen im Bild bleiben.
  min: [-4.2, 0, -1.6],
  max: [10.2, 2.7, 1.6],
  mitte: [3.0, 1.35, 0],
}

function Kamera() {
  const kamera = useThree((z) => z.camera)
  const szene = useThree((z) => z.scene)
  const breite = useThree((z) => z.size.width)
  const hoehe = useThree((z) => z.size.height)
  const sichtfeld = useSichtfeld()
  const sfL = sichtfeld?.links ?? 0
  const sfR = sichtfeld?.rechts ?? 0
  const sfO = sichtfeld?.oben ?? 0
  const sfU = sichtfeld?.unten ?? 0
  const blick = useRef(new THREE.Vector3())

  const lage = useMemo(() => {
    if (hoehe <= 0) return null
    return passeEin(PRESET, HUELLE, breite / hoehe, {
      links: sfL,
      rechts: sfR,
      oben: sfO,
      unten: sfU,
    })
  }, [breite, hoehe, sfL, sfR, sfO, sfU])

  useFrame(() => {
    if (!lage) return
    kamera.position.set(...lage.position)
    blick.current.set(...lage.ziel)
    kamera.lookAt(blick.current)
    kamera.updateProjectionMatrix()

    // Der Nebel folgt der Kamera, statt fest zu stehen — dasselbe Muster wie
    // in `Zuschnitt3D`. Neben dem echten Panel bleibt der Bühne quer nur die
    // halbe Breite, und `passeEin` schiebt die Kamera für das 14 m lange
    // Gespann fast 50 m hinaus: ein fester Nebel (14–48 m) verschluckte das
    // ganze Motiv. Jetzt beginnt er immer erst hinter dem Gespann.
    if (szene.fog instanceof THREE.Fog) {
      const dist = kamera.position.distanceTo(blick.current)
      szene.fog.near = dist + 3
      szene.fog.far = dist + 30
    }
  })

  return null
}

export default function Beladen3D({ geladen }: Beladen3DProps) {
  const [kontextWeg, setKontextWeg] = useState(false)
  const [neustart, setNeustart] = useState(0)

  const reduziert = useMemo(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )

  // Der Holzstapel wächst mit der Sparren-Karte; dein Sparren liegt immer drauf.
  const ladung = geladen.includes('sparren') ? 0.9 : 0.12
  const requisiten = useMemo(
    () => REQUISITEN.filter((id) => geladen.includes(id)),
    [geladen],
  )

  const hintergrund = SZENE_FARBEN.dunkel.hintergrund

  return (
    <div className="relative size-full" data-wisch="aus">
      <Canvas
        key={neustart}
        style={{ touchAction: 'none', width: '100%', height: '100%' }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: false }}
        camera={{ fov: FOV, near: 0.1, far: 120, position: [11, 6, 10] }}
        onCreated={({ gl }) => {
          const leinwand = gl.domElement
          leinwand.addEventListener('webglcontextlost', (e) => {
            e.preventDefault()
            setKontextWeg(true)
          })
          leinwand.addEventListener('webglcontextrestored', () => {
            setKontextWeg(false)
            setNeustart((n) => n + 1)
          })
        }}
      >
        <color attach="background" args={[hintergrund]} />
        <fog attach="fog" args={[hintergrund, 14, 48]} />
        <ambientLight intensity={0.55} />
        <hemisphereLight
          args={[SZENE_FARBEN.dunkel.himmel, SZENE_FARBEN.dunkel.boden, 0.6]}
        />
        <directionalLight position={[5, 9, 6]} intensity={2.0} />
        <directionalLight position={[-6, 4, -7]} intensity={0.7} />
        <Kamera />

        {/* Hof-Boden */}
        <mesh position={[3, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[60, 40]} />
          <meshStandardMaterial color={SZENE_FARBEN.dunkel.boden} roughness={1} />
        </mesh>

        <Gespann
          ladung={ladung}
          deinSparren
          requisiten={requisiten}
          reduziert={reduziert}
        />
      </Canvas>

      {kontextWeg && (
        <div className="absolute inset-0 z-30 grid place-items-center bg-kh-ink/90">
          <p className="max-w-xs px-6 text-center text-[15px] text-kh-mute">
            Die 3D-Ansicht wird neu aufgebaut. Einen Moment.
          </p>
        </div>
      )}
    </div>
  )
}
