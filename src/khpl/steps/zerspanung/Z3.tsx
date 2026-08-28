import { useState } from 'react'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Werkzeugweg } from '@/khpl/buehne/zerspanung/Werkzeugweg'
import { SAETZE, type SatzId } from '@/khpl/buehne/zerspanung/kanon'
import { AhaKarte } from '@/khpl/komponenten/AhaKarte'
import { Lage } from '@/khpl/komponenten/Lage'
import { Rueckmeldung } from '@/khpl/komponenten/Rueckmeldung'
import { Wahlflaeche } from '@/khpl/komponenten/Wahlflaeche'
import { Wechsel } from '@/khpl/komponenten/Wechsel'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { merkeAntwort, useFortschritt } from '@/khpl/store/fortschritt'
import { Begriff } from './Begriff'

/**
 * Z3 — Vier Sätze, ein Weg. **CNC als Handlung, nicht als Vokabel:** der
 * Besucher tippt echte NC-Sätze an und sieht auf der Bühne, welches Stück
 * Weg jeder fährt. Code und Bewegung sind dieselbe Sache — das ist die
 * eine Einsicht, für die dieser Screen gebaut ist.
 *
 * Danach dreht der Screen die Richtung um: **„Welcher Satz fährt die
 * Fase?“** Wer eben zugesehen hat, liest jetzt selbst. Ein Fehlgriff zeigt,
 * was der angetippte Satz stattdessen fährt — keine Note, eine Auskunft.
 *
 * **Fachlich:** X ist beim Drehen ein Durchmesserwort, Z die Länge ab
 * Stirn; G0 Eilgang, G1 Vorschubfahrt, F der Vorschub je Umdrehung. Die
 * vier Sätze sind der vereinfachte Schlichtgang des Bolzens aus Z1
 * (Fase 1 × 45°, Sitz 22 lang) und in sich geometrisch konsistent. Als
 * Steuerung wird SINUMERIK genannt — der Dialekt, in dem die Sätze stehen.
 *
 * **`answers.z3`** `{ gesehen, gefunden, versuche }`.
 */

const INFO: Record<SatzId, { code: string; text: string }> = {
  n10: {
    code: 'N10 G0 X23 Z2',
    text: 'G0 ist Eilgang: schnell hin, ohne zu schneiden — gestrichelt auf der Bühne. X23 heißt Durchmesser 23, Z2 heißt: zwei Millimeter vor der Stirn anhalten. Knapp davor, nie hinein.',
  },
  n20: {
    code: 'N20 G1 Z0 F0.1',
    text: 'G1 ist Fahren mit Vorschub — ab hier schneidet die Schneide. Sie fährt bis an die Stirnkante; das F sagt, wie viel sie je Umdrehung vorankommt.',
  },
  n30: {
    code: 'N30 G1 X25 Z-1',
    text: 'Beide Achsen gleichzeitig: schräg über die Kante, von Durchmesser 23 auf 25, dabei einen Millimeter in die Länge — eine Schräge in 45 Grad.',
  },
  n40: {
    code: 'N40 G1 Z-22',
    text: 'Die lange Gerade: 22 Millimeter an der Mantellinie entlang. Hier entsteht der Lagersitz aus Z1 — und der lange, heiße Span.',
  },
}

/** Der Satz, der die Fase fährt. */
const FASE: SatzId = 'n30'

