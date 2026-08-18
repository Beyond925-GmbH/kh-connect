import { useSyncExternalStore } from 'react'
import type { StepId } from '@/khpl/flow/steps'
import { ERSTER_STEP, istStepId, step } from '@/khpl/flow/steps'

/**
 * Sitzungszustand nach khpl-ui-shell.md 7.
 *
 * Bewusst gegen khpl-flow.md 5 entschieden. Die Flow-Spec verlangt „kein Zustand
 * überlebt einen Reset“, die UI-Shell-Spec löst genau diesen Widerspruch später
 * und ausdrücklich auf: Idle **löscht nichts**, es bringt die App nur auf den
 * Splash zurück. Der nächste Besucher wählt dort „Neu starten“, wer nur kurz
 * abgelenkt war „Weitermachen“. Die 30-Minuten-Verfallszeit sorgt dafür, dass
 * ein Stand von heute früh niemandem mehr gehört.
 */

const SPEICHER_SCHLUESSEL = 'khpl-progress'

/** Älter als das, gehört der Stand niemandem mehr (khpl-ui-shell.md 7). */
export const VERFALL_MS = 30 * 60 * 1000

/** Welcher der Screens aus khpl-ui-shell.md 2 gerade läuft. Nie persistiert. */
export type Bildschirm = 'splash' | 'intro' | 'step'

/** Typisierte Sicht auf `answers`. Bleibt zur Laufzeit ein reines JSON-Objekt. */
export interface Antworten {
  /** M1 — angetippte Checklistenpunkte und ob schon ausgewertet wurde. */
  m1?: { gewaehlt: string[]; ausgewertet: boolean }
  /** M2 — geschätzter Dachpreis in Euro, und ob die echte Zahl schon stand. */
  m2?: { schaetzung: number; aufgeloest: boolean }
  /** B3.2 — wie viele Bauteile am 3D-Modell angetippt wurden. */
  b32?: { angetippt: string[] }
  /** M4 — Zuschnitt getroffen, mit Zahl der Versuche. */
  m4?: { getroffen: boolean; versuche: number }
  /** B4.1 — korrekt verladene Teile. */
  b41?: { geladen: string[]; fertig: boolean }
  /** M7 — wie weit die Reihenfolge-Abfrage kam. */
  m7?: { gesetzt: string[]; fertig: boolean }
  /** M9 — angesehene Karrierewege, in Reihenfolge des Öffnens. */
  m9?: { angesehen: StepId[] }
}

export interface Fortschritt {
  version: 1
  currentStepId: StepId
  /** Reihenfolge = Zurück-Historie. Kann denselben Step mehrfach enthalten. */
  visited: StepId[]
  branchesTaken: StepId[]
  answers: Antworten
  detourReturnTo: StepId | null
  updatedAt: number
}

function leer(): Fortschritt {
  return {
    version: 1,
    currentStepId: ERSTER_STEP,
    visited: [],
    branchesTaken: [],
    answers: {},
    detourReturnTo: null,
    updatedAt: Date.now(),
  }
}

/**
 * Liest den gespeicherten Stand. Alles, was nicht exakt passt — falsche
 * `version`, kaputtes JSON, unbekannte StepId, abgelaufen — wird still
 * verworfen. Ein Datenmodell-Wechsel darf am Messestand nicht crashen.
 */
function lade(): Fortschritt | null {
  let roh: string | null
  try {
    roh = localStorage.getItem(SPEICHER_SCHLUESSEL)
  } catch {
    return null
  }
  if (!roh) return null

  try {
    const daten: unknown = JSON.parse(roh)
    if (typeof daten !== 'object' || daten === null) return null
    const p = daten as Partial<Fortschritt>
    if (p.version !== 1) return null
    if (!istStepId(p.currentStepId)) return null
    if (typeof p.updatedAt !== 'number') return null
    if (Date.now() - p.updatedAt > VERFALL_MS) return null

    const visited = Array.isArray(p.visited) ? p.visited.filter(istStepId) : []
    const branchesTaken = Array.isArray(p.branchesTaken)
      ? p.branchesTaken.filter(istStepId)
      : []

    return {
      version: 1,
      currentStepId: p.currentStepId,
      visited,
      branchesTaken,
      answers:
        typeof p.answers === 'object' && p.answers !== null
          ? (p.answers as Antworten)
          : {},
      detourReturnTo: istStepId(p.detourReturnTo) ? p.detourReturnTo : null,
      updatedAt: p.updatedAt,
    }
  } catch {
    return null
  }
}

let fortschritt: Fortschritt = lade() ?? leer()
/** Ob beim Start ein gültiger Stand vorlag — steuert das Angebot auf S0. */
let hatWiedereinstieg = fortschritt.visited.length > 0
let bildschirm: Bildschirm = 'splash'

const hoerer = new Set<() => void>()

function melde() {
  hoerer.forEach((h) => h())
}

function sichere() {
  try {
    localStorage.setItem(SPEICHER_SCHLUESSEL, JSON.stringify(fortschritt))
  } catch {
    // Speicher gesperrt (privater Modus, Sandbox) — die Sitzung läuft trotzdem,
    // sie überlebt nur keinen Reload. Am Kiosk ist das der seltenere Fall.
  }
}

