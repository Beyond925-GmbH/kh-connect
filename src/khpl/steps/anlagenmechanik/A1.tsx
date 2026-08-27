import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Check, ChevronDown, Clock } from 'lucide-react'
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

/**
 * A1 — Kein warmes Wasser. Der Einstieg, und die **Signaturübung** dieses
 * Berufs: *Suchen.* Kein anderer der vier Tage hat eine Übung, in der man
 * nicht baut, sondern herausfindet (Spec 1 und 6, A1).
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
 * ⚠️ **Die Störung, die sechs Prüfungen und die richtige Ursache sind
 * `ENTWURF – UNGEPRÜFT` und fachlich abzunehmen** (Spec 11): „eine plausible,
 * aber falsche Fehlersuche vor einem interessierten Publikum ist die
 * schlechteste Sorte Fehler." Der Fall ist deshalb bewusst **zahlenfrei**
 * gebaut — kein Grad, kein Bar, kein Messwert, den jemand für einen Beleg
 * halten könnte. Er lebt von einem Widerspruch: der Speicher ist kalt, die
 * Regelung hält ihn für voll geladen. Wer beides prüft, hat die Ursache.
 *
 * **Die Uhr steht im Panel und nicht oben rechts auf der Bühne**, obwohl Spec 6
 * das so beschreibt. Sie erfüllt ihren Zweck („nicht als Druck, sondern als
 * Anzeige") auch neben der Aufgabe, und die Hülle dafür zu ändern verbietet
 * khpl-tage.md 6.2. (Der Grund, aus dem die Ecke oben rechts früher besetzt
 * war — der zeitgesteuerte Einwurf —, ist mit `khpl-vereinfachung.md`
 * entfallen; der Einwurf liegt jetzt in der Warum-Zeile im Panel.)
 *
 * **`answers.a1`** `{ geprueft, ursache, richtig }` (Spec 6).
 */

// ---------------------------------------------------------------------------
// Der Fall — Text und Takt gebündelt oben (flow 8.4)
// ---------------------------------------------------------------------------

