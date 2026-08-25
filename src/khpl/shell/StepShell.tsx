import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
} from 'lucide-react'
import { motion } from 'motion/react'
import { step, type StepId } from '@/khpl/flow/steps'
import { beruf as berufDef } from '@/khpl/berufe/registry'
import { EinwurfBuehne } from '@/khpl/komponenten/AhaKarte'
import { DeinWeg } from './DeinWeg'
import { Rail } from './Rail'
import { SichtfeldMesser } from './SichtfeldKontext'
import { useStaffAusgang } from './staffAusgang'
import {
  beendeKarriereSkip,
  betreteBeruf,
  geheZurueck,
  springeZuBesuchtem,
  starteKarriereSkip,
  useAktiverBeruf,
  useBesuchteBerufe,
  useFortschritt,
  useGraph,
  zeigeBerufe,
} from '@/khpl/store/fortschritt'

/**
 * S2 — das Arbeitspferd (khpl-ui-shell.md 2 + 5). Rendert jeden Step, Haupt wie
 * Abstecher, aus denselben Slots:
 *
 *   Bühne · Titel · Aha · Fachtext · Interaktion · Fuß
 *
 * `aha` steht **außerhalb** des Panels und außerhalb der Spalte: die Einwürfe
 * melden sich oben rechts, in unregelmäßigen Abständen und immer nur für ein
 * paar Sekunden (siehe `EinwurfBuehne`). Vorher hingen sie unten im
 * Scrollbereich und machten das Panel bei jeder gelösten Übung höher — der
 * Screen wuchs genau dann, wenn er fertig war; danach standen sie dauerhaft
 * über dem Panel und waren damit Inhalt statt Einwurf.
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

export function StepShell({
  id,
  buehne,
  fachtext,
  interaktion,
  aha,
  fuss,
  buehneInteraktiv = false,
  karteBreit = false,
  buehnePlatz,
  einklappbar,
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
   * Die Bühne braucht Fläche — sie trägt die Übung oder eine Zeichnung, die
   * gelesen werden muss. Zwei Folgen: das Panel bekommt den Klappgriff, und
   * hochkant ist es auf 62 % statt 84 % gedeckelt.
   *
   * Ohne Angabe gilt `buehneInteraktiv`. Steps mit 2D-Bühne (Z1, Z3) setzen
   * es von Hand.
   */
  buehnePlatz?: boolean
  /**
   * Nur der Griff, ohne die kleinere Obergrenze.
   *
   * **Warum das eine eigene Angabe ist.** Auf A1 stehen sechs Prüfungen zur
   * Wahl, und die Zeichnung daneben erklärt sie nur — das Panel ist der Kern
   * des Screens. `buehnePlatz` hätte dort mit dem Griff auch den 62-%-Deckel
   * gebracht und damit ausgerechnet den Scroll-Befund verschärft, der zu
   * beheben war. Wer die Zeichnung trotzdem einmal ganz sehen können soll,
   * ohne dass das Panel dauerhaft schrumpft, nimmt diese Angabe.
   *
   * Ohne Angabe gilt `buehnePlatz`.
   */
  einklappbar?: boolean
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
   * Panel eingeklappt — nur Griff und Fuß bleiben stehen, die Bühne bekommt
   * den Rest des Screens.
   *
   * **Warum das überhaupt sein muss.** Das Panel ist auf `max-h-[84%]`
   * gedeckelt; auf einem Handy hochkant sind das 635 von 844 px, und der
   * Bühne bleibt ein Streifen von 193 px. Auf den Screens, auf denen die
   * Bühne die Übung *ist* — die Leitung ziehen (A4), den Ausschnitt zurechen
   * (C4), ein Bauteil antippen (B3.2) —, ist das keine Bühne mehr, sondern
   * ein Vorschaubild. Panel und Bühne gleichzeitig groß gibt der Screen
   * nicht her; also bekommt der Besucher die Wahl.
   *
   * Der Zustand lebt im Step: `KhplApp` mountet jeden Step frisch
   * (`key={beruf}:{id}`), damit fängt jeder Screen wieder aufgeklappt an.
   * Das ist Absicht — eingeklappt ankommen hieße, die Aufgabe zu verstecken,
   * bevor sie einmal gelesen wurde.
   *
   * **`hidden` statt Ausbauen:** die Interaktion im Panel behält ihren
   * Zustand. Wer C6 halb gelöst hat, klappt ein, zieht, klappt auf — und
   * findet seine Wahl wieder.
   */
  const [eingeklappt, setEingeklappt] = useState(false)
  const flaeche = useRef<HTMLElement>(null)
  // Das Panel. Der Messer rechnet daraus aus, wie viel Fläche dem 3D-Modell
  // bleibt.
  const panel = useRef<HTMLDivElement>(null)

  /**
   * Liegt unterhalb der Scrollkante noch Inhalt? Nur dann bekommt das Panel
   * seinen Auslauf-Verlauf. Gemessen bei jedem Scroll und bei jeder
   * Größenänderung von Fläche oder Inhalt — eine Übung, die sich auflöst,
   * ändert die Höhe, ohne dass gescrollt wird.
   *
   * **Gemessen wird am letzten Kind, nicht an `scrollHeight`.** Die
   * Vorfassung verglich `scrollHeight` mit `clientHeight`, und das meldet
   * einen Überlauf, den es gar nicht gibt: Anton läuft mit `line-height`
   * unter 1 über seine Zeilenbox hinaus, und Chrome zählt das in
   * `scrollHeight` mit. Auf M10 waren das zehn Pixel — genug, um den
   * Auslauf-Verlauf einzublenden und damit ausgerechnet „Sprich jetzt mit
   * uns am Stand." halb wegzublenden, obwohl das Panel vier Zeilen trägt
   * und nichts zu scrollen hat. Die Unterkante des letzten Kindes ist eine
   * Layout-Größe und kennt diesen Effekt nicht.
   *
   * Zwei Werte, weil sie zwei Fragen beantworten: `ueberlauf` heißt „unter
   * der **aktuellen** Kante liegt noch etwas“ und schaltet den Verlauf,
   * `scrollbar` heißt „es gibt überhaupt etwas zu scrollen“ und schaltet die
   * Scrollfläche. Aus einem Wert beides zu ziehen hieße, dass das Panel beim
   * Erreichen des Endes das Scrollen abschaltet und nach oben zurückspringt.
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
    // Text, als darunter liegt — auf B9.1 quer fraß er eine ganze Zeile, um
    // acht Pixel Schriftüberhang anzuzeigen. Erst ab einer halben Zeile.
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

  const def = step(graph, id)
  const aktiver = berufId ? berufDef(berufId) : null
  const imSkip = fortschritt.detourReturnTo !== null
  const kannZurueck = fortschritt.visited.length > 1
  const offen = interaktionOffen ?? interaktion != null
  const skipSichtbar = !imSkip && !offen && graph.karriereSkipAuf.includes(id)

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

  /**
   * Eingeklappt wird das Panel quer auch **schmaler**, nicht nur flacher.
   *
   * Hochkant genügt die Höhe: die Bühne bekommt den Streifen über dem Panel,
   * und der wächst, sobald das Panel schrumpft. Quer stimmt das nicht. Dort
   * steht das Panel links, und die 2D-Bühnen setzen an seiner **rechten
   * Kante** an (`Bild.useFreieFlaeche`, `Schnitt.useRahmen`) — die bewegt
   * sich beim Einklappen keinen Pixel. Auf Z1, Z2 und Z3 quer war die Bühne
   * auf- und eingeklappt exakt gleich groß (755 × 726 px), das Panel schrumpfte
   * von 587 auf 137 px, und daneben stand eine leere Fläche. Ein Griff, der
   * „Mehr Platz zum Arbeiten" verspricht und quer keinen liefert, ist ein
   * kaputtes Versprechen.
   *
   * 26 rem trägt den Fuß — Überspringen plus Primärhandlung — ohne Umbruch.
   */
  const eingeklapptBreite = 'landscape:max-w-[26rem]'

  /**
   * Wo die Bühne die Aussage trägt, gibt es den Griff. Ohne Bühne wäre er
   * ein Knopf, der Text versteckt und nichts dafür hergibt.
   */
  const brauchtPlatz = buehnePlatz ?? buehneInteraktiv
  const griff = (einklappbar ?? brauchtPlatz) && buehne != null

  /**
   * Wie hoch das Panel werden darf.
   *
   * `84 %` ist richtig für einen Screen, auf dem die Bühne Kulisse ist — dort
   * zählt, dass der Text ohne Scrollen dasteht. Auf einem Screen, auf dem die
   * Bühne die Übung *ist*, ist derselbe Wert der Fehler: hochkant bleiben von
   * 844 px genau 193 px, und in denen soll jemand ein Wandelement zurechtziehen
   * (C4: 326 × 116 px) oder eine Stirnseite ablesen (C6: 147 × 59 px).
   *
   * **Der Griff allein reicht dafür nicht.** Er löst das Problem für den, der
   * ihn findet — der Screen *kommt* aber aufgeklappt an, und der erste
   * Eindruck ist ein 116-px-Streifen mit der Aufforderung, darauf zu ziehen.
   * Hochkant deshalb 62 %: das Panel trägt weiterhin Fachtext und Fuß, der
   * Rest wird gescrollt (der Auslauf-Verlauf zeigt es an), und die Bühne
   * kommt mit rund 250 statt 120 px an. Wer mehr braucht, klappt ein.
   *
   * Quer bleibt es bei 84 %: dort nimmt das Panel Breite, nicht Höhe.
   *
   * **Und nur, solange die Übung offen ist.** Der Deckel ist ein Zugeständnis
   * an die Bühne für die Zeit, in der man auf ihr arbeitet. Ist die Übung
   * gelöst, kippt das Verhältnis: dann steht die Auflösung im Panel, und die
   * Bühne hat ihre Rolle gespielt. Auf Z1 kostete der Deckel nach dem Lösen
   * 167 px und schob Maßtabelle, Haarvergleich und den Papier-Dialog unter
   * die Kante — ausgerechnet die Pointe des Screens.
   */
  const panelHoehe =
    brauchtPlatz && offen ? 'max-h-[62%] landscape:max-h-[84%]' : 'max-h-[84%]'

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
          // „ABSTECHER“ bzw. „KARRIERE-WEG“ stand als orange Schrift ohne
          // Grund auf dem Foto — auf den hellen Motiven von C5.1 (Himmel) und
          // C8.2 (weiße Leuchte) blieb davon die Hälfte lesbar.
          //
          // **Enger und dunkler als beim Titel.** Der Titel trägt
          // `0_2px_18px/0.65`; ein weicher 18-px-Schleier legt sich unter eine
          // 60-px-Versalie und trägt sie. Unter 13 px gesperrten Versalien
          // verteilt sich derselbe Schleier ins Nichts — dort hält nur ein
          // harter Rand die Buchstabenkante gegen den hellen Grund.
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
        className={`kh-panel pointer-events-auto flex min-h-0 w-full flex-col p-4 sm:p-5 landscape:p-6 ${panelHoehe} ${eingeklappt ? eingeklapptBreite : spaltenbreite}`}
      >
        {/*
          Nur der Inhalt scrollt, der Fuß nicht.

          M1 trägt zehn Checklistenpunkte; auf einem Handy hochkant ist das
          mehr, als auf den Screen passt. Scrollte das ganze Panel, läge der
          Weiter-Knopf unter der Kante — die einzige Handlung, die auf jedem
          Screen an derselben Stelle liegen soll, wäre ausgerechnet die
          unsichtbare.
        */}
        {griff && (
          <Klappgriff
            eingeklappt={eingeklappt}
            onKlick={() => setEingeklappt((v) => !v)}
          />
        )}
        <div
          className={`relative flex min-h-0 flex-1 flex-col ${eingeklappt ? 'hidden' : ''}`}
        >
          {/* `overflow-hidden`, solange es nichts zu scrollen gibt: sonst
              steht auf jedem Panel mit einer Anton-Zeile am Ende ein
              Scrollbalken für zehn Pixel Schriftüberhang — und das Panel
              lässt sich um genau diese zehn Pixel verschieben. */}
          <div
            ref={scrollFlaeche}
            data-scroll
            onScroll={messeUeberlauf}
            className={`flex min-h-0 flex-1 flex-col gap-4 overscroll-contain pr-0.5 ${
              scrollbar ? 'overflow-y-auto' : 'overflow-y-hidden'
            }`}
          >
            {fachtext && <div className="kh-fachtext">{fachtext}</div>}
            {interaktion}
          </div>
          {/*
            Auslauf nach unten — aber nur, wenn tatsächlich etwas darunter
            liegt. Die erste Fassung blendete den Verlauf immer ein und
            begründete das damit, dass er auf leerem Grund unsichtbar sei.
            Stimmt nur, solange darunter *nichts* steht: endet der Inhalt
            genau an der Kante (kein Überlauf, oder zu Ende gescrollt), fraß
            der Verlauf die letzte Zeile an, obwohl gar nichts zu scrollen
            war. Jetzt wird gemessen: Verlauf nur bei echtem Rest nach unten.

            Höhe h-14, nicht h-8: der Verlauf muss eine ganze Fachtext-Zeile
            schlucken können. Bei 32 px ragte die obere Hälfte einer an der
            Scrollkante zerschnittenen Zeile scharf über den Schleier — die
            Kante las sich als Fehler statt als „da kommt noch was".
          */}
          {ueberlauf && (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[#0E0D0B] to-transparent"
            />
          )}
        </div>
        {fuss && (
          // Eingeklappt trennt der Strich nichts mehr — über ihm steht nur der
          // Griff, und zwei Linien übereinander lesen sich als Fehler.
          <div
            className={`shrink-0 ${
              eingeklappt
                ? ''
                : 'mt-2.5 border-t border-kh-line pt-2.5 landscape:mt-3 landscape:pt-3'
            }`}
          >
            {fuss}
          </div>
        )}
      </motion.div>
    </div>
  )

  /*
    Der Einwurf-Slot. Er steht bewusst **außerhalb** der Spalte aus Titel und
    Panel: der Einwurf ist kein Inhalt des Screens, sondern jemand, der sich
    gelegentlich meldet. Oben rechts, unterhalb der Leiste — die Ecke, in der
    sonst nichts passiert, und weit genug weg von der Primärhandlung unten
    rechts, dass er sie nie verdeckt.

    `key={id}`: bei jedem Schritt fängt der Takt von vorn an.
  */
  const einwuerfe = aha && (
    <div className="pointer-events-none absolute top-[74px] right-3 z-30 flex w-[min(26rem,calc(100%-1.5rem))] flex-col items-end sm:right-5 landscape:right-7">
      <EinwurfBuehne key={id}>{aha}</EinwurfBuehne>
    </div>
  )

  /*
    `isolate` — die Bühne ist eine **abgeschlossene** Ebene.

    Ohne den eigenen Stapelkontext war sie nur ein `absolute` ohne
    `z-index`, und alles, was in ihr einen `z-index` trägt, wanderte in den
    Stapel des Screens: `Hallenlicht` legt seine Vignette als `z-10
    mix-blend-multiply` über die Leinwand — und lag damit über dem Panel und
    multiplizierte sich in dessen Grund. Sichtbar als Schattenschleier, der
    das Panel von oben nach unten um ein Drittel abdunkelte und der leisesten
    Zeile darin (`kh-mute`) genau unten den Kontrast nahm.

    Der Fehler saß nicht im Hallenlicht: eine Vignette *soll* multiplizieren.
    Er saß darin, dass die Bühne nicht sagte, wo sie aufhört. `isolate` sagt
    es — und jede künftige Mischebene auf einer Bühne ist damit vorab
    eingefangen, ohne dass sie es selbst wissen muss.
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
        {/* Reihenfolge im DOM: Inhalt vor Navigation (flow 8.5). Die Leiste
            liegt per `absolute` optisch oben, Screenreader und Tastatur
            beginnen aber nicht mit „zurück“. */}
        <main ref={flaeche} className="relative min-h-0 flex-1">
          {/*
            Der Messer steht auf **jedem** Step, nicht nur auf den 3D-Screens.

            Vorher hing er an `buehneInteraktiv`, und das Flag zieht quer die
            Textspalte auf 38 rem zusammen — ein Step, der nur wissen wollte,
            wo das Panel steht, musste dafür sein Layout ändern. Zerspanung
            und Anlagenmechanik haben deshalb je einen eigenen Messer gebaut
            (`Bild.useFreieFlaeche`, `Schnitt.useRahmen`), und beide raten an
            der Stelle, an der die Hülle misst: quer steht in `Schnitt` ein
            fester `inset: … 30%`, während das Panel 51 % breit ist, und
            `Bild` deckelt den linken Rand auf 58 % und zeichnet den Rest
            bewusst unter das Panel.

            Der Messer kostet einen `ResizeObserver` je Step und liefert
            nichts aus, solange niemand `useSichtfeld` aufruft. Ihn allen
            bereitzustellen ist billiger als drei Messungen, die sich
            widersprechen.
          */}
          <SichtfeldMesser flaeche={flaeche} karte={panel}>
            {buehnenFlaeche}
            {ueberlagerung}
          </SichtfeldMesser>

          {einwuerfe}

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
        />
      </div>
    </>
  )
}

