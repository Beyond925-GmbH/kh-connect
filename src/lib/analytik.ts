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
 * Reload übersteht. Bewusst nicht localStorage: das iPad ist geteilt, und eine
 * Identität, die den Tab überlebt, würde Besucher aneinanderkleben.
 *
 * Ohne `VITE_POSTHOG_KEY` sind alle Funktionen hier wirkungslos — lokale
 * Entwicklung und Vorschau-Deploys senden schlicht nichts.
 */

const SCHLUESSEL = import.meta.env.VITE_POSTHOG_KEY
const HOST = import.meta.env.VITE_POSTHOG_HOST ?? 'https://eu.i.posthog.com'

const bereit = typeof SCHLUESSEL === 'string' && SCHLUESSEL.length > 0

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
}

/** Ob ein Schlüssel gesetzt ist. Ohne ihn zeigt der Dialog sich gar nicht erst. */
export function istAnalytikBereit(): boolean {
  return bereit
}

export function erfasse(ereignis: string, eigenschaften?: Record<string, unknown>) {
  if (bereit) posthog.capture(ereignis, eigenschaften)
}

/** Stufe 2, nur nach ausdrücklicher Zustimmung des Besuchers. */
export function aktiviereVolleAnalytik() {
  if (!bereit) return
  posthog.set_config({ persistence: 'sessionStorage' })
  posthog.startSessionRecording()
}

/**
 * Trennt zwei Besucher: Aufzeichnung aus, zurück in Stufe 1, neue anonyme
 * Identität. Läuft bei jedem Sitzungsende (`vergiss` im Store) — sonst wären
 * alle Besucher eines Messetags in PostHog **eine** Person, und die Zustimmung
 * des einen gälte stillschweigend für den nächsten.
 */
export function neueAnalytikSitzung() {
  if (!bereit) return
  posthog.stopSessionRecording()
  posthog.set_config({ persistence: 'memory' })
  posthog.reset()
}
