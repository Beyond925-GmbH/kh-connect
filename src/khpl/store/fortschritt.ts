import { useSyncExternalStore } from 'react'
import type { StepId } from '@/khpl/flow/steps'
import { ERSTER_STEP, istStepId, railIndex, step } from '@/khpl/flow/steps'

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

/** M9 und alles darunter — der Karriere-Bereich S4/S5. */
const KARRIERE: readonly StepId[] = ['M9', 'B9.1', 'B9.2', 'B9.3', 'M10']

function imKarriereBereich(id: StepId): boolean {
  return KARRIERE.includes(id)
}

/** Typisierte Sicht auf `answers`. Bleibt zur Laufzeit ein reines JSON-Objekt. */
export interface Antworten {
  /** M1 — angetippte Checklistenpunkte und ob schon ausgewertet wurde. */
  m1?: { gewaehlt: string[]; ausgewertet: boolean }
  /** M2 — geschätzter Dachpreis in Euro, und ob die echte Zahl schon stand. */
  m2?: { schaetzung: number; aufgeloest: boolean }
  /** B3.2 — welche Bauteile am 3D-Modell angetippt wurden. */
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
  /**
   * Der weiteste erreichte Hauptschritt — die Hochwassermarke.
   *
   * Nicht in der Spec, aber ohne sie bricht ein Versprechen aus ui-shell 4:
   * ein ✓ im Sheet ist antippbar, „springt zum Schritt zurück“. Leitet man
   * „besucht“ allein aus der aktuellen Position ab, entwerten sich beim
   * Zurückspringen alle Häkchen dahinter, die Rail schrumpft, und es gibt
   * keinen Weg zurück nach vorn außer mehrfach *Weiter*. Die Marke wächst
   * nur auf der Hauptlinie und **nicht** im Karriere-Skip — sonst sperrte
   * ein neugieriger Tap auf „Karriere-Wege“ neun von zehn Segmenten auf.
   */
  hoechsterStep: StepId
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
    hoechsterStep: ERSTER_STEP,
    branchesTaken: [],
    answers: {},
    detourReturnTo: null,
    updatedAt: Date.now(),
  }
}

/**
 * Prüft die gespeicherten Antworten oberflächlich nach.
 *
 * `version` allein reicht nicht: sie bleibt `1`, während sich die Form von
 * `answers` mit jedem neuen Step ändert. Der reale Fall ist ein Deploy am
 * Messemorgen — ein iPad, das zehn Minuten vorher benutzt wurde, lädt den
 * alten Stand, `version` passt, und der Rückblick in M8 stolpert vor einem
 * Besucher über ein Feld, das es nicht mehr gibt. Was nicht passt, fliegt
 * einzeln raus statt den ganzen Stand mitzureißen.
 */
function pruefeAntworten(roh: unknown): Antworten {
  if (typeof roh !== 'object' || roh === null) return {}
  const q = roh as Record<string, unknown>
  const a: Antworten = {}

  const stringListe = (w: unknown) =>
    Array.isArray(w) ? w.filter((x): x is string => typeof x === 'string') : null

  const m1 = q.m1 as Antworten['m1']
  if (m1 && stringListe(m1.gewaehlt)) {
    a.m1 = {
      gewaehlt: stringListe(m1.gewaehlt) as string[],
      ausgewertet: !!m1.ausgewertet,
    }
  }
  const m2 = q.m2 as Antworten['m2']
  if (m2 && typeof m2.schaetzung === 'number' && Number.isFinite(m2.schaetzung)) {
    a.m2 = { schaetzung: m2.schaetzung, aufgeloest: !!m2.aufgeloest }
  }
  const b32 = q.b32 as Antworten['b32']
  if (b32 && stringListe(b32.angetippt)) {
    a.b32 = { angetippt: stringListe(b32.angetippt) as string[] }
  }
  const m4 = q.m4 as Antworten['m4']
  if (m4 && typeof m4.versuche === 'number') {
    a.m4 = { getroffen: !!m4.getroffen, versuche: m4.versuche }
  }
  const b41 = q.b41 as Antworten['b41']
  if (b41 && stringListe(b41.geladen)) {
    a.b41 = { geladen: stringListe(b41.geladen) as string[], fertig: !!b41.fertig }
  }
  const m7 = q.m7 as Antworten['m7']
  if (m7 && stringListe(m7.gesetzt)) {
    a.m7 = { gesetzt: stringListe(m7.gesetzt) as string[], fertig: !!m7.fertig }
  }
  const m9 = q.m9 as Antworten['m9']
  if (m9 && Array.isArray(m9.angesehen)) {
    // Fällt eine StepId aus der Union, darf sie nicht als `STEPS[id].titel`
    // wieder auftauchen.
    a.m9 = { angesehen: m9.angesehen.filter(istStepId) }
  }
  return a
}

