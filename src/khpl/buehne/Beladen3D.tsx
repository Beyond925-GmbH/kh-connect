import { useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { SZENE_FARBEN } from '@/dachstuhl/bauteil-texte'
import { Gespann } from '@/drei/fahrzeug'
import type { RequisitId } from '@/drei/fahrzeug'
import { FOV, passeEin } from '@/drei/kamera'
import type { Sichtfeld } from '@/drei/kamera'
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
  // Nach oben endet die Hülle knapp über dem Kofferaufbau (Oberkante 2,35 m):
  // die alte Kante bei 2,7 m war leere Luft, und die zentrierte Einpassung
  // schob die Szene um genau diese Luft nach unten.
  min: [-4.2, 0, -1.6],
  max: [10.2, 2.45, 1.6],
  mitte: [3.0, 1.2, 0],
}

/**
 * Hochkant zählt der Anhänger, nicht der Lkw: die Rückmeldung der Übung ist,
 * dass die gezogenen Sachen auf der Ladefläche liegen — und auf 390 px Breite
 * machte das volle 14-m-Gespann daraus eine 65-px-Miniatur. Die Hülle endet
 * deshalb vor dem Kofferaufbau; die Transporter-Front schneidet rechts an,
 * wie es die Hüllen-Doku für die Langseite ohnehin erlaubt (bewusste
 * Inszenierung).
 */
const HUELLE_HOCHKANT: Huelle = {
  min: [-4.2, 0, -1.6],
  max: [6.6, 2.45, 1.6],
  mitte: [1.2, 1.2, 0],
}

/**
 * Höhen-Füllung quer (Design-Review) — dieselbe Mechanik wie in
 * `Zuschnitt3D.tsx` (dort ausführlich begründet): das Gespann ist ~6-mal so
 * breit wie hoch, `passeEin` lässt quer deshalb rund die halbe Bühnenhöhe
 * leer. Die Hülle wird quer auf ihre Mitte zusammengezogen, bis die Höhe
 * bindet; `FUELL_MIN` deckelt den Anschnitt so, dass Ladefläche und alle
 * Requisiten (bis x ≈ 7,6 an der Transporter-Flanke) im Bild bleiben — nur
 * Haubenspitze und leeres Anhänger-Ende schneiden an. Hochkant übernimmt
 * weiter `HUELLE_HOCHKANT` das Beschneiden, dort bindet die Breite ohnehin.
 */
const FUELL_MIN = 0.7

function fuelleHoehe(huelle: Huelle, aspect: number, sichtfeld: Sichtfeld): Huelle {
  if (aspect <= 1) return huelle
  const voll = passeEin(PRESET, huelle, aspect, sichtfeld)
  const strich: Huelle = {
    min: [huelle.mitte[0], huelle.min[1], huelle.mitte[2]],
    max: [huelle.mitte[0], huelle.max[1], huelle.mitte[2]],
    mitte: huelle.mitte,
  }
  const hoch = passeEin(PRESET, strich, aspect, sichtfeld)
  const s = Math.max(FUELL_MIN, Math.min(1, hoch.distanz / voll.distanz))
  if (s >= 1) return huelle
  const quer = (wert: number, mitte: number) => mitte + (wert - mitte) * s
  return {
    min: [
      quer(huelle.min[0], huelle.mitte[0]),
      huelle.min[1],
      quer(huelle.min[2], huelle.mitte[2]),
    ],
    max: [
      quer(huelle.max[0], huelle.mitte[0]),
      huelle.max[1],
      quer(huelle.max[2], huelle.mitte[2]),
    ],
    mitte: huelle.mitte,
  }
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
    const aspect = breite / hoehe
    const sf: Sichtfeld = { links: sfL, rechts: sfR, oben: sfO, unten: sfU }
    const rahmen = breite < hoehe ? HUELLE_HOCHKANT : fuelleHoehe(HUELLE, aspect, sf)
    return passeEin(PRESET, rahmen, aspect, sf)
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
