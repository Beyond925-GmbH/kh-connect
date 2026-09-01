import { createContext, useContext, useEffect, useId, useRef } from 'react'

/**
 * Der fachliche Einwurf zum Screen — **im Panel, nach dem Lösen**,
 * nicht mehr als Banner, das sich auf einer Uhr meldet.
 *
 * **Warum der dritte Umbau.** Die Vorfassung tippte dem Besucher oben rechts
 * auf die Schulter: erste Pause 4 s, danach 15/22/15/31 s, je 6 s sichtbar.
 * Das ist ein zweiter Bildschirmbereich mit eigenem Takt, der sich **während**
 * der Arbeit meldet — auf einem Screen, der ohnehin schon dreizehn Elemente
 * trägt. Es konkurrierte mit genau der Übung, zu der es gehört.
 *
 * Jetzt hat der Einwurf keinen eigenen Ort mehr. Er erscheint dort, wo der
 * Fachtext sitzt: in der Klappzeile über dem Auftrag (`Warum.tsx`). Sobald
 * eine Übung gelöst ist, geht sie **einmal von selbst auf** und zeigt ihn.
 * Das ist die Belohnung, und sie steht an einer Stelle, die der Besucher
 * schon kennt.
 *
 * **Die Steps bleiben, wie sie sind.** `<AhaKarte sichtbar eyebrow="…">` liest
 * sich unverändert und rendert weiterhin selbst nichts — sie meldet ihren
 * Inhalt nur an. Damit kostet der Umbau keine einzige Änderung in den
 * siebenundfünfzig Step-Dateien.
 */

export interface Einwurf {
  /** Die Frage, die im geschlossenen Zustand neugierig macht. */
  frage: string
  inhalt: React.ReactNode
  /**
   * Zugeklappt starten: nur die Frage steht da, der Inhalt kommt auf Tipp
   * (Akkordeon in `Warum.tsx`). Für Steps mit mehr als einem Einwurf — zwei
   * automatisch ausgeschriebene Karten sprengen das Wortbudget. Der
   * erste Einwurf hat sein Akkordeon ohnehin schon: die Klappzeile selbst.
   */
  zugeklappt: boolean
}

export interface AhaEintrag {
  id: string
  daten: { current: Einwurf }
}

export const AhaKontext = createContext<{
  melde: (eintrag: AhaEintrag) => void
  nimmZurueck: (id: string) => void
} | null>(null)

export function AhaKarte({
  sichtbar,
  eyebrow = 'Übrigens',
  zugeklappt = false,
  children,
}: {
  sichtbar: boolean
  /**
   * Die eine Zeile, die im geschlossenen Zustand steht. Sie muss neugierig
   * machen, ohne die Pointe zu verraten — sie ist der ganze Grund, warum
   * jemand die Klappzeile antippt.
   */
  eyebrow?: string | null
  /**
   * Zugeklappt starten (siehe `Einwurf.zugeklappt`). Default bleibt das
   * bisherige Verhalten: der Inhalt steht ausgeschrieben da.
   */
  zugeklappt?: boolean
  children: React.ReactNode
}) {
  const id = useId()
  const bereich = useContext(AhaKontext)

  // Der Inhalt wandert über eine Ref statt über den State: er ist bei jedem
  // Render ein neues Element, und ein State-Update pro Render wäre eine
  // Schleife.
  const daten = useRef<Einwurf>({
    frage: eyebrow ?? 'Übrigens',
    inhalt: children,
    zugeklappt,
  })
  daten.current = { frage: eyebrow ?? 'Übrigens', inhalt: children, zugeklappt }

  useEffect(() => {
    if (!sichtbar || !bereich) return
    bereich.melde({ id, daten })
    return () => bereich.nimmZurueck(id)
  }, [sichtbar, bereich, id])

  return null
}
