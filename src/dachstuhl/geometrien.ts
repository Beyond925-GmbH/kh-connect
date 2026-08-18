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
  const { C, zMLi, zMLa, zT, tanA, dY, zMPi, zMPa, zFiPa, tKP } = m
  const hML = m.p.q.mauerlatte.h
  const uk = (z: number) => C - z * tanA
  const punkte: Punkt[] = []

  // Unterkante vom First zur Traufe. Jede Kerve hebt die Unterkante um die
  // Kervenhoehe an und schliesst mit zwei senkrechten Anschlagflaechen ab.
  if (tKP > 0) {
    // Firstkerve: der Sparren sitzt auf der angeschnittenen Firstpfette.
    punkte.push([0, C + tKP], [zFiPa, uk(zFiPa) + tKP], [zFiPa, uk(zFiPa)])
    // Kerve ueber der Mittelpfette.
    punkte.push(
      [zMPi, uk(zMPi)],
      [zMPi, uk(zMPi) + tKP],
      [zMPa, uk(zMPa) + tKP],
      [zMPa, uk(zMPa)],
    )
  } else {
    punkte.push([0, C])
  }

  punkte.push([zMLi, uk(zMLi)])
  if (m.p.kerve && m.p.tK > 0) {
    // Fusskerve: Wange hoch, Kervengrund auf der Mauerlatte, Ferse zurueck.
    punkte.push([zMLi, hML], [zMLa, hML])
  }
  punkte.push([zMLa, uk(zMLa)], [zT, uk(zT)])

  // Lotrechter Traufschnitt und Oberkante zurueck zum First.
  punkte.push([zT, uk(zT) + dY], [0, C + dY])
  return punkte
}

export function mittelpfettenProfil(m: DachstuhlMasse): Punkt[] {
  // Oberkante auf die Dachneigung angeschnitten und um die Kervenhoehe
  // angehoben: sie fuellt die Sparrenkerve satt aus.
  return [
    [m.zMPi, m.yMPuk],
    [m.zMPa, m.yMPuk],
    [m.zMPa, m.C - m.zMPa * m.tanA + m.tKP],
    [m.zMPi, m.C - m.zMPi * m.tanA + m.tKP],
  ]
}

export function firstpfettenProfil(m: DachstuhlMasse): Punkt[] {
  // Rechteck plus Dachkappe. Der Scheitel liegt um die Kervenhoehe ueber dem
  // Firstpunkt der Sparrenunterkante und fuellt damit beide Firstkerven.
  return [
    [-m.zFiPa, m.yFiPuk],
    [m.zFiPa, m.yFiPuk],
    [m.zFiPa, m.yFiPok],
    [0, m.yFiPfirst],
    [-m.zFiPa, m.yFiPok],
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
