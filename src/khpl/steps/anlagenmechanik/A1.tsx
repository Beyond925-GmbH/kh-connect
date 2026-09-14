import { useState } from 'react'
import { Check, Thermometer, TriangleAlert } from 'lucide-react'
import { Schnitt } from '@/khpl/buehne/anlagenmechanik/Schnitt'
import { Rueckmeldung } from '@/khpl/komponenten/Rueckmeldung'
import { Wahlflaeche } from '@/khpl/komponenten/Wahlflaeche'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { merkeAntwort, useFortschritt } from '@/khpl/store/fortschritt'

const PRUEFUNGEN = [
  { id: 'kessel', label: 'Heizung', befund: 'Heizt. Die Heizkörper werden warm.' },
  {
    id: 'speicher',
    label: 'Speicher',
    befund: 'Das Wasser im Speicher ist kalt.',
  },
  {
    id: 'regelung',
    label: 'Anzeige',
    befund: 'Meldet „warm“. Der Speicher ist aber kalt.',
  },
  {
    id: 'ladepumpe',
    label: 'Ladepumpe',
    befund: 'Hat Strom, wartet aber auf den Heizbefehl.',
  },
  {
    id: 'zirkulation',
    label: 'Zirkulation',
    befund: 'Läuft. Sie verteilt Wasser, erwärmt es aber nicht.',
  },
  {
    id: 'mischer',
    label: 'Mischventil',
    befund: 'Lässt sich verstellen. Hier kommt aber nur kaltes Wasser an.',
  },
] as const
const URSACHEN = [
  { id: 'kessel', label: 'Heizung', bild: 'kessel' },
  { id: 'fuehler', label: 'Fühler', bild: 'regelung' },
  { id: 'pumpe', label: 'Pumpe', bild: 'ladepumpe' },
]
export function A1() {
  const alt = useFortschritt().answers.a1
  const [geprueft, setGeprueft] = useState<string[]>(alt?.geprueft ?? [])
  const [fertig, setFertig] = useState(!!alt?.richtig)
  const [auswahl, setAuswahl] = useState(false)
  const [fehler, setFehler] = useState(false)
  const [befund, setBefund] = useState<string | null>(null)
  const hinweiseDa = geprueft.includes('speicher') && geprueft.includes('regelung')
  function pruefe(id: string) {
    const neu = geprueft.includes(id) ? geprueft : [...geprueft, id]
    setGeprueft(neu)
    setBefund(PRUEFUNGEN.find((p) => p.id === id)!.befund)
    merkeAntwort('a1', { geprueft: neu, ursache: null, richtig: false })
  }
  function waehle(id: string) {
    const ok = id === 'fuehler'
    setFehler(!ok)
    setFertig(ok)
    merkeAntwort('a1', { geprueft, ursache: id, richtig: ok })
  }
  return (
    <StepShell
      id="A1"
      auftrag={
        fertig
          ? null
          : auswahl
            ? 'Welches Teil meldet die falsche Temperatur?'
            : 'Finde heraus, warum das Wasser kalt bleibt.'
      }
      ansage={null}
      interaktionOffen={!fertig}
      buehne={
        <Schnitt
          zustand={{
            szene: 'anlage',
            geprueft,
            laeuft: null,
            ursache: fertig ? 'fuehler' : null,
            geloest: fertig,
          }}
        />
      }
      interaktion={
        <div className="flex flex-col gap-3">
          {!auswahl && !fertig && (
            <p className="text-base leading-relaxed text-kh-paper/80">
              Heizung warm, Wasserhahn kalt.
            </p>
          )}
          {!fertig && !auswahl && (
            <>
              <p
                role="status"
                className="min-h-12 text-base leading-relaxed text-kh-paper/85"
                data-testid="a1-befund"
              >
                {befund ?? 'Prüfe Speicher und Anzeige.'}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {PRUEFUNGEN.map((p) => (
                  <Wahlflaeche
                    key={p.id}
                    onClick={() => pruefe(p.id)}
                    className="min-h-28 min-w-0 flex-col overflow-hidden p-0"
                    data-testid={`a1-pruefung-${p.id}`}
                  >
                    <img
                      src={`/medien/media/anlagenmechaniker/pruefung-${p.id}.webp`}
                      alt=""
                      className="h-20 w-full object-cover"
                    />
                    <span className="w-full min-w-0 px-1 pb-2 text-center text-base leading-tight">
                      {geprueft.includes(p.id) && (
                        <Check
                          className="absolute top-1 right-1 size-5 rounded bg-black/80 text-kh-signal"
                          aria-label="Geprüft"
                        />
                      )}
                      {p.label}
                    </span>
                  </Wahlflaeche>
                ))}
              </div>
            </>
          )}
          {(auswahl || fertig) && (
            <div className="grid grid-cols-2 gap-2">
              <div className="kh-feld p-2 text-base">
                <Thermometer className="mb-1 size-6 text-sky-300" aria-hidden />
                <p>Wasser im Speicher</p>
                <strong>Kalt</strong>
              </div>
              <div className="kh-feld p-2 text-base">
                <TriangleAlert className="mb-1 size-6 text-amber-300" aria-hidden />
                <p>Anzeige behauptet</p>
                <strong>Warm</strong>
              </div>
            </div>
          )}
          {!fertig && auswahl && (
            <>
              <p
                role="status"
                className={`min-h-12 text-base leading-snug ${fehler ? 'text-kh-orange' : 'text-kh-paper/80'}`}
              >
                {fehler
                  ? 'Wähle den Temperaturfühler. Er meldet den falschen Wert.'
                  : 'Ein Temperaturfühler misst die Wärme und meldet sie der Anzeige.'}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {URSACHEN.map((u) => (
                  <Wahlflaeche
                    key={u.id}
                    onClick={() => waehle(u.id)}
                    data-testid={`a1-ursache-${u.id}`}
                    className={`min-h-28 min-w-0 flex-col overflow-hidden p-0 ${fehler && u.id === 'fuehler' ? 'ring-2 ring-kh-signal' : ''}`}
                  >
                    {u.id === 'fuehler' ? (
                      <div className="flex h-16 w-full items-center justify-center bg-white/5">
                        <Thermometer className="size-12 text-kh-orange" aria-hidden />
                      </div>
                    ) : (
                      <img
                        src={`/medien/media/anlagenmechaniker/pruefung-${u.bild}.webp`}
                        alt=""
                        className="h-20 w-full object-cover"
                      />
                    )}
                    <span className="w-full min-w-0 p-2 text-center text-base">
                      {u.label}
                    </span>
                  </Wahlflaeche>
                ))}
              </div>
            </>
          )}
          <Rueckmeldung
            ok={fertig ? true : null}
            text={
              fertig
                ? 'Gefunden! Der Fühler meldet die falsche Temperatur. Nach dem Austausch wird der Speicher wieder warm.'
                : null
            }
          />
        </div>
      }
      fuss={
        <StepFuss
          id="A1"
          uebungOffen={!fertig}
          geschafft={fertig ? 'Störung gefunden' : null}
          aktion={
            !fertig && !auswahl && hinweiseDa ? (
              <Wahlflaeche
                onClick={() => setAuswahl(true)}
                className="w-auto justify-center"
                data-testid="a1-entscheiden"
              >
                Befunde vergleichen
              </Wahlflaeche>
            ) : null
          }
        />
      }
    />
  )
}
