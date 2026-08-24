import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { Html } from '@react-three/drei'
import type { DachstuhlMasse } from './mass'
import type { Bauteil, Einheit } from './teileliste'
import { erzeugeGeometrien } from './geometrien'
import type { Geometrien } from './geometrien'
import { RISS_FARBEN } from './bauteil-texte'

/**
 * Die Planansicht (M3): der Dachstuhl als Abbundplan — dasselbe Objekt wie in
 * B3.2, nur als Zeichnung gedacht. Kein Material-Umschalten am lebenden
 * Modell (kein Shader-Recompile-Risiko), sondern ein eigener Zweig:
 *
 *   1. deckende dunkle **Fuellkoerper** (ein Draw Call) — sie erledigen das
 *      Hidden-Line-Removal ueber den Tiefenpuffer,
 *   2. ein gemergter **Kantenzug** (ein Draw Call) in Kreide auf dunklem Grund,
 *   3. drei **Massketten** mit Endstrichen und Html-Beschriftung, Werte aus
 *      `masse` berechnet, nie getippt.
 *
 * Die Teile kommen aus den Einheiten, die die Szene ohnehin haelt — kein
 * zweiter `erzeugeTeile`-Lauf. Der Matrixaufbau repliziert exakt die
 * Transformationskette aus `Bauteil.tsx` und `Dachflaeche.tsx`.
 */

function geometrieFuer(g: Geometrien, t: Bauteil): THREE.BufferGeometry {
  if (t.form === 'sparren') return g.sparren
  if (t.form === 'mittelpfette') return g.mittelpfette
  if (t.form === 'firstpfette') return g.firstpfette
  return g.wuerfel
}

/** Skalierung wie in `Bauteil.tsx`: Boxen ueber `groesse`, Profile nur Spiegel. */
function skalierung(t: Bauteil): [number, number, number] {
  const spiegel = t.spiegelZ ? -1 : 1
  if (t.form === 'box') return [t.groesse[0], t.groesse[1], t.groesse[2] * spiegel]
  return [1, 1, spiegel]
}

/** Weltmatrix eines Teils: Dachflaechen-Frame · Einheit · Mesh. */
function weltmatrix(t: Bauteil, e: Einheit, m: DachstuhlMasse): THREE.Matrix4 {
  const mesh = new THREE.Matrix4().compose(
    new THREE.Vector3(...t.position),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(...t.rotation)),
    new THREE.Vector3(...skalierung(t)),
  )
  const einheit = new THREE.Matrix4().compose(
    new THREE.Vector3(...e.position),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(...e.rotation)),
    new THREE.Vector3(1, 1, 1),
  )
  const welt = einheit.multiply(mesh)

  if (t.rahmen === 'welt') return welt

  // Dachflaechen-Frame: aussen Spiegelung, innen Hub + Neigung (Dachflaeche.tsx).
  const seite = t.rahmen === 'dach+' ? 1 : -1
  const frame = new THREE.Matrix4()
    .makeScale(1, 1, seite)
    .multiply(
      new THREE.Matrix4().compose(
        new THREE.Vector3(0, m.C, 0),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(m.p.alpha, 0, 0)),
        new THREE.Vector3(1, 1, 1),
      ),
    )
  return frame.multiply(welt)
}

/** Nur die Lage-Attribute behalten — Voraussetzung fuers Mergen. */
function nurPosition(g: THREE.BufferGeometry): THREE.BufferGeometry {
  const n = g.index ? g.toNonIndexed() : g
  for (const name of Object.keys(n.attributes)) {
    if (name !== 'position') n.deleteAttribute(name)
  }
  return n
}

export interface Riss {
  fuellung: THREE.BufferGeometry
  kanten: THREE.BufferGeometry
  entsorge: () => void
}

/**
 * Ein gemergter Kantenzug plus ein gemergter Fuellkoerper ueber alle Teile.
 * Zonen (`form === 'zone'`) sind Pick-Volumen, keine Zeichnung — ausgefiltert.
 */
export function erzeugeRiss(
  g: Geometrien,
  einheiten: Einheit[],
  m: DachstuhlMasse,
): Riss {
  // Kantenbasis je geteilter Geometrie einmal rechnen, dann je Teil klonen.
  const kantenBasis = new Map<THREE.BufferGeometry, THREE.BufferGeometry>()
  const kantenVon = (basis: THREE.BufferGeometry): THREE.BufferGeometry => {
    let k = kantenBasis.get(basis)
    if (!k) {
      k = new THREE.EdgesGeometry(basis, 8)
      kantenBasis.set(basis, k)
    }
    return k
  }

  const fuellungen: THREE.BufferGeometry[] = []
  const kanten: THREE.BufferGeometry[] = []
  for (const e of einheiten) {
    for (const t of e.teile) {
      if (t.form === 'zone') continue
      const basis = geometrieFuer(g, t)
      const matrix = weltmatrix(t, e, m)
      fuellungen.push(nurPosition(basis.clone()).applyMatrix4(matrix))
      kanten.push(kantenVon(basis).clone().applyMatrix4(matrix))
    }
  }

  const fuellung = mergeGeometries(fuellungen, false)
  const kantenzug = mergeGeometries(kanten, false)
  for (const zw of [...fuellungen, ...kanten, ...kantenBasis.values()]) zw.dispose()

  return {
    fuellung,
    kanten: kantenzug,
    entsorge: () => {
      fuellung.dispose()
      kantenzug.dispose()
    },
  }
}

