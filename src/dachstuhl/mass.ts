import type { DachstuhlParameter } from './parameter'

/**
 * Abgeleitete Masse. Rein rechnerisch, kein three-Import —
 * die Datei ist damit ohne Renderer pruefbar.
 */
export interface DachstuhlMasse {
  p: DachstuhlParameter

  tanA: number
  secA: number

  /** Mauerlatte aussen / innen, Grundrissstrecke First -> Auflager. */
  zMLa: number
  zMLi: number
  sG: number

  /** Achsenabschnitt der Sparrenunterkante: y(z) = C - |z| * tanA. */
  C: number
  /** Hoehenversatz Unterkante -> Oberkante Sparren, lotrecht gemessen. */
  dY: number

  /** Lotrechter Traufschnitt. */
  zT: number
  yFirstUK: number
  yFirstOK: number
  /** Sparrenlaenge entlang der Unterkante, First bis Traufspitze. */
  lS: number

  /** Dachlaenge inklusive Ortgangueberstand. */
  LD: number
  xMax: number
  nHalb: number
  /** Tatsaechliches Sparren-Achsmass. */
  e: number
  nPaare: number
  /** Sparrenachsen x_j, j = -nHalb .. +nHalb. */
  achsen: { j: number; x: number }[]

  zMP: number
  /** Innere / aeussere Flanke der Mittelpfette. */
  zMPi: number
  zMPa: number
  yMPuk: number
  zKB: number
  yKB: number
  /** Halbe Kehlbalkenlaenge inklusive 6 cm Einlassung im Sparren. */
  lKBh: number
  /** Halbe Firstpfettenbreite = Grundrissstrecke der Firstkerve. */
  zFiPa: number
  /** Scheitel der Firstpfette, also Firstpunkt der Kervenflaeche. */
  yFiPfirst: number
  yFiPok: number
  yFiPuk: number
  yBBok: number
  /** Oberkante Stuhlschwelle — darauf stehen alle Saeulen. */
  ySchwelleOk: number
  /** Kervenhoehe an Mittel- und Firstpfette (0, wenn `kerve` aus ist). */
  tKP: number
  /** Halbe Bundbalkenlaenge — dort trifft die Sparren-UK die Balken-OK. */
  zBBh: number

  /** j-Werte, auf denen Stuhlsaeulen stehen. */
  saeulenJ: number[]
  /** j-Werte mit Bundbalken (nur Achsen ueber dem Gebaeude). */
  bundbalkenJ: number[]

  /**
   * Dachflaechen-Frame: lokale z-Werte, an denen die
   * Sparrenoberkante beginnt (First) und endet (Traufe). Der Versatz
   * `-hS * tanA` kommt vom lotrechten First- und Traufschnitt: die
   * Sparren-OK ragt am First darueber hinaus und endet an der Traufe
   * entsprechend frueher. Lattung und Windrispen haengen daran.
   */
  dachZFirst: number
  dachZTraufe: number
  /** Aufbauhoehe ueber der Sparrenoberseite: Sparren + Konter- + Traglatte. */
  dachOben: number
  /** Aeussere Wange des aeussersten Sparrens = Ortgangkante. */
  xOrtgang: number

  /** Achsen der Traglatten im Dachflaechen-Frame, Traufe zuerst. */
  traglattenZ: number[]
  /** Tatsaechliche Lattweite (Traufgang ausgenommen). */
  lwIst: number
  /** Anzahl Traglatten je Dachhaelfte. */
  nTraglatten: number

  /** Dachflaeche ueber dem Grundriss bzw. gedeckte Flaeche inkl. Ueberstand. */
  aDachGrundriss: number
  aDachGedeckt: number

  /**
   * Achsparallele Huelle des gesamten Dachstuhls inklusive aller Ueberstaende
   * und Bretter. Die Kamera passt daran ein, statt mit festen Distanzen zu
   * arbeiten — sonst schneidet das Hochformat das Modell links und rechts ab.
   */
  huelle: Huelle
}

export interface Huelle {
  min: [number, number, number]
  max: [number, number, number]
  mitte: [number, number, number]
}

function runde(wert: number, stellen: number): number {
  const f = 10 ** stellen
  return Math.round(wert * f) / f
}

