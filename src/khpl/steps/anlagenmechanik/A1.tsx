import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { ChevronDown, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Schnitt } from '@/khpl/buehne/anlagenmechanik/Schnitt'
import { AhaKarte } from '@/khpl/komponenten/AhaKarte'
import { Rueckmeldung } from '@/khpl/komponenten/Rueckmeldung'
import { Wahlflaeche } from '@/khpl/komponenten/Wahlflaeche'
import { Wechsel } from '@/khpl/komponenten/Wechsel'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { useSchmal } from '@/khpl/shell/schmal'
import { merkeAntwort, useFortschritt } from '@/khpl/store/fortschritt'
import { Fachwort } from './Fachwort'
import { PruefKacheln, type PruefKachelDaten } from './PruefKacheln'

/**
 * A1 — Kein warmes Wasser. Der Einstieg, und die **Signaturübung** dieses
 * Berufs: *Suchen.* Kein anderer der vier Tage hat eine Übung, in der man
 * nicht baut, sondern herausfindet.
 *
 * Drei Takte: **suchen** (drei Prüfungen aus sechs) → **entscheiden** (auf die
 * Ursache tippen) → **gelöst** (was das für die Person bedeutet, bei der man
 * war). Der Screen wächst dabei nicht, er wird ausgetauscht (`Wechsel`).
 *
 * **Den Takt wechselt immer ein Tap, nie ein Zähler.** Auch nach der dritten
 * Prüfung bleibt der Screen stehen, bis der Besucher „Ich weiß, woran es liegt"
 * drückt — sonst tauscht der `Wechsel` die Ergebnisfläche in demselben Render
 * aus, in dem sie das dritte Ergebnis bekommen hat, und der Befund, auf dem der
 * Fall steht, wäre nie zu lesen.
 *
 * **Der Preis eines Fehlers ist eine zweite Anfahrt** — nicht Material
 * (Dachdecker), nicht Taktzeit (Zimmerer), nicht das Werkzeug (Zerspanung).
 * Deshalb steht bei einer falschen Ursache kein Tadel, sondern eine Folge in
 * der Welt: du wärst morgen noch einmal hingefahren. Blockiert wird nichts,
 * ein zweiter Versuch ist offen, und nach dem Fehlgriff zeigt der Screen,
 * **welche Prüfung die entscheidende gewesen wäre** — ohne Note.
 *
 * **Die Störung, die sechs Prüfungen und die richtige Ursache gehören
 * fachlich gegengelesen:** eine plausible,
 * aber falsche Fehlersuche vor einem interessierten Publikum ist die
 * schlechteste Sorte Fehler. Der Fall ist deshalb bewusst **zahlenfrei**
 * gebaut — kein Grad, kein Bar, kein Messwert, den jemand für einen Beleg
 * halten könnte. Er lebt von einem Widerspruch: der Speicher ist kalt, die
 * Regelung hält ihn für voll geladen. Wer beides prüft, hat die Ursache.
 *
 * **Die Uhr steht im Panel und nicht oben rechts auf der Bühne.** Sie
 * erfüllt ihren Zweck — nicht als Druck, sondern als Anzeige — auch neben der
 * Aufgabe, und dafür die Hülle zu ändern wäre ein Eingriff für alle Tage.
 * (Die Ecke oben rechts war früher vom zeitgesteuerten Einwurf besetzt; der
 * ist entfallen und liegt jetzt in der Warum-Zeile im Panel.)
 *
 * **`answers.a1`** `{ geprueft, ursache, richtig }`.
 */

// ---------------------------------------------------------------------------
// Der Fall — Text und Takt gebündelt oben
// ---------------------------------------------------------------------------

/** Drei Prüfungen sind frei. Danach entscheidet man — oder früher. */
const PRUEFUNGEN_FREI = 3

/**
 * Wie lange die Zeichnung einen Prüfpunkt als „wird gerade geprüft" zeigt.
 * Ein Puls, kein Ladebalken: der Screen wartet auf nichts, er markiert nur
 * kurz, wo man eben hingefasst hat.
 */
const PULS_MS = 1600