/** Drei Prüfungen sind frei. Danach entscheidet man — oder früher (Spec 6). */
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
 * Wieder im Auto. **Vierzig Minuten** — die Dauer des ersten Auftrags steht
 * wörtlich in Spec 1 („der erste dauert vierzig Minuten und ist gelöst").
 */
const ABFAHRT = { stunde: 8, minute: 20 }

interface Pruefung {
  id: string
  frage: string
  ergebnis: string
}

/**
 * Sechs Prüfungen, drei davon frei. Jede schließt etwas aus oder bestätigt
 * etwas — keine ist wertlos, und keine ist eine Falle.
 *
 * `speicher` und `regelung` sind das Paar, das den Fall löst: erst anfassen,
 * dann ablesen, was die Anlage über sich selbst behauptet.
 */
const PRUEFUNGEN: readonly Pruefung[] = [
  {
    id: 'kessel',
    frage: 'Läuft der Kessel?',
    // Ohne „Vorlauf": das Wort fiele hier unerklärt (R10) — der Glossar-Chip
    // erreicht diesen String nicht, und die Beobachtung geht auch ohne ihn.
    ergebnis:
      'Er läuft. Das Wasser geht heiß hinaus, die Heizkörper werden warm. Am Wärmeerzeuger liegt es nicht.',
  },
  {
    id: 'speicher',
    frage: 'Wie warm ist der Speicher?',
    ergebnis: 'Kalt. Nicht lauwarm — kalt. Hier ist seit Stunden keine Wärme angekommen.',
  },
  {
    id: 'regelung',
    frage: 'Was zeigt die Regelung an?',
    ergebnis:
      'Sie meldet den Speicher als voll geladen und sieht keinen Grund nachzuheizen. Das passt nicht zu dem, was du gerade angefasst hast.',
  },
  {
    id: 'ladepumpe',
    frage: 'Läuft die Speicherladepumpe?',
    ergebnis:
      'Sie steht still. Strom hat sie — angefordert wird nur gerade nichts von ihr.',
  },
  {
    id: 'zirkulation',
    frage: 'Läuft die Zirkulation?',
    ergebnis:
      'Die Zirkulationspumpe läuft nach ihrem Zeitplan. Sie hält warmes Wasser in Bewegung; machen kann sie keins.',
  },
  {
    id: 'mischer',
    frage: 'Steht der Mischer richtig?',
    ergebnis:
      'Der Mischer steht, wo er stehen soll, und lässt sich gängig verstellen. Er kann nur mischen, was bei ihm ankommt.',
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
      auftrag={geloest ? null : 'Wähl drei Prüfungen und finde die Ursache.'}
      ansage={null}
      // Die sechs Prüfungen im Panel sind der Kern des Screens, die Anlage
      // daneben erklärt sie — quer darf die Spalte deshalb breiter werden.
      karteBreit
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
          onPruefpunkt={entscheiden || geloest || offeneP <= 0 ? undefined : pruefe}
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

  /*
    Eine Ergebnisfläche, kein Stapel: die zweite Prüfung schreibt ihr Ergebnis
    dorthin, wo die erste stand. Was man schon geprüft hat, steht als markierte
    Fläche daneben — man verliert nichts, aber das Panel wächst auch nicht mit
    jedem Tap.

    **Schmal steht sie über der Liste, sonst darunter.** Auf 390 × 844 passen
    Kopf, sechs Kacheln und Ergebnis zusammen nicht ins Fenster; irgendetwas
    liegt unter der Kante. Stand das Ergebnis unten, war es das Ergebnis —
    „Kalt. Nicht lauwarm — kalt. Hier ist seit …" brach mitten im Satz ab,
    und das ist der ganze Ertrag eines Taps. Über der Liste rutscht dafür die
    unterste Kachelreihe unter den Verlauf: sichtbar angeschnitten, erreichbar
    durch Scrollen, und nach der dritten Prüfung ohnehin gesperrt. Dieselbe
    Abwägung wie in A6 mit der `Rueckmeldung`.
  */
  const ergebnisfeld = (
    <Wechsel takt={zuletzt ?? 'nichts'}>
      {letzte ? (
        <div className="kh-feld px-4 py-3" data-testid="a1-ergebnis">
          <p className="kh-etikett">{letzte.frage}</p>
          <p className="mt-1 text-[1.0625rem] leading-[1.45] text-kh-paper/90">
            {letzte.ergebnis}
          </p>
        </div>
      ) : (
        <p className="px-1 text-[1rem] text-kh-paper/55">
          {schmal
            ? 'Jede Prüfung schließt etwas aus — und kostet Zeit.'
            : 'Jede Prüfung schließt etwas aus oder bestätigt etwas. Und jede kostet Zeit — danach wartet die nächste Adresse.'}
        </p>
      )}
    </Wechsel>
  )

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        {/*
          Schmal die kurze Fassung: die lange lief über zwei Zeilen und schob
          die Uhr auf eine dritte — 122 px Kopfzeile über einer Liste, die
          selbst nur 229 px braucht. Was sie sagt, sagen die Kacheln darunter
          ohnehin: sechs Fragen, von denen drei gehen.
        */}
        <p className="text-[1.125rem] font-semibold text-kh-paper sm:text-[1.25rem]">
          {offen > 0
            ? schmal
              ? 'Drei Prüfungen hast du.'
              : 'Drei Prüfungen hast du. Such dir aus, welche.'
            : schmal
              ? 'Jetzt entscheidest du.'
              : 'Das waren deine drei Prüfungen. Jetzt entscheidest du.'}
        </p>
        <Uhr geprueft={geprueft.length} />
      </div>

      {schmal && ergebnisfeld}

      {/*
        **Gelbgrün markiert höchstens eine Fläche, und nur die offene.**

        Die Vorfassung setzte `gewaehlt` auf jede erledigte Prüfung: nach drei
        Taps standen drei vollflächig gelbgrüne Balken über die ganze
        Panelbreite, dazu der ebenfalls gelbgrüne Aktionsknopf — vier
        Signalflächen auf einem Screen (Abnahme, A1). `index.css` reserviert das
        Warnwesten-Gelbgrün für „das hast du geschafft"; „schon angetippt" ist
        etwas anderes.

        Jetzt dieselbe Geste wie in A2 und A4.1 an diesem Tag: markiert ist die
        Prüfung, deren Ergebnis gerade im Feld steht, alle anderen erledigten
        tragen einen Haken. Erledigtes bleibt sichtbar, ohne zu leuchten.
      */}
      {/*
        Zwei Spalten auch auf dem Handy (`max-sm`): sechs einzeilige Flächen
        untereinander schoben drei davon unter die Scrollkante — und wer nicht
        scrollt, wählt aus der halben Auswahl (Sichtprüfung, A1 handy-hoch).
        Die Fragen sind kurz genug für die halbe Breite; nur
        „Speicherladepumpe" braucht die Trennhilfe (`hyphens-auto`).
      */}
      <div className="grid gap-2 max-sm:grid-cols-2 landscape:grid-cols-2">
        {PRUEFUNGEN.map((p) => {
          const fertig = geprueft.includes(p.id)
          return (
            <Wahlflaeche
              key={p.id}
              onClick={() => onPruefe(p.id)}
              // Die schon gemachten Prüfungen bleiben stehen und bleiben
              // lesbar — gesperrt sind nur die, für die keine Zeit mehr ist.
              disabled={!fertig && offen <= 0}
              gewaehlt={fertig && p.id === zuletzt}
              className="max-sm:px-3 max-sm:py-2.5 max-sm:leading-snug max-sm:break-words max-sm:hyphens-auto"
              lang="de"
              data-testid={`a1-pruefung-${p.id}`}
            >
              {fertig && p.id !== zuletzt && (
                <Check
                  className="size-4 shrink-0 text-kh-signal"
                  strokeWidth={3}
                  aria-hidden
                />
              )}
              {p.frage}
            </Wahlflaeche>
          )
        })}
      </div>

      {!schmal && ergebnisfeld}
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
 * alle fünf da, diesmal mit der Folge im Rücken. Dieselbe Antwort wie in Z7
 * der Zerspanung: nichts streichen, nur nicht alles gleichzeitig zeigen.
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
        Ohne Note, wie die Spec es verlangt: kein „falsch", sondern die eine
        Prüfung, an der der Fall gekippt wäre. Wer sie schon gemacht hat,
        bekommt sie noch einmal vorgelegt — wer nicht, bekommt sie hier
        nachgereicht. Danach darf er noch einmal tippen.
      */}
      {fehlgriff && schluessel && (
        <div className="kh-feld px-4 py-3" data-testid="a1-schluessel">
          <p className="kh-etikett">
            {hatSchluessel ? 'Das hattest du schon' : 'Entscheidend gewesen wäre'}
          </p>
          <p className="mt-1 text-[1.0625rem] leading-[1.45] text-kh-paper/90">
            {schluessel.frage} — {schluessel.ergebnis} Ein kalter Speicher, den die
            Regelung für voll geladen hält: Das kann nur einer erzählt haben.
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
 * Was die gelöste Störung bewirkt hat — der stärkste Moment der Anwendung
 * (Spec 6, A1), und er trägt nur, wenn man ihn in Ruhe lässt: **ein Satz, kein
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
