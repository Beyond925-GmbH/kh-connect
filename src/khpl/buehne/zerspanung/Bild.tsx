import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode, RefObject } from 'react'
import { STRICH } from './stil'

/**
 * Der Rahmen, in dem jede Ansicht dieses Tages steht.
 *
 * **Warum alle sechs Zustände denselben Rahmen benutzen.** „Der Zoom ist die
 * Klammer“ (khpl-tag-zerspanung.md §7): die Kamera geht den ganzen Tag in eine
 * Richtung, Zeichnung → Maschine → Messschraube. Das liest sich nur dann als
 * *eine* Kamera, wenn die Bilder auch gleich sitzen. Läge die Bildmitte je
 * Screen woanders, wäre jeder Wechsel ein Schnitt statt einer Fahrt.
 *
 * **Der freie Platz ist nicht der ganze Screen.** `StepShell` legt Leiste,
 * Titel und Panel über die Bühne — hochkant unten, quer links. Ein Bild, das
 * seine Mitte in die Screenmitte legt, liegt damit zur Hälfte unter dem Panel.
 * Deshalb wird die Fläche **gemessen** (`useFreieFlaeche`) und das SVG in den
 * Rest gestellt, der wirklich frei bleibt; quer sind das die rechten Fünftel,
 * und für Z3 fällt das mit der Spec zusammen: **Code links, Werkzeugweg
 * rechts.**
 */

export function Bild({
  viewBox,
  massstab = 1,
  mitte,
  hell = false,
  ueber,
  children,
}: {
  /** `min-x min-y breite hoehe`, in Millimetern der jeweiligen Ansicht. */
  viewBox: string
  /** Zoomfaktor auf `mitte`. 1 heißt: die Ansicht steht, wie sie gedacht ist. */
  massstab?: number
  /** Der Punkt, auf den gezoomt wird. Ohne Angabe die Mitte der Ansicht. */
  mitte?: readonly [number, number]
  /** Der Messraum ist der einzige helle Screen des Tages (§6 Z4). */
  hell?: boolean
  /** Liegt **über** dem Zoom und fährt nicht mit — Detailansichten, Hinweise. */
  ueber?: ReactNode
  children: ReactNode
}) {
  const [minX, minY, breite, hoehe] = viewBox.split(/\s+/).map(Number)
  const [cx, cy] = [minX + breite / 2, minY + hoehe / 2]
  const [mx, my] = mitte ?? [cx, cy]

  const rahmen = useRef<HTMLDivElement>(null)
  const frei = useFreieFlaeche(rahmen)

  return (
    // `data-wisch="aus"` ist die Hausmarke für Flächen, auf denen gezogen
    // werden darf — hier vorsorglich, weil Z3 die Bühne antippbar machen kann.
    <div
      ref={rahmen}
      className={`relative size-full overflow-hidden ${hell ? 'bg-kh-paper' : 'bg-kh-surface'}`}
      data-wisch="aus"
    >
      {/* Kaltes Hallenlicht, aus dem Bestand gebaut: ein neutralweißer Kegel
          von oben auf warmem Schwarz liest sich kühl, ohne dass der Tag eine
          eigene Farbe bekäme — `src/index.css` bleibt eingefroren (§7). */}
      {!hell && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(115% 80% at 50% -8%, rgba(255,255,255,0.10), rgba(255,255,255,0.025) 46%, transparent 74%)',
          }}
        />
      )}

      <div
        className="absolute inset-0"
        style={{
          paddingTop: frei.oben,
          paddingRight: frei.rechts,
          paddingBottom: frei.unten,
          paddingLeft: frei.links,
          // Das Panel wächst und schrumpft im laufenden Step (`Wechsel`). Ohne
          // Übergang springt die Zeichnung bei jedem Takt; mit ihm zieht sie
          // sich zusammen, so wie eine Kamera zurückfährt.
          transition: 'padding 0.34s cubic-bezier(0.2, 0, 0, 1)',
        }}
      >
        <svg
          viewBox={viewBox}
          preserveAspectRatio="xMidYMid meet"
          className="size-full"
          aria-hidden
        >
          <g
            style={{
              // `view-box` legt den Ursprung für `transform-origin` auf die
              // linke obere Ecke der Ansicht — deshalb der Versatz um min-x
              // und min-y. Ohne das zoomt jede Ansicht auf einen anderen Punkt.
              transformBox: 'view-box',
              transformOrigin: `${mx - minX}px ${my - minY}px`,
              transform: `translate(${cx - mx}px, ${cy - my}px) scale(${massstab})`,
              // Raster, keine Springs (§7). `prefers-reduced-motion` schaltet
              // die Dauer global in `index.css` auf null.
              transition: 'transform 0.7s cubic-bezier(0.2, 0, 0, 1)',
            }}
          >
            {children}
          </g>
          {ueber}
        </svg>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Wie viel Fläche der Bühne bleibt