/**
 * Liest den gespeicherten Stand. Alles, was nicht exakt passt — falsche
 * `version`, kaputtes JSON, unbekannte StepId — wird still verworfen. Ein
 * Datenmodell-Wechsel darf am Messestand nicht crashen.
 *
 * Der **Verfall wird hier nicht geprüft**: siehe `pruefeVerfall`.
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

    const visited = Array.isArray(p.visited) ? p.visited.filter(istStepId) : []

    return {
      version: 1,
      currentStepId: p.currentStepId,
      visited,
      hoechsterStep: istStepId(p.hoechsterStep) ? p.hoechsterStep : p.currentStepId,
      branchesTaken: Array.isArray(p.branchesTaken)
        ? p.branchesTaken.filter(istStepId)
        : [],
      answers: pruefeAntworten(p.answers),
      detourReturnTo: istStepId(p.detourReturnTo) ? p.detourReturnTo : null,
      updatedAt: p.updatedAt,
    }
  } catch {
    return null
  }
}

let fortschritt: Fortschritt = lade() ?? leer()
/** Ob ein Stand zum Weitermachen bereitliegt. */
let hatWiedereinstieg = fortschritt.visited.length > 0
let bildschirm: Bildschirm = 'splash'

const hoerer = new Set<() => void>()

function melde() {
  hoerer.forEach((h) => h())
}

function vergiss() {
  fortschritt = leer()
  hatWiedereinstieg = false
  try {
    localStorage.removeItem(SPEICHER_SCHLUESSEL)
  } catch {
    // s. u.
  }
}

/**
 * Verwirft einen abgelaufenen Stand. Gibt zurück, ob etwas verworfen wurde.
 *
 * Muss **zur Lesezeit** laufen, nicht beim Laden des Moduls: das Kiosk-iPad
 * lädt die Seite genau einmal am Messemorgen und läuft dann stundenlang. Ein
 * Verfallstest, der nur beim Modulstart stattfindet, ist in genau dem einzigen
 * Betriebsmodus tot, für den er geschrieben wurde — der Splash böte um halb
 * zwölf noch an, die Sitzung von neun Uhr fortzusetzen, samt fremder Antworten
 * im Rückblick von M8.
 */
export function pruefeVerfall(): boolean {
  if (!hatWiedereinstieg) return false
  if (Date.now() - fortschritt.updatedAt <= VERFALL_MS) return false
  vergiss()
  melde()
  return true
}

function sichere() {
  try {
    localStorage.setItem(SPEICHER_SCHLUESSEL, JSON.stringify(fortschritt))
  } catch {
    // Speicher gesperrt oder voll (privater Modus, Sandbox) — die Sitzung läuft
    // trotzdem, sie überlebt nur keinen Reload.
  }
}

/** Reißleine gegen eine Historie, die durch Hin-und-Her-Tappen davonläuft. */
const MAX_HISTORIE = 300

