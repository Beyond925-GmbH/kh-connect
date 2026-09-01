import { useState } from 'react'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BAUTEILE, type BauteilId } from '@/khpl/buehne/anlagenmechanik/kanon'
import { Schnitt } from '@/khpl/buehne/anlagenmechanik/Schnitt'
import { AhaKarte } from '@/khpl/komponenten/AhaKarte'
import { Lage } from '@/khpl/komponenten/Lage'
import { Wahlflaeche } from '@/khpl/komponenten/Wahlflaeche'
import { Wechsel } from '@/khpl/komponenten/Wechsel'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { merkeAntwort, useFortschritt } from '@/khpl/store/fortschritt'
import { Fachwort } from './Fachwort'

/**
 * A2 — Vierzig Jahre Keller. Die **geführte Hälfte des Lernpaars**: was dieser
 * Screen aufbaut, fragt A7 ab.
 *
 * Zwei Takte:
 *
 *  1. **Der Schutz einer fremden Wohnung** — der Handgriff, den keiner der
 *     anderen drei Tage hat. Bevor irgendetwas ausgebaut wird, werden
 *     „*empfindliche Sachen abgeklebt und geschützt mit Vlies*" — so
 *     beschreibt es ein Anlagenmechaniker SHK im Interview. Zwei Sätze und
 *     eine kleine Handlung, mehr braucht es nicht: **du arbeitest in der
 *     Wohnung von jemandem.** Ein Dachdecker ist auf dem Dach, ein Zimmerer in
 *     der Halle, ein Zerspaner an der Maschine.
 *  2. **Sechs Bauteile sortieren** — bei jedem **rät** der Besucher zuerst
 *     selbst: fliegt raus oder bleibt? Danach erst steht da, was es tut und
 *     was wirklich damit passiert. Dass hier geraten wird, sagt der Screen
 *     ausdrücklich: ein Vierzehnjähriger *kann* diese Teile nicht kennen, und
 *     eine Frage, die wie eine Wissensprüfung aussieht, lädt zum Nicht-Tippen
 *     ein. Schätzen ist hier ausdrücklich der Beruf — der Monteur im echten
 *     Keller schaut auch erst hin und schätzt, bevor er misst.
 *
 * ---
 *
 * **Was an Takt 2 umgebaut wurde und warum.**
 *
 * Der Screen war bis hierher „Tipp an, was in diesem Keller steht" — sechs
 * Flächen, sechs Texte, aufdecken. Das war für sich in Ordnung, nur war es
 * zeitweise die **dritte** Aufdeck-Übung dieses Tages: A1 tippt Prüfpunkte an,
 * und A3 ließ damals Verlustflächen suchen (inzwischen schätzt A3 wieder).
 * Screens hintereinander mit demselben Verb lesen sich als ein Screen, den
 * man mehrmals sieht — der Umbau hier bleibt deshalb richtig.
 *
 * Die Sortierung war ohnehin schon da — jedes Bauteil trug seit jeher ein
 * `los` („fliegt raus", „bleibt", „wird getauscht"). Sie stand nur als
 * Etikett neben dem Text, statt eine Frage zu sein. Jetzt ist sie die Frage,
 * und der Text ist die Antwort.
 *
 * **Keine Note, aber ein warmes Echo** — Vorbild ist die Reaktion der
 * Bauherrin in A7: Auf einen Tipp folgt kein Häkchen und kein rotes Kreuz,
 * sondern zuerst eine Zeile in Worten — und die beginnt bei jedem Ausgang
 * freundlich, weil ein danebengegangener Tipp hier kein Fehler ist, sondern
 * genau das, worum gebeten wurde. Alle Ausgänge sehen gleich aus; allein die
 * Worte unterscheiden sie (wie in A7). Danach kommt die Sache selbst: Wer beim
 * Verteiler „fliegt raus" tippt, liest, warum die neue Anlage sich genau dort
 * einhängt — das korrigiert wirksamer als ein rotes Kreuz. Wer hier nichts
 * entscheidet, kann in A7 trotzdem weiter; er hat nur weniger zu erzählen.
 *
 * Die sechs Bauteile stehen als `BAUTEILE` in
 * `buehne/anlagenmechanik/kanon.ts`; **die Sätze dazu stehen hier und nicht in
 * der Zeichnung** — die Zeichnung malt, der Step textet.
 *
 * **Angetippt wird an zwei Stellen, und beide führen in denselben Zustand:**
 * auf der Zeichnung (`onBauteil`) und auf den Flächen im Panel. Die Zeichnung
 * ist der schönere Weg; die Flächen sind der, der auf einem Messegerät auch im
 * Vorbeigehen gefunden wird — und der einzige, der ohne Zeigefinger auf einem
 * kleinen Symbol auskommt.
 *
 * **`answers.a2`** `{ angetippt }`.
 */

