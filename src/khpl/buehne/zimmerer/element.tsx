import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import { AUSWAHL_EMISSIV, SIGNAL_MARKE, SPARREN_FARBEN } from '@/dachstuhl/bauteil-texte'
import { useTapErkennung } from '@/drei/useTapErkennung'
import {
  ACHSMASS_CM,
  ACHSMASS_MAX_CM,
  ACHSMASS_MIN_CM,
  AUFRICHTEN_DAUER,
  AUFRICHTEN_STANDZEIT,
  ELEMENT_BREITE_M,
  ELEMENT_HOEHE_M,
  PLATTENBREITE_CM,
} from './kanon'
import type { Fensterausschnitt } from './Wandelement3D'

/**
 * Das Wandelement selbst — Geometrie und die zustandsspezifischen Baugruppen
 * (C1 Stapel, C2 Ständerwerk, C3 Schichten, C4 Fenster).
 *
 * Läuft ausschließlich im Lazy-Chunk hinter `Wandelement3D`; Steps importieren
 * hieraus **nichts**. Koordinaten des Elements: **stehend** gebaut — x = Breite
 * (−B/2..B/2), y = Höhe (0..H, Schwelle unten, Rähm oben), z = Dicke (−T..0,
 * **außen bei z = 0**). Liegend wird das Element per Gruppendrehung
 * `rotation.x = −π/2` auf den Tisch gelegt: außen zeigt dann nach oben, die
 * Schwellenkante bleibt auf der Drehachse — genau die Achse, um die C4
 * aufrichtet.
 */

export const B = ELEMENT_BREITE_M
export const H = ELEMENT_HOEHE_M
const X0 = -B / 2

/**
 * Die fünf Schichten von innen (0) nach außen (4). Dicken bewusst
 * überzeichnet: reale 1–3 cm wären aus zwölf Metern Kameradistanz unsichtbar,
 * und C3 lebt davon, dass die Reihenfolge **lesbar** ist.
 */
export const SCHICHTEN = [
  { id: 'gips', dicke: 0.06, farbe: '#DDD8CF' },
  { id: 'installation', dicke: 0.1, farbe: '#8F6B3F' },
  { id: 'dampfbremse', dicke: 0.03, farbe: '#7FA9B5' },
  { id: 'tragwerk', dicke: 0.3, farbe: '#C09058' },
  { id: 'holzfaser', dicke: 0.08, farbe: '#B58C4C' },
] as const

/** Gesamtdicke des Sandwichs. */
export const T = SCHICHTEN.reduce((s, l) => s + l.dicke, 0)

/** z-Slots je Schicht: innen bei −T, außen bei 0. */
const SLOTS = (() => {
  const s: { von: number; bis: number; mitte: number; dicke: number }[] = []
  let z = -T
  for (const lage of SCHICHTEN) {
    s.push({ von: z, bis: z + lage.dicke, mitte: z + lage.dicke / 2, dicke: lage.dicke })
    z += lage.dicke
  }
  return s
})()
const TRAG = SLOTS[3]

const FARBE_KVH = SCHICHTEN[3].farbe
const FARBE_DAEMMUNG = '#D8C48F'

/** Abbundtisch-Oberkante und die Lage des flach liegenden Elements darüber. */
export const TISCH_OBEN = 0.78
export const ELEMENT_FLACH_Y = TISCH_OBEN + T + 0.02

/** Achsmaß in Metern und alle Ständermitten von links nach rechts. */
export const RASTER_M = ACHSMASS_CM / 100
export const STAENDER_MITTEN: readonly number[] = (() => {
  const m: number[] = [X0 + 0.04]
  for (let x = X0 + RASTER_M; x < B / 2 - RASTER_M / 2; x += RASTER_M) m.push(x)
  m.push(B / 2 - 0.04)
  return m
})()

/**
 * Der Ausschnitt, wenn ein späterer Zustand keinen übergeben bekommt: die
 * Props tragen ihn nur für C4, das Element trägt ihn ab dort aber sichtbar
 * weiter. Außermittig, damit in C6 „wo ist oben“ am Fenster ablesbar ist.
 */
export const STANDARD_AUSSCHNITT: Fensterausschnitt = {
  xMm: 4600,
  yMm: 900,
  breiteMm: 1240,
  hoeheMm: 1400,
}

export function glatt(u: number): number {
  const v = Math.max(0, Math.min(1, u))
  return v * v * (3 - 2 * v)
}

