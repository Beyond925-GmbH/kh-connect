import type { Huelle } from '../dachstuhl/mass'

/** Feste Kamerapositionen der Debug-Schnittstelle (Bauplan 6.2). */

export type Ansicht = 'iso' | 'front' | 'seite' | 'oben' | 'traufe'

export const ANSICHTEN: Ansicht[] = ['iso', 'front', 'seite', 'oben', 'traufe']

type V3 = [number, number, number]

export interface Kamerapreset {
  /**
   * Blickrichtung, angegeben als Punkt relativ zum Ziel. Nur die Richtung
   * zaehlt — die Distanz rechnet `passeEin` aus, damit das Modell in jedem
   * Seitenverhaeltnis vollstaendig im Bild steht.
   */
  richtung: V3
  /**
   * 'gesamt' = der ganze Dachstuhl wird eingepasst, das Ziel ist dann die
   * Mitte der Huelle. Eine Zahl ist der Radius eines Ausschnitts um `ziel` —
   * fuer Detailblicke, bei denen ein Gesamtbild nichts zeigen wuerde.
   */
  ausschnitt: 'gesamt' | { ziel: V3; radius: number }
  beschreibung: string
}

export const KAMERA: Record<Ansicht, Kamerapreset> = {
  iso: {
    richtung: [13.7, 6.5, 13.0],
    ausschnitt: 'gesamt',
    beschreibung: 'Dreiviertelblick',
  },
  front: {
    richtung: [17.0, 0.3, 0],
    ausschnitt: 'gesamt',
    beschreibung: 'Giebelansicht',
  },
  seite: {
    richtung: [0, 0.3, 18.0],
    ausschnitt: 'gesamt',
    beschreibung: 'Traufseite',
  },
  oben: {
    // Der Versatz verhindert, dass Blickrichtung und Up-Vektor kollinear
    // werden. Er darf nur auf EINER Achse liegen — auf beiden kippt die
    // Draufsicht um 45 Grad, weil die Bildschirm-Oben-Richtung dann diagonal
    // aus dem Up-Vektor herausfaellt.
    richtung: [0, 18.5, 0.01],
    ausschnitt: 'gesamt',
    beschreibung: 'Draufsicht',
  },
  traufe: {
    // Nah am Traufpunkt statt am Modellmittelpunkt: Ueberstand, Kerve und
    // Lattung sind auf einem Gesamtbild des Dachstuhls nicht zu beurteilen.
    richtung: [4.6, -0.5, 4.2],
    ausschnitt: { ziel: [1.0, 0.75, 4.0], radius: 3.1 },
    beschreibung: 'Traufe von aussen unten',
  },
}

export const FOV = 40

/** Luft zwischen Modell und Bildrand. */
const RAND = 0.09

/**
 * Der Teil der Leinwand, der wirklich frei ist — als Anteil je Kante.
 *
 * Im Vollbild-Prototyp gehoert dem Modell die ganze Flaeche. In einem Step
 * liegen Textkarte, Kopf und Fuss darueber, und die Leinwand ist trotzdem so
 * gross wie der Bildschirm: `passeEin` wuerde das Modell mittig einpassen und
 * damit unter die Karte schieben. Wer die verdeckten Anteile hier angibt,
 * bekommt ein Modell, das in die *freie* Flaeche passt und dort auch mittig
 * sitzt.
 *
 * `{ links: 0.42 }` heisst: die linken 42 % sind verdeckt.
 *
 * Das ersetzt den frueher von Hand gesuchten Abstandsfaktor. Ein Faktor
 * schiebt die Kamera nur weiter weg — das Modell blieb mittig und lag
 * weiterhin zur Haelfte hinter der Karte, nur kleiner.
 */
export interface Sichtfeld {
  links?: number
  rechts?: number
  oben?: number
  unten?: number
}

const OFFEN: Required<Sichtfeld> = { links: 0, rechts: 0, oben: 0, unten: 0 }

/** Freie Ansicht ohne Parameter. */
export const START_ANSICHT: Ansicht = 'iso'

function laenge(a: V3): number {
  return Math.hypot(a[0], a[1], a[2])
}

function normiere(a: V3): V3 {
  const l = laenge(a) || 1
  return [a[0] / l, a[1] / l, a[2] / l]
}

