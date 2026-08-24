/**
 * Die **Geometrie der Zeichnung** — Weltkoordinaten, Kamerarahmen und die
 * Regeln des Kellerrasters.
 *
 * Warum neben `kanon.ts` noch eine Datei: `kanon.ts` ist der Vertrag *zwischen*
 * Steps und Bühne — Farben, Zustandsform, die zwei Rechenregeln, die beide
 * Seiten brauchen. Was hier steht, ist die Zeichnung selbst: wo die Kellerdecke
 * liegt, wie hoch der First steht, welche Rasterknoten die Treppe verstellt.
 * Das geht die Steps nichts an, und es soll sie auch nicht angehen — sonst
 * hängt der Text eines Screens an einer Koordinate.
 *
 * Ausnahme, und sie ist bewusst: `TRAGENDE_WAND`, `START` und `ZIEL` stehen
 * hier, obwohl A4 über sie redet. Der Grund ist derselbe wie bei
 * `onAbgewiesen` — **die Zeichnung erkennt die Wand, den Satz dazu sagt der
 * Step** (Spec 6, A4). Wer den Satz textet, will wissen, worauf er sich
 * bezieht; deshalb sind die drei exportiert und nicht versteckt.
 *
 * Die Datei ist three-frei und JSX-frei, wie `kanon.ts`. Dieser Tag hat kein
 * `three` (Spec 7), aber die Trennung hält die Grenze trotzdem sauber.
 *
 * ---
 *
 * **Die Welt ist ein Haus mit einem Keller darunter**, 320 × 260 Einheiten, und
 * jede Szene ist ein Ausschnitt daraus. Das ist die gezeichnete Fassung von
 * „eine Welt, viele Zustände" (khpl-tage.md 1, Mechanismus 2): A2 und A4 sehen
 * denselben Keller, A3 sieht das Haus darüber, A6 sieht beides — und weil es
 * dieselben Koordinaten sind, ist es sichtbar dasselbe Haus und nicht drei
 * Bilder, die einander ähneln.
 */

import { RASTER, knoten, zerlegeKnoten, type KnotenId } from './kanon'

// ---------------------------------------------------------------------------
// Die Welt
// ---------------------------------------------------------------------------

/** Der Zeichenraum, in dem alles liegt. */
export const WELT = { breite: 320, hoehe: 260 } as const

/**
 * Die tragenden Linien des Schnitts. Alles andere hängt daran, damit sich das
 * Haus an einer Stelle verschieben lässt und nicht an vierzig.
 */
export const HAUS = {
  /** Außenkanten der Wände. */
  aussenLinks: 62,
  aussenRechts: 258,
  innenLinks: 70,
  innenRechts: 250,
  /** Dachfirst und Traufe. */
  first: 22,
  traufe: 66,
  dachLinks: 46,
  dachRechts: 274,
  /** Decke zwischen Erdgeschoss und Obergeschoss. */
  deckeOg: 108,
  /** Geländeoberkante — hier fängt das Erdreich an. */
  gelaende: 150,
  /** Unterkante der Kellerdecke. */
  kellerDecke: 156,
  kellerBoden: 236,
} as const

/** Die vier Heizkörper des Hauses — zwei Geschosse, zwei Stränge. */
export const HEIZKOERPER: readonly {
  id: string
  x: number
  y: number
  breite: number
  hoehe: number
  /** Auf welcher Seite der Thermostatkopf sitzt. */
  kopf: 'links' | 'rechts'
}[] = [
  { id: 'og-links', x: 86, y: 84, breite: 32, hoehe: 18, kopf: 'links' },
  { id: 'og-rechts', x: 202, y: 84, breite: 32, hoehe: 18, kopf: 'rechts' },
  { id: 'eg-links', x: 86, y: 126, breite: 32, hoehe: 18, kopf: 'links' },
  { id: 'eg-rechts', x: 202, y: 126, breite: 32, hoehe: 18, kopf: 'rechts' },
]

/**
 * Die beiden Steigstränge, die vom Verteiler nach oben gehen.
 *
 * **Beide stehen links der tragenden Wand**, und das ist kein Zufall: eine
 * Wand, durch die schon die halbe Anlage läuft, ist als Hindernis in A4 nicht
 * mehr glaubwürdig. Der rechte Strang verteilt oben waagerecht weiter — so
 * liegt eine Heizung tatsächlich, und die Wand bleibt dicht.
 */
export const STRANG = { links: 78, rechts: 160, oben: 80 } as const