/** Ab so vielen gelesenen Bauteilen hat der Screen seinen Zweck erfüllt. */
const GENUG = 2

/**
 * Der ausgerollte Vlies-Handgriff, mitgeschrieben im selben Feld.
 *
 * Ohne ihn stünde beim Wiederkommen über „Dein Weg" oder Zurück der
 * Anfangszustand da, und der Besucher müsste den Handgriff samt seines Textes
 * ein zweites Mal machen. Die Form des Antwortfeldes
 * (`{ angetippt: string[] }`) bleibt unberührt: die Marke ist kein Bauteil
 * und wird überall herausgefiltert, wo gezählt oder gezeichnet wird.
 */
export const VLIES_MARKE = 'vlies'

/**
 * Was jedes Bauteil tut und ob es bleibt. `los` ist das Etikett fürs Angebot;
 * `echo` die erste Zeile nach dem Tipp — **je eine Fassung pro Tipp, direkt
 * neben dem Etikett**, damit beide in einer Handschrift stehen und ein
 * fachlicher Reviewer sie zusammen redigiert. (Eine getrennte
 * Richtig-falsch-Achse wäre beim Redigieren von `los` unbemerkt
 * auseinandergelaufen.)
 *
 * **Regeln für die Echo-Zeilen** — Vorbild sind die Reaktion der Bauherrin in
 * A7 und die Einordnung der Wasserkocher-Tipps in A3: jede Fassung fängt
 * freundlich an. Wer danebenlag, liest zuerst, warum sein Tipp vernünftig war
 * — Danebenliegen ist hier Inhalt, nie Versagen. Bei Pumpe („wird getauscht")
 * und Ausdehnungsgefäß („wird geprüft") sind ohnehin beide Tipps halb wahr,
 * und die Zeilen sagen genau das, statt eine Seite zur falschen zu erklären.
 *
 * **Diese Texte gehören fachlich gegengelesen.** Sie sind bewusst
 * ohne Zahlen: was hier steht, soll ein Vierzehnjähriger verstehen, und jeder
 * Millimeter- oder Wattwert wäre eine Behauptung, für die dieser Screen keine
 * Quelle hat.
 */
const TEXTE: Record<
  BauteilId,
  { los: string; echo: Record<'raus' | 'bleibt', string>; tut: React.ReactNode }
