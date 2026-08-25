import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent, RefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { STANDARD_PARAMETER } from '@/dachstuhl/parameter'
import {
  ABDUNKLUNG_ANTEIL,
  ABDUNKLUNG_ZIEL,
  AUSWAHL_EMISSIV,
  RISS_FARBEN,
  SPARREN_FARBEN,
  SZENE_FARBEN,
} from '@/dachstuhl/bauteil-texte'
import { keil, versatz } from '@/dachstuhl/schnitt'
import { Gespann, SparrenBand } from '@/drei/fahrzeug'
import { FOV, passeEin } from '@/drei/kamera'
import type { Huelle } from '@/dachstuhl/mass'
import { useSichtfeld } from '@/khpl/shell/SichtfeldKontext'
import { Hallenlicht } from '@/khpl/buehne/Hallenlicht'

/**
 * Die M4-Werkstatt: ein Balken auf zwei Böcken auf dem Hof, feste
 * Seitenkamera, nebel-minimale Umgebung. Die bewährte M4-Mechanik (Ein-Achsen-
 * Drag, drei Winkel, Toleranz) bleibt im Step — hier lebt nur die Bühne.
 *
 * **Framing:** Die Kamera rahmt nicht den ganzen Balken, sondern das
 * **Schnittfenster** — die letzten zwei Meter des Rohlings plus je 0,5 m Luft.
 * Der Balkenanfang läuft links aus dem Bild, wie ein reales Werkstück, das
 * länger ist als der Blick. Nur so sind Toleranzfenster (±30 mm) und
 * Winkel-Versätze auf dem iPad lesbar.
 *
 * **Drag:** fester Gain von 4 mm je Pixel, projektionsunabhängig; Greifen
 * überall auf der Bühne, 10-mm-Raster; das endgültige Klemmen auf MIN..MAX
 * macht der Step in `onLaenge`.
 *
 * **Lazy-Grenze** wie `Dachstuhl3D`: nur über `lazy(() => import(...))`
 * einbinden, keine Wert-Exporte neben der Default-Komponente.
 */

export interface Zuschnitt3DProps {
  /** Alles in Millimetern, ENTLANG DER UNTERKANTE (wie `lS` in `mass.ts`). */
  rohMm: number
  /** Aktuelle Schnittposition (Unterkante). */
  laengeMm: number
  /** Gewählter Firstwinkel — kippt die Schnittebene. `null` = noch keiner. */
  winkel: 30 | 45 | 60 | null
  /** 'einstellen' → Drag aktiv; 'saegen' → Schnittanimation;
   *  'verladen' → der Sparren hebt auf den Anhänger; 'fertig' → Endbild. */
  phase: 'einstellen' | 'saegen' | 'verladen' | 'fertig'
  /** Ein-Achsen-Drag auf der Bühne: liefert die neue Länge (10-mm-Raster). */
  onLaenge?: (mm: number) => void
  onSaegenEnde?: () => void
  onVerladenEnde?: () => void
}

const Q = STANDARD_PARAMETER.q.sparren
const BOCK_H = 0.75
/** Drag-Gain: 4 mm Balkenlänge je Pixel Fingerweg. */
const GAIN_MM_JE_PX = 4
/** Wo das Gespann im Finale steht (Ursprung = Mitte Anhänger-Ladefläche). */
const GESPANN_Z = -1.35

const FARBE_TEIL = SPARREN_FARBEN[0]
const FARBE_VERSCHNITT = (() => {
  const c = new THREE.Color(SPARREN_FARBEN[0])
  c.lerp(new THREE.Color(ABDUNKLUNG_ZIEL), ABDUNKLUNG_ANTEIL)
  return `#${c.getHexString()}`
})()

// ---------------------------------------------------------------------------
// Kamera: feste Seitenansicht, per `passeEin` auf das Fenster gerechnet.
// ---------------------------------------------------------------------------

const PRESET = {
  richtung: [0, 0.16, 1] as [number, number, number],
  ausschnitt: 'gesamt' as const,
  beschreibung: 'Seitenblick auf das Schnittfenster',
}

