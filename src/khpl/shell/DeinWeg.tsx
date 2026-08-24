import { Dialog as BaseDialog } from '@base-ui/react/dialog'
import { ArrowRight, Check, X } from 'lucide-react'
import { railIndex, step, type StepGraph, type StepId } from '@/khpl/flow/steps'
import { wegzustand, type Wegzustand } from '@/khpl/flow/uebergaenge'
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
 * **Warum es jetzt eine Zeitachse mit Nummern ist.** Die Vorfassung setzte
 * siebzehn gleich aussehende Zeilen untereinander: gelaufene in Weiß,
 * kommende in Grau, davor je ein Kringel. Neun graue Zeilen hintereinander
 * lesen sich nicht als „das kommt noch“, sondern als „das ist kaputt“ — und
 * die Leiste sagt „4 / 10“, während in der Liste nichts nummeriert ist.
 * Niemand konnte ein Segment der Rail einer Zeile zuordnen.
 *
 * Deshalb:
 *
 *  - **Nummern.** Die Hauptschritte tragen 1…n, dieselbe Zählung wie die
 *    Rail. Das Sheet und die Leiste sprechen damit dieselbe Sprache.
 *  - **Eine durchgehende Achse.** Ein Strang läuft durch alle Zeilen; er ist
 *    orange, so weit man gekommen ist, und danach eine leere Kerbe. Der
 *    Zustand hängt an der Achse und am Knoten — die Beschriftung bleibt
 *    lesbar, statt weggedimmt zu werden.
 *  - **Abstecher zweigen ab.** Sie hängen an einem kurzen Ausleger neben der
 *    Achse. Der `↳`-Pfeil und der zweite Einzugsstrich der Vorfassung sagten
 *    dasselbe dreimal.
 *  - **Ein nicht genommener Abstecher ist ein Angebot, kein Mangel.** Statt
 *    fünfmal „nicht angeschaut“ in Grau steht dort einmal „noch offen“ in
 *    Orange — dieselbe Information, andere Aussage.
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

/**
 * Eine Zeile der Achse. `nummer` trägt die Rail-Zählung; Abstecher bekommen
 * keine, weil sie in der Rail kein Segment haben (ui-shell 4).
 *
 * `bahn` ist der Hauptschritt, unter dem die Zeile hängt — bei Hauptschritten
 * sie selbst. Daran hängt die Farbe der Achse: ein nicht genommener Abstecher
 * darf den Strang nicht unterbrechen, obwohl er selbst „offen“ ist.
 */
