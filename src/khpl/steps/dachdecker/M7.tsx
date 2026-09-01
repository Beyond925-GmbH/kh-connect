import { Suspense, lazy, useEffect, useMemo, useState } from 'react'
import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dachstuhl3DFallback } from '@/khpl/buehne/Dachstuhl3DFallback'
import {
  M5_SCHRITTE,
  M7_SCHRITTE,
  M7_START,
  type Bauschritt,
} from '@/khpl/buehne/aufbauabschnitte'
import { AhaKarte } from '@/khpl/komponenten/AhaKarte'
import { DachSchema } from '@/khpl/komponenten/DachSchema'
import { Rueckmeldung } from '@/khpl/komponenten/Rueckmeldung'
import { Wechsel } from '@/khpl/komponenten/Wechsel'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { merkeAntwort, useFortschritt } from '@/khpl/store/fortschritt'

/**
 * M7 — Jetzt du.
 *
 * **Zweite Hälfte des Lernpaars.** Gleiche Grafik wie M5,
 * gedrehte Rolle. Erst läuft die zweite Hälfte einmal komplett durch, dann
 * spult sie zurück, dann baut der Besucher sie selbst.
 *
 * **Was hier zuletzt gekippt wurde: aus fünf Karten wurden zwei.**
 *
 * Der Screen legte alle noch offenen Bauteile gleichzeitig aus und ließ sie in
 * die richtige Reihenfolge ziehen. Am Stand hieß das: fünf Fachwörter, von
 * denen ein Fünfzehnjähriger keines kennt, eine Reihenfolge, die sich nach
 * einer Vorführung niemand merkt, und ein falscher Zug, der das Teil
 * zurückschnappen lässt, ohne dass der Bau weitergeht. Wer zweimal daneben
 * lag, hat aufgehört.
 *
 * Jetzt steht in jeder Runde **eine Frage mit zwei Bildern**: das Teil, das
 * dran ist, und eines, das später kommt — beide groß als Querschnitt-Schema,
 * das zeigt, wo das Teil im Dach sitzt. Damit ist die Entscheidung ein
 * Blickvergleich und keine Vokabelprüfung, und die Trefferchance ist selbst
 * beim Raten fifty-fifty.
 *
 * **Falsch tippen hält niemanden auf.** Die richtige Karte leuchtet kurz auf,
 * die Rückmeldung sagt, warum das andere Teil noch nicht dran ist — und dann
 * wird trotzdem das richtige eingebaut. Das Dach wächst in jeder Runde, egal
 * wie getippt wurde: Die Belohnung ist die Animation, nicht die Punktzahl, und
 * ein Besucher, der die Reihenfolge nicht kennt, soll den fertigen Dachstuhl
 * trotzdem sehen. Deshalb gibt es hier auch kein „Zeig mir wie“ mehr — es hat
 * nur noch abgenommen, was ohnehin von selbst weitergeht.
 *
 * In der letzten Runde ist nur noch ein Teil übrig; dann steht auch nur eine
 * Karte da. Das ist kein Sonderfall, sondern der Schlusstipp aufs fertige Dach.
 *
 * Hier hat der Fuß keine eigene Aktion: die Bühne ist die Handlung. Solange
 * das Dach nicht steht, trägt er nur das leise Überspringen (`uebungOffen`).
 */

const Dachstuhl3D = lazy(() => import('@/khpl/buehne/Dachstuhl3D'))

/**
 * Wie lange die Auflösung stehen bleibt, bevor das richtige Teil einfliegt.
 *
 * Ohne diese Pause ersetzt die nächste Frage die Karten in derselben
 * Sekunde, in der getippt wurde — und wer danebenlag, sieht nie, welches Bild
 * das richtige war. Die Pause ist genau der Moment, in dem Bild und Name
 * zusammenfinden.
 */
const AUFLOESUNG_MS = 1100

