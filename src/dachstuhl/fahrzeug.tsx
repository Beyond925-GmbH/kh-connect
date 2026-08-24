import { useEffect, useMemo, useRef } from 'react'
import type { ReactNode, RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { STANDARD_PARAMETER } from './parameter'
import { berechneMasse } from './mass'
import { FAHRZEUG_FARBEN, SIGNAL_MARKE, SPARREN_FARBEN } from './bauteil-texte'

/**
 * Fahrzeug-Kanon: Transporter + Langholz-Anhaenger als parametrische
 * Low-Poly-Geometrie im Stil des Dachstuhl-Modells — Flachfarben, Code statt
 * Assets. Sparren und Pfetten fahren auf dem Anhaenger, Werkzeug und PSA im
 * Transporter (Glossar).
 *
 * Das ganze Gespann wirft **keine** echten Schatten (die Schattenkamera bleibt
 * bei 8,6 m, und die Schattenkarte ist eingefroren) — stattdessen liegen zwei
 * Kontaktschatten-Quads darunter.
 *
 * Lokales Bezugssystem: Ursprung = Mitte der Anhaenger-Ladeflaeche, +x =
 * Fahrtrichtung (der Transporter steht voraus), y = 0 ist der Boden.
 */

const MASSE = berechneMasse(STANDARD_PARAMETER)

/**
 * Fussabdruck-Breite des Gespanns in m, fuer die Parkrechnung. (Die Laenge —
 * rund 13,5 m — braucht keine Konstante: die Huelle waechst bewusst nur in z,
 * die Transporter-Front darf am Bildrand anschneiden, s. `Szene.tsx`.)
 */
export const GESPANN_BREITE = 2.2

/**
 * Parkposition neben der Rohdecke: parallel zur Traufe (laengs der x-Achse)
 * auf der z+-Seite, der Anhaenger mittig vor der Rohdecke, ausserhalb von
 * `zAussen` (0,8 m Luft). Steht auf dem Gelaende, also auf Unterkante der
 * Rohdecken-Platte.
 *
 * `drehungY = PI`: der Transporter steht auf der x−-Seite, also von der
 * iso-Kamera ([+x, +y, +z]) aus **hinten** — vorn liegt der flache Anhaenger
 * mit dem markierten Sparren, nicht der hohe Kofferaufbau.
 */
export const PARKPLATZ: { position: [number, number, number]; drehungY: number } = {
  position: [0, -MASSE.p.rohdeckeDicke, MASSE.huelle.max[2] + 0.8 + GESPANN_BREITE / 2],
  drehungY: Math.PI,
}

export type RequisitId = 'sparren' | 'anker' | 'psa' | 'werkzeug' | 'leiter'

export interface GespannProps {
  /** 0..1: wie voll der Anhaenger ist. Steuert die Zahl der Holzlagen. */
  ladung: number
  /** Ueberschreibt `ladung` je Frame (Kulisse: die Ladung folgt der Zeitachse). */
  ladungRef?: RefObject<number> | null
  /** Signal-Band auf dem obersten Sparren der Ladung. */
  deinSparren?: boolean
  /** Ueberschreibt `deinSparren` je Frame (das Stueck wandert in M7 ins Dach). */
  deinSparrenRef?: RefObject<boolean> | null
  /** B4.1-Requisiten nach Teil-Id (Buendel, Kiste, Leiter …). */
  requisiten?: readonly RequisitId[]
  reduziert?: boolean
}

// ---------------------------------------------------------------------------
// Bausteine
// ---------------------------------------------------------------------------

function Flach({
  position,
  groesse,
  farbe,
  rotation,
}: {
  position: [number, number, number]
  groesse: [number, number, number]
  farbe: string
  rotation?: [number, number, number]
}) {
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={groesse} />
      <meshStandardMaterial color={farbe} roughness={0.85} flatShading />
    </mesh>
  )
}