// ---------------------------------------------------------------------------
// Massketten
// ---------------------------------------------------------------------------

const meter = (v: number) => `${v.toFixed(2).replace('.', ',')} m`

interface Kette {
  von: [number, number, number]
  bis: [number, number, number]
  /** Richtung der Endstriche (normiert nicht noetig — feste Laenge 0,24 m). */
  strich: [number, number, number]
  text: string
  label: [number, number, number]
}

/**
 * Die drei Ketten am vorderen Giebel: Gebaeudebreite `B`, Firsthoehe
 * `yFirstOK`, Sparrenlaenge `lS` entlang einer Sparren-Unterkante (dort wird
 * `lS` laut `mass.ts` gemessen).
 */
function ketten(m: DachstuhlMasse): Kette[] {
  const xM = m.xOrtgang + 0.6
  const halbB = m.p.B / 2
  // Ausserhalb der Dachflaeche, senkrecht zur Sparren-Unterkante nach aussen.
  const nA = 0.4
  const n: [number, number, number] = [0, Math.cos(m.p.alpha), Math.sin(m.p.alpha)]
  return [
    {
      von: [xM, -0.6, -halbB],
      bis: [xM, -0.6, halbB],
      strich: [0, 0.12, 0],
      text: meter(m.p.B),
      label: [xM, -1.0, 0],
    },
    {
      von: [xM, 0, -(halbB + 0.6)],
      bis: [xM, m.yFirstOK, -(halbB + 0.6)],
      strich: [0, 0, 0.12],
      text: meter(m.yFirstOK),
      label: [xM, m.yFirstOK / 2, -(halbB + 1.0)],
    },
    {
      von: [xM, m.C + n[1] * nA, n[2] * nA],
      bis: [xM, m.C - m.zT * m.tanA + n[1] * nA, m.zT + n[2] * nA],
      strich: [0, n[1] * 0.12, n[2] * 0.12],
      text: meter(m.lS),
      label: [
        xM,
        (m.C + (m.C - m.zT * m.tanA)) / 2 + n[1] * (nA + 0.35),
        m.zT / 2 + n[2] * (nA + 0.35),
      ],
    },
  ]
}

function kettenGeometrie(k: Kette[]): THREE.BufferGeometry {
  const p: number[] = []
  for (const { von, bis, strich } of k) {
    p.push(...von, ...bis)
    for (const ende of [von, bis]) {
      p.push(
        ende[0] - strich[0],
        ende[1] - strich[1],
        ende[2] - strich[2],
        ende[0] + strich[0],
        ende[1] + strich[1],
        ende[2] + strich[2],
      )
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3))
  return g
}

// ---------------------------------------------------------------------------
// Komponente
// ---------------------------------------------------------------------------

export function Planriss({
  masse,
  einheiten,
}: {
  masse: DachstuhlMasse
  einheiten: Einheit[]
}) {
  const geometrien = useMemo(() => erzeugeGeometrien(masse), [masse])
  const riss = useMemo(
    () => erzeugeRiss(geometrien, einheiten, masse),
    [geometrien, einheiten, masse],
  )
  const masslinien = useMemo(() => ketten(masse), [masse])
  const kettenGeo = useMemo(() => kettenGeometrie(masslinien), [masslinien])

  useEffect(
    () => () => {
      riss.entsorge()
      geometrien.entsorge()
      kettenGeo.dispose()
    },
    [riss, geometrien, kettenGeo],
  )

  return (
    <group>
      {/* Fuellkoerper: dunkel, deckend, hinter die Linien gedrueckt. */}
      <mesh geometry={riss.fuellung} renderOrder={0}>
        <meshBasicMaterial
          color={RISS_FARBEN.fuellung}
          side={THREE.DoubleSide}
          polygonOffset
          polygonOffsetFactor={1}
          polygonOffsetUnits={1}
        />
      </mesh>
      <lineSegments geometry={riss.kanten} renderOrder={1}>
        <lineBasicMaterial color={RISS_FARBEN.kante} fog={false} />
      </lineSegments>

      <lineSegments geometry={kettenGeo} renderOrder={1}>
        <lineBasicMaterial
          color={RISS_FARBEN.kante}
          fog={false}
          transparent
          opacity={0.75}
        />
      </lineSegments>
      {masslinien.map((k) => (
        <Html
          key={k.text}
          position={k.label}
          center
          zIndexRange={[10, 0]}
          wrapperClass="pointer-events-none"
        >
          {/* Traeger unter der Zahl: die Sparrenkette liegt aus dem
              Dreiviertelblick zwangslaeufig vor der Konstruktion, und eine
              helle Zahl auf hellen Kanten liest niemand. Ein Plaettchen in der
              Grundfarbe der Buehne loest das, ohne die Zeichnung anzufassen. */}
          {/* Deckend und in voller Schriftfarbe: das Plättchen liegt teils auf
              dem dichtesten Stück der Zeichnung, und aus zwei Metern Kiosk-
              Abstand kippte „6,86“ mit 85 % Deckkraft ins Raten. */}
          <span className="rounded-[4px] bg-kh-ink/95 px-1.5 py-0.5 text-[15px] whitespace-nowrap text-kh-paper tabular-nums">
            {k.text}
          </span>
        </Html>
      ))}
    </group>
  )
}