function skalarprodukt(a: V3, b: V3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}

function kreuzprodukt(a: V3, b: V3): V3 {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
}

export interface Kameralage {
  position: V3
  ziel: V3
  /** Eingepasste Distanz — Grundlage der Zoomgrenzen in der freien Ansicht. */
  distanz: number
}

/**
 * Die halbe Oeffnung, in die eingepasst wird — in Steigungen (Weltmass je
 * Meter Tiefe), nicht in Winkeln.
 *
 * Sie ist immer mittig um die Blickachse. Ein aussermittiges Fenster wird
 * *nicht* hier abgebildet, sondern hinterher durch Verschieben von Kamera und
 * Blickpunkt — s. `passeEin`. Der Versuch, die Asymmetrie in die Einpassung
 * zu ziehen, geht schief, sobald das Fenster die Blickachse gar nicht mehr
 * enthaelt (Karte ueber der halben Breite): dann steht in der Schranke eine
 * Division durch fast null und die Kamera wandert ins Nichts.
 */
interface Kamerabasis {
  richtung: V3
  xKam: V3
  yKam: V3
  tanH: number
  tanV: number
}

/** Mindestdistanz, bei der alle Ecken innerhalb beider Oeffnungswinkel liegen. */
function einpassDistanz(ecken: V3[], ziel: V3, b: Kamerabasis): number {
  let d = 0
  for (const p of ecken) {
    const v: V3 = [p[0] - ziel[0], p[1] - ziel[1], p[2] - ziel[2]]
    const tiefe = skalarprodukt(v, b.richtung)
    const bx = Math.abs(skalarprodukt(v, b.xKam))
    const by = Math.abs(skalarprodukt(v, b.yKam))
    d = Math.max(d, tiefe + bx / b.tanH, tiefe + by / b.tanV)
  }
  return Math.max(d, 0.5)
}

/**
 * Verschiebt das Ziel dorthin, wo das Modell im Bild tatsaechlich sitzt.
 *
 * Ohne diesen Schritt steht das Ziel zwar auf der Mitte der Huelle, das Bild
 * ist aber trotzdem nicht zentriert: die perspektivische Teilung vergroessert
 * die kameranahen Kanten, beim Dreiviertelblick also die Traufe. Genau deshalb
 * sass das Modell unten im Bild und das obere Drittel blieb leer.
 */
function zentriere(ecken: V3[], ziel: V3, b: Kamerabasis, d: number): V3 {
  let xMin = Infinity
  let xMax = -Infinity
  let yMin = Infinity
  let yMax = -Infinity
  let tiefeSumme = 0
  let n = 0
  for (const p of ecken) {
    const v: V3 = [p[0] - ziel[0], p[1] - ziel[1], p[2] - ziel[2]]
    const tiefe = d - skalarprodukt(v, b.richtung)
    if (tiefe < 1e-3) continue
    const sx = skalarprodukt(v, b.xKam) / tiefe
    const sy = skalarprodukt(v, b.yKam) / tiefe
    xMin = Math.min(xMin, sx)
    xMax = Math.max(xMax, sx)
    yMin = Math.min(yMin, sy)
    yMax = Math.max(yMax, sy)
    tiefeSumme += tiefe
    n++
  }
  if (!Number.isFinite(xMin)) return ziel
  // Umgerechnet wird mit der mittleren Ecktiefe, nicht mit der Zieldistanz:
  // ein Schub am Ziel verschiebt eine nahe Ecke im Bild staerker als eine
  // ferne. Mit `d` gerechnet bleibt bei einem aussermittigen Fenster jedes Mal
  // ein Rest stehen, und drei Durchlaeufe kommen nicht an.
  const tiefeMittel = tiefeSumme / n
  const mx = ((xMin + xMax) / 2) * tiefeMittel
  const my = ((yMin + yMax) / 2) * tiefeMittel
  return [
    ziel[0] + b.xKam[0] * mx + b.yKam[0] * my,
    ziel[1] + b.xKam[1] * mx + b.yKam[1] * my,
    ziel[2] + b.xKam[2] * mx + b.yKam[2] * my,
  ]
}

