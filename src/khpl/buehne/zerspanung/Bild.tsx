import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Der Rahmen, in dem die Zeichnungen dieses Tages sitzen.
 *
 * Dieselbe Klemme wie bei der Anlagenmechanik (`Schnitt.tsx`, `useRahmen`):
 * die `StepShell` legt ihr Panel über die Bühne — quer links, hochkant
 * unten —, und eine Zeichnung, die das nicht weiß, liegt zur Hälfte
 * dahinter. Auf Z1 wären das ausgerechnet die antippbaren Maße.
 *
 * Gemessen wird deshalb die Kante des Panels (`[data-testid="karte"]`):
 * hochkant seine Oberkante, quer seine rechte Kante. Solange nichts gemessen
 * ist, gilt ein Festwert — ein Screen, der beim ersten Bild knapp
 * danebenliegt, ist besser als einer, der springt.
 *
 * Die Zeichnungen selbst tragen **keine Grundplatte**: sie stehen als Linien
 * auf dem Bühnenschwarz, deshalb reicht hier `preserveAspectRatio="meet"`
 * im Kind und es entsteht keine harte Kante, hinter der die Fläche wechselt.
 */
export function Bild({
  children,
  testid,
}: {
  /** Bekommt das Seitenverhältnis des gemessenen Rahmens gereicht. */
  children: (seiten: number) => React.ReactNode
  testid?: string
}) {
  const { flaeche, rahmen, seiten } = useRahmen()

  return (
    <div ref={flaeche} className="size-full" data-testid={testid}>
      <div className="absolute" style={rahmen}>
        {children(seiten)}
      </div>
    </div>
  )
}

/** Luft zwischen Zeichnung und Panelkante. */
const LUFT_ZUM_PANEL = 14

/** Oberkante der Bühne — darüber schwebt die Leiste. */
const UNTER_DER_LEISTE = 76

/** Seitlicher Rand hochkant. */
const RAND = 12

/** Quer: Luft zur Screenkante rechts, oben und unten — als Anteil. */
const QUER_RAND = { seite: 0.03, hoehe: 0.07 } as const

/** Quer: so viel Breite behält die Zeichnung mindestens. */
const QUER_MINDEST_BREITE = 0.3

function useRahmen() {
  const flaeche = useRef<HTMLDivElement>(null)
  const [rahmen, setRahmen] = useState<React.CSSProperties>({
    inset: '76px 12px 32% 12px',
  })
  const [seiten, setSeiten] = useState(320 / 240)

  const messen = useCallback(() => {
    const el = flaeche.current
    const f = el?.getBoundingClientRect()
    if (!el || !f || f.width <= 0 || f.height <= 0) return
    const panel = el
      .closest('[data-testid="step"]')
      ?.querySelector('[data-testid="karte"]')
      ?.getBoundingClientRect()

    if (f.width > f.height) {
      const links = Math.min(
        panel
          ? Math.max(0, panel.right - f.left + LUFT_ZUM_PANEL)
          : f.width * QUER_MINDEST_BREITE,
        f.width * (1 - QUER_RAND.seite - QUER_MINDEST_BREITE),
      )
      const breite = f.width - links - f.width * QUER_RAND.seite
      const hoehe = f.height * (1 - 2 * QUER_RAND.hoehe)
      setRahmen({
        inset: `${(QUER_RAND.hoehe * 100).toFixed(0)}% ${(QUER_RAND.seite * 100).toFixed(0)}% ${(QUER_RAND.hoehe * 100).toFixed(0)}% ${Math.round(links)}px`,
      })
      setSeiten(Math.max(0.1, breite) / Math.max(1, hoehe))
      return
    }

    // Der Deckel ist die Reißleine für kleine Fenster: ein Panel, das fast
    // die ganze Höhe nimmt, darf den Rahmen nicht ins Negative drücken.
    const unten = Math.min(
      panel ? Math.max(0, f.bottom - panel.top + LUFT_ZUM_PANEL) : f.height * 0.32,
      f.height - UNTER_DER_LEISTE - 80,
    )
    setRahmen({
      inset: `${UNTER_DER_LEISTE}px ${RAND}px ${Math.round(unten)}px ${RAND}px`,
    })
    setSeiten(
      (f.width - 2 * RAND) / Math.max(1, f.height - UNTER_DER_LEISTE - Math.round(unten)),
    )
  }, [])

  useEffect(() => {
    messen()
    const el = flaeche.current
    if (!el) return
    const panel = el
      .closest('[data-testid="step"]')
      ?.querySelector('[data-testid="karte"]')
    const beobachter = new ResizeObserver(messen)
    beobachter.observe(el)
    if (panel) beobachter.observe(panel)
    // Das Panel fährt beim Betreten 22 px von unten herein (`StepShell`).
    // Eine Verschiebung ist keine Größenänderung — ohne diese zweite Messung
    // bliebe die Zeichnung um genau diese 22 px zu hoch.
    const nachtreten = window.setTimeout(messen, 700)
    return () => {
      beobachter.disconnect()
      window.clearTimeout(nachtreten)
    }
  }, [messen])

  return { flaeche, rahmen, seiten }
}