function klemm(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

interface Loch {
  x1: number
  x2: number
  y1: number
  y2: number
}

function lochLokal(a: Fensterausschnitt): Loch {
  const x1 = klemm(X0 + a.xMm / 1000, X0 + 0.14, B / 2 - 0.44)
  const y1 = klemm(a.yMm / 1000, 0.14, H - 0.44)
  const x2 = klemm(x1 + Math.max(a.breiteMm, 120) / 1000, x1 + 0.12, B / 2 - 0.14)
  const y2 = klemm(y1 + Math.max(a.hoeheMm, 120) / 1000, y1 + 0.12, H - 0.14)
  return { x1, x2, y1, y2 }
}

// ---------------------------------------------------------------------------
// Bausteine
// ---------------------------------------------------------------------------

function Kasten({
  x,
  y,
  z,
  dx,
  dy,
  dz,
  farbe,
  deckkraft,
}: {
  x: number
  y: number
  z: number
  dx: number
  dy: number
  dz: number
  farbe: string
  deckkraft?: number
}) {
  if (dx <= 0.001 || dy <= 0.001 || dz <= 0.001) return null
  return (
    <mesh position={[x, y, z]}>
      <boxGeometry args={[dx, dy, dz]} />
      {deckkraft === undefined ? (
        <meshStandardMaterial color={farbe} roughness={0.85} flatShading />
      ) : (
        <meshStandardMaterial
          color={farbe}
          roughness={0.85}
          flatShading
          transparent
          opacity={deckkraft}
          depthWrite={false}
        />
      )}
    </mesh>
  )
}

/** Eine Plattenschicht, bei Bedarf mit Fensterloch (vier Teilkästen). */
function Platte({
  slot,
  farbe,
  loch,
  xVersatz = 0,
}: {
  slot: { mitte: number; dicke: number }
  farbe: string
  loch?: Loch | null
  xVersatz?: number
}) {
  if (!loch) {
    return (
      <Kasten
        x={xVersatz}
        y={H / 2}
        z={slot.mitte}
        dx={B}
        dy={H}
        dz={slot.dicke}
        farbe={farbe}
      />
    )
  }
  const { x1, x2, y1, y2 } = loch
  return (
    <group>
      <Kasten
        x={(X0 + x1) / 2}
        y={H / 2}
        z={slot.mitte}
        dx={x1 - X0}
        dy={H}
        dz={slot.dicke}
        farbe={farbe}
      />
      <Kasten
        x={(x2 + B / 2) / 2}
        y={H / 2}
        z={slot.mitte}
        dx={B / 2 - x2}
        dy={H}
        dz={slot.dicke}
        farbe={farbe}
      />
      <Kasten
        x={(x1 + x2) / 2}
        y={y1 / 2}
        z={slot.mitte}
        dx={x2 - x1}
        dy={y1}
        dz={slot.dicke}
        farbe={farbe}
      />
      <Kasten
        x={(x1 + x2) / 2}
        y={(y2 + H) / 2}
        z={slot.mitte}
        dx={x2 - x1}
        dy={H - y2}
        dz={slot.dicke}
        farbe={farbe}
      />
    </group>
  )
}

function Staenderprofil({ x, farbe = FARBE_KVH }: { x: number; farbe?: string }) {
  return (
    <Kasten
      x={x}
      y={H / 2}
      z={TRAG.mitte}
      dx={0.08}
      dy={H - 0.24}
      dz={TRAG.dicke}
      farbe={farbe}
    />
  )
}

/**
 * Schwelle, Rähm, Ständer, auf Wunsch Gefachdämmung und Wechselholz — der
 * Inhalt des Tragwerk-Slots.
 */
export function Rahmenteile({
  staender = STAENDER_MITTEN,
  daemmung = false,
  loch = null,
}: {
  staender?: readonly number[]
  daemmung?: boolean
  loch?: Loch | null
}) {
  const sichtbar = loch
    ? staender.filter((x) => x < loch.x1 - 0.18 || x > loch.x2 + 0.18)
    : staender
  const gefache: ReactNode[] = []
  if (daemmung) {
    const alle = [...sichtbar].sort((a, b) => a - b)
    for (let i = 0; i < alle.length - 1; i++) {
      const von = alle[i] + 0.05
      const bis = alle[i + 1] - 0.05
      if (bis - von < 0.08) continue
      if (loch && bis > loch.x1 - 0.2 && von < loch.x2 + 0.2) continue
      gefache.push(
        <Kasten
          key={`g${i}`}
          x={(von + bis) / 2}
          y={H / 2}
          z={TRAG.mitte}
          dx={bis - von}
          dy={H - 0.26}
          dz={TRAG.dicke - 0.05}
          farbe={FARBE_DAEMMUNG}
        />,
      )
    }
  }
  return (
    <group>
      {/* Schwelle und Rähm */}
      <Kasten
        x={0}
        y={0.06}
        z={TRAG.mitte}
        dx={B}
        dy={0.12}
        dz={TRAG.dicke}
        farbe={FARBE_KVH}
      />
      <Kasten
        x={0}
        y={H - 0.06}
        z={TRAG.mitte}
        dx={B}
        dy={0.12}
        dz={TRAG.dicke}
        farbe={FARBE_KVH}
      />
      {sichtbar.map((x) => (
        <Staenderprofil key={x} x={x} />
      ))}
      {gefache}
      {loch && (
        <group>
          {/* Wechselholz über und unter der Öffnung, flankierende Ständer */}
          <Kasten
            x={(loch.x1 + loch.x2) / 2}
            y={loch.y2 + 0.07}
            z={TRAG.mitte}
            dx={loch.x2 - loch.x1 + 0.36}
            dy={0.14}
            dz={TRAG.dicke}
            farbe={FARBE_KVH}
          />
          <Kasten
            x={(loch.x1 + loch.x2) / 2}
            y={loch.y1 - 0.07}
            z={TRAG.mitte}
            dx={loch.x2 - loch.x1 + 0.36}
            dy={0.14}
            dz={TRAG.dicke}
            farbe={FARBE_KVH}
          />
          <Staenderprofil x={loch.x1 - 0.14} />
          <Staenderprofil x={loch.x2 + 0.14} />
        </group>
      )}
    </group>
  )
}

/** Die Signalmarke: ab C4 ist es *dein* Element. */
function DeineMarke() {
  return (
    <mesh position={[X0 + 0.7, 0.42, 0.012]}>
      <boxGeometry args={[0.5, 0.14, 0.02]} />
      <meshBasicMaterial color={SIGNAL_MARKE} />
    </mesh>
  )
}

/**
 * Das Element als Ganzes, stehend gebaut. `schichten` zählt die gelegten
 * Lagen von innen nach außen; das Tragwerk (Ständer) steht immer, seine
 * Dämmung kommt mit Schicht 4.
 */
export function Tafel({
  schichten = SCHICHTEN.length,
  ausschnitt = null,
  umriss = false,
  marke = false,
}: {
  schichten?: number
  ausschnitt?: Fensterausschnitt | null
  umriss?: boolean
  marke?: boolean
}) {
  const loch = ausschnitt ? lochLokal(ausschnitt) : null
  const komplett = schichten >= SCHICHTEN.length
  return (
    <group>
      {SLOTS.map((slot, i) =>
        i === 3 ? null : i < schichten ? (
          <Platte
            key={SCHICHTEN[i].id}
            slot={slot}
            farbe={SCHICHTEN[i].farbe}
            loch={loch}
          />
        ) : null,
      )}
      <Rahmenteile daemmung={schichten >= 4} loch={loch} />
      {loch && komplett && (
        <group>
          {/* Laibung: das Wechselholz zeigt sich in der Öffnung */}
          <Kasten
            x={loch.x1 + 0.03}
            y={(loch.y1 + loch.y2) / 2}
            z={-T / 2}
            dx={0.06}
            dy={loch.y2 - loch.y1}
            dz={T}
            farbe={FARBE_KVH}
          />
          <Kasten
            x={loch.x2 - 0.03}
            y={(loch.y1 + loch.y2) / 2}
            z={-T / 2}
            dx={0.06}
            dy={loch.y2 - loch.y1}
            dz={T}
            farbe={FARBE_KVH}
          />
          <Kasten
            x={(loch.x1 + loch.x2) / 2}
            y={loch.y1 + 0.03}
            z={-T / 2}
            dx={loch.x2 - loch.x1}
            dy={0.06}
            dz={T}
            farbe={FARBE_KVH}
          />
          <Kasten
            x={(loch.x1 + loch.x2) / 2}
            y={loch.y2 - 0.03}
            z={-T / 2}
            dx={loch.x2 - loch.x1}
            dy={0.06}
            dz={T}
            farbe={FARBE_KVH}
          />
        </group>
      )}
      {loch && umriss && (
        <group>
          {(
            [
              [(loch.x1 + loch.x2) / 2, loch.y1, loch.x2 - loch.x1 + 0.04, 0.04],
              [(loch.x1 + loch.x2) / 2, loch.y2, loch.x2 - loch.x1 + 0.04, 0.04],
              [loch.x1, (loch.y1 + loch.y2) / 2, 0.04, loch.y2 - loch.y1],
              [loch.x2, (loch.y1 + loch.y2) / 2, 0.04, loch.y2 - loch.y1],
            ] as const
          ).map(([x, y, dx, dy], i) => (
            <mesh key={i} position={[x, y, 0.02]}>
              <boxGeometry args={[dx, dy, 0.015]} />
              <meshBasicMaterial color={AUSWAHL_EMISSIV} />
            </mesh>
          ))}
        </group>
      )}
      {marke && <DeineMarke />}
    </group>
  )
}

// ---------------------------------------------------------------------------
// C1 — der Stapel nummerierter Hölzer
// ---------------------------------------------------------------------------

interface Holz {
  nummer: number
  laenge: number
  ausklinkung: boolean
  x: number
  z: number
  drehung: number
}

/**
 * Zwölf Hölzer, deterministisch aus der gesuchten Nummer abgeleitet. Das
 * gesuchte und sein Zwilling (Nummer − 3) sind gleich lang — sie unterscheiden
 * sich nur in der Ausklinkung, und die ist als seitliche Ausfräsung auch aus
 * der Draufsicht zu sehen (die Pointe von C1).
 */
function baueStapel(gesucht: number): Holz[] {
  const nummern = [
    gesucht - 9,
    gesucht - 7,
    gesucht - 6,
    gesucht - 5,
    gesucht - 4,
    gesucht - 3,
    gesucht - 2,
    gesucht - 1,
    gesucht,
    gesucht + 1,
    gesucht + 3,
    gesucht + 5,
  ]
  const laengen = [2.2, 3.4, 1.8, 2.9, 2.4, 2.62, 3.1, 2.05, 2.62, 2.75, 1.6, 3.6]
  const reihenZ = [-1.25, -0.42, 0.42, 1.25]
  return nummern.map((nummer, i) => {
    const reihe = Math.floor(i / 3)
    const spalte = i % 3
    // Deterministisches „Zufalls“-Rütteln, damit der Stapel nicht wie ein
    // Raster aussieht — aber bei jedem Laden gleich liegt.
    const salz = Math.sin(nummer * 12.9898) * 43758.5453
    const r = salz - Math.floor(salz)
    return {
      nummer,
      laenge: laengen[i],
      ausklinkung: nummer === gesucht,
      x: -3 + spalte * 3 + (r - 0.5) * 0.7,
      z: reihenZ[reihe] + (r - 0.5) * 0.16,
      drehung: (r - 0.5) * 0.07,
    }
  })
}

function Holzstueck({
  holz,
  gefunden,
  hinweis,
  onTap,
  hebung,
}: {
  holz: Holz
  gefunden: boolean
  /** „Zeig mir wie“: das gesuchte Holz hebt sich und bleibt markiert oben. */
  hinweis: boolean
  onTap: (nummer: number) => void
  hebung: React.RefObject<Map<number, number>>
}) {
  const gruppe = useRef<THREE.Group>(null)
  const tap = useTapErkennung()
  const farbe = SPARREN_FARBEN[holz.nummer % SPARREN_FARBEN.length]
  const b = 0.24
  const h = 0.12

  useFrame(({ clock }) => {
    const g = gruppe.current
    if (!g) return
    if (gefunden || hinweis) {
      g.position.y = TISCH_OBEN + h / 2 + 0.16
      return
    }
    const start = hebung.current.get(holz.nummer)
    if (start === undefined) {
      g.position.y = TISCH_OBEN + h / 2
      return
    }
    const u = (clock.elapsedTime - start) / 0.9
    if (u >= 1) {
      hebung.current.delete(holz.nummer)
      g.position.y = TISCH_OBEN + h / 2
      return
    }
    // Kurz anheben und wieder ablegen — „das passt nicht“.
    g.position.y = TISCH_OBEN + h / 2 + Math.sin(Math.PI * Math.min(u, 1)) * 0.22
  })

  const zeigerAb = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    tap.merken(e)
  }
  const zeigerAuf = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    if (tap.istTap(e)) onTap(holz.nummer)
  }

  const kerbe = 0.4
  return (
    <group
      ref={gruppe}
      position={[holz.x, TISCH_OBEN + h / 2, holz.z]}
      rotation={[0, holz.drehung, 0]}
      onPointerDown={zeigerAb}
      onPointerUp={zeigerAuf}
    >
      {holz.ausklinkung ? (
        <group>
          {/* Hauptholz plus ausgeklinktes Ende: halbe Breite über `kerbe` */}
          <mesh position={[-kerbe / 2, 0, 0]}>
            <boxGeometry args={[holz.laenge - kerbe, h, b]} />
            <meshStandardMaterial color={farbe} roughness={0.85} flatShading />
          </mesh>
          <mesh position={[holz.laenge / 2 - kerbe / 2, 0, -b / 4]}>
            <boxGeometry args={[kerbe, h, b / 2]} />
            <meshStandardMaterial color={farbe} roughness={0.85} flatShading />
          </mesh>
        </group>
      ) : (
        <mesh>
          <boxGeometry args={[holz.laenge, h, b]} />
          <meshStandardMaterial color={farbe} roughness={0.85} flatShading />
        </mesh>
      )}
      {gefunden ? (
        <mesh position={[-holz.laenge * 0.32, 0, 0]}>
          <boxGeometry args={[0.12, h + 0.04, b + 0.04]} />
          <meshBasicMaterial color={SIGNAL_MARKE} />
        </mesh>
      ) : hinweis ? (
        // Hinweisfarbe, nicht Signalgrün: gezeigt bekommen ist nicht geschafft.
        <mesh position={[-holz.laenge * 0.32, 0, 0]}>
          <boxGeometry args={[0.12, h + 0.04, b + 0.04]} />
          <meshBasicMaterial color={AUSWAHL_EMISSIV} />
        </mesh>
      ) : null}
      <Html
        center
        distanceFactor={9}
        position={[0, h / 2 + 0.05, 0]}
        style={{ pointerEvents: 'none' }}
      >
        <span className="rounded-full bg-kh-ink/85 px-2 py-0.5 text-[13px] font-semibold whitespace-nowrap text-kh-paper">
          {holz.nummer}
        </span>
      </Html>
    </group>
  )
}

