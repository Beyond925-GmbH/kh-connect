import type { DachstuhlMasse } from './mass'
import type { BauteilTyp } from './bauteil-texte'
import { BAUTEIL_TEXTE, farbeFuer } from './bauteil-texte'

/**
 * Erzeugt die vollstaendige Teileliste aus den abgeleiteten Massen (Bauplan 3).
 * Kein Bauteil ist von Hand positioniert — jede Zahl kommt aus `mass.ts`.
 */

/** Bezugssystem eines Bauteils. `dach+`/`dach-` ist der Dachflaechen-Frame (Bauplan 2.1). */
export type Rahmen = 'welt' | 'dach+' | 'dach-'

/** `box` benutzt den geteilten Einheitswuerfel, die uebrigen je ein extrudiertes Profil. */
export type Form = 'box' | 'zone' | 'sparren' | 'mittelpfette' | 'firstpfette'

export interface Bauteil {
  id: string
  typ: BauteilTyp
  form: Form
  rahmen: Rahmen
  position: [number, number, number]
  rotation: [number, number, number]
  /** Kantenlaengen fuer `box`/`zone`; bei Profilformen ungenutzt. */
  groesse: [number, number, number]
  /** Spiegelung an z = 0 ueber scale.z = -1 statt einer zweiten Geometrie. */
  spiegelZ: boolean
  farbe: string
  antippbar: boolean
  /** Index innerhalb des Typs (j, k oder Seitenvorzeichen) fuer `?teil=typ:index`. */
  auswahlIndex: number | null
  /** Animationseinheit. Ein Sparrenpaar fliegt als eine Einheit ein. */
  einheit: string
  /** 0 = steht von Anfang an, 1..11 = Aufbauphase. */
  phase: number
  animIndex: number
  /** Ruhelage der Animationsgruppe. Nur belegt, wo der Pivot nicht im Ursprung liegt. */
  einheitPosition: [number, number, number]
  /** Feste Grunddrehung der Animationsgruppe (die Neigung kommt additiv dazu). */
  einheitRotation: [number, number, number]
  /** Einflugversatz im eigenen Rahmen, bei t = Phasenbeginn. */
  einflug: [number, number, number]
  /** Zusaetzliche Anfangsneigung um X in Radiant. */
  neigung: number
  /** Band waechst aus dem Traufende heraus statt einzufliegen. */
  wachstum: boolean
  wirftSchatten: boolean
  empfaengtSchatten: boolean
}

interface Roh {
  id: string
  typ: BauteilTyp
  form?: Form
  rahmen?: Rahmen
  position: [number, number, number]
  rotation?: [number, number, number]
  groesse?: [number, number, number]
  spiegelZ?: boolean
  farbIndex?: number
  auswahlIndex?: number | null
  einheit?: string
  phase: number
  /** Sortierschluessel innerhalb der Phase; daraus entsteht der animIndex. */
  ordnung: number
  einheitPosition?: [number, number, number]
  einheitRotation?: [number, number, number]
  einflug?: [number, number, number]
  neigung?: number
  wachstum?: boolean
  wirftSchatten?: boolean
  empfaengtSchatten?: boolean
}

const NULL3: [number, number, number] = [0, 0, 0]

