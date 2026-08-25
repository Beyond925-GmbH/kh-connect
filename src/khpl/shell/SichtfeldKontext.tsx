import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import type { ReactNode, RefObject } from 'react'
import type { Sichtfeld } from '@/drei/kamera'

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
  /** Panelkante plus Sicherheitsstreifen an den freien Kanten — für den Dachstuhl. */
  mitLuft: Sichtfeld
  /** Nur die gemessene Panelkante, ohne Sicherheitsstreifen — s. `luft`. */
  roh: Sichtfeld
}

const SichtfeldKontext = createContext<SichtfeldWerte | null>(null)

/**
 * Die Bühne fragt hier, wie viel Fläche ihr bleibt.
 *
 * `'mitLuft'` (Default) enthält den Sicherheitsstreifen (`luft`), der die zu
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
 * einen Sicherheitsstreifen — **aber nur auf einer Achse, auf der das Fenster
 * wirklich außermittig liegt**; sonst gilt `LUFT_MITTIG`.
 *
 * **Der Wert ist gemessen, nicht hergeleitet.** Die Einpassung rechnet gegen
 * `huelle` aus `berechneMasse`; auf dem Schirm ragen die gelattete Dachfläche
 * und — bei Kulisse — die Front des Gespanns sichtbar darüber hinaus. Bei 5 %
 * und bei 10 % wird das Modell seitlich angeschnitten (bei 10 % hochkant an
 * der linken Kante, gemessen an M8), ab 14 % steht es frei. Wer die Hülle in
 * `mass.ts` einmal an die tatsächlich gezeichnete Geometrie angleicht, kann
 * diesen Wert wieder senken — bis dahin ist er der Preis dafür, dass auf keinem
 * der vier 3D-Screens ein angeschnittenes Dach steht.
 */
const LUFT_VERSATZ = 0.14

/**
 * Dieselbe Achse, aber **beide** Kanten frei — dann genügt deutlich weniger.
 *
 * Der Versatzfehler oben entsteht daran, dass das Fenster *außermittig* liegt:
 * `passeEin` passt auf die Größe des Fensters ein und schiebt es danach an
 * seinen Platz, und dieses Schieben ist die ungenaue Hälfte. Steht auf einer
 * Achse gar kein Panel, wird auch nichts geschoben — die Mitte des Fensters
 * ist die Mitte des Bildes, und es bleibt nur der kleine Rest, den die zu
 * knapp gerechnete Hülle braucht. Deshalb derselbe Wert wie senkrecht.
 *
 * **Genau das ist der Fall, der hochkant weh tat.** Dort nimmt das Panel
 * *unten* Platz; links und rechts liegt nichts. Trotzdem zog die Vorfassung
 * links **und** rechts 14 % ab, zusammen 28 % der Breite — und hochkant ist
 * die Breite die bindende Kante, weil der Dachstuhl zweieinhalbmal so breit
 * wie hoch ist. Auf dem Handy blieb von 390 px ein Fenster von 281 px, und
 * das fertige Dach auf M8 stand mit 288 × 119 px in einem freien Feld von
 * 390 × 507 px. Die 28 % waren der Preis für eine Korrektur an einer Achse,
 * auf der es nichts zu korrigieren gab.
 *
 * **Auch dieser Wert ist gemessen.** Bei 1,5 % steht auf M5 und M8 hochkant
 * die halbe Fahrerkabine außerhalb des Bildes; bei 6 % ragt nur noch die
 * Stoßstange über die Kante — und genau das ist laut `Szene.tsx` gewollt
 * („die Transporter-Front darf am Bildrand anschneiden"). Das Dach selbst
 * steht auf allen sechs 3D-Screens in allen drei Formaten frei.
 */
const LUFT_MITTIG = 0.06

/**
 * Luft an den **waagerechten** Kanten — oben und unten.
 *
 * `LUFT_VERSATZ` gleicht aus, dass die gezeichnete Dachfläche breiter ist als
 * die gerechnete Hülle; das ist ein Problem der **Seiten**. Nach oben endet
 * das Modell am First, und der steht in `huelle.max[1]`; nach unten an der
 * Rohdecke, und die steht in `huelle.min[1]`. Oben dieselben 14 % abzuziehen
 * hat deshalb nichts abgefangen, sondern nur das freie Fenster verkürzt — und
 * seit das Panel quer wie hochkant **unten** Platz nimmt, ist die Höhe genau
 * die Kante, an der es knapp wird.
 */
const LUFT_WAAGERECHT = 0.06

