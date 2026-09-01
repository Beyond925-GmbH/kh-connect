import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { BAUTEILE, type BauteilId } from '@/khpl/buehne/anlagenmechanik/kanon'
import { Schnitt } from '@/khpl/buehne/anlagenmechanik/Schnitt'
import { AhaKarte } from '@/khpl/komponenten/AhaKarte'
import { Lage } from '@/khpl/komponenten/Lage'
import { Wahlflaeche } from '@/khpl/komponenten/Wahlflaeche'
import { Wechsel } from '@/khpl/komponenten/Wechsel'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { useSchmal } from '@/khpl/shell/schmal'
import { merkeAntwort, useFortschritt } from '@/khpl/store/fortschritt'
import { Fachwort } from './Fachwort'
import { KellerStapel, WORTE, type KellerKarte, type Los } from './KellerKarten'

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
 *  2. **Sechs Bauteile sortieren, als Kartenstapel** — eins nach dem anderen
 *     liegt fotografiert auf dem Tisch, und der Besucher **rät** zuerst
 *     selbst: links weg heißt *fliegt raus*, rechts weg heißt *bleibt*.
 *     Danach erst steht da, was es tut und was wirklich damit passiert. Dass
 *     hier geraten wird, sagt der Screen ausdrücklich: ein Vierzehnjähriger
 *     *kann* diese Teile nicht kennen, und eine Frage, die wie eine
 *     Wissensprüfung aussieht, lädt zum Nicht-Tippen ein. Schätzen ist hier
 *     ausdrücklich der Beruf — der Monteur im echten Keller schaut auch erst
 *     hin und schätzt, bevor er misst.
 *
 * ---
 *
 * **Was an Takt 2 zweimal umgebaut wurde und warum.**
 *
 * Der Screen war zuerst „Tipp an, was in diesem Keller steht" — sechs
 * Flächen, sechs Texte, aufdecken. Das war zeitweise die **dritte**
 * Aufdeck-Übung dieses Tages: A1 tippte Prüfpunkte an, und A3 ließ damals
 * Verlustflächen suchen. Screens hintereinander mit demselben Verb lesen sich
 * als ein Screen, den man mehrmals sieht. Also wurde daraus eine Sortierung —
 * sie war ohnehin schon da, denn jedes Bauteil trug seit jeher ein `los`
 * („fliegt raus", „bleibt", „wird getauscht"); es stand nur als Etikett neben
 * dem Text, statt eine Frage zu sein.
 *
 * Geblieben war daran ein Rest des alten Rasters: Man tippte erst einen
 * **Namen** an („Ausdehnungsgefäß") und entschied dann über ein Wort. Genau
 * die Zumutung, gegen die A1 seine Foto-Kacheln bekommen hat — ein Wort ist
 * kein Ding. Jetzt liegt **ein Foto in der Hand** und wird gewischt
 * (`KellerKarten.tsx`): die Geste *ist* die Entscheidung, man wirft etwas weg
 * oder behält es. Die Knöpfe unter der Karte sagen dasselbe für alle, die
 * nicht wischen können oder wollen.
 *
 * Der Inhalt ist bei beiden Umbauten unangetastet geblieben: dieselben sechs
 * Bauteile, dieselben Echos, dieselben Sätze, dasselbe Etikett fürs Angebot.
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
 * der Zeichnung** — die Zeichnung malt, der Step textet. Die Fotos liegen
 * unter `public/medien/media/anlagenmechaniker/keller-*.webp`; Herkunft und
 * Lizenzen: `MEDIEN.md`, Namensnennung im Sheet „Dein Weg".
 *
 * **Bedient wird nur noch der Stapel.** Die Zeichnung nimmt keine Tipps mehr
 * an (`onBauteil` entfällt) und führt stattdessen mit — sie zeigt, **wo im
 * Keller** das Teil steht, das gerade in der Hand liegt, und hakt ab, was
 * sortiert ist. Dieselbe Rollenteilung wie in A1 seit den Foto-Kacheln: die
 * Fotos bedienen, die Zeichnung führt Protokoll. Ein zweiter Weg auf einem
 * kleinen Symbol brächte den Stapel aus der Reihenfolge, in der er liegt.
 *
 * **`answers.a2`** `{ angetippt }`.
 */

/** Ab so vielen gelesenen Bauteilen hat der Screen seinen Zweck erfüllt. */
const GENUG = 2

/** Wo die sechs Kellerfotos liegen. Herkunft und Lizenzen: `MEDIEN.md`. */
const BILDER = '/medien/media/anlagenmechaniker'

/**
 * Der Stapel: dieselben sechs Bauteile in derselben Reihenfolge wie im Kanon,
 * jedes mit seinem Foto. **Die Reihenfolge ist die des Kellers**, nicht die
 * der Wichtigkeit — man geht ihn durch, wie man drinsteht: erst der Kessel,
 * dann der Tank daneben, dann die Rohre, die davon weggehen.
 */
const KARTEN: readonly (KellerKarte & { id: BauteilId })[] = BAUTEILE.map((b) => ({
  ...b,
  bild: `${BILDER}/keller-${b.id}.webp`,
}))

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
  /** Handy hochkant: der Rahmensatz wird kürzer, damit die Knöpfe im Fenster bleiben. */
  const schmal = useSchmal()
  const gespeichert = useFortschritt().answers.a2
  const gemerkt = gespeichert?.angetippt ?? []
  const vorher = gemerkt.filter(istBauteil)
  const [vlies, setVlies] = useState(gemerkt.includes(VLIES_MARKE) || vorher.length > 0)
  const [angetippt, setAngetippt] = useState<BauteilId[]>(vorher)
  /**
   * Welche Karte oben liegt. **Wer wiederkommt, macht dort weiter, wo er
   * aufgehört hat:** Der Stapel fängt bei der ersten Karte an, über die noch
   * nicht entschieden wurde — sonst legte „Dein Weg" jemandem sechs Karten
   * hin, von denen er vier schon sortiert hat.
   */
  const [index, setIndex] = useState(() => {
    const offen = KARTEN.findIndex((k) => !vorher.includes(k.id))
    return offen === -1 ? KARTEN.length : offen
  })
  /**
   * Was der Besucher je Bauteil entschieden hat.
   *
   * **Nur für diesen Besuch**, bewusst nicht im Store: Gespeichert wird, *dass*
   * ein Bauteil bearbeitet wurde (`answers.a2.angetippt`) — die Wahl
   * selbst braucht kein späterer Screen, und eine Formänderung am Antwortfeld
   * nur für eine Anzeige wäre der teurere Weg.
   */
  const [wahl, setWahl] = useState<Partial<Record<BauteilId, Los>>>({})

  const merke = (bauteile: BauteilId[]) =>
    merkeAntwort('a2', { angetippt: [VLIES_MARKE, ...bauteile] })

  const ausrollen = () => {
    setVlies(true)
    merke(angetippt)
  }

  /** Die Karte, die gerade oben liegt — `undefined`, wenn der Keller durch ist. */
  const oben = KARTEN[index]
  const jetzt = oben ? (wahl[oben.id] ?? null) : null

  /**
   * Die Auflösung holt sich selbst ins Bild — dasselbe Muster (und derselbe
   * Frame-Versatz) wie in `Rueckmeldung` und A1.
   *
   * Der Grund: Hochkant trägt das Panel 385 px, die Auflösung samt
   * Weiter-Fläche ist rund 250 px hoch, und darüber stehen Karte, Lage und
   * Zähler. Ohne diesen Anstoß läge nach dem Wisch ausgerechnet der Satz
   * unter der Scrollkante, für den gewischt wurde. `nearest` scrollt nur so
   * weit wie nötig; quer, wo alles ins Fenster passt, tut es nichts.
   *
   * Der Anker liegt **um** den `Wechsel` und nicht in ihm: das Feld darin wird
   * beim Tipp aus- und wieder eingehängt, und im Moment des Effekts zeigte ein
   * innerer Ref noch auf das alte Element.
   */
  const antwortAnker = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!jetzt) return
    // Erst wenn der `Wechsel` fertig ist, steht fest, wie weit gescrollt
    // werden muss: Abgang (0,2 s) und Höhenfahrt (0,34 s) laufen
    // nacheinander. Ein Frame früher — wie in A1, wo das Ergebnis über der
    // Bedienung steht — scrollt hier ins Leere, weil noch die alte, kleine
    // Knopfreihe im Panel steht (gemessen: die Auflösung blieb 60 px unter
    // der Kante).
    const uhr = setTimeout(() => {
      antwortAnker.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }, 620)
    return () => clearTimeout(uhr)
  }, [jetzt, index])

  /**
   * Der Tipp — gewischt oder getippt, hier läuft beides zusammen. Er wird
   * gespeichert und bekommt **ein Echo in Worten, aber keine Note**: erst die
   * freundliche Zeile des Bauteils (`TEXTE[..].echo`), dann die Sache selbst —
   * nie ein Urteil in Häkchen, Kreuz oder Rot.
   */
  const entscheide = (id: BauteilId, los: Los) => {
    setWahl((alt) => ({ ...alt, [id]: los }))
    if (angetippt.includes(id)) return
    const neu = [...angetippt, id]
    setAngetippt(neu)
    merke(neu)
  }

  /**
   * Die nächste Karte. **Ein Tap, kein Zähler** — dieselbe Regel wie in A1:
   * Ließe man die Karte gleich nach dem Wisch abfliegen, stünde die Erklärung
   * über einem Foto, das es nicht mehr gibt.
   */
  const weiter = () => setIndex((i) => i + 1)

  const genug = vlies && angetippt.length >= GENUG

  return (
    <StepShell
      id="A2"
      auftrag={
        genug
          ? null
          : !vlies
            ? 'Roll die Vliesbahn aus.'
            : 'Was schätzt du: fliegt raus oder bleibt?'
      }
      /*
        Die Ansage erscheint **je Geste, nicht je Screen** (`gesten.ts`) — und
        erst nach dem Vlies, sonst läge sie über dem Handgriff, mit dem der
        Screen anfängt. `ziehen-karte` ist dieselbe Geste wie in M7 und B4.1:
        eine Karte mit dem Finger dorthin schieben, wo sie hingehört. Wer sie
        an diesem Tag schon gesehen hat, bekommt sie hier nicht noch einmal.
      */
      ansage={
        vlies
          ? {
              geste: 'ziehen-karte',
              text: 'Ein Teil nach dem anderen: nach links wischen heißt fliegt raus, nach rechts heißt bleibt.',
              haken:
                'Wissen kann das niemand — schätz einfach. Die Knöpfe darunter tun dasselbe.',
            }
          : null
      }
      karteBreit
      interaktionOffen={!genug}
      buehne={
        /*
          Die Zeichnung nimmt keine Tipps mehr an: gewischt wird auf dem
          Stapel. Sie zeigt dafür mit, **wo** das Teil steht, das gerade oben
          liegt (`offen`), und hakt ab, was sortiert ist — dieselbe
          Rollenteilung wie in A1 seit den Foto-Kacheln.
        */
        <Schnitt
          zustand={{ szene: 'keller', vlies, angetippt, offen: oben?.id ?? null }}
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
                Der Ölkessel muss raus, die Wärmepumpe kommt rein.{' '}
                {schmal ? '' : 'Alles andere hier unten kann bleiben — oder nicht. '}
                Was du sagst, steht nachher im Angebot.
              </Lage>

              {/*
                **Eine Zeile über dem Stapel, nicht zwei.** Vor der ersten
                Entscheidung steht dort der Raten-Haken (Wortlaut und Grund wie
                `RATEN_HAKEN`, gesten.ts): Er nimmt die Erwartung weg, man
                müsse diese Teile kennen. Danach steht dort der Zähler. Beides
                gleichzeitig kostete hochkant 36 px, die dem Panel fehlen —
                gemessen in `tmp/sicht/a2-stapel.mjs`.

                Dass der Haken nur bis zur ersten Entscheidung steht, gilt auch
                für Wiederkehrer: `angetippt` kommt aus dem Store
                (`answers.a2`).
              */}
              <p className="px-1 text-[1rem] text-kh-paper/70">
                {angetippt.length === 0
                  ? 'Wissen kann das niemand — schätz einfach.'
                  : `${angetippt.length} von ${KARTEN.length} sortiert.`}
              </p>

              <KellerStapel
                karten={KARTEN}
                index={index}
                wahl={jetzt}
                onWaehle={(los) => oben && entscheide(oben.id, los)}
              />

              {/*
                Eine Fläche unter der Karte, kein Stapel aus Texten: erst die
                zwei Knöpfe, nach dem Tipp die Auflösung, dann wieder die
                Knöpfe der nächsten Karte. Sie wächst nicht mit — die zweite
                schreibt dorthin, wo die erste stand.
              */}
              <div ref={antwortAnker}>
                <Wechsel takt={`${oben?.id ?? 'fertig'}-${jetzt ?? 'offen'}`}>
                  {oben ? (
                    jetzt ? (
                      <Aufloesung
                        bauteil={oben.id}
                        wahl={jetzt}
                        letzte={index === KARTEN.length - 1}
                        onWeiter={weiter}
                      />
                    ) : (
                      /*
                      Die beiden Flächen stehen in der Richtung, in die man
                      wischt: raus liegt links, bleibt rechts. Wer den einen
                      Weg lernt, hat den anderen mitgelernt.
                    */
                      <div className="flex gap-2">
                        <Wahlflaeche
                          onClick={() => entscheide(oben.id, 'raus')}
                          className="flex-1 justify-center"
                          data-testid={`a2-raus-${oben.id}`}
                        >
                          {WORTE.raus}
                        </Wahlflaeche>
                        <Wahlflaeche
                          onClick={() => entscheide(oben.id, 'bleibt')}
                          className="flex-1 justify-center"
                          data-testid={`a2-bleibt-${oben.id}`}
                        >
                          {WORTE.bleibt}
                        </Wahlflaeche>
                      </div>
                    )
                  ) : (
                    <p
                      className="text-[1.0625rem] leading-[1.45] text-kh-paper/90"
                      data-testid="a2-fertig"
                    >
                      Der Keller ist durch. Was raus muss, was bleibt und was noch
                      gemessen wird — das steht jetzt im Angebot.
                    </p>
                  )}
                </Wechsel>
              </div>
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

/**
 * Was nach dem Tipp unter der Karte steht.
 *
 * **Erst das Echo, dann die Sache, dann das Etikett.** Das Echo ist eine
 * Zeile Worte wie A7s Kundinnen-Reaktion — kein Häkchen, kein X, kein Rot:
 * für jeden Ausgang dieselbe Gestalt. Es bleibt in Papierweiß; das eine
 * Orange dieser Fläche gehört dem Etikett „Im Angebot steht" darunter. Danach
 * steht, was das Teil tut — wer danebenlag, liest den Grund und nicht sein
 * Ergebnis.
 *
 * Das Foto bleibt dabei über der Fläche liegen: Der Text redet über einen
 * Gegenstand, und der soll zu sehen sein, während man ihn liest.
 */
function Aufloesung({
  bauteil,
  wahl,
  letzte,
  onWeiter,
}: {
  bauteil: BauteilId
  wahl: Los
  /** Die sechste Karte — danach ist der Keller durch. */
  letzte: boolean
  onWeiter: () => void
}) {
  const text = TEXTE[bauteil]
  return (
    <div className="kh-feld px-4 py-3" data-testid="a2-erklaerung">
      <p className="kh-titel-klein text-kh-paper" data-testid="a2-echo">
        {text.echo[wahl]}
      </p>
      <p className="mt-1.5 text-[1.0625rem] leading-[1.45] text-kh-paper/90">
        {text.tut}
      </p>
      <p className="mt-2.5 border-t border-kh-line pt-2.5">
        <span className="kh-etikett">Im Angebot steht</span>{' '}
        <span className="text-[1.0625rem] font-semibold text-kh-orange">{text.los}</span>
      </p>
      {/* Der Tap, der die Karte wegschiebt. Sie fliegt in die Richtung, in
          die getippt wurde — die Bewegung ist die Quittung. */}
      <Wahlflaeche
        onClick={onWeiter}
        className="mt-3 w-full justify-center"
        data-testid="a2-naechstes"
      >
        {letzte ? 'Das war der Keller' : 'Nächstes Teil'}
      </Wahlflaeche>
    </div>
  )
}

/** Der Store gibt `string[]` zurück — hier wird daraus wieder der Kanon. */
function istBauteil(wert: string): wert is BauteilId {
  return BAUTEILE.some((b) => b.id === wert)
}
