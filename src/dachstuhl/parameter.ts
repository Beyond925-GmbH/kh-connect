/**
 * Parametersatz des Dachstuhls (Bauplan 1.2 + 1.3).
 * Reine Daten, keine Importe — damit `mass.ts` ohne three testbar bleibt.
 * Alle Laengen in Metern, alle Winkel in Radiant.
 */

/** Querschnitt eines Bauteils: `b` quer zur Achse, `h` in Bauteil-Hochrichtung. */
export interface Querschnitt {
  b: number
  h: number
}

export interface DachstuhlParameter {
  /** Gebaeudebreite, Aussenkante bis Aussenkante Traufwand. */
  B: number
  /** Gebaeudelaenge. */
  L: number
  /** Dachneigung. */
  alpha: number
  /** Sparrenabstand, Sollwert. Das tatsaechliche Achsmass wird daraus abgeleitet. */
  eSoll: number
  /** Dachueberstand Traufe, waagerecht gemessen. */
  ueT: number
  /** Dachueberstand Ortgang. */
  ueO: number
  /** Mittelpfettenlage als Anteil der Grundrissstrecke, vom First aus. */
  fMP: number
  /** Kehlbalkenlage, dito. */
  fKB: number
  /** Kervenhoehe am Sparrenfuss. */
  tK: number
  /** Lattweite der Traglattung. */
  lw: number
  /** Anteil der Dachflaeche mit Traglattung, von der Traufe aus. */
  lattungAnteil: number
  /** Zielabstand der Stuhlsaeulen. */
  stuhlRaster: number
  /** Kerve am Sparrenfuss ausbilden. Ohne sie wird das Sparrenprofil ein Parallelogramm. */
  kerve: boolean
  /** Dicke der Rohdecken-Platte. */
  rohdeckeDicke: number
  /** Schenkellaenge der Kopfbaender an der Firstpfette. */
  kopfbandFirst: number
  /** Schenkellaenge der Kopfbaender an den Mittelpfetten. */
  kopfbandMittel: number
  q: {
    sparren: Querschnitt
    mauerlatte: Querschnitt
    mittelpfette: Querschnitt
    firstpfette: Querschnitt
    bundbalken: Querschnitt
    kehlbalken: Querschnitt
    firstsaeule: Querschnitt
    mittelsaeule: Querschnitt
    kopfband: Querschnitt
    konterlatte: Querschnitt
    traglatte: Querschnitt
    windrispe: Querschnitt
  }
}

/** Referenzhaus: 8,50 x 10,00 m, 45 Grad, rund 120 m2 Dachflaeche ueber dem Grundriss. */
export const STANDARD_PARAMETER: DachstuhlParameter = {
  B: 8.5,
  L: 10.0,
  alpha: Math.PI / 4,
  eSoll: 0.8,
  ueT: 0.6,
  ueO: 0.3,
  fMP: 0.45,
  fKB: 1 / 3,
  tK: 0.05,
  lw: 0.32,
  lattungAnteil: 0.35,
  stuhlRaster: 4.5,
  kerve: true,
  rohdeckeDicke: 0.24,
  kopfbandFirst: 0.8,
  kopfbandMittel: 0.7,
  q: {
    sparren: { b: 0.08, h: 0.2 },
    mauerlatte: { b: 0.1, h: 0.12 },
    mittelpfette: { b: 0.16, h: 0.2 },
    firstpfette: { b: 0.2, h: 0.24 },
    bundbalken: { b: 0.1, h: 0.22 },
    kehlbalken: { b: 0.08, h: 0.18 },
    firstsaeule: { b: 0.16, h: 0.16 },
    mittelsaeule: { b: 0.14, h: 0.14 },
    kopfband: { b: 0.1, h: 0.12 },
    konterlatte: { b: 0.06, h: 0.04 },
    traglatte: { b: 0.06, h: 0.04 },
    windrispe: { b: 0.04, h: 0.003 },
  },
}
