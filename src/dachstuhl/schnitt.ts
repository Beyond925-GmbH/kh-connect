import * as THREE from 'three'

/**
 * Geometrie des Schraegschnitts in M4 (Zuschnitt3D). Kein CSG, kein Clipping:
 * Teil und Verschnitt sind zwei Prismen, die von Anfang an buendig liegen —
 * ein geteilter Quader plus je ein Keil an der Schnittkante. Die
 * Saege-Animation ist damit eine reine Gruppen-Transformation.
 *
 * Konvention: `winkelGrad` ist der Winkel am First (90° = lotrechter Schnitt
 * quer zum Balken). Der Keil sitzt an der Schnittkante des **Teils**: die
 * Unterkante endet bei der Schnittposition, die Oberkante ragt um `versatz`
 * darueber hinaus — genau wie die Sparren-Oberkante am First (`mass.ts`,
 * `dachZFirst = -hS * tanA`).
 */

/** Waagerechter Versatz Oberkante→Unterkante der Schnittkante: d = h / tan(w). */
export function versatz(winkelGrad: number, h: number): number {
  const w = (winkelGrad * Math.PI) / 180
  const t = Math.tan(w)
  return t > 1e-6 ? h / t : 0
}

/**
 * Keilgeometrie: Dreiecksprisma d×h×b. Lokaler Ursprung ist die **untere
 * Schnittecke** (dort, wo `laengeMm` gemessen wird); der Keil ragt nach +x
 * und fuellt die Hoehe 0..h, in z auf die Balkenbreite zentriert.
 * Der Gegenkeil des Verschnitts ist derselbe Koerper, um Pi um Z gedreht.
 */
export function keil(winkelGrad: number, h: number, b: number): THREE.BufferGeometry {
  const d = versatz(winkelGrad, h)
  const shape = new THREE.Shape()
  shape.moveTo(0, 0)
  shape.lineTo(d, h)
  shape.lineTo(0, h)
  shape.closePath()
  const geometrie = new THREE.ExtrudeGeometry(shape, {
    depth: b,
    bevelEnabled: false,
    steps: 1,
    curveSegments: 1,
  })
  geometrie.translate(0, 0, -b / 2)
  geometrie.computeVertexNormals()
  return geometrie
}