/** Reißleine gegen eine Historie, die durch Hin-und-Her-Tappen davonläuft. */
const MAX_HISTORIE = 300

function aendere(f: (alt: Fortschritt) => Fortschritt) {
  const neu = f(fortschritt)
  fortschritt = {
    ...neu,
    visited:
      neu.visited.length > MAX_HISTORIE ? neu.visited.slice(-MAX_HISTORIE) : neu.visited,
    updatedAt: Date.now(),
  }
  sichere()
  melde()
}

function setzeBildschirm(neu: Bildschirm) {
  bildschirm = neu
  melde()
}

// ---------------------------------------------------------------------------
// Aktionen
// ---------------------------------------------------------------------------

/** S0 → S1. Verwirft einen alten Stand vollständig. */
export function starteNeu() {
  fortschritt = leer()
  hatWiedereinstieg = false
  sichere()
  setzeBildschirm('intro')
}

/** S0 → S2 an der Stelle, an der der letzte Besucher aufgehört hat. */
export function machWeiter() {
  setzeBildschirm('step')
}

/** S1 → S2. „Auftrag annehmen“ ist der erste Besuch von M1. */
export function nimmAuftragAn() {
  aendere((alt) => ({ ...alt, currentStepId: ERSTER_STEP, visited: [ERSTER_STEP] }))
  hatWiedereinstieg = true
  setzeBildschirm('step')
}

/** Idle-Rückfall und Staff-Ausgang: zurück auf S0, **ohne** zu löschen. */
export function zumSplash() {
  setzeBildschirm('splash')
}

/** Harter Reset für das Standpersonal. */
export function setzeZurueck() {
  fortschritt = leer()
  hatWiedereinstieg = false
  try {
    localStorage.removeItem(SPEICHER_SCHLUESSEL)
  } catch {
    // s. o.
  }
  setzeBildschirm('splash')
}

/**
 * Ein Schritt vorwärts in der Historie. Ein Abstecher wird zusätzlich in
 * `branchesTaken` vermerkt — daraus speist sich der Rückblick in M8.
 */
export function geheZu(ziel: StepId) {
  aendere((alt) => {
    const istAbstecher = step(ziel).art === 'abstecher'
    return {
      ...alt,
      currentStepId: ziel,
      visited: [...alt.visited, ziel],
      branchesTaken:
        istAbstecher && !alt.branchesTaken.includes(ziel)
          ? [...alt.branchesTaken, ziel]
          : alt.branchesTaken,
    }
  })
}

/** Ein Schritt zurück in der besuchten Historie. Auf dem ersten Step wirkungslos. */
export function geheZurueck() {
  aendere((alt) => {
    if (alt.visited.length < 2) return alt
    const historie = alt.visited.slice(0, -1)
    return { ...alt, currentStepId: historie[historie.length - 1], visited: historie }
  })
}

/**
 * Sprung aus dem Sheet „Dein Weg“ auf einen bereits besuchten Schritt.
 *
 * Die Historie wird **nicht** zurückgeschnitten, sondern fortgeschrieben: der
 * Sprung ist selbst ein Schritt, und „Zurück“ macht ihn rückgängig. Das ist das
 * Verhalten, das jeder von einem Browser kennt — und es erhält den Rückblick in
 * M8, der aus derselben Liste gespeist wird.
 */
export function springeZuBesuchtem(ziel: StepId) {
  aendere((alt) =>
    alt.visited.includes(ziel)
      ? { ...alt, currentStepId: ziel, visited: [...alt.visited, ziel] }
      : alt,
  )
}

/** Karriere-Skip: merkt den aktuellen Schritt und öffnet den Karriere-Bereich. */
export function starteKarriereSkip() {
  aendere((alt) => ({
    ...alt,
    detourReturnTo: alt.currentStepId,
    currentStepId: 'M9',
    visited: [...alt.visited, 'M9'],
  }))
}

/** „Zurück zu deinem Tag“ — exakt an dieselbe Stelle, ein Tap raus. */
export function beendeKarriereSkip() {
  aendere((alt) => {
    if (!alt.detourReturnTo) return alt
    const ziel = alt.detourReturnTo
    return {
      ...alt,
      currentStepId: ziel,
      visited: [...alt.visited, ziel],
      detourReturnTo: null,
    }
  })
}

export function merkeAntwort<K extends keyof Antworten>(
  schluessel: K,
  wert: Antworten[K],
) {
  aendere((alt) => ({ ...alt, answers: { ...alt.answers, [schluessel]: wert } }))
}

// ---------------------------------------------------------------------------
// Lesen
// ---------------------------------------------------------------------------

function abonniere(hoerer_: () => void) {
  hoerer.add(hoerer_)
  return () => {
    hoerer.delete(hoerer_)
  }
}

export function useFortschritt(): Fortschritt {
  return useSyncExternalStore(abonniere, () => fortschritt)
}

export function useBildschirm(): Bildschirm {
  return useSyncExternalStore(abonniere, () => bildschirm)
}

/** Für S0: gibt es überhaupt etwas zum Weitermachen? */
export function useWiedereinstieg(): Fortschritt | null {
  const p = useSyncExternalStore(abonniere, () => fortschritt)
  const moeglich = useSyncExternalStore(abonniere, () => hatWiedereinstieg)
  return moeglich && p.visited.length > 0 ? p : null
}