function aendere(f: (alt: Fortschritt) => Fortschritt) {
  const neu = f(fortschritt)
  // Wirkungslose Aktionen — ← auf dem ersten Step, ein Sprung ins Gesperrte —
  // dürfen weder speichern noch `updatedAt` auffrischen: sonst hält ein
  // Besucher, der auf dem ersten Screen herumtippt, den Verfall ewig offen.
  if (neu === fortschritt) return

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

/** Hochwassermarke fortschreiben — nur auf der Hauptlinie, nie im Skip. */
function marke(alt: Fortschritt, ziel: StepId): StepId {
  if (alt.detourReturnTo !== null) return alt.hoechsterStep
  return railIndex(ziel) > railIndex(alt.hoechsterStep) ? ziel : alt.hoechsterStep
}

/**
 * Verlässt ein Zug den Karriere-Bereich, ist der Skip vorbei — egal ob über
 * die Rückkehr-Leiste, über ← oder über einen Wisch. Bliebe `detourReturnTo`
 * stehen, zeigte die App für den Rest der Sitzung die Skip-Leiste statt der
 * Rail, und ui-shell 4 („auf **jedem** S2-Screen“) wäre gebrochen.
 */
function skipStand(alt: Fortschritt, ziel: StepId): StepId | null {
  if (alt.detourReturnTo === null) return null
  return imKarriereBereich(ziel) ? alt.detourReturnTo : null
}

// ---------------------------------------------------------------------------
// Aktionen
// ---------------------------------------------------------------------------

/** S0 → S1. Verwirft einen alten Stand vollständig. */
export function starteNeu() {
  vergiss()
  sichere()
  setzeBildschirm('intro')
}

/** S0 → S2 an der Stelle, an der der letzte Besucher aufgehört hat. */
export function machWeiter() {
  if (pruefeVerfall()) return
  setzeBildschirm('step')
}

/** S1 → S2. „Auftrag annehmen“ ist der erste Besuch von M1. */
export function nimmAuftragAn() {
  // Vollständiger Reset, nicht nur der Zeiger: sonst erbte eine neue Sitzung
  // Abstecher und Antworten der vorigen, sobald S1 von woanders erreichbar wird.
  aendere(() => ({ ...leer(), currentStepId: ERSTER_STEP, visited: [ERSTER_STEP] }))
  hatWiedereinstieg = true
  setzeBildschirm('step')
}

/** Idle-Rückfall: zurück auf S0, **ohne** zu löschen. */
export function zumSplash() {
  setzeBildschirm('splash')
}

/** Harter Reset für das Standpersonal. */
export function setzeZurueck() {
  vergiss()
  setzeBildschirm('splash')
}

/**
 * Ein Schritt vorwärts. Ein Abstecher wird zusätzlich in `branchesTaken`
 * vermerkt — daraus speist sich der Rückblick in M8.
 */
export function geheZu(ziel: StepId) {
  aendere((alt) => {
    const def = step(ziel)
    // `immerOffen` sind die drei Karrierekarten. Sie zählen nicht als
    // genommener Abstecher: sie sollen im Angebot bleiben (flow 7 M9), und sie
    // gehören nicht in den Rückblick von M8 — „du hast heute … eine Info-Seite
    // gelesen“ ist keine Tageleistung. Angesehen wird in `answers.m9` vermerkt.
    const zaehlt = def.art === 'abstecher' && !def.immerOffen
    return {
      ...alt,
      currentStepId: ziel,
      visited: [...alt.visited, ziel],
      hoechsterStep: marke(alt, ziel),
      detourReturnTo: skipStand(alt, ziel),
      branchesTaken:
        zaehlt && !alt.branchesTaken.includes(ziel)
          ? [...alt.branchesTaken, ziel]
          : alt.branchesTaken,
    }
  })
}

/** Merkt einen angesehenen Karriereweg — Grundlage für den CTA in M10. */
export function merkeKarriereweg(ziel: StepId) {
  aendere((alt) => {
    const bisher = alt.answers.m9?.angesehen ?? []
    if (bisher[bisher.length - 1] === ziel) return alt
    return {
      ...alt,
      answers: {
        ...alt.answers,
        // Reihenfolge des Öffnens; der zuletzt geöffnete Weg speist den
        // personalisierten Aufhänger in M10 (flow 11, M10).
        m9: { angesehen: [...bisher.filter((x) => x !== ziel), ziel] },
      },
    }
  })
}

/** Ein Schritt zurück in der besuchten Historie. Auf dem ersten Step wirkungslos. */
export function geheZurueck() {
  aendere((alt) => {
    if (alt.visited.length < 2) return alt
    const historie = alt.visited.slice(0, -1)
    const ziel = historie[historie.length - 1]
    return {
      ...alt,
      currentStepId: ziel,
      visited: historie,
      detourReturnTo: skipStand(alt, ziel),
    }
  })
}

/**
 * Sprung aus dem Sheet „Dein Weg“ auf einen bereits besuchten Schritt.
 *
 * Die Historie wird **nicht** zurückgeschnitten, sondern fortgeschrieben: der
 * Sprung ist selbst ein Schritt, und „Zurück“ macht ihn rückgängig. Das ist das
 * Verhalten, das jeder von einem Browser kennt — und es erhält den Rückblick in
 * M8, der aus derselben Liste gespeist wird.
 *
 * Die Sperre gegen Sprünge nach vorn steht hier noch einmal, nicht nur in der
 * Darstellung des Sheets: eine Regel, die nur im Rendern lebt, ist keine.
 */
export function springeZuBesuchtem(ziel: StepId) {
  aendere((alt) => {
    if (!alt.visited.includes(ziel)) return alt
    if (railIndex(ziel) > railIndex(alt.hoechsterStep)) return alt
    return {
      ...alt,
      currentStepId: ziel,
      visited: [...alt.visited, ziel],
      detourReturnTo: skipStand(alt, ziel),
    }
  })
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
    return {
      ...alt,
      currentStepId: alt.detourReturnTo,
      visited: [...alt.visited, alt.detourReturnTo],
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