export function erzeugeTeile(m: DachstuhlMasse): Bauteil[] {
  const p = m.p
  const q = p.q
  const roh: Roh[] = []

  // ---- Rohdecke -----------------------------------------------------------
  roh.push({
    id: 'rohdecke',
    typ: 'rohdecke',
    position: [0, -p.rohdeckeDicke / 2, 0],
    groesse: [p.L, p.rohdeckeDicke, p.B],
    phase: 0,
    ordnung: 0,
    wirftSchatten: false,
  })

  // ---- Phase 1: Fusspfetten / Mauerlatten ---------------------------------
  for (const s of [1, -1]) {
    roh.push({
      id: `fusspfette-z${s > 0 ? '+' : '-'}`,
      typ: 'fusspfette',
      position: [0, q.mauerlatte.h / 2, s * (m.zMLa - q.mauerlatte.b / 2)],
      groesse: [p.L, q.mauerlatte.h, q.mauerlatte.b],
      auswahlIndex: s,
      phase: 1,
      ordnung: s > 0 ? 0 : 1,
      einflug: [0, 1.5, 0],
    })
  }

  // ---- Phase 2: Bundbalken ------------------------------------------------
  m.bundbalkenJ.forEach((j, i) => {
    roh.push({
      id: `bundbalken-j${vz(j)}`,
      typ: 'bundbalken',
      position: [j * m.e, q.bundbalken.h / 2, 0],
      groesse: [q.bundbalken.b, q.bundbalken.h, 2 * m.zBBh],
      auswahlIndex: j,
      phase: 2,
      ordnung: i,
      einflug: [0, 2, 0],
    })
  })

  // ---- Phase 3: Stuhlsaeulen ---------------------------------------------
  const hFirstsaeule = m.yFiPuk - m.yBBok
  const hMittelsaeule = m.yMPuk - m.yBBok
  let saeulenOrdnung = 0
  m.saeulenJ.forEach((j) => {
    roh.push({
      id: `firstsaeule-j${vz(j)}`,
      typ: 'firstsaeule',
      position: [j * m.e, m.yBBok + hFirstsaeule / 2, 0],
      groesse: [q.firstsaeule.b, hFirstsaeule, q.firstsaeule.h],
      auswahlIndex: j,
      phase: 3,
      ordnung: saeulenOrdnung++,
      einflug: [0, 2.5, 0],
    })
  })
  m.saeulenJ.forEach((j) => {
    for (const s of [1, -1]) {
      roh.push({
        id: `mittelsaeule-j${vz(j)}-z${s > 0 ? '+' : '-'}`,
        typ: 'mittelsaeule',
        position: [j * m.e, m.yBBok + hMittelsaeule / 2, s * m.zMP],
        groesse: [q.mittelsaeule.b, hMittelsaeule, q.mittelsaeule.h],
        auswahlIndex: j,
        phase: 3,
        ordnung: saeulenOrdnung++,
        einflug: [0, 2.5, 0],
      })
    }
  })

  // ---- Phase 4: Mittelpfetten --------------------------------------------
  for (const s of [1, -1]) {
    roh.push({
      id: `mittelpfette-z${s > 0 ? '+' : '-'}`,
      typ: 'mittelpfette',
      form: 'mittelpfette',
      position: NULL3,
      spiegelZ: s < 0,
      auswahlIndex: s,
      phase: 4,
      ordnung: s > 0 ? 0 : 1,
      einflug: [0, 2.5, 0],
    })
  }

  // ---- Phase 5: Firstpfette ----------------------------------------------
  roh.push({
    id: 'firstpfette',
    typ: 'firstpfette',
    form: 'firstpfette',
    position: NULL3,
    phase: 5,
    ordnung: 0,
    einflug: [0, 3, 0],
  })

  // ---- Phase 6: Kopfbaender ----------------------------------------------
  // Nach aussen gerichtete Baender entfallen, wo sie ueber die Dachkante ragen.
  const kopfbandGrenze = m.LD / 2 - 0.1
  const kopfbaender: Roh[] = []
  const legeKopfband = (
    id: string,
    j: number,
    richtung: number,
    schenkel: number,
    yPfetteUK: number,
    z: number,
  ) => {
    const x = j * m.e
    if (Math.abs(x + richtung * schenkel) > kopfbandGrenze) return
    kopfbaender.push({
      id,
      typ: 'kopfband',
      position: [x + (richtung * schenkel) / 2, yPfetteUK - schenkel / 2, z],
      rotation: [0, 0, (richtung * Math.PI) / 4],
      groesse: [schenkel * Math.SQRT2, q.kopfband.h, q.kopfband.b],
      auswahlIndex: j,
      phase: 6,
      ordnung: 0,
      einflug: [0, 0.8, 0],
    })
  }
  m.saeulenJ.forEach((j) => {
    for (const r of [-1, 1]) {
      legeKopfband(
        `kopfband-first-j${vz(j)}-${r > 0 ? 'x+' : 'x-'}`,
        j,
        r,
        p.kopfbandFirst,
        m.yFiPuk,
        0,
      )
      for (const s of [1, -1]) {
        legeKopfband(
          `kopfband-mittel-j${vz(j)}-z${s > 0 ? '+' : '-'}-${r > 0 ? 'x+' : 'x-'}`,
          j,
          r,
          p.kopfbandMittel,
          m.yMPuk,
          s * m.zMP,
        )
      }
    }
  })
  kopfbaender.sort((a, b) => a.position[0] - b.position[0] || a.position[2] - b.position[2])
  kopfbaender.forEach((k, i) => {
    k.ordnung = i
    roh.push(k)
  })

  // ---- Phase 7: Sparrenpaare ---------------------------------------------
  m.achsen.forEach(({ j }, i) => {
    for (const s of [1, -1]) {
      roh.push({
        id: `sparren-j${vz(j)}-z${s > 0 ? '+' : '-'}`,
        typ: 'sparren',
        form: 'sparren',
        position: [j * m.e, 0, 0],
        spiegelZ: s < 0,
        farbIndex: j,
        auswahlIndex: j,
        einheit: `sparrenpaar-j${vz(j)}`,
        phase: 7,
        ordnung: i,
        einflug: [0, 3, 0],
        neigung: (-5 * Math.PI) / 180,
      })
    }
  })

  // ---- Phase 8: Kehlbalken ------------------------------------------------
  m.achsen.forEach(({ j }, i) => {
    roh.push({
      id: `kehlbalken-j${vz(j)}`,
      typ: 'kehlbalken',
      position: [j * m.e, m.yKB, 0],
      groesse: [q.kehlbalken.b, q.kehlbalken.h, 2 * m.lKBh],
      auswahlIndex: j,
      phase: 8,
      ordnung: i,
      einflug: [1.6, 0, 0],
    })
  })

  // ---- Phase 9: Windrispenbaender (Dachflaechen-Frame) --------------------
  // Ein Kreuz je Dachhaelfte, ueber sechs Sparrenfelder gespannt.
  const rispeX = 3 * m.e
  const rispeZnah = 0.4
  const rispeZfern = m.lS - 0.26
  const rispeDz = rispeZfern - rispeZnah
  const rispeLaenge = Math.hypot(2 * rispeX, rispeDz)
  const rispeWinkel = Math.atan((2 * rispeX) / rispeDz)
  for (const s of [1, -1]) {
    for (const band of [-1, 1]) {
      roh.push({
        id: `windrispe-z${s > 0 ? '+' : '-'}-${band > 0 ? 'b' : 'a'}`,
        typ: 'windrispe',
        rahmen: s > 0 ? 'dach+' : 'dach-',
        // Lage und Drehung sitzen auf der Animationsgruppe, damit die
        // Wachstums-Skalierung entlang der Bandachse laeuft und nicht quer dazu.
        position: NULL3,
        einheitPosition: [0, -q.windrispe.h / 2 - 0.0035, (rispeZnah + rispeZfern) / 2],
        einheitRotation: [0, band * rispeWinkel, 0],
        groesse: [q.windrispe.b, q.windrispe.h, rispeLaenge],
        auswahlIndex: s,
        phase: 9,
        ordnung: s > 0 ? 0 : 1,
        // Waechst aus dem Traufende heraus: Startlage ist genau dieses Ende.
        einflug: [band * rispeX, 0, rispeDz / 2],
        wachstum: true,
        wirftSchatten: false,
      })
    }
  }

  // ---- Phase 10: Konterlattung (Dachflaechen-Frame) -----------------------
  const konterLaenge = m.lS - 0.05
  m.achsen.forEach(({ j }, i) => {
    for (const s of [1, -1]) {
      roh.push({
        id: `konterlatte-j${vz(j)}-z${s > 0 ? '+' : '-'}`,
        typ: 'konterlatte',
        rahmen: s > 0 ? 'dach+' : 'dach-',
        position: [j * m.e, q.sparren.h + q.konterlatte.h / 2, m.lS / 2],
        groesse: [q.konterlatte.b, q.konterlatte.h, konterLaenge],
        auswahlIndex: j,
        phase: 10,
        ordnung: i,
        einflug: [0, 0.5, 0],
      })
    }
  })

  // ---- Phase 11: Traglattung (Dachflaechen-Frame) -------------------------
  const yTraglatte = q.sparren.h + q.konterlatte.h + q.traglatte.h / 2
  for (let k = 0; k < m.nTraglatten; k++) {
    for (const s of [1, -1]) {
      roh.push({
        id: `traglatte-k${k}-z${s > 0 ? '+' : '-'}`,
        typ: 'traglatte',
        rahmen: s > 0 ? 'dach+' : 'dach-',
        position: [0, yTraglatte, m.lS - 0.16 - k * p.lw],
        groesse: [m.LD, q.traglatte.h, q.traglatte.b],
        auswahlIndex: k,
        phase: 11,
        ordnung: k,
        einflug: [0, 0.4, 0],
      })
    }
  }

  // ---- Antipp-Zonen fuer First und Traufe (unsichtbar) --------------------
  // First und Traufe sind Kanten, keine Bauteile. Sie bekommen ein
  // Pick-Volumen, das erst auftaucht, sobald es die Kante wirklich gibt —
  // sonst laesst sich am leeren Rohbau der First antippen.
  roh.push({
    id: 'zone-first',
    typ: 'zone-first',
    form: 'zone',
    position: [0, m.yFirstUK + 0.2, 0],
    groesse: [m.LD, 0.3, 0.3],
    phase: 5,
    ordnung: 0,
    wirftSchatten: false,
    empfaengtSchatten: false,
  })
  for (const s of [1, -1]) {
    roh.push({
      id: `zone-traufe-z${s > 0 ? '+' : '-'}`,
      typ: 'zone-traufe',
      form: 'zone',
      position: [0, m.C - m.zT + m.dY / 2, s * m.zT],
      groesse: [m.LD, 0.3, 0.25],
      auswahlIndex: s,
      phase: 7,
      ordnung: 0,
      wirftSchatten: false,
      empfaengtSchatten: false,
    })
  }

  return roh.map(veredle)
}

