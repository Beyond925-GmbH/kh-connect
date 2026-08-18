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
  { nr: 1, label: 'Fußpfetten', von: 0.0, bis: 0.05 },
  { nr: 2, label: 'Bundbalken', von: 0.05, bis: 0.16 },
  { nr: 3, label: 'Stuhlsäulen', von: 0.16, bis: 0.235 },
  { nr: 4, label: 'Mittelpfetten', von: 0.235, bis: 0.3 },
  { nr: 5, label: 'Firstpfette', von: 0.3, bis: 0.36 },
  { nr: 6, label: 'Kopfbänder', von: 0.36, bis: 0.42 },
  { nr: 7, label: 'Sparrenpaare', von: 0.42, bis: 0.76 },
  { nr: 8, label: 'Kehlbalken', von: 0.76, bis: 0.84 },
  { nr: 9, label: 'Windrispenbänder', von: 0.84, bis: 0.88 },
  { nr: 10, label: 'Konterlattung', von: 0.88, bis: 0.93 },
  { nr: 11, label: 'Dachlattung', von: 0.93, bis: 1.0 },
]

/** Ueberlappung benachbarter Staffelschritte. */
const UEBERLAPPUNG = 0.5

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
export function fortschritt(
  t: number,
  phase: number,
  animIndex: number,
  n: number,
): number {
  if (phase === 0) return 1
  const p = PHASEN[phase - 1]
  if (!p) return 1
  const d = (p.bis - p.von) / (1 + (n - 1) * (1 - UEBERLAPPUNG))
  const start = p.von + animIndex * d * (1 - UEBERLAPPUNG)
  if (t < start) return 0
  return smoothstep(klemme((t - start) / d, 0, 1))
}

/** Sichtbarkeit: ein Bauteil erscheint mit dem Beginn seines Staffelschritts. */
export function sichtbar(
  t: number,
  phase: number,
  animIndex: number,
  n: number,
): boolean {
  if (phase === 0) return true
  const p = PHASEN[phase - 1]
  if (!p) return true
  const d = (p.bis - p.von) / (1 + (n - 1) * (1 - UEBERLAPPUNG))
  return t >= p.von + animIndex * d * (1 - UEBERLAPPUNG)
}

export function phaseAt(t: number): Phase {
  const g = klemme(t, 0, 1)
  for (const p of PHASEN) {
    if (g < p.bis) return p
  }
  return PHASEN[PHASEN.length - 1]
}