/** Kontaktschatten statt echter Schatten — s. Modulkopf. */
function Kontaktschatten({
  position,
  groesse,
}: {
  position: [number, number, number]
  groesse: [number, number]
}) {
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={groesse} />
      <meshBasicMaterial color="#000000" transparent opacity={0.32} depthWrite={false} />
    </mesh>
  )
}

function Raeder({
  geometrie,
  xe,
  z,
}: {
  geometrie: THREE.BufferGeometry
  xe: number[]
  z: number
}) {
  return (
    <>
      {xe.map((x) =>
        [z, -z].map((s) => (
          <group key={`${x}:${s}`} position={[x, 0.34, s]}>
            <mesh geometry={geometrie}>
              <meshStandardMaterial
                color={FAHRZEUG_FARBEN.reifen}
                roughness={0.9}
                flatShading
              />
            </mesh>
            <mesh scale={[0.55, 0.55, 1.08]} geometry={geometrie}>
              <meshStandardMaterial
                color={FAHRZEUG_FARBEN.felge}
                roughness={0.5}
                flatShading
              />
            </mesh>
          </group>
        )),
      )}
    </>
  )
}

// ---------------------------------------------------------------------------
// Ladung
// ---------------------------------------------------------------------------

const BETT_Y = 0.82
const LAGE_H = 0.23
const LAGEN = 4
const SPUREN_Z = [-0.72, -0.24, 0.24, 0.72]
const HOLZ_LAENGE = Math.round(MASSE.lS * 100) / 100

/**
 * Holzlagen auf dem Anhaenger plus das markierte Stueck obenauf. Sichtbarkeit
 * laeuft ueber Refs im `useFrame` (kein React-State je Frame): „Zuletzt
 * geladen ist zuerst gebraucht“ — die Ladung leert sich von oben.
 */
function Ladung({
  ladung,
  ladungRef,
  deinSparren = false,
  deinSparrenRef,
}: {
  ladung: number
  ladungRef?: RefObject<number> | null
  deinSparren?: boolean
  deinSparrenRef?: RefObject<boolean> | null
}) {
  const kisten = useRef<(THREE.Group | null)[]>([])
  const marke = useRef<THREE.Group>(null)

  useFrame(() => {
    const l = Math.max(0, Math.min(1, ladungRef?.current ?? ladung))
    const n = Math.round(l * LAGEN * SPUREN_Z.length)
    kisten.current.forEach((g, i) => {
      if (g) g.visible = i < n
    })
    const m = marke.current
    if (m) {
      m.visible = deinSparrenRef?.current ?? deinSparren
      const lagen = Math.ceil(n / SPUREN_Z.length)
      m.position.y = BETT_Y + lagen * LAGE_H + 0.1
    }
  })

  const boxen: ReactNode[] = []
  for (let lage = 0; lage < LAGEN; lage++) {
    SPUREN_Z.forEach((z, s) => {
      const i = lage * SPUREN_Z.length + s
      boxen.push(
        <group
          key={i}
          ref={(el) => {
            kisten.current[i] = el
          }}
          position={[0, BETT_Y + lage * LAGE_H + 0.1, z]}
        >
          <mesh>
            <boxGeometry args={[HOLZ_LAENGE, 0.2, 0.42]} />
            <meshStandardMaterial
              color={SPARREN_FARBEN[(lage + s) % SPARREN_FARBEN.length]}
              roughness={0.82}
              flatShading
            />
          </mesh>
        </group>,
      )
    })
  }

  return (
    <>
      {boxen}
      {/* Dein Sparren: das eine markierte Stueck, oben auf der Ladung. */}
      <group ref={marke} position={[0, BETT_Y + LAGEN * LAGE_H + 0.1, 0]}>
        <mesh>
          <boxGeometry args={[HOLZ_LAENGE, 0.2, 0.12]} />
          <meshStandardMaterial color={SPARREN_FARBEN[2]} roughness={0.82} flatShading />
        </mesh>
        <SparrenBand laengs={HOLZ_LAENGE * 0.38} quer={[0.14, 0.26, 0.18]} />
      </group>
    </>
  )
}