function veredle(r: Roh): Bauteil {
  const text = BAUTEIL_TEXTE[r.typ]
  return {
    id: r.id,
    typ: r.typ,
    form: r.form ?? 'box',
    rahmen: r.rahmen ?? 'welt',
    position: r.position,
    rotation: r.rotation ?? NULL3,
    groesse: r.groesse ?? [1, 1, 1],
    spiegelZ: r.spiegelZ ?? false,
    farbe: farbeFuer(r.typ, r.farbIndex ?? 0),
    antippbar: text.antippbar,
    auswahlIndex: r.auswahlIndex ?? null,
    einheit: r.einheit ?? r.id,
    phase: r.phase,
    animIndex: r.ordnung,
    einheitPosition: r.einheitPosition ?? NULL3,
    einheitRotation: r.einheitRotation ?? NULL3,
    einflug: r.einflug ?? NULL3,
    neigung: r.neigung ?? 0,
    wachstum: r.wachstum ?? false,
    wirftSchatten: r.wirftSchatten ?? true,
    empfaengtSchatten: r.empfaengtSchatten ?? true,
  }
}

/** j als Vorzeichen-behaftete Zeichenkette, damit `sparren-j+3` eindeutig bleibt. */
function vz(j: number): string {
  return j >= 0 ? `+${j}` : `${j}`
}

