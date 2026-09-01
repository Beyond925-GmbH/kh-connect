import { useSyncExternalStore } from 'react'
import posthog from 'posthog-js'

/**
 * PostHog (EU-Cloud, Frankfurt) in zwei Stufen.
 *
 * **Stufe 1 — immer an, ohne Zustimmung.** `persistence: 'memory'` legt nichts
 * auf dem Gerät ab — keine Cookies, kein localStorage. Damit greift § 25 TDDDG
 * nicht, und die anonyme Zählung (Screens, Taps, Trichter) braucht keinen
 * Banner. Sie erfasst deshalb jeden Besucher, nicht nur die, die zustimmen.
 *
 * **Stufe 2 — erst nach Zustimmung** (`aktiviereVolleAnalytik`): Aufzeichnung
 * der Bedienung und `sessionStorage`-Persistenz, damit die Sitzung einen
 * Reload übersteht.
 *
 * Ohne `VITE_POSTHOG_KEY` sind alle Funktionen hier wirkungslos — lokale
 * Entwicklung und Vorschau-Deploys senden schlicht nichts.
 */

const SCHLUESSEL = import.meta.env.VITE_POSTHOG_KEY
const HOST = import.meta.env.VITE_POSTHOG_HOST ?? 'https://eu.i.posthog.com'

const bereit = typeof SCHLUESSEL === 'string' && SCHLUESSEL.length > 0

/** Entscheidung des Besuchers im Zustimmungsdialog (`shell/Zustimmung.tsx`). */
export type AnalytikWahl = 'voll' | 'anonym'

/**
 * Die Zustimmung liegt **am Gerät, nicht an der Sitzung** — eigener
 * localStorage-Schlüssel neben `khpl-progress`, nicht darin.
 *
 * Das ist der Unterschied, auf den es ankommt: „Neu starten“, der Idle-Verfall
 * und jeder Reload werfen den Spielstand weg (`vergiss` im Store räumt
 * `khpl-progress` komplett ab). Die Cookie-Entscheidung überlebt das alles und
 * wird **einmal am Gerät** getroffen — sonst stünde der Dialog nach jedem
 * Reset wieder da, und das Standpersonal beantwortete ihn den ganzen Tag.
 *
 * ⚠️ Damit erbt der nächste Besucher am geteilten iPad die Entscheidung des
 * vorigen. Die Aufzeichnung bleibt anonym (kein Name, keine Identität über die
 * Sitzung hinaus, neue Identität bei jedem Reset), aber die Einwilligung ist
 * dann die des Geräts und nicht die der Person.
 */
const WAHL_SCHLUESSEL = 'khpl-analytik'

function ladeWahl(): AnalytikWahl | null {
  try {
    const roh = localStorage.getItem(WAHL_SCHLUESSEL)
    return roh === 'voll' || roh === 'anonym' ? roh : null
  } catch {
    // Speicher gesperrt (privater Modus, Sandbox) — dann wird eben gefragt.
    return null
  }
}

let wahl = ladeWahl()
const hoerer = new Set<() => void>()

if (bereit) {
  posthog.init(SCHLUESSEL, {
    api_host: HOST,
    persistence: 'memory',
    autocapture: true,
    // Die App hat keine URLs — Screens meldet der Store als `bildschirm_gesehen`.
    capture_pageview: false,
    capture_pageleave: false,
    disable_session_recording: true,
    disable_surveys: true,
    session_recording: { maskAllInputs: true },
  })
  // Eine früher erteilte Zustimmung gilt weiter: Stufe 2 läuft sofort wieder
  // an, ohne dass jemand noch einmal gefragt wird.
  if (wahl === 'voll') aktiviereVolleAnalytik()
}

/** Ob ein Schlüssel gesetzt ist. Ohne ihn zeigt der Dialog sich gar nicht erst. */
export function istAnalytikBereit(): boolean {
  return bereit
}

export function erfasse(ereignis: string, eigenschaften?: Record<string, unknown>) {
  if (bereit) posthog.capture(ereignis, eigenschaften)
}

/** Stufe 2, nur nach ausdrücklicher Zustimmung des Besuchers. */
function aktiviereVolleAnalytik() {
  if (!bereit) return
  posthog.set_config({ persistence: 'sessionStorage' })
  posthog.startSessionRecording()
}

/** Zurück auf Stufe 1 — nichts mehr auf dem Gerät, keine Aufzeichnung. */
function zurueckAufStufeEins() {
  if (!bereit) return
  posthog.stopSessionRecording()
  posthog.set_config({ persistence: 'memory' })
}

/** Die getroffene Entscheidung, oder `null`, solange nicht gefragt wurde. */
export function analytikWahl(): AnalytikWahl | null {
  return wahl
}

/** Entscheidung aus dem Zustimmungsdialog — wird am Gerät festgehalten. */
export function merkeAnalytik(neu: AnalytikWahl) {
  if (wahl === neu) return
  wahl = neu
  try {
    localStorage.setItem(WAHL_SCHLUESSEL, neu)
  } catch {
    // Nicht speicherbar: die Wahl gilt dann nur für diesen Tab.
  }
  hoerer.forEach((h) => h())
  erfasse('analytik_entschieden', { wahl: neu })
  if (neu === 'voll') aktiviereVolleAnalytik()
  else zurueckAufStufeEins()
}

/**
 * Trennt zwei Besucher: neue anonyme Identität, neue Aufzeichnung. Läuft bei
 * jedem Sitzungsende (`vergiss` im Store) — sonst wären alle Besucher eines
 * Messetags in PostHog **eine** Person.
 *
 * **Die Zustimmung bleibt dabei stehen.** Zurückgesetzt wird die Identität,
 * nicht die Entscheidung: Wer zugestimmt hat, wird nach „Neu starten“ nicht
 * erneut gefragt, und wer abgelehnt hat, bleibt abgelehnt.
 */
export function neueAnalytikSitzung() {
  if (!bereit) return
  posthog.stopSessionRecording()
  posthog.reset()
  if (wahl === 'voll') aktiviereVolleAnalytik()
  else posthog.set_config({ persistence: 'memory' })
}

function abonniere(h: () => void) {
  hoerer.add(h)
  return () => {
    hoerer.delete(h)
  }
}

export function useAnalytikWahl(): AnalytikWahl | null {
  return useSyncExternalStore(abonniere, () => wahl)
}
