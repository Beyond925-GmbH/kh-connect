import { Suspense, lazy, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  DndContext,
  DragOverlay,
  MeasuringStrategy,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
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
import { DND_ANLEITUNG, DND_ANSAGEN } from '@/khpl/komponenten/dndDeutsch'
import { Rueckmeldung } from '@/khpl/komponenten/Rueckmeldung'
import { Wechsel } from '@/khpl/komponenten/Wechsel'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { merkeAntwort, useFortschritt } from '@/khpl/store/fortschritt'

/**
 * M7 — Jetzt du.
 *
 * **Zweite Hälfte des Lernpaars** (khpl-flow.md 7 M7). Gleiche Grafik wie M5,
 * gedrehte Rolle. Der Besucher zieht die Bauteile selbst in der richtigen
 * Reihenfolge an ihren Platz; falsche Reihenfolge lässt das Bauteil
 * zurückrutschen, mit einem Satz dazu, warum es noch nicht drankommt.
 *
 * **Drei Korrekturen an der letzten Fassung.**
 *
 *  1. **Erst wird es vorgeführt, dann abgefragt.** Vorher fing der Screen mit
 *     fünf Karten an, auf denen Wörter standen — „Windrispenbänder“,
 *     „Konterlattung“ —, und verlangte deren Reihenfolge. Drei davon hatte der
 *     Besucher noch nie gesehen: M5 hält vor den Sparren an, und alles, was
 *     hier abgefragt wird, kommt danach. Das war keine Abfrage, das war Raten.
 *     Jetzt läuft die zweite Hälfte einmal komplett durch — Sparren, Kehlbalken,
 *     Bänder, Lattung, fertiges Dach —, spult zurück, und **dann** ist der
 *     Besucher dran. Wer will, lässt es sich noch einmal zeigen.
 *  2. **Jede Karte trägt ihr Bild.** Ein Querschnitt-Schema zeigt, wo das Teil
 *     im Dach sitzt (`DachSchema`). Damit ist die Frage „was kommt als
 *     Nächstes“ eine Frage über den Bau und nicht über Vokabeln.
 *  3. **Das Ziehen ist ruhig geworden.** Die Karten hatten `transition-transform`
 *     — eine CSS-Übergangszeit auf genau der Eigenschaft, die dnd-kit jeden
 *     Frame neu setzt. Jede Fingerbewegung wurde dadurch nachgezogen statt
 *     gefolgt, und das Ergebnis zitterte. Jetzt hängt am Finger eine
 *     `DragOverlay`-Kopie ohne Übergang, die Originalkarte bleibt blass an
 *     ihrem Platz liegen, und das Auto-Scrollen des Panels ist abgeschaltet:
 *     es verschob während des Ziehens den Untergrund.
 *
 * Die Belohnung ist nicht eine Wertung, sondern die Animation selbst: jedes
 * richtig abgelegte Teil fliegt tatsächlich ein und das Dach wächst weiter.
 *
 * Nach zwei Fehlversuchen: „Zeig mir wie“ (flow 6.6) — es legt das nächste
 * Teil selbst ab und erklärt dabei, warum es dieses ist.
 *
 * Hier hat der Fuß keine eigene Aktion: die Bühne ist die Handlung. Solange
 * das Dach nicht steht, trägt er nur das leise Überspringen (`uebungOffen`).
 */

const Dachstuhl3D = lazy(() => import('@/khpl/buehne/Dachstuhl3D'))

const ABLAGE = 'm7-ablage'
const HILFE_AB = 2

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

/**
 * Anzeigereihenfolge der Zieh-Karten, einmal je Besuch gewürfelt.
 *
 * Ohne das standen sie in der Lösungsreihenfolge — die Frage „Was kommt als
 * Nächstes aufs Dach?“ war dann fünfmal hintereinander damit beantwortet, die
 * linke Karte zu nehmen, ohne sie zu lesen. Das ist die einzige `Abfrage:` des
 * ganzen Boards; sie muss nach dem Inhalt fragen, nicht nach der Position.
 *
 * Einmal beim Mounten, nicht bei jedem Rendern: sonst springen die Karten unter
 * dem Finger weg.
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
  const [fehler, setFehler] = useState(0)
  const [meldung, setMeldung] = useState<{ text: string; ok: boolean } | null>(null)
  const [zieht, setZieht] = useState<string | null>(null)

  // Wer schon einmal hier war, hat die Vorführung gesehen — er steigt direkt
  // in die Abfrage ein. Alle anderen bekommen erst das ganze Dach zu sehen.
  const [takt, setTakt] = useState<Takt>(() =>
    (gespeichert?.gesetzt?.length ?? 0) > 0 ? 'bauen' : 'zeigen',
  )
  const [gezeigt, setGezeigt] = useState('')

  const sensoren = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  )

  const [reihenfolge] = useState(() => mische(M7_SCHRITTE.map((s) => s.label)))

  // `dran` folgt der Bauordnung, die Anzeige der gewürfelten Reihenfolge.
  const dran = M7_SCHRITTE.find((s) => !gesetzt.includes(s.label))
  const offen = reihenfolge
    .map((label) => M7_SCHRITTE.find((s) => s.label === label))
    .filter((s): s is Bauschritt => !!s && !gesetzt.includes(s.label))
  const fertig = dran === undefined

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

  const gezogen = useMemo(
    () => (zieht ? M7_SCHRITTE.find((s) => s.label === zieht) : undefined),
    [zieht],
  )

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

  const setze = (schritt: Bauschritt) => {
    const neu = [...gesetzt, schritt.label]
    setGesetzt(neu)
    setMeldung({ text: schritt.richtig, ok: true })
    merkeAntwort('m7', { gesetzt: neu, fertig: neu.length === M7_SCHRITTE.length })
  }

  const ablegen = (e: DragEndEvent) => {
    setZieht(null)
    if (e.over?.id !== ABLAGE) return
    const schritt = M7_SCHRITTE.find((s) => s.label === e.active.id)
    if (!schritt || !dran) return

    if (schritt.label === dran.label) {
      setze(schritt)
      setFehler(0)
    } else {
      setFehler((n) => n + 1)
      setMeldung({ text: schritt.zufrueh, ok: false })
    }
  }

  const zeigMirWie = () => {
    if (!dran) return
    setze(dran)
    setFehler(0)
  }

  return (
    <StepShell
      id="M7"
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
      fachtext={
        fertig ? (
          <p>
            Steht. Von der Fußpfette bis zur letzten Dachlatte — in der Reihenfolge, in
            der es geht. Morgen kommen die Ziegel drauf.
          </p>
        ) : takt === 'bauen' ? (
          <p>
            Die zweite Hälfte des Dachs fehlt noch. Bau sie — in der Reihenfolge, in der
            es geht. Was noch nicht dran ist, hält nicht.
          </p>
        ) : (
          <p>
            So sieht die zweite Hälfte fertig aus. Schau dir an, was in welcher
            Reihenfolge kommt — gleich baust du sie selbst.
          </p>
        )
      }
      interaktion={
        <Wechsel takt={takt === 'bauen' ? (fertig ? 'fertig' : 'bauen') : 'vorfuehrung'}>
          {takt !== 'bauen' ? (
            <Vorfuehrung
              label={gezeigt}
              zurueck={takt === 'zurueck'}
              onUeberspringen={() => setTakt('zurueck')}
            />
          ) : fertig ? null : (
            <DndContext
              sensors={sensoren}
              onDragStart={(e: DragStartEvent) => setZieht(String(e.active.id))}
              onDragCancel={() => setZieht(null)}
              onDragEnd={ablegen}
              // Das Panel ist ein Scroll-Container. dnd-kits Auto-Scroll hat
              // ihn beim Ziehen in Randnähe mitgezogen — der Untergrund
              // bewegte sich unter dem Finger, und die Karte schien zu
              // springen.
              autoScroll={false}
              // Die Ablage sitzt über einer Fläche, deren Höhe sich beim
              // Wechsel der Rückmeldung ändert. Ohne dauerndes Nachmessen
              // rechnet dnd-kit mit einem veralteten Rechteck.
              measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
              accessibility={{
                announcements: DND_ANSAGEN,
                screenReaderInstructions: DND_ANLEITUNG,
              }}
            >
              {/* Eine Karte statt vier: Ablage, Rückmeldung und Vorrat gehören zu
                einer Handlung, und übereinandergestapelte Einzelkarten zerlegen
                den Screen in Kästchen. */}
              <div className="flex flex-col gap-2" data-wisch="aus">
                <Ablage anzahl={gesetzt.length} gesamt={M7_SCHRITTE.length} />

                <Rueckmeldung
                  ok={meldung ? meldung.ok : null}
                  text={meldung ? meldung.text : null}
                  testid="m7-meldung"
                />

                <div className="flex flex-wrap gap-2">
                  {offen.map((s) => (
                    <Bauteilkarte key={s.label} schritt={s} gebaut={gebaut} />
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
                  {fehler >= HILFE_AB && (
                    <Button
                      variant="leise"
                      onClick={zeigMirWie}
                      data-testid="m7-zeig-mir-wie"
                    >
                      Zeig mir wie
                    </Button>
                  )}
                </div>
              </div>

              {/*
                Die Kopie am Finger. Sie liegt in einem eigenen Layer über dem
                Screen, ohne Übergangszeit und ohne Layout um sich herum —
                genau deshalb folgt sie dem Finger, statt ihm nachzulaufen.

                **Und sie muss an `document.body`.** Das Panel trägt
                `backdrop-filter` (siehe `kh-panel`), und ein Element mit
                Backdrop-Filter ist der enthaltende Block für alles
                `position: fixed` darunter. Bleibt die Overlay-Kopie im Panel,
                rechnet sie ihre Koordinaten gegen dessen linke obere Ecke
                statt gegen den Bildschirm: sie hängt schief unter dem Finger,
                und — schlimmer — dnd-kit misst mit demselben verschobenen
                Rechteck. Die Ablage wurde dann nie getroffen, egal wo man
                loslässt.
              */}
              {createPortal(
                <DragOverlay dropAnimation={null}>
                  {gezogen && (
                    <Kartenflaeche
                      schritt={gezogen}
                      gebaut={gebaut}
                      className="scale-105 shadow-[0_18px_44px_rgba(0,0,0,0.65)]"
                    />
                  )}
                </DragOverlay>,
                document.body,
              )}
            </DndContext>
          )}
        </Wechsel>
      }
      aha={
        <AhaKarte sichtbar={fertig} eyebrow="Wie heißt das, was du gerade gemacht hast?">
          Aufrichten. Der Kran, der die Sparrenpaare einhebt, steht dafür einen Tag auf
          der Baustelle — den hast du in der Kalkulation schon bezahlt.
        </AhaKarte>
      }
      fuss={
        <StepFuss
          id="M7"
          uebungOffen={!fertig}
          geschafft={fertig ? 'Dach steht' : null}
        />
      }
    />
  )
}