export function Holzstapel({
  gesuchteNummer = 47,
  hinweis = false,
  onHolz,
}: {
  gesuchteNummer?: number
  /** „Zeig mir wie“ (khpl-tage.md 3): hebt das gesuchte Holz sichtbar an. */
  hinweis?: boolean
  onHolz?: (nummer: number) => void
}) {
  const stapel = useMemo(() => baueStapel(gesuchteNummer), [gesuchteNummer])
  const hebung = useRef(new Map<number, number>())
  const uhr = useRef(0)
  const [gefunden, setGefunden] = useState(false)
  useFrame(({ clock }) => {
    uhr.current = clock.elapsedTime
  })

  const tippen = (nummer: number) => {
    if (nummer === gesuchteNummer) setGefunden(true)
    else hebung.current.set(nummer, uhr.current)
    onHolz?.(nummer)
  }

  return (
    <group>
      {stapel.map((holz) => (
        <Holzstueck
          key={holz.nummer}
          holz={holz}
          gefunden={gefunden && holz.nummer === gesuchteNummer}
          hinweis={hinweis && !gefunden && holz.nummer === gesuchteNummer}
          onTap={tippen}
          hebung={hebung}
        />
      ))}
    </group>
  )
}

// ---------------------------------------------------------------------------
// C2 — Ständerwerk, Schätzen → Auflösen
// ---------------------------------------------------------------------------

