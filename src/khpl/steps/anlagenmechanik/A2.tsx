import { useEffect, useRef, useState } from 'react'
import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Schnitt } from '@/khpl/buehne/anlagenmechanik/Schnitt'
import { Wahlflaeche } from '@/khpl/komponenten/Wahlflaeche'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { merkeAntwort, useFortschritt } from '@/khpl/store/fortschritt'
import { KellerStapel, type Los } from './KellerKarten'
import type { BauteilId } from '@/khpl/buehne/anlagenmechanik/kanon'

export const VLIES_MARKE = 'vlies'
const KARTEN: { id: BauteilId; label: string; hinweis: string; los: Los }[] = [
  {
    id: 'kessel',
    label: 'Ölkessel',
    hinweis: 'Eine Wärmepumpe ersetzt die alte Ölheizung.',
    los: 'raus',
  },
  {
    id: 'tank',
    label: 'Öltank',
    hinweis: 'Die neue Anlage braucht kein Heizöl.',
    los: 'raus',
  },
  {
    id: 'verteiler',
    label: 'Verteiler',
    hinweis: 'Geprüft: Hier kann die neue Anlage angeschlossen werden.',
    los: 'bleibt',
  },
  {
    id: 'pumpe',
    label: 'Alte Pumpe',
    hinweis: 'Für diesen Auftrag ist eine neue, sparsamere Pumpe bestellt.',
    los: 'raus',
  },
  {
    id: 'ausdehnungsgefaess',
    label: 'Druckausgleichsgefäß',
    hinweis: 'Geprüft: Das Gefäß ist intakt und passt zur neuen Anlage.',
    los: 'bleibt',
  },
  {
    id: 'thermostatventile',
    label: 'Heizkörperventile',
    hinweis: 'Geprüft: Sie funktionieren und werden neu eingestellt.',
    los: 'bleibt',
  },
]
const FOTOS = KARTEN.map((k) => ({
  ...k,
  bild: `/medien/media/anlagenmechaniker/keller-${k.id}.webp`,
}))
export function A2() {
  const alt = useFortschritt().answers.a2?.angetippt ?? []
  const [vlies, setVlies] = useState(alt.includes(VLIES_MARKE))
  const [bearbeitet, setBearbeitet] = useState<BauteilId[]>(
    KARTEN.filter((k) => alt.includes(k.id)).map((k) => k.id),
  )
  const [index, setIndex] = useState(() => {
    const i = KARTEN.findIndex((k) => !alt.includes(k.id))
    return i < 0 ? KARTEN.length : i
  })
  const [wahl, setWahl] = useState<Los | null>(null)
  const [automatisch, setAutomatisch] = useState(true)
  const sperre = useRef(false)
  const karte = KARTEN[index]
  const fertig = index === KARTEN.length
  const ok = !!karte && wahl === karte.los
  function naechste() {
    setIndex((i) => i + 1)
    setWahl(null)
    sperre.current = false
  }
  useEffect(() => {
    if (!wahl || !automatisch) return
    const uhr = window.setTimeout(naechste, 900)
    return () => window.clearTimeout(uhr)
  }, [wahl, automatisch])
  function waehle(los: Los) {
    if (!karte || sperre.current) return
    sperre.current = true
    setWahl(los)
    const neu = [...bearbeitet, karte.id]
    setBearbeitet(neu)
    merkeAntwort('a2', { angetippt: [VLIES_MARKE, ...neu] })
  }
  return (
    <StepShell
      id="A2"
      auftrag={
        fertig
          ? null
          : !vlies
            ? 'Schütze zuerst den Boden.'
            : 'Was bleibt für die neue Heizung?'
      }
      ansage={null}
      interaktionOffen={!fertig}
      buehne={
        <Schnitt
          zustand={{
            szene: 'keller',
            vlies,
            angetippt: bearbeitet,
            offen: karte?.id ?? null,
          }}
        />
      }
      interaktion={
        <div className="flex flex-col gap-3">
          {!vlies ? (
            <p>
              Du arbeitest im Haus einer Familie. Rolle eine Schutzbahn auf dem Boden aus.
            </p>
          ) : fertig ? (
            <>
              <p className="kh-titel-klein text-kh-signal">Alle sechs Teile sortiert.</p>
              <p>
                Die Teile wurden für diesen Auftrag geprüft. In einem anderen Haus kann
                die Entscheidung anders ausfallen.
              </p>
            </>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-x-3">
                <p className="text-sm text-kh-mute" aria-live="polite">
                  Teil {index + 1} von 6
                </p>
                <label className="flex min-h-11 items-center gap-2 text-sm text-kh-mute">
                  <input
                    type="checkbox"
                    checked={automatisch}
                    onChange={(e) => setAutomatisch(e.target.checked)}
                  />
                  Automatisch zum nächsten Teil
                </label>
              </div>
              <div
                role="status"
                aria-live="polite"
                className="min-h-12"
                data-testid="a2-rueckmeldung"
              >
                {wahl ? (
                  <p
                    className={`flex items-center gap-2 font-semibold ${ok ? 'text-green-300' : 'text-red-300'}`}
                  >
                    {ok ? <Check aria-hidden /> : <X aria-hidden />}
                    {ok ? 'Richtig' : 'Falsch'}:{' '}
                    {karte.los === 'raus' ? 'Das kommt raus.' : 'Das bleibt.'}
                  </p>
                ) : (
                  <p className="text-kh-paper/90">{karte.hinweis}</p>
                )}
              </div>
              <KellerStapel karten={FOTOS} index={index} wahl={wahl} onWaehle={waehle} />
              <div className="grid grid-cols-2 gap-2">
                <Wahlflaeche
                  disabled={!!wahl}
                  onClick={() => waehle('raus')}
                  className="justify-center"
                  data-testid={`a2-raus-${karte.id}`}
                >
                  ← Kommt raus
                </Wahlflaeche>
                <Wahlflaeche
                  disabled={!!wahl}
                  onClick={() => waehle('bleibt')}
                  className="justify-center"
                  data-testid={`a2-bleibt-${karte.id}`}
                >
                  Bleibt →
                </Wahlflaeche>
              </div>
            </>
          )}
        </div>
      }
      fuss={
        <StepFuss
          id="A2"
          uebungOffen={!fertig}
          geschafft={fertig ? 'Keller sortiert' : null}
          aktion={
            !vlies ? (
              <Button
                variant="aktion"
                onClick={() => {
                  setVlies(true)
                  merkeAntwort('a2', { angetippt: [VLIES_MARKE, ...bearbeitet] })
                }}
                data-testid="a2-vlies"
              >
                Schutzbahn ausrollen
              </Button>
            ) : !automatisch && wahl && !fertig ? (
              <Button variant="aktion" onClick={naechste} data-testid="a2-naechstes">
                Nächstes Teil
              </Button>
            ) : null
          }
        />
      }
    />
  )
}