// ---------------------------------------------------------------------------

interface Rand {
  oben: number
  rechts: number
  unten: number
  links: number
}

/** Luft zwischen Zeichnung und Screenkante, in px. */
const LUFT = 20
/** Die Leiste oben (60-px-Ziel plus Rand) — sie steht auf jedem Step. */
const LEISTE = 74
/**
 * Weniger als das darf der Bühne nicht bleiben — hochkant in der Höhe, quer in
 * der Breite.
 *
 * Ein Step mit sehr hohem Panel (Z3 hochkant trägt vierzehn Programmzeilen)
 * drückte die Zeichnung sonst auf einen Streifen zusammen, und ein Werkstück
 * von zwei Zentimetern Höhe ist keine Bühne mehr. Quer ist der Fall noch
 * schärfer: `karteBreit` deckelt das Panel auf 52 rem, und auf einem 4 : 3-Tablet
 * quer ist das fast die ganze Breite — die Bühne bekäme eine Handbreit. Ab
 * dieser Marke wird lieber wieder überlappt; dass der Titel auf dem Bild
 * steht, ist ohnehin Absicht der Hülle.
 */
const MINDEST_HOCH = 0.34
const MINDEST_BREIT = 0.42

/**
 * Auf 2 % der Kantenlänge runden — sonst löst jede Textzeile ein neues
 * Einpassen aus, und die Zeichnung atmet beim Lesen.
 */
function grob(px: number, bezug: number): number {
  const stufe = Math.max(8, bezug * 0.02)
  return Math.round(px / stufe) * stufe
}

/**
 * Misst, was von der Bühnenfläche neben Leiste, Titel und Panel übrig bleibt.
 *
 * **Warum nicht `useSichtfeld`.** Der `SichtfeldMesser` der Hülle täte genau
 * das — er hängt aber an `buehneInteraktiv`, und das Flag zieht quer die
 * Textspalte auf 38 rem zusammen. Z3 braucht dort die breite Spalte für den
 * Code (`karteBreit`). Den Messer selbst aufzuspannen ginge nur mit den Refs
 * der Hülle, und die Hülle ist eingefroren (khpl-tage.md §6.2). Also misst
 * diese Bühne ihre eigene Fläche — dieselbe Rechnung, von der anderen Seite.
 *
 * **Gerechnet wird mit `offsetTop`, nicht mit `getBoundingClientRect`.** Titel
 * und Panel fahren beim Betreten des Steps mit `translateY` ein; ein Rechteck
 * aus dem Renderbaum trüge diesen Versatz mit und die Bühne stellte sich auf
 * einen Stand ein, den es eine halbe Sekunde später nicht mehr gibt. Die
 * Layout-Position kennt keine Transformationen.
 */
function useFreieFlaeche(rahmen: RefObject<HTMLDivElement | null>): Rand {
  const [rand, setRand] = useState<Rand>({
    oben: LEISTE,
    rechts: LUFT,
    unten: LUFT,
    links: LUFT,
  })
  const letzter = useRef(rand)

  const messen = useCallback(() => {
    const flaeche = rahmen.current?.closest('main')
    if (!flaeche) return
    const b = flaeche.clientWidth
    const h = flaeche.clientHeight
    if (b <= 0 || h <= 0) return

    const neu: Rand = { oben: LEISTE, rechts: LUFT, unten: LUFT, links: LUFT }
    const panel = flaeche.querySelector<HTMLElement>('[data-testid="karte"]')

    if (panel) {
      // Der Titel steht unmittelbar über dem Panel — dieselbe Spalte, dieselbe
      // Überlagerung. Er gehört zur belegten Fläche, sonst endet die Kontur
      // mitten in der Überschrift.
      const titel = panel.previousElementSibling as HTMLElement | null
      const oben = Math.min(panel.offsetTop, titel?.offsetTop ?? panel.offsetTop)

      if (b > h) {
        // Quer nimmt das Panel die linke Spalte. Der Streifen darüber ist frei,
        // aber schmal — ein Bild, das dort hineinragt, sieht aus wie ein Fehler.
        neu.links = grob(panel.offsetLeft + panel.offsetWidth + LUFT, b)
      } else {
        neu.unten = grob(h - oben + LUFT, h)
      }
    }

    neu.links = Math.min(neu.links, b * (1 - MINDEST_BREIT))
    neu.unten = Math.min(neu.unten, h - LEISTE - h * MINDEST_HOCH)

    const alt = letzter.current
    if (
      alt.oben === neu.oben &&
      alt.rechts === neu.rechts &&
      alt.unten === neu.unten &&
      alt.links === neu.links
    ) {
      return
    }
    letzter.current = neu
    setRand(neu)
  }, [rahmen])

  useLayoutEffect(messen, [messen])

  useEffect(() => {
    const flaeche = rahmen.current?.closest('main')
    if (!flaeche) return
    const beobachter = new ResizeObserver(messen)
    beobachter.observe(flaeche)
    const panel = flaeche.querySelector('[data-testid="karte"]')
    if (panel) beobachter.observe(panel)
    // Das Panel wird beim Taktwechsel ausgetauscht, nicht nur größer — der
    // neue Knoten braucht seinen eigenen Beobachter.
    const mutation = new MutationObserver(() => {
      const jetzt = flaeche.querySelector('[data-testid="karte"]')
      if (jetzt) beobachter.observe(jetzt)
      messen()
    })
    mutation.observe(flaeche, { childList: true, subtree: true })
    return () => {
      beobachter.disconnect()
      mutation.disconnect()
    }
  }, [messen, rahmen])

  return rand
}