/**
 * Der Griff, mit dem das Panel aus dem Weg geht.
 *
 * **Er sitzt oben im Panel und nicht als Symbol in der Ecke.** Eine 44-px-Ecke
 * über dem Fachtext verdeckt die erste Zeile, und ein Symbol allein sagt am
 * Messestand niemandem, was passiert. Eine volle Zeile mit Griffstrich und
 * Wort kostet 40 px und ist die einzige Fläche im Panel, die aussieht, als
 * ließe sie sich anfassen.
 *
 * **Der Text sagt die Folge, nicht den Mechanismus.** Nicht „Panel
 * einklappen“, sondern „Mehr Platz zum Arbeiten“ — auf diesen Screens ist
 * genau das der Grund, aus dem jemand tippt.
 */
function Klappgriff({
  eingeklappt,
  onKlick,
}: {
  eingeklappt: boolean
  onKlick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onKlick}
      data-testid="panel-klappe"
      aria-expanded={!eingeklappt}
      className="-mt-1 mb-1 flex h-10 shrink-0 items-center justify-center gap-2.5 rounded-kh-pill text-[0.9375rem] font-medium text-kh-paper/55 transition-colors active:text-kh-paper landscape:-mt-2"
    >
      <span aria-hidden className="h-[3px] w-8 rounded-full bg-kh-paper/25" />
      {eingeklappt ? (
        <>
          <ChevronUp className="size-[18px]" strokeWidth={2.25} />
          Aufgabe zeigen
        </>
      ) : (
        <>
          <ChevronDown className="size-[18px]" strokeWidth={2.25} />
          Mehr Platz zum Arbeiten
        </>
      )}
      <span aria-hidden className="h-[3px] w-8 rounded-full bg-kh-paper/25" />
    </button>
  )
}

/**
 * Die persistente Leiste des Karriere-Skips (khpl-ui-shell.md 6). Ein Tap rein,
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
