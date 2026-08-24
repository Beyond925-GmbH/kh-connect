import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { RISS_FARBEN, SIGNAL_MARKE, SZENE_FARBEN } from '@/dachstuhl/bauteil-texte'
import type { Huelle } from '@/dachstuhl/mass'
import { passeEin } from '@/drei/kamera'
import type { Sichtfeld } from '@/drei/kamera'
import { Gespann } from '@/drei/fahrzeug'
import { ABFAHRT_DAUER, PENDEL_AUSSCHLAG_M, PENDEL_DAEMPFUNG } from './kanon'
import { B, H, T, Tafel, TISCH_OBEN, ELEMENT_FLACH_Y, glatt } from './element'
import type { Elementlage, Elementlicht, Fensterausschnitt } from './Wandelement3D'

/**
 * Alles um das Element herum: Licht, Kamera, Halle, Baustelle, Kran und Haus.
 * Läuft ausschließlich im Lazy-Chunk hinter `Wandelement3D`.
 */

// ---------------------------------------------------------------------------
// Licht — zwei Stimmungen, beide im Dunkelzweig von SZENE_FARBEN
// ---------------------------------------------------------------------------

/**
 * `halle`: kaltes Oberlicht, tiefe Schatten. `nachmittag`: warm und weicher —
 * nicht Abendlicht, der Tag endet um vier (khpl-tag-zimmerer.md 7). Keine
 * echten Schattenkarten: die Bühne arbeitet wie `Zuschnitt3D` mit
 * Kontaktschatten-Quads, das spart auf dem iPad die halbe Füllrate.
 */
export function Licht({ licht }: { licht: Elementlicht }) {
  const kalt = licht === 'halle'
  return (
    <group>
      <ambientLight color={kalt ? '#E8EFF5' : '#FFE3C0'} intensity={kalt ? 0.5 : 0.55} />
      <hemisphereLight
        args={[
          kalt ? '#AFC3CE' : '#F2BE85',
          SZENE_FARBEN.dunkel.boden,
          kalt ? 0.5 : 0.85,
        ]}
      />
      {kalt ? (
        <directionalLight position={[1.5, 13, 1]} color="#E8F1F8" intensity={2.0} />
      ) : (
        <directionalLight position={[-9, 6, 7]} color="#FFD9A0" intensity={2.5} />
      )}
      <directionalLight
        position={[-6, 4, -7]}
        color="#FFFFFF"
        intensity={kalt ? 0.55 : 0.7}
      />
    </group>
  )
}

// ---------------------------------------------------------------------------
// Kamera — feste Blicke je Zustand, weich angefahren
// ---------------------------------------------------------------------------

export interface Blickfang {
  richtung: [number, number, number]
  huelle: Huelle
}

