import { useState } from 'react'
import { StepFoto } from '@/khpl/buehne/Foto'
import { Rueckmeldung } from '@/khpl/komponenten/Rueckmeldung'
import { Wahlflaeche } from '@/khpl/komponenten/Wahlflaeche'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { merkeAntwort, useFortschritt } from '@/khpl/store/fortschritt'

const HALTER = [
  {
    id: 'schraubstock',
    name: 'Zwei gerade Backen',
    hilfe: 'Hier liegt die runde Stange nur an zwei Stellen an.',
  },
  { id: 'futter', name: 'Drei Backen rundherum', hilfe: '' },
  {
    id: 'pratzen',
    name: 'Klammern auf einer Platte',
    hilfe: 'Die Klammern halten eine Platte fest. Unsere Stange soll sich drehen.',
  },
] as const

export function Z2() {
  const gespeichert = useFortschritt().answers.z2
  const [fertig, setFertig] = useState(!!gespeichert?.gespannt)
  const [fehler, setFehler] = useState<string | null>(null)
  const [versuche, setVersuche] = useState(gespeichert?.versuche ?? 0)
  function waehle(id: string) {
    if (fertig) return
    const ok = id === 'futter'
    const n = versuche + 1
    setVersuche(n)
    setFertig(ok)
    setFehler(ok ? null : HALTER.find((h) => h.id === id)!.hilfe)
    merkeAntwort('z2', { gespannt: ok, versuche: n, schaetzung: 0, aufgeloest: ok })
  }
  return (
    <StepShell
      id="Z2"
      auftrag={fertig ? null : 'Wähle den Halter für die runde Stange.'}
      ansage={null}
      interaktionOffen={!fertig}
      buehne={<StepFoto id="Z2" />}
      interaktion={
        <div className="flex flex-col gap-3">
          <p className="text-kh-paper/80">
            Die Stange muss mittig sitzen, damit sie sich gleichmäßig drehen kann.
          </p>
          <div className="grid grid-cols-3 gap-2">
            {HALTER.map((h) => (
              <Wahlflaeche
                key={h.id}
                onClick={() => waehle(h.id)}
                disabled={fertig}
                gewaehlt={fertig && h.id === 'futter'}
                data-testid={`z2-spannmittel-${h.id}`}
                className={`min-h-[150px] flex-col justify-center px-2 ${fehler && h.id === 'futter' ? 'ring-2 ring-kh-signal' : ''}`}
              >
                <HalterBild art={h.id} />
                <span className="text-center text-[0.9375rem] leading-tight">
                  {h.name}
                </span>
              </Wahlflaeche>
            ))}
          </div>
          <Rueckmeldung
            ok={fertig ? true : fehler ? false : null}
            text={
              fertig
                ? 'Sitzt mittig! Die drei Backen halten die Stange von allen Seiten.'
                : fehler
            }
          />
          {fehler && (
            <p className="text-kh-signal">
              Tipp: Suche drei Backen, die rund um die Stange greifen.
            </p>
          )}
          {fertig && (
            <details className="kh-feld p-3">
              <summary className="min-h-11 cursor-pointer py-2">
                Wie heißt der Halter?
              </summary>
              <p>
                Das ist ein Dreibackenfutter. Es hält das runde Teil beim Drehen fest.
              </p>
            </details>
          )}
        </div>
      }
      fuss={
        <StepFuss
          id="Z2"
          uebungOffen={!fertig}
          geschafft={fertig ? 'Stange eingespannt' : null}
        />
      }
    />
  )
}

function HalterBild({ art }: { art: string }) {
  return (
    <svg viewBox="0 0 120 105" className="h-24 w-full" aria-hidden="true">
      {art === 'futter' ? (
        <>
          <circle
            cx="60"
            cy="52"
            r="45"
            fill="#3b4148"
            stroke="#acb4bd"
            strokeWidth="3"
          />
          {[0, 120, 240].map((r) => (
            <rect
              key={r}
              x="49"
              y="9"
              width="22"
              height="29"
              rx="3"
              fill="#e4e7eb"
              transform={`rotate(${r} 60 52)`}
            />
          ))}
        </>
      ) : art === 'schraubstock' ? (
        <>
          <rect x="9" y="14" width="25" height="75" rx="3" fill="#aeb6bf" />
          <rect x="86" y="14" width="25" height="75" rx="3" fill="#aeb6bf" />
        </>
      ) : (
        <>
          <rect x="8" y="70" width="104" height="20" rx="3" fill="#69727d" />
          <path
            d="M22 72V32H46M98 72V32H74"
            fill="none"
            stroke="#d2d7de"
            strokeWidth="12"
          />
        </>
      )}
      <circle cx="60" cy="52" r="20" fill="#dfad68" stroke="#ffe0ae" strokeWidth="3" />
      <circle cx="60" cy="52" r="3" fill="#483822" />
    </svg>
  )
}