export function Z3() {
  const gespeichert = useFortschritt().answers.z3
  const [gesehen, setGesehen] = useState<SatzId[]>(
    () => (gespeichert?.gesehen as SatzId[] | undefined) ?? [],
  )
  const [aktiv, setAktiv] = useState<SatzId | null>(null)
  const [gefunden, setGefunden] = useState(() => !!gespeichert?.gefunden)
  const [versuche, setVersuche] = useState(() => gespeichert?.versuche ?? 0)
  /** Erst wenn alle vier gesehen sind, stellt der Screen seine Frage. */
  const [fragt, setFragt] = useState(() => !!gespeichert?.gefunden)
  const [daneben, setDaneben] = useState<SatzId | null>(null)

  const alleGesehen = gesehen.length >= SAETZE.length

  const tippe = (id: SatzId) => {
    setAktiv(id)
    const neu = gesehen.includes(id) ? gesehen : [...gesehen, id]
    setGesehen(neu)

    if (fragt && !gefunden) {
      const treffer = id === FASE
      setDaneben(treffer ? null : id)
      setGefunden(treffer)
      const n = versuche + 1
      setVersuche(n)
      merkeAntwort('z3', { gesehen: neu, gefunden: treffer, versuche: n })
      return
    }
    merkeAntwort('z3', { gesehen: neu, gefunden, versuche })
  }

  const fehlgriff = daneben ? INFO[daneben] : null

  return (
    <StepShell
      id="Z3"
      auftrag={
        gefunden
          ? null
          : fragt
            ? 'Tipp den Satz an, der die Fase fährt.'
            : 'Tipp jeden Satz an und schau, was er fährt.'
      }
      ansage={null}
      interaktionOffen={!gefunden}
      buehne={<Werkzeugweg zustand={{ aktiv, gesehen, geloest: gefunden }} />}
      warum={
        <p>
          Niemand führt hier das Werkzeug mit der Hand. Die{' '}
          <Begriff id="cnc">CNC</Begriff>-Steuerung — eine SINUMERIK — liest das Programm
          Satz für Satz und macht daraus Bewegung.
        </p>
      }
      interaktion={
        <div className="flex flex-col gap-3">
          {!fragt && !gefunden && (
            <Lage>
              Das ist der Schlichtgang für deinen Bolzen — die letzten vier Sätze vor dem
              fertigen Maß. Jeder Satz ist ein Stück Weg.
            </Lage>
          )}

          <ul className="flex flex-col gap-2" data-testid="z3-saetze">
            {SAETZE.map((id) => (
              <li key={id} className="flex">
                <Wahlflaeche
                  onClick={() => tippe(id)}
                  gewaehlt={aktiv === id || (gefunden && id === FASE)}
                  ton={gefunden && id === FASE ? 'signal' : 'vorlaeufig'}
                  data-testid={`z3-satz-${id}`}
                  className="min-h-[52px] font-mono text-[1.0625rem] tracking-wide"
                >
                  {gesehen.includes(id) && aktiv !== id && !(gefunden && id === FASE) && (
                    <Check
                      className="size-4 shrink-0 text-kh-signal"
                      strokeWidth={3}
                      aria-hidden
                    />
                  )}
                  {INFO[id].code}
                </Wahlflaeche>
              </li>
            ))}
          </ul>

          {fragt && !gefunden ? (
            <Rueckmeldung
              ok={fehlgriff ? false : null}
              text={fehlgriff ? `Der Satz fährt etwas anderes: ${fehlgriff.text}` : null}
              testid="z3-rueckmeldung"
            />
          ) : (
            <Wechsel takt={gefunden ? 'gefunden' : (aktiv ?? 'nichts')}>
              {gefunden ? (
                <p
                  data-testid="z3-pointe"
                  className="kh-feld px-4 py-3 text-[1.0625rem] leading-[1.45] text-kh-paper/90"
                >
                  N30 — beide Achsen gleichzeitig, und aus zwei Zahlen wird eine Schräge.
                  Du hast der Maschine gerade beim Denken zugesehen.
                </p>
              ) : aktiv ? (
                <p
                  data-testid="z3-erklaerung"
                  className="kh-feld px-4 py-3 text-[1.0625rem] leading-[1.45] text-kh-paper/90"
                >
                  {aktiv === 'n20' ? (
                    <>
                      G1 ist Fahren mit <Begriff id="vorschub">Vorschub</Begriff> — ab
                      hier schneidet die Schneide. Sie fährt bis an die Stirnkante; das F
                      sagt, wie viel sie je Umdrehung vorankommt.
                    </>
                  ) : (
                    INFO[aktiv].text
                  )}
                </p>
              ) : null}
            </Wechsel>
          )}
        </div>
      }
      aha={
        <AhaKarte sichtbar={gefunden} eyebrow="Tippt das jemand alles von Hand?">
          Einzelne Teile tippt man direkt an der Steuerung ein, komplizierte kommen aus
          dem CAM-System am Rechner. Lesen können muss es jede:r hier — sonst merkt
          niemand, wenn ein Satz falsch ist.
        </AhaKarte>
      }
      fuss={
        <StepFuss
          id="Z3"
          uebungOffen={!gefunden}
          aktion={
            !fragt && !gefunden ? (
              <Button
                variant="aktion"
                onClick={() => {
                  setAktiv(null)
                  setFragt(true)
                }}
                disabled={!alleGesehen}
                data-testid="z3-frage"
                className="disabled:grayscale"
              >
                Ich kann das lesen
              </Button>
            ) : null
          }
          geschafft={gefunden ? 'Programm gelesen' : null}
        />
      }
    />
  )
}