/** Die Leitung, die unter der Kellerdecke vom Verteiler zum rechten Strang läuft. */
export const STRANGVERTEILUNG_Y = 160

/**
 * **Wo die Thermostatventile sitzen — an jedem Heizkörper eins.**
 *
 * Der Text in A2 sagt „an jedem Heizkörper eins"; die Vorfassung markierte
 * beim Antippen trotzdem nur ein einziges. Deshalb steht die Gruppe jetzt hier
 * und wird aus `HEIZKOERPER` abgeleitet: vier Heizkörper, vier Ventile, und wer
 * die Gruppe antippt, sieht alle vier.
 *
 * Der Kopf sitzt am Anschluss zwischen Strang und Heizkörper — also auf der
 * Seite, auf der der Strang steht. Zwei der vier liegen im Kellerrahmen von A2
 * über der Bildkante; das ist richtig so, sie sitzen im Obergeschoss.
 */
export const THERMOSTAT_ORTE: readonly { id: string; x: number; y: number }[] =
  HEIZKOERPER.map((hk) => {
    const strang = hk.kopf === 'links' ? STRANG.links : STRANG.rechts
    const linksVomKoerper = strang < hk.x
    return {
      id: hk.id,
      x: linksVomKoerper ? hk.x - 6 : hk.x + hk.breite + 6,
      y: hk.y + hk.hoehe / 2,
    }
  })

// ---------------------------------------------------------------------------
// Kamera
// ---------------------------------------------------------------------------

export interface Rahmen {
  x: number
  y: number
  b: number
  h: number
}

/**
 * Was jede Szene zeigt. **Nicht** über `viewBox`, sondern als Transform auf
 * einer Gruppe: die `viewBox` bleibt für alle Szenen dieselbe, damit ein
 * Wechsel eine Kamerafahrt sein kann und kein Bildwechsel.
 */
export const RAHMEN = {
  /** A2 — der Keller, plus ein Streifen Erdgeschoss für die Thermostatventile. */
  keller: { x: 52, y: 106, b: 216, h: 176 },
  /** A3 — das ganze Haus. */
  haus: { x: 30, y: 12, b: 260, h: 238 },
  /** A4 — der Keller als Raster, enger als A2: hier wird gezogen. */
  raster: { x: 54, y: 112, b: 212, h: 172 },
  /** A6 — Keller und Haus zusammen. Die Wärme läuft durch beides. */
  inbetriebnahme: { x: 30, y: 12, b: 260, h: 238 },
  /** A7 — der Keller, und darüber angeschnitten das Haus. */
  uebergabe: { x: 42, y: 60, b: 236, h: 190 },
} as const satisfies Record<string, Rahmen>

/**
 * Der Transform, der `rahmen` bildfüllend in die Welt legt — dieselbe Rechnung
 * wie `preserveAspectRatio="xMidYMid meet"`, nur eine Ebene tiefer, damit die
 * `viewBox` konstant bleiben kann.
 *
 * ⚠️ **Der Rahmen ist ein Mindestausschnitt, kein Fenster.** Er wird auf das
 * Seitenverhältnis der `viewBox` aufgezogen, und was dann noch daneben liegt,
 * würde weiterhin gezeichnet — ein SVG beschneidet an seinem Element, nicht an
 * seiner `viewBox`. Deshalb liegt die Kameragruppe in einem `clipPath`; ohne
 * ihn ragen bei A4 die Geschosse über dem Keller ins Bild, und der Screen sieht
 * aus, als sei er falsch zugeschnitten.
 */
export function kamera(rahmen: Rahmen): string {
  const k = Math.min(WELT.breite / rahmen.b, WELT.hoehe / rahmen.h)
  const tx = WELT.breite / 2 - k * (rahmen.x + rahmen.b / 2)
  const ty = WELT.hoehe / 2 - k * (rahmen.y + rahmen.h / 2)
  return `translate(${tx} ${ty}) scale(${k})`
}

// ---------------------------------------------------------------------------
// Das Kellerraster (A4)
// ---------------------------------------------------------------------------

/** Wo Knoten `0,0` liegt und wie weit die nächsten stehen. */
export const RASTER_URSPRUNG = { x: 92, y: 168 } as const
export const RASTER_SCHRITT = { x: 17, y: 15 } as const

export interface Punkt {
  x: number
  y: number
}

export function knotenPunkt(id: KnotenId): Punkt | null {
  const k = zerlegeKnoten(id)
  if (!k) return null
  return {
    x: RASTER_URSPRUNG.x + k.spalte * RASTER_SCHRITT.x,
    y: RASTER_URSPRUNG.y + k.zeile * RASTER_SCHRITT.y,
  }
}

