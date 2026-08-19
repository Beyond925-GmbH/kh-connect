import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'motion/react'
import { STEPS, type StepId } from '@/khpl/flow/steps'
import { DeinWeg } from './DeinWeg'
import { Rail } from './Rail'
import { SichtfeldMesser } from './SichtfeldKontext'
import { useStaffAusgang } from './staffAusgang'
import {
  beendeKarriereSkip,
  geheZurueck,
  springeZuBesuchtem,
  starteKarriereSkip,
  useFortschritt,
} from '@/khpl/store/fortschritt'

/**
 * S2 — das Arbeitspferd (khpl-ui-shell.md 2 + 5). Rendert jeden Step, Haupt wie
 * Abstecher, aus denselben Slots:
 *
 *   Bühne · Titel · Fachtext · Interaktion · Aha · Fuß
 *
 * **Was sich gegenüber der Vorfassung geändert hat, und warum.**
 *
 * Vorher: eine weiße, deckende Karte unten links, gedeckelt auf 46rem — auf
 * dem iPad quer rund 62 % der Breite. Darin stand alles: Titel, Text, Übung,
 * Knopf. Das Foto war ein Streifen rechts daneben. Fünfzehn Screens lang
 * dasselbe weiße Rechteck; der Ablauf las sich wie eine Präsentation mit
 * Bildhintergrund, nicht wie etwas, das man bedient.
 *
 * Jetzt sind es **zwei Ebenen statt einer Karte**:
 *
 *  1. **Der Titel steht auf dem Bild.** Anton, versal, so groß wie der Screen
 *     es hergibt, ohne Fläche darunter. Das ist der ganze Trick: sobald die
 *     Überschrift nicht mehr in einem Kasten sitzt, gehört das Foto wieder
 *     zum Screen statt hinter ihn.
 *  2. **Das Panel trägt nur noch, was man lesen oder anfassen muss.** Es ist
 *     dunkel und fast deckend statt weiß — auf einem Foto ist ein dunkles
 *     Panel unsichtbarer Untergrund, ein weißes ein aufgeklebtes Blatt.
 *
 * Die Leiste oben schwebt über der Bühne, statt ihr 68 px abzuschneiden. Sie
 * hat keinen eigenen Grund; der Verlauf der Bühne trägt sie.
 *
 * Was bleibt: die Primärhandlung sitzt auf **jedem** Screen in derselben
 * Ecke, unten rechts im Panel — bei offener Übung ist das die Lösung, sonst
 * Weiter (siehe `Verzweigung`). Und im Panel scrollt nur der Inhalt, nie der
 * Fuß.
 *
 * **Wisch-Navigation gibt es nicht mehr.** Sie kollidierte mit jeder
 * Zieh-Übung und dem 3D-Modell, musste deshalb auf der Hälfte der Screens
 * abgeschaltet werden — und eine Geste, die mal geht und mal nicht, ist
 * schlimmer als keine. Vor und zurück gehen ausschließlich über Knöpfe.
 */

/**
 * Der Karriere-Link taucht auf S1 und danach auf jedem zweiten Hauptschritt auf
 * (khpl-ui-shell.md 6). Nie auf Abstecher-Screens, nie während eine Interaktion
 * offen ist. So begegnet er jedem Besucher mehrfach, ohne je zu drängen.
 *
 * **M8 fehlt hier bewusst**, obwohl ui-shell 6 ihn aufzählt: M9 *ist* der
 * nächste Schritt nach M8. Ein Abstecher, der einen Schritt vor sein Ziel
 * abkürzt, schickt den Besucher über M9 → M10 → zurück auf M8 → weiter zu M9
 * — derselbe Bereich zweimal, mit einer Rückkehr-Leiste dazwischen.
 */
const SKIP_AUF: readonly StepId[] = ['M2', 'M4', 'M6']