/** Angekommen bei Frau Osei. */
const ANKUNFT = { stunde: 7, minute: 40 }
/** Was eine Prüfung an Zeit kostet. Anzeige, kein Druck. */
const MINUTEN_JE_PRUEFUNG = 8
/**
 * Wieder im Auto. **Vierzig Minuten** — so lange dauert der erste Auftrag,
 * dann ist er gelöst.
 */
const ABFAHRT = { stunde: 8, minute: 20 }

/** Wo die sechs Bauteilfotos liegen. Herkunft und Lizenzen: `MEDIEN.md`. */
const BILDER = '/medien/media/anlagenmechaniker'

interface Pruefung extends PruefKachelDaten {
  frage: string
  ergebnis: string
}

/**
 * Sechs Prüfungen, drei davon frei. Jede schließt etwas aus oder bestätigt
 * etwas — keine ist wertlos, und keine ist eine Falle.
 *
 * `speicher` und `regelung` sind das Paar, das den Fall löst: erst anfassen,
 * dann ablesen, was die Anlage über sich selbst behauptet.
 *
 * Jede Prüfung trägt ihr **Foto und ihr Label** gleich mit (`PruefKachelDaten`):
 * die Kachel und ihr Befund gehören zusammen, und zwei Listen mit denselben
 * sechs Ids in zwei Dateien laufen auseinander.
 */
const PRUEFUNGEN: readonly Pruefung[] = [
  {
    id: 'kessel',
    label: 'Kessel',
    bild: `${BILDER}/pruefung-kessel.webp`,
    frage: 'Läuft der Kessel?',
    // Ohne „Vorlauf": das Wort fiele hier unerklärt — der Glossar-Chip
    // erreicht diesen String nicht, und die Beobachtung geht auch ohne ihn.
    // „Kessel" statt „Wärmeerzeuger": dasselbe Ding, das kürzere Wort, und es
    // steht so auf der Kachel.
    ergebnis:
      'Er läuft. Das Wasser geht heiß hinaus, die Heizkörper werden warm. Am Kessel liegt es nicht.',
  },
  {
    id: 'speicher',
    label: 'Speicher',
    bild: `${BILDER}/pruefung-speicher.webp`,
    frage: 'Wie warm ist der Speicher?',
    ergebnis: 'Kalt. Nicht lauwarm — kalt. Hier ist seit Stunden keine Wärme angekommen.',
  },
  {
    id: 'regelung',
    label: 'Regelung',
    bild: `${BILDER}/pruefung-regelung.webp`,
    frage: 'Was zeigt die Regelung an?',
    // Ohne „das passt nicht zu dem, was du gerade angefasst hast": das stimmte
    // nur, wenn der Speicher schon dran war. Der Satz trägt jetzt in beiden
    // Reihenfolgen.
    ergebnis:
      'Sie meldet: Der Speicher ist voll geladen. Deshalb heizt sie nicht nach. Ob das stimmt, weiß nur, wer den Speicher selbst prüft.',
  },
  {
    id: 'ladepumpe',
    label: 'Ladepumpe',
    bild: `${BILDER}/pruefung-ladepumpe.webp`,
    frage: 'Läuft die Speicherladepumpe?',
    ergebnis: 'Sie steht still. Strom hat sie. Es fordert sie nur gerade niemand an.',
  },
  {
    id: 'zirkulation',
    label: 'Zirkulation',
    bild: `${BILDER}/pruefung-zirkulation.webp`,
    frage: 'Läuft die Zirkulation?',
    ergebnis:
      'Die Zirkulationspumpe läuft nach ihrem Zeitplan. Sie hält warmes Wasser in Bewegung; machen kann sie keins.',
  },
  {
    id: 'mischer',
    label: 'Mischer',
    bild: `${BILDER}/pruefung-mischer.webp`,
    frage: 'Steht der Mischer richtig?',
    ergebnis:
      'Der Mischer steht, wo er stehen soll, und lässt sich leicht verstellen. Er kann nur mischen, was bei ihm ankommt.',
  },
]

/** Die Prüfung, an der der Fall kippt — sie steht im Fehlerfall auf dem Screen. */
const ENTSCHEIDEND = 'regelung'

interface Ursache {
  id: string
  label: string
  /** Was passiert wäre. Bei der falschen Wahl: die zweite Anfahrt. */
  folge: string
}