/** Alle Knoten des Rasters, zeilenweise. */
export const ALLE_KNOTEN: readonly KnotenId[] = Array.from(
  { length: RASTER.spalten * RASTER.zeilen },
  (_, i) => knoten(i % RASTER.spalten, Math.floor(i / RASTER.spalten)),
)

/**
 * **Die Wärmepumpe** steht in der rechten Kellerkammer — dort, wo der alte
 * Ölkessel nie stand und wo die Leitung von draußen hereinkommt. Der Weg
 * beginnt an ihrem Anschluss.
 */
export const START: KnotenId = knoten(8, 1)

/** **Der Verteiler** hängt an der linken Kellerwand, bei der alten Anlage. */
export const ZIEL: KnotenId = knoten(0, 1)

/**
 * Die Kellertreppe. Sie verstellt vier Knoten — und sie ist der Grund, warum
 * der kurze Weg überhaupt Bögen hat: ohne etwas im Raum wäre die kürzeste
 * Leitung auch die geradeste, und der Screen hätte nichts zu erzählen.
 *
 * Anders als die tragende Wand meldet sie nichts: an einer Treppe zieht man
 * keine Leitung vorbei und bekommt dafür einen Satz, man sieht einfach, dass
 * da eine Treppe ist.
 */
export const TREPPE: readonly KnotenId[] = [
  knoten(2, 0),
  knoten(2, 1),
  knoten(3, 0),
  knoten(3, 1),
]

/**
 * **Die tragende Wand.** Sie steht zwischen Spalte 5 und 6, reicht von der
 * Kellerdecke bis über Türhöhe und lässt in den oberen drei Zeilen nichts
 * durch. Was darunter fehlt, ist der Durchgang — im Schnitt ist eine Tür
 * genau das: eine Lücke im Band.
 *
 * Wer hier durch will, bekommt keinen Punktabzug, sondern einen Satz — „Da
 * geht nichts durch, das ist tragend" — und die Leitung geht nicht weiter
 * (Spec 6, A4). **Den Satz sagt der Step**, damit die Copy an einer Stelle
 * liegt; die Zeichnung meldet nur über `onAbgewiesen`.
 */
export const TRAGENDE_WAND = {
  /** Zwischen dieser Spalte und der nächsten. */
  spalte: 5,
  /** Diese Zeilen lässt sie nicht durch. */
  zeilen: [0, 1, 2] as readonly number[],
  /** Die gezeichnete Wand, in Weltkoordinaten. */
  x: 182,
  breite: 8,
  oben: 156,
  unten: 205,
} as const

/**
 * Der Weg, den A4 meint, wenn es „der richtige" sagt: zwei Bögen, unten durch
 * den Durchgang statt oben durch die Wand.
 *
 * ⚠️ Auf diesem Raster ist er **zugleich der kürzeste legale Weg** — die Wand
 * sperrt die Zeilen 0–2 vollständig, einen Durchbruch gibt es nicht. Jeder Weg
 * mit mehr Bögen ist gleich lang oder länger. Der Handel aus Spec 6 („der
 * kürzeste Weg hat vier Bögen und einen Durchbruch") existiert hier also nicht;
 * A4 textet deshalb, was auf dem Raster wirklich passiert, und meldet den
 * Widerspruch, statt die Geometrie eigenmächtig umzubauen.
 *
 * Er ist zugleich der **Rückfall für A6 und A7**: kommt dort ein leerer Pfad
 * an — weil der Besucher A4 übersprungen oder nichts gezogen hat —, läuft die
 * Wärme diesen Weg. Ein Signaturmoment ohne Leitung wäre kein Signaturmoment.
 */
export const RICHTIGER_WEG: readonly KnotenId[] = [
  knoten(8, 1),
  knoten(8, 2),
  knoten(8, 3),
  knoten(7, 3),
  knoten(6, 3),
  knoten(5, 3),
  knoten(4, 3),
  knoten(3, 3),
  knoten(2, 3),
  knoten(1, 3),
  knoten(0, 3),
  knoten(0, 2),
  knoten(0, 1),
]

export function istVerstellt(id: KnotenId): boolean {
  return TREPPE.includes(id)
}

/** Liegt zwischen `a` und `b` die tragende Wand? */
export function kreuztWand(a: KnotenId, b: KnotenId): boolean {
  const p = zerlegeKnoten(a)
  const q = zerlegeKnoten(b)
  if (!p || !q || p.zeile !== q.zeile) return false
  if (!TRAGENDE_WAND.zeilen.includes(p.zeile)) return false
  const links = Math.min(p.spalte, q.spalte)
  return links === TRAGENDE_WAND.spalte && Math.abs(p.spalte - q.spalte) === 1
}