const PLATTE_M = PLATTENBREITE_CM / 100

/**
 * Das leere Rähmwerk mit einem Ständer; der nächste folgt dem Regler. Beim
 * Auflösen schnappt er auf das Raster, dann legen sich zwei Bauplatten auf —
 * ihre gemeinsame Kante trifft sichtbar eine Ständermitte — und die übrigen
 * Ständer fliegen ins Raster ein. **Eine Bauplatte, keine Dämmmatte**
 * (belege/zimmerer.md 1).
 */
export function Staenderwerk({
  achsmassCm = ACHSMASS_CM,
  aufgeloest = false,
  reduziert,
}: {
  achsmassCm?: number
  aufgeloest?: boolean
  reduziert: boolean
}) {
  const beweglich = useRef<THREE.Group>(null)
  const platte1 = useRef<THREE.Group>(null)
  const platte2 = useRef<THREE.Group>(null)
  const kante = useRef<THREE.Mesh>(null)
  const regen = useRef<(THREE.Group | null)[]>([])
  const t0 = useRef<number | null>(null)

  const referenzX = X0 + RASTER_M
  const zielX = referenzX + klemm(achsmassCm, ACHSMASS_MIN_CM, ACHSMASS_MAX_CM) / 100
  const rasterX = referenzX + RASTER_M
  const kanteX = X0 + PLATTE_M
  // Alle übrigen Rastermitten: ohne die beiden Randständer, die Referenz und
  // die Zielposition des beweglichen Ständers.
  const uebrige = useMemo(
    () =>
      STAENDER_MITTEN.filter(
        (x) =>
          Math.abs(x - X0 - 0.04) > 0.01 &&
          Math.abs(x - (B / 2 - 0.04)) > 0.01 &&
          Math.abs(x - referenzX) > 0.01 &&
          Math.abs(x - rasterX) > 0.01,
      ),
    [referenzX, rasterX],
  )

  useFrame(({ clock }, dt) => {
    const g = beweglich.current
    if (!g) return
    if (!aufgeloest) {
      t0.current = null
      g.position.x += (zielX - g.position.x) * Math.min(1, dt * 14)
      if (platte1.current) platte1.current.visible = false
      if (platte2.current) platte2.current.visible = false
      if (kante.current) kante.current.visible = false
      regen.current.forEach((r) => {
        if (r) r.visible = false
      })
      return
    }
    if (t0.current === null) t0.current = clock.elapsedTime
    const t = reduziert ? 99 : clock.elapsedTime - t0.current

    // Phase A — der geschätzte Ständer schnappt auf das Raster.
    const uA = glatt(t / 0.7)
    g.position.x = g.position.x + (rasterX - g.position.x) * uA
    if (reduziert) g.position.x = rasterX

    // Phase B/C — die beiden Bauplatten legen sich auf.
    const platten: [typeof platte1, number][] = [
      [platte1, 0.9],
      [platte2, 2.1],
    ]
    for (const [ref, start] of platten) {
      const p = ref.current
      if (!p) continue
      const u = glatt((t - start) / 0.9)
      p.visible = u > 0
      // Landet knapp über der Ständer-Oberkante — sie deckt zu, sie schwebt nicht.
      p.position.z = -0.04 + (1 - u) * 1.5
    }
    if (kante.current) kante.current.visible = t > 1.9

    // Phase D — die übrigen Ständer fliegen ins Raster ein.
    regen.current.forEach((r, i) => {
      if (!r) return
      const u = glatt((t - 3.2 - i * 0.12) / 0.35)
      r.visible = u > 0
      r.position.z = (1 - u) * 1.8
    })
  })

  return (
    <group>
      <Rahmenteile staender={[X0 + 0.04, B / 2 - 0.04, referenzX]} />
      <group ref={beweglich} position={[zielX, 0, 0]}>
        <Staenderprofil x={0} />
      </group>
      {uebrige.map((x, i) => (
        <group
          key={x}
          ref={(el) => {
            regen.current[i] = el
          }}
          position={[0, 0, 1.8]}
          visible={false}
        >
          <Staenderprofil x={x} />
        </group>
      ))}
      {/* Die Bauplatten: halbtransparent, 125 cm breit, Kante auf Ständermitte */}
      <group ref={platte1} position={[0, 0, 1.58]} visible={false}>
        <mesh position={[X0 + PLATTE_M / 2, H / 2, 0]}>
          <boxGeometry args={[PLATTE_M, H, 0.03]} />
          <meshStandardMaterial
            color="#E8E0D2"
            roughness={0.9}
            transparent
            opacity={0.42}
            depthWrite={false}
          />
        </mesh>
      </group>
      <group ref={platte2} position={[0, 0, 1.58]} visible={false}>
        <mesh position={[X0 + PLATTE_M * 1.5, H / 2, 0]}>
          <boxGeometry args={[PLATTE_M, H, 0.03]} />
          <meshStandardMaterial
            color="#E8E0D2"
            roughness={0.9}
            transparent
            opacity={0.42}
            depthWrite={false}
          />
        </mesh>
      </group>
      {/* Die Stoßkante, die die Ständermitte trifft — das Beweisstück von C2 */}
      <mesh ref={kante} position={[kanteX, H / 2, 0.0]} visible={false}>
        <boxGeometry args={[0.035, H, 0.02]} />
        <meshBasicMaterial color={AUSWAHL_EMISSIV} />
      </mesh>
    </group>
  )
}

