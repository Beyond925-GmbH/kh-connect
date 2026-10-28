import { useState } from 'react'
import { ArrowDown, ArrowLeft, ArrowUpRight, Check, ChevronRight } from 'lucide-react'
import { StepFoto } from '@/khpl/buehne/Foto'
import { Rueckmeldung } from '@/khpl/komponenten/Rueckmeldung'
import { Wahlflaeche } from '@/khpl/komponenten/Wahlflaeche'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { merkeAntwort, useFortschritt } from '@/khpl/store/fortschritt'

const BEFEHLE = [
  {
    id: 'anlegen',
    text: 'Heranfahren',
    icon: ArrowDown,
    hilfe: 'Fahre zuerst an das Metall heran. Der markierte Pfeil zeigt die Richtung.',
  },
  {
    id: 'schneiden',
    text: 'Schneiden',
    icon: ArrowLeft,
    hilfe:
      'Jetzt liegt das Werkzeug am Metall. Fahre daran entlang und nimm einen Span ab.',
  },
  {
    id: 'wegfahren',
    text: 'Wegfahren',
    icon: ArrowUpRight,
    hilfe: 'Der Schnitt ist fertig. Fahre das Werkzeug vom Teil weg.',
  },
] as const
const ANORDNUNG = [1, 2, 0]

