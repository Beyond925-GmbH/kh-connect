import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Messschraube } from '@/khpl/buehne/zerspanung/Messschraube'
import { ERSTES_MASS, SOLL, mm } from '@/khpl/buehne/zerspanung/kanon'
import { Rueckmeldung } from '@/khpl/komponenten/Rueckmeldung'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { merkeAntwort, useFortschritt } from '@/khpl/store/fortschritt'
import { Massbereich } from './Massbereich'

export function Z4() {
  const alt = useFortschritt().answers.z4
  const [fertig, setFertig] = useState(!!alt?.freigegeben)
  const [abtrag, setAbtrag] = useState(
    alt?.freigegeben ? Math.round(-(alt.korrektur ?? -0.05) * 100) : 0,
  )
  const [versuche, setVersuche] = useState(alt?.versuche ?? 0)
  const [meldung, setMeldung] = useState<string | null>(null)
  const wert = Math.round((ERSTES_MASS - abtrag / 100) * 100) / 100
  const passt = wert >= SOLL.unten && wert <= SOLL.oben
  function schneiden() {
    const n = versuche + 1
    setVersuche(n)
    setFertig(passt)
    if (!passt) {
      setMeldung(
        wert < SOLL.unten
          ? 'Zu viel abgetragen. Das Teil ist zu dünn. Hier ist ein neues Rohteil. Stelle den weißen Strich in den grünen Bereich.'
          : 'Noch zu dick. Nimm etwas mehr weg, bis der weiße Strich im grünen Bereich steht.',
      )
      if (wert < SOLL.unten) setAbtrag(0)
    } else setMeldung(null)
    merkeAntwort('z4', {
      freigegeben: passt,
      versuche: n,
      korrektur: passt ? -abtrag / 100 : 0,
    })
  }
  function aendere(w: number) {
    setAbtrag(Math.max(0, Math.min(10, w)))
    setMeldung(null)
  }
  return (
    <StepShell
      id="Z4"
      auftrag={fertig ? null : 'Nimm so viel Metall weg, bis das Maß passt.'}
      ansage={null}
      interaktionOffen={!fertig}
      buehne={<Messschraube zustand={{ wert, misst: false }} />}
      interaktion={
        <div className="flex flex-col gap-3">
          <p className="text-base leading-relaxed text-kh-paper/80">
            Bringe den weißen Strich in den grünen Bereich.
          </p>
          <Massbereich wert={wert} vorschau={!fertig} />
          {!fertig && (
            <>
              <div className="flex items-center gap-3">
                <Button
                  variant="neben"
                  className="size-14 shrink-0"
                  disabled={abtrag === 0}
                  onClick={() => aendere(abtrag - 1)}
                  aria-label="Weniger Metall wegnehmen"
                  data-testid="z4-plus"
                >
                  <Minus aria-hidden />
                </Button>
                <label className="flex min-w-0 flex-1 flex-col gap-2 text-center text-sm">
                  Metall wegnehmen
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    value={abtrag}
                    onChange={(e) => aendere(Number(e.target.value))}
                    className="kh-regler min-h-11 w-full"
                    aria-label="Wie viel Metall wird abgetragen"
                    aria-valuetext={`${mm(abtrag / 100)} Millimeter. Ergebnis ${mm(wert)} Millimeter.`}
                    data-testid="z4-abtrag"
                  />
                </label>
                <Button
                  variant="neben"
                  className="size-14 shrink-0"
                  disabled={abtrag === 10}
                  onClick={() => aendere(abtrag + 1)}
                  aria-label="Mehr Metall wegnehmen"
                  data-testid="z4-minus"
                >
                  <Plus aria-hidden />
                </Button>
              </div>
            </>
          )}
          <Rueckmeldung
            ok={fertig ? true : meldung ? false : null}
            text={
              fertig
                ? 'Das Maß passt. Jetzt kann die Maschine weitere Teile fertigen.'
                : meldung
            }
          />
          {!fertig && versuche > 0 && (
            <Button
              variant="leise"
              onClick={() =>
                aendere(Math.round((ERSTES_MASS - (SOLL.unten + SOLL.oben) / 2) * 100))
              }
              data-testid="z4-zeig-mir-wie"
            >
              Zeige mir die passende Einstellung
            </Button>
          )}
        </div>
      }
      fuss={
        <StepFuss
          id="Z4"
          uebungOffen={!fertig}
          geschafft={fertig ? 'Teil passt' : null}
          aktion={
            !fertig ? (
              <Button
                variant="aktion"
                onClick={schneiden}
                disabled={abtrag === 0}
                data-testid="z4-nachdrehen"
              >
                Abtragen und prüfen
              </Button>
            ) : null
          }
        />
      }
    />
  )
}