// ---------------------------------------------------------------------------
// C3 — die Schichten legen sich auf
// ---------------------------------------------------------------------------

/** Kartenversatz je Schicht: innen ragt am +x-Ende treppig hervor. */
const FAECHER = [0.9, 0.6, 0.3, 0, -0.3]

/**
 * Die fünf Karten des Steps (Innenbeplankung · Dampfbremse · Ständerwerk mit
 * Dämmung · Holzfaserplatte · Fassade) auf die Geometrie-Schichten (gips ·
 * installation · dampfbremse · tragwerk · holzfaser) übersetzt: die erste
 * Karte nennt die Installationsebene in ihrem Satz mit und deckt deshalb zwei
 * Lagen auf; die Fassade hat keine eigene Geometrie — sie ist Sache des
 * Bauherrn, sagt die Karte selbst.
 */
const KARTE_ZU_LAGEN = [0, 2, 3, 4, 5, 5] as const

/**
 * Die geführte Hälfte des Lernpaars: je gelegter Karte schiebt sich die
 * zugehörige Lage von der Seite in ihren Slot. Das Tragwerk steht schon (aus
 * C2); seine Karte bringt die Gefachdämmung mit. Der Treppenversatz hält alle
 * Kanten sichtbar — eine Wand von genau oben wäre ein Rechteck.
 */
