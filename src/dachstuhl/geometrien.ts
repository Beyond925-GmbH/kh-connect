import * as THREE from 'three'
import type { DachstuhlMasse } from './mass'

/**
 * Die vier geteilten Geometrien (Bauplan 3): ein Einheitswuerfel fuer rund
 * 110 Boxen plus drei extrudierte Profile.
 *
 * Alle Profile werden in Weltkoordinaten (z, y) gezeichnet und entlang X
 * extrudiert. Danach kein `center()` — der Pivot bleibt im Weltursprung,
 * sonst stimmt keine Position aus `teileliste.ts` mehr.
 */
export interface Geometrien {
  wuerfel: THREE.BufferGeometry
  sparren: THREE.BufferGeometry
  mittelpfette: THREE.BufferGeometry
  firstpfette: THREE.BufferGeometry
  entsorge: () => void
}

type Punkt = readonly [number, number]

/** Profil in der (z, y)-Ebene, extrudiert um `dicke` entlang X, auf x = 0 zentriert. */
function extrudiere(punkte: Punkt[], dicke: number): THREE.BufferGeometry {
  const shape = new THREE.Shape()
  shape.moveTo(punkte[0][0], punkte[0][1])
  for (let i = 1; i < punkte.length; i++) shape.lineTo(punkte[i][0], punkte[i][1])
  shape.closePath()

  const geometrie = new THREE.ExtrudeGeometry(shape, {
    depth: dicke,
    bevelEnabled: false,
    steps: 1,
    curveSegments: 1,
  })
  // Shape-x -> Welt-z, Shape-y -> Welt-y, Extrusionsrichtung -> Welt-x.
  geometrie.rotateY(-Math.PI / 2)
  geometrie.translate(dicke / 2, 0, 0)
  geometrie.computeVertexNormals()
  return geometrie
}

export function sparrenProfil(m: DachstuhlMasse): Punkt[] {
  const { C, zMLi, zMLa, zT, tanA, dY } = m
  const hML = m.p.q.mauerlatte.h
  const punkte: Punkt[] = [
    [0, C],
    [zMLi, C - zMLi * tanA],
  ]
  if (m.p.kerve && m.p.tK > 0) {
    // Kerve: Wange hoch, Kervengrund ueber der Mauerlatte, Ferse zurueck auf die UK.
    punkte.push([zMLi, hML], [zMLa, hML])
  }
  punkte.push(
    [zMLa, C - zMLa * tanA],
    [zT, C - zT * tanA],
    [zT, C - zT * tanA + dY],
    [0, C + dY],
  )
  return punkte
}

export function mittelpfettenProfil(m: DachstuhlMasse): Punkt[] {
  const b = m.p.q.mittelpfette.b
  const zAussen = m.zMP + b / 2
  const zInnen = m.zMP - b / 2
  return [
    [zInnen, m.yMPuk],
    [zAussen, m.yMPuk],
    [zAussen, m.C - zAussen * m.tanA],
    [zInnen, m.C - zInnen * m.tanA],
  ]
}

export function firstpfettenProfil(m: DachstuhlMasse): Punkt[] {
  const b = m.p.q.firstpfette.b
  return [
    [-b / 2, m.yFiPuk],
    [b / 2, m.yFiPuk],
    [b / 2, m.yFiPok],
    [0, m.C],
    [-b / 2, m.yFiPok],
  ]
}

export function erzeugeGeometrien(m: DachstuhlMasse): Geometrien {
  const wuerfel = new THREE.BoxGeometry(1, 1, 1)
  const sparren = extrudiere(sparrenProfil(m), m.p.q.sparren.b)
  // Beide Pfetten kragen ueber den Giebel aus und tragen dort die Ortgangsparren.
  const mittelpfette = extrudiere(mittelpfettenProfil(m), m.LD)
  const firstpfette = extrudiere(firstpfettenProfil(m), m.LD)

  return {
    wuerfel,
    sparren,
    mittelpfette,
    firstpfette,
    entsorge: () => {
      wuerfel.dispose()
      sparren.dispose()
      mittelpfette.dispose()
      firstpfette.dispose()
    },
  }
}
