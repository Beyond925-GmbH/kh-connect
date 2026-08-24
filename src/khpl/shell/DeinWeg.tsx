import { Dialog as BaseDialog } from '@base-ui/react/dialog'
import { ArrowRight, Check, CornerDownRight, X } from 'lucide-react'
import { step, type StepGraph, type StepId } from '@/khpl/flow/steps'
import { wegzustand } from '@/khpl/flow/uebergaenge'
import { BERUFE } from '@/khpl/berufe/registry'
import type { BerufId } from '@/khpl/berufe/typen'
import type { Fortschritt } from '@/khpl/store/fortschritt'

/**
 * S3 „Dein Weg“ (khpl-ui-shell.md 4) — die Antwort auf „Was habe ich bisher
 * gemacht?“, und seit den vier Berufen auch auf „was gibt es sonst noch?“.
 *
 * Die ganze Hauptlinie als Liste, Abstecher eingerückt unter ihrem
 * Elternschritt. ✓ ist antippbar (Nachlesen, Interaktion wiederholen), ● ist
 * die aktuelle Stelle, ○ ist sichtbar aber gesperrt — **nach vorne springt
 * niemand**, sonst bricht das Paar `Teach:` (M5) → `Abfrage:` (M7).
 *
 * Nicht genommene Abstecher bleiben sichtbar. Sie zeigen, was es noch zu holen
 * gäbe, ohne dass ein Schritt „unvollständig“ wirkt.
 *
 * **Warum der Berufswechsel hier sitzt und nicht in der Leiste.** Das Sheet
 * ist der Ort, an dem die App „wo bin ich“ beantwortet; „wo könnte ich sonst
 * sein“ ist dieselbe Frage einen Schritt weiter. Ein eigener Knopf in der
 * Leiste hätte daneben gestanden — und in der Leiste ist hochkant kein Platz
 * mehr: 60 px Zurück, die Rail, der Karriere-Link.
 *
 * **Der Wechsel fragt nichts nach.** Er kann es sich leisten, weil der
 * Fortschritt je Beruf gespeichert wird (siehe `store/fortschritt.ts`): wer
 * den Zimmerer bei M5 verlässt, findet ihn bei M5 wieder. Eine Rückfrage vor
 * jedem Wechsel hieße, dass niemand wechselt — und dann wäre das Angebot von
 * vier Berufen eine Behauptung.
 */