const URSACHEN: readonly Ursache[] = [
  {
    id: 'kessel',
    label: 'Der Kessel macht keine Wärme mehr',
    folge:
      'Der Kessel läuft, und die Heizkörper im Haus beweisen es. Ein neuer Kessel hätte am warmen Wasser nichts geändert — und du wärst am nächsten Tag noch einmal hergefahren.',
  },
  {
    id: 'ladepumpe',
    label: 'Die Speicherladepumpe ist defekt',
    folge:
      'Die Pumpe steht, das stimmt. Sie steht aber, weil niemand sie anfordert — eine neue hätte genauso stillgestanden. Und du wärst am nächsten Tag noch einmal hergefahren.',
  },
  {
    id: 'fuehler',
    label: 'Der Speicherfühler meldet falsch',
    folge:
      'Der Fühler erzählt der Regelung, der Speicher sei voll geladen. Also heizt sie nicht nach — die Heizung läuft weiter, das warme Wasser bleibt aus. Fühler getauscht, Speicher lädt, fertig.',
  },
  {
    id: 'zirkulation',
    label: 'Die Zirkulationspumpe ist ausgefallen',
    folge:
      'Ohne Zirkulation dauert es länger, bis oben warmes Wasser ankommt — es kommt aber welches. Hier kommt gar keins. Und du wärst am nächsten Tag noch einmal hergefahren.',
  },
  {
    id: 'mischer',
    label: 'Der Mischer ist verstellt',
    folge:
      'Ein verstellter Mischer macht das Wasser zu kühl, nicht kalt. Der Speicher dahinter ist kalt — daran ändert die Einstellung nichts. Und du wärst am nächsten Tag noch einmal hergefahren.',
  },
]

const RICHTIG = 'fuehler'

const uhr = (stunde: number, minute: number) =>
  `${stunde}:${minute.toString().padStart(2, '0')} Uhr`