function benachbart(a: KnotenId, b: KnotenId): boolean {
  const p = zerlegeKnoten(a)
  const q = zerlegeKnoten(b)
  if (!p || !q) return false
  return Math.abs(p.spalte - q.spalte) + Math.abs(p.zeile - q.zeile) === 1
}

/** Was passiert, wenn der Besucher von seinem Weg aus `ziel` berührt. */
export type Zug =
  | { art: 'nichts' }
  /** Der Weg wächst um einen Knoten. */
  | { art: 'weiter'; pfad: readonly KnotenId[] }
  /** Zurück auf den vorletzten Knoten — der Besucher nimmt zurück. */
  | { art: 'zurueck'; pfad: readonly KnotenId[] }
  /** Die tragende Wand. Der Step sagt den Satz. */
  | { art: 'wand'; knoten: KnotenId }

/**
 * Die eine Regel des Ziehens, an einer Stelle: von hier aus einen Schritt
 * weiter, zurücknehmen, oder eben nicht.
 *
 * `pfad` ist immer der volle Weg ab `START` — die Zeichnung hält keinen
 * eigenen Zustand, sie schlägt einen neuen Weg vor und der Step entscheidet.
 */
export function zieheNach(pfad: readonly KnotenId[], ziel: KnotenId): Zug {
  const weg = pfad.length > 0 ? pfad : [START]
  const letzter = weg[weg.length - 1]
  if (ziel === letzter) return { art: 'nichts' }

  // Zurücknehmen: der Besucher fährt auf den vorletzten Knoten zurück.
  if (weg.length > 1 && ziel === weg[weg.length - 2]) {
    return { art: 'zurueck', pfad: weg.slice(0, -1) }
  }

  if (!benachbart(letzter, ziel)) return { art: 'nichts' }
  if (kreuztWand(letzter, ziel)) return { art: 'wand', knoten: ziel }
  if (istVerstellt(ziel)) return { art: 'nichts' }
  // Der eigene Weg wird nicht zweimal belegt.
  if (weg.includes(ziel)) return { art: 'nichts' }

  return { art: 'weiter', pfad: [...weg, ziel] }
}