/**
 * Der Sicherheitsstreifen für eine freie Kante.
 *
 * `gegenueber` ist der Anteil, den das Panel auf der **anderen** Kante
 * derselben Achse nimmt. Ist er null, liegt das Fenster auf dieser Achse
 * mittig und braucht den vollen Streifen nicht.
 */
function luft(gegenueber: number | undefined): number {
  return gegenueber ? LUFT_VERSATZ : LUFT_MITTIG
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
 * Misst die Inhaltskarte gegen ihre Fläche und stellt das Ergebnis der Bühne
 * bereit.
 *
 * Die Karte klebt unten links. Welche Kante sie dem Modell wegnimmt, hängt
 * davon ab, **wie hoch** sie ist:
 *
 * - Bleibt sie flach (weniger als 55 % der Höhe), nimmt sie **unten** weg. Das
 *   Modell bekommt den ganzen Streifen darüber, über die volle Breite.
 * - Ist sie hoch (M1 mit zehn Chips, M4 mit Soll, Maß und Winkeln), nimmt sie
 *   **links** weg; über ihr bliebe sonst nur ein Spalt.
 *
 * **Warum die Höhe entscheidet und nicht die Breite.** Die erste Fassung
 * teilte quer immer seitlich: die Karte links, das Modell rechts daneben, über
 * die volle Höhe. Das ist richtig für ein hohes Modell und falsch für dieses.
 * Der Dachstuhl ist gut zweieinhalbmal so breit wie hoch, mit Gespann noch
 * mehr; in einem hochkant stehenden Fenster bindet die Breite, die Höhe bleibt
 * ungenutzt. Auf dem iPad quer war das Ergebnis ein 390 px breites Modell mit
 * 330 px Schwarz darüber und 330 px darunter — auf M8, dem Screen, auf dem das
 * fertige Dach die ganze Aussage ist. Über der Karte, über die volle Breite,
 * passt dasselbe Modell doppelt so groß in denselben Screen.
 *
 * Der Streifen rechts *neben* der Karte wird dabei als verdeckt gerechnet,
 * obwohl er frei ist — ein Modell, das in einen L-förmigen Rest hineinragt,
 * sieht aus wie ein Fehler.
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
  /** Welche Teilung gerade gilt — Eingang fürs Totband unten. */
  const seitlichRef = useRef(false)

  const messen = useCallback(() => {
    const f = flaeche.current?.getBoundingClientRect()
    if (!f || f.width <= 0 || f.height <= 0) return
    const k = karte.current?.getBoundingClientRect()

    // Gemessen wird nur die Panelkante; der Sicherheitsstreifen kommt danach
    // auf die freien Kanten. Beide Fassungen wandern in den Kontext — welche Bühne welche
    // braucht, entscheidet ihre Hüllengenauigkeit (s. `useSichtfeld`).
    const roh: Sichtfeld = { oben: 0, unten: 0, links: 0, rechts: 0 }

    if (k) {
      const quer = f.width > f.height
      const karteBreit = k.width / f.width > 0.9
      const untenAnteil = grob((f.bottom - k.top) / f.height)
      /*
        Seitlich teilen nur, wenn die Karte quer **und** schmal **und hoch**
        ist — sonst bleibt über ihr genug Streifen für das ganze Modell.

        **Mit Totband.** Die Kamera wird gesetzt, nicht gefahren
        (`Kamerasteuerung`, `kamera.position.set`): jeder Wechsel der Teilung
        ist ein Sprung. Karten wachsen und schrumpfen aber im laufenden Step —
        M5 tauscht seine Bauteilkarte, M7 nimmt beim Ziehen Karten weg. Ohne
        Totband stünde die Schwelle mitten in diesem Bereich und die Kamera
        spränge bei jeder zweiten Textzeile. 0,45 / 0,58 sind rund 110 px auf
        dem iPad quer — so viel ändert sich nur, wenn ein Step wirklich von
        Zuschauen auf Mitmachen umschaltet, und dort ist der Wechsel gewollt.
      */
      const seitlich =
        quer &&
        !karteBreit &&
        (seitlichRef.current ? untenAnteil > 0.45 : untenAnteil > 0.58)
      seitlichRef.current = seitlich

      if (seitlich) {
        roh.links = grob((k.right - f.left) / f.width)
      } else {
        roh.unten = untenAnteil
      }
    }

    if (!gleich(roh, letztes.current)) {
      letztes.current = roh
      const mitLuft: Sichtfeld = k
        ? {
            links: roh.links || luft(roh.rechts),
            rechts: roh.rechts || luft(roh.links),
            oben: roh.oben || LUFT_WAAGERECHT,
            unten: roh.unten || LUFT_WAAGERECHT,
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