export function huelle(
  min: [number, number, number],
  max: [number, number, number],
): Huelle {
  return {
    min,
    max,
    mitte: [(min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2],
  }
}

/**
 * Kamerafahrt nach dem Vorbild von `Zuschnitt3D`, aber mit trägerem Nachlauf:
 * das Bewegungsgefühl dieses Tages ist **Masse** (khpl-tage.md 2), und die
 * Drehung von Draufsicht auf Untersicht bei C6 ist die visuelle Signatur des
 * ganzen Tages — sie darf nicht schnippen.
 */
export function Kamerafahrt({
  blickfang,
  sichtfeld,
  reduziert,
}: {
  blickfang: Blickfang
  sichtfeld: Sichtfeld | undefined
  reduziert: boolean
}) {
  const kamera = useThree((z) => z.camera)
  const szene = useThree((z) => z.scene)
  const breite = useThree((z) => z.size.width)
  const hoehe = useThree((z) => z.size.height)
  const sfL = sichtfeld?.links ?? 0
  const sfR = sichtfeld?.rechts ?? 0
  const sfO = sichtfeld?.oben ?? 0
  const sfU = sichtfeld?.unten ?? 0

  const lage = useMemo(() => {
    if (hoehe <= 0) return null
    return passeEin(
      { richtung: blickfang.richtung, ausschnitt: 'gesamt', beschreibung: '' },
      blickfang.huelle,
      breite / hoehe,
      { links: sfL, rechts: sfR, oben: sfO, unten: sfU },
    )
  }, [blickfang, breite, hoehe, sfL, sfR, sfO, sfU])

  const stand = useRef<{ pos: THREE.Vector3; blick: THREE.Vector3 } | null>(null)

  useFrame((_, dt) => {
    if (!lage) return
    const zielPos = new THREE.Vector3(...lage.position)
    const zielBlick = new THREE.Vector3(...lage.ziel)
    let s = stand.current
    if (!s || reduziert) {
      s = { pos: zielPos.clone(), blick: zielBlick.clone() }
      stand.current = s
    } else {
      const k = 1 - Math.exp(-Math.min(dt, 0.1) * 2.6)
      s.pos.lerp(zielPos, k)
      s.blick.lerp(zielBlick, k)
    }
    kamera.position.copy(s.pos)
    kamera.lookAt(s.blick)
    kamera.updateProjectionMatrix()

    // Der Dunst folgt der Kamera — Hallentiefe, ohne das Motiv einzugrauen.
    if (szene.fog instanceof THREE.Fog) {
      const dist = s.pos.distanceTo(s.blick)
      szene.fog.near = dist + 3
      szene.fog.far = dist + 30
    }
  })

  return null
}

// ---------------------------------------------------------------------------
// Requisiten
// ---------------------------------------------------------------------------

function Kontaktschatten({
  position,
  groesse,
  staerke = 0.28,
}: {
  position: [number, number, number]
  groesse: [number, number]
  staerke?: number
}) {
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={groesse} />
      <meshBasicMaterial
        color="#000000"
        transparent
        opacity={staerke}
        depthWrite={false}
      />
    </mesh>
  )
}

/**
 * Die Halle: Boden, Abbundtisch, Stützenreihen im Dunst. `mitAuflage` legt die
 * beiden Kanthölzer unter das schwebende Ständerwerk — in der Praxis liegt ein
 * Rahmen nie direkt auf der Tischplatte.
 */
export function Halle({ mitAuflage = false }: { mitAuflage?: boolean }) {
  const beine: [number, number][] = [
    [-4.2, -1.5],
    [-4.2, 1.5],
    [0, -1.5],
    [0, 1.5],
    [4.2, -1.5],
    [4.2, 1.5],
  ]
  return (
    <group>
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[90, 50]} />
        <meshStandardMaterial color={SZENE_FARBEN.dunkel.boden} roughness={1} />
      </mesh>
      {/* Abbundtisch */}
      <mesh position={[0, TISCH_OBEN - 0.06, 0]}>
        <boxGeometry args={[9.4, 0.12, 3.8]} />
        <meshStandardMaterial color="#4A4E54" roughness={0.8} flatShading />
      </mesh>
      {beine.map(([x, z]) => (
        <mesh key={`${x}:${z}`} position={[x, (TISCH_OBEN - 0.12) / 2, z]}>
          <boxGeometry args={[0.14, TISCH_OBEN - 0.12, 0.14]} />
          <meshStandardMaterial color="#3C4046" roughness={0.8} flatShading />
        </mesh>
      ))}
      <Kontaktschatten position={[0, 0.012, 0]} groesse={[9.8, 4.1]} />
      {mitAuflage &&
        [-3, 3].map((x) => (
          <mesh key={x} position={[x, TISCH_OBEN + 0.08, -1.5]}>
            <boxGeometry args={[0.14, 0.16, 3.3]} />
            <meshStandardMaterial color="#8A6B44" roughness={0.85} flatShading />
          </mesh>
        ))}
      {/* Hallenstützen — Tiefe, die im Dunst versinkt */}
      {[-7, 7].map((z) =>
        [-9, -3, 3, 9].map((x) => (
          <mesh key={`${x}:${z}`} position={[x, 3, z]}>
            <boxGeometry args={[0.35, 6, 0.35]} />
            <meshStandardMaterial color="#3A342C" roughness={0.9} flatShading />
          </mesh>
        )),
      )}
    </group>
  )
}

/** Die Wandachse auf der Bodenplatte — hier steht das Element am Ende. */
export const WANDACHSE_Z = 1.3

