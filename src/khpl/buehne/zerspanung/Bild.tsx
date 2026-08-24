import type { ReactNode } from 'react'
import { STRICH } from './stil'

/**
 * Der Rahmen, in dem jede Ansicht dieses Tages steht.
 *
 * **Warum alle sechs Zustände denselben Rahmen benutzen.** „Der Zoom ist die
 * Klammer" (khpl-tag-zerspanung.md §7): die Kamera geht den ganzen Tag in eine
 * Richtung, Zeichnung → Maschine → Messschraube. Das liest sich nur dann als
 * *eine* Kamera, wenn die Bilder auch gleich sitzen. Läge die Bildmitte je
 * Screen woanders, wäre jeder Wechsel ein Schnitt statt einer Fahrt.
 *
 * **Der freie Platz ist nicht der ganze Screen.** `StepShell` legt Leiste und
 * Panel über die Bühne — hochkant unten, quer links. Ein Bild, das seine Mitte
 * in die Screenmitte legt, liegt damit zur Hälfte unter dem Panel. Die
 * Innenabstände hier halten die Fläche frei, die tatsächlich sichtbar bleibt;
 * quer sind das die rechten drei Fünftel, und für Z3 fällt das mit der Spec
 * zusammen: **Code links, Werkzeugweg rechts.**
 *
 * ⚠️ Die Fläche ist **gerechnet, nicht gemessen.** Der `SichtfeldMesser` der
 * Shell misst sie wirklich, hängt aber an `buehneInteraktiv`, und das
 * entscheidet der Step, nicht die Bühne. Die Prozentwerte hier sind die
 * gleiche Aussage ohne Kopplung — verschiebt sich das Panel-Layout in der
 * Hülle, gehören sie nachgezogen.
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

  return (
    // `data-wisch="aus"` ist die Hausmarke für Flächen, auf denen gezogen
    // werden darf — hier vorsorglich, weil Z3 die Bühne antippbar machen kann.
    <div
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

      <div className="absolute inset-0 px-5 pt-[74px] pb-[38%] sm:px-8 landscape:pt-[82px] landscape:pr-8 landscape:pb-6 landscape:pl-[38%]">
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
