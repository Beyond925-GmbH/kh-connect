import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'motion/react'
import { step, type StepId } from '@/khpl/flow/steps'
import { beruf as berufDef } from '@/khpl/berufe/registry'
import { Ansage } from '@/khpl/komponenten/Ansage'
import { auftritt } from '@/khpl/komponenten/auftritt'
import { Auftragsband } from '@/khpl/komponenten/Auftragsband'
import { WarumBereich } from '@/khpl/komponenten/Warum'
import type { Geste } from '@/khpl/komponenten/gesten'
import { DeinWeg } from './DeinWeg'
import { Rail } from './Rail'
import { SichtfeldMesser } from './SichtfeldKontext'
import { useStaffAusgang } from './staffAusgang'
import {
  beendeKarriereSkip,
  betreteBeruf,
  geheZurueck,
  setzeZurueck,
  springeZuBesuchtem,
  starteKarriereSkip,
  useAktiverBeruf,
  useBesuchteBerufe,
  useFortschritt,
  useGraph,
  zeigeBerufe,
} from '@/khpl/store/fortschritt'
import { kannVerlaufZurueck, verlaufZurueck } from '@/khpl/store/verlauf'

/**
 * Der Step-Screen — das Arbeitspferd. Rendert jeden Step, Haupt wie Abstecher,
 * aus denselben Slots:
 *
 *   Bühne · Titel · Warum · **Auftrag** · Interaktion · Fuß
 *
 * ---
 *
 * **Was sich mit der Vereinfachung geändert hat, und warum**
 *
 * Der Screen trug bis zu dreizehn Elemente gleichzeitig: Zurück, Rail,
 * Staff-Fläche, Karriere-Link, Titel, Bühne (oft selbst die Interaktion),
 * Klappgriff, Fachtext mit Chip-Popovern, Interaktion, Rückmeldung, einen
 * zeitgesteuerten Einwurf oben rechts, Überspringen und die Primärhandlung.
 * Dazu die Abstecher-Wahl beim Weitergehen. Das ist zu viel für jemanden, der
 * im Stehen an einem Messestand davor steht.
 *
 * Drei Änderungen, in dieser Reihenfolge wichtig:
 *
 *  1. **Es gibt jetzt einen Platz für die Aufgabe** (`Auftragsband`). Vorher
 *     stand die Anweisung auf jedem Screen woanders — im letzten Halbsatz des
 *     Fachtexts, in einer Komponente, die genau einmal existierte, auf der
 *     Bühne, oder gar nicht. `auftrag` ist deshalb eine **erforderliche**
 *     Angabe: `null` ist eine Entscheidung („dieser Screen wird gelesen“),
 *     Weglassen ist keine mehr.
 *  2. **Der Fachtext ist nicht mehr der Standardinhalt des Panels.** Auf
 *     Übungs-Steps trägt der Auftrag den Screen; auf Lese-Steps steht der
 *     Fachtext offen da (`WarumBereich`). So ist das Panel im Ruhezustand rund
 *     drei Zeilen hoch statt 62–84 % des Screens, und die Bühne bekommt den
 *     Rest — ohne dass jemand einen Griff finden muss.
 *  3. **Der Einwurf steht als eigene Klappzeile unter dem Fachtext.** Er meldet
 *     sich nicht mehr auf einer Uhr in einer eigenen Bildschirmecke, während
 *     gearbeitet wird — jede Aha-Karte ist eine eigenständige, gleich
 *     aussehende Zeile, die auf Tipp aufgeht (`Warum.tsx`).
 *
 * **Was ersatzlos entfallen ist:** der Klappgriff samt `buehnePlatz`,
 * `einklappbar` und den Höhendeckeln 62 % / 84 %, sowie `EinwurfBuehne` mit
 * ihrem Takt (4 s, dann 15/22/15/31 s). Der Klappgriff behandelte das Symptom
 * eines Panels, das zu groß war; ist es das nicht mehr, braucht es ihn nicht.
 *
 * **Was bewusst geblieben ist:**
 *
 *  - **Der Titel steht auf der Bühne**, nicht im Panel. Das ist der Trick, an
 *    dem hängt, dass das Foto zum Screen gehört statt hinter ihn.
 *  - **Die Überlaufmessung** unten. Sie ist fehlerträchtig genug, dass ihre
 *    heutige Fassung eine Geschichte hat (`scrollHeight` zählt Antons
 *    Oberlängen mit, deshalb wird am letzten Kind gemessen). Sie zu löschen,
 *    um eine Zeilenzahl zu treffen, wäre ein schlechter Tausch. Sie umfasst
 *    jetzt nur noch die Interaktion — der Auftrag scrollt nie weg.
 *  - **`karteBreit`.** Es regelt die Spaltenbreite quer, nicht die Höhe, und
 *    war nie Teil des Problems.
 *  - **Wisch-Navigation gibt es weiterhin nicht.** Sie kollidierte mit jeder
 *    Zieh-Übung; eine Geste, die mal geht und mal nicht, ist schlimmer als
 *    keine.
 */

