import { lazy, Suspense, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dachstuhl3DFallback } from '@/khpl/buehne/Dachstuhl3DFallback'
import {
  ACHSMASS_CM,
  ACHSMASS_MIN_CM,
  ACHSMASS_MAX_CM,
} from '@/khpl/buehne/zimmerer/kanon'
import { StepShell } from '@/khpl/shell/StepShell'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { merkeAntwort, useFortschritt } from '@/khpl/store/fortschritt'
const Wandelement3D = lazy(() => import('@/khpl/buehne/zimmerer/Wandelement3D'))
export function C2() {
  const gespeichert = useFortschritt().answers.c2
  const [fertig, setFertig] = useState(!!gespeichert?.aufgeloest)
  const [wert, setWert] = useState(
    gespeichert?.aufgeloest
      ? ACHSMASS_CM
      : (gespeichert?.schaetzung ?? ACHSMASS_MIN_CM + 5),
  )
  const [versuche, setVersuche] = useState(0)
  const [meldung, setMeldung] = useState('')
  const pruefen = () => {
    if (Math.abs(wert - ACHSMASS_CM) <= 1.5) {
      setFertig(true)
      setWert(ACHSMASS_CM)
      setMeldung('Passt. Die Plattenkante liegt auf dem Holz.')
      merkeAntwort('c2', { schaetzung: wert, aufgeloest: true })
    } else {
      setVersuche(versuche + 1)
      setMeldung(
        wert < ACHSMASS_CM
          ? 'Noch etwas nach rechts. Das Holz soll direkt unter der hellen Plattenkante liegen.'
          : 'Noch etwas nach links. Das Holz soll direkt unter der hellen Plattenkante liegen.',
      )
      merkeAntwort('c2', { schaetzung: wert, aufgeloest: false })
    }
  }
  return (
    <StepShell
      id="C2"
      auftrag={fertig ? null : 'Schiebe dein Holz unter die Plattenkante.'}
      ansage={null}
      buehneInteraktiv
      interaktionOffen={!fertig}
      buehne={
        <Suspense fallback={<Dachstuhl3DFallback text="Die Platte liegt bereit" />}>
          <Wandelement3D zustand="staenderwerk" achsmassCm={wert} aufgeloest={fertig} />
        </Suspense>
      }
      warum={
        <p>
          Die Kante einer Wandplatte braucht Holz darunter. So lässt sich die Platte
          festschrauben.
        </p>
      }
      interaktion={
        <div className="flex flex-col gap-3">
          {!fertig && (
            <label className="text-[1rem]">
              Dein Holz verschieben
              <input
                type="range"
                min={ACHSMASS_MIN_CM}
                max={ACHSMASS_MAX_CM}
                step={0.5}
                value={wert}
                onChange={(e) => setWert(Number(e.target.value))}
                aria-valuetext={`${Math.round(wert)} Zentimeter Abstand`}
                className="kh-regler mt-3 w-full"
                data-testid="c2-regler"
              />
            </label>
          )}
          <p
            role="status"
            className={`text-[1.0625rem] leading-snug ${fertig ? 'text-kh-signal' : 'text-kh-paper'}`}
          >
            {meldung ||
              (fertig
                ? 'Dein Holz trägt die Plattenkante.'
                : 'Beobachte im Modell, wie das Holz deinem Regler folgt.')}
          </p>
          {!fertig && versuche >= 2 && (
            <Button
              variant="leise"
              onClick={() => {
                setWert(ACHSMASS_CM)
                setMeldung('Hier liegt die Kante auf. Prüfe jetzt die Position.')
              }}
              data-testid="c2-hilfe"
            >
              Passende Position zeigen
            </Button>
          )}
        </div>
      }
      fuss={
        <StepFuss
          id="C2"
          uebungOffen={!fertig}
          geschafft={fertig ? 'Platte passt' : null}
          aktion={
            !fertig ? (
              <Button variant="aktion" onClick={pruefen} data-testid="c2-aufloesen">
                Position prüfen
              </Button>
            ) : null
          }
        />
      }
    />
  )
}