/**
 * Der Band-Look von „dein Sparren“ — ueberall derselbe: ein flacher Ring in
 * Signal-Ton quer um das Holz.
 */
export function SparrenBand({
  laengs,
  quer,
}: {
  /** Position entlang der Holzachse (lokal x). */
  laengs: number
  /** Bandmasse [dicke entlang der Achse, hoehe, breite]. */
  quer: [number, number, number]
}) {
  return (
    <mesh position={[laengs, 0, 0]}>
      <boxGeometry args={quer} />
      <meshBasicMaterial color={SIGNAL_MARKE} />
    </mesh>
  )
}

// ---------------------------------------------------------------------------
// Requisiten (B4.1)
// ---------------------------------------------------------------------------

/** Kurzer Aufstieg beim Materialisieren; `reduziert` erscheint nur. */
function Erscheinen({
  reduziert,
  children,
}: {
  reduziert: boolean
  children: ReactNode
}) {
  const gruppe = useRef<THREE.Group>(null)
  const start = useRef<number | null>(null)
  useFrame(({ clock }) => {
    const g = gruppe.current
    if (!g) return
    if (reduziert) {
      g.position.y = 0
      return
    }
    if (start.current === null) start.current = clock.elapsedTime
    const u = Math.min((clock.elapsedTime - start.current) / 0.4, 1)
    g.position.y = 0.35 * (1 - u) * (1 - u)
  })
  return <group ref={gruppe}>{children}</group>
}

/**
 * Requisiten stehen dort, wo die Kamera sie **sieht**.
 *
 * Die erste Fassung setzte sie an die anatomisch richtige Stelle — und genau
 * dort blieben sie unsichtbar (gemessen am laufenden B4.1, Bildvergleich mit
 * und ohne Teil):
 *
 * - `psa` und `werkzeug` lagen bei x = 4,95 **innerhalb** des Kofferaufbaus
 *   (der reicht von x = 4,775 bis 7,925, y = 0,45 bis 2,35) — sie steckten im
 *   Blech. Jetzt stehen sie auf dem Hof an der kamerazugewandten Flanke
 *   (z > 1,025, also ausserhalb des Aufbaus): „am Transporter“ im Wortsinn.
 * - `anker` lag mitten im Holzstapel (Ladeflaeche y = 0,82 bis 1,74 bei voller
 *   Ladung) und verschwand, sobald die Sparren-Karte angenommen war. Jetzt
 *   steht die Kiste vor dem Stapel an der Stirnwand (x > 3,43, wo kein Holz
 *   mehr liegt) und bleibt bei jeder Ladung sichtbar.
 *
 * Die Sichtlinie ist gerechnet, nicht geraten: Blickrichtung [9,5 / 5 / 8,5]
 * laesst jeden Punkt mit z >= 0 am Aufbau vorbeischauen — deshalb liegt alles
 * auf der z+-Seite. Diese Geometrie wird **nur** von `Beladen3D` (B4.1)
 * angefordert; M5 bis M8 uebergeben nie `requisiten`.
 */