export function StepShell({
  id,
  buehne,
  fachtext,
  interaktion,
  aha,
  fuss,
  buehneInteraktiv = false,
  karteBreit = false,
  interaktionOffen,
  titelZusatz,
}: {
  id: StepId
  buehne?: React.ReactNode
  fachtext?: React.ReactNode
  interaktion?: React.ReactNode
  aha?: React.ReactNode
  fuss?: React.ReactNode
  /**
   * Die Bühne **ist** die Interaktion — 3D-Modell in B3.2, M5, M7, M8. Dann
   * bleibt das Panel schmal, und der Sichtfeld-Messer sagt der Kamera, wie viel
   * Fläche ihr wirklich bleibt.
   */
  buehneInteraktiv?: boolean
  /** Für die dichten Übungs-Steps: das Panel darf quer breiter werden. */
  karteBreit?: boolean
  /**
   * Solange `true`: kein Karriere-Link. Ohne Angabe gilt jeder Step mit
   * Interaktion als offen — der sichere Zustand muss der Standard sein.
   */
  interaktionOffen?: boolean
  /** Das Etikett über dem Titel, z. B. „Abstecher“. */
  titelZusatz?: string
}) {
  const fortschritt = useFortschritt()
  const staffTap = useStaffAusgang()
  const [wegOffen, setWegOffen] = useState(false)
  const flaeche = useRef<HTMLElement>(null)
  // Das Panel. Der Messer rechnet daraus aus, wie viel Fläche dem 3D-Modell
  // bleibt.
  const panel = useRef<HTMLDivElement>(null)

  /**
   * Liegt unterhalb der Scrollkante noch Inhalt? Nur dann bekommt das Panel
   * seinen Auslauf-Verlauf. Gemessen bei jedem Scroll und bei jeder
   * Größenänderung von Fläche oder Inhalt — eine Übung, die sich auflöst,
   * ändert die Höhe, ohne dass gescrollt wird.
   */
  const scrollFlaeche = useRef<HTMLDivElement>(null)
  const [ueberlauf, setUeberlauf] = useState(false)
  const messeUeberlauf = useCallback(() => {
    const el = scrollFlaeche.current
    if (!el) return
    setUeberlauf(el.scrollHeight - el.scrollTop - el.clientHeight > 6)
  }, [])
  useEffect(() => {
    messeUeberlauf()
    const el = scrollFlaeche.current
    if (!el) return
    const beobachter = new ResizeObserver(messeUeberlauf)
    beobachter.observe(el)
    for (const kind of el.children) beobachter.observe(kind)
    // Kinder, die später dazukommen (Auswertung, Aha-Karte), ändern die Höhe
    // ebenfalls — der MutationObserver hängt sie an den ResizeObserver an.
    const mutation = new MutationObserver(() => {
      messeUeberlauf()
      for (const kind of el.children) beobachter.observe(kind)
    })
    mutation.observe(el, { childList: true, subtree: true })
    return () => {
      beobachter.disconnect()
      mutation.disconnect()
    }
  }, [messeUeberlauf])

  const def = STEPS[id]
  const imSkip = fortschritt.detourReturnTo !== null
  const kannZurueck = fortschritt.visited.length > 1
  const offen = interaktionOffen ?? interaktion != null
  const skipSichtbar = !imSkip && !offen && SKIP_AUF.includes(id)

  const zurueck = useCallback(() => {
    // Im Skip führt jeder Rückweg aus dem Abstecher heraus, nicht durch die
    // Historie: „ein Tap rein, ein Tap raus, exakt an dieselbe Stelle“
    // (ui-shell 6).
    if (imSkip) beendeKarriereSkip()
    else if (kannZurueck) geheZurueck()
  }, [imSkip, kannZurueck])

  /**
   * Breite der Textspalte.
   *
   * Quer bleibt links immer ein breiter Streifen Bühne stehen — auch bei
   * `karteBreit`. Hochkant nimmt die Spalte die volle Breite: eine schmalere
   * Spalte erzeugt dort nur Rand.
   */
  const spaltenbreite = buehneInteraktiv
    ? 'landscape:max-w-[38rem]'
    : karteBreit
      ? 'landscape:max-w-[52rem]'
      : 'landscape:max-w-[44rem]'

  const ueberlagerung = (
    // `pt-[72px]` hält die Leiste frei. Ohne das schiebt ein inhaltsschwerer
    // Step (M1 trägt zehn Checklistenpunkte) sein Panel so hoch, dass der
    // Titel unter Rail und Zurück-Button verschwindet — und der Screen fängt
    // mit einer halb verdeckten Überschrift an.
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-end gap-3 p-4 pt-[72px] sm:p-6 sm:pt-[72px] landscape:gap-4 landscape:p-7 landscape:pt-[72px]">
      {/*
        Der Titel steht auf dem Bild, nicht im Panel.

        Das ist die eine Änderung, an der der ganze Umbau hängt. Solange die
        Überschrift in derselben weißen Fläche saß wie Text und Knopf, war
        jeder Screen ein Dokument auf einem Hintergrundbild. Draußen auf dem
        Foto ist sie ein Plakattitel — und das Foto ist wieder der Screen.
      */}
      <motion.header
        key={id}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className={`flex w-full shrink-0 flex-col gap-1.5 ${spaltenbreite}`}
      >
        {titelZusatz && (
          <span className="kh-etikett flex items-center gap-2">
            <span aria-hidden className="h-[3px] w-7 rounded-full bg-kh-orange" />
            {titelZusatz}
          </span>
        )}
        <h1 className="kh-titel drop-shadow-[0_2px_18px_rgba(0,0,0,0.65)]">
          {def.titel}
        </h1>
      </motion.header>

      {/*
        Das Panel kommt einen Takt nach dem Titel. Ein Screen, der alles auf
        einmal hinstellt, liest sich als Wand — erst der Ort, dann der Inhalt
        ist die kleinste Staffelung, die diesen Eindruck bricht, ohne dass
        jemand auf die Bedienelemente warten muss.
      */}
      <motion.div
        key={`panel-${id}`}
        ref={panel}
        data-testid="karte"
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        // `min-h-0` ist die Bedingung dafür, dass das Scrollen unten
        // überhaupt greift: ein Flex-Kind hat von Haus aus `min-height: auto`
        // und wächst über den Container hinaus, statt zu scrollen.
        className={`kh-panel pointer-events-auto flex max-h-[84%] min-h-0 w-full flex-col p-4 sm:p-5 landscape:p-6 ${spaltenbreite}`}
      >
        {/*
          Nur der Inhalt scrollt, der Fuß nicht.

          M1 trägt zehn Checklistenpunkte; auf einem Handy hochkant ist das
          mehr, als auf den Screen passt. Scrollte das ganze Panel, läge der
          Weiter-Knopf unter der Kante — die einzige Handlung, die auf jedem
          Screen an derselben Stelle liegen soll, wäre ausgerechnet die
          unsichtbare.
        */}
        <div className="relative flex min-h-0 flex-1 flex-col">
          <div
            ref={scrollFlaeche}
            data-scroll
            onScroll={messeUeberlauf}
            className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain pr-0.5"
          >
            {fachtext && <div className="kh-fachtext">{fachtext}</div>}
            {interaktion}
            {aha}
          </div>
          {/*
            Auslauf nach unten — aber nur, wenn tatsächlich etwas darunter
            liegt. Die erste Fassung blendete den Verlauf immer ein und
            begründete das damit, dass er auf leerem Grund unsichtbar sei.
            Stimmt nur, solange darunter *nichts* steht: endet der Inhalt
            genau an der Kante (kein Überlauf, oder zu Ende gescrollt), fraß
            der Verlauf die letzte Zeile an, obwohl gar nichts zu scrollen
            war. Jetzt wird gemessen: Verlauf nur bei echtem Rest nach unten.
          */}
          {ueberlauf && (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#0E0D0B] to-transparent"
            />
          )}
        </div>
        {fuss && (
          <div className="mt-2.5 shrink-0 border-t border-kh-line pt-2.5 landscape:mt-3 landscape:pt-3">
            {fuss}
          </div>
        )}
      </motion.div>
    </div>
  )

  const buehnenFlaeche = (
    <div className="absolute inset-0 overflow-hidden bg-kh-ink">
      {buehne}
      {/* Der Verlauf liegt hier und nicht in `Foto`: er gehört zur Bühne als
          Ebene, egal ob darunter ein Bild, ein 3D-Modell oder nichts liegt.
          Der Titel braucht ihn in jedem Fall. */}
      <div aria-hidden className="kh-scrim pointer-events-none absolute inset-0" />
    </div>
  )

  return (
    <>
      <div
        className="kh-screen flex flex-col overflow-hidden bg-kh-ink"
        data-step={id}
        data-testid="step"
      >
        {/* Reihenfolge im DOM: Inhalt vor Navigation (flow 8.5). Die Leiste
            liegt per `absolute` optisch oben, Screenreader und Tastatur
            beginnen aber nicht mit „zurück“. */}
        <main ref={flaeche} className="relative min-h-0 flex-1">
          {buehneInteraktiv ? (
            <SichtfeldMesser flaeche={flaeche} karte={panel}>
              {buehnenFlaeche}
              {ueberlagerung}
            </SichtfeldMesser>
          ) : (
            <>
              {buehnenFlaeche}
              {ueberlagerung}
            </>
          )}

          {imSkip ? (
            <RueckkehrLeiste ziel={fortschritt.detourReturnTo as StepId} />
          ) : (
            // 60-px-Ziele mit 12 px Abstand (flow 8.5 — „entschieden: 60×60 pt,
            // nicht 44×44“). Das kostet Fläche und ist es wert: hier tippt
            // jemand im Stehen, mit ausgestrecktem Arm, auf ein festge-
            // schraubtes iPad.
            <header className="kh-leiste absolute inset-x-0 top-0 z-20 flex shrink-0 items-center gap-2 px-2 sm:gap-3 sm:px-3">
              <button
                type="button"
                onClick={zurueck}
                data-testid="zurueck"
                aria-label="Einen Schritt zurück"
                className={`grid size-[60px] shrink-0 place-items-center rounded-kh-pill bg-black/35 text-kh-paper backdrop-blur-md transition-transform active:scale-90 ${
                  kannZurueck ? '' : 'invisible'
                }`}
              >
                <ArrowLeft className="size-6" strokeWidth={2.25} />
              </button>

              <Rail fortschritt={fortschritt} onOeffnen={() => setWegOffen(true)} />

              {/* Die Dehnfuge zwischen Rail und Skip-Slot ist auf jedem Step
                  leer und trägt deshalb die Staff-Geste (fünf schnelle Taps).
                  Vorher lag dafür eine unsichtbare Fläche über dem
                  Zurück-Button — die fraß dessen linke Hälfte und öffnete
                  Besuchern das Personalmenü. */}
              <span
                className="min-w-0 flex-1 self-stretch"
                onClick={staffTap}
                data-testid="staff-flaeche"
                aria-hidden
              />

              {skipSichtbar && (
                <button
                  type="button"
                  onClick={starteKarriereSkip}
                  data-testid="karriere-skip"
                  className="flex h-[52px] shrink-0 items-center gap-1 rounded-kh-pill bg-black/35 px-4 text-[1rem] font-medium text-kh-paper/75 backdrop-blur-md transition-transform active:scale-95"
                >
                  Karriere-Wege
                  <ChevronRight className="size-5" strokeWidth={2} />
                </button>
              )}
            </header>
          )}
        </main>

        <DeinWeg
          offen={wegOffen}
          fortschritt={fortschritt}
          onSchliessen={() => setWegOffen(false)}
          onSpringe={springeZuBesuchtem}
        />
      </div>
    </>
  )
}

/**
 * Die persistente Leiste des Karriere-Skips (khpl-ui-shell.md 6). Ein Tap rein,
 * ein Tap raus, exakt an dieselbe Stelle — damit ist der neugierige Tap
 * folgenlos. Sie ersetzt die normale Leiste: Rail und Fortschritt gehören zum
 * Tag, nicht zum Abstecher.
 */
function RueckkehrLeiste({ ziel }: { ziel: StepId }) {
  return (
    <header className="kh-leiste absolute inset-x-0 top-0 z-20 flex items-center px-2 sm:px-3">
      <button
        type="button"
        onClick={beendeKarriereSkip}
        data-testid="zurueck-zum-tag"
        className="flex h-[52px] min-w-0 items-center gap-1 rounded-kh-pill bg-black/45 pr-5 pl-3 text-left text-[1rem] font-medium text-kh-paper backdrop-blur-md transition-transform active:scale-95"
      >
        <ChevronLeft className="size-5 shrink-0" strokeWidth={2.25} />
        <span className="truncate">
          Zurück zu deinem Tag
          <span className="text-kh-paper/50"> — {STEPS[ziel].titel}</span>
        </span>
      </button>
    </header>
  )
}
