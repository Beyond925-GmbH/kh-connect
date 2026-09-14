import { lazy, Suspense, useState } from 'react'
import { RotateCw } from 'lucide-react'
import { Dachstuhl3DFallback } from '@/khpl/buehne/Dachstuhl3DFallback'
import { M5_SCHRITTE, M7_SCHRITTE, M7_START } from '@/khpl/buehne/aufbauabschnitte'
import { DachSchema } from '@/khpl/komponenten/DachSchema'
import { Wahlflaeche } from '@/khpl/komponenten/Wahlflaeche'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { merkeAntwort, useFortschritt } from '@/khpl/store/fortschritt'

const Dachstuhl3D = lazy(() => import('@/khpl/buehne/Dachstuhl3D'))
const NAMEN: Record<string, string> = {
  Fußpfetten: 'Balken auf der Mauer',
  Bundbalken: 'Querbalken',
  Stuhlschwellen: 'Hölzer unter den Stützen',
  Stuhlsäulen: 'Senkrechte Stützen',
  Mittelpfetten: 'Balken auf halber Höhe',
  Firstpfette: 'Balken an der Spitze',
  Kopfbänder: 'Schräge Verstrebungen',
  Sparrenpaare: 'Schräge Dachbalken',
  Kehlbalken: 'Obere Querbalken',
  Windrispenbänder: 'Stahlbänder',
  Konterlattung: 'Latten längs zum Dach',
  Dachlattung: 'Latten für die Ziegel',
}
const HINWEISE: Record<string, string> = {
  Fußpfetten: 'Beginne unten: Welche Balken können direkt auf der Mauer liegen?',
  Bundbalken: 'Verbinde jetzt die beiden Seiten des Hauses mit Querbalken.',
  Stuhlschwellen: 'Die senkrechten Stützen brauchen zuerst eine Unterlage.',
  Stuhlsäulen: 'Jetzt können die senkrechten Stützen aufgestellt werden.',
  Mittelpfetten: 'Lege die langen Balken auf die seitlichen Stützen.',
  Firstpfette: 'Oben fehlt noch der Balken unter der Dachspitze.',
  Kopfbänder: 'Schräge Hölzer stützen die Verbindungen zwischen Pfosten und Balken.',
  Sparrenpaare: 'Die Unterlage steht. Jetzt kommen die schrägen Dachbalken darauf.',
  Kehlbalken: 'Verbinde zuerst die gegenüberliegenden Dachbalken miteinander.',
  Windrispenbänder:
    'Die Stahlbänder sichern das Holzgerüst gegen seitliches Verschieben.',
  Konterlattung: 'Zuerst kommen die Latten längs auf die schrägen Dachbalken.',
  Dachlattung: 'Zum Schluss kommen die quer liegenden Latten für die Ziegel.',
}

/** Beide Spiele bauen dasselbe Dach weiter. Nur eine eigene Wahl setzt ein Teil. */
export function DachAufbauSpiel({ id }: { id: 'M5' | 'M7' }) {
  const key = id === 'M5' ? 'm5' : 'm7'
  const gespeichert = useFortschritt().answers[key]
  const schritte = id === 'M5' ? M5_SCHRITTE : M7_SCHRITTE
  const [gesetzt, setGesetzt] = useState<string[]>(() => gespeichert?.gesetzt ?? [])
  const [fehler, setFehler] = useState(false)
  const [versuche, setVersuche] = useState(0)
  const [reihenfolge] = useState(() =>
    schritte
      .map((s) => ({ label: s.label, rang: Math.random() }))
      .sort((a, b) => a.rang - b.rang)
      .map((s) => s.label),
  )
  const dran = schritte[gesetzt.length]
  const fertig = !dran
  const spaeter = schritte.slice(gesetzt.length + 1)
  const andere = spaeter.find(
    (s) =>
      s.label === reihenfolge.find((label) => spaeter.some((x) => x.label === label)),
  )
  const auswahl = dran
    ? [dran, ...(andere ? [andere] : [])].sort(
        (a, b) => reihenfolge.indexOf(a.label) - reihenfolge.indexOf(b.label),
      )
    : []
  const gebaut = [...(id === 'M7' ? M5_SCHRITTE.map((s) => s.label) : []), ...gesetzt]
  const start = id === 'M7' ? M7_START : 0
  const ziel = gesetzt.length ? schritte[gesetzt.length - 1].zielT : start
  const waehle = (label: string) => {
    if (!dran) return
    if (label !== dran.label) {
      setFehler(true)
      setVersuche((n) => n + 1)
      return
    }
    const neu = [...gesetzt, label]
    setGesetzt(neu)
    setFehler(false)
    if (key === 'm5')
      merkeAntwort('m5', {
        gesetzt: neu,
        fertig: neu.length === schritte.length,
        versuche,
      })
    else merkeAntwort('m7', { gesetzt: neu, fertig: neu.length === schritte.length })
  }
  return (
    <StepShell
      id={id}
      ansage={null}
      buehneInteraktiv
      interaktionOffen={!fertig}
      auftrag={fertig ? null : 'Wähle das nächste Bauteil für das Dach.'}
      buehne={
        <Suspense fallback={<Dachstuhl3DFallback />}>
          <Dachstuhl3D zielT={ziel} startT={start} dauer={16} kulisse deinSparren />
        </Suspense>
      }
      warum={
        <p>
          Baue von unten nach oben. Jedes Holz braucht eine feste Auflage. Die Zeichnungen
          zeigen dir, wo die Teile sitzen.
        </p>
      }
      interaktion={
        fertig ? (
          <div className="flex flex-col gap-2">
            <p className="text-xl font-semibold text-kh-signal">
              {id === 'M5' ? 'Der Unterbau steht.' : 'Die Dachkonstruktion steht.'}
            </p>
            <p className="text-base text-kh-mute">
              {id === 'M5'
                ? 'Als Nächstes ergänzt du die schrägen Dachbalken.'
                : 'Auf die Latten kommen später die Ziegel.'}
            </p>
            <p className="flex items-center gap-2 text-sm text-kh-mute">
              <RotateCw className="size-4" aria-hidden />
              Ziehe über das Modell, um es zu drehen.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-kh-mute">
              {gesetzt.length} von {schritte.length} Bauteilen gesetzt
            </p>
            {fehler && (
              <p
                role="status"
                className="rounded-kh border-l-4 border-kh-orange bg-kh-orange/10 px-3 py-2 text-base"
              >
                {HINWEISE[dran.label]}
              </p>
            )}
            <div
              className={`grid gap-3 ${auswahl.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}
            >
              {auswahl.map((s) => (
                <Wahlflaeche
                  key={s.label}
                  form="karte"
                  onClick={() => waehle(s.label)}
                  data-testid={`${key}-teil-${s.label}`}
                  className="items-center p-3 text-center"
                >
                  <DachSchema
                    hervor={s.label}
                    gebaut={gebaut}
                    className="h-[90px] w-full"
                  />
                  <span className="text-base font-semibold leading-snug">
                    {NAMEN[s.label]}
                  </span>
                </Wahlflaeche>
              ))}
            </div>
          </div>
        )
      }
      fuss={
        <StepFuss
          id={id}
          uebungOffen={!fertig}
          geschafft={fertig ? 'Aufbau geschafft' : null}
        />
      }
    />
  )
}