export function A1() {
  const schmal = useSchmal()
  const gespeichert = useFortschritt().answers.a1
  const [geprueft, setGeprueft] = useState<string[]>(() => gespeichert?.geprueft ?? [])
  const [entscheiden, setEntscheiden] = useState(() => !!gespeichert?.ursache)
  const [gewaehlt, setGewaehlt] = useState<string | null>(
    () => gespeichert?.ursache ?? null,
  )
  const [geloest, setGeloest] = useState(() => !!gespeichert?.richtig)
  const [daneben, setDaneben] = useState<string | null>(null)
  const [laeuft, setLaeuft] = useState<string | null>(null)

  // Der Puls auf der Zeichnung. Er läuft aus, er wartet nicht: nichts im Screen
  // hängt daran, und wer sofort die nächste Prüfung tippt, setzt ihn um.
  useEffect(() => {
    if (!laeuft) return
    const uhr = setTimeout(() => setLaeuft(null), PULS_MS)
    return () => clearTimeout(uhr)
  }, [laeuft])

  const pruefe = (id: string) => {
    if (geprueft.includes(id) || geprueft.length >= PRUEFUNGEN_FREI) return
    const neu = [...geprueft, id]
    setGeprueft(neu)
    setLaeuft(id)
    merkeAntwort('a1', { geprueft: neu, ursache: gewaehlt, richtig: geloest })
    // **Kein automatischer Taktwechsel nach der dritten Prüfung.** Sonst
    // tauscht der `Wechsel` die Ergebnisfläche im selben Render aus, und
    // ausgerechnet das dritte Ergebnis — oft der Satz, an dem der Fall kippt —
    // bekäme niemand zu lesen. Weiter geht es über „Ich weiß, woran es liegt".
  }

  const entscheide = (id: string) => {
    setGewaehlt(id)
    const treffer = id === RICHTIG
    setDaneben(treffer ? null : id)
    setGeloest(treffer)
    merkeAntwort('a1', { geprueft, ursache: id, richtig: treffer })
  }

  const offeneP = PRUEFUNGEN_FREI - geprueft.length
  const takt = geloest ? 'geloest' : entscheiden ? 'entscheiden' : 'suchen'

  return (
    <StepShell
      id="A1"
      auftrag={
        geloest
          ? null
          : entscheiden
            ? 'Sag, woran es liegt.'
            : 'Tipp an, was du prüfen willst.'
      }
      ansage={null}
      // Nur die Entscheidung braucht quer die breite Spalte (fünf
      // ausformulierte Ursachen). Während der Suche reicht den sechs
      // Foto-Kacheln die normale — und die Zeichnung behält daneben genug
      // Fläche, dass ihre Protokoll-Haken lesbar bleiben. Die sind jetzt das
      // einzige Protokoll des Screens.
      karteBreit={entscheiden || geloest}
      interaktionOffen={!geloest}
      buehne={
        <Schnitt
          zustand={{
            szene: 'anlage',
            geprueft,
            laeuft,
            // Erst der Treffer bekommt die Auszeichnung auf der Zeichnung.
            // Gäbe man den Fehlgriff durch, hätte ausgerechnet die falsche
            // Antwort den warmen Ring — und die richtige (`fuehler`) hat auf
            // diesem Ausschnitt gar keinen Punkt.
            ursache: geloest ? gewaehlt : null,
            geloest,
          }}
          // Kein `onPruefpunkt` mehr: geprüft wird auf den Foto-Kacheln im
          // Panel (`PruefKacheln`). Die Zeichnung führt Protokoll — Haken an
          // den geprüften Punkten, Puls am zuletzt angefassten.
          //
          // Damit hat `onPruefpunkt` in `Schnitt`/`Anlage` **keinen Aufrufer
          // mehr**. Der tote Ast bleibt vorerst absichtlich stehen: an der
          // Bühne wird gerade parallel gearbeitet (A6), und der Rückbau ist
          // separat eingeplant — nicht hier nebenbei erledigen.
        />
      }
      /*
        Eine Fassung statt zweier. Die lange gab es, weil die sechs Prüfungen
        auf einem Handy hochkant sonst unter der Scrollkante lagen — dieser
        Grund ist mit der geschlossenen Warum-Zeile weg.

        Geblieben ist die Ausgangslage („Heizung warm, Wasser kalt") und
        **ein** Fachwort: „Zirkulation" kommt in diesem Tag kein zweites Mal
        vor, obwohl „Läuft die Zirkulation?" eine der sechs Prüfungen ist.
      */
      warum={
        <p>
          Heizung warm, Wasser kalt. Dazwischen liegen Speicher, Pumpe, Regelung und die{' '}
          <Fachwort id="zirkulation">Zirkulation</Fachwort> — man tauscht nicht, man
          grenzt ein.
        </p>
      }
      interaktion={
        <Wechsel takt={takt}>
          {geloest ? (
            <Geloest />
          ) : entscheiden ? (
            <Entscheiden
              geprueft={geprueft}
              daneben={daneben}
              onWaehle={entscheide}
              schmal={schmal}
            />
          ) : (
            <Suchen
              geprueft={geprueft}
              offen={offeneP}
              onPruefe={pruefe}
              schmal={schmal}
            />
          )}
        </Wechsel>
      }
      aha={
        <AhaKarte sichtbar={geloest} eyebrow="Warum ist die Rechnung dreistellig?">
          Das Teil, das ich getauscht habe, kostet ein paar Euro. Die Rechnung wird
          trotzdem dreistellig — Anfahrt, eine Stunde Kundendienst, Mehrwertsteuer. In
          dieser einen Stunde stecken Auto, Werkzeug, Werkstatt und Büro; beim Betrieb
          bleiben davon wenige Prozent. Bezahlt wird nicht das Teil. Bezahlt wird, dass
          jemand weiß, wo er hinschauen muss.
        </AhaKarte>
      }
      fuss={
        <StepFuss
          id="A1"
          uebungOffen={!geloest}
          aktion={
            !geloest && !entscheiden ? (
              <Button
                variant="aktion"
                onClick={() => setEntscheiden(true)}
                data-testid="a1-entscheiden"
              >
                Ich weiß, woran es liegt
              </Button>
            ) : null
          }
          geschafft={geloest ? 'Störung gefunden' : null}
        />
      }
    />
  )
}

// ---------------------------------------------------------------------------
// Takt 1 — suchen
// ---------------------------------------------------------------------------