export function DeinWeg({
  offen,
  graph,
  aktiverBeruf,
  besuchteBerufe,
  fortschritt,
  onSchliessen,
  onSpringe,
  onBeruf,
  onAlleBerufe,
}: {
  offen: boolean
  graph: StepGraph
  aktiverBeruf: BerufId | null
  besuchteBerufe: readonly BerufId[]
  fortschritt: Fortschritt
  onSchliessen: () => void
  onSpringe: (ziel: StepId) => void
  onBeruf: (ziel: BerufId) => void
  onAlleBerufe: () => void
}) {
  const aktiv = BERUFE.find((b) => b.id === aktiverBeruf) ?? null
  const andere = BERUFE.filter((b) => b.id !== aktiverBeruf)

  return (
    <BaseDialog.Root open={offen} onOpenChange={(auf) => !auf && onSchliessen()}>
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <BaseDialog.Popup
          data-testid="dein-weg"
          className="fixed inset-y-0 left-0 z-50 flex w-[min(30rem,92vw)] flex-col bg-kh-surface shadow-[0_0_80px_rgba(0,0,0,0.8)] outline-none transition-transform duration-250 data-[ending-style]:-translate-x-full data-[starting-style]:-translate-x-full"
        >
          {/* Das Warnband oben ist die einzige Stelle, an der das Sheet die
              Marke trägt — ein oranger Balken darüber wäre ein zweites
              Orange neben dem, das im Sheet schon die Häkchen macht. */}
          <div aria-hidden className="kh-warnband h-1.5 shrink-0" />
          <header className="flex shrink-0 items-start justify-between gap-3 border-b border-kh-line px-5 py-3">
            <div className="min-w-0">
              <BaseDialog.Title className="kh-titel-klein">Dein Weg</BaseDialog.Title>
              {aktiv && (
                <p className="mt-0.5 truncate text-[0.9375rem] text-kh-mute">
                  als {aktiv.name}
                </p>
              )}
            </div>
            {/*
              Der Wechsel gehört in den Kopf, obwohl das Angebot unten steht.

              Die Liste der Hauptschritte ist siebzehn Zeilen lang; alles unter
              ihr ist auf einem Step am Anfang des Tages unsichtbar, und ein
              Angebot, das man erst erscrollen muss, ist am Messestand keins.
              Der Chip hier führt auf die Berufsliste — den Screen, auf dem
              nebeneinander steht, was es gibt. Die Kurzwege unten bleiben für
              den, der ohnehin schon dort unten ist.
            */}
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                data-testid="weg-wechseln"
                onClick={onAlleBerufe}
                className="flex h-12 items-center gap-1 rounded-kh-pill bg-white/6 px-4 text-[0.9375rem] font-semibold text-kh-paper transition-transform active:scale-95"
              >
                Wechseln
                <ArrowRight className="size-4 text-kh-orange" strokeWidth={2.5} />
              </button>
              <BaseDialog.Close
                aria-label="Schließen"
                className="grid size-12 shrink-0 place-items-center rounded-kh-pill bg-white/6 text-kh-paper transition-transform active:scale-90"
              >
                <X className="size-5" strokeWidth={2.25} />
              </BaseDialog.Close>
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <ol className="px-4 py-2">
              {graph.haupt.map((haupt) => (
                <li key={haupt.id}>
                  <Zeile
                    id={haupt.id}
                    graph={graph}
                    fortschritt={fortschritt}
                    onSpringe={onSpringe}
                    onSchliessen={onSchliessen}
                  />
                  {haupt.abstecher.length > 0 && (
                    <ol className="mb-0.5 ml-7 border-l-2 border-kh-line pl-3">
                      {haupt.abstecher.map((id) => (
                        <li key={id}>
                          <Zeile
                            id={id}
                            graph={graph}
                            eingerueckt
                            fortschritt={fortschritt}
                            onSpringe={onSpringe}
                            onSchliessen={onSchliessen}
                          />
                        </li>
                      ))}
                    </ol>
                  )}
                </li>
              ))}
            </ol>

            {/*
              Die anderen Berufe. Bewusst unter der Liste und nicht darüber:
              wer das Sheet öffnet, will zuerst wissen, wo er steht. Das
              Angebot ist die Antwort auf die zweite Frage, nicht auf die
              erste.
            */}
            <section className="mt-2 border-t border-kh-line px-4 pt-4 pb-5">
              <h3 className="kh-etikett px-1">Andere Berufe</h3>
              <ul className="mt-2 flex flex-col gap-1">
                {andere.map((b) => {
                  const angefangen = besuchteBerufe.includes(b.id)
                  return (
                    <li key={b.id}>
                      <button
                        type="button"
                        data-testid={`weg-beruf-${b.id}`}
                        onClick={() => onBeruf(b.id)}
                        className="flex min-h-[56px] w-full items-center gap-3 rounded-kh px-3 py-2 text-left transition-transform active:scale-[0.98] active:bg-white/8"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[1.0625rem] font-semibold text-kh-paper/90">
                            {b.kurz}
                          </span>
                          <span className="block truncate text-[0.875rem] text-kh-mute">
                            {b.graph === null
                              ? 'Kommt bald'
                              : angefangen
                                ? 'Angefangen — da weitermachen'
                                : b.zeile}
                          </span>
                        </span>
                        {angefangen && (
                          <span
                            aria-hidden
                            className="grid size-6 shrink-0 place-items-center rounded-full bg-kh-orange text-[#0E0D0B]"
                          >
                            <Check className="size-4" strokeWidth={3.5} />
                          </span>
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>

              <button
                type="button"
                data-testid="weg-alle-berufe"
                onClick={onAlleBerufe}
                className="mt-2 flex min-h-[52px] w-full items-center justify-between gap-2 rounded-kh border-2 border-kh-line-strong px-4 text-[1rem] font-semibold text-kh-paper transition-transform active:scale-[0.98]"
              >
                Alle vier nebeneinander
                <ArrowRight
                  className="size-5 shrink-0 text-kh-orange"
                  strokeWidth={2.5}
                />
              </button>
            </section>
          </div>
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  )
}

function Zeile({
  id,
  graph,
  eingerueckt = false,
  fortschritt,
  onSpringe,
  onSchliessen,
}: {
  id: StepId
  graph: StepGraph
  eingerueckt?: boolean
  fortschritt: Fortschritt
  onSpringe: (ziel: StepId) => void
  onSchliessen: () => void
}) {
  const zustand = wegzustand(graph, id, fortschritt)
  const def = step(graph, id)
  const antippbar = zustand === 'besucht'
  const nichtGenommen = eingerueckt && zustand === 'offen'

  const inhalt = (
    <>
      <span className="grid size-6 shrink-0 place-items-center" aria-hidden>
        {eingerueckt && zustand === 'offen' ? (
          <CornerDownRight className="size-4 text-kh-mute/50" strokeWidth={2} />
        ) : zustand === 'besucht' ? (
          <span className="grid size-6 place-items-center rounded-full bg-kh-orange text-[#0E0D0B]">
            <Check className="size-4" strokeWidth={3.5} />
          </span>
        ) : zustand === 'aktuell' ? (
          <span className="size-3.5 rounded-full bg-kh-signal ring-4 ring-kh-signal/25" />
        ) : (
          <span className="size-2.5 rounded-full border-2 border-white/25" />
        )}
      </span>
      {/*
        Zwei Beschriftungen, je nach Zustand — und das ist der Punkt, an dem sich
        die beiden Abnahmen widersprochen haben.

        Wer den Screen gesehen hat, erinnert sich an seine Überschrift: „Was
        kostet dieses Dach?“. Ihm „Angebots-Kalkulation, Vertrag“ vorzusetzen,
        ist eine zweite Sprache, die er nie gelesen hat. Wer den Screen noch
        nicht gesehen hat, kann mit „Jetzt du“ dagegen nichts anfangen — da ist
        der beschreibende Board-Name richtig.

        Also: besucht und aktuell zeigen `titel`, gesperrt zeigt `kurz`.
      */}
      <span className="min-w-0 flex-1 truncate text-left">
        {zustand === 'offen' ? def.kurz : def.titel}
      </span>
      {zustand === 'aktuell' && (
        <span className="shrink-0 rounded-kh-pill bg-kh-signal px-2.5 py-1 text-[0.8125rem] font-bold whitespace-nowrap text-[#0E0D0B] uppercase">
          du bist hier
        </span>
      )}
      {nichtGenommen && (
        <span className="shrink-0 text-[0.875rem] whitespace-nowrap text-kh-mute/60">
          nicht angeschaut
        </span>
      )}
    </>
  )

  const basis =
    'flex w-full items-center gap-3 rounded-kh px-3 py-1.5 text-[1.0625rem] min-h-[52px] transition-colors'

  if (!antippbar) {
    return (
      <div
        data-testid={`weg-${id}`}
        data-zustand={zustand}
        className={`${basis} ${
          zustand === 'aktuell'
            ? 'bg-white/8 font-semibold text-kh-paper'
            : 'text-kh-mute/50'
        }`}
        aria-current={zustand === 'aktuell' ? 'step' : undefined}
      >
        {inhalt}
      </div>
    )
  }

  return (
    <button
      type="button"
      data-testid={`weg-${id}`}
      data-zustand={zustand}
      onClick={() => {
        onSpringe(id)
        onSchliessen()
      }}
      className={`${basis} cursor-pointer text-kh-paper/85 transition-transform active:scale-[0.98] active:bg-white/8`}
    >
      {inhalt}
    </button>
  )
}
