import { useState } from 'react'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BAUTEILE, type BauteilId } from '@/khpl/buehne/anlagenmechanik/kanon'
import { Schnitt } from '@/khpl/buehne/anlagenmechanik/Schnitt'
import { AhaKarte } from '@/khpl/komponenten/AhaKarte'
import { Wahlflaeche } from '@/khpl/komponenten/Wahlflaeche'
import { Wechsel } from '@/khpl/komponenten/Wechsel'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { merkeAntwort, useFortschritt } from '@/khpl/store/fortschritt'
import { Fachwort } from './Fachwort'

/**
 * A2 — Vierzig Jahre Keller. Die **geführte Hälfte des Lernpaars**: was dieser
 * Screen aufbaut, fragt A7 ab (Spec 3 und 6, A2).
 *
 * Zwei Takte:
 *
 *  1. **Der Schutz einer fremden Wohnung** — der Handgriff, den keiner der
 *     anderen drei Tage hat. Bevor irgendetwas ausgebaut wird, werden
 *     „*empfindliche Sachen abgeklebt und geschützt mit Vlies*" (`INTERVIEW` —
 *     Anlagenmechaniker SHK Einblicke). Zwei Sätze und eine kleine Handlung,
 *     mehr braucht es nicht: **du arbeitest in der Wohnung von jemandem.** Ein
 *     Dachdecker ist auf dem Dach, ein Zimmerer in der Halle, ein Zerspaner an
 *     der Maschine.
 *  2. **Sechs Bauteile lesen** — jedes mit einem Satz: was es tut und ob es
 *     bleibt. **Kein Falsch, kein Richtig** (Vorbild B3.2 und M5). Wer hier
 *     nichts antippt, kann in A7 trotzdem weiter — er hat nur weniger zu
 *     erzählen, und genau das macht A7 sichtbar, ohne zu bewerten.
 *
 * Die sechs Bauteile stehen als `BAUTEILE` in `buehne/anlagenmechanik/kanon.ts`
 * (Spec 6 nennt sie dort namentlich); **die Sätze dazu stehen hier und nicht in
 * der Zeichnung** — die Zeichnung malt, der Step textet.
 *
 * **Angetippt wird an zwei Stellen, und beide führen in denselben Zustand:**
 * auf der Zeichnung (`onBauteil`) und auf den Flächen im Panel. Die Zeichnung
 * ist der schönere Weg; die Flächen sind der, der auf einem Messegerät auch im
 * Vorbeigehen gefunden wird — und der einzige, der ohne Zeigefinger auf einem
 * kleinen Symbol auskommt.
 *
 * **`answers.a2`** `{ angetippt }` (Spec 6).
 */

/** Ab so vielen gelesenen Bauteilen hat der Screen seinen Zweck erfüllt. */
const GENUG = 2

/**
 * Der ausgerollte Vlies-Handgriff, mitgeschrieben im selben Feld.
 *
 * Ohne ihn stünde beim Wiederkommen über „Dein Weg" oder Zurück der
 * Anfangszustand da, und der Besucher müsste den Handgriff samt seines Textes
 * ein zweites Mal machen. Die Form aus Spec 6 (`{ angetippt: string[] }`)
 * bleibt unberührt: die Marke ist kein Bauteil und wird überall
 * herausgefiltert, wo gezählt oder gezeichnet wird.
 */
export const VLIES_MARKE = 'vlies'

/**
 * Was jedes Bauteil tut und ob es bleibt.
 *
 * ⚠️ **`ENTWURF – UNGEPRÜFT`** (Spec 6, A2) — fachlich abzunehmen. Bewusst
 * ohne Zahlen: was hier steht, soll ein Vierzehnjähriger verstehen, und jeder
 * Millimeter- oder Wattwert wäre eine Behauptung, für die dieser Screen keine
 * Quelle hat.
 */
const TEXTE: Record<BauteilId, { los: string; tut: React.ReactNode }> = {
  kessel: {
    los: 'fliegt raus',
    tut: (
      <>
        Verbrennt Öl und macht daraus heißes Heizungswasser. Vierzig Winter lang, jeden
        Tag. Er ist das Einzige hier, das ersetzt werden muss — alles andere entscheidet
        sich beim Hinsehen.
      </>
    ),
  },
  tank: {
    los: 'fliegt raus',
    tut: (
      <>
        Hier lagert das Heizöl, das der Kessel verbrennt. Ohne Kessel braucht es ihn nicht
        mehr — und der Raum, in dem er steht, wird frei.
      </>
    ),
  },
  verteiler: {
    los: 'bleibt',
    tut: (
      <>
        Am <Fachwort id="verteiler">Verteiler</Fachwort> teilt sich die Leitung auf die
        Heizkreise auf — Erdgeschoss, Obergeschoss, Bad. Hier gehen alle{' '}
        <Fachwort id="vorlauf-ruecklauf">Vorläufe</Fachwort> ab und alle Rückläufe wieder
        zusammen. Die neue Anlage hängt sich genau hier ein.
      </>
    ),
  },
  pumpe: {
    los: 'wird getauscht',
    tut: (
      <>
        Sie schiebt das Wasser durch die Rohre — ohne sie bliebe die Wärme im Keller.
        Diese läuft immer gleich stark; eine neue regelt sich selbst.
      </>
    ),
  },
  ausdehnungsgefaess: {
    los: 'bleibt, wird geprüft',
    tut: (
      <>
        Wasser dehnt sich aus, wenn es warm wird. Das{' '}
        <Fachwort id="ausdehnungsgefaess">Ausdehnungsgefäß</Fachwort> nimmt das auf. Ob es
        zur neuen Anlage passt, misst man — nachsehen kostet Minuten, ein zu kleines Gefäß
        kostet später Bauteile.
      </>
    ),
  },
  thermostatventile: {
    los: 'bleiben',
    tut: (
      <>
        An jedem Heizkörper eins. Sie regeln, wie viel warmes Wasser hineinläuft.
        Hängenbleiben können sie, austauschen muss man sie selten — neu eingestellt werden
        sie aber alle:{' '}
        <Fachwort id="hydraulischer-abgleich">hydraulischer Abgleich</Fachwort>.
      </>
    ),
  },
}

