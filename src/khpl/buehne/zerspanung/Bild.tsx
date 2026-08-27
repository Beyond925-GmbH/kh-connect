import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode, RefObject } from 'react'
import { BEMASSUNG, HILFE, STRICH } from './stil'

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
 * Rest gestellt, der wirklich frei bleibt; quer ist das je nach Panel der
 * Streifen rechts daneben **oder** der darüber — genommen wird der größere.
 * Für Z3 (hohes, schmales Panel) fällt das mit der Spec zusammen: **Code
 * links, Werkzeugweg rechts.**
 *
 * **Zwei Ausschnitte, nicht einer** (`viewBoxHoch`). Die Fläche ist quer breit
 * und hochkant hoch, und ein einziger querformatiger `viewBox` bekommt in einem
 * stehenden Feld mit `meet` beides gleichzeitig: eine kleine Zeichnung und über
 * ihr wie unter ihr ein leeres Drittel. Das ist keine Einstellungssache — eine
 * liegende Drehmaschine füllt kein stehendes Feld, solange sie liegt. Was sie
 * füllen kann, ist ein **anderer Ausschnitt**: enger an der Sache, mit der
 * Bemaßung nach oben und unten verteilt statt nach links und rechts. Jede
 * Ansicht bringt den deshalb selbst mit; die Bühne misst nur, welcher gilt.
 *
 * **Und geklammert wird hart.** Ein `viewBox` mit `meet` ist kein Rahmen: was
 * außerhalb liegt, wird in den Letterbox-Streifen weitergezeichnet, bis die
 * Kante des SVG-Elements kommt. Genau daher kam der abgeschnittene Riesen-
 * buchstabe am linken Rand von Z1 (die Bemaßung, vierfach vergrößert) und der
 * Rückzug in Z3, der `X100. Z50.` anfährt und dabei quer aus dem Bild lief. Ein
 * `clipPath` auf dem `viewBox` macht aus dem Ausschnitt wieder das, was auf
 * einem Zeichnungsblatt der Rahmen ist: die Grenze.
 *
 * ⚠️ **Was bleibt, und warum es bleiben darf.** Gemessen an einem stehenden
 * Bühnenfeld von rund 1040 × 1385 px steht jetzt oben und unten:
 *
 * | Ansicht | vorher | jetzt |
 * | --- | --- | --- |
 * | Z1 Zeichnung | 288 px | 105 px |
 * | Z2 Maschine | 306 px | 205 px |
 * | Z3 Werkzeugweg | 306 px | 234 px |
 * | Z5 Messschraube | 370 px | 261 px |
 *
 * Und die Zeichnungen sind dabei **größer** geworden, nicht kleiner. Null wird
 * es nicht: Eine Drehmaschine und eine Mikrometerschraube sind quer gebaute
 * Gegenstände, und der einzige Weg auf null wäre, sie seitlich anzuschneiden —
 * dann fehlte auf Z5 die Trommel, also die Anzeige, um die der Screen geht.
 * Ein Fünftel Rand oben und unten ist der Rand eines Blattes; die Hälfte war
 * ein Loch.
 */

/** Bühneninhalt, der wissen darf, ob er im stehenden Feld steht. */
type Inhalt = ReactNode | ((hoch: boolean) => ReactNode)

const zeige = (inhalt: Inhalt, hoch: boolean): ReactNode =>
  typeof inhalt === 'function' ? inhalt(hoch) : inhalt