> = {
  kessel: {
    los: 'fliegt raus',
    echo: {
      raus: 'Gut geschätzt — genau der muss raus.',
      bleibt:
        'Verständlich — er läuft ja noch. Trotzdem ist er der Einzige, der raus muss.',
    },
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
    echo: {
      raus: 'Richtig geschätzt — der geht zusammen mit dem Kessel.',
      bleibt:
        'Kann man denken — so groß und fest, wie er dasteht. Nur braucht ihn ohne Kessel keiner mehr.',
    },
    tut: (
      <>
        Hier lagert das Heizöl, das der Kessel verbrennt. Ohne Kessel braucht es ihn nicht
        mehr — und der Raum, in dem er steht, wird frei.
      </>
    ),
  },
  verteiler: {
    los: 'bleibt',
    echo: {
      raus: 'Sieht auch so aus — alt und grau. Dabei läuft genau hier alles zusammen.',
      bleibt: 'Gut geschätzt — der bleibt.',
    },
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
    echo: {
      raus: 'Fast ein Volltreffer: Die alte fliegt wirklich raus — nur ganz ohne Pumpe geht es nicht.',
      bleibt:
        'Fast ein Volltreffer: Eine Pumpe bleibt hier immer nötig — nur nicht mehr diese.',
    },
    tut: (
      <>
        Sie schiebt das Wasser durch die Rohre — ohne sie bliebe die Wärme im Keller.
        Diese läuft immer gleich stark; eine neue regelt sich selbst.
      </>
    ),
  },
  ausdehnungsgefaess: {
    los: 'bleibt, wird geprüft',
    echo: {
      raus: 'Kann so kommen — sicher weiß das hier noch keiner. Das entscheidet erst die Messung.',
      bleibt:
        'Gut möglich — sicher weiß das hier noch keiner. Das entscheidet erst die Messung.',
    },
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
    echo: {
      raus: 'Klingt logisch — neue Heizung, neue Ventile. Hier reicht es aber, die alten neu einzustellen.',
      bleibt: 'Gut geschätzt — die bleiben dran.',
    },
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
  /**
   * Was der Besucher je Bauteil entschieden hat.
   *
   * **Nur für diesen Besuch**, bewusst nicht im Store: Gespeichert wird, *dass*
   * ein Bauteil bearbeitet wurde (`answers.a2.angetippt`) — die Wahl
   * selbst braucht kein späterer Screen, und eine Formänderung am Antwortfeld
   * nur für eine Anzeige wäre der teurere Weg.
   */
  const [wahl, setWahl] = useState<Partial<Record<BauteilId, 'raus' | 'bleibt'>>>({})

  const merke = (bauteile: BauteilId[]) =>
    merkeAntwort('a2', { angetippt: [VLIES_MARKE, ...bauteile] })

  const ausrollen = () => {
    setVlies(true)
    merke(angetippt)
  }

  /**
   * Ein Bauteil anfassen. **Es wird erst mit der Entscheidung als gelesen
   * gezählt**, nicht schon beim Antippen — sonst zählte ein Fehlgriff auf dem
   * Weg zur eigentlichen Frage mit.
   */
  const tippen = (id: BauteilId) => {
    setOffen((alt) => (alt === id ? null : id))
  }

  /**
   * Der Tipp. Er wird gespeichert und bekommt **ein Echo in Worten, aber
   * keine Note**: erst die freundliche Zeile des Bauteils (`TEXTE[..].echo`),
   * dann die Sache selbst — nie ein Urteil in Häkchen, Kreuz oder Rot.
   */
  const entscheide = (id: BauteilId, wahl: 'raus' | 'bleibt') => {
    setWahl((alt) => ({ ...alt, [id]: wahl }))
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
      auftrag={
        genug
          ? null
          : !vlies
            ? 'Roll die Vliesbahn aus.'
            : offen
              ? 'Was schätzt du: fliegt raus oder bleibt?'
              : 'Geh den Keller durch — Teil für Teil.'
      }
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
              {/*
                **Der Rahmen steht hier und nicht im `warum`.** Auf einem
                Übungs-Step zeigt die Hülle den Warum-Bereich nicht an
                (`komponenten/Lage.tsx`) — der Screen fragte deshalb „fliegt
                raus oder bleibt?", ohne je gesagt zu haben, dass hier eine
                neue Anlage geplant wird und die Antwort ins Angebot geht.
                Ohne diesen Einsatz ist die Frage ein Ratespiel über fremde
                Gegenstände.
              */}
              <Lage>
                Der Ölkessel muss raus, die Wärmepumpe kommt rein. Alles andere hier unten
                kann bleiben — oder nicht. Was du sagst, steht nachher im Angebot.
              </Lage>

              {!offen && (
                <p className="px-1 text-[1rem] text-kh-paper/55">
                  Sechs Sachen stehen in diesem Keller.
                  {angetippt.length > 0 && (
                    <span>
                      {' '}
                      {angetippt.length} von {BAUTEILE.length} sortiert.
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
              {/*
                Eine Fläche für beides: erst die Frage, dann die Sache. Sie
                wächst nicht mit jedem Bauteil — das zweite schreibt dorthin,
                wo das erste stand.
              */}
              <Wechsel
                takt={`${offen ?? 'nichts'}-${offen ? (wahl[offen] ?? 'offen') : ''}`}
              >
                {karte && label && offen ? (
                  <div className="kh-feld px-4 py-3" data-testid="a2-erklaerung">
                    <h2 className="kh-titel-klein text-kh-paper">{label}</h2>

                    {wahl[offen] ? (
                      <>
                        {/*
                          **Erst das Echo, dann die Sache, dann das Etikett.**
                          Das Echo ist eine Zeile Worte wie A7s
                          Kundinnen-Reaktion — kein Häkchen, kein X, kein Rot:
                          für jeden Ausgang dieselbe Gestalt. Anders
                          als in A7 bleibt es in Papierweiß: das eine Orange
                          dieser kleinen Karte gehört dem Etikett „Im Angebot
                          steht" darunter. Danach steht, was das Teil tut —
                          wer danebenlag, liest den Grund und nicht sein
                          Ergebnis.
                        */}
                        <p
                          className="kh-titel-klein mt-1.5 text-kh-paper"
                          data-testid="a2-echo"
                        >
                          {karte.echo[wahl[offen]]}
                        </p>
                        <p className="mt-1.5 text-[1.0625rem] leading-[1.45] text-kh-paper/90">
                          {karte.tut}
                        </p>
                        <p className="mt-2.5 border-t border-kh-line pt-2.5">
                          <span className="kh-etikett">Im Angebot steht</span>{' '}
                          <span className="text-[1.0625rem] font-semibold text-kh-orange">
                            {karte.los}
                          </span>
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="mt-1 text-[1rem] text-kh-mute">
                          Kann das Teil bei der neuen Anlage weiterlaufen?
                        </p>
                        {/*
                          **Der Raten-Haken, an der Stelle der Frage.**
                          Wortlaut und Grund wie `RATEN_HAKEN` (gesten.ts), in
                          Panel-Form wie auf A3 — er nimmt die Erwartung weg,
                          man müsse das wissen, und sagt, warum Schätzen
                          reicht: die Auflösung kommt gleich. Nur bis zur
                          ersten Entscheidung: danach ist der Takt bekannt —
                          auch für Wiederkehrer, denn `angetippt` kommt aus
                          dem Store (`answers.a2`).
                        */}
                        {angetippt.length === 0 && (
                          <p className="mt-1.5 text-[1rem] text-kh-paper/70">
                            Wissen kann das niemand — schätz einfach. Gleich siehst du,
                            was wirklich passiert.
                          </p>
                        )}
                        <div className="mt-2.5 flex gap-2">
                          <Wahlflaeche
                            onClick={() => entscheide(offen, 'raus')}
                            className="flex-1 justify-center"
                            data-testid={`a2-raus-${offen}`}
                          >
                            Fliegt raus
                          </Wahlflaeche>
                          <Wahlflaeche
                            onClick={() => entscheide(offen, 'bleibt')}
                            className="flex-1 justify-center"
                            data-testid={`a2-bleibt-${offen}`}
                          >
                            Bleibt
                          </Wahlflaeche>
                        </div>
                      </>
                    )}
                  </div>
                ) : null}
              </Wechsel>
            </div>
          ) : (
            <p className="text-[1.0625rem] leading-[1.45] text-kh-paper/85">
              Erst die Bahn, dann der Keller. Wer hier Öl auf den Teppich trägt, hat den
              Auftrag verloren, bevor er angefangen hat.
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