function Kamerafahrt({ huelle, reduziert }: { huelle: Huelle; reduziert: boolean }) {
  const kamera = useThree((z) => z.camera)
  const szene = useThree((z) => z.scene)
  const breite = useThree((z) => z.size.width)
  const hoehe = useThree((z) => z.size.height)
  // `'roh'`: nur die echte Panelkante, ohne den `LUFT`-Sicherheitsstreifen.
  // Der gleicht die zu knappe *Dachstuhl*-Hülle aus — die Hüllen hier sind
  // exakt gerechnet, und mit Streifen schrumpfte das Schnittfenster quer auf
  // gut die Hälfte und klebte am Panel (`RAND` in `passeEin` reicht als Luft).
  const sichtfeld = useSichtfeld('roh')
  const sfL = sichtfeld?.links ?? 0
  const sfR = sichtfeld?.rechts ?? 0
  const sfO = sichtfeld?.oben ?? 0
  const sfU = sichtfeld?.unten ?? 0

  const lage = useMemo(() => {
    if (hoehe <= 0) return null
    return passeEin(PRESET, huelle, breite / hoehe, {
      links: sfL,
      rechts: sfR,
      oben: sfO,
      unten: sfU,
    })
  }, [huelle, breite, hoehe, sfL, sfR, sfO, sfU])

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
      // Weiten der Hülle (Verladen) als weiche Fahrt, ~0,8 s.
      const k = 1 - Math.exp(-Math.min(dt, 0.1) * 5)
      s.pos.lerp(zielPos, k)
      s.blick.lerp(zielBlick, k)
    }
    kamera.position.copy(s.pos)
    kamera.lookAt(s.blick)
    kamera.updateProjectionMatrix()

    // Der Nebel folgt der Kamera, statt fest zu stehen. Mit dem echten
    // M4-Panel bleibt der Bühne nur die halbe Breite — `passeEin` schiebt die
    // Kamera für das Verladen-Finale dann gut 35 m hinaus, und ein fester
    // Nebel (12–42 m) verschluckte Balken und Gespann vollständig. Jetzt
    // beginnt er immer erst hinter dem Motiv.
    if (szene.fog instanceof THREE.Fog) {
      const dist = s.pos.distanceTo(s.blick)
      szene.fog.near = dist + 3
      szene.fog.far = dist + 30
    }
  })

  return null
}

// ---------------------------------------------------------------------------
// Der DOM-Griff folgt der unteren Schnittecke — Projektion im useFrame,
// per ref ins Div geschrieben, kein React-State pro Frame.
// ---------------------------------------------------------------------------

function GriffProjektion({
  ziel,
  el,
}: {
  ziel: [number, number, number]
  el: RefObject<HTMLDivElement | null>
}) {
  const v = useMemo(() => new THREE.Vector3(), [])
  useFrame(({ camera, size }) => {
    const d = el.current
    if (!d) return
    v.set(...ziel).project(camera)
    const x = ((v.x + 1) / 2) * size.width
    const y = ((1 - v.y) / 2) * size.height
    // Der Griff hängt *unter* der Schnittecke statt auf ihr: mittig zentriert
    // deckte der 48-px-Punkt die Schnittlinie samt Kippwinkel komplett ab.
    // So sitzt er wie ein Schieberegler-Daumen am Ende der Maßlinie.
    d.style.transform = `translate(${x}px, ${y}px) translate(-50%, 6px)`
  })
  return null
}

// ---------------------------------------------------------------------------
// Requisiten
// ---------------------------------------------------------------------------

