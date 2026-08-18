import { useCallback, useRef, useState } from 'react'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import { STEPS, type StepId } from '@/khpl/flow/steps'
import { DeinWeg } from './DeinWeg'
import { Rail } from './Rail'
import { WeiterKontext } from './WeiterKontext'
import { SichtfeldMesser } from './SichtfeldKontext'
import { useStaffAusgang } from './staffAusgang'
import { useWisch } from './useWisch'
import {
  beendeKarriereSkip,
  geheZurueck,
  springeZuBesuchtem,
  starteKarriereSkip,
  useFortschritt,
} from '@/khpl/store/fortschritt'

/**
 * S2 — das Arbeitspferd (khpl-ui-shell.md 2 + 5). Rendert jeden gelben Step,
 * Haupt wie Abstecher, aus denselben Slots:
 *
 *   Bühne · Fachtext · Interaktion · Aha-Karte · Fuß
 *
 * **Ein Layout, nicht drei.** Vorher gab es `bild`, `uebung` und `buehne`, und
 * jede Aufteilung setzte Titel, Text und Knopf woandershin. Über fünfzehn
 * Screens hinweg las sich das nicht wie ein Produkt, sondern wie drei: der
 * Weiter-Knopf sprang, die Bühne war mal Hintergrund und mal ein Streifen an
 * der Seite, und auf `uebung` gab es überhaupt kein Bild.
 *
 * Jetzt trägt die Bühne immer die ganze Fläche, und darüber liegt genau **eine**
 * deckende Karte, unten links. Der Weiter-Knopf sitzt auf jedem einzelnen
 * Screen an derselben Stelle: untere rechte Ecke dieser Karte.
 *
 * Was bleibt, ist der Unterschied zwischen einer Bühne, die man ansieht, und
 * einer, die man anfasst — dafür steht `buehneInteraktiv`.
 */

