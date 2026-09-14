import { lazy, Suspense, useState } from 'react'
import { Check, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dachstuhl3DFallback } from '@/khpl/buehne/Dachstuhl3DFallback'
import { StepShell } from '@/khpl/shell/StepShell'
import { useSchmal } from '@/khpl/shell/schmal'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { merkeAntwort, useFortschritt } from '@/khpl/store/fortschritt'
import { WANDSCHICHTEN, gueltigerAufbau, type WandschichtId } from './materialien'
const Wandelement3D = lazy(() => import('@/khpl/buehne/zimmerer/Wandelement3D'))
const KARTENFOLGE = ['holzfaser', 'innen', 'fassade', 'daemmung', 'dampfbremse']

export function C3() {
  const schmal = useSchmal()
  const gespeichert = useFortschritt().answers.c3
  const [gelegt, setGelegt] = useState<WandschichtId[]>(() =>
    gueltigerAufbau(gespeichert?.gelegt ?? []),
  )
  const [versuche, setVersuche] = useState(gespeichert?.versuche ?? 0)
  const [meldung, setMeldung] = useState('')
  const [fehler, setFehler] = useState(false)
  const [erkunden, setErkunden] = useState(false)
  const [abstand, setAbstand] = useState(0)
  const [winkel, setWinkel] = useState(0)
  const [auswahl, setAuswahl] = useState<WandschichtId | null>(null)
  const fertig = gelegt.length === WANDSCHICHTEN.length
  const ausgewaehlt = WANDSCHICHTEN.find((s) => s.id === auswahl)
  const legen = (id: WandschichtId) => {
    if (fertig || gelegt.includes(id)) return
    const dran = WANDSCHICHTEN[gelegt.length]
    if (id !== dran.id) {
      const n = versuche + 1
      setVersuche(n)
      setFehler(true)
      setMeldung(`Noch nicht. ${dran.hinweis}`)
      merkeAntwort('c3', { gelegt, fertig: false, versuche: n })
      return
    }
    const neu = [...gelegt, id]
    setGelegt(neu)
    setFehler(false)
    setMeldung(`${dran.name} eingebaut.`)
    merkeAntwort('c3', {
      gelegt: neu,
      fertig: neu.length === WANDSCHICHTEN.length,
      versuche,
    })
  }
  const ansichtZurueck = () => {
    setAbstand(0)
    setWinkel(0)
    setAuswahl(null)
  }
  const neuBauen = () => {
    setGelegt([])
    setMeldung('')
    setFehler(false)
    setErkunden(false)
    ansichtZurueck()
    merkeAntwort('c3', { gelegt: [], fertig: false, versuche })
  }
  return (
    <StepShell
      id="C3"
      auftrag={
        fertig || meldung || erkunden ? null : 'Baue die Wand vom Zimmer nach draußen.'
      }
      ansage={null}
      buehneInteraktiv
      interaktionOffen={!fertig}
      buehne={
        <Suspense fallback={<Dachstuhl3DFallback text="Die Wand liegt bereit" />}>
          <Wandelement3D
            zustand="schichten"
            schichten={gelegt.length}
            schichtAbstand={abstand}
            schichtWinkel={winkel}
            ausgewaehlteSchicht={auswahl}
            onSchicht={erkunden ? setAuswahl : undefined}
            onSchichtDrehen={erkunden ? setWinkel : undefined}
          />
        </Suspense>
      }
      warum={
        <p>
          Eine Beispielwand aus fünf Teilen. Die Platten, die Folie und die Dämmung haben
          verschiedene Aufgaben.
        </p>
      }
      interaktion={
        <div className="flex flex-col gap-3">
          <p
            role="status"
            aria-live="polite"
            className={
              !erkunden && (meldung || fertig)
                ? `text-[1rem] leading-snug ${fehler ? 'text-kh-paper' : 'text-kh-signal'}`
                : 'sr-only'
            }
          >
            {meldung || (fertig ? 'Deine Wand ist aufgebaut.' : '')}
          </p>
          {!fertig && !erkunden && (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {KARTENFOLGE.map((id) => {
                const s = WANDSCHICHTEN.find((x) => x.id === id)!
                const liegt = gelegt.includes(s.id)
                return (
                  <button
                    type="button"
                    key={id}
                    onClick={() => legen(s.id)}
                    disabled={liegt}
                    data-testid={`c3-material-${id}`}
                    className={`flex min-h-[48px] items-center gap-3 rounded-kh border-2 p-1.5 text-left sm:block sm:p-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-kh-signal ${liegt ? 'border-kh-signal/50 opacity-50' : 'border-kh-line bg-white/5'}`}
                  >
                    <Materialprobe id={s.id} farbe={s.farbe} />
                    <span className="flex min-h-7 items-center gap-1 text-[1rem] font-semibold sm:mt-2">
                      {liegt && <Check className="size-4 shrink-0" />}
                      {s.name}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              aria-expanded={erkunden}
              onClick={() => {
                setErkunden(!erkunden)
                if (erkunden) ansichtZurueck()
                else setAbstand(0.8)
              }}
              className="min-h-[44px] w-fit text-left text-[1rem] underline underline-offset-4"
              data-testid="c3-erkunden"
            >
              {erkunden ? 'Erkundung schließen' : 'Die Wand erkunden'}
            </button>
            {erkunden && (
              <Button
                variant="leise"
                onClick={ansichtZurueck}
                aria-label="Ansicht zurücksetzen"
                title="Ansicht zurücksetzen"
                className="ml-auto min-h-[44px] min-w-[44px] px-2"
              >
                <RotateCcw className="size-5" />
              </Button>
            )}
            <span
              className="shrink-0 text-[1rem] font-semibold text-kh-signal"
              aria-label={`${gelegt.length} von 5 Schichten eingebaut`}
            >
              {gelegt.length} / 5
            </span>
          </div>
          {erkunden && (
            <div
              className="flex flex-col gap-2 rounded-kh border border-kh-line p-2 sm:gap-3 sm:p-3"
              data-testid="c3-erkundung"
            >
              <label className="text-[1rem]">
                Schichten auseinanderziehen
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={abstand}
                  onChange={(e) => setAbstand(Number(e.target.value))}
                  className="kh-regler w-full sm:mt-2"
                />
              </label>
              <label className="text-[1rem]">
                Ansicht drehen
                <input
                  type="range"
                  min="-180"
                  max="180"
                  step="1"
                  value={Math.round((winkel * 180) / Math.PI)}
                  onChange={(e) => setWinkel((Number(e.target.value) * Math.PI) / 180)}
                  className="kh-regler w-full sm:mt-2"
                />
              </label>
              {schmal ? (
                <label className="text-[1rem]">
                  Schicht ansehen
                  <select
                    value={auswahl ?? ''}
                    onChange={(e) =>
                      setAuswahl(
                        WANDSCHICHTEN.find((s) => s.id === e.target.value)?.id ?? null,
                      )
                    }
                    className="mt-1 min-h-[44px] w-full rounded-kh border border-kh-line bg-kh-ink px-3 text-[1rem] text-kh-paper"
                  >
                    <option value="">Schicht auswählen</option>
                    {WANDSCHICHTEN.filter((s) => gelegt.includes(s.id)).map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {WANDSCHICHTEN.filter((s) => gelegt.includes(s.id)).map((s) => (
                    <button
                      type="button"
                      key={s.id}
                      onClick={() => setAuswahl(s.id)}
                      aria-pressed={auswahl === s.id}
                      className={`min-h-[44px] rounded-kh border px-3 py-2 text-[0.9375rem] ${auswahl === s.id ? 'border-kh-signal text-kh-signal' : 'border-kh-line'}`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              )}
              <p role="status" className="text-[1rem] leading-snug">
                {ausgewaehlt
                  ? `${ausgewaehlt.fachwort}: ${ausgewaehlt.zweck}`
                  : gelegt.length
                    ? 'Wähle eine Schicht im Modell oder in der Auswahl.'
                    : 'Baue zuerst ein Teil ein. Danach kannst du es hier untersuchen.'}
              </p>
            </div>
          )}
          {fertig && !erkunden && (
            <Button variant="leise" onClick={neuBauen} data-testid="c3-neu-bauen">
              Noch einmal bauen
            </Button>
          )}
        </div>
      }
      fuss={
        <StepFuss
          id="C3"
          uebungOffen={!fertig}
          geschafft={fertig ? 'Wand aufgebaut' : null}
        />
      }
    />
  )
}

function Materialprobe({ id, farbe }: { id: WandschichtId; farbe: string }) {
  return (
    <svg
      viewBox="0 0 160 55"
      className="h-8 w-16 shrink-0 rounded sm:h-12 sm:w-full"
      aria-hidden
    >
      <rect width="160" height="55" rx="5" fill={farbe} />
      {id === 'fassade' &&
        [20, 40, 60, 80, 100, 120, 140].map((x) => (
          <path key={x} d={`M${x} 0v55`} stroke="#67482D" strokeWidth="2" />
        ))}
      {id === 'dampfbremse' && (
        <>
          <path d="M0 38L160 12M0 45L160 19" stroke="#D1E1E3" strokeWidth="3" />
          <path d="M120 0v55" stroke="#466C78" strokeWidth="8" />
        </>
      )}
      {id === 'daemmung' && (
        <>
          <path d="M25 0v55M135 0v55" stroke="#9F733D" strokeWidth="12" />
          {[12, 25, 38].map((y) => (
            <path
              key={y}
              d={`M35 ${y}q12 -12 24 0t24 0t24 0`}
              fill="none"
              stroke="#B39B64"
              strokeWidth="3"
            />
          ))}
        </>
      )}
      {id === 'holzfaser' &&
        [8, 20, 32, 44].map((y) => (
          <path
            key={y}
            d={`M10 ${y}l30 4m9 -7l42 5m8 -3l44 5`}
            stroke="#825F30"
            strokeWidth="2"
          />
        ))}
      {id === 'innen' && (
        <path d="M12 12h136v31H12z" fill="none" stroke="#F8F5EC" strokeWidth="3" />
      )}
    </svg>
  )
}
