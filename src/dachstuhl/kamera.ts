import type { Huelle } from './mass'

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
 * Das Bildfenster, in das eingepasst wird — in Steigungen (Weltmass je Meter
 * Tiefe), nicht in Winkeln.
 *
 * Es ist ausdruecklich *nicht* mittig: liegt links eine Textkarte, reicht das
 * Fenster nur noch von der Kartenkante bis zum rechten Rand. Darum vier
 * Grenzen statt zweier Oeffnungswinkel.
 */
interface Kamerabasis {
  richtung: V3
  xKam: V3
  yKam: V3
  xLo: number
  xHi: number
  yLo: number
  yHi: number
}

/** Mindestdistanz, bei der alle Ecken im Fenster liegen. */
function einpassDistanz(ecken: V3[], ziel: V3, b: Kamerabasis): number {
  let d = 0
  for (const p of ecken) {
    const v: V3 = [p[0] - ziel[0], p[1] - ziel[1], p[2] - ziel[2]]
    const tiefe = skalarprodukt(v, b.richtung)
    const ax = skalarprodukt(v, b.xKam)
    const ay = skalarprodukt(v, b.yKam)
    // Aus `ax / (d - tiefe) <= xHi` und `>= xLo` folgen zwei Schranken an d.
    // Weil xLo negativ und xHi positiv ist, bindet immer genau eine — welche,
    // haengt am Vorzeichen von ax. Das Maximum trifft beide Faelle.
    d = Math.max(d, tiefe + Math.max(ax / b.xHi, ax / b.xLo))
    d = Math.max(d, tiefe + Math.max(ay / b.yHi, ay / b.yLo))
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
  // Nicht auf die Bildmitte, sondern auf die Mitte des freien Fensters.
  const mx = ((xMin + xMax) / 2 - (b.xLo + b.xHi) / 2) * tiefeMittel
  const my = ((yMin + yMax) / 2 - (b.yLo + b.yHi) / 2) * tiefeMittel
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

  // Das freie Fenster in Bildkoordinaten (-1 .. +1), dann um `RAND` nach innen
  // gezogen und in Steigungen umgerechnet.
  const luft = (lo: number, hi: number): [number, number] => {
    const m = (lo + hi) / 2
    return [m + (lo - m) / (1 + RAND), m + (hi - m) / (1 + RAND)]
  }
  const [xLo, xHi] = luft(-1 + 2 * f.links, 1 - 2 * f.rechts)
  const [yLo, yHi] = luft(-1 + 2 * f.unten, 1 - 2 * f.oben)

  const basis: Kamerabasis = {
    richtung,
    xKam,
    yKam,
    xLo: xLo * tanH,
    xHi: xHi * tanH,
    yLo: yLo * tanV,
    yHi: yHi * tanV,
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
    const halbX = (basis.xHi - basis.xLo) / 2
    const halbY = (basis.yHi - basis.yLo) / 2
    distanz =
      preset.ausschnitt.radius / Math.sin(Math.min(Math.atan(halbX), Math.atan(halbY)))
  }
  distanz = Math.max(distanz, 0.5)

  // Beim Gesamtblick hat `zentriere` das Modell schon auf die Fenstermitte
  // gezogen. Beim Detailblick ist das Ziel ein fester Punkt — der wird hier
  // nachtraeglich versetzt. Fuer einen Punkt genau auf Zieltiefe ist das
  // exakt: Kamera und Blickpunkt wandern gemeinsam.
  const versatz =
    preset.ausschnitt === 'gesamt'
      ? { x: 0, y: 0 }
      : {
          x: (-(basis.xLo + basis.xHi) / 2) * distanz,
          y: (-(basis.yLo + basis.yHi) / 2) * distanz,
        }
  const blick: V3 = [
    ziel[0] + xKam[0] * versatz.x + yKam[0] * versatz.y,
    ziel[1] + xKam[1] * versatz.x + yKam[1] * versatz.y,
    ziel[2] + xKam[2] * versatz.x + yKam[2] * versatz.y,
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