/**
 * Takt 1 — **die Suche findet auf sechs Foto-Kacheln statt.**
 *
 * ---
 *
 * **Der dritte Anlauf für dieselbe Handlung, und warum.** Zuerst war die
 * Suche eine Liste aus sechs Fragen — sechs deutsche Komposita, von denen
 * vier der Zielgruppe nichts sagen. Dann bediente die Zeichnung: sechs
 * Prüfpunkte auf dem Anlagenausschnitt, jeder an dem Ding, um das es geht.
 * Besser — aber ein Kreis an einem grauen Vektorkasten zeigt immer noch ein
 * Symbol, kein Ding. Jetzt tragen **echte Fotos** die Wahl (`PruefKacheln`):
 * eine rote Pumpe ist eine Pumpe, ein Speicher mit Kupferrohren ein
 * Speicher. Dazu füllt das Raster die Panelfläche, die auf dem Tablet
 * vorher leer neben der Zeichnung lag.
 *
 * Geblieben ist alles, was den Screen inhaltlich trägt: dieselben sechs
 * Prüfungen, dieselben Befunde, dieselbe Uhr, dieselbe Entscheidung danach.
 * Und die Zeichnung bleibt als Kulisse stehen und führt **Protokoll** —
 * Haken an den geprüften Punkten —, damit die Entscheidung danach auf etwas
 * Sichtbarem fußt. Die frühere Haken-Liste im Panel ist dafür entfallen:
 * dieselben Haken sitzen jetzt auf den Kacheln selbst.
 */
function Suchen({
  geprueft,
  offen,
  onPruefe,
  schmal = false,
}: {
  geprueft: string[]
  offen: number
  onPruefe: (id: string) => void
  /** Handy hochkant: kürzere Zeilen, damit das Ergebnis ins Fenster passt. */
  schmal?: boolean
}) {
  const zuletzt = geprueft.at(-1)
  const letzte = PRUEFUNGEN.find((p) => p.id === zuletzt)

  /**
   * Der Befund holt sich selbst ins Bild — dasselbe Muster (und derselbe
   * Frame-Versatz) wie in `Rueckmeldung`. Der Grund: Handy hochkant stapelt
   * das Raster drei Zeilen hoch, und wer die unterste Kachel tippt, hat die
   * Antwort darauf oberhalb der Scrollkante. `nearest` scrollt nur so weit
   * wie nötig; auf dem Tablet, wo alles ins Fenster passt, tut es nichts.
   */
  const befundAnker = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!zuletzt) return
    const id = requestAnimationFrame(() => {
      befundAnker.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    })
    return () => cancelAnimationFrame(id)
  }, [zuletzt])

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="text-[1.125rem] font-semibold text-kh-paper sm:text-[1.25rem]">
          {offen > 0
            ? schmal
              ? `Noch ${offen} von drei.`
              : `Noch ${offen} von drei Prüfungen.`
            : schmal
              ? 'Jetzt entscheidest du.'
              : 'Das waren deine drei Prüfungen. Jetzt entscheidest du.'}
        </p>
        <Uhr geprueft={geprueft.length} />
      </div>

      {/*
        Eine Ergebnisfläche, kein Stapel: die zweite Prüfung schreibt ihren
        Befund dorthin, wo der erste stand. Sie steht **über** dem Raster,
        damit der Tap auf eine Kachel seine Antwort im Fenster hat und nicht
        unter der Scrollkante.
      */}
      {/*
        Der Anker liegt **um** den `Wechsel`, nicht im Takt: das Feld darin
        wird beim Tap aus- und wieder eingehängt, und im Moment des Effekts
        zeigte ein innerer Ref noch auf das alte (oder gar kein) Element —
        dieselbe Falle, die `Rueckmeldung` dokumentiert.
      */}
      <div ref={befundAnker}>
        <Wechsel takt={zuletzt ?? 'nichts'}>
          {letzte ? (
            <div className="kh-feld px-4 py-3" data-testid="a1-ergebnis">
              <p className="kh-etikett">{letzte.frage}</p>
              <p className="mt-1 text-[1.0625rem] leading-[1.45] text-kh-paper/90">
                {letzte.ergebnis}
              </p>
            </div>
          ) : (
            // Der Imperativ steht einmal, im Auftragsband. Hier steht nur,
            // was er kostet.
            <p className="px-1 text-[1rem] text-kh-paper/70">
              {schmal
                ? 'Jede Prüfung schließt etwas aus — und kostet Zeit.'
                : 'Jede Prüfung schließt etwas aus oder bestätigt etwas. Und jede kostet Zeit — danach wartet die nächste Adresse.'}
            </p>
          )}
        </Wechsel>
      </div>

      <PruefKacheln
        kacheln={PRUEFUNGEN}
        geprueft={geprueft}
        tippbar={offen > 0}
        onPruefe={onPruefe}
      />
    </div>
  )
}