export function berechneMasse(p: DachstuhlParameter): DachstuhlMasse {
  const { q } = p

  const tanA = Math.tan(p.alpha)
  const secA = 1 / Math.cos(p.alpha)

  const zMLa = p.B / 2
  const zMLi = p.B / 2 - q.mauerlatte.b
  const sG = zMLi + q.mauerlatte.b / 2

  const tK = p.kerve ? p.tK : 0
  const C = zMLi * tanA + q.mauerlatte.h - tK
  const dY = q.sparren.h * secA

  const zT = p.B / 2 + p.ueT
  const yFirstUK = C
  const yFirstOK = C + dY
  const lS = zT * secA

  const LD = p.L + 2 * p.ueO
  const xMax = LD / 2 - q.sparren.b / 2
  const nHalb = Math.max(1, Math.round(xMax / p.eSoll))
  const e = xMax / nHalb
  const nPaare = 2 * nHalb + 1

  const achsen: { j: number; x: number }[] = []
  for (let j = -nHalb; j <= nHalb; j++) achsen.push({ j, x: j * e })

  // Auf den Zentimeter gerundet — so steht die Pfette auf einem Mass, das man abstecken kann.
  // Kerve ueber den beiden oberen Pfetten: die Pfettenoberkante liegt um
  // `tKP` ueber der Sparrenunterkante, der Sparren ist darueber ausgeklinkt.
  // Das gibt an jedem Auflager eine waagerechte Auflagerflaeche plus zwei
  // senkrechte Anschlagflaechen — genau das Detail, an dem man einen
  // abgebundenen Dachstuhl von gestapelten Quadern unterscheidet.
  const tKP = p.kerve ? p.tKPfette : 0

  const zMP = runde(p.fMP * sG, 2)
  const zMPi = zMP - q.mittelpfette.b / 2
  const zMPa = zMP + q.mittelpfette.b / 2
  const yMPuk = C - zMP * tanA + tKP - q.mittelpfette.h
  const zKB = runde(p.fKB * sG, 2)
  const yKB = C - zKB
  const lKBh = C - yKB + q.kehlbalken.h / 2 + 0.06

  const zFiPa = q.firstpfette.b / 2
  const yFiPfirst = C + tKP
  const yFiPok = C - zFiPa * tanA + tKP
  const yFiPuk = yFiPok - q.firstpfette.h

  const yBBok = q.bundbalken.h
  const ySchwelleOk = yBBok + q.stuhlschwelle.h
  const zBBh = C - q.bundbalken.h

  // Bundbalken nur auf Achsen, die vollstaendig ueber dem Gebaeude liegen.
  // Die beiden aeussersten Sparrenpaare sind Ortgangsparren; sie kragen ueber
  // den Giebel aus und werden von den Pfetten getragen, nicht von einem Balken.
  const bundbalkenJ = achsen
    .filter(({ x }) => Math.abs(x) + q.bundbalken.b / 2 <= p.L / 2)
    .map(({ j }) => j)

  // Stuhlsaeulen stehen auf Bundbalken, also nur innerhalb des Gebaeudes.
  const jMax = bundbalkenJ.length > 0 ? Math.max(...bundbalkenJ) : 0
  const nSaeulen = Math.max(2, Math.round((2 * jMax * e) / p.stuhlRaster) + 1)
  const saeulenJ: number[] = []
  for (let i = 0; i < nSaeulen; i++) {
    const j = Math.round(-jMax + (i * (2 * jMax)) / (nSaeulen - 1))
    if (!saeulenJ.includes(j)) saeulenJ.push(j)
  }

  // Lattung: die Latten haengen am Dachflaechen-Frame, nicht an der
  // Sparrenlaenge. Erste Latte buendig an der Traufkante, dann durchlaufend
  // mit konstanter Lattweite bis zur Firstlatte unter dem Firstpunkt.
  const dachZFirst = -q.sparren.h * tanA
  const dachZTraufe = lS - q.sparren.h * tanA

  const zTraufLatte = dachZTraufe - 0.04
  const zFirstLatte = dachZFirst + 0.06
  const spann = zTraufLatte - zFirstLatte
  const traufgang = 0.85 * p.lw
  const nFelder = Math.max(1, Math.round((spann - traufgang) / p.lw))
  const lwIst = (spann - traufgang) / nFelder
  const alleLatten = [zTraufLatte]
  for (let i = 0; i <= nFelder; i++) alleLatten.push(zTraufLatte - traufgang - i * lwIst)
  const traglattenZ = alleLatten.slice(
    0,
    Math.max(
      0,
      Math.min(alleLatten.length, Math.round(p.lattungAnteil * alleLatten.length)),
    ),
  )
  const nTraglatten = traglattenZ.length

  const aDachGrundriss = p.B * p.L * secA
  const aDachGedeckt = (p.B + 2 * p.ueT) * (p.L + 2 * p.ueO) * secA

  // ---- Huelle -------------------------------------------------------------
  // Die Dachflaeche liegt im gedrehten Frame; ihre vier Profilecken werden
  // deshalb einzeln in Weltkoordinaten umgerechnet. Alles andere (Rohdecke,
  // First, Ortgangkante) liegt bereits in Weltmassen vor.
  const dachOben = q.sparren.h + q.konterlatte.h + q.traglatte.h
  const xOrtgang = LD / 2
  const cosA = Math.cos(p.alpha)
  const sinA = Math.sin(p.alpha)
  const yEcken: number[] = []
  const zEcken: number[] = []
  for (const zLokal of [dachZFirst, dachZTraufe]) {
    for (const yLokal of [0, dachOben]) {
      yEcken.push(C + yLokal * cosA - zLokal * sinA)
      zEcken.push(yLokal * sinA + zLokal * cosA)
    }
  }
  const zAussen = Math.max(...zEcken.map(Math.abs), zT + q.traufbohle.b)
  const huelle: Huelle = {
    min: [-xOrtgang - q.ortgangbrett.b, -p.rohdeckeDicke, -zAussen],
    max: [xOrtgang + q.ortgangbrett.b, Math.max(yFirstOK, ...yEcken), zAussen],
    mitte: [0, 0, 0],
  }
  huelle.mitte = [0, (huelle.min[1] + huelle.max[1]) / 2, 0]

  const masse: DachstuhlMasse = {
    p,
    tanA,
    secA,
    zMLa,
    zMLi,
    sG,
    C,
    dY,
    zT,
    yFirstUK,
    yFirstOK,
    lS,
    LD,
    xMax,
    nHalb,
    e,
    nPaare,
    achsen,
    zMP,
    zMPi,
    zMPa,
    yMPuk,
    zKB,
    yKB,
    lKBh,
    zFiPa,
    yFiPfirst,
    yFiPok,
    yFiPuk,
    yBBok,
    ySchwelleOk,
    tKP,
    zBBh,
    saeulenJ,
    bundbalkenJ,
    dachZFirst,
    dachZTraufe,
    dachOben,
    xOrtgang,
    traglattenZ,
    lwIst,
    nTraglatten,
    aDachGrundriss,
    aDachGedeckt,
    huelle,
  }

  if (import.meta.env.DEV) pruefeKontrollwerte(masse)
  return masse
}

