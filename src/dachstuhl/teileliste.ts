import type { DachstuhlMasse } from './mass'
import type { BauteilTyp } from './bauteil-texte'
import { farbeFuer, textFuer } from './bauteil-texte'

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
      // Beide Mauerlatten im selben Staffelschritt: der erste Frame der
      // Animation zeigt sonst eine einzelne schwebende Latte statt des
      // symmetrischen Anfangs eines Dachstuhls.
      ordnung: 0,
      einflug: [0, 0.6, 0],
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

  // ---- Phase 3: Stuhlschwellen -------------------------------------------
  // Unter jeder Saeulenreihe laeuft eine Schwelle laengs ueber die Balkenlage.
  // Ohne sie gaebe eine Stuhlsaeule die ganze Pfettenlast an einen einzelnen
  // Deckenbalken ab — statisch Unsinn, und man sieht es sofort.
  const schwellen: { z: number; ordnung: number }[] = [
    { z: 0, ordnung: 0 },
    { z: m.zMP, ordnung: 1 },
    { z: -m.zMP, ordnung: 1 },
  ]
  schwellen.forEach(({ z, ordnung }) => {
    roh.push({
      id: `stuhlschwelle-z${z > 0 ? '+' : z < 0 ? '-' : '0'}`,
      typ: 'stuhlschwelle',
      position: [0, m.yBBok + q.stuhlschwelle.h / 2, z],
      groesse: [p.L, q.stuhlschwelle.h, q.stuhlschwelle.b],
      auswahlIndex: Math.sign(z),
      phase: 3,
      ordnung,
      einflug: [0, 1.2, 0],
    })
  })

  // ---- Phase 4: Stuhlsaeulen ---------------------------------------------
  const hFirstsaeule = m.yFiPuk - m.ySchwelleOk
  const hMittelsaeule = m.yMPuk - m.ySchwelleOk
  let saeulenOrdnung = 0
  m.saeulenJ.forEach((j) => {
    roh.push({
      id: `firstsaeule-j${vz(j)}`,
      typ: 'firstsaeule',
      position: [j * m.e, m.ySchwelleOk + hFirstsaeule / 2, 0],
      groesse: [q.firstsaeule.b, hFirstsaeule, q.firstsaeule.h],
      auswahlIndex: j,
      phase: 4,
      ordnung: saeulenOrdnung++,
      einflug: [0, 2.5, 0],
    })
  })
  m.saeulenJ.forEach((j) => {
    for (const s of [1, -1]) {
      roh.push({
        id: `mittelsaeule-j${vz(j)}-z${s > 0 ? '+' : '-'}`,
        typ: 'mittelsaeule',
        position: [j * m.e, m.ySchwelleOk + hMittelsaeule / 2, s * m.zMP],
        groesse: [q.mittelsaeule.b, hMittelsaeule, q.mittelsaeule.h],
        auswahlIndex: j,
        phase: 4,
        ordnung: saeulenOrdnung++,
        einflug: [0, 2.5, 0],
      })
    }
  })

  // ---- Phase 5: Mittelpfetten --------------------------------------------
  for (const s of [1, -1]) {
    roh.push({
      id: `mittelpfette-z${s > 0 ? '+' : '-'}`,
      typ: 'mittelpfette',
      form: 'mittelpfette',
      position: NULL3,
      spiegelZ: s < 0,
      auswahlIndex: s,
      phase: 5,
      ordnung: s > 0 ? 0 : 1,
      einflug: [0, 2.5, 0],
    })
  }

  // ---- Phase 6: Firstpfette ----------------------------------------------
  roh.push({
    id: 'firstpfette',
    typ: 'firstpfette',
    form: 'firstpfette',
    position: NULL3,
    phase: 6,
    ordnung: 0,
    einflug: [0, 3, 0],
  })

  // ---- Phase 7: Kopfbaender ----------------------------------------------
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
      phase: 7,
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
  kopfbaender.sort(
    (a, b) => a.position[0] - b.position[0] || a.position[2] - b.position[2],
  )
  kopfbaender.forEach((k, i) => {
    k.ordnung = i
    roh.push(k)
  })

  // ---- Phase 8: Sparrenpaare ---------------------------------------------
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
        phase: 8,
        ordnung: i,
        einflug: [0, 3, 0],
        neigung: (-5 * Math.PI) / 180,
      })
    }
  })

  // ---- Phase 9: Kehlbalken ------------------------------------------------
  m.achsen.forEach(({ j }, i) => {
    roh.push({
      id: `kehlbalken-j${vz(j)}`,
      typ: 'kehlbalken',
      position: [j * m.e, m.yKB, 0],
      groesse: [q.kehlbalken.b, q.kehlbalken.h, 2 * m.lKBh],
      auswahlIndex: j,
      phase: 9,
      ordnung: i,
      einflug: [1.6, 0, 0],
    })
  })

  // ---- Phase 10: Windrispenbaender (Dachflaechen-Frame) -------------------
  // Ein Kreuz je Dachhaelfte, ueber sechs Sparrenfelder gespannt.
  const rispeX = 3 * m.e
  const rispeZnah = m.dachZFirst + 0.6
  const rispeZfern = m.dachZTraufe - 0.26
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
        phase: 10,
        ordnung: s > 0 ? 0 : 1,
        // Waechst aus dem Traufende heraus: Startlage ist genau dieses Ende.
        einflug: [band * rispeX, 0, rispeDz / 2],
        wachstum: true,
        wirftSchatten: false,
      })
    }
  }

  // ---- Phase 11: Konterlattung (Dachflaechen-Frame) -----------------------
  // Die Konterlatte deckt die Sparrenoberkante vom First bis zur Traufe ab.
  // Bezug ist der Dachflaechen-Frame, nicht die Sparrenlaenge — sonst liegt
  // die ganze Lattung um hS * tanA traufwaerts daneben.
  const konterLaenge = m.dachZTraufe - m.dachZFirst - 0.02
  const konterMitte = (m.dachZFirst + m.dachZTraufe) / 2
  m.achsen.forEach(({ j }, i) => {
    for (const s of [1, -1]) {
      roh.push({
        id: `konterlatte-j${vz(j)}-z${s > 0 ? '+' : '-'}`,
        typ: 'konterlatte',
        rahmen: s > 0 ? 'dach+' : 'dach-',
        position: [j * m.e, q.sparren.h + q.konterlatte.h / 2, konterMitte],
        groesse: [q.konterlatte.b, q.konterlatte.h, konterLaenge],
        auswahlIndex: j,
        phase: 11,
        ordnung: i,
        einflug: [0, 0.5, 0],
      })
    }
  })

  // ---- Phase 12: Traglattung (Dachflaechen-Frame) -------------------------
  const yTraglatte = q.sparren.h + q.konterlatte.h + q.traglatte.h / 2
  m.traglattenZ.forEach((z, k) => {
    for (const s of [1, -1]) {
      roh.push({
        id: `traglatte-k${k}-z${s > 0 ? '+' : '-'}`,
        typ: 'traglatte',
        rahmen: s > 0 ? 'dach+' : 'dach-',
        position: [0, yTraglatte, z],
        groesse: [m.LD, q.traglatte.h, q.traglatte.b],
        auswahlIndex: k,
        phase: 12,
        ordnung: k,
        einflug: [0, 0.4, 0],
      })
    }
  })

  // ---- Phase 13: Traufbohle und Ortgangbretter ----------------------------
  // Ohne diese beiden Brettreihen hoert das Dach an drei Kanten messerscharf
  // auf: an der Traufe haengen die nackten Sparrenschwaenze heraus, am Ortgang
  // enden die Latten buendig auf dem letzten Sparren. Beides ist der Punkt,
  // an dem man einen Rohbau von einem fertigen Dach unterscheidet.
  for (const s of [1, -1]) {
    roh.push({
      id: `traufbohle-z${s > 0 ? '+' : '-'}`,
      typ: 'traufbohle',
      // Steht als Stirnbrett lotrecht vor den Sparrenkoepfen, Oberkante
      // buendig mit dem Sparrenruecken.
      position: [0, m.C - m.zT + q.traufbohle.h / 2, s * (m.zT + q.traufbohle.b / 2)],
      groesse: [m.LD, q.traufbohle.h, q.traufbohle.b],
      auswahlIndex: s,
      phase: 13,
      ordnung: 0,
      einflug: [0, 0.5, 0],
    })
  }
  // Je Dachhaelfte und Giebelseite ein Windbrett aussen auf dem Ortgangsparren.
  // Es sitzt im Dachflaechen-Frame und laeuft damit von selbst parallel zur
  // Dachflaeche, vom First bis zur Traufe.
  const ortgangLaenge = m.dachZTraufe - m.dachZFirst
  const ortgangMitte = (m.dachZFirst + m.dachZTraufe) / 2
  for (const s of [1, -1]) {
    for (const g of [1, -1]) {
      roh.push({
        id: `ortgangbrett-z${s > 0 ? '+' : '-'}-x${g > 0 ? '+' : '-'}`,
        typ: 'ortgangbrett',
        rahmen: s > 0 ? 'dach+' : 'dach-',
        // Deckt die Lattenenden ab: von 5 cm unter der Sparrenunterkante bis
        // knapp ueber die Traglatte.
        position: [
          g * (m.xOrtgang + q.ortgangbrett.b / 2),
          m.dachOben / 2 - 0.02,
          ortgangMitte,
        ],
        groesse: [q.ortgangbrett.b, q.ortgangbrett.h, ortgangLaenge],
        auswahlIndex: g,
        phase: 13,
        ordnung: 1,
        einflug: [g * 0.5, 0, 0],
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
    phase: 6,
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
      phase: 8,
      ordnung: 0,
      wirftSchatten: false,
      empfaengtSchatten: false,
    })
  }

  return roh.map(veredle)
}