/**
 * Takt des Screens.
 *
 *   zeigen   — die zweite Hälfte läuft einmal durch (Vorführung)
 *   zurueck  — dasselbe im Schnelldurchlauf rückwärts, bis zum Ausgangsstand
 *   bauen    — die Abfrage
 *
 * `zurueck` ist kein Zwischenschritt aus Verlegenheit, sondern der Moment, in
 * dem der Screen seine Aufgabe stellt: die Teile verschwinden wieder, eins
 * nach dem anderen, und was übrig bleibt, ist genau die Lücke, die zu füllen
 * ist. Ein harter Schnitt zurück auf den Anfangsstand hätte dieselbe Lücke
 * gezeigt, ohne zu sagen, woher sie kommt.
 */
type Takt = 'zeigen' | 'zurueck' | 'bauen'

/** Wie eine Karte gerade dasteht. `offen` = es ist noch nicht getippt. */
type Stand = 'offen' | 'richtig' | 'falsch' | 'blass'

/**
 * Die Reihenfolge, in der gewürfelt wird — einmal je Besuch.
 *
 * Sie entscheidet zweierlei: **welches** der späteren Teile als Gegenkarte
 * antritt und **auf welcher Seite** die richtige Karte steht. Ohne das wäre
 * die Frage „Was kommt als Nächstes aufs Dach?“ fünfmal damit beantwortet,
 * links zu tippen, ohne hinzusehen.
 *
 * Einmal beim Mounten, nicht bei jedem Rendern: sonst springen die Karten
 * unter dem Finger weg.
 */