/**
 * Die Uhr. Anzeige, kein Druck: sie zählt nicht rückwärts, sie blinkt nicht,
 * und sie sperrt nichts. Sie sagt nur, dass eine Prüfung Zeit kostet — der
 * Grund, warum in diesem Beruf systematisch gesucht und nicht geraten wird.
 */
function Uhr({ geprueft }: { geprueft: number }) {
  const minuten = ANKUNFT.minute + geprueft * MINUTEN_JE_PRUEFUNG
  const stunde = ANKUNFT.stunde + Math.floor(minuten / 60)
  return (
    <p
      data-testid="a1-uhr"
      className="flex items-center gap-2 text-[1.0625rem] text-kh-mute tabular-nums"
    >
      <Clock className="size-[1.1em] shrink-0" strokeWidth={2.25} aria-hidden />
      {uhr(stunde, minuten % 60)}
    </p>
  )
}

// ---------------------------------------------------------------------------
// Takt 2 — entscheiden
// ---------------------------------------------------------------------------

/**
 * **Nach einem Fehlgriff schrumpft schmal die Liste, nicht die Lektion.**
 *
 * Gemessen auf 390 × 844 (`tmp/sicht/a3-a1.mjs`): fünf Ursachen (380 px), Folge
 * (172 px) und Schlüsselfeld (221 px) ergeben 271 px unter der Kante — die
 * Folge war zu einem Drittel zu sehen, „Entscheidend gewesen wäre …" gar
 * nicht. Damit lag ausgerechnet das unter der Kante, was der Fehlgriff auf
 * diesem Tag *ist*: nicht ein Tadel, sondern eine zweite Anfahrt und die
 * Prüfung, an der der Fall gekippt wäre.
 *
 * Die Liste über die Lektion zu schieben hätte nur getauscht, wer unten liegt.
 * Stattdessen klappt sie schmal zusammen: an ihrer Stelle steht eine Zeile
 * *Noch einmal wählen*, die sie auf Tipp zurückholt. Das darf sie, weil sie an
 * dieser Stelle **schon gelesen ist** — vor dem Fehlgriff stand sie
 * vollständig im Fenster (Rest 0, 5 von 5 Flächen ganz sichtbar), und der
 * Fehlgriff war der Tap auf eine davon. Beim zweiten Versuch stehen wieder
 * alle fünf da, diesmal mit der Folge im Rücken: nichts streichen, nur nicht
 * alles gleichzeitig zeigen.
 *
 * Quer bleibt die Liste offen — dort trägt das Fenster beides, seit der
 * Fachtext im Takt *entscheiden* nicht mehr mitläuft.
 */