function Requisit({ id }: { id: RequisitId }) {
  switch (id) {
    case 'anker':
      // Kiste mit Sparrenankern und Schrauben, vorn an der Stirnwand des
      // Anhaengers — vor dem Holz, nicht darin.
      return (
        <group position={[3.6, BETT_Y + 0.21, 0.52]}>
          <Flach
            position={[0, 0, 0]}
            groesse={[0.38, 0.42, 0.62]}
            farbe={FAHRZEUG_FARBEN.kiste}
          />
          <Flach
            position={[0, 0.23, 0]}
            groesse={[0.42, 0.05, 0.66]}
            farbe={FAHRZEUG_FARBEN.fahrgestell}
          />
        </group>
      )
    case 'psa':
      // Seitenschutz und Gurte, gebuendelt an der Flanke des Transporters.
      return (
        <group position={[5.9, 0.2, 1.3]}>
          <Flach
            position={[0, 0, 0]}
            groesse={[1.1, 0.4, 0.42]}
            farbe={FAHRZEUG_FARBEN.plane}
          />
          <Flach position={[0, 0.26, 0]} groesse={[0.5, 0.14, 0.46]} farbe="#C77A2E" />
        </group>
      )
    case 'werkzeug':
      // Werkzeugkiste am Transporter, daneben.
      return (
        <group position={[7.2, 0.24, 1.3]}>
          <Flach
            position={[0, 0, 0]}
            groesse={[0.8, 0.48, 0.5]}
            farbe={FAHRZEUG_FARBEN.fahrgestell}
          />
          <Flach position={[0, 0.27, 0]} groesse={[0.84, 0.06, 0.54]} farbe="#C77A2E" />
        </group>
      )
    case 'leiter':
      // Leiter laengs auf den Rungen des Anhaengers.
      return (
        <group position={[0.4, BETT_Y + LAGEN * LAGE_H + 0.34, 0.86]}>
          <Flach
            position={[0, 0, -0.14]}
            groesse={[3.6, 0.07, 0.07]}
            farbe={FAHRZEUG_FARBEN.leiter}
          />
          <Flach
            position={[0, 0, 0.14]}
            groesse={[3.6, 0.07, 0.07]}
            farbe={FAHRZEUG_FARBEN.leiter}
          />
          {[-1.4, -0.7, 0, 0.7, 1.4].map((x) => (
            <Flach
              key={x}
              position={[x, 0, 0]}
              groesse={[0.06, 0.05, 0.3]}
              farbe={FAHRZEUG_FARBEN.leiter}
            />
          ))}
        </group>
      )
    case 'sparren':
      // Der Holzstapel selbst — laeuft ueber `ladung`, kein eigener Anker.
      return null
  }
}

// ---------------------------------------------------------------------------
// Das Gespann
// ---------------------------------------------------------------------------

export function Gespann({
  ladung,
  ladungRef = null,
  deinSparren = false,
  deinSparrenRef = null,
  requisiten,
  reduziert = false,
}: GespannProps) {
  // Zwoelf Segmente reichen fuer die Kulissendistanz; `rotateZ` eingebacken,
  // damit die Achse quer liegt und die Meshes ohne eigene Drehung auskommen.
  const rad = useMemo(() => {
    const g = new THREE.CylinderGeometry(0.34, 0.34, 0.24, 12)
    g.rotateX(Math.PI / 2)
    return g
  }, [])
  useEffect(() => () => rad.dispose(), [rad])

  const F = FAHRZEUG_FARBEN

  return (
    <group>
      {/* ---- Anhaenger (Langholz) ---- */}
      <Flach position={[0, 0.66, 0]} groesse={[7.5, 0.14, 0.3]} farbe={F.fahrgestell} />
      <Flach position={[0, 0.78, 0]} groesse={[7.5, 0.08, 2.0]} farbe={F.fahrgestell} />
      {[-3.5, -1.2, 1.2, 3.5].map((x) =>
        [0.98, -0.98].map((z) => (
          <Flach
            key={`${x}:${z}`}
            position={[x, BETT_Y + 0.5, z]}
            groesse={[0.07, 1.0, 0.07]}
            farbe={F.rungen}
          />
        )),
      )}
      <Raeder geometrie={rad} xe={[-1.1, -2.2]} z={1.02} />
      {/* Deichsel zum Transporter. */}
      <Flach
        position={[4.3, 0.55, 0]}
        groesse={[1.3, 0.08, 0.12]}
        farbe={F.fahrgestell}
      />

      <Ladung
        ladung={ladung}
        ladungRef={ladungRef}
        deinSparren={deinSparren}
        deinSparrenRef={deinSparrenRef}
      />

      {/* ---- Transporter ---- */}
      <group position={[7.25, 0, 0]}>
        {/* Kofferaufbau hinten, Kabine und Haube vorn. */}
        <Flach position={[-0.9, 1.4, 0]} groesse={[3.15, 1.9, 2.05]} farbe={F.aufbau} />
        <Flach position={[1.35, 1.2, 0]} groesse={[1.4, 1.5, 1.95]} farbe={F.kabine} />
        <Flach position={[2.3, 0.85, 0]} groesse={[0.55, 0.8, 1.85]} farbe={F.kabine} />
        {/* Scheiben: Front und Seiten, als dunkle Flaechen leicht erhaben. */}
        <Flach position={[2.06, 1.62, 0]} groesse={[0.06, 0.6, 1.7]} farbe={F.fenster} />
        {[1.0, -1.0].map((s) => (
          <Flach
            key={s}
            position={[1.45, 1.55, s]}
            groesse={[1.0, 0.5, 0.06]}
            farbe={F.fenster}
          />
        ))}
        <Raeder geometrie={rad} xe={[-1.55, 1.6]} z={0.95} />
      </group>

      {/* ---- Requisiten (B4.1) ---- */}
      {requisiten?.map((id) => (
        <Erscheinen key={id} reduziert={reduziert}>
          <Requisit id={id} />
        </Erscheinen>
      ))}

      {/* ---- Kontaktschatten ---- */}
      <Kontaktschatten position={[0, 0.012, 0]} groesse={[7.8, 2.3]} />
      <Kontaktschatten position={[7.25, 0.012, 0]} groesse={[5.3, 2.3]} />
    </group>
  )
}