function Bock({ x }: { x: number }) {
  const beine = [-0.35, 0.35]
  return (
    <group position={[x, 0, 0]}>
      <mesh position={[0, BOCK_H - 0.05, 0]}>
        <boxGeometry args={[0.9, 0.1, 0.12]} />
        <meshStandardMaterial color="#6E4A28" roughness={0.85} flatShading />
      </mesh>
      {beine.map((dx) =>
        [-0.28, 0.28].map((dz) => (
          <mesh
            key={`${dx}:${dz}`}
            position={[dx, (BOCK_H - 0.1) / 2, dz / 2]}
            rotation={[dz > 0 ? -0.32 : 0.32, 0, 0]}
          >
            <boxGeometry args={[0.09, BOCK_H - 0.08, 0.06]} />
            <meshStandardMaterial color="#5E3F22" roughness={0.85} flatShading />
          </mesh>
        )),
      )}
      <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.1, 0.9]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={0.28}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

// ---------------------------------------------------------------------------
// Sägen und Verladen: reine Gruppen-Transformationen im useFrame.
// ---------------------------------------------------------------------------

function Saege({
  laenge,
  winkel,
  verschnitt,
  reduziert,
  onFertig,
}: {
  laenge: number
  winkel: number | null
  verschnitt: RefObject<THREE.Group | null>
  reduziert: boolean
  onFertig: () => void
}) {
  const blatt = useRef<THREE.Mesh>(null)
  const start = useRef<number | null>(null)
  const basis = useRef<THREE.Vector3 | null>(null)
  const gemeldet = useRef(false)
  const grad = 90 - (winkel ?? 90)

  const fertig = useCallback(() => {
    if (gemeldet.current) return
    gemeldet.current = true
    onFertig()
  }, [onFertig])

  useEffect(() => {
    if (!reduziert) return
    // Reduzierte Bewegung: der Verschnitt verschwindet ohne Parabel.
    const v = verschnitt.current
    if (v) v.visible = false
    fertig()
  }, [reduziert, verschnitt, fertig])

  useFrame(({ clock }) => {
    if (reduziert) return
    if (start.current === null) start.current = clock.elapsedTime
    const u = (clock.elapsedTime - start.current) / 2.2
    const b = blatt.current
    const schnittU = Math.min(u / 0.55, 1)
    if (b) {
      // Das Blatt fährt quer durch den Balken.
      b.visible = u < 0.6
      b.position.z = 0.28 - schnittU * 0.56
    }
    const v = verschnitt.current
    if (v && u >= 0.5) {
      // Wurfparabel + Drehung um den eigenen Schwerpunkt; Blende, sobald das
      // Holz unter dem Boden liegt.
      if (!basis.current) basis.current = v.position.clone()
      const tau = (u - 0.5) * 2.2
      const dy = -4.9 * tau * tau * 0.35
      v.position.set(basis.current.x + 0.25 * tau, basis.current.y + dy, basis.current.z)
      v.rotation.z = -0.9 * tau
      if (dy < -1.3) v.visible = false
    }
    if (u >= 1) fertig()
  })

  return (
    <mesh
      ref={blatt}
      position={[laenge, BOCK_H + Q.h / 2, 0]}
      rotation={[0, 0, (-grad * Math.PI) / 180]}
    >
      <boxGeometry args={[0.012, Q.h + 0.18, 0.05]} />
      <meshBasicMaterial color="#E8EBEE" />
    </mesh>
  )
}

function Verladen({
  teil,
  von,
  nach,
  reduziert,
  onFertig,
}: {
  teil: RefObject<THREE.Group | null>
  von: [number, number, number]
  nach: [number, number, number]
  reduziert: boolean
  onFertig: () => void
}) {
  const start = useRef<number | null>(null)
  const gemeldet = useRef(false)

  const fertig = useCallback(() => {
    if (gemeldet.current) return
    gemeldet.current = true
    onFertig()
  }, [onFertig])

  useEffect(() => {
    if (!reduziert) return
    const g = teil.current
    if (g) g.position.set(...nach)
    fertig()
  }, [reduziert, teil, nach, fertig])

  useFrame(({ clock }) => {
    if (reduziert) return
    const g = teil.current
    if (!g) return
    if (start.current === null) start.current = clock.elapsedTime
    const u = Math.min((clock.elapsedTime - start.current) / 1.6, 1)
    const s = u * u * (3 - 2 * u)
    g.position.set(
      von[0] + (nach[0] - von[0]) * s,
      von[1] + (nach[1] - von[1]) * s + Math.sin(Math.PI * s) * 1.1,
      von[2] + (nach[2] - von[2]) * s,
    )
    if (u >= 1) fertig()
  })

  return null
}

// ---------------------------------------------------------------------------
// Die Szene
// ---------------------------------------------------------------------------

function Werkstatt({
  rohMm,
  laengeMm,
  winkel,
  phase,
  onSaegenEnde,
  onVerladenEnde,
  griffEl,
  reduziert,
}: Zuschnitt3DProps & {
  griffEl: RefObject<HTMLDivElement | null>
  reduziert: boolean
}) {
  const roh = rohMm / 1000
  const laenge = laengeMm / 1000
  const d = winkel === null ? 0 : versatz(winkel, Q.h)
  const y0 = BOCK_H

  // Drei Winkel → drei Keile, einmal gebaut, `dispose` beim Unmount.
  const keile = useMemo(
    () =>
      new Map<number, THREE.BufferGeometry>([
        [30, keil(30, Q.h, Q.b)],
        [45, keil(45, Q.h, Q.b)],
        [60, keil(60, Q.h, Q.b)],
      ]),
    [],
  )
  useEffect(() => () => keile.forEach((g) => g.dispose()), [keile])
  const keilGeo = winkel === null ? null : (keile.get(winkel) ?? null)

  const verschnittRef = useRef<THREE.Group>(null)
  const teilRef = useRef<THREE.Group>(null)
  const verschnittLaenge = Math.max(roh - laenge - d, 0.001)

  // Wo der gezeichnete Balken links beginnt. Beim Einstellen und Sägen ist die
  // Kamera aufs Schnittfenster gerahmt, und der Rest des Rohlings verschwindet
  // hinter dem Panel — lief er bis x = 0 durch, schaute sein Ende im
  // Querformat links neben dem Panel als zusammenhangloser Stummel wieder
  // heraus. Deshalb endet er dort einen guten Meter *hinter* der Panelkante.
  // Sobald verladen wird, zählt das ganze Stück (es liegt gleich vollständig
  // auf dem Anhänger) — die Ergänzung erscheint in dem Moment tief hinter dem
  // Panel bzw. außerhalb des Bilds, nie im sichtbaren Ausschnitt.
  // (`laenge - 0.5` als Schranke, damit das Teil auch bei einem extrem kurz
  // gezogenen Maß nie auf Null oder ins Negative gezeichnet wird.)
  const balkenAnfang =
    phase === 'einstellen' || phase === 'saegen'
      ? Math.max(0, Math.min(roh - 5, laenge - 0.5))
      : 0

  // Nach dem Schnitt trägt das Teil das Band — „jetzt dein Sparren“.
  const [gesaegt, setGesaegt] = useState(phase === 'verladen' || phase === 'fertig')
  const nachSchnitt = gesaegt || phase === 'verladen' || phase === 'fertig'
  const gespannDa = phase === 'verladen' || phase === 'fertig'
  const verschnittWeg = nachSchnitt

  // Schnittfenster: die letzten zwei Meter des Rohlings ± 0,5 m — das ist per
  // M4-Ableitung genau MIN−0,5 .. MAX+0,5.
  const huelleSchnitt = useMemo<Huelle>(
    () => ({
      min: [roh - 2.5, 0, -0.4],
      max: [roh + 0.5, y0 + 0.9, 0.4],
      mitte: [roh - 1, (y0 + 0.9) / 2, 0],
    }),
    [roh, y0],
  )
  // Finale: rechter Bock + Gespann. Die volle Fassung (Balkenanfang bis
  // Kofferaufbau, 16,4 m) machte das Motiv quer zu einem ~80 px hohen Streifen
  // in leerem Rahmen — deshalb fällt der leere linke Balkenrest aus der Hülle,
  // und rechts schneidet der Transporter an (laut Beschluss erlaubt).
  const gespannX = roh + 5.0
  const huelleWeit = useMemo<Huelle>(
    () => ({
      min: [roh - 3.4, 0, -2.4],
      max: [gespannX + 5.6, 2.7, 0.6],
      mitte: [(roh - 3.4 + gespannX + 5.6) / 2, 1.35, -0.9],
    }),
    [roh, gespannX],
  )

  // Ziel der Verladung: oben auf der Anhänger-Ladung (Gruppenversatz).
  const ladeziel = useMemo<[number, number, number]>(() => {
    const ladeY = 0.82 + 4 * 0.23 + 0.1
    return [gespannX - laenge / 2, ladeY - (y0 + Q.h / 2), GESPANN_Z]
  }, [gespannX, laenge, y0])

  const grad = 90 - (winkel ?? 90)
  const hintergrund = SZENE_FARBEN.dunkel.hintergrund

  return (
    <>
      <color attach="background" args={[hintergrund]} />
      <fog attach="fog" args={[hintergrund, 12, 42]} />
      <ambientLight intensity={0.55} />
      <hemisphereLight
        args={[SZENE_FARBEN.dunkel.himmel, SZENE_FARBEN.dunkel.boden, 0.6]}
      />
      <directionalLight position={[4, 9, 6]} intensity={2.0} />
      <directionalLight position={[-6, 4, -7]} intensity={0.7} />

      <Kamerafahrt
        huelle={gespannDa ? huelleWeit : huelleSchnitt}
        reduziert={reduziert}
      />

      {/* Hof-Boden */}
      <mesh position={[roh / 2, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[70, 40]} />
        <meshStandardMaterial color={SZENE_FARBEN.dunkel.boden} roughness={1} />
      </mesh>

      <Bock x={2.0} />
      <Bock x={roh - 2.3} />

      {/* Kontaktschatten unter dem Balken */}
      <mesh
        position={[(balkenAnfang + roh) / 2, 0.014, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[roh - balkenAnfang, 0.7]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={0.22}
          depthWrite={false}
        />
      </mesh>

      {/* ---- Das Teil: links der Schnittkante, nach dem Schnitt „dein Sparren“ ---- */}
      <group ref={teilRef} position={phase === 'fertig' ? ladeziel : [0, 0, 0]}>
        <mesh
          position={[(balkenAnfang + laenge) / 2, y0 + Q.h / 2, 0]}
          scale={[laenge - balkenAnfang, Q.h, Q.b]}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={FARBE_TEIL} roughness={0.82} flatShading />
        </mesh>
        {keilGeo && (
          <mesh geometry={keilGeo} position={[laenge, y0, 0]}>
            <meshStandardMaterial color={FARBE_TEIL} roughness={0.82} flatShading />
          </mesh>
        )}
        {nachSchnitt && (
          <group position={[laenge * 0.62, y0 + Q.h / 2, 0]}>
            <SparrenBand laengs={0} quer={[0.12, Q.h + 0.1, Q.b + 0.06]} />
          </group>
        )}
      </group>

      {/* ---- Der Verschnitt: rechts der Schnittkante. Die Gruppe sitzt auf
           dem eigenen Schwerpunkt, damit die Fall-Drehung um ihn läuft. ---- */}
      {!verschnittWeg && (
        <group
          ref={verschnittRef}
          position={[laenge + d + verschnittLaenge / 2, y0 + Q.h / 2, 0]}
        >
          <mesh scale={[verschnittLaenge, Q.h, Q.b]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={FARBE_VERSCHNITT} roughness={0.82} flatShading />
          </mesh>
          {keilGeo && (
            <mesh
              geometry={keilGeo}
              position={[-verschnittLaenge / 2, Q.h / 2, 0]}
              rotation={[0, 0, Math.PI]}
            >
              <meshStandardMaterial
                color={FARBE_VERSCHNITT}
                roughness={0.82}
                flatShading
              />
            </mesh>
          )}
        </group>
      )}

      {/* ---- Schnittmarker + Maßlinie (nur beim Einstellen) ---- */}
      {phase === 'einstellen' && (
        <>
          {/* Der Anriss steht deutlich über den Balken hinaus (wie eine
              Laserlinie der Kappsäge): erst diese Länge macht den Kippwinkel
              lesbar — auf dem 20-cm-Balken allein lagen 30° und 60° aus der
              Querkamera nur ein paar Pixel auseinander. */}
          <group position={[laenge, y0, 0]} rotation={[0, 0, (-grad * Math.PI) / 180]}>
            <mesh position={[0, (Q.h + 0.35) / 2 - 0.02, 0]}>
              <boxGeometry args={[0.036, Q.h + 0.35, Q.b + 0.05]} />
              <meshBasicMaterial color={AUSWAHL_EMISSIV} />
            </mesh>
          </group>
          {/* Maßlinie an der Unterkante, vom Balkenanfang bis zur unteren
              Schnittecke — dort wird `laengeMm` gemessen. Gezeichnet wird sie
              wie der Balken erst ab `balkenAnfang`: gemessen wird ab x = 0,
              aber der Anfang liegt per Konvention (Bruchkante) außerhalb des
              Fensters, und alles davor endete sonst im Querformat als Strich
              links neben dem Panel. */}
          <mesh position={[(balkenAnfang + laenge) / 2, y0 - 0.07, Q.b / 2 + 0.01]}>
            <boxGeometry args={[laenge - balkenAnfang, 0.01, 0.01]} />
            <meshBasicMaterial color={RISS_FARBEN.kante} />
          </mesh>
          {[balkenAnfang, laenge].map((x) => (
            <mesh key={x} position={[x, y0 - 0.07, Q.b / 2 + 0.01]}>
              <boxGeometry args={[0.012, 0.1, 0.012]} />
              <meshBasicMaterial color={RISS_FARBEN.kante} />
            </mesh>
          ))}
          {/* Bruchkante am linken Fensterrand (Zeichnungskonvention): Balken
              und Maßlinie laufen links weiter, gemessen wird ab dem
              Balkenanfang außerhalb des Schnittfensters. Das Fenster selbst
              bleibt bewusst eng — weiter aufziehen würde ±30 mm und die
              Winkel unlesbar machen (siehe huelleSchnitt). */}
          {[0, 0.06].map((dx) => (
            <mesh
              key={dx}
              position={[roh - 2.35 + dx, y0 + Q.h / 2 - 0.05, Q.b / 2 + 0.01]}
              rotation={[0, 0, 0.35]}
            >
              <boxGeometry args={[0.012, Q.h + 0.3, 0.012]} />
              <meshBasicMaterial color={RISS_FARBEN.kante} />
            </mesh>
          ))}
          <GriffProjektion ziel={[laenge, y0 - 0.02, Q.b / 2]} el={griffEl} />
        </>
      )}

      {/* ---- Säge, Verladen ---- */}
      {phase === 'saegen' && !gesaegt && (
        <Saege
          laenge={laenge}
          winkel={winkel}
          verschnitt={verschnittRef}
          reduziert={reduziert}
          onFertig={() => {
            setGesaegt(true)
            onSaegenEnde?.()
          }}
        />
      )}
      {phase === 'verladen' && (
        <Verladen
          teil={teilRef}
          von={[0, 0, 0]}
          nach={ladeziel}
          reduziert={reduziert}
          onFertig={() => onVerladenEnde?.()}
        />
      )}

      {/* ---- Das Gespann im Finale ---- */}
      {gespannDa && (
        <group position={[gespannX, 0, GESPANN_Z]}>
          <Gespann ladung={0.85} reduziert={reduziert} />
        </group>
      )}
    </>
  )
}

// ---------------------------------------------------------------------------
// Wrapper: Canvas, Drag, Griff-Div, Kontextverlust
// ---------------------------------------------------------------------------

export default function Zuschnitt3D(props: Zuschnitt3DProps) {
  const { phase, laengeMm, winkel, rohMm, onLaenge } = props
  const [kontextWeg, setKontextWeg] = useState(false)
  const [neustart, setNeustart] = useState(0)
  const griffEl = useRef<HTMLDivElement>(null)

  // Der Schrägschnitt braucht hinter der Unterkante noch `versatz` Holz für
  // die Keil-Oberkante. Ohne diese Grenze ließe sich die Unterkante bis ans
  // Rohlings-Ende ziehen — und Teil samt Gegenkeil ragten dann über `rohMm`
  // hinaus: der Balken gewänne sichtbar Material, während die Anzeige das
  // volle Rohmaß nennt. Das Maximum endet deshalb einen Versatz (aufs
  // 10-mm-Raster aufgerundet) vor dem Ende; beim Winkelwechsel klemmt der
  // Effekt eine schon zu weit gezogene Länge nach.
  // (Das Epsilon fängt Gleitkomma ab: `versatz(45°) * 100` liefert
  // 20,000000000000004 — ohne Abzug fräse `ceil` ein Raster zu viel weg.)
  const maxMm = rohMm - Math.ceil(versatz(winkel ?? 90, Q.h) * 100 - 1e-6) * 10
  useEffect(() => {
    if (phase === 'einstellen' && onLaenge && laengeMm > maxMm) onLaenge(maxMm)
  }, [phase, onLaenge, laengeMm, maxMm])

  const reduziert = useMemo(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )

  const sichtfeldRoh = useSichtfeld('roh')

  // Ein-Achsen-Drag auf der ganzen Bühne: Pointer-Capture auf dem Wrapper,
  // Aktivierung ab 8 px, fester Gain, 10-mm-Raster.
  const zug = useRef<{ id: number; x: number; mm: number; aktiv: boolean } | null>(null)

  const zeigerAb = (e: ReactPointerEvent<HTMLDivElement>) => {
    // Nur der Primärzeiger stellt die Länge: ein zweiter Finger (oder ein
    // Streuereignis) darf das Maß nicht still verstellen, während der erste
    // noch anliegt — am Kiosk wäre eine unbemerkt verrutschte Länge direkt
    // vor „Schnitt setzen“ das verwirrendste Ergebnis überhaupt.
    if (phase !== 'einstellen' || !onLaenge || !e.isPrimary) return
    zug.current = { id: e.pointerId, x: e.clientX, mm: laengeMm, aktiv: false }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const zeigerZieht = (e: ReactPointerEvent<HTMLDivElement>) => {
    const z = zug.current
    if (!z || z.id !== e.pointerId || phase !== 'einstellen' || !onLaenge) return
    const dx = e.clientX - z.x
    if (!z.aktiv && Math.abs(dx) < 8) return
    z.aktiv = true
    const roh = z.mm + dx * GAIN_MM_JE_PX
    const gerundet = Math.round(roh / 10) * 10
    onLaenge(Math.min(maxMm, Math.max(200, gerundet)))
  }
  const zeigerAuf = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (zug.current?.id === e.pointerId) zug.current = null
  }

  return (
    <div
      className="relative size-full touch-none select-none"
      data-wisch="aus"
      onPointerDown={zeigerAb}
      onPointerMove={zeigerZieht}
      onPointerUp={zeigerAuf}
      onPointerCancel={zeigerAuf}
    >
      <Canvas
        key={neustart}
        style={{ touchAction: 'none', width: '100%', height: '100%' }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: false }}
        camera={{ fov: FOV, near: 0.1, far: 120, position: [7, 2, 6] }}
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
        <Werkstatt {...props} griffEl={griffEl} reduziert={reduziert} />
      </Canvas>

      {/* Derselbe Grund wie unter dem Dachstuhl (s. `Hallenlicht`): ohne ihn
          liegt der Balken auf einer schwarzen Fläche statt in einer Werkstatt.
          `roh`, weil auch die Kamera hier ohne Sicherheitsstreifen rechnet. */}
      <Hallenlicht sichtfeld={sichtfeldRoh} />

      {/* Der Griff-Punkt an der unteren Schnittecke — DOM, damit er 48 px
          groß und tokenfarben ist; die Lage schreibt die Projektion per ref. */}
      {phase === 'einstellen' && (
        <div
          ref={griffEl}
          data-testid="m4-griff-3d"
          aria-hidden
          className="pointer-events-none absolute top-0 left-0 size-12 rounded-full border-4 border-[#0E0D0B] bg-kh-orange shadow-[0_6px_20px_rgba(255,122,26,0.5)]"
        />
      )}

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
