import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import type { ReactNode, RefObject } from 'react'
import type { Sichtfeld } from '@/dachstuhl/kamera'

/**
 * Was die Bühne von ihrer Fläche wirklich sehen darf.
 *
 * Auf den 3D-Steps liegt das Modell unter der ganzen Fläche, und darüber liegt
 * die deckende Inhaltskarte — unten links, quer auf 40rem gedeckelt. Ohne
 * Angabe passt die Kamera den Dachstuhl mittig in die *ganze* Fläche ein und
 * damit zur Hälfte unter die Karte.
 *
 * Gemessen statt geschätzt: die Karte ist unterschiedlich hoch, je nachdem wie
 * lang der Fachtext ist und ob eine Aha-Karte offen steht. Ein von Hand
 * gesetzter Wert je Step wäre schon beim ersten Textlauf falsch — und quer
 * gegen hoch sowieso.
 */
interface SichtfeldWerte {
  /** Panelkante plus `LUFT` an den freien Kanten — für den Dachstuhl. */
  mitLuft: Sichtfeld
  /** Nur die gemessene Panelkante, ohne Sicherheitsstreifen — s. `LUFT`. */
  roh: Sichtfeld
}

const SichtfeldKontext = createContext<SichtfeldWerte | null>(null)

/**
 * Die Bühne fragt hier, wie viel Fläche ihr bleibt.
 *
 * `'mitLuft'` (Default) enthält den `LUFT`-Sicherheitsstreifen, der die zu
 * knappe Dachstuhl-Hülle ausgleicht. Bühnen mit **exakter** Hülle (Zuschnitt)
 * nehmen `'roh'`: für sie ist der Streifen reine Verschwendung — quer schrumpfte
 * das Schnittfenster damit auf gut die Hälfte und klebte links am Panel.
 */
export function useSichtfeld(
  variante: keyof SichtfeldWerte = 'mitLuft',
): Sichtfeld | undefined {
  return useContext(SichtfeldKontext)?.[variante]
}

/** Runden auf 1 %: sonst löst jeder Subpixel ein neues Einpassen aus. */
function grob(x: number): number {
  return Math.round(Math.max(0, Math.min(1, x)) * 100) / 100
}

/**
 * Luft an den Kanten, die keine Karte verdeckt.
 *
 * `passeEin` rechnet mit einem eigenen `RAND`, der aber nur die *Größe* des
 * Fensters betrifft; wohin es rückt, macht danach ein Versatz, und der landet
 * bei stark außermittigem Fenster ein paar Prozent neben dem Ziel. Gemessen
 * lag die rechte Modellkante dadurch bei 0,989 von 1,0 — rechnerisch im Bild,
 * optisch am Rand angeschnitten.
 *
 * Statt an der geprüften Kameramathematik zu drehen, bekommt das Fenster hier
 * einen Sicherheitsstreifen.
 *
 * **Der Wert ist gemessen, nicht hergeleitet.** Die Einpassung rechnet gegen
 * `huelle` aus `berechneMasse`; auf dem Schirm ragt das fertig gelattete Dach
 * sichtbar darüber hinaus. Mit 5 % und mit 10 % stand der Dachstuhl weiter an
 * der rechten Kante an, erst ab knapp 18 % steht er frei. Wer die Hülle in
 * `mass.ts` einmal an die tatsächlich gezeichnete Geometrie angleicht, kann
 * diesen Wert wieder senken — bis dahin ist er der Preis dafür, dass auf keinem
 * der vier 3D-Screens ein angeschnittenes Dach steht.
 */
const LUFT = 0.18

function gleich(a: Sichtfeld, b: Sichtfeld): boolean {
  return (
    a.links === b.links &&
    a.rechts === b.rechts &&
    a.oben === b.oben &&
    a.unten === b.unten
  )
}

/**
 * Misst die Inhaltskarte gegen ihre Fläche und stellt das Ergebnis der Bühne
 * bereit.
 *
 * Die Karte klebt unten links. Welche Kante sie dem Modell wegnimmt, hängt
 * davon ab, wie breit sie ist:
 *
 * - Füllt sie die Breite (hochkant, Handy), nimmt sie **unten** weg. Das Modell
 *   rückt in den freien Streifen darüber.
 * - Bleibt sie schmal (quer, auf 40rem gedeckelt), nimmt sie **links** weg und
 *   das Modell bekommt die volle Höhe der rechten Hälfte. Senkrecht Platz zu
 *   nehmen wäre hier falsch: dann bliebe dem Dachstuhl nur ein flacher Streifen
 *   über der Karte, obwohl rechts daneben die halbe Fläche frei steht.
 *
 * Der Streifen links *über* der Karte wird dabei als verdeckt gerechnet, obwohl
 * er frei ist — ein Modell, das in einen L-förmigen Rest hineinragt, sieht aus
 * wie ein Fehler.
 */
export function SichtfeldMesser({
  flaeche,
  karte,
  children,
}: {
  flaeche: RefObject<HTMLElement | null>
  karte: RefObject<HTMLElement | null>
  children: ReactNode
}) {
  const [sichtfeld, setSichtfeld] = useState<SichtfeldWerte>({
    mitLuft: {},
    roh: {},
  })
  const letztes = useRef<Sichtfeld>({})

  const messen = useCallback(() => {
    const f = flaeche.current?.getBoundingClientRect()
    if (!f || f.width <= 0 || f.height <= 0) return
    const k = karte.current?.getBoundingClientRect()

    // Gemessen wird nur die Panelkante; `LUFT` kommt danach auf die freien
    // Kanten. Beide Fassungen wandern in den Kontext — welche Bühne welche
    // braucht, entscheidet ihre Hüllengenauigkeit (s. `useSichtfeld`).
    const roh: Sichtfeld = { oben: 0, unten: 0, links: 0, rechts: 0 }

    if (k) {
      const quer = f.width > f.height
      const karteBreit = k.width / f.width > 0.9
      if (quer && !karteBreit) {
        roh.links = grob((k.right - f.left) / f.width)
      } else {
        roh.unten = grob((f.bottom - k.top) / f.height)
      }
    }

    if (!gleich(roh, letztes.current)) {
      letztes.current = roh
      const mitLuft: Sichtfeld = k
        ? {
            links: roh.links || LUFT,
            rechts: roh.rechts || LUFT,
            oben: roh.oben || LUFT,
            unten: roh.unten || LUFT,
          }
        : { ...roh }
      setSichtfeld({ mitLuft, roh })
    }
  }, [flaeche, karte])

  /**
   * Bewusst `useEffect` und nicht `useLayoutEffect`.
   *
   * Dieser Messer steht *innerhalb* von `<main>`, und React hängt die Refs
   * eines Elternteils erst ein, nachdem die Layout-Effekte seiner Kinder
   * gelaufen sind. Im Layout-Effekt wäre `flaeche.current` also noch `null`
   * und die Fläche unbekannt. Passive Effekte laufen nach dem gesamten
   * Commit — dann steht die Ref.
   *
   * Ein Bild ohne Messung ist unkritisch: die Leinwand mit `three` wird
   * ohnehin nachgeladen und ist zu diesem Zeitpunkt noch gar nicht da.
   */
  useEffect(() => {
    messen()
    const beobachter = new ResizeObserver(messen)
    for (const r of [flaeche.current, karte.current]) {
      if (r) beobachter.observe(r)
    }
    return () => beobachter.disconnect()
  }, [messen, flaeche, karte])

  return (
    <SichtfeldKontext.Provider value={sichtfeld}>{children}</SichtfeldKontext.Provider>
  )
}
