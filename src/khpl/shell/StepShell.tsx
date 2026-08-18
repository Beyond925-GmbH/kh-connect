import { useRef, useState } from 'react'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import { STEPS, type StepId } from '@/khpl/flow/steps'
import { DeinWeg } from './DeinWeg'
import { Rail } from './Rail'
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
 */
const SKIP_AUF: readonly StepId[] = ['M2', 'M4', 'M6', 'M8']

export function StepShell({
  id,
  buehne,
  fachtext,
  interaktion,
  aha,
  fuss,
  aufteilung = 'bild',
  interaktionOffen = false,
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
  /** Solange `true`: kein Karriere-Link. */
  interaktionOffen?: boolean
  /** Auf Drag-&-Drop-Screens abschalten (flow 6.1). */
  wischen?: boolean
  /** Kleine Zeile über dem Titel, z. B. „Abstecher“. */
  titelZusatz?: string
  /** Derselbe Weg wie der Weiter-Button — der Wisch nach links löst ihn aus. */
  onWeiter?: () => void
}) {
  const fortschritt = useFortschritt()
  const [wegOffen, setWegOffen] = useState(false)
  const flaeche = useRef<HTMLElement>(null)

  const def = STEPS[id]
  const imSkip = fortschritt.detourReturnTo !== null
  const kannZurueck = fortschritt.visited.length > 1
  const skipSichtbar = !imSkip && !interaktionOffen && SKIP_AUF.includes(id)

  useWisch({
    ziel: flaeche,
    aktiv: wischen && !wegOffen,
    onLinks: () => onWeiter?.(),
    onRechts: () => {
      if (kannZurueck) geheZurueck()
    },
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

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden bg-kh-page"
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
              {fuss}
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
              <div className="pointer-events-auto flex flex-col gap-3 landscape:ml-auto landscape:w-[min(42rem,60%)]">
                {interaktion}
                {aha}
                {fuss}
              </div>
            </div>
          </>
        )}
      </main>

      {imSkip ? (
        <RueckkehrLeiste ziel={fortschritt.detourReturnTo as StepId} />
      ) : (
        <header className="order-1 flex h-14 shrink-0 items-center gap-1 border-b border-kh-rule px-2 landscape:px-3">
          <button
            type="button"
            onClick={geheZurueck}
            data-testid="zurueck"
            aria-label="Einen Schritt zurück"
            className={`grid size-11 shrink-0 place-items-center rounded-kh text-kh-grey transition-colors hover:bg-kh-band-soft hover:text-kh-ink ${
              kannZurueck ? '' : 'invisible'
            }`}
          >
            <ArrowLeft className="size-5" strokeWidth={1.75} />
          </button>

          <Rail fortschritt={fortschritt} onOeffnen={() => setWegOffen(true)} />

          <span className="min-w-0 flex-1" />

          {skipSichtbar && (
            <button
              type="button"
              onClick={starteKarriereSkip}
              data-testid="karriere-skip"
              className="flex h-11 shrink-0 items-center gap-0.5 rounded-kh px-3 text-[15px] text-kh-grey/80 transition-colors hover:text-kh-orange"
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
    <header className="order-1 shrink-0 border-b border-kh-rule bg-kh-band-soft">
      <button
        type="button"
        onClick={beendeKarriereSkip}
        data-testid="zurueck-zum-tag"
        className="flex h-14 w-full items-center gap-1 px-3 text-left text-[16px] text-kh-grey transition-colors hover:text-kh-orange"
      >
        <ChevronLeft className="size-5 shrink-0" strokeWidth={1.75} />
        <span className="truncate">
          Zurück zu deinem Tag
          <span className="text-kh-grey/60"> — {STEPS[ziel].titel}</span>
        </span>
      </button>
    </header>
  )
}