interface Achsenzeile {
  id: StepId
  nummer: number | null
  abstecher: boolean
  bahnErreicht: boolean
}

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

  const zeilen: Achsenzeile[] = []
  for (const [i, haupt] of graph.haupt.entries()) {
    const bahnErreicht = wegzustand(graph, haupt.id, fortschritt) !== 'offen'
    zeilen.push({ id: haupt.id, nummer: i + 1, abstecher: false, bahnErreicht })
    for (const a of haupt.abstecher) {
      zeilen.push({ id: a, nummer: null, abstecher: true, bahnErreicht })
    }
  }

  const jetzt = railIndex(graph, fortschritt.currentStepId) + 1

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
              Orange neben dem, das im Sheet schon die Knoten setzt. */}
          <div aria-hidden className="kh-warnband h-1.5 shrink-0" />
          <header className="flex shrink-0 items-center gap-3 border-b border-kh-line px-5 py-3">
            <div className="min-w-0 flex-1">
              <BaseDialog.Title className="kh-titel-klein">Dein Weg</BaseDialog.Title>
              {aktiv && (
                <p className="mt-0.5 truncate text-[0.9375rem] text-kh-mute">
                  {/* `kurz`, nicht `name`: „als Dachdecker/Dachdeckerin“ ist
                      die Berufsbezeichnung aus der Ausbildungsordnung und in
                      einer Kopfzeile schlicht zu lang. */}
                  {aktiv.kurz} · Schritt {jetzt} von {graph.haupt.length}
                </p>
              )}
            </div>
            {/*
              Der Wechsel gehört in den Kopf, obwohl das Angebot unten steht.

              Die Achse ist siebzehn Zeilen lang; alles unter ihr ist auf einem
              Step am Anfang des Tages unsichtbar, und ein Angebot, das man
              erst erscrollen muss, ist am Messestand keins. Er ist hier
              allerdings **Text und kein Knopf** — zwei gleich große weiße
              Pillen neben einer kleinen Überschrift ließen den Kopf so
              aussehen, als sei das Wechseln die Hauptsache des Sheets.
            */}
            <button
              type="button"
              data-testid="weg-wechseln"
              onClick={onAlleBerufe}
              className="flex h-12 shrink-0 items-center gap-1 rounded-kh-pill px-3 text-[0.9375rem] font-semibold text-kh-paper/70 transition-transform active:scale-95 active:text-kh-paper"
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
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain" data-scroll>
            <ol className="px-4 py-3">
              {zeilen.map((zeile, i) => (
                <Zeile
                  key={zeile.id}
                  zeile={zeile}
                  graph={graph}
                  fortschritt={fortschritt}
                  achseOben={i > 0 && zeile.bahnErreicht}
                  achseUnten={i < zeilen.length - 1 ? zeilen[i + 1].bahnErreicht : null}
                  onSpringe={onSpringe}
                  onSchliessen={onSchliessen}
                />
              ))}
            </ol>

            {/*
              Die anderen Berufe. Bewusst unter der Achse und nicht darüber:
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

/** Die Achse liegt hinter den Knoten; 25 px = Mitte eines 36-px-Knotens bei `px-2`. */
const ACHSE_X = 'left-[25px]'

function Zeile({
  zeile,
  graph,
  fortschritt,
  achseOben,
  achseUnten,
  onSpringe,
  onSchliessen,
}: {
  zeile: Achsenzeile
  graph: StepGraph
  fortschritt: Fortschritt
  /** Ist das Stück Achse über dieser Zeile schon gelaufen? */
  achseOben: boolean
  /** …und das darunter? `null` = letzte Zeile, kein Stück mehr. */
  achseUnten: boolean | null
  onSpringe: (ziel: StepId) => void
  onSchliessen: () => void
}) {
  const zustand = wegzustand(graph, zeile.id, fortschritt)
  const def = step(graph, zeile.id)
  const antippbar = zustand === 'besucht'
  const nichtGenommen = zeile.abstecher && zustand === 'offen'

  const inhalt = (
    <>
      {/* Die Achse. Sie läuft hinter dem Knoten durch, deshalb zwei Hälften:
          so kann das Stück über einer Zeile schon orange sein, während das
          darunter noch leer ist. */}
      {achseOben && (
        <span
          aria-hidden
          className={`absolute ${ACHSE_X} top-0 h-1/2 w-[2px] bg-kh-orange/55`}
        />
      )}
      {achseUnten !== null && (
        <span
          aria-hidden
          className={`absolute ${ACHSE_X} top-1/2 h-1/2 w-[2px] ${
            achseUnten ? 'bg-kh-orange/55' : 'bg-white/12'
          }`}
        />
      )}
      {zeile.abstecher ? (
        <>
          {/* Der Ausleger: von der Achse waagerecht zum Abstecher-Knoten. */}
          <span
            aria-hidden
            className={`absolute ${ACHSE_X} top-1/2 h-[2px] w-7 ${
              zustand === 'offen' ? 'bg-white/12' : 'bg-kh-orange/55'
            }`}
          />
          <span className="ml-7 grid size-6 shrink-0 place-items-center" aria-hidden>
            {zustand === 'besucht' ? (
              <span className="grid size-6 place-items-center rounded-full bg-kh-orange text-[#0E0D0B]">
                <Check className="size-3.5" strokeWidth={3.5} />
              </span>
            ) : zustand === 'aktuell' ? (
              <span className="size-3.5 rounded-full bg-kh-signal ring-4 ring-kh-signal/25" />
            ) : (
              // Orange nur, wo der Abstecher auch erreichbar ist. Unter einem
              // Hauptschritt, der noch kommt, wäre ein oranger Ring ein
              // Angebot, das man nicht annehmen kann.
              <span
                className={`size-3 rounded-full border-2 bg-kh-surface ${
                  zeile.bahnErreicht ? 'border-kh-orange/50' : 'border-white/20'
                }`}
              />
            )}
          </span>
        </>
      ) : (
        <Knoten nummer={zeile.nummer} zustand={zustand} />
      )}

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
      <span
        className={`min-w-0 flex-1 truncate text-left ${
          zustand === 'offen' ? 'text-kh-paper/55' : 'text-kh-paper'
        } ${zeile.abstecher ? 'text-[1rem]' : ''}`}
      >
        {zustand === 'offen' ? def.kurz : def.titel}
      </span>

      {zustand === 'aktuell' && (
        <span className="shrink-0 rounded-kh-pill bg-kh-signal px-2.5 py-1 text-[0.8125rem] font-bold whitespace-nowrap text-[#0E0D0B] uppercase">
          du bist hier
        </span>
      )}
      {nichtGenommen && (
        <span
          className={`shrink-0 rounded-kh-pill border px-2 py-0.5 text-[0.8125rem] whitespace-nowrap ${
            zeile.bahnErreicht
              ? 'border-kh-orange/45 text-kh-orange/85'
              : 'border-white/15 text-kh-mute/60'
          }`}
        >
          noch offen
        </span>
      )}
    </>
  )

  const basis =
    'relative flex w-full items-center gap-3 rounded-kh px-2 py-1.5 text-[1.0625rem] min-h-[52px] transition-colors'

  return (
    <li className="relative">
      {antippbar ? (
        <button
          type="button"
          data-testid={`weg-${zeile.id}`}
          data-zustand={zustand}
          onClick={() => {
            onSpringe(zeile.id)
            onSchliessen()
          }}
          className={`${basis} cursor-pointer active:scale-[0.98] active:bg-white/8`}
        >
          {inhalt}
        </button>
      ) : (
        <div
          data-testid={`weg-${zeile.id}`}
          data-zustand={zustand}
          className={`${basis} ${zustand === 'aktuell' ? 'font-semibold' : ''}`}
          aria-current={zustand === 'aktuell' ? 'step' : undefined}
        >
          {inhalt}
        </div>
      )}
    </li>
  )
}

/**
 * Der Knoten eines Hauptschritts — und der Grund, warum das Sheet und die Rail
 * jetzt dieselbe Zählung zeigen. Die Nummer steht **im** Knoten: sie ist
 * dadurch Teil der Achse und braucht keine eigene Spalte.
 */
function Knoten({ nummer, zustand }: { nummer: number | null; zustand: Wegzustand }) {
  const stil =
    zustand === 'besucht'
      ? 'bg-kh-orange text-[#0E0D0B]'
      : zustand === 'aktuell'
        ? 'bg-kh-signal text-[#0E0D0B] ring-4 ring-kh-signal/20'
        : 'border-2 border-white/18 bg-kh-surface text-kh-mute/70'

  return (
    <span
      aria-hidden
      className={`relative grid size-9 shrink-0 place-items-center rounded-full font-display text-[0.9375rem] tabular-nums ${stil}`}
    >
      {nummer}
    </span>
  )
}