export function Bild({
  viewBox,
  viewBoxHoch,
  massstab = 1,
  mitte,
  hell = false,
  ueber,
  children,
}: {
  /** `min-x min-y breite hoehe`, in Millimetern der jeweiligen Ansicht. */
  viewBox: string
  /**
   * Derselbe Gegenstand, fürs stehende Feld anders gefasst. Ohne Angabe gilt
   * `viewBox` in beiden Lagen — richtig für alles, was ohnehin hoch ist.
   */
  viewBoxHoch?: string
  /** Zoomfaktor auf `mitte`. 1 heißt: die Ansicht steht, wie sie gedacht ist. */
  massstab?: number
  /** Der Punkt, auf den gezoomt wird. Ohne Angabe die Mitte der Ansicht. */
  mitte?: readonly [number, number]
  /** Der Messraum ist der einzige helle Screen des Tages (§6 Z4). */
  hell?: boolean
  /** Liegt **über** dem Zoom und fährt nicht mit — Detailansichten, Hinweise. */
  ueber?: Inhalt
  children: Inhalt
}) {
  const rahmen = useRef<HTMLDivElement>(null)
  const frei = useFreieFlaeche(rahmen)

  const sicht = frei.hoch ? (viewBoxHoch ?? viewBox) : viewBox
  const [minX, minY, breite, hoehe] = sicht.split(/\s+/).map(Number)
  const [cx, cy] = [minX + breite / 2, minY + hoehe / 2]
  const [mx, my] = mitte ?? [cx, cy]

  // `useId` liefert Doppelpunkte; in einer `url(#…)`-Referenz haben sie nichts
  // zu suchen. Ein Rahmen je Bühne, weil zwei Bühnen nebeneinander sonst
  // denselben Ausschnitt benutzten.
  const rahmenId = `zerspanung-rahmen-${useId().replace(/:/g, '')}`

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
          viewBox={sicht}
          preserveAspectRatio="xMidYMid meet"
          className="size-full"
          aria-hidden
        >
          <defs>
            <clipPath id={rahmenId}>
              <rect x={minX} y={minY} width={breite} height={hoehe} />
            </clipPath>
          </defs>

          {/* Der Rahmen liegt auf einer eigenen Gruppe **ohne** Transformation:
              geklammert wird der Ausschnitt, nicht das, was gerade in ihn
              hineinfährt. Läge er auf der zoomenden Gruppe, zoomte er mit. */}
          <g clipPath={`url(#${rahmenId})`}>
            <g
              style={{
                // `view-box` legt den Ursprung für `transform-origin` auf die
                // linke obere Ecke der Ansicht — deshalb der Versatz um min-x
                // und min-y. Ohne das zoomt jede Ansicht auf einen anderen Punkt.
                transformBox: 'view-box',
                transformOrigin: `${mx - minX}px ${my - minY}px`,
                // Bei Maßstab 1 keine Verschiebung: `translate` rückt `mitte`
                // in die Bildmitte, und das ist die halbe Zoomformel — im
                // Ruhestand schob sie die ganze Zeichnung um den Abstand
                // zwischen Ansichtsmitte und Zoomziel (Z1: 7,5 mm nach unten),
                // und die Längenbemaßung lag hinter der unteren Rahmenkante.
                // Die Fahrt bleibt eine Fahrt: `transition` interpoliert von
                // der Identität genauso weich wie von einem Versatz.
                transform:
                  massstab === 1
                    ? undefined
                    : `translate(${cx - mx}px, ${cy - my}px) scale(${massstab})`,
                // Raster, keine Springs (§7). `prefers-reduced-motion` schaltet
                // die Dauer global in `index.css` auf null.
                transition: 'transform 0.7s cubic-bezier(0.2, 0, 0, 1)',
              }}
            >
              {zeige(children, frei.hoch)}
            </g>
            {zeige(ueber, frei.hoch)}
          </g>
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
  /**
   * Ist das, was übrig bleibt, höher als breit? **Nicht dasselbe wie ein
   * hochkanter Screen**: quer mit breitem Panel bleibt der Bühne ein Streifen,
   * der ebenfalls steht, und hochkant mit sehr hohem Panel einer, der liegt.
   * Entschieden wird nach der Fläche, die die Zeichnung wirklich bekommt.
   */
  hoch: boolean
}

/** Luft zwischen Zeichnung und Screenkante, in px. */
const LUFT = 20
/** Die Leiste oben (60-px-Ziel plus Rand) — sie steht auf jedem Step. */
const LEISTE = 74
/**
 * Weniger als das darf der Bühne nicht bleiben — hochkant in der Höhe, quer in
 * der Breite. **Notbremsen, keine Sollwerte.**
 *
 * Die erste Fassung deckelte bei 0,42 / 0,34 und zeichnete jenseits davon
 * bewusst unter das Panel. Das Panel ist aber deckend: Was dahinter liegt, ist
 * nicht „mit Titel überlagert“, sondern weg — auf Z6 quer verschwand so die
 * Fahne „Nr. 1“, auf Z3 quer das halbe Futter. Deshalb gilt jetzt: Die Bühne
 * bekommt den Rest, der wirklich frei ist, auch wenn er klein wird; ein Step,
 * dessen Panel der Zeichnung zu viel nimmt, kürzt seine Interaktion und gibt dem
 * Besucher den Klappgriff, statt hinter sich selbst zu zeichnen.
 *
 * Die Bremsen bleiben nur für den Fall, dass ein sehr kleines Fenster mit
 * einem sehr großen Panel zusammentrifft — dann ist ein angeschnittenes Bild
 * das kleinere Übel als gar keins. Auf den drei Messe-Viewports greifen sie
 * bei keinem Step dieses Tages mehr.
 */
