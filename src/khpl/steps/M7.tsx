import { Suspense, lazy, useState } from 'react'
import {
  DndContext,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { Button } from '@/components/ui/button'
import { Dachstuhl3DFallback } from '@/khpl/buehne/Dachstuhl3DFallback'
import { M7_SCHRITTE, M7_START, type Bauschritt } from '@/khpl/buehne/aufbauabschnitte'
import { AhaKarte } from '@/khpl/komponenten/AhaKarte'
import { Rueckmeldung } from '@/khpl/komponenten/Rueckmeldung'
import { StepFuss, useStepNavigation } from '@/khpl/shell/StepFuss'
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
 * Die Belohnung ist nicht eine Wertung, sondern die Animation selbst: jedes
 * richtig abgelegte Teil fliegt tatsächlich ein und das Dach wächst weiter.
 * Damit ist die Abfrage dasselbe Modell wie die Lehre in M5, nur mit dem
 * Besucher an der Zeitachse — genau das, was flow 9 als Nebenprodukt des
 * parametrischen Modells vorhergesagt hat.
 *
 * Nach zwei Fehlversuchen: „Zeig mir wie“ (flow 6.6). Es spielt nicht die
 * ganze Animation aus M5 erneut ab — das wären an dieser Stelle 20 Sekunden
 * Zuschauen —, sondern legt das nächste Teil selbst ab und erklärt dabei, warum
 * es dieses ist.
 *
 * Zieh-Geste: Swipe-Navigation abgeschaltet (flow 6.1).
 */

const Dachstuhl3D = lazy(() => import('@/khpl/buehne/Dachstuhl3D'))

const ABLAGE = 'm7-ablage'
const HILFE_AB = 2

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
  const { weiter } = useStepNavigation('M7')
  const gespeichert = useFortschritt().answers.m7
  const [gesetzt, setGesetzt] = useState<string[]>(() => gespeichert?.gesetzt ?? [])
  const [fehler, setFehler] = useState(0)
  const [meldung, setMeldung] = useState<{ text: string; ok: boolean } | null>(null)

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
  const zielT = fertig
    ? M7_SCHRITTE[M7_SCHRITTE.length - 1].zielT
    : gesetzt.length === 0
      ? M7_START
      : (M7_SCHRITTE.find((s) => s.label === gesetzt[gesetzt.length - 1])?.zielT ??
        M7_START)

  const setze = (schritt: Bauschritt) => {
    const neu = [...gesetzt, schritt.label]
    setGesetzt(neu)
    setMeldung({ text: schritt.richtig, ok: true })
    merkeAntwort('m7', { gesetzt: neu, fertig: neu.length === M7_SCHRITTE.length })
  }

  const ablegen = (e: DragEndEvent) => {
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
      aufteilung="buehne"
      interaktionOffen={!fertig}
      wischen={false}
      onWeiter={weiter}
      buehne={
        <Suspense fallback={<Dachstuhl3DFallback />}>
          <Dachstuhl3D
            zielT={zielT}
            startT={M7_START}
            // Kürzer als in M5: hier wartet jemand auf das Ergebnis seiner
            // eigenen Entscheidung, nicht auf eine Vorführung.
            dauer={12}
          />
        </Suspense>
      }
      fachtext={
        <p>
          Die zweite Hälfte des Dachs fehlt noch. Bau sie — in der Reihenfolge, in der es
          geht. Was noch nicht dran ist, hält nicht.
        </p>
      }
      // Ist alles gesetzt, bleibt sonst eine leere weiße Karte zwischen Modell
      // und Aha-Karte stehen — sie sieht aus wie ein Renderfehler.
      interaktion={
        fertig ? null : (
          <DndContext sensors={sensoren} onDragEnd={ablegen}>
            {/* Eine Karte statt vier: Ablage, Rückmeldung und Vorrat gehören zu
              einer Handlung, und übereinandergestapelte Einzelkarten zerlegen
              den Screen in Kästchen. */}
            <div
              className="flex flex-col gap-3 rounded-kh bg-kh-page p-4 shadow-[0_2px_24px_rgba(0,0,0,0.12)] landscape:p-5"
              data-wisch="aus"
            >
              <Ablage
                fertig={fertig}
                anzahl={gesetzt.length}
                gesamt={M7_SCHRITTE.length}
              />

              <Rueckmeldung
                ok={meldung ? meldung.ok : null}
                text={meldung ? meldung.text : null}
                testid="m7-meldung"
              />

              {!fertig && (
                <>
                  <div className="flex flex-wrap gap-2">
                    {offen.map((s) => (
                      <Bauteilkarte key={s.label} schritt={s} />
                    ))}
                  </div>
                  {fehler >= HILFE_AB && (
                    <div className="flex justify-start">
                      <Button
                        variant="ghost"
                        onClick={zeigMirWie}
                        data-testid="m7-zeig-mir-wie"
                        className="h-[60px] px-4 text-[15px]"
                      >
                        Zeig mir wie
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </DndContext>
        )
      }
      aha={
        <AhaKarte sichtbar={fertig} eyebrow={null}>
          Steht. Was du gerade in der richtigen Reihenfolge gebaut hast, heißt im Betrieb
          Aufrichten. Der Kran, der die Sparrenpaare einhebt, steht dafür einen Tag auf
          der Baustelle — den hast du in der Kalkulation schon bezahlt.
        </AhaKarte>
      }
      fuss={<StepFuss id="M7" gedaempft={!fertig} />}
    />
  )
}

function Ablage({
  fertig,
  anzahl,
  gesamt,
}: {
  fertig: boolean
  anzahl: number
  gesamt: number
}) {
  const { setNodeRef, isOver } = useDroppable({ id: ABLAGE, disabled: fertig })

  if (fertig) return null

  return (
    <div
      ref={setNodeRef}
      data-testid="m7-ablage"
      className={`flex min-h-[76px] items-center justify-between gap-3 rounded-kh border-2 border-dashed px-4 py-3 transition-colors ${
        isOver ? 'border-kh-orange bg-kh-orange/15' : 'border-kh-rule bg-kh-band-soft'
      }`}
    >
      <p className="text-[16px] font-normal text-kh-ink">
        Was kommt als Nächstes aufs Dach?
      </p>
      <span className="shrink-0 text-[14px] text-kh-grey/70 tabular-nums">
        {anzahl}/{gesamt}
      </span>
    </div>
  )
}

function Bauteilkarte({ schritt }: { schritt: Bauschritt }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: schritt.label,
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      data-testid={`m7-teil-${schritt.label}`}
      style={
        transform
          ? {
              transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
              zIndex: 30,
            }
          : undefined
      }
      className={`flex min-h-[60px] cursor-grab touch-none items-center rounded-kh border border-kh-rule bg-kh-surface px-4 py-2 text-[15px] text-kh-ink transition-shadow active:cursor-grabbing ${
        isDragging ? 'shadow-xl' : ''
      }`}
    >
      {schritt.name}
    </div>
  )
}