function mische<T>(liste: T[]): T[] {
  const a = [...liste]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function M7() {
  const gespeichert = useFortschritt().answers.m7
  const [gesetzt, setGesetzt] = useState<string[]>(() => gespeichert?.gesetzt ?? [])
  const [meldung, setMeldung] = useState<{ text: string; ok: boolean } | null>(null)
  /** Was in dieser Runde getippt wurde — gesetzt, solange die Auflösung steht. */
  const [wahl, setWahl] = useState<string | null>(null)

  // Wer schon einmal hier war, hat die Vorführung gesehen — er steigt direkt
  // in die Abfrage ein. Alle anderen bekommen erst das ganze Dach zu sehen.
  const [takt, setTakt] = useState<Takt>(() =>
    (gespeichert?.gesetzt?.length ?? 0) > 0 ? 'bauen' : 'zeigen',
  )
  const [gezeigt, setGezeigt] = useState('')

  const [mischung] = useState(() => mische(M7_SCHRITTE.map((s) => s.label)))
  const rang = (schritt: Bauschritt) => mischung.indexOf(schritt.label)

  // `dran` folgt der Bauordnung. Die Gegenkarte ist immer ein Teil, das
  // **später** kommt — nur dann stimmt der `zufrueh`-Satz, der sie abweist.
  const dran = M7_SCHRITTE.find((s) => !gesetzt.includes(s.label))
  const spaeter = M7_SCHRITTE.filter(
    (s) => !gesetzt.includes(s.label) && s.label !== dran?.label,
  )
  const ablenker = [...spaeter].sort((a, b) => rang(a) - rang(b))[0]
  const fertig = dran === undefined

  /** Die zwei Karten dieser Runde, in gewürfelter Seitenlage. */
  const paar: Bauschritt[] = !dran
    ? []
    : !ablenker
      ? [dran]
      : rang(dran) < rang(ablenker)
        ? [dran, ablenker]
        : [ablenker, dran]

  /** Der Stand, den das Modell im Takt `bauen` zeigt. */
  const bauZielT = fertig
    ? M7_SCHRITTE[M7_SCHRITTE.length - 1].zielT
    : gesetzt.length === 0
      ? M7_START
      : (M7_SCHRITTE.find((s) => s.label === gesetzt[gesetzt.length - 1])?.zielT ??
        M7_START)

  const zielT = takt === 'zeigen' ? 1 : bauZielT
  // Vorführung gemächlich, Rücklauf im Schnelldurchlauf, Abfrage dazwischen:
  // beim Bauen wartet jemand auf das Ergebnis seiner eigenen Entscheidung.
  const dauer = takt === 'zeigen' ? 22 : takt === 'zurueck' ? 3 : 12

  /**
   * Was im Karten-Schema als „steht schon“ gezeichnet wird.
   *
   * Der Unterbau aus M5 gehört dazu, obwohl ihn niemand in **diesem** Step
   * gesetzt hat: er steht im Modell nebenan, und eine Vorschau, die ihn
   * weglässt, zeigte ein Dach, das es an keiner Stelle des Durchlaufs gibt.
   */
  const gebaut = useMemo(
    () => [...M5_SCHRITTE.map((s) => s.label), ...gesetzt],
    [gesetzt],
  )

  /**
   * Nach der Auflösung wird **immer** das richtige Teil eingebaut — auch nach
   * einem Fehltipp. Der Bau ist die Belohnung des Screens; ihn an die richtige
   * Antwort zu koppeln hieße, ihn dem vorzuenthalten, für den er gemacht ist.
   */
  useEffect(() => {
    if (wahl === null || !dran) return
    const id = setTimeout(() => {
      const neu = [...gesetzt, dran.label]
      setGesetzt(neu)
      merkeAntwort('m7', { gesetzt: neu, fertig: neu.length === M7_SCHRITTE.length })
      setWahl(null)
    }, AUFLOESUNG_MS)
    return () => clearTimeout(id)
  }, [wahl, dran, gesetzt])

  const waehle = (schritt: Bauschritt) => {
    if (wahl !== null || !dran) return
    setWahl(schritt.label)
    setMeldung(
      schritt.label === dran.label
        ? { text: dran.richtig, ok: true }
        : // Der Doppelpunkt umgeht Artikel und Zahl: „Richtig wäre: Kehlbalken.“
          // steht so neben „Richtig wäre: Sparrenpaare.“
          { text: `${schritt.zufrueh} Richtig wäre: ${dran.name}.`, ok: false },
    )
  }

  const stand = (schritt: Bauschritt): Stand => {
    if (wahl === null) return 'offen'
    if (schritt.label === dran?.label) return 'richtig'
    return schritt.label === wahl ? 'falsch' : 'blass'
  }

  return (
    <StepShell
      id="M7"
      /*
        Der Auftrag steht erst, wenn die Vorführung durch ist. Während
        `zeigen` und `zurueck` läuft, gibt es nichts zu tun — eine
        Aufforderung, die man noch nicht befolgen kann, ist eine Falle.
      */
      auftrag={
        takt === 'bauen' && !fertig ? 'Tipp an, was als Nächstes drankommt.' : null
      }
      // Antippen erklärt sich selbst (`komponenten/gesten.ts`): seit hier
      // nichts mehr gezogen wird, wäre eine Ansage davor eine Erklärung für
      // eine Geste, die es nicht gibt. Die Einordnung („gleich baust du sie
      // selbst“) trägt der Text neben der Vorführung.
      ansage={null}
      buehneInteraktiv
      interaktionOffen={!fertig}
      buehne={
        <Suspense fallback={<Dachstuhl3DFallback />}>
          <Dachstuhl3D
            zielT={zielT}
            startT={M7_START}
            dauer={dauer}
            // Der Anhänger steht weiter neben der Rohdecke und leert sich mit
            // jedem gesetzten Schritt — „zuletzt geladen ist zuerst gebraucht“.
            // Beim Schritt „Sparrenpaare“ wandert das markierte Stück vom
            // Anhänger ins Dach: derselbe Balken, den du in M4 zugeschnitten
            // hast, wird hier von dir eingebaut.
            kulisse
            deinSparren
            onPhase={setGezeigt}
            // Kette der Vorführung: durchlaufen, zurückspulen, übergeben. Im
            // Takt `bauen` feuert dieselbe Meldung nach jedem gesetzten Teil
            // und lässt den Takt bewusst unverändert.
            onAngekommen={() =>
              setTakt((t) => (t === 'zeigen' ? 'zurueck' : t === 'zurueck' ? 'bauen' : t))
            }
          />
        </Suspense>
      }
      warum={
        fertig ? (
          <p>
            Steht. Von der Fußpfette ganz unten bis zur letzten Dachlatte — in der
            Reihenfolge, in der es geht. Morgen kommen die Ziegel drauf.
          </p>
        ) : takt === 'bauen' ? null : ( // ein Fließtext daneben wäre nur Füllung. Also keiner. // Während gebaut wird, trägt allein das Auftragsband die Anweisung —
          <p>
            So sieht die zweite Hälfte fertig aus. Schau dir an, was in welcher
            Reihenfolge kommt — gleich baust du sie selbst.
          </p>
        )
      }
      interaktion={
        <Wechsel takt={takt === 'bauen' ? (fertig ? 'fertig' : 'bauen') : 'vorfuehrung'}>
          {takt !== 'bauen' ? (
            <Vorfuehrung label={gezeigt} zurueck={takt === 'zurueck'} />
          ) : fertig ? null : (
            // Eine Karte statt vier: Frage, Rückmeldung und Wahl gehören zu
            // einer Handlung, und übereinandergestapelte Einzelkarten zerlegen
            // den Screen in Kästchen.
            <div className="flex flex-col gap-2.5">
              <Frage anzahl={gesetzt.length} gesamt={M7_SCHRITTE.length} />

              <Rueckmeldung
                ok={meldung ? meldung.ok : null}
                text={meldung ? meldung.text : null}
                testid="m7-meldung"
              />

              <div
                className={`grid gap-2.5 ${paar.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}
              >
                {paar.map((s) => (
                  <Teilkarte
                    key={s.label}
                    schritt={s}
                    gebaut={gebaut}
                    stand={stand(s)}
                    onWaehle={() => waehle(s)}
                  />
                ))}
              </div>

              <div className="flex flex-wrap justify-start gap-2">
                <Button
                  variant="leise"
                  onClick={() => setTakt('zeigen')}
                  data-testid="m7-nochmal-zeigen"
                >
                  Noch mal zeigen
                </Button>
              </div>
            </div>
          )}
        </Wechsel>
      }
      aha={
        <AhaKarte sichtbar={fertig} eyebrow="Wie heißt das, was du gerade gemacht hast?">
          Aufrichten. Der Kran, der die Sparrenpaare einhebt, steht dafür einen Tag auf
          der Baustelle — den hast du vorhin beim Preis schon mitgerechnet.
        </AhaKarte>
      }
      fuss={
        <StepFuss
          id="M7"
          uebungOffen={!fertig}
          geschafft={fertig ? 'Dach steht' : null}
          // Während die Vorführung läuft, ist „Kenn ich schon“ die einzige
          // Handlung, die der Screen anbietet — also gehört sie an die
          // Primärposition unten rechts und nicht als grauer Text mitten ins
          // Panel. Vorher stand dort ein `variant="leise"`-Knopf ohne Kante
          // und ohne Fläche, während der Fuß daneben leer blieb.
          aktion={
            takt === 'zeigen' ? (
              <Button
                variant="aktion"
                onClick={() => setTakt('zurueck')}
                data-testid="m7-vorfuehrung-aus"
              >
                Kenn ich schon — los geht’s
              </Button>
            ) : undefined
          }
        />
      }
    />
  )
}

/**
 * Was während der Vorführung im Panel steht.
 *
 * Name **und** Ein-Satz-Erklärung dessen, was gerade einfliegt: drei
 * der fünf Begriffe kommen in M5 nie vor — die Vorführung ist die eine
 * Stelle, an der sie erklärt sind, bevor die Abfrage sie als Karten
 * abruft. Der Ausweg für den, der die Reihenfolge schon kennt, steht im Fuß
 * an der Primärposition, nicht hier.
 */
function Vorfuehrung({ label, zurueck }: { label: string; zurueck: boolean }) {
  const schritt = M7_SCHRITTE.find((s) => s.label === label)
  return (
    <div className="flex flex-col items-start gap-2.5" data-testid="m7-vorfuehrung">
      <div className="flex w-fit items-center gap-3 rounded-kh-pill border-2 border-kh-orange/40 bg-kh-orange/12 py-2.5 pr-5 pl-3">
        <span
          aria-hidden
          className="size-3 shrink-0 animate-puls rounded-full bg-kh-orange"
        />
        <span className="min-w-0">
          <span className="kh-etikett block text-kh-paper/50">
            {zurueck ? 'Und zurück auf Anfang' : 'Kommt aufs Dach'}
          </span>
          <p data-testid="m7-gezeigt" className="kh-titel-klein text-kh-orange">
            {zurueck ? 'Gleich bist du dran' : label || 'Sparrenpaare'}
          </p>
        </span>
      </div>
      {!zurueck && schritt && (
        <p
          data-testid="m7-gezeigt-was"
          className="text-[1.0625rem] leading-[1.45] text-kh-paper/85"
        >
          {schritt.was}
        </p>
      )}
    </div>
  )
}

/** Die Frage über den beiden Karten, mit dem Stand daneben. */
function Frage({ anzahl, gesamt }: { anzahl: number; gesamt: number }) {
  return (
    <div
      data-testid="m7-frage"
      className="flex items-center justify-between gap-3 rounded-kh border-2 border-kh-line-strong bg-white/[0.04] px-4 py-2.5"
    >
      <p className="text-[1.125rem] font-semibold text-kh-paper">
        Was kommt als Nächstes aufs Dach?
      </p>
      <span className="shrink-0 font-display text-[1.5rem] leading-none text-kh-paper/60 tabular-nums">
        {anzahl}/{gesamt}
      </span>
    </div>
  )
}

/**
 * Eine der beiden Karten, zwischen denen entschieden wird.
 *
 * **Das Bild ist die Karte.** Vorher saß dasselbe Schema als 44-px-Kachel
 * neben dem Wort — erkennbar war darauf nichts, die Entscheidung lief also
 * doch wieder über den Begriff. Jetzt nimmt der Querschnitt die volle
 * Kartenbreite ein: was schon steht, blass; das Teil, um das es geht, orange.
 * Zwei Bilder nebeneinander zu vergleichen kann jemand, der noch nie ein Dach
 * von innen gesehen hat.
 *
 * Die Karten sind bewusst hell: sie sind auf diesem Screen das Einzige, was
 * man anfassen kann, und müssen sich vom dunklen Panel abheben wie ein
 * Werkzeug vom Tisch.
 *
 * Nach dem Tippen bleibt die Runde einen Moment stehen: Die richtige Karte
 * bekommt den limettenen Rand und den Haken — auch dann, wenn daneben getippt
 * wurde. Genau dafür ist die Pause da.
 */
function Teilkarte({
  schritt,
  gebaut,
  stand,
  onWaehle,
}: {
  schritt: Bauschritt
  gebaut: string[]
  stand: Stand
  onWaehle: () => void
}) {
  const zeichen = stand === 'richtig' ? 'ok' : stand === 'falsch' ? 'nein' : null

  return (
    <button
      type="button"
      onClick={onWaehle}
      disabled={stand !== 'offen'}
      data-testid={`m7-teil-${schritt.label}`}
      data-stand={stand}
      className={`flex flex-col gap-2 rounded-kh border-4 bg-kh-paper p-2 text-left transition-[border-color,opacity,transform] duration-200 active:scale-[0.97] ${
        stand === 'richtig'
          ? 'border-kh-signal'
          : stand === 'falsch'
            ? 'border-kh-orange'
            : stand === 'blass'
              ? 'border-transparent opacity-35'
              : 'border-transparent'
      }`}
    >
      <span className="relative block w-full rounded-[10px] bg-[#0E0D0B] p-1.5">
        <DachSchema hervor={schritt.label} gebaut={gebaut} className="block w-full" />
        {zeichen && (
          <span
            aria-hidden
            className={`absolute top-1.5 right-1.5 grid size-7 place-items-center rounded-full ${
              zeichen === 'ok' ? 'bg-kh-signal' : 'bg-kh-orange'
            } text-[#0E0D0B]`}
          >
            {zeichen === 'ok' ? (
              <Check className="size-4" strokeWidth={3.5} />
            ) : (
              <X className="size-4" strokeWidth={3.5} />
            )}
          </span>
        )}
      </span>
      <span className="block px-1 pb-1 text-[#0E0D0B]">
        <span className="block text-[1.0625rem] leading-tight font-semibold">
          {schritt.name}
        </span>
        <span className="mt-1 block text-[0.8125rem] leading-snug font-normal text-[#0E0D0B]/70">
          {schritt.was}
        </span>
      </span>
    </button>
  )
}