/**
 * Passt die Kamera auf das Modell ein, statt mit fester Distanz zu arbeiten.
 *
 * Gerechnet wird ueber die acht Ecken der Huelle im Kamerasystem: fuer jede
 * Ecke folgt aus der waagerechten und der senkrechten Oeffnung eine
 * Mindestdistanz, das Maximum davon gilt. Im Hochformat (aspect < 1) ist die
 * waagerechte Oeffnung die engere — genau der Fall, in dem der Dachstuhl
 * vorher links und rechts aus dem Bild lief. Anschliessend wird das Ziel auf
 * die Bildmitte nachgezogen und erneut eingepasst; drei Durchlaeufe genuegen.
 */
export function passeEin(
  preset: Kamerapreset,
  huelle: Huelle,
  aspect: number,
  sichtfeld?: Sichtfeld,
): Kameralage {
  const richtung = normiere(preset.richtung)
  // Bei der Draufsicht ist der Welt-Up-Vektor kollinear zur Blickrichtung;
  // dann muss eine andere Referenz her, sonst entartet das Kamerasystem.
  const referenz: V3 =
    Math.abs(skalarprodukt(richtung, [0, 1, 0])) > 0.999 ? [0, 0, -1] : [0, 1, 0]
  const xKam = normiere(kreuzprodukt(referenz, richtung))
  // xKam zeigt nach Bildschirm-rechts, yKam nach oben: `richtung` weist vom
  // Ziel zur Kamera, geblickt wird also entlang -richtung.
  const yKam = kreuzprodukt(richtung, xKam)
  // Die echte Oeffnung der Kamera — ohne `RAND`, denn sie beschreibt den
  // Bildrand selbst und nicht die Luft, die davor bleiben soll.
  const tanV = Math.tan(((FOV / 2) * Math.PI) / 180)
  const tanH = tanV * aspect

  const f = { ...OFFEN, ...sichtfeld }
  if (1 - f.links - f.rechts <= 0.05 || 1 - f.oben - f.unten <= 0.05) {
    // Unbrauchbare Angabe — lieber mittig einpassen als das Modell auf einen
    // Punkt zusammenziehen.
    f.links = f.rechts = f.oben = f.unten = 0
  }

  // Das freie Fenster in Bildkoordinaten (-1 .. +1): wo seine Mitte liegt und
  // wie weit es von dort reicht. `RAND` zieht es nach innen.
  const fenster = {
    mx: f.links - f.rechts,
    my: f.unten - f.oben,
    hx: (1 - f.links - f.rechts) / (1 + RAND),
    hy: (1 - f.oben - f.unten) / (1 + RAND),
  }

  // Eingepasst wird mittig auf die *Groesse* des Fensters. Wo es liegt,
  // erledigt danach der Versatz.
  const basis: Kamerabasis = {
    richtung,
    xKam,
    yKam,
    tanH: tanH * fenster.hx,
    tanV: tanV * fenster.hy,
  }

  let ziel: V3
  let distanz: number

  if (preset.ausschnitt === 'gesamt') {
    // Exakte Einpassung ueber die acht Eckpunkte der Huelle. Die Kastenform
    // ist hier die richtige: der Dachstuhl ist alles andere als kugelig, und
    // eine Huellkugel wuerde die Giebelansicht unnoetig weit wegruecken.
    const ecken: V3[] = []
    for (const x of [huelle.min[0], huelle.max[0]])
      for (const y of [huelle.min[1], huelle.max[1]])
        for (const z of [huelle.min[2], huelle.max[2]]) ecken.push([x, y, z])

    ziel = huelle.mitte
    distanz = einpassDistanz(ecken, ziel, basis)
    // Sechs statt drei Durchlaeufe: bei mittigem Fenster sitzt es nach zweien,
    // bei stark aussermittigem braucht es mehr. Es sind ein paar Dutzend
    // Multiplikationen, einmal je Groessenaenderung der Leinwand.
    for (let i = 0; i < 6; i++) {
      ziel = zentriere(ecken, ziel, basis, distanz)
      distanz = einpassDistanz(ecken, ziel, basis)
    }
  } else {
    // Detailblick: eine Kugel um das Ziel. Sie ist drehungsunabhaengig und
    // haelt den Ausschnitt beim Kippen des Geraets gleich gross — ein Kasten
    // wuerde je nach Blickrichtung um bis zu 70 % aufgehen.
    ziel = preset.ausschnitt.ziel
    distanz =
      preset.ausschnitt.radius /
      Math.sin(Math.min(Math.atan(basis.tanV), Math.atan(basis.tanH)))
  }
  distanz = Math.max(distanz, 0.5)

  // Jetzt sitzt das Modell mittig im Bild und hat die Groesse des Fensters.
  // Es fehlt der Weg dorthin, wo das Fenster wirklich liegt: Blickpunkt und
  // Kamera wandern gemeinsam, das Modell verschiebt sich dadurch im Bild.
  let vx = -fenster.mx * tanH * distanz
  let vy = -fenster.my * tanV * distanz

  if (preset.ausschnitt === 'gesamt') {
    // Die Verschiebung wirkt nicht auf alle Ecken gleich — eine kameranahe
    // wandert im Bild weiter als eine ferne, der Kasten schert also leicht.
    // Deshalb nachmessen statt hoffen: das Bild einmitten und, falls dabei
    // etwas ueber die Fensterkante geraet, die Distanz nachziehen. Drei
    // Durchlaeufe genuegen; gerechnet wird beim Einpassen der Leinwand, nicht
    // je Bild.
    const ecken = eckpunkte(huelle)
    for (let i = 0; i < 3; i++) {
      const k = bildkasten(ecken, ziel, xKam, yKam, richtung, distanz, vx, vy, tanH, tanV)
      if (!k) break
      vx -= (fenster.mx - (k.xMin + k.xMax) / 2) * tanH * distanz
      vy -= (fenster.my - (k.yMin + k.yMax) / 2) * tanV * distanz
      const ueber = Math.max(
        (k.xMax - k.xMin) / (2 * fenster.hx),
        (k.yMax - k.yMin) / (2 * fenster.hy),
      )
      if (ueber > 1.001) distanz *= ueber
    }
  }

  const blick: V3 = [
    ziel[0] + xKam[0] * vx + yKam[0] * vy,
    ziel[1] + xKam[1] * vx + yKam[1] * vy,
    ziel[2] + xKam[2] * vx + yKam[2] * vy,
  ]

  return {
    position: [
      blick[0] + richtung[0] * distanz,
      blick[1] + richtung[1] * distanz,
      blick[2] + richtung[2] * distanz,
    ],
    ziel: blick,
    distanz,
  }
}

