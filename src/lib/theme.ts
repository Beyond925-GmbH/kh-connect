import { useSyncExternalStore } from 'react'

/**
 * Theme preference. `system` follows the OS setting and is the default —
 * dark mode is opt-in, the light design stays the canonical one.
 */
export type Theme = 'system' | 'light' | 'dark'
export type ResolvedTheme = 'light' | 'dark'

/** Kept in sync with the inline no-flash script in index.html. */
const STORAGE_KEY = 'kh-theme'

/** Browser chrome colour: brand orange in light, the page ground in dark. */
const THEME_COLOR: Record<ResolvedTheme, string> = {
  light: '#FF9F2A',
  dark: '#141311',
}

const media = window.matchMedia('(prefers-color-scheme: dark)')
const listeners = new Set<() => void>()

function readStored(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === 'light' || stored === 'dark' ? stored : 'system'
  } catch {
    // Storage can be blocked (private mode, sandboxed iframe) — fall back to the OS.
    return 'system'
  }
}

let theme: Theme = readStored()
let resolved: ResolvedTheme = 'light'

function apply() {
  resolved = theme === 'system' ? (media.matches ? 'dark' : 'light') : theme
  document.documentElement.classList.toggle('dark', resolved === 'dark')
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', THEME_COLOR[resolved])
  listeners.forEach((listener) => listener())
}

export function setTheme(next: Theme) {
  theme = next
  try {
    if (next === 'system') {
      localStorage.removeItem(STORAGE_KEY)
    } else {
      localStorage.setItem(STORAGE_KEY, next)
    }
  } catch {
    // Preference is not persisted, but the session still switches.
  }
  apply()
}

media.addEventListener('change', () => {
  if (theme === 'system') {
    apply()
  }
})

// Keep other tabs of the app in step.
window.addEventListener('storage', (event) => {
  if (event.key === STORAGE_KEY) {
    theme = readStored()
    apply()
  }
})

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

// Idempotent with the inline script; also covers the storage-blocked case.
apply()

export function useTheme() {
  return {
    theme: useSyncExternalStore(subscribe, () => theme),
    resolved: useSyncExternalStore(subscribe, () => resolved),
    setTheme,
  }
}
