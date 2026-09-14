import { useState } from 'react'
import { Check, Ruler, Camera, Truck, ScanSearch } from 'lucide-react'
import { StepFoto } from '@/khpl/buehne/Foto'
import { StepShell } from '@/khpl/shell/StepShell'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { Wahlflaeche } from '@/khpl/komponenten/Wahlflaeche'
import { merkeAntwort, useFortschritt } from '@/khpl/store/fortschritt'

const STELLEN = [
  {
    id: 'balken',
    titel: 'Die alten Balken',
    icon: ScanSearch,
    text: 'Ein Balken hat einen Riss. Diese Stelle muss vor dem Umbau geprüft werden.',
  },
  {
    id: 'kran',
    titel: 'Die Zufahrt',
    icon: Truck,
    text: 'Ein Auto steht im Weg. Für den Kran muss die Zufahrt frei sein.',
  },
  {
    id: 'aufmass',
    titel: 'Die Dachfläche',
    icon: Ruler,
    text: 'Länge und Breite bestimmen, wie viel Material gebraucht wird.',
  },
] as const

export function M1() {
  const gespeichert = useFortschritt().answers.m1
  const [gewaehlt, setGewaehlt] = useState<string[]>(gespeichert?.gewaehlt ?? [])
  const [aktuell, setAktuell] = useState<string | null>(null)
  const fertig = gewaehlt.length === STELLEN.length
  const auswahl = STELLEN.find((s) => s.id === aktuell)
  const pruefe = (id: string) => {
    const neu = gewaehlt.includes(id) ? gewaehlt : [...gewaehlt, id]
    setGewaehlt(neu)
    setAktuell(id)
    merkeAntwort('m1', { gewaehlt: neu, ausgewertet: neu.length === STELLEN.length })
  }
  return (
    <StepShell
      id="M1"
      ansage={null}
      buehne={<StepFoto id="M1" />}
      auftrag={fertig ? null : 'Sieh dir die drei Stellen auf der Baustelle an.'}
      interaktionOffen={!fertig}
      warum={
        <p>
          Vor dem Umbau prüft das Team den Zustand des Daches, die Maße und den Zugang zur
          Baustelle. Fotos halten die Beobachtungen fest.
        </p>
      }
      interaktion={
        <div className="flex flex-col gap-3">
          <svg
            viewBox="0 0 440 170"
            role="img"
            aria-label="Haus mit beschädigtem Dachbalken und einem Auto in der Zufahrt"
            className="h-[150px] w-full rounded-kh bg-kh-surface"
          >
            <path
              d="M70 140V65L165 14 260 65V140Z"
              fill="#37302a"
              stroke="#a69a83"
              strokeWidth="3"
            />
            <path
              d="M60 69 165 8 270 69M96 50 166 20 232 50"
              fill="none"
              stroke="#c4945d"
              strokeWidth="8"
            />
            <path d="m112 40 6 9-8 4 5 9" stroke="#ff9f2a" strokeWidth="3" fill="none" />
            <path
              d="M113 140V95h42v45M189 81h38v29h-38z"
              fill="#171513"
              stroke="#978974"
              strokeWidth="2"
            />
            <path
              d="M283 146h140"
              stroke="#756d60"
              strokeWidth="5"
              strokeDasharray="8 6"
            />
            <path
              d="M309 120v-17l12-17h39l14 17h10v17z"
              fill="#657886"
              stroke="#b8c2c9"
              strokeWidth="2"
            />
            <circle cx="324" cy="121" r="10" fill="#171513" />
            <circle cx="368" cy="121" r="10" fill="#171513" />
            <path d="M75 154h182M75 150v8m182-8v8" stroke="#ff9f2a" strokeWidth="2" />
          </svg>
          <div className="grid grid-cols-3 gap-2">
            {STELLEN.map((s) => (
              <Wahlflaeche
                key={s.id}
                form="kachel"
                gewaehlt={gewaehlt.includes(s.id)}
                ton="vorlaeufig"
                onClick={() => pruefe(s.id)}
                data-testid={`m1-pruefen-${s.id}`}
                className="min-h-[90px]"
              >
                {gewaehlt.includes(s.id) ? (
                  <Check className="size-7" />
                ) : (
                  <s.icon className="size-7" />
                )}
                <span className="text-sm font-semibold">{s.titel}</span>
              </Wahlflaeche>
            ))}
          </div>
          {auswahl && (
            <p role="status" className="text-base leading-snug text-kh-paper">
              {auswahl.text}
            </p>
          )}
          {fertig && (
            <p className="flex items-center gap-2 text-base text-kh-signal">
              <Camera className="size-5" aria-hidden />
              Die Beobachtungen sind festgehalten.
            </p>
          )}
        </div>
      }
      fuss={
        <StepFuss
          id="M1"
          uebungOffen={!fertig}
          geschafft={fertig ? 'Drei Stellen angesehen' : null}
        />
      }
    />
  )
}