// ---------------------------------------------------------------------------
// Die Fahrt (M5)
// ---------------------------------------------------------------------------

export interface FahrtProps {
  /** 0..1 im Ref, von aussen getrieben (Aufbau-Muster: useFrame liest, React rendert nicht). */
  fortschrittRef: RefObject<number>
  ladung: number
  ladungRef?: RefObject<number> | null
  deinSparren?: boolean
  deinSparrenRef?: RefObject<boolean> | null
  reduziert: boolean
}

/**
 * Gespann auf der Anfahrtskurve. Endpunkt und Endkurs sind exakt der
 * `PARKPLATZ` (der Kontrollpunkt liegt auf der Parkachse, die Endtangente
 * zeigt also laengs +x) — bei fortschritt = 1 steht das Gespann genau da,
 * wo `Gespann` sonst geparkt wuerde.
 */
export function GespannFahrt({
  fortschrittRef,
  ladung,
  ladungRef = null,
  deinSparren = false,
  deinSparrenRef = null,
  reduziert,
}: FahrtProps) {
  const gruppe = useRef<THREE.Group>(null)
  // Endtangente laengs −x: passend zu `PARKPLATZ.drehungY = PI` faehrt das
  // Gespann von rechts (x+) ein und steht am Ende exakt auf der Parkachse.
  const kurve = useMemo(() => {
    const [px, py, pz] = PARKPLATZ.position
    return new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(px + 27, py, pz + 6),
      new THREE.Vector3(px + 10, py, pz),
      new THREE.Vector3(px, py, pz),
    )
  }, [])

  useFrame(() => {
    const g = gruppe.current
    if (!g) return
    const s = Math.max(0, Math.min(1, fortschrittRef.current))
    const p = kurve.getPointAt(s)
    const t = kurve.getTangentAt(s)
    g.position.copy(p)
    g.rotation.y = Math.atan2(-t.z, t.x)
  })

  return (
    <group
      ref={gruppe}
      position={PARKPLATZ.position}
      rotation={[0, PARKPLATZ.drehungY, 0]}
    >
      <Gespann
        ladung={ladung}
        ladungRef={ladungRef}
        deinSparren={deinSparren}
        deinSparrenRef={deinSparrenRef}
        reduziert={reduziert}
      />
    </group>
  )
}