/**
 * Der Karriere-Link taucht auf S1 und danach auf jedem zweiten Hauptschritt auf
 * (khpl-ui-shell.md 6). Nie auf Abstecher-Screens, nie während eine Interaktion
 * offen ist. So begegnet er jedem Besucher mehrfach, ohne je zu drängen.
 *
 * **M8 fehlt hier bewusst**, obwohl ui-shell 6 ihn aufzählt: M9 *ist* der
 * nächste Schritt nach M8. Ein Abstecher, der einen Schritt vor sein Ziel
 * abkürzt, schickt den Besucher über M9 → M10 → zurück auf M8 → weiter zu M9 —
 * derselbe Bereich zweimal, mit einer Rückkehr-Leiste dazwischen.
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
  wischen = true,
  titelZusatz,
  onWeiter,
}: {
  id: StepId
  buehne?: React.ReactNode
  fachtext?: React.ReactNode
  interaktion?: React.ReactNode
  aha?: React.ReactNode
  fuss?: React.ReactNode
  /**
   * Die Bühne **ist** die Interaktion — 3D-Modell in B3.2, M5, M7, M8. Dann
   * bleibt die Karte schmal, und der Sichtfeld-Messer sagt der Kamera, wie viel
   * Fläche ihr wirklich bleibt.
   */
  buehneInteraktiv?: boolean
  /**
   * Für die dichten Übungs-Steps: die Karte darf quer breiter werden.
   *
   * M4 trägt Fachtext, Werkzeichnung, Schnittregler, Winkelwahl und Prüfknopf
   * auf einem Screen. Bei 46rem stand die Übung selbst unterhalb der Kante —
   * jemand sah Text und eine Zeichnung, aber keine Aufgabe. Mit 54rem gewinnt
   * der Fachtext eine Zeile zurück und die Bedienelemente stehen nebeneinander
   * statt untereinander.
   */
  karteBreit?: boolean
  /**
   * Solange `true`: kein Karriere-Link. Ohne Angabe gilt jeder Step mit
   * Interaktion als offen — der sichere Zustand muss der Standard sein, sonst
   * ist ui-shell 6 („während eine Interaktion noch offen ist nie“) eine Regel,
   * an die sich jeder Step einzeln erinnern muss.
   */
  interaktionOffen?: boolean
  /** Auf Drag-&-Drop-Screens abschalten (flow 6.1). */
  wischen?: boolean
  /** Kleine Zeile über dem Titel, z. B. „Abstecher“. */
  titelZusatz?: string
  /**
   * Der eine Weg nach vorn. Button und Wisch nach links benutzen ihn beide —
   * siehe `WeiterKontext`.
   */
  onWeiter?: () => void
}) {
  const fortschritt = useFortschritt()
  const staffTap = useStaffAusgang()
  const [wegOffen, setWegOffen] = useState(false)
  const flaeche = useRef<HTMLElement>(null)
  // Die eine deckende Karte. Der Messer rechnet daraus aus, wie viel Fläche dem
  // 3D-Modell bleibt.
  const karte = useRef<HTMLDivElement>(null)

  const def = STEPS[id]
  const imSkip = fortschritt.detourReturnTo !== null
  const kannZurueck = fortschritt.visited.length > 1
  const offen = interaktionOffen ?? interaktion != null
  const skipSichtbar = !imSkip && !offen && SKIP_AUF.includes(id)

  const zurueck = useCallback(() => {
    // Im Skip führt jeder Rückweg aus dem Abstecher heraus, nicht durch die
    // Historie: „ein Tap rein, ein Tap raus, exakt an dieselbe Stelle“
    // (ui-shell 6). Ohne das landet ein Wisch nach rechts auf dem Rückkehrziel,
    // während die Skip-Leiste stehen bleibt.
    if (imSkip) beendeKarriereSkip()
    else if (kannZurueck) geheZurueck()
  }, [imSkip, kannZurueck])

  useWisch({
    ziel: flaeche,
    aktiv: wischen && !wegOffen,
    onLinks: () => onWeiter?.(),
    onRechts: zurueck,
  })

  /**
   * Die Karte.
   *
   * Quer: unten links, gedeckelt auf 46rem — bei 1194 px sind das rund 62 %,
   * es bleibt also immer ein Streifen Foto sichtbar, und die Zeilenlänge kippt
   * nicht ins Unlesbare. Hochkant auf dem Handy: volle Breite, weil eine
   * schmalere Karte dort nur Rand erzeugt.
   *
   * `overflow-y-auto`, weil M1 zehn Checklistenpunkte trägt und ein iPhone SE
   * hochkant dafür nicht hoch genug ist. Ohne das schnitte die Karte den
   * Weiter-Knopf ab — und dann sitzt jemand am Stand fest.
   */
  const inhalt = (
    <div
      ref={karte}
      data-testid="karte"
      // `min-h-0` ist die Bedingung dafür, dass das Scrollen unten überhaupt
      // greift: ein Flex-Kind hat von Haus aus `min-height: auto` und wächst
      // über den Container hinaus, statt zu scrollen.
      className={`kh-karte pointer-events-auto flex min-h-0 w-full flex-col p-5 sm:p-6 landscape:p-6 ${
        buehneInteraktiv
          ? 'landscape:max-w-[40rem]'
          : karteBreit
            ? 'landscape:max-w-[54rem]'
            : 'landscape:max-w-[46rem]'
      }`}
    >
      {/*
        Nur der Inhalt scrollt, der Fuß nicht.

        M1 trägt zehn Checklistenpunkte über einem sechszeiligen Fachtext; auf
        einem Handy hochkant ist das mehr, als auf den Screen passt. Scrollte die
        ganze Karte, läge der Weiter-Knopf unter der Kante — die einzige Handlung,
        die auf jedem Screen an derselben Stelle liegen soll, wäre ausgerechnet
        die unsichtbare. Deshalb bleibt der Fuß stehen und der Rest bewegt sich
        darunter durch.
      */}
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain landscape:gap-5">
          <header className="flex flex-col gap-1.5">
            {titelZusatz && <p className="kh-eyebrow">{titelZusatz}</p>}
            <h1 className="kh-step-titel">{def.titel}</h1>
          </header>
          {fachtext && <div className="kh-fachtext">{fachtext}</div>}
          {interaktion}
          {aha}
        </div>
        {/* Auslauf nach unten. Wo gescrollt wird, franst der Text aus, statt
            mitten im Wort abgeschnitten dazustehen — und wo nichts zu scrollen
            ist, liegt der Verlauf über leerem Kartengrund und ist unsichtbar,
            weil er in genau dessen Farbe endet. Deshalb braucht es keine
            Messung, ob überhaupt überläuft. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-kh-page to-transparent"
        />
      </div>
      {fuss && (
        <div className="mt-3 shrink-0 border-t border-kh-rule pt-3 landscape:mt-4 landscape:pt-4">
          {fuss}
        </div>
      )}
    </div>
  )

  const buehnenFlaeche = buehne && (
    <div className="absolute inset-0 overflow-hidden">{buehne}</div>
  )

  // Die Karte klebt am unteren Rand. Auf dem Handy randlos bis an die Kanten,
  // quer mit Luft drumherum — dort ist das Foto Teil der Komposition, hochkant
  // waere derselbe Rand nur verschenkte Hoehe.
  const ueberlagerung = (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-end p-3 sm:p-5 landscape:p-6">
      {inhalt}
    </div>
  )

  return (
    <WeiterKontext.Provider value={onWeiter ?? null}>
      <div
        className="kh-screen flex flex-col overflow-hidden bg-kh-page"
        data-step={id}
        data-testid="step"
      >
        {/* Reihenfolge im DOM: Inhalt vor Navigation (flow 8.5). Die Leiste sitzt
            per `order` optisch oben, Screenreader und Tastatur beginnen aber
            nicht mit „zurück“. */}
        <main ref={flaeche} className="relative order-2 min-h-0 flex-1">
          {buehneInteraktiv ? (
            <SichtfeldMesser flaeche={flaeche} karte={karte}>
              {buehnenFlaeche}
              {ueberlagerung}
            </SichtfeldMesser>
          ) : (
            <>
              {buehnenFlaeche}
              {ueberlagerung}
            </>
          )}
        </main>

        {imSkip ? (
          <RueckkehrLeiste ziel={fortschritt.detourReturnTo as StepId} />
        ) : (
          // 60 px Ziele mit 12 px Abstand (flow 8.5 — „entschieden: 60×60 pt,
          // nicht 44×44“, Mindestabstand 12 pt). Das kostet Höhe und ist es
          // wert: hier tippt jemand im Stehen, mit ausgestrecktem Arm, auf ein
          // festgeschraubtes iPad.
          <header className="kh-leiste order-1 flex shrink-0 items-center gap-2 border-b border-kh-rule px-2 sm:gap-3 sm:px-3">
            <button
              type="button"
              onClick={zurueck}
              data-testid="zurueck"
              aria-label="Einen Schritt zurück"
              className={`grid size-[60px] shrink-0 place-items-center rounded-kh text-kh-grey transition-colors hover:bg-kh-band-soft hover:text-kh-ink ${
                kannZurueck ? '' : 'invisible'
              }`}
            >
              <ArrowLeft className="size-6" strokeWidth={1.75} />
            </button>

            <Rail fortschritt={fortschritt} onOeffnen={() => setWegOffen(true)} />

            {/* Die Dehnfuge zwischen Rail und Skip-Slot ist auf jedem Step leer
                und traegt deshalb die Staff-Geste (fuenf schnelle Taps). Vorher
                lag dafuer eine unsichtbare Flaeche ueber dem Zurueck-Button —
                die frass dessen linke Haelfte und oeffnete Besuchern das
                Personalmenue. */}
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
                className="flex h-[60px] shrink-0 items-center gap-0.5 rounded-kh px-3 text-[17px] text-kh-grey/80 transition-colors hover:text-kh-orange"
              >
                Karriere-Wege
                <ChevronRight className="size-5" strokeWidth={1.5} />
              </button>
            )}
          </header>
        )}

        <DeinWeg
          offen={wegOffen}
          fortschritt={fortschritt}
          onSchliessen={() => setWegOffen(false)}
          onSpringe={springeZuBesuchtem}
        />
      </div>
    </WeiterKontext.Provider>
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
    <header className="kh-leiste order-1 shrink-0 border-b border-kh-rule bg-kh-band-soft">
      <button
        type="button"
        onClick={beendeKarriereSkip}
        data-testid="zurueck-zum-tag"
        className="flex h-full w-full items-center gap-1 px-3 text-left text-[17px] text-kh-grey transition-colors hover:text-kh-orange"
      >
        <ChevronLeft className="size-6 shrink-0" strokeWidth={1.75} />
        <span className="truncate">
          Zurück zu deinem Tag
          <span className="text-kh-grey/60"> — {STEPS[ziel].titel}</span>
        </span>
      </button>
    </header>
  )
}