/**
 * Die Mittelachse. In einer technischen Zeichnung strichpunktiert, und das ist
 * keine Zierde: Sie sagt, dass das Teil rotationssymmetrisch ist — der Grund,
 * warum aus einem Halbprofil ein Drehteil wird.
 */
export function Achse({ von, bis, y = 0 }: { von: number; bis: number; y?: number }) {
  return (
    <line
      x1={von}
      y1={y}
      x2={bis}
      y2={y}
      stroke="currentColor"
      strokeWidth={STRICH.fein}
      strokeDasharray="14 5 3 5"
      vectorEffect="non-scaling-stroke"
      className="text-kh-line-strong"
    />
  )
}

/**
 * Eine Maßlinie mit zwei Pfeilspitzen.
 *
 * Die Spitzen sitzen **an** den Enden und zeigen nach außen, wie es die
 * Zeichnungsnorm vorsieht; die Linie darf darüber hinauslaufen, damit die
 * Maßzahl außerhalb des Bauteils Platz findet. Die Zahl selbst liefert der
 * Aufrufer, weil ihre Lage von Fall zu Fall entschieden werden muss.
 */
export function Mass({
  von,
  bis,
  ueberstand = 0,
  hervor = false,
}: {
  von: readonly [number, number]
  bis: readonly [number, number]
  /** Wie weit die Linie über die Pfeilspitzen hinausläuft, in mm. */
  ueberstand?: number
  hervor?: boolean
}) {
  const [x1, y1] = von
  const [x2, y2] = bis
  const laenge = Math.hypot(x2 - x1, y2 - y1) || 1
  const [ex, ey] = [(x2 - x1) / laenge, (y2 - y1) / laenge]
  const farbe = hervor ? 'text-kh-orange' : 'text-kh-line-strong'
  const winkel = (Math.atan2(ey, ex) * 180) / Math.PI

  return (
    <g className={farbe}>
      <line
        x1={x1 - ex * ueberstand}
        y1={y1 - ey * ueberstand}
        x2={x2 + ex * ueberstand}
        y2={y2 + ey * ueberstand}
        stroke="currentColor"
        strokeWidth={STRICH.fein}
        vectorEffect="non-scaling-stroke"
      />
      <Pfeilspitze x={x1} y={y1} winkel={winkel + 180} />
      <Pfeilspitze x={x2} y={y2} winkel={winkel} />
    </g>
  )
}

/** Die Spitze einer Maßlinie. Gefüllt, schlank, 15 Grad — wie in der Norm. */
export function Pfeilspitze({ x, y, winkel }: { x: number; y: number; winkel: number }) {
  return (
    <polygon
      points="0,0 -2.6,0.75 -2.6,-0.75"
      fill="currentColor"
      transform={`translate(${x} ${y}) rotate(${winkel})`}
    />
  )
}

/**
 * Eine Maßhilfslinie: die dünne Linie, die eine Kante bis zur Maßlinie
 * verlängert. Sie läuft ein Stück über die Maßlinie hinaus — das ist der
 * Unterschied zwischen einer Zeichnung und einem Diagramm.
 */
export function Hilfslinie({
  von,
  bis,
}: {
  von: readonly [number, number]
  bis: readonly [number, number]
}) {
  return (
    <line
      x1={von[0]}
      y1={von[1]}
      x2={bis[0]}
      y2={bis[1]}
      stroke="currentColor"
      strokeWidth={STRICH.fein}
      vectorEffect="non-scaling-stroke"
      className="text-kh-line"
    />
  )
}