export interface AnsageDaten {
  geste: Geste
  /** Was gleich passiert. Höchstens 20 Wörter. */
  text: string
  /** Der Haken daran. Höchstens 15 Wörter. */
  haken?: string
}

export function StepShell({
  id,
  buehne,
  auftrag,
  ansage,
  warum,
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
  /**
   * **Der eine Satz, der sagt, was zu tun ist.** Imperativ, ein Verb,
   * höchstens zwölf Wörter.
   *
   * `null` heißt „dieser Screen wird gelesen, nicht bedient“ — für die reinen
   * Lese-Steps (M3, M6, die Karriere-Wege, die Abstecher ohne Übung). Es ist
   * eine Entscheidung, keine Auslassung: erforderlich zu sein ist der ganze
   * Zweck dieser Angabe.
   *
   * Ist die Übung gelöst, setzt der Step ihn auf `null`. Dann verschwindet das
   * Band, und an seine Stelle rückt die Rückmeldung aus der Interaktion — der
   * Kasten bewegt sich nicht, er füllt sich um.
   */
  auftrag: React.ReactNode | null
  /**
   * **„Das passiert jetzt“** — die Erklärung *vor* der Übung, nicht danach.
   *
   * `null` heißt „diese Übung erklärt sich selbst“. Alles, was nicht Antippen
   * ist, braucht eine: die Ansage erscheint **je Geste, nicht je Screen**
   * (`komponenten/gesten.ts`), über einen ganzen Tag also zwei- bis dreimal.
   */
  ansage: AnsageDaten | null
  /**
   * Der frühere `fachtext`. Höchstens 40 Wörter, drei Sätze.
   *
   * **Wird auf Übungs-Steps derzeit nicht angezeigt** (siehe `leseStep`
   * unten) — deklariert bleibt er trotzdem, die Anzeige ist eine
   * Shell-Entscheidung, keine Inhaltsfrage. Auf Lese-Steps ist er der
   * Hauptinhalt und steht offen da.
   */
  warum?: React.ReactNode
  interaktion?: React.ReactNode
  /** Wie `warum`: auf Übungs-Steps derzeit nicht angezeigt. */
  aha?: React.ReactNode
  fuss?: React.ReactNode
  /**
   * Die Bühne **ist** die Interaktion — 3D-Modell in M5, M7, C4, C6, A4. Dann
   * bleibt die Textspalte quer schmal, und der Sichtfeld-Messer sagt der
   * Kamera, wie viel Fläche ihr wirklich bleibt.
   */
  buehneInteraktiv?: boolean
  /** Für die dichtesten Übungs-Steps: das Panel darf quer breiter werden. */
  karteBreit?: boolean
  /**
   * Solange `true`: kein Karriere-Link. Ohne Angabe gilt jeder Step mit
   * Interaktion als offen — der sichere Zustand muss der Standard sein.
   */
  interaktionOffen?: boolean
  /** Das Etikett über dem Titel, z. B. „Abstecher“. */
  titelZusatz?: string
}) {
  const graph = useGraph()
  const berufId = useAktiverBeruf()
  const besuchte = useBesuchteBerufe()
  const fortschritt = useFortschritt()
  const staffTap = useStaffAusgang()
  const [wegOffen, setWegOffen] = useState(false)
  /**
   * Beim Mounten entschieden, nicht pro Render: Übungs-Steps setzen ihren
   * `auftrag` beim Lösen auf `null` — hinge die Anzeige direkt daran, spränge
   * die Warum-Zeile genau dann auf, wenn die Übung fertig ist.
   *
   * Lese-Steps (`auftrag` von Anfang an `null`) behalten ihr Warum: dort
   * **ist** es der Inhalt des Screens. Auf Übungs-Steps wird die Klappzeile
   * **vorerst gar nicht angezeigt** — die zugeklappten Info-Boxen haben sich
   * nicht bewährt. Die Inhalte (`warum`, `aha`) bleiben in den Steps
   * deklariert und tauchen beim Wiederbesuch eines gelösten Steps auf (der
   * mountet mit `auftrag === null` und zählt damit als Lese-Step).
   */
  const [leseStep] = useState(() => auftrag === null)
  const flaeche = useRef<HTMLElement>(null)
  // Das Panel. Der Messer rechnet daraus aus, wie viel Fläche dem 3D-Modell
  // bleibt.
  const panel = useRef<HTMLDivElement>(null)

  /**
   * Liegt unterhalb der Scrollkante noch Inhalt? Nur dann bekommt die
   * Interaktion ihren Auslauf-Verlauf. Gemessen bei jedem Scroll und bei jeder
   * Größenänderung — eine Übung, die sich auflöst, ändert die Höhe, ohne dass
   * gescrollt wird.
   *
   * **Gemessen wird am letzten Kind, nicht an `scrollHeight`.** Anton läuft mit
   * `line-height` unter 1 über seine Zeilenbox hinaus, und Chrome zählt das in
   * `scrollHeight` mit; auf M10 waren das zehn Pixel — genug, um den Verlauf
   * einzublenden und die letzte Zeile halb wegzublenden, obwohl es nichts zu
   * scrollen gab. Die Unterkante des letzten Kindes ist eine Layout-Größe und
   * kennt diesen Effekt nicht.
   *
   * Zwei Werte, weil sie zwei Fragen beantworten: `ueberlauf` heißt „unter der
   * **aktuellen** Kante liegt noch etwas“ und schaltet den Verlauf, `scrollbar`
   * heißt „es gibt überhaupt etwas zu scrollen“ und schaltet die Scrollfläche.
   * Aus einem Wert beides zu ziehen hieße, dass das Panel beim Erreichen des
   * Endes das Scrollen abschaltet und nach oben zurückspringt.
   */
  const scrollFlaeche = useRef<HTMLDivElement>(null)
  const [ueberlauf, setUeberlauf] = useState(false)
  const [scrollbar, setScrollbar] = useState(false)
  const messeUeberlauf = useCallback(() => {
    const el = scrollFlaeche.current
    const letztes = el?.lastElementChild
    if (!el || !letztes) {
      setUeberlauf(false)
      setScrollbar(false)
      return
    }
    const kante = el.getBoundingClientRect()
    const unten = letztes.getBoundingClientRect().bottom
    // Der Verlauf ist 56 px hoch. Ihn für 8 px Rest einzublenden kostet mehr
    // Text, als darunter liegt. Erst ab einer halben Zeile.
    setUeberlauf(unten - kante.bottom > 14)
    setScrollbar(unten - kante.top + el.scrollTop > el.clientHeight + 6)
  }, [])
  useEffect(() => {
    messeUeberlauf()
    const el = scrollFlaeche.current
    if (!el) return
    const beobachter = new ResizeObserver(messeUeberlauf)
    beobachter.observe(el)
    for (const kind of el.children) beobachter.observe(kind)
    // Kinder, die später dazukommen (Auswertung, Rückmeldung), ändern die Höhe
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

  const def = step(graph, id)
  const aktiver = berufId ? berufDef(berufId) : null
  const imSkip = fortschritt.detourReturnTo !== null
  const kannZurueck = fortschritt.visited.length > 1
  const offen = interaktionOffen ?? interaktion != null
  const skipSichtbar = !imSkip && !offen && graph.karriereSkipAuf.includes(id)

  const zurueck = useCallback(() => {
    // Der ←-Knopf geht über den **Browser-Verlauf** zurück, nicht selbst durch
    // die Historie: es gibt nur einen Rückweg, und den kennt der Verlauf. Ginge
    // die App hier eigenmächtig zurück, bliebe der Verlaufseintrag stehen, und
    // die Zurück-Taste des Browsers spränge danach eine Stelle zu weit.
    if (kannVerlaufZurueck()) verlaufZurueck()
    // Im Skip führt jeder Rückweg aus dem Abstecher heraus, nicht durch die
    // Historie: ein Tap rein, ein Tap raus, exakt an dieselbe Stelle.
    else if (imSkip) beendeKarriereSkip()
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
    // Step sein Panel so hoch, dass der Titel unter Rail und Zurück-Button
    // verschwindet.
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-end gap-3 p-4 pt-[72px] sm:p-6 sm:pt-[72px] landscape:gap-4 landscape:p-7 landscape:pt-[72px]">
      {/*
        Der Titel steht auf dem Bild, nicht im Panel. Solange die Überschrift
        in derselben Fläche saß wie Text und Knopf, war jeder Screen ein
        Dokument auf einem Hintergrundbild. Draußen auf dem Foto ist sie ein
        Plakattitel — und das Foto ist wieder der Screen.
      */}
      <motion.header
        key={id}
        {...auftritt(18)}
        className={`flex w-full shrink-0 flex-col gap-1.5 ${spaltenbreite}`}
      >
        {titelZusatz && (
          // Enger und dunkler als beim Titel: ein weicher 18-px-Schleier trägt
          // eine 60-px-Versalie, verteilt sich unter 13 px gesperrten
          // Versalien aber ins Nichts — dort hält nur ein harter Rand.
          <span className="kh-etikett flex items-center gap-2 drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]">
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
        einmal hinstellt, liest sich als Wand — erst der Ort, dann der Inhalt.
      */}
      <motion.div
        key={`panel-${id}`}
        ref={panel}
        data-testid="karte"
        {...auftritt(22, { verzoegerung: 0.12 })}
        /*
          `max-h-[72%]` statt der früheren Staffelung 62 % / 84 %.

          Der Deckel ist jetzt eine Reißleine, kein Gestaltungsmittel: das
          Panel bemisst sich am Inhalt, und der ist im Regelfall Klappzeile,
          Auftrag und Fuß — rund drei Zeilen. Er greift nur noch dort, wo eine
          Übung wirklich im Panel sitzt (M1, A1), und verhindert, dass sie
          die Bühne ganz verdrängt.

          `min-h-0` ist die Bedingung dafür, dass das Scrollen darin überhaupt
          greift: ein Flex-Kind hat von Haus aus `min-height: auto` und wächst
          über den Container hinaus, statt zu scrollen.
        */
        className={`kh-panel pointer-events-auto flex max-h-[72%] min-h-0 w-full flex-col gap-2.5 p-4 sm:p-5 landscape:max-h-[84%] landscape:p-6 ${spaltenbreite}`}
      >
        {/*
          Reihenfolge im Panel: erst warum (zu), dann was zu tun ist, dann
          womit. Der Auftrag steht **außerhalb** der Scrollfläche — er ist das
          Einzige, das auf keinem Screen unter der Kante liegen darf.
        */}
        {leseStep && <WarumBereich warum={warum}>{aha}</WarumBereich>}

        {auftrag !== null && <Auftragsband>{auftrag}</Auftragsband>}

        {interaktion && (
          <div className="relative flex min-h-0 flex-1 flex-col">
            {/* `overflow-hidden`, solange es nichts zu scrollen gibt: sonst
                steht auf jedem Panel mit einer Anton-Zeile am Ende ein
                Scrollbalken für zehn Pixel Schriftüberhang. */}
            <div
              ref={scrollFlaeche}
              data-scroll
              onScroll={messeUeberlauf}
              className={`flex min-h-0 flex-1 flex-col gap-4 overscroll-contain pr-0.5 ${
                scrollbar ? 'overflow-y-auto' : 'overflow-y-hidden'
              }`}
            >
              {interaktion}
            </div>
            {/* Auslauf nach unten — aber nur, wenn tatsächlich etwas darunter
                liegt. Höhe h-14, nicht h-8: der Verlauf muss eine ganze Zeile
                schlucken können, sonst ragt die obere Hälfte einer
                zerschnittenen Zeile scharf über den Schleier und die Kante
                liest sich als Fehler statt als „da kommt noch was“. */}
            {ueberlauf && (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[#0E0D0B] to-transparent"
              />
            )}
          </div>
        )}

        {fuss && (
          <div className="shrink-0 border-t border-kh-line pt-2.5 landscape:pt-3">
            {fuss}
          </div>
        )}
      </motion.div>
    </div>
  )

  /*
    `isolate` — die Bühne ist eine **abgeschlossene** Ebene.

    Ohne den eigenen Stapelkontext wandert alles, was in ihr einen `z-index`
    trägt, in den Stapel des Screens: `Hallenlicht` legt seine Vignette als
    `z-10 mix-blend-multiply` über die Leinwand — und lag damit über dem Panel
    und multiplizierte sich in dessen Grund. Der Fehler saß nicht im
    Hallenlicht: eine Vignette *soll* multiplizieren. Er saß darin, dass die
    Bühne nicht sagte, wo sie aufhört.
  */
  const buehnenFlaeche = (
    <div className="absolute inset-0 isolate overflow-hidden bg-kh-ink">
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
        {/* Reihenfolge im DOM: Inhalt vor Navigation. Die Leiste
            liegt per `absolute` optisch oben, Screenreader und Tastatur
            beginnen aber nicht mit „zurück“. */}
        <main ref={flaeche} className="relative min-h-0 flex-1">
          {/*
            Der Messer steht auf **jedem** Step, nicht nur auf den 3D-Screens.
            Er kostet einen `ResizeObserver` je Step und liefert nichts aus,
            solange niemand `useSichtfeld` aufruft — ihn allen bereitzustellen
            ist billiger als drei Messungen, die sich widersprechen.
          */}
          <SichtfeldMesser flaeche={flaeche} karte={panel}>
            {buehnenFlaeche}
            {ueberlagerung}
          </SichtfeldMesser>

          {imSkip ? (
            <RueckkehrLeiste ziel={fortschritt.detourReturnTo as StepId} />
          ) : (
            // 60-px-Ziele mit 12 px Abstand, nicht die üblichen 44×44 pt.
            // Das kostet Fläche und ist es wert: hier tippt
            // jemand im Stehen, mit ausgestrecktem Arm, auf ein
            // festgeschraubtes iPad.
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

              <Rail
                graph={graph}
                beruf={aktiver?.kurz ?? ''}
                fortschritt={fortschritt}
                onOeffnen={() => setWegOffen(true)}
              />

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

          {/* Ganz zuletzt im DOM und mit `z-50`: solange die Ansage steht, ist
              sie der Screen — auch über der Leiste. */}
          {/*
              `key` an der Geste: ein Step mit zwei Beats (C6 — erst drehen,
              dann einweisen) reicht nacheinander zwei verschiedene Ansagen
              herein. Ohne den Schlüssel bliebe dieselbe `Ansage` montiert,
              ihr `useState`-Initialisierer liefe nicht noch einmal, und der
              zweite Beat bekäme still keine.
          */}
          {ansage && <Ansage key={ansage.geste} {...ansage} />}
        </main>

        <DeinWeg
          offen={wegOffen}
          graph={graph}
          aktiverBeruf={berufId}
          besuchteBerufe={besuchte}
          fortschritt={fortschritt}
          onSchliessen={() => setWegOffen(false)}
          onSpringe={springeZuBesuchtem}
          onBeruf={(ziel) => {
            setWegOffen(false)
            betreteBeruf(ziel)
          }}
          onAlleBerufe={() => {
            setWegOffen(false)
            zeigeBerufe()
          }}
          onZuruecksetzen={() => {
            setWegOffen(false)
            setzeZurueck()
          }}
        />
      </div>
    </>
  )
}

/**
 * Die persistente Leiste des Karriere-Skips. Ein Tap rein,
 * ein Tap raus, exakt an dieselbe Stelle — damit ist der neugierige Tap
 * folgenlos. Sie ersetzt die normale Leiste: Rail und Fortschritt gehören zum
 * Tag, nicht zum Abstecher.
 */
function RueckkehrLeiste({ ziel }: { ziel: StepId }) {
  const graph = useGraph()
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
          <span className="text-kh-paper/50"> — {step(graph, ziel).titel}</span>
        </span>
      </button>
    </header>
  )
}
