/**
 * Rechenprobe fuer `passeEin` — laeuft ohne Browser, ohne three, ohne Canvas.
 *
 *     pnpm pruefe:kamera
 *
 * Geprueft wird das, was man auf einem Screenshot nur raten kann: liegt die
 * Huelle des Dachstuhls wirklich vollstaendig in der freien Flaeche, und sitzt
 * sie dort mittig — fuer jede Ansicht, im Quer- und im Hochformat, mit und
 * ohne verdeckende Textkarte.
 *
 * Der Anlass: zwei Umsetzungen hatten sich unabhaengig voneinander einen
 * Abstandsfaktor von Hand gesucht (1,35 / 1,45 / 1,5), weil das Modell in
 * einem Step hinter der Textkarte lag. Ein Faktor kann das nicht loesen — er
 * macht das Modell kleiner, aber nicht mittiger. Seit `Sichtfeld` rechnet die
 * Kamera es aus; diese Datei belegt, dass sie richtig rechnet.
 */

import { KAMERA, FOV, passeEin } from './kamera'
import type { Ansicht, Sichtfeld } from './kamera'
import { berechneMasse } from '../dachstuhl/mass'
import { STANDARD_PARAMETER } from '../dachstuhl/parameter'

type V3 = [number, number, number]
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const cross = (a: V3, b: V3): V3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
]
const norm = (a: V3): V3 => {
  const l = Math.hypot(...a) || 1
  return [a[0] / l, a[1] / l, a[2] / l]
}

const masse = berechneMasse(STANDARD_PARAMETER)
const h = masse.huelle
const ecken: V3[] = []
for (const x of [h.min[0], h.max[0]])
  for (const y of [h.min[1], h.max[1]])
    for (const z of [h.min[2], h.max[2]]) ecken.push([x, y, z])

const tanVoll = (aspect: number) => {
  const tv = Math.tan(((FOV / 2) * Math.PI) / 180)
  return { tanH: tv * aspect, tanV: tv }
}

let fehler = 0
const faelle: { ansicht: Ansicht; aspect: number; sf?: Sichtfeld; name: string }[] = []
for (const ansicht of ['iso', 'front', 'seite', 'oben', 'traufe'] as Ansicht[]) {
  for (const [aspect, wie] of [
    [1024 / 768, 'quer'],
    [768 / 1024, 'hoch'],
    // Die Masse, die am Stand wirklich anliegen: iPad quer abzueglich der
    // 68-px-Leiste, und ein Handy hochkant fuer die QR-Besucher. Beide sind
    // deutlich schlanker als 4:3 — und genau bei schlankem Bild wird die
    // waagerechte Oeffnung zur engeren.
    [1194 / 766, 'ipad'],
    [390 / 776, 'handy'],
  ] as [number, string][]) {
    faelle.push({ ansicht, aspect, name: `${ansicht}/${wie}/voll` })
    faelle.push({
      ansicht,
      aspect,
      sf: { links: 0.44, unten: 0.16 },
      name: `${ansicht}/${wie}/karte-links`,
    })
    faelle.push({
      ansicht,
      aspect,
      sf: { oben: 0.3, unten: 0.22 },
      name: `${ansicht}/${wie}/kopf+fuss`,
    })
    // Der Fall, an dem die erste Fassung zerbrach: eine Karte ueber knapp der
    // halben Breite. Das freie Fenster enthaelt die Blickachse dann nicht mehr,
    // und wer die Asymmetrie in die Einpassung zieht, teilt durch fast null —
    // die Kamera wanderte ins Nichts und das Bild blieb leer.
    faelle.push({
      ansicht,
      aspect,
      sf: { links: 0.48 },
      name: `${ansicht}/${wie}/karte-breit`,
    })
    // Der gemessene Ist-Wert des Ein-Karten-Layouts: die Karte ist quer auf
    // 40rem gedeckelt und steht mit ihrem Rand bei 56 % der Flaeche. Vorher
    // ging die Pruefung nur bis 0,48 — der reale Screen lag darueber und war
    // damit ungeprueft.
    faelle.push({
      ansicht,
      aspect,
      sf: { links: 0.56, rechts: 0.18, oben: 0.18, unten: 0.18 },
      name: `${ansicht}/${wie}/karte-56`,
    })
    faelle.push({
      ansicht,
      aspect,
      sf: { rechts: 0.55, oben: 0.1 },
      name: `${ansicht}/${wie}/karte-rechts`,
    })
  }
}