/** Die acht Ecken der Huelle. */
function eckpunkte(h: Huelle): V3[] {
  const ecken: V3[] = []
  for (const x of [h.min[0], h.max[0]])
    for (const y of [h.min[1], h.max[1]])
      for (const z of [h.min[2], h.max[2]]) ecken.push([x, y, z])
  return ecken
}

/**
 * Wo die Huelle im fertigen Bild liegt, in Bildkoordinaten (-1 .. +1).
 * `null`, wenn etwas hinter der Kamera landet — dann ist nichts zu korrigieren.
 */
function bildkasten(
  ecken: V3[],
  ziel: V3,
  xKam: V3,
  yKam: V3,
  richtung: V3,
  distanz: number,
  vx: number,
  vy: number,
  tanH: number,
  tanV: number,
): { xMin: number; xMax: number; yMin: number; yMax: number } | null {
  let xMin = Infinity
  let xMax = -Infinity
  let yMin = Infinity
  let yMax = -Infinity
  for (const p of ecken) {
    // Lage der Ecke gegenueber dem verschobenen Blickpunkt.
    const v: V3 = [
      p[0] - ziel[0] - xKam[0] * vx - yKam[0] * vy,
      p[1] - ziel[1] - xKam[1] * vx - yKam[1] * vy,
      p[2] - ziel[2] - xKam[2] * vx - yKam[2] * vy,
    ]
    const tiefe = distanz - skalarprodukt(v, richtung)
    if (tiefe < 1e-3) return null
    const sx = skalarprodukt(v, xKam) / tiefe / tanH
    const sy = skalarprodukt(v, yKam) / tiefe / tanV
    xMin = Math.min(xMin, sx)
    xMax = Math.max(xMax, sx)
    yMin = Math.min(yMin, sy)
    yMax = Math.max(yMax, sy)
  }
  return Number.isFinite(xMin) ? { xMin, xMax, yMin, yMax } : null
}