export function Sandwichaufbau({
  schichten = 0,
  reduziert,
}: {
  schichten?: number
  reduziert: boolean
}) {
  const zeiten = useRef<(number | null)[]>(Array(SCHICHTEN.length).fill(null))
  const gruppen = useRef<(THREE.Group | null)[]>([])
  const lagen = KARTE_ZU_LAGEN[klemm(Math.round(schichten), 0, KARTE_ZU_LAGEN.length - 1)]

  useFrame(({ clock }) => {
    for (let i = 0; i < SCHICHTEN.length; i++) {
      if (i < lagen && zeiten.current[i] === null) zeiten.current[i] = clock.elapsedTime
      if (i >= lagen) zeiten.current[i] = null
      const g = gruppen.current[i]
      if (!g) continue
      const start = zeiten.current[i]
      if (start === null) {
        g.visible = false
        continue
      }
      const u = reduziert ? 1 : glatt((clock.elapsedTime - start) / 0.6)
      g.visible = u > 0
      g.position.x = FAECHER[i] + (1 - u) * 5.5
    }
  })

  return (
    <group>
      <Rahmenteile />
      {SLOTS.map((slot, i) => (
        <group
          key={SCHICHTEN[i].id}
          ref={(el) => {
            gruppen.current[i] = el
          }}
          visible={false}
        >
          {i === 3 ? (
            // Die Tragwerks-Karte: die Gefachdämmung zwischen den Ständern.
            <group>
              {STAENDER_MITTEN.slice(0, -1).map((x, k) => {
                const bis = STAENDER_MITTEN[k + 1] - 0.05
                const von = x + 0.05
                if (bis - von < 0.08) return null
                return (
                  <Kasten
                    key={x}
                    x={(von + bis) / 2}
                    y={H / 2}
                    z={TRAG.mitte}
                    dx={bis - von}
                    dy={H - 0.26}
                    dz={TRAG.dicke - 0.05}
                    farbe={FARBE_DAEMMUNG}
                  />
                )
              })}
            </group>
          ) : (
            <Platte slot={slot} farbe={SCHICHTEN[i].farbe} />
          )}
        </group>
      ))}
    </group>
  )
}

