import { useCallback, useRef, useState } from 'react'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import { STEPS, type StepId } from '@/khpl/flow/steps'
import { DeinWeg } from './DeinWeg'
import { Rail } from './Rail'
import { WeiterKontext } from './WeiterKontext'
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
 * Die Reihenfolge steht fest, damit fünfzehn Screens wie ein Produkt wirken.
 * Welche Slots ein Step füllt, entscheidet der Step.
 */

/** Wie sich Bühne und Text den Platz teilen. */
export type Aufteilung =
  /** Bühne trägt den Screen, deckende Textkarte darüber (flow 6.2). */
  | 'bild'
  /** Bühne klein, die Interaktion trägt. */
  | 'uebung'
  /** Die Bühne **ist** die Interaktion — 3D-Modell, Aufbau-Animation. */
  | 'buehne'

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
  aufteilung = 'bild',
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
  aufteilung?: Aufteilung
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

  const titel = (
    <header className="flex flex-col gap-1">
      {titelZusatz && (
        <p className="text-[13px] font-normal tracking-[0.14em] text-kh-grey/70 uppercase">
          {titelZusatz}
        </p>
      )}
      <h1 className="kh-step-titel">{def.titel}</h1>
    </header>
  )

  /**
   * Der Fuß bekommt in den Bild-Layouts eine eigene deckende Fläche.
   * flow 6.2 begründet das ausführlich: Fließtext in Barlow 200 über einem Foto
   * ist aus Armlänge unter Hallenlicht nicht lesbar — und das Abstecher-Angebot
   * ist Fließtext mit Umriss-Buttons, nicht nur ein oranger Block.
   */
  const fussFlaeche = fuss && (
    <div className="rounded-kh bg-kh-page p-4 shadow-[0_2px_24px_rgba(0,0,0,0.12)] landscape:p-5">
      {fuss}
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
          {aufteilung === 'bild' && (
            <>
              {buehne && <div className="absolute inset-0 overflow-hidden">{buehne}</div>}
              <div className="absolute inset-0 flex flex-col justify-end gap-3 p-4 landscape:p-6">
                <div className="flex w-full flex-col gap-3 rounded-kh bg-kh-page p-5 shadow-[0_2px_24px_rgba(0,0,0,0.12)] landscape:max-w-[42rem] landscape:p-7">
                  {titel}
                  {fachtext && <div className="kh-fachtext">{fachtext}</div>}
                  {interaktion}
                  {aha}
                </div>
                {fussFlaeche}
              </div>
            </>
          )}

          {aufteilung === 'uebung' && (
            <div className="flex h-full flex-col landscape:flex-row">
              {buehne && (
                <div className="relative h-[18vh] shrink-0 overflow-hidden landscape:h-full landscape:w-[34%]">
                  {buehne}
                </div>
              )}
              <div className="flex min-h-0 flex-1 flex-col gap-3 p-4 landscape:gap-4 landscape:p-6">
                {titel}
                {fachtext && <div className="kh-fachtext">{fachtext}</div>}
                {/* Immer da, auch leer: der Fuß gehört an den unteren Rand, und
                    der Weiter-Button soll auf jedem Screen an derselben Stelle
                    liegen (flow 6.1 — Button unten rechts). */}
                <div className="min-h-0 flex-1">{interaktion}</div>
                {aha}
                {fuss}
              </div>
            </div>
          )}

          {aufteilung === 'buehne' && (
            <>
              {buehne && <div className="absolute inset-0 overflow-hidden">{buehne}</div>}
              <div className="pointer-events-none absolute inset-0 flex flex-col justify-between gap-3 p-4 landscape:p-6">
                <div className="pointer-events-auto w-full max-w-[30rem] rounded-kh bg-kh-page p-4 shadow-[0_2px_24px_rgba(0,0,0,0.12)] landscape:p-5">
                  {titel}
                  {fachtext && <div className="kh-fachtext mt-2">{fachtext}</div>}
                </div>
                <div className="pointer-events-auto flex flex-col gap-3 landscape:ml-auto landscape:w-[min(42rem,62%)]">
                  {interaktion}
                  {aha}
                  {fussFlaeche}
                </div>
              </div>
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
          <header className="kh-leiste order-1 flex shrink-0 items-center gap-3 border-b border-kh-rule px-3">
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
                className="flex h-[60px] shrink-0 items-center gap-0.5 rounded-kh px-3 text-[15px] text-kh-grey/80 transition-colors hover:text-kh-orange"
              >
                Karriere-Wege
                <ChevronRight className="size-4" strokeWidth={1.5} />
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
        className="flex h-full w-full items-center gap-1 px-3 text-left text-[16px] text-kh-grey transition-colors hover:text-kh-orange"
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