export function A2() {
  const gespeichert = useFortschritt().answers.a2
  const gemerkt = gespeichert?.angetippt ?? []
  const vorher = gemerkt.filter(istBauteil)
  const [vlies, setVlies] = useState(gemerkt.includes(VLIES_MARKE) || vorher.length > 0)
  const [angetippt, setAngetippt] = useState<BauteilId[]>(vorher)
  const [offen, setOffen] = useState<BauteilId | null>(null)

  const merke = (bauteile: BauteilId[]) =>
    merkeAntwort('a2', { angetippt: [VLIES_MARKE, ...bauteile] })

  const ausrollen = () => {
    setVlies(true)
    merke(angetippt)
  }

  const tippen = (id: BauteilId) => {
    setOffen((alt) => (alt === id ? null : id))
    if (angetippt.includes(id)) return
    const neu = [...angetippt, id]
    setAngetippt(neu)
    merke(neu)
  }

  const genug = vlies && angetippt.length >= GENUG
  const karte = offen ? TEXTE[offen] : null
  const label = offen ? BAUTEILE.find((b) => b.id === offen)?.label : null

  return (
    <StepShell
      id="A2"
      auftrag={genug ? null : 'Tipp an, was in diesem Keller steht.'}
      ansage={null}
      karteBreit
      interaktionOffen={!genug}
      buehne={
        <Schnitt
          zustand={{ szene: 'keller', vlies, angetippt, offen }}
          onBauteil={vlies ? tippen : undefined}
        />
      }
      warum={
        vlies ? (
          <p>
            Der zweite Auftrag beginnt mit Hinsehen: Ölkessel, Tank, Verteiler, Pumpe,
            Ausdehnungsgefäß, Thermostatventile. Vieles davon bleibt, vieles fliegt raus,
            und man muss wissen, was was tut.
          </p>
        ) : (
          <p>
            Bevor hier irgendetwas ausgebaut wird, wird die Wohnung geschützt: Vlies auf
            den Boden, empfindliche Sachen abgeklebt. Hier wohnt eine Familie — heute
            Abend sitzt sie über diesem Keller.
          </p>
        )
      }
      interaktion={
        <Wechsel takt={vlies ? 'lesen' : 'vlies'}>
          {vlies ? (
            <div className="flex flex-col gap-3">
              {!offen && (
                <p className="px-1 text-[1rem] text-kh-paper/55">
                  Sechs Sachen stehen in diesem Keller. Tipp an, was du wissen willst.
                  {angetippt.length > 0 && (
                    <span className="text-kh-paper/40">
                      {' '}
                      — {angetippt.length} von {BAUTEILE.length} hast du schon.
                    </span>
                  )}
                </p>
              )}

              <div className="grid gap-2 landscape:grid-cols-3">
                {BAUTEILE.map((b) => (
                  <Wahlflaeche
                    key={b.id}
                    onClick={() => tippen(b.id)}
                    gewaehlt={offen === b.id}
                    data-testid={`a2-bauteil-${b.id}`}
                  >
                    {/* Der Haken markiert Gelesenes, ohne es wegzunehmen —
                        dieselbe Geste wie in M6. */}
                    {angetippt.includes(b.id) && offen !== b.id && (
                      <Check
                        className="size-4 shrink-0 text-kh-signal"
                        strokeWidth={3}
                        aria-hidden
                      />
                    )}
                    {b.label}
                  </Wahlflaeche>
                ))}
              </div>

              {/*
                Eine Erklärfläche, nicht sechs aufgeklappte Kästen: das zweite
                Bauteil schreibt dorthin, wo das erste stand. Das Panel bleibt
                so hoch, wie es war.
              */}
              <Wechsel takt={offen ?? 'nichts'}>
                {karte && label ? (
                  <div className="kh-feld px-4 py-3" data-testid="a2-erklaerung">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <h2 className="kh-titel-klein text-kh-paper">{label}</h2>
                      <span className="kh-etikett">{karte.los}</span>
                    </div>
                    <p className="mt-1.5 text-[1.0625rem] leading-[1.45] text-kh-paper/90">
                      {karte.tut}
                    </p>
                  </div>
                ) : null}
              </Wechsel>
            </div>
          ) : (
            <p className="text-[1.125rem] font-semibold text-kh-paper sm:text-[1.25rem]">
              Erst die Bahn ausrollen. Dann der Keller.
            </p>
          )}
        </Wechsel>
      }
      aha={
        <AhaKarte sichtbar={genug} eyebrow="Ist der alte Kessel kaputt?">
          Der Kessel läuft noch. Er ist nicht kaputt — er ist vierzig Jahre alt und
          verbrennt Öl. Das ist der ganze Grund.
        </AhaKarte>
      }
      fuss={
        <StepFuss
          id="A2"
          uebungOffen={!genug}
          aktion={
            vlies ? null : (
              <Button variant="aktion" onClick={ausrollen} data-testid="a2-vlies">
                Vlies ausrollen
              </Button>
            )
          }
          geschafft={genug ? 'Keller gelesen' : null}
        />
      }
    />
  )
}

/** Der Store gibt `string[]` zurück — hier wird daraus wieder der Kanon. */
function istBauteil(wert: string): wert is BauteilId {
  return BAUTEILE.some((b) => b.id === wert)
}