/**
 * Was während der Vorführung im Panel steht.
 *
 * Nur der Name dessen, was gerade einfliegt — das ist der Inhalt, den der
 * Besucher gleich abrufen soll. Dazu ein Ausweg: wer die Reihenfolge schon
 * kennt, soll nicht zwanzig Sekunden zusehen müssen.
 */
function Vorfuehrung({
  label,
  zurueck,
  onUeberspringen,
}: {
  label: string
  zurueck: boolean
  onUeberspringen: () => void
}) {
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
      {!zurueck && (
        <Button
          variant="leise"
          onClick={onUeberspringen}
          data-testid="m7-vorfuehrung-aus"
        >
          Kenn ich schon — los geht's
        </Button>
      )}
    </div>
  )
}

function Ablage({ anzahl, gesamt }: { anzahl: number; gesamt: number }) {
  const { setNodeRef, isOver } = useDroppable({ id: ABLAGE })

  return (
    <div
      ref={setNodeRef}
      data-testid="m7-ablage"
      className={`flex min-h-[68px] items-center justify-between gap-3 rounded-kh border-2 border-dashed px-4 py-2.5 transition-colors ${
        isOver
          ? 'border-kh-signal bg-kh-signal/15'
          : 'border-kh-line-strong bg-white/[0.04]'
      }`}
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
 * Die Zieh-Karte am Platz. Sie trägt selbst **keine** Transformation mehr:
 * am Finger hängt die `DragOverlay`-Kopie, hier bleibt nur der blasse Umriss
 * zurück, damit sichtbar ist, woher das Teil kommt.
 */
function Bauteilkarte({ schritt, gebaut }: { schritt: Bauschritt; gebaut: string[] }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: schritt.label,
  })

  return (
    <div ref={setNodeRef} {...listeners} {...attributes} className="touch-none">
      <Kartenflaeche
        schritt={schritt}
        gebaut={gebaut}
        testid={`m7-teil-${schritt.label}`}
        className={isDragging ? 'opacity-30' : ''}
      />
    </div>
  )
}

/**
 * Das Aussehen einer Zieh-Karte — einmal am Platz, einmal als Kopie am Finger.
 *
 * Die Karten sind bewusst hell: sie sind auf diesem Screen das Einzige, was
 * man anfassen kann, und müssen sich vom dunklen Panel abheben wie ein
 * Werkzeug vom Tisch. Links das Schema mit dem Stand, den das Dach **gerade**
 * hat, und dem Teil darin orange — die Karte zeigt also nicht nur, was sie
 * ist, sondern auch, wo es hinkäme.
 */
function Kartenflaeche({
  schritt,
  gebaut,
  className = '',
  testid,
}: {
  schritt: Bauschritt
  gebaut: string[]
  className?: string
  testid?: string
}) {
  return (
    <div
      data-testid={testid}
      className={`flex min-h-[60px] cursor-grab touch-none items-center gap-2.5 rounded-kh bg-kh-paper py-1.5 pr-4 pl-2 text-[1.0625rem] font-semibold text-[#0E0D0B] active:cursor-grabbing ${className}`}
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-[10px] bg-[#0E0D0B] p-1">
        <DachSchema hervor={schritt.label} gebaut={gebaut} className="size-full" />
      </span>
      {schritt.name}
    </div>
  )
}
