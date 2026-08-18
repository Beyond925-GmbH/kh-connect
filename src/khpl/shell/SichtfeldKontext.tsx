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
 * Im Layout `buehne` liegt das 3D-Modell unter der ganzen Fläche, und darüber
 * liegen zwei deckende Kästen: die Textkarte oben (links, `max-w-[30rem]`) und
 * der Block mit Interaktion, Aha-Karte und Fuß unten (rechts, bis 62 %). Ohne
 * Angabe passt die Kamera den Dachstuhl mittig in die *ganze* Fläche ein — und
 * damit zur Hälfte unter die Karte.
 *
 * Gemessen statt geschätzt: die Kästen sind unterschiedlich hoch, je nachdem
 * wie lang der Fachtext ist und ob eine Aha-Karte offen steht. Ein von Hand
 * gesetzter Wert je Step wäre schon beim ersten Textlauf falsch — und quer
 * gegen hoch sowieso.
 */
const SichtfeldKontext = createContext<Sichtfeld | null>(null)

/** Die Bühne fragt hier, wie viel Fläche ihr bleibt. */
export function useSichtfeld(): Sichtfeld | undefined {
  return useContext(SichtfeldKontext) ?? undefined
}

/** Runden auf 1 %: sonst löst jeder Subpixel ein neues Einpassen aus. */
function grob(x: number): number {
  return Math.round(Math.max(0, Math.min(1, x)) * 100) / 100
}

function gleich(a: Sichtfeld, b: Sichtfeld): boolean {
  return (
    a.links === b.links &&
    a.rechts === b.rechts &&
    a.oben === b.oben &&
    a.unten === b.unten
  )
}

/**
 * Misst zwei Kästen gegen ihre gemeinsame Fläche und stellt das Ergebnis der
 * Bühne bereit.
 *
 * Die Kästen liegen an gegenüberliegenden Ecken, deshalb wird je Achse nur die
 * Kante verdeckt, an der ein Kasten klebt: der obere Kasten nimmt oben weg, der
 * untere unten. Waagerecht zählt nur, was durchgehend verdeckt ist — der obere
 * Kasten reicht nicht bis zum unteren Rand, also gibt es links immer noch einen
 * Streifen freie Fläche. Er wird trotzdem als verdeckt gerechnet: ein Modell,
 * das in einen L-förmigen Rest hineinragt, sieht aus wie ein Fehler.
 */
export function SichtfeldMesser({
  flaeche,
  oben,
  unten,
  children,
}: {
  flaeche: RefObject<HTMLElement | null>
  oben: RefObject<HTMLElement | null>
  unten: RefObject<HTMLElement | null>
  children: ReactNode
}) {
  const [sichtfeld, setSichtfeld] = useState<Sichtfeld>({})
  const letztes = useRef<Sichtfeld>({})

  const messen = useCallback(() => {
    const f = flaeche.current?.getBoundingClientRect()
    if (!f || f.width <= 0 || f.height <= 0) return
    const o = oben.current?.getBoundingClientRect()
    const u = unten.current?.getBoundingClientRect()

    const neu: Sichtfeld = {
      oben: o ? grob((o.bottom - f.top) / f.height) : 0,
      unten: u ? grob((f.bottom - u.top) / f.height) : 0,
      links: 0,
      rechts: 0,
    }

    // Quer stehen die Kästen nebeneinander versetzt: der obere links, der
    // untere rechts. Dann ist es besser, waagerecht Platz zu nehmen statt
    // senkrecht — sonst bleibt dem Modell nur ein flacher Streifen in der
    // Mitte. Hochkant füllen beide die Breite, dort bleibt es bei oben/unten.
    const quer = f.width > f.height
    if (quer && o && u) {
      const obenBreit = o.width / f.width > 0.9
      const untenBreit = u.width / f.width > 0.9
      if (!obenBreit && !untenBreit) {
        neu.links = grob((o.right - f.left) / f.width)
        neu.oben = 0
        neu.rechts = 0
        neu.unten = grob((f.bottom - u.top) / f.height)
      }
    }

    if (!gleich(neu, letztes.current)) {
      letztes.current = neu
      setSichtfeld(neu)
    }
  }, [flaeche, oben, unten])

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
    for (const r of [flaeche.current, oben.current, unten.current]) {
      if (r) beobachter.observe(r)
    }
    return () => beobachter.disconnect()
  }, [messen, flaeche, oben, unten])

  return (
    <SichtfeldKontext.Provider value={sichtfeld}>{children}</SichtfeldKontext.Provider>
  )
}