export function Z3() {
  const alt = useFortschritt().answers.z3
  const [anzahl, setAnzahl] = useState(alt?.gefunden ? 3 : 0)
  const [versuche, setVersuche] = useState(alt?.versuche ?? 0)
  const [fehler, setFehler] = useState(false)
  const fertig = anzahl === 3
  function waehle(i: number) {
    if (fertig) return
    const n = versuche + 1
    setVersuche(n)
    const ok = i === anzahl
    setFehler(!ok)
    const neu = ok ? anzahl + 1 : anzahl
    setAnzahl(neu)
    merkeAntwort('z3', {
      gesehen: BEFEHLE.slice(0, neu).map((b) => b.id),
      gefunden: neu === 3,
      versuche: n,
    })
  }
  const position = [
    [265, 35],
    [265, 80],
    [85, 80],
    [85, 25],
  ][anzahl]
  return (
    <StepShell
      id="Z3"
      auftrag={
        fertig ? null : fehler ? (
          <span role="status" className="text-kh-orange">
            {BEFEHLE[anzahl].hilfe}
          </span>
        ) : (
          'Steuere das Werkzeug.'
        )
      }
      ansage={null}
      interaktionOffen={!fertig}
      buehne={<StepFoto id="Z3" />}
      interaktion={
        <div className="flex flex-col gap-2">
          <ol
            aria-label="Reihenfolge der Bewegungen"
            className="grid grid-cols-3 gap-7 sm:gap-10"
          >
            {BEFEHLE.map((befehl, i) => {
              const gesetzt = i < anzahl
              const aktuell = i === anzahl
              const Icon = befehl.icon
              return (
                <li
                  key={befehl.id}
                  aria-current={aktuell ? 'step' : undefined}
                  aria-label={`Schritt ${i + 1}: ${gesetzt ? befehl.text : aktuell ? 'Jetzt eine Bewegung wählen' : 'Noch offen'}`}
                  className="relative min-w-0"
                  data-testid={`z3-platz-${i}`}
                >
                  <div
                    className={`relative flex h-20 min-w-0 w-full flex-col items-center justify-center gap-1 rounded-kh border-2 max-sm:h-20 ${gesetzt ? 'border-kh-signal/60 bg-kh-signal/10 text-kh-signal' : aktuell ? 'border-dashed border-kh-orange bg-kh-orange/10 text-kh-orange' : 'border-dashed border-white/20 text-kh-mute/50'}`}
                  >
                    {gesetzt && (
                      <span
                        aria-hidden
                        className={`absolute left-2 top-1 text-xs font-semibold ${gesetzt ? 'text-kh-signal' : aktuell ? 'text-kh-orange' : 'text-kh-mute'}`}
                      >
                        {i + 1}
                      </span>
                    )}
                    {gesetzt ? (
                      <>
                        <Icon className="size-7" aria-hidden />
                        <span className="text-sm font-medium">{befehl.text}</span>
                      </>
                    ) : (
                      <span aria-hidden className="font-display text-3xl">
                        {i + 1}
                      </span>
                    )}
                  </div>
                  {i < 2 && (
                    <ChevronRight
                      className={`absolute -right-[22px] top-1/2 size-4 -translate-y-1/2 sm:-right-[30px] sm:size-5 ${gesetzt ? 'text-kh-signal' : 'text-kh-mute/60'}`}
                      aria-hidden
                    />
                  )}
                </li>
              )
            })}
          </ol>
          <svg
            viewBox="0 0 350 180"
            className="max-h-40 w-full rounded-kh bg-black/30 max-sm:max-h-36"
            role="img"
            aria-label={
              fertig
                ? 'Das Werkzeug hat einen geraden Span abgetragen und ist vom Teil weggefahren.'
                : `Werkzeugweg: ${anzahl} von drei Bewegungen ausgeführt.`
            }
          >
            <rect x="25" y="65" width="48" height="88" rx="6" fill="#67707a" />
            <path
              d={anzahl >= 2 ? 'M73 88H275V135H73Z' : 'M73 80H275V143H73Z'}
              fill="#b9c3cd"
            />
            <path d="M85 88H275" stroke="#b8e561" strokeWidth="4" />
            {!fertig && (
              <path
                d={
                  anzahl === 0
                    ? 'M265 35V72l-7-9m7 9 7-9'
                    : anzahl === 1
                      ? 'M265 65H92l9-7m-9 7 9 7'
                      : 'M85 72V26l-7 9m7-9 7 9'
                }
                fill="none"
                stroke="#eeb36c"
                strokeWidth="3"
                strokeDasharray="6 3"
              />
            )}
            <path
              d={`M${position[0] - 12} ${position[1] - 25}h24l-12 25Z`}
              fill="#f8b24f"
              stroke="#ffe3b9"
              strokeWidth="2"
            />
            <text
              x="175"
              y="168"
              textAnchor="middle"
              fill="#e7ebee"
              fontSize="15"
              fontWeight="600"
            >
              {anzahl >= 2
                ? 'Die Oberfläche ist abgedreht.'
                : 'Deine Stange dreht sich in der Maschine.'}
            </text>
          </svg>
          <div className="grid grid-cols-3 gap-2">
            {ANORDNUNG.map((i) => {
              const b = BEFEHLE[i]
              const Icon = i < anzahl ? Check : b.icon
              return (
                <Wahlflaeche
                  key={b.id}
                  disabled={i < anzahl || fertig}
                  onClick={() => waehle(i)}
                  data-testid={`z3-befehl-${i}`}
                  className={`min-h-20 flex-col justify-center px-2 ${fehler && i === anzahl ? 'ring-2 ring-kh-signal' : ''}`}
                >
                  <Icon className="size-8" aria-hidden />
                  <span className="text-center text-sm">{b.text}</span>
                </Wahlflaeche>
              )
            })}
          </div>
          <Rueckmeldung
            ok={fertig ? true : null}
            text={
              fertig
                ? 'Dein Werkzeugweg ist fertig. So wird aus Bewegungen ein Programm.'
                : null
            }
          />
          <p className="sr-only" aria-live="polite">
            {fertig ? 'Alle 3 Bewegungen ausgeführt.' : `Schritt ${anzahl + 1} von 3`}
          </p>
        </div>
      }
      fuss={
        <StepFuss
          id="Z3"
          uebungOffen={!fertig}
          geschafft={fertig ? 'Werkzeugweg gesteuert' : null}
        />
      }
    />
  )
}
