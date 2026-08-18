import { useEffect, useState } from 'react'

/**
 * Wer heute am Stand steht (khpl-flow.md 7 M10).
 *
 * Der Name für „Sprich jetzt mit [Name] am Stand“ steht in
 * `public/stand.json` und wird beim Start geladen — **kein Rebuild, kein
 * Deploy**. Das Standpersonal ändert die Datei, wenn die Schicht wechselt.
 *
 * Fehlt die Datei oder ist der Name leer, fällt der Text auf „Sprich jetzt mit
 * uns am Stand“ zurück — **nie auf einen Platzhalter im Klartext**. Ein
 * `[Name]` auf dem Abschlussscreen einer Messeanwendung ist schlimmer als gar
 * kein Name.
 */

export interface Stand {
  name: string
  rolle: string
}

const LEER: Stand = { name: '', rolle: '' }

let stand: Stand = LEER
let geladen = false
const hoerer = new Set<() => void>()

async function lade() {
  if (geladen) return
  geladen = true
  try {
    // `no-store`: die Datei wird am Messetag von Hand geändert, und ein
    // Service-Worker-Cache, der sie festhält, macht die ganze Mechanik wertlos.
    const antwort = await fetch('/stand.json', { cache: 'no-store' })
    if (!antwort.ok) return
    const daten: unknown = await antwort.json()
    if (typeof daten !== 'object' || daten === null) return
    const d = daten as Partial<Stand>
    stand = {
      name: typeof d.name === 'string' ? d.name.trim() : '',
      rolle: typeof d.rolle === 'string' ? d.rolle.trim() : '',
    }
    hoerer.forEach((h) => h())
  } catch {
    // Kein Netz, keine Datei, kaputtes JSON — der Fallback trägt den Screen.
  }
}

export function useStand(): Stand {
  const [, neu] = useState(0)

  useEffect(() => {
    const h = () => neu((n) => n + 1)
    hoerer.add(h)
    void lade()
    return () => {
      hoerer.delete(h)
    }
  }, [])

  return stand
}