/** Eine Animationseinheit: ein Bauteil oder ein komplettes Sparrenpaar. */
export interface Einheit {
  id: string
  rahmen: Rahmen
  phase: number
  animIndex: number
  position: [number, number, number]
  rotation: [number, number, number]
  einflug: [number, number, number]
  neigung: number
  wachstum: boolean
  teile: Bauteil[]
}

export function bildeEinheiten(teile: Bauteil[]): Einheit[] {
  const nach = new Map<string, Einheit>()
  for (const t of teile) {
    const vorhanden = nach.get(t.einheit)
    if (vorhanden) {
      vorhanden.teile.push(t)
      continue
    }
    nach.set(t.einheit, {
      id: t.einheit,
      rahmen: t.rahmen,
      phase: t.phase,
      animIndex: t.animIndex,
      position: t.einheitPosition,
      rotation: t.einheitRotation,
      einflug: t.einflug,
      neigung: t.neigung,
      wachstum: t.wachstum,
      teile: [t],
    })
  }
  return [...nach.values()]
}

/** Anzahl Staffelschritte je Phase = hoechster animIndex + 1. */
export function schritteJePhase(teile: Bauteil[]): Map<number, number> {
  const n = new Map<number, number>()
  for (const t of teile) {
    n.set(t.phase, Math.max(n.get(t.phase) ?? 0, t.animIndex + 1))
  }
  return n
}