function veredle(r: Roh): Bauteil {
  // Lookup mit Rueckfallebene statt direktem Indexzugriff: ein Bauteil ohne
  // Stammdatensatz hat frueher hier geworfen und die ganze Szene mitgerissen.
  const text = textFuer(r.typ)
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

/**
 * Abnahme-Assertion fuer die Teileliste. Jedes Teil braucht eine eindeutige id,
 * einen Begriff und ein antippbar-Flag — `antippbar` ist das Fundament von
 * B3.2, und ein Teil, das ohne diese Felder durchlaeuft, ist entweder stumm
 * oder loest beim Tippen den naechsten Fehler aus.
 */
export function pruefeTeileliste(teile: Bauteil[]): string[] {
  const maengel: string[] = []
  const gesehen = new Set<string>()
  for (const t of teile) {
    if (!t.id) maengel.push(`Bauteil ohne id (Typ ${t.typ})`)
    else if (gesehen.has(t.id)) maengel.push(`id doppelt vergeben: ${t.id}`)
    else gesehen.add(t.id)

    const text = textFuer(t.typ)
    if (!text.label) maengel.push(`${t.id}: kein Begriff hinterlegt`)
    if (typeof t.antippbar !== 'boolean')
      maengel.push(`${t.id}: antippbar ist kein Wahrheitswert`)
    if (!t.farbe) maengel.push(`${t.id}: keine Materialfarbe`)
  }
  if (teile.length === 0) maengel.push('Die Teileliste ist leer')
  return maengel
}

/** Anzahl Staffelschritte je Phase = hoechster animIndex + 1. */
export function schritteJePhase(teile: Bauteil[]): Map<number, number> {
  const n = new Map<number, number>()
  for (const t of teile) {
    n.set(t.phase, Math.max(n.get(t.phase) ?? 0, t.animIndex + 1))
  }
  return n
}
