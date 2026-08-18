/**
 * Zeitachse der Aufbau-Animation (Bauplan 4). Reine Funktionen, kein React,
 * kein three — der Fortschritt t kommt immer von aussen.
 */

export interface Phase {
  nr: number
  label: string
  von: number
  bis: number
}

/**
 * Reihenfolge nach der realen Aufrichtfolge. Die Mittelpfette kommt vor der
 * Firstpfette, damit das Modell monoton nach oben waechst.
 */
export const PHASEN: Phase[] = [
  // Leerer Vorlauf. Ohne ihn beginnt die Animation mitten im ersten Bauschritt:
  // bei t = 0 laege eine Fusspfette schon und die zweite schwebte halb
  // durchsichtig darueber. Wer zusieht, soll bei Null anfangen zu zaehlen.
  { nr: 0, label: 'Rohdecke', von: 0.0, bis: 0.03 },
  { nr: 1, label: 'Fußpfetten', von: 0.03, bis: 0.09 },
  { nr: 2, label: 'Bundbalken', von: 0.09, bis: 0.185 },
  { nr: 3, label: 'Stuhlschwellen', von: 0.185, bis: 0.23 },
  { nr: 4, label: 'Stuhlsäulen', von: 0.23, bis: 0.315 },
  { nr: 5, label: 'Mittelpfetten', von: 0.315, bis: 0.365 },
  { nr: 6, label: 'Firstpfette', von: 0.365, bis: 0.41 },
  { nr: 7, label: 'Kopfbänder', von: 0.41, bis: 0.46 },
  { nr: 8, label: 'Sparrenpaare', von: 0.46, bis: 0.68 },
  { nr: 9, label: 'Kehlbalken', von: 0.68, bis: 0.745 },
  { nr: 10, label: 'Windrispenbänder', von: 0.745, bis: 0.785 },
  { nr: 11, label: 'Konterlattung', von: 0.785, bis: 0.84 },
  { nr: 12, label: 'Dachlattung', von: 0.84, bis: 0.9 },
  { nr: 13, label: 'Traufbohle und Ortgangbretter', von: 0.9, bis: 0.93 },
  // Haltezeit. Sie traegt kein Bauteil — das Belohnungsbild bleibt stehen,
  // und t = 1 zeigt garantiert den fertigen Dachstuhl.
  { nr: 14, label: 'Dachstuhl steht', von: 0.93, bis: 1.0 },
]

/**
 * Nachschlag ueber die Phasennummer, nicht ueber den Feldindex: seit es einen
 * Vorlauf mit nr = 0 gibt, sind die beiden nicht mehr dasselbe.
 */
const NACH_NR = new Map(PHASEN.map((p) => [p.nr, p]))

/** Erste Phase mit Bauteilen. Davor ist das Bild leer. */
export const ERSTE_BAUPHASE = PHASEN[1]

/** Letzte Phase mit Bauteilen. Alles danach ist Haltezeit. */
export const LETZTE_BAUPHASE = PHASEN[PHASEN.length - 2]

/** Ueberlappung benachbarter Staffelschritte. */
const UEBERLAPPUNG = 0.5

/**
 * Nachlauf am Ende jeder Phase. Bei 14 s Gesamtdauer sind das rund 200 ms, in
 * denen nichts Neues einfliegt — dadurch liest sich jeder Phasenwechsel als
 * eigener Schritt statt als durchlaufendes Rieseln.
 */
const NACHLAUF = 0.014

export function klemme(wert: number, min: number, max: number): number {
  return wert < min ? min : wert > max ? max : wert
}

function smoothstep(u: number): number {
  return u * u * (3 - 2 * u)
}

/**
 * Gewicht eines Staffelschritts. 0 = noch nicht da, 1 = an seinem Platz.
 * Phase 0 (Rohdecke, Antipp-Zonen) ist immer fertig.
 */
function schritt(
  phase: number,
  animIndex: number,
  n: number,
): { start: number; d: number } | null {
  const p = NACH_NR.get(phase)
  if (!p) return null
  const fenster = Math.max(p.bis - p.von - NACHLAUF, 1e-6)
  const d = fenster / (1 + (n - 1) * (1 - UEBERLAPPUNG))
  return { start: p.von + animIndex * d * (1 - UEBERLAPPUNG), d }
}

export function fortschritt(
  t: number,
  phase: number,
  animIndex: number,
  n: number,
): number {
  if (phase === 0) return 1
  const s = schritt(phase, animIndex, n)
  if (!s) return 1
  if (t < s.start) return 0
  return smoothstep(klemme((t - s.start) / s.d, 0, 1))
}

/** Sichtbarkeit: ein Bauteil erscheint mit dem Beginn seines Staffelschritts. */
export function sichtbar(
  t: number,
  phase: number,
  animIndex: number,
  n: number,
): boolean {
  if (phase === 0) return true
  const s = schritt(phase, animIndex, n)
  if (!s) return true
  return t >= s.start
}

/**
 * Abnahme-Assertion: bei t = 1 muss jedes Bauteil sichtbar und an seinem Platz
 * sein, bei t = 0 darf ausser der Rohdecke nichts zu sehen sein. Am Endbild ist
 * die halb verlegte Lattung aufgefallen, am Anfangsbild die Fusspfette, die
 * beim Start schon lag — beides sind die Bilder, mit denen M5 steht.
 */
export function pruefeEndbild(
  bauteile: { phase: number; animIndex: number }[],
  schritte: Map<number, number>,
): string[] {
  const maengel: string[] = []
  let unsichtbar = 0
  let unfertig = 0
  for (const b of bauteile) {
    const n = schritte.get(b.phase) ?? 1
    if (!sichtbar(1, b.phase, b.animIndex, n)) unsichtbar += 1
    else if (fortschritt(1, b.phase, b.animIndex, n) < 0.999) unfertig += 1
  }
  if (unsichtbar > 0)
    maengel.push(`${unsichtbar} von ${bauteile.length} Bauteilen fehlen bei t=1`)
  if (unfertig > 0) maengel.push(`${unfertig} Bauteile sind bei t=1 noch im Anflug`)
  if (LETZTE_BAUPHASE.bis >= 1)
    maengel.push('Keine Haltezeit: die letzte Phase endet erst bei t=1')

  // Gegenprobe fuer den Anfang: bei t = 0 steht nur die Rohdecke.
  let zuFrueh = 0
  for (const b of bauteile) {
    if (b.phase === 0) continue
    const n = schritte.get(b.phase) ?? 1
    if (sichtbar(0, b.phase, b.animIndex, n)) zuFrueh += 1
  }
  if (zuFrueh > 0)
    maengel.push(`${zuFrueh} Bauteile sind bei t=0 schon sichtbar (Vorlauf fehlt)`)
  if (ERSTE_BAUPHASE.von <= 0)
    maengel.push('Kein Vorlauf: die erste Bauphase beginnt bei t=0')
  return maengel
}

export function phaseAt(t: number): Phase {
  const g = klemme(t, 0, 1)
  for (const p of PHASEN) {
    if (g < p.bis) return p
  }
  return PHASEN[PHASEN.length - 1]
}