/** Die Baustelle: Gelände, Bodenplatte, auf Wunsch die Zielmarkierung. */
export function Baustelle({ zielMarke = false }: { zielMarke?: boolean }) {
  return (
    <group>
      <mesh position={[0, -0.29, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[90, 60]} />
        <meshStandardMaterial color={SZENE_FARBEN.dunkel.boden} roughness={1} />
      </mesh>
      <mesh position={[0, -0.14, WANDACHSE_Z - 3.2]}>
        <boxGeometry args={[9.4, 0.28, 7.4]} />
        <meshStandardMaterial color="#B5AFA6" roughness={0.95} flatShading />
      </mesh>
      <Kontaktschatten position={[0, -0.27, WANDACHSE_Z - 3.2]} groesse={[10, 8]} />
      {zielMarke && (
        <group position={[0, 0.012, WANDACHSE_Z - T / 2]}>
          {(
            [
              [0, -0.22, B + 0.3, 0.05],
              [0, 0.22, B + 0.3, 0.05],
              [-B / 2 - 0.13, 0, 0.05, 0.5],
              [B / 2 + 0.13, 0, 0.05, 0.5],
            ] as const
          ).map(([x, z, dx, dz], i) => (
            <mesh key={i} position={[x, 0, z]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[dx, dz]} />
              <meshBasicMaterial
                color={SIGNAL_MARKE}
                transparent
                opacity={0.55}
                depthWrite={false}
              />
            </mesh>
          ))}
        </group>
      )}
    </group>
  )
}

// ---------------------------------------------------------------------------
// C5 — Verladen und Abfahrt
// ---------------------------------------------------------------------------

/**
 * Das Gespann mit dem hochkant verladenen Element. `abfahrt` fährt es aus der
 * Halle; der Blick bleibt zurück (die Kamera hängt an der Halle, nicht am
 * Fahrzeug). `prefers-reduced-motion`: es ist sofort fort.
 */
export function Verladung({
  ausschnitt,
  marke,
  abfahrt = false,
  onAbfahrtEnde,
  reduziert,
}: {
  ausschnitt: Fensterausschnitt
  marke: boolean
  abfahrt?: boolean
  onAbfahrtEnde?: () => void
  reduziert: boolean
}) {
  const fuhre = useRef<THREE.Group>(null)
  const start = useRef<number | null>(null)
  const gemeldet = useRef(false)
  const melder = useRef(onAbfahrtEnde)
  useEffect(() => {
    melder.current = onAbfahrtEnde
  })

  useFrame(({ clock }) => {
    const g = fuhre.current
    if (!g) return
    if (!abfahrt) {
      start.current = null
      g.position.set(0, 0, 0)
      g.rotation.y = 0
      g.visible = true
      return
    }
    let u = 1
    if (!reduziert) {
      if (start.current === null) start.current = clock.elapsedTime
      u = Math.min((clock.elapsedTime - start.current) / ABFAHRT_DAUER, 1)
    }
    // Anfahren mit Masse: langsam los, dann in den Dunst.
    const s = u * u
    g.position.x = s * 30
    g.position.z = s * -2.5
    g.rotation.y = -s * 0.12
    g.visible = u < 1
    if (u >= 1 && !gemeldet.current) {
      gemeldet.current = true
      melder.current?.()
    }
  })

  return (
    <group ref={fuhre}>
      <Gespann ladung={0} reduziert={reduziert} />
      {/* Das Element steht hochkant zwischen den Rungen des Anhängers */}
      <group position={[-0.4, 0.92, 0]}>
        <Tafel ausschnitt={ausschnitt} marke={marke} />
      </group>
    </group>
  )
}

// ---------------------------------------------------------------------------
// C6 — der Kran: anhalten (Beat 1) und einweisen (Beat 2)
// ---------------------------------------------------------------------------

/** Was der Wrapper der Szene imperativ sagen kann: „der Besucher hat getippt“. */
export interface HakenSteuerung {
  halteAn: () => void
}

/** Zieh-Eingabe des Wrappers in Pixeln, wird je Frame konsumiert. */
export interface ZugEingabe {
  dx: number
  dy: number
}

const SEIL_L = 2.6
const PX_JE_M = 0.011
/** Höhe der Elementunterkante, wenn es auf der Bodenplatte steht. */
const ABGESETZT_Y = 0.02
/** Schwebehöhe in Beat 1 — das Element hängt und wartet auf seine Lage. */
const SCHWEBE_Y = 2.3
/**
 * Wie träge die Last der Hakenlage folgt. Das ist das **Bewegungsgefühl Masse**
 * (khpl-tage.md 2): der Wechsel von Beat 1 auf Beat 2 versetzt das Ziel um rund
 * 1,4 m seitlich — ungefiltert wäre das ein Sprung in einem einzigen Frame, kein
 * Fahren. Die Pendelphysik hängt an derselben Größe und würde von einem Sprung
 * sofort in die Klemmung geschlagen.
 */
const HAKEN_NACHLAUF = 5

function naechsteHalbe(winkel: number, geradzahlig: boolean): number {
  // Nächstes Vielfaches von π mit passender Parität (gerade = 0, 2π, …).
  const k = Math.round(winkel / Math.PI)
  const passt = ((k % 2) + 2) % 2 === (geradzahlig ? 0 : 1)
  if (passt) return k * Math.PI
  const a = (k - 1) * Math.PI
  const b = (k + 1) * Math.PI
  return Math.abs(winkel - a) <= Math.abs(winkel - b) ? a : b
}

/**
 * Das Element am Haken. Beat 1: es dreht sich langsam durch alle vier Lagen
 * (Gieren = welche Seite nach außen, Rollen = wo ist oben); ein Tap hält es an
 * und meldet die nächstliegende Lage. Beat 2: Pendelphysik im Frame-Loop —
 * Trägheit, Nachlauf, Ausschwingen. Kein `motion`-Spring: die Last hängt in
 * der Szene, nicht im DOM (khpl-tag-zimmerer.md 6, C6).
 *
 * `abgesetzt` ist der dritte Zustand und **kein Beat**: das Element steht schon.
 * Ohne ihn hinge es beim Wiedereinstieg wieder 2,3 m über der Bodenplatte,
 * während Panel und Fuß „Element sitzt“ sagen — derselbe Fall, den `holzGefunden`
 * in C1 löst.
 */
export function AmHaken({
  lage,
  onLage,
  einweisen = false,
  abgesetzt = false,
  onAbgesetzt,
  ausschnitt,
  marke,
  steuerung,
  eingabe,
  reduziert,
}: {
  lage?: Elementlage | null
  onLage?: (lage: Elementlage) => void
  einweisen?: boolean
  abgesetzt?: boolean
  onAbgesetzt?: () => void
  ausschnitt: Fensterausschnitt
  marke: boolean
  steuerung: React.RefObject<HakenSteuerung | null>
  eingabe: React.RefObject<ZugEingabe>
  reduziert: boolean
}) {
  const aussen = useRef<THREE.Group>(null)
  const pendel = useRef<THREE.Group>(null)
  const dreher = useRef<THREE.Group>(null)
  const seil = useRef<THREE.Mesh>(null)

  // Die beiden Achsen koppeln: Rx(π) (Rollen) spiegelt neben oben/unten auch
  // vorn/hinten. Sichtbar ist die Holzfaserseite genau dann, wenn Gieren und
  // Rollen **dieselbe** Parität haben — Melde- und Ziel-Mapping unten rechnen
  // deshalb mit dem Paritätsvergleich, nie mit psi allein.
  // Nur der Wert beim Mount zählt — `useRef` behält die erste Belegung. Genau
  // das ist hier gewollt: wer über „Dein Weg“ in ein gelöstes C6 zurückkommt,
  // findet das Element stehend vor, nicht am Haken.
  const z = useRef({
    psi: abgesetzt ? 0 : 0.6, // Gieren; Parität(psi) == Parität(phi) = Holzfaser nach außen
    phi: abgesetzt ? 0 : Math.PI, // Rollen; 0 = Rähm oben — es hängt zunächst falsch herum
    flipVon: Math.PI,
    flipStart: -10,
    naechsterFlip: 4,
    schnapp: null as { psi: number; phi: number; seit: number } | null,
    hx: abgesetzt ? 0 : 1.4,
    hy: abgesetzt ? ABGESETZT_Y : 1.7, // Zielhöhe der Elementunterkante beim Einweisen
    theta: 0,
    thetaV: 0,
    hxAlt: null as number | null,
    // Die geglättete Hakenlage. Im ersten Frame rastet sie auf das Ziel ein,
    // statt aus dem Nichts heranzufahren.
    rx: 0,
    ry: 0,
    rGesetzt: false,
    // Vorbelegt: die Absetz-Blende ist längst durchgelaufen (`u >= 1`), das
    // Element liegt auf, und gemeldet wurde es in der Sitzung davor.
    setztSeit: abgesetzt ? -100 : (null as number | null),
    abgemeldet: abgesetzt,
  })

  const melder = useRef({ onLage, onAbgesetzt })
  useEffect(() => {
    melder.current = { onLage, onAbgesetzt }
  })

  // Der Wrapper meldet Taps hierher — Beat 1: anhalten.
  useEffect(() => {
    steuerung.current = {
      halteAn: () => {
        const s = z.current
        const psi = naechsteHalbe(s.psi, Math.round(s.psi / Math.PI) % 2 === 0)
        const phi = naechsteHalbe(s.phi, Math.round(s.phi / Math.PI) % 2 === 0)
        s.schnapp = { psi, phi, seit: performance.now() / 1000 }
        const gieren = ((Math.round(psi / Math.PI) % 2) + 2) % 2
        const rollen = ((Math.round(phi / Math.PI) % 2) + 2) % 2
        melder.current.onLage?.({
          // Gleiche Parität = Holzfaser sichtbar (siehe Kopplung oben).
          aussenseite: gieren === rollen ? 'holzfaser' : 'beplankung',
          oben: rollen === 0 ? 'raehm' : 'schwelle',
        })
      },
    }
    return () => {
      steuerung.current = null
    }
  }, [steuerung])

  // Ein richtig gewähltes `lage` übernimmt; ein zurückgesetztes lässt das
  // Element „zurück in die Luft“ drehen (der Schnapp verfällt nach einer
  // Denkpause wieder).
  const vorigeLage = useRef<Elementlage | null | undefined>(lage)
  useEffect(() => {
    if (vorigeLage.current != null && lage == null) z.current.schnapp = null
    if (lage != null) z.current.schnapp = null
    vorigeLage.current = lage
  }, [lage])

  useFrame(({ clock }, roheDt) => {
    const s = z.current
    const dt = Math.min(roheDt, 0.05)
    const t = clock.elapsedTime

    // ---- Zieleingabe (Beat 2) konsumieren --------------------------------
    if (einweisen) {
      const e = eingabe.current
      s.hx = Math.max(-3, Math.min(3, s.hx + e.dx * PX_JE_M))
      s.hy = Math.max(0.15, Math.min(2.6, s.hy - e.dy * PX_JE_M))
      e.dx = 0
      e.dy = 0
    }

    // ---- Drehlage --------------------------------------------------------
    let zielPsi: number | null = null
    let zielPhi: number | null = null
    if (lage != null || einweisen) {
      const l = lage ?? { aussenseite: 'holzfaser' as const, oben: 'raehm' as const }
      // Rollen bestimmt oben; Gieren muss die Spiegelung des Rollens
      // mitrechnen: Holzfaser außen braucht gleiche Parität beider Achsen.
      zielPhi = naechsteHalbe(s.phi, l.oben === 'raehm')
      zielPsi = naechsteHalbe(
        s.psi,
        (l.aussenseite === 'holzfaser') === (l.oben === 'raehm'),
      )
    } else if (s.schnapp) {
      zielPsi = s.schnapp.psi
      zielPhi = s.schnapp.phi
      // Nach der Denkpause ohne Antwort des Steps: weiterdrehen.
      if (performance.now() / 1000 - s.schnapp.seit > 1.6) s.schnapp = null
    }

    if (zielPsi !== null && zielPhi !== null) {
      const k = reduziert ? 1 : 1 - Math.exp(-dt * 7)
      s.psi += (zielPsi - s.psi) * k
      s.phi += (zielPhi - s.phi) * k
    } else if (abgesetzt) {
      // Steht. Eine Wand auf der Bodenplatte dreht sich nicht mehr.
    } else if (reduziert) {
      // Ohne Animation: alle 2,2 s die nächste der vier Lagen, ohne Drehweg.
      const schritt = Math.floor(t / 2.2)
      s.psi = (schritt % 2) * Math.PI
      s.phi = (Math.floor(schritt / 2) % 2) * Math.PI
    } else {
      s.psi += dt * 0.45
      if (t > s.naechsterFlip) {
        s.flipVon = s.phi
        s.flipStart = t
        s.naechsterFlip = t + 4.4
      }
      // Jeder Flip addiert genau π aufs Rollen — weich, nicht taumelnd.
      s.phi = s.flipVon + Math.PI * glatt((t - s.flipStart) / 1.1)
    }

    // ---- Höhe und Pendel -------------------------------------------------
    // Ziel und gezeigte Lage sind zweierlei: der Beat-Wechsel versetzt das Ziel
    // in einem Frame, die Last fährt mit Nachlauf hinterher.
    const zielY = einweisen ? s.hy : abgesetzt ? ABGESETZT_Y : SCHWEBE_Y
    const zielX = einweisen ? s.hx : abgesetzt ? 0 : Math.sin(t * 0.5) * 0.12
    if (!s.rGesetzt) {
      s.rGesetzt = true
      s.rx = zielX
      s.ry = zielY
    }
    const kHaken = reduziert ? 1 : 1 - Math.exp(-dt * HAKEN_NACHLAUF)
    s.rx += (zielX - s.rx) * kHaken
    s.ry += (zielY - s.ry) * kHaken
    const bodenY = s.ry
    const hookX = s.rx

    if (reduziert) {
      s.theta = 0
      s.thetaV = 0
    } else {
      // Pendel um den Anschlagpunkt: die Hakenbewegung regt an, die
      // Schwerkraft stellt zurück, `PENDEL_DAEMPFUNG` schluckt. Zu schnell
      // gezogen, und die Last schwingt über das Ziel hinaus.
      const hookV = s.hxAlt === null ? 0 : (hookX - s.hxAlt) / Math.max(dt, 0.001)
      s.hxAlt = hookX
      const a = (-9.81 * s.theta - hookV * 1.2) / SEIL_L - s.thetaV * PENDEL_DAEMPFUNG * 2
      s.thetaV += a * dt
      s.theta += s.thetaV * dt
      const maxTheta = PENDEL_AUSSCHLAG_M / SEIL_L
      s.theta = Math.max(-maxTheta, Math.min(maxTheta, s.theta))
    }

    // ---- Absetzen --------------------------------------------------------
    const unterkanteX = hookX - Math.sin(s.theta) * H
    let y = bodenY
    if (einweisen && s.setztSeit === null) {
      const ruhig = Math.abs(s.thetaV) < 0.25 || reduziert
      if (Math.abs(unterkanteX) < 0.2 && bodenY < 0.45 && ruhig) s.setztSeit = t
    }
    if (s.setztSeit !== null) {
      const u = reduziert ? 1 : glatt((t - s.setztSeit) / 0.8)
      y = bodenY * (1 - u) + ABGESETZT_Y * u
      s.hx += (0 - s.hx) * (reduziert ? 1 : 1 - Math.exp(-dt * 4))
      s.theta *= 1 - u
      if (u >= 1 && !s.abgemeldet) {
        s.abgemeldet = true
        melder.current.onAbgesetzt?.()
      }
    }

    // ---- In die Szene schreiben -----------------------------------------
    const a = aussen.current
    if (a) a.position.set(hookX, y + H + 0.1, WANDACHSE_Z)
    const p = pendel.current
    if (p) p.rotation.z = s.theta
    const d = dreher.current
    if (d) d.rotation.set(s.phi, s.psi, 0)
    const seilMesh = seil.current
    if (seilMesh) {
      const oben = 9.2
      const len = Math.max(oben - (y + H) - 0.5, 0.3)
      seilMesh.scale.y = len
      seilMesh.position.y = 0.5 + len / 2
    }
  })

  return (
    <group
      ref={aussen}
      position={[0, (abgesetzt ? ABGESETZT_Y : SCHWEBE_Y) + H + 0.1, WANDACHSE_Z]}
    >
      {/* Kranseil und Unterflasche — der Kran selbst bleibt aus dem Bild */}
      <mesh ref={seil} position={[0, 2, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 1, 6]} />
        <meshStandardMaterial color="#5A5E64" roughness={0.6} flatShading />
      </mesh>
      <mesh position={[0, 0.42, 0]}>
        <boxGeometry args={[0.28, 0.34, 0.18]} />
        <meshStandardMaterial color="#4A4E54" roughness={0.7} flatShading />
      </mesh>
      <group ref={pendel}>
        {/* Traverse und zwei Anschlagmittel zu den Elementecken */}
        <mesh position={[0, 0.16, 0]}>
          <boxGeometry args={[3.2, 0.1, 0.12]} />
          <meshStandardMaterial color="#C77A2E" roughness={0.7} flatShading />
        </mesh>
        {[-1.5, 1.5].map((x) => (
          <mesh
            key={x}
            position={[x * 0.9, 0.05, 0]}
            rotation={[0, 0, x > 0 ? -0.25 : 0.25]}
          >
            <cylinderGeometry args={[0.015, 0.015, 0.42, 6]} />
            <meshStandardMaterial color="#23262A" roughness={0.8} flatShading />
          </mesh>
        ))}
        <group ref={dreher} position={[0, -H / 2 - 0.1, 0]}>
          <group position={[0, -H / 2, T / 2]}>
            <Tafel ausschnitt={ausschnitt} marke={marke} />
          </group>
        </group>
      </group>
    </group>
  )
}

/** Der schwache Geist des Ziels: wo die Wand hin soll. */
export function Zielgeist() {
  return (
    <mesh position={[0, H / 2, WANDACHSE_Z - T / 2]}>
      <planeGeometry args={[B, H]} />
      <meshBasicMaterial
        color={RISS_FARBEN.kante}
        transparent
        opacity={0.07}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

// ---------------------------------------------------------------------------
// C7 — das Haus
// ---------------------------------------------------------------------------

const HAUS_TIEFE = 6

/**
 * Die Westwand eines Hauses — deine, mit deinem Fenster. Die übrigen Wände
 * hat die Halle gebaut; die Balkenlage liegt auf dem Rähm (deshalb war in C6
 * „oben“ die Rähmkante).
 */
export function Haus({
  ausschnitt,
  marke,
}: {
  ausschnitt: Fensterausschnitt
  marke: boolean
}) {
  const wand = '#A8814A'
  const balken: number[] = []
  for (let x = -B / 2 + 0.65; x < B / 2 - 0.3; x += 1.25) balken.push(x)
  return (
    <group>
      {/* Deine Wand, außen zur Straße */}
      <group position={[0, 0, WANDACHSE_Z]}>
        <Tafel ausschnitt={ausschnitt} marke={marke} />
      </group>
      {/* Rückwand und Giebelseiten — dieselbe Bauart, ohne dein Fenster */}
      <mesh position={[0, H / 2, WANDACHSE_Z - HAUS_TIEFE]}>
        <boxGeometry args={[B, H, T]} />
        <meshStandardMaterial color={wand} roughness={0.85} flatShading />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[(s * (B - T)) / 2, H / 2, WANDACHSE_Z - HAUS_TIEFE / 2]}>
          <boxGeometry args={[T, H, HAUS_TIEFE - T]} />
          <meshStandardMaterial color={wand} roughness={0.85} flatShading />
        </mesh>
      ))}
      {/* Balkenlage auf dem Rähm */}
      {balken.map((x) => (
        <mesh key={x} position={[x, H + 0.09, WANDACHSE_Z - HAUS_TIEFE / 2]}>
          <boxGeometry args={[0.12, 0.22, HAUS_TIEFE + 0.5]} />
          <meshStandardMaterial color="#94623A" roughness={0.85} flatShading />
        </mesh>
      ))}
    </group>
  )
}

// ---------------------------------------------------------------------------
// Bereitmeldung — zwei gezeichnete Frames, dann weiß es das DOM
// ---------------------------------------------------------------------------

export function Bereitmeldung({ onBereit }: { onBereit?: () => void }) {
  const frames = useRef(0)
  const gemeldet = useRef(false)
  useFrame(() => {
    if (gemeldet.current) return
    frames.current += 1
    if (frames.current >= 2) {
      gemeldet.current = true
      onBereit?.()
    }
  })
  return null
}

/**
 * Legt eine stehend gebaute Element-Baugruppe flach auf den Abbundtisch:
 * außen zeigt nach oben, die Schwellenkante liegt auf der Drehachse.
 */
export function FlachAufDemTisch({ children }: { children: React.ReactNode }) {
  return (
    <group position={[0, ELEMENT_FLACH_Y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      {children}
    </group>
  )
}