/** Der Weg als SVG-Pfad. Leer, solange nichts gezogen ist. */
export function pfadDaten(pfad: readonly KnotenId[]): string {
  const punkte = pfad.map(knotenPunkt).filter((p): p is Punkt => p !== null)
  if (punkte.length < 2) return ''
  return punkte.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`).join(' ')
}

/**
 * Derselbe Weg mit gerundeten Ecken. Der Fluss dieses Tages hört bei einer
 * 90-Grad-Ecke auf — eine gebogene Leitung ist außerdem das, was tatsächlich
 * verlegt wird.
 */
export function pfadDatenWeich(pfad: readonly KnotenId[], radius = 5): string {
  const p = pfad.map(knotenPunkt).filter((q): q is Punkt => q !== null)
  if (p.length < 2) return ''
  if (p.length === 2) return `M${p[0].x} ${p[0].y} L${p[1].x} ${p[1].y}`

  let d = `M${p[0].x} ${p[0].y}`
  for (let i = 1; i < p.length - 1; i++) {
    const vor = p[i - 1]
    const hier = p[i]
    const nach = p[i + 1]
    const gerade =
      Math.sign(hier.x - vor.x) === Math.sign(nach.x - hier.x) &&
      Math.sign(hier.y - vor.y) === Math.sign(nach.y - hier.y)
    if (gerade) {
      d += ` L${hier.x} ${hier.y}`
      continue
    }
    const r = Math.min(
      radius,
      Math.hypot(hier.x - vor.x, hier.y - vor.y) / 2,
      Math.hypot(nach.x - hier.x, nach.y - hier.y) / 2,
    )
    const ein = versetze(hier, vor, r)
    const aus = versetze(hier, nach, r)
    d += ` L${ein.x} ${ein.y} Q${hier.x} ${hier.y} ${aus.x} ${aus.y}`
  }
  const letzter = p[p.length - 1]
  return `${d} L${letzter.x} ${letzter.y}`
}

function versetze(von: Punkt, richtung: Punkt, laenge: number): Punkt {
  const dx = richtung.x - von.x
  const dy = richtung.y - von.y
  const l = Math.hypot(dx, dy) || 1
  return { x: von.x + (dx / l) * laenge, y: von.y + (dy / l) * laenge }
}

/** Der nächste Knoten zu einem Punkt — oder `null`, wenn keiner nah genug ist. */
export function knotenBei(x: number, y: number, radius = 11): KnotenId | null {
  let bester: KnotenId | null = null
  let beste = radius * radius
  for (const id of ALLE_KNOTEN) {
    const p = knotenPunkt(id)
    if (!p) continue
    const d = (p.x - x) ** 2 + (p.y - y) ** 2
    if (d < beste) {
      beste = d
      bester = id
    }
  }
  return bester
}

// ---------------------------------------------------------------------------
// Der Keller, gezeichnet (A2 · A4 · A6 · A7)
// ---------------------------------------------------------------------------

export interface Kasten {
  x: number
  y: number
  b: number
  h: number
}

/**
 * Wo die sechs Bauteile aus `BAUTEILE` im Kellerschnitt stehen (A2).
 *
 * Alles, was zur alten Anlage gehört, steht **links** der tragenden Wand — die
 * rechte Kammer ist die leere, in die in A4 die Wärmepumpe kommt. Das ist der
 * Grund, warum die Leitung überhaupt durch die Wand muss.
 *
 * `thermostatventile` sind die Ausnahme: sie sitzen nicht im Keller, sondern
 * am Heizkörper darüber. Deshalb zeigt der Kellerrahmen einen Streifen
 * Erdgeschoss mit.
 */
export const BAUTEIL_ORTE: Record<string, Kasten> = {
  verteiler: { x: 70, y: 164, b: 20, h: 24 },
  tank: { x: 70, y: 194, b: 42, h: 34 },
  kessel: { x: 154, y: 188, b: 30, h: 40 },
  pumpe: { x: 113, y: 165, b: 14, h: 14 },
  ausdehnungsgefaess: { x: 94, y: 156, b: 16, h: 24 },
  thermostatventile: { x: 78, y: 126, b: 40, h: 18 },
}

/** Die Kellertreppe als Umriss — Antritt oben rechts, Austritt unten links. */
export const TREPPE_ORT = { obenX: 155, obenY: 160, untenX: 114, untenY: 202 } as const

/** Die Wärmepumpe, die in A4 in der rechten Kammer steht. */
export const WAERMEPUMPE_ORT: Kasten = { x: 230, y: 170, b: 20, h: 56 }

// ---------------------------------------------------------------------------
// Der Anlagenausschnitt (A1)
// ---------------------------------------------------------------------------

/**
 * **Die Punkte, die man in A1 antippt.**
 *
 * Den Kern nennt die Spec für diese Bühne selbst (Spec 6, A1: „Speicher,
 * Zirkulation, Mischer, Umwälzpumpe"); dazu kommen der Wärmeerzeuger und die
 * Regelung, weil der Fall in `steps/anlagenmechanik/A1.tsx` sie prüft und ein
 * Prüfschritt ohne Ort auf der Zeichnung eine Zeile im Panel wäre statt einer
 * Handlung an der Anlage.
 *
 * **Was hier bewusst nicht steht: welcher Punkt der richtige ist.** Die
 * Störung, die Prüfschritte und die Ursache sind laut Spec 11 fachlich
 * abzunehmen — die Zeichnung kennt Orte, keine Lösung.
 *
 * Der Vertrag zum Step: `PruefungId` ist ein freier String (`kanon.ts`), und
 * die Zeichnung hebt die Prüfung hervor, deren Id einem dieser Punkte
 * entspricht. Eine Prüfung ohne Punkt ist kein Fehler — sie läuft im Panel und
 * lässt die Zeichnung ruhig.
 */
export const ANLAGENPUNKTE: readonly {
  id: string
  label: string
  x: number
  y: number
}[] = [
  { id: 'speicher', label: 'Speicher', x: 96, y: 142 },
  { id: 'zirkulation', label: 'Zirkulation', x: 176, y: 116 },
  { id: 'mischer', label: 'Mischer', x: 196, y: 132 },
  { id: 'ladepumpe', label: 'Speicherladepumpe', x: 176, y: 168 },
  { id: 'kessel', label: 'Wärmeerzeuger', x: 238, y: 200 },
  { id: 'regelung', label: 'Regelung', x: 256, y: 146 },
]

/** Der Rahmen des Anlagenausschnitts. Eigene Zeichnung, eigene Welt. */
export const RAHMEN_ANLAGE: Rahmen = { x: 28, y: 24, b: 256, h: 212 }
