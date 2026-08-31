/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** PostHog-Projektschlüssel (EU-Cloud). Fehlt er, läuft die App ohne Analytik. */
  readonly VITE_POSTHOG_KEY?: string
  /** Abweichender PostHog-Host. Standard: https://eu.i.posthog.com */
  readonly VITE_POSTHOG_HOST?: string
}
