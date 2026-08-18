import type { DachstuhlParameter } from './parameter'

/**
 * Abgeleitete Masse (Bauplan 1.4). Rein rechnerisch, kein three-Import —
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
  yMPuk: number
  zKB: number
  yKB: number
  /** Halbe Kehlbalkenlaenge inklusive 6 cm Einlassung im Sparren. */
  lKBh: number
  yFiPok: number
  yFiPuk: number
  yBBok: number
  /** Halbe Bundbalkenlaenge — dort trifft die Sparren-UK die Balken-OK. */
  zBBh: number

  /** j-Werte, auf denen Stuhlsaeulen stehen. */
  saeulenJ: number[]
  /** j-Werte mit Bundbalken (nur Achsen ueber dem Gebaeude). */
  bundbalkenJ: number[]

  /** Anzahl Traglatten je Dachhaelfte. */
  nTraglatten: number

  /** Dachflaeche ueber dem Grundriss bzw. gedeckte Flaeche inkl. Ueberstand. */
  aDachGrundriss: number
  aDachGedeckt: number
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
  const zMP = runde(p.fMP * sG, 2)
  const yMPuk = C - zMP - q.mittelpfette.h
  const zKB = runde(p.fKB * sG, 2)
  const yKB = C - zKB
  const lKBh = C - yKB + q.kehlbalken.h / 2 + 0.06

  const yFiPok = C - q.firstpfette.b / 2
  const yFiPuk = yFiPok - q.firstpfette.h

  const yBBok = q.bundbalken.h
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

  const nTraglatten = Math.max(0, Math.round((p.lattungAnteil * lS) / p.lw))

  const aDachGrundriss = p.B * p.L * secA
  const aDachGedeckt = (p.B + 2 * p.ueT) * (p.L + 2 * p.ueO) * secA

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
    yMPuk,
    zKB,
    yKB,
    lKBh,
    yFiPok,
    yFiPuk,
    yBBok,
    zBBh,
    saeulenJ,
    bundbalkenJ,
    nTraglatten,
    aDachGrundriss,
    aDachGedeckt,
  }

  if (import.meta.env.DEV) pruefeKontrollwerte(masse)
  return masse
}

/** Kontrollwerte aus Bauplan 1.4 — schlagen nur im Standardparametersatz an. */
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
    pruefe('lichte Hoehe unter Kehlbalken', m.yKB - m.p.q.kehlbalken.h / 2 - m.yBBok, 2.51, 0.01)
    pruefe('Stuhlraster', 6 * m.e, 4.509, 0.005)
    pruefe('Dachflaeche ueber Grundriss', m.aDachGrundriss, 120.2, 0.2)
    pruefe('Dachflaeche gedeckt', m.aDachGedeckt, 145.4, 0.2)
    pruefe('Traglatten je Haelfte', m.nTraglatten, 8, 0)
  }

  // Parametersatz-unabhaengige Plausibilitaet.
  if (m.e < 0.6 || m.e > 1.0) abweichungen.push(`Achsmass ausserhalb 0,60-1,00 m: ${m.e}`)
  if (m.lKBh > m.C + m.dY - (m.yKB + m.p.q.kehlbalken.h / 2)) {
    abweichungen.push('Kehlbalken tritt an der Sparrenoberkante aus')
  }

  if (abweichungen.length > 0) {
    console.warn('[dachstuhl] Kontrollwerte weichen ab:\n' + abweichungen.join('\n'))
  }
}