// ---------------------------------------------------------------------------
// C4 — der Fensterausschnitt und der Blick nach oben
// ---------------------------------------------------------------------------

/**
 * Das fertige Sandwich, flach; der Besucher zieht den Ausschnitt direkt auf
 * der Bühne auf (Vorbild `Zuschnitt3D`: Bühne liefert Geometrie, der Step
 * entscheidet über Treffer und Toleranz). `aufrichtenZeigen` kippt das Element
 * um die Schwellenkante in die Senkrechte — der erste Blick nach oben, die
 * halbe Miete für C6. Oben angekommen **steht** es `AUFRICHTEN_STANDZEIT`
 * lang (erst dann feuert `onAufrichtenEnde`), und zurück legt es sich mit
 * derselben Kippfahrt statt zu schnappen.
 */
export function FensterElement({
  ausschnitt = null,
  onAusschnitt,
  aufrichtenZeigen = false,
  onAufrichtenEnde,
  marke = false,
  reduziert,
}: {
  ausschnitt?: Fensterausschnitt | null
  onAusschnitt?: (a: Fensterausschnitt) => void
  aufrichtenZeigen?: boolean
  onAufrichtenEnde?: () => void
  marke?: boolean
  reduziert: boolean
}) {
  const kipp = useRef<THREE.Group>(null)
  const start = useRef<number | null>(null)
  const von = useRef(-Math.PI / 2)
  const obenSeit = useRef<number | null>(null)
  const gemeldet = useRef(false)
  const zieht = useRef<{ xMm: number; yMm: number } | null>(null)
  const [umriss, setUmriss] = useState(false)
  const melder = useRef(onAufrichtenEnde)
  useEffect(() => {
    melder.current = onAufrichtenEnde
  })

  useEffect(() => {
    // Jeder Wechsel startet eine neue Kippfahrt vom aktuellen Winkel aus —
    // auch das Zurücklegen ist animiert, kein Snap.
    start.current = null
    obenSeit.current = null
    if (aufrichtenZeigen) gemeldet.current = false
  }, [aufrichtenZeigen])

  useFrame(({ clock }) => {
    const g = kipp.current
    if (!g) return
    const t = clock.elapsedTime
    const ziel = aufrichtenZeigen ? 0 : -Math.PI / 2
    if (reduziert) {
      g.rotation.x = ziel
    } else {
      if (start.current === null) {
        start.current = t
        von.current = g.rotation.x
      }
      const u = Math.min((t - start.current) / AUFRICHTEN_DAUER, 1)
      g.rotation.x = von.current + (ziel - von.current) * glatt(u)
      if (aufrichtenZeigen && u < 1) return
    }
    if (!aufrichtenZeigen || gemeldet.current) return
    // Standzeit: gemeldet wird erst, wenn das Element wirklich gestanden hat —
    // die träge Kamera braucht den Moment, und C6 fragt genau dieses Bild ab.
    if (obenSeit.current === null) obenSeit.current = t
    if (t - obenSeit.current < AUFRICHTEN_STANDZEIT) return
    gemeldet.current = true
    melder.current?.()
  })

  const punktZuMm = (p: THREE.Vector3): { xMm: number; yMm: number } => ({
    xMm: klemm(Math.round(((p.x - X0) * 1000) / 10) * 10, 100, B * 1000 - 100),
    yMm: klemm(Math.round((-p.z * 1000) / 10) * 10, 100, H * 1000 - 100),
  })

  const melden = (bis: { xMm: number; yMm: number }) => {
    const von = zieht.current
    if (!von || !onAusschnitt) return
    const xMm = Math.min(von.xMm, bis.xMm)
    const yMm = Math.min(von.yMm, bis.yMm)
    onAusschnitt({
      xMm,
      yMm,
      breiteMm: Math.max(Math.abs(bis.xMm - von.xMm), 120),
      hoeheMm: Math.max(Math.abs(bis.yMm - von.yMm), 120),
    })
  }

  useEffect(() => {
    const loslassen = () => {
      zieht.current = null
      setUmriss(false)
    }
    window.addEventListener('pointerup', loslassen)
    window.addEventListener('pointercancel', loslassen)
    return () => {
      window.removeEventListener('pointerup', loslassen)
      window.removeEventListener('pointercancel', loslassen)
    }
  }, [])

  return (
    <group position={[0, ELEMENT_FLACH_Y, 0]}>
      <group ref={kipp} rotation={[-Math.PI / 2, 0, 0]}>
        <Tafel ausschnitt={ausschnitt} umriss={umriss} marke={marke} />
      </group>
      {!aufrichtenZeigen && onAusschnitt && (
        <mesh
          position={[0, 0.04, -H / 2]}
          rotation={[-Math.PI / 2, 0, 0]}
          onPointerDown={(e: ThreeEvent<PointerEvent>) => {
            if (!e.isPrimary) return
            e.stopPropagation()
            zieht.current = punktZuMm(e.point)
            setUmriss(true)
          }}
          onPointerMove={(e: ThreeEvent<PointerEvent>) => {
            if (!zieht.current || !e.isPrimary) return
            e.stopPropagation()
            melden(punktZuMm(e.point))
          }}
          onPointerUp={(e: ThreeEvent<PointerEvent>) => {
            if (!zieht.current) return
            e.stopPropagation()
            melden(punktZuMm(e.point))
            zieht.current = null
            setUmriss(false)
          }}
        >
          <planeGeometry args={[B, H]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}
    </group>
  )
}