/** Nachgerechnete Kontrollwerte — schlagen nur im Standardparametersatz an. */
function pruefeKontrollwerte(m: DachstuhlMasse): void {
  const p = m.p
  const istStandard =
    p.B === 8.5 && p.L === 10 && Math.abs(p.alpha - Math.PI / 4) < 1e-9 && p.kerve

  const abweichungen: string[] = []
  const pruefe = (name: string, ist: number, soll: number, toleranz: number) => {
    if (Math.abs(ist - soll) > toleranz) {
      abweichungen.push(`${name}: ${ist.toFixed(4)} statt ${soll.toFixed(4)}`)
    }
  }

  if (istStandard) {
    pruefe('Firsthoehe OK', m.yFirstOK, 4.5028, 0.001)
    pruefe('Sparrenlaenge', m.lS, 6.859, 0.001)
    pruefe('Achsmass e', m.e, 0.75143, 0.0005)
    pruefe('Sparrenpaare', m.nPaare, 15, 0)
    pruefe(
      'lichte Hoehe unter Kehlbalken',
      m.yKB - m.p.q.kehlbalken.h / 2 - m.yBBok,
      2.51,
      0.01,
    )
    pruefe('Stuhlraster', 6 * m.e, 4.509, 0.005)
    pruefe('Dachflaeche ueber Grundriss', m.aDachGrundriss, 120.2, 0.2)
    pruefe('Dachflaeche gedeckt', m.aDachGedeckt, 145.4, 0.2)
    if (m.p.lattungAnteil === 1) pruefe('Traglatten je Haelfte', m.nTraglatten, 22, 0)
  }

  // Die Lattung muss die Sparrenoberkante vollstaendig belegen. Genau hier
  // lag der Fehler, der die Latten um `hS * tanA` traufwaerts verschoben und
  // das Dach oben nackt gelassen hat.
  if (m.p.lattungAnteil === 1 && m.traglattenZ.length > 0) {
    const oberste = m.traglattenZ[m.traglattenZ.length - 1]
    const unterste = m.traglattenZ[0]
    if (oberste - m.dachZFirst > 0.12)
      abweichungen.push('Firstlatte fehlt: Lattung endet zu frueh')
    if (m.dachZTraufe - unterste > 0.1)
      abweichungen.push('Traufllatte sitzt nicht an der Traufkante')
    if (unterste > m.dachZTraufe || oberste < m.dachZFirst) {
      abweichungen.push('Lattung ragt ueber die Sparrenoberkante hinaus')
    }
  }
  if (m.lwIst < 0.28 || m.lwIst > 0.36)
    abweichungen.push(`Lattweite ausserhalb 0,28-0,36 m: ${m.lwIst}`)

  // Parametersatz-unabhaengige Plausibilitaet.
  if (m.e < 0.6 || m.e > 1.0) abweichungen.push(`Achsmass ausserhalb 0,60-1,00 m: ${m.e}`)
  if (m.lKBh > m.C + m.dY - (m.yKB + m.p.q.kehlbalken.h / 2)) {
    abweichungen.push('Kehlbalken tritt an der Sparrenoberkante aus')
  }

  if (abweichungen.length > 0) {
    console.warn('[dachstuhl] Kontrollwerte weichen ab:\n' + abweichungen.join('\n'))
  }
}