function Entscheiden({
  geprueft,
  daneben,
  onWaehle,
  schmal = false,
}: {
  geprueft: string[]
  daneben: string | null
  onWaehle: (id: string) => void
  /** Handy hochkant: die Liste klappt nach einem Fehlgriff zusammen. */
  schmal?: boolean
}) {
  const fehlgriff = daneben ? URSACHEN.find((u) => u.id === daneben) : undefined
  const schluessel = PRUEFUNGEN.find((p) => p.id === ENTSCHEIDEND)
  const hatSchluessel = geprueft.includes(ENTSCHEIDEND)

  const [wiederAuf, setWiederAuf] = useState(false)
  const listeAuf = !schmal || !fehlgriff || wiederAuf
  // Jeder neue Griff klappt wieder zu: sonst stünde nach dem zweiten
  // Fehlversuch dieselbe Liste über einer Folge, die niemand sieht.
  const waehle = (id: string) => {
    setWiederAuf(false)
    onWaehle(id)
  }

  return (
    <div className="flex flex-col gap-3">
      {listeAuf ? (
        <p className="text-[1.125rem] font-semibold text-kh-paper sm:text-[1.25rem]">
          Woran liegt es?
        </p>
      ) : (
        /*
          Die Zeile ersetzt Überschrift **und** Liste — „Woran liegt es?" über
          einem zugeklappten Griff wäre zweimal dieselbe Frage in 90 px.
        */
        <button
          type="button"
          onClick={() => setWiederAuf(true)}
          aria-expanded={false}
          data-testid="a1-nochmal"
          className="kh-feld flex min-h-[48px] w-full items-center justify-between gap-3 px-4 py-2.5 text-left"
        >
          <span className="text-[1.125rem] font-semibold text-kh-paper">
            Noch einmal wählen
          </span>
          <ChevronDown
            aria-hidden
            className="size-5 shrink-0 text-kh-paper/50"
            strokeWidth={2.25}
          />
        </button>
      )}

      {listeAuf && (
        <div className="grid gap-2 landscape:grid-cols-2">
          {/*
          Keine der Flächen bleibt markiert. Gelbgrün heißt im ganzen System
          „das hast du geschafft" — und eine falsche Ursache in Signalfarbe
          stehen zu lassen wäre das Gegenteil davon. Trifft der Tap, wechselt
          der Takt ohnehin; trifft er nicht, steht die Folge darunter.
        */}
          {URSACHEN.map((u) => (
            <Wahlflaeche
              key={u.id}
              onClick={() => waehle(u.id)}
              data-testid={`a1-ursache-${u.id}`}
            >
              {u.label}
            </Wahlflaeche>
          ))}
        </div>
      )}

      <Rueckmeldung
        ok={fehlgriff ? false : null}
        text={fehlgriff ? fehlgriff.folge : null}
        testid="a1-rueckmeldung"
      />

      {/*
        Ohne Note: kein „falsch", sondern die eine
        Prüfung, an der der Fall gekippt wäre. Wer sie schon gemacht hat,
        bekommt sie noch einmal vorgelegt — wer nicht, bekommt sie hier
        nachgereicht. Danach darf er noch einmal tippen.

        Der Schluss nennt den Speicher-Befund **ausdrücklich**: Wer den
        Speicher nie angefasst hat, weiß sonst nicht, wovon der letzte Satz
        redet — und der Regelung-Befund allein endet offen („ob das stimmt
        …"), was hier ohne Auflösung ein Widerspruch wäre.
      */}
      {fehlgriff && schluessel && (
        <div className="kh-feld px-4 py-3" data-testid="a1-schluessel">
          <p className="kh-etikett">
            {hatSchluessel ? 'Das hattest du schon' : 'Entscheidend gewesen wäre'}
          </p>
          <p className="mt-1 text-[1.0625rem] leading-[1.45] text-kh-paper/90">
            {schluessel.frage} — {schluessel.ergebnis} Und der Speicher selbst? Der ist
            kalt, seit Stunden ohne Wärme. Ein kalter Speicher, den die Regelung für voll
            geladen hält: Das kann nur einer erzählt haben.
          </p>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Takt 3 — gelöst
// ---------------------------------------------------------------------------

/**
 * Was die gelöste Störung bewirkt hat — der stärkste Moment der Anwendung,
 * und er trägt nur, wenn man ihn in Ruhe lässt: **ein Satz, kein
 * Foto, keine Rührung.** Die Zurückhaltung ist das, was ihn trägt.
 */
function Geloest() {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[1.0625rem] leading-[1.45] text-kh-paper/90">
        Fühler getauscht, Speicher lädt, Wasser wird warm. Um{' '}
        {uhr(ABFAHRT.stunde, ABFAHRT.minute)} sitzt du wieder im Transporter — vierzig
        Minuten für alles zusammen.
      </p>

      <motion.p
        initial={{ opacity: 0, transform: 'translateY(10px)' }}
        animate={{ opacity: 1, transform: 'translateY(0px)' }}
        transition={{ duration: 0.7, delay: 0.5 }}
        data-testid="a1-satz"
        className="kh-titel-klein text-kh-orange"
      >
        „Sie ist vorher immer zum Nachbarn gegangen.“
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9, delay: 1.4 }}
        className="text-[1.0625rem] leading-[1.45] text-kh-paper/70"
      >
        Heute Abend duscht sie wieder zu Hause.
      </motion.p>
    </div>
  )
}