for (const f of faelle) {
  const preset = KAMERA[f.ansicht]
  const lage = passeEin(preset, h, f.aspect, f.sf)
  const P = lage.position as V3
  const T = lage.ziel as V3
  const richtung = norm(sub(P, T))
  const referenz: V3 = Math.abs(dot(richtung, [0, 1, 0])) > 0.999 ? [0, 0, -1] : [0, 1, 0]
  const xKam = norm(cross(referenz, richtung))
  const yKam = cross(richtung, xKam)
  const { tanH, tanV } = tanVoll(f.aspect)

  // Nur der Gesamtblick muss die ganze Huelle zeigen. Der Traufblick ist ein
  // Detailausschnitt — dort wird nur geprueft, dass der Zielpunkt sitzt.
  const punkte = preset.ausschnitt === 'gesamt' ? ecken : [preset.ausschnitt.ziel as V3]

  let xMin = Infinity,
    xMax = -Infinity,
    yMin = Infinity,
    yMax = -Infinity
  for (const c of punkte) {
    const v = sub(c, P)
    const tiefe = -dot(v, richtung)
    if (tiefe <= 0) {
      console.log(`  ${f.name}: Punkt hinter der Kamera`)
      fehler++
      continue
    }
    const sx = dot(v, xKam) / tiefe / tanH
    const sy = dot(v, yKam) / tiefe / tanV
    xMin = Math.min(xMin, sx)
    xMax = Math.max(xMax, sx)
    yMin = Math.min(yMin, sy)
    yMax = Math.max(yMax, sy)
  }

  const s = { links: 0, rechts: 0, oben: 0, unten: 0, ...f.sf }
  const freiX: [number, number] = [-1 + 2 * s.links, 1 - 2 * s.rechts]
  const freiY: [number, number] = [-1 + 2 * s.unten, 1 - 2 * s.oben]
  const eps = 1e-6

  const drin =
    xMin >= freiX[0] - eps &&
    xMax <= freiX[1] + eps &&
    yMin >= freiY[0] - eps &&
    yMax <= freiY[1] + eps
  const mx = (xMin + xMax) / 2,
    my = (yMin + yMax) / 2
  const zielMx = (freiX[0] + freiX[1]) / 2,
    zielMy = (freiY[0] + freiY[1]) / 2
  // Eng gefasst: seit der Versatz nachgemessen und nachgezogen wird, sitzt das
  // Bild auf ein halbes Prozent genau. Eine weichere Schranke wuerde ein
  // Abrutschen der Einmittung durchgehen lassen.
  const mittig = Math.abs(mx - zielMx) < 0.01 && Math.abs(my - zielMy) < 0.01

  const ok = drin && mittig
  if (!ok) fehler++
  console.log(
    `${ok ? 'ok  ' : 'FEHL'} ${f.name.padEnd(26)} ` +
      `x[${xMin.toFixed(2)},${xMax.toFixed(2)}] soll[${freiX[0].toFixed(2)},${freiX[1].toFixed(2)}]  ` +
      `y[${yMin.toFixed(2)},${yMax.toFixed(2)}] soll[${freiY[0].toFixed(2)},${freiY[1].toFixed(2)}]  ` +
      `mitte(${(mx - zielMx).toFixed(3)},${(my - zielMy).toFixed(3)})`,
  )
}
console.log(fehler === 0 ? '\nALLE FAELLE OK' : `\n${fehler} FEHLER`)
process.exit(fehler === 0 ? 0 : 1)