const MINDEST_HOCH = 0.2
const MINDEST_BREIT = 0.3

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
 * **Warum nicht `useSichtfeld`.** Den Messer der Hülle gibt es inzwischen auf
 * jedem Step, und `'roh'` wäre die passende Fassung. Zwei Dinge kann er für
 * diese Bühne trotzdem nicht: Er misst nur das Panel, nicht den **Titel** —
 * der steht hochkant unmittelbar über dem Panel in derselben Spalte, und eine
 * Kontur, die erst an der Panelkante endet, endet mitten in der Überschrift.
 * Und er misst Rechtecke aus dem Renderbaum, während hier unten mit
 * `offsetTop` gerechnet wird (s. nächster Absatz). Also misst diese Bühne
 * ihre eigene Fläche — dieselbe Rechnung, eine Kante genauer.
 *
 * **Gerechnet wird mit `offsetTop`, nicht mit `getBoundingClientRect`.** Titel
 * und Panel fahren beim Betreten des Steps mit `translateY` ein; ein Rechteck
 * aus dem Renderbaum trüge diesen Versatz mit und die Bühne stellte sich auf
 * einen Stand ein, den es eine halbe Sekunde später nicht mehr gibt. Die
 * Layout-Position kennt keine Transformationen.
 */
function useFreieFlaeche(rahmen: RefObject<HTMLDivElement | null>): Rand {
  const [rand, setRand] = useState<Rand>(() => ({
    oben: LEISTE,
    rechts: LUFT,
    unten: LUFT,
    links: LUFT,
    // Der erste Anstrich steht, bevor gemessen werden konnte. Die Lage des
    // Fensters ist der beste Rateschritt und liegt in der Praxis richtig; der
    // Layout-Effekt korrigiert ihn noch vor dem Bild.
    hoch: window.innerHeight >= window.innerWidth,
  }))
  const letzter = useRef(rand)

  const messen = useCallback(() => {
    const flaeche = rahmen.current?.closest('main')
    if (!flaeche) return
    const b = flaeche.clientWidth
    const h = flaeche.clientHeight
    if (b <= 0 || h <= 0) return

    const neu: Rand = {
      oben: LEISTE,
      rechts: LUFT,
      unten: LUFT,
      links: LUFT,
      hoch: true,
    }
    const panel = flaeche.querySelector<HTMLElement>('[data-testid="karte"]')

    if (panel) {
      // Der Titel steht unmittelbar über dem Panel — dieselbe Spalte, dieselbe
      // Überlagerung. Er gehört zur belegten Fläche, sonst endet die Kontur
      // mitten in der Überschrift.
      const titel = panel.previousElementSibling as HTMLElement | null
      const oben = Math.min(panel.offsetTop, titel?.offsetTop ?? panel.offsetTop)

      if (b > h) {
        // Quer nimmt das Panel die linke Spalte, und der Bühne stand bisher
        // immer nur der Streifen **rechts daneben** zu. Bei einem breiten
        // oder halbhohen Panel ist aber der Streifen **über** Titel und Panel
        // die größere Fläche — auf Z1 (aufgelöst, `karteBreit`) blieb die
        // ganze obere Hälfte leer, während die Einzelheit in einen schmalen
        // Reststreifen gequetscht war. Deshalb wird beides gerechnet und die
        // größere Fläche genommen; die Prüffrage von R1 („Was steht in der
        // oberen Hälfte?“) hat damit auf jedem Takt eine Antwort. Bei Gleich-
        // stand gewinnt rechts — der Ausschnitt, für den die Blattlagen der
        // Ansichten gebaut sind (Z3: Code links, Werkzeugweg rechts).
        const rechts =
          (b - (panel.offsetLeft + panel.offsetWidth + LUFT) - LUFT) * (h - LEISTE - LUFT)
        const drueber = (b - 2 * LUFT) * (oben - LEISTE - LUFT)
        if (rechts >= drueber) {
          neu.links = grob(panel.offsetLeft + panel.offsetWidth + LUFT, b)
        } else {
          neu.unten = grob(h - oben + LUFT, h)
        }
      } else {
        neu.unten = grob(h - oben + LUFT, h)
      }
    }

    neu.links = Math.min(neu.links, b * (1 - MINDEST_BREIT))
    neu.unten = Math.min(neu.unten, h - LEISTE - h * MINDEST_HOCH)
    neu.hoch = h - neu.oben - neu.unten > b - neu.links - neu.rechts

    const alt = letzter.current
    if (
      alt.oben === neu.oben &&
      alt.rechts === neu.rechts &&
      alt.unten === neu.unten &&
      alt.links === neu.links &&
      alt.hoch === neu.hoch
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
      className={BEMASSUNG}
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
  const farbe = hervor ? 'text-kh-orange' : BEMASSUNG
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
      className={HILFE}
    />
  )
}
