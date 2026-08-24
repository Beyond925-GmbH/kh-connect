import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { motion } from 'motion/react'
import { Check, X } from 'lucide-react'
import { Dachstuhl3DFallback } from '@/khpl/buehne/Dachstuhl3DFallback'
import { DND_ANLEITUNG, DND_ANSAGEN } from '@/khpl/komponenten/dndDeutsch'
import { Rueckmeldung } from '@/khpl/komponenten/Rueckmeldung'
import { useSichtfeld } from '@/khpl/shell/SichtfeldKontext'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { merkeAntwort, useFortschritt } from '@/khpl/store/fortschritt'

/**
 * B4.1 — Beladen. Abstecher von M4, mündet in M5.
 *
 * **Bewusst reduziert auf die Materialauswahl** (khpl-flow.md 7 B4.1). Kein
 * Stapeln, keine Gewichtsverteilung, keine Ladungssicherung — das sprengt das
 * Zeitbudget von drei bis fünf Minuten für den ganzen Durchlauf.
 *
 * **Feedback sofort pro Teil, nicht am Ende** (flow 6.5): jedes Teil wird
 * angenommen oder abgelehnt, mit einem Satz dazu, wofür es gebraucht wird.
 * Die Übung *ist* die Erklärung.
 *
 * **Das Ziel ist jetzt das echte Gespann.** Vorher zog man Textkarten in einen
 * gestrichelten Kasten *im selben Panel* — beladen wurde eine Metapher. Jetzt
 * steht auf der Bühne der Transporter mit dem Langholz-Anhänger, dein
 * markierter Sparren liegt schon drauf, und was du annimmst, materialisiert
 * dort als Requisite. Die Textkarten bleiben die Drag-Quelle: die
 * Begründungssätze tragen die Lehre, nicht die Kisten.
 *
 * Der Fuß hat keine eigene Aktion — beladen wird durch Ziehen. Solange nicht
 * alles drauf ist, trägt er nur das leise Überspringen (`uebungOffen`).
 */

const Beladen3D = lazy(() => import('@/khpl/buehne/Beladen3D'))

interface Teil {
  id: string
  text: string
  mit: boolean
  /** Der eine Satz, der beim Ablegen erscheint. Wörtlich aus flow 11 (B4.1). */
  grund: string
}

const TEILE: Teil[] = [
  {
    id: 'sparren',
    text: 'Sparren und Pfetten, nummeriert',
    mit: true,
    grund: 'Das Dach selbst. Zuletzt geladen ist zuerst gebraucht.',
  },
  {
    id: 'ziegel',
    text: 'Dachziegel',
    mit: false,
    grund: 'Die bringt der Dachdecker mit. Ihr baut das, was darunter liegt.',
  },
  {
    id: 'anker',
    text: 'Sparrenanker und Schrauben',
    mit: true,
    grund: 'Ohne Verbindungsmittel ist ein Dachstuhl ein Stapel Holz.',
  },
  {
    id: 'daemmung',
    text: 'Dämmung',
    mit: false,
    grund: 'Kommt, wenn das Dach dicht ist. Heute nicht.',
  },
  {
    id: 'psa',
    text: 'Seitenschutz und Auffanggurte',
    mit: true,
    grund: 'Kommt zuerst runter und wird zuerst aufgebaut. Vor dem ersten Sparren.',
  },
  {
    id: 'fenster',
    text: 'Dachfenster',
    mit: false,
    grund: 'Erst wenn die Sparren stehen — sonst liegt Glas im Weg.',
  },
  {
    id: 'werkzeug',
    text: 'Akkuschrauber, Säge, Werkzeugkiste',
    mit: true,
    grund: 'Klar.',
  },
  {
    id: 'mischer',
    text: 'Betonmischer',
    mit: false,
    grund: 'Nicht euer Gewerk — der steht beim Maurer.',
  },
  {
    id: 'leiter',
    text: 'Leiter',
    mit: true,
    grund: 'Auch für den Weg nach oben braucht es einen Weg nach oben.',
  },
]

const NOETIG = TEILE.filter((t) => t.mit).length

/**
 * Anzeigereihenfolge. In der Datenreihenfolge wechseln sich richtig und falsch
 * exakt ab (1, 3, 5, 7, 9 gehören mit) — im Raster war die Aufgabe damit ohne
 * Lesen lösbar. Fest verdrahtet, nicht gewürfelt: der Screen ist über „Dein
 * Weg“ wieder erreichbar und soll dann gleich aussehen.
 */
const ANZEIGE = [
  'sparren',
  'ziegel',
  'anker',
  'psa',
  'daemmung',
  'werkzeug',
  'fenster',
  'leiter',
  'mischer',
]
const ANGEZEIGT = ANZEIGE.map((id) => TEILE.find((t) => t.id === id)!).filter(Boolean)
const LADEFLAECHE = 'b41-ladeflaeche'

export function B41() {
  const gespeichert = useFortschritt().answers.b41
  const [geladen, setGeladen] = useState<string[]>(() => gespeichert?.geladen ?? [])
  const [abgelehnt, setAbgelehnt] = useState<string[]>([])
  const [letzte, setLetzte] = useState<{ teil: Teil; ok: boolean } | null>(null)
  const [greift, setGreift] = useState<Teil | null>(null)
  /** Die Bühnenfläche — Bezugsrechteck für das Drop-Ziel (s. `Ladeflaeche`). */
  const buehne = useRef<HTMLDivElement>(null)

  const sensoren = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  )

  const fertig = geladen.length >= NOETIG

  const aufnehmen = (e: DragStartEvent) => {
    setGreift(TEILE.find((t) => t.id === e.active.id) ?? null)
  }

  const ablegen = (e: DragEndEvent) => {
    setGreift(null)
    if (e.over?.id !== LADEFLAECHE) return
    const teil = TEILE.find((t) => t.id === e.active.id)
    if (!teil) return

    setLetzte({ teil, ok: teil.mit })
    if (teil.mit) {
      // Die neue Liste wird hier berechnet und nicht im Updater von
      // `setGeladen`: React darf einen Updater während des Renderns ausführen,
      // und `merkeAntwort` schreibt in den Store — das wäre ein setState
      // mitten im Rendern eines anderen Components.
      const neu = geladen.includes(teil.id) ? geladen : [...geladen, teil.id]
      setGeladen(neu)
      merkeAntwort('b41', { geladen: neu, fertig: neu.length >= NOETIG })
    } else {
      setAbgelehnt((alt) => (alt.includes(teil.id) ? alt : [...alt, teil.id]))
    }
  }

  return (
    <StepShell
      id="B4.1"
      titelZusatz="Abstecher"
      buehneInteraktiv
      interaktionOffen={!fertig}
      buehne={
        <div ref={buehne} className="size-full">
          <Suspense
            fallback={<Dachstuhl3DFallback text="Transporter und Anhänger fahren vor" />}
          >
            <Beladen3D geladen={geladen} />
          </Suspense>
        </div>
      }
      fachtext={
        <p>
          In der Halle liegt mehr, als du brauchst. Was für dieses Dach gebraucht wird,
          kommt auf Transporter und Anhänger. Was du vergisst, fehlt dir morgen früh um
          sieben auf der Baustelle.
        </p>
      }
      interaktion={
        <DndContext
          sensors={sensoren}
          onDragStart={aufnehmen}
          onDragEnd={ablegen}
          // iOS feuert bei System- und Randgesten `pointercancel` — dann kommt
          // `onDragCancel` statt `onDragEnd`. Ohne den Reset bliebe `greift`
          // stehen und der gestrichelte Ablage-Rahmen läge dauerhaft über der
          // Bühne.
          onDragCancel={() => setGreift(null)}
          accessibility={{
            announcements: DND_ANSAGEN,
            screenReaderInstructions: DND_ANLEITUNG,
          }}
        >
          <div className="flex flex-col gap-2" data-wisch="aus">
            <Ladefortschritt geladen={geladen.length} fertig={fertig} />

            <Rueckmeldung
              ok={letzte ? letzte.ok : null}
              text={letzte ? letzte.teil.grund : null}
              testid="b41-feedback"
            />

            <ul className="grid min-h-0 flex-1 auto-rows-min grid-cols-2 content-start gap-2 landscape:grid-cols-3">
              {ANGEZEIGT.map((t) => (
                <li key={t.id}>
                  <Hallenteil
                    teil={t}
                    geladen={geladen.includes(t.id)}
                    abgelehnt={abgelehnt.includes(t.id)}
                  />
                </li>
              ))}
            </ul>
          </div>

          <Ladeflaeche flaeche={buehne} aktiv={greift !== null} />

          {/*
            Ohne Drag-Overlay endet die gezogene Karte an der Panelkante: die
            Karten liegen in der scrollenden Inhaltsfläche (`overflow-y-auto`
            in `StepShell`), und die schneidet alles ab, was hinausgeschoben
            wird. Das Overlay hängt im Portal am `body` und kann deshalb bis
            über die Bühne wandern. Ohne Rückflug-Animation: die Karte gehört
            nach dem Loslassen dorthin, wo die Rückmeldung sie hinsortiert.
          */}
          {createPortal(
            <DragOverlay dropAnimation={null}>
              {greift && <Karte teil={greift} zustand="offen" gegriffen />}
            </DragOverlay>,
            document.body,
          )}
        </DndContext>
      }
      fuss={
        <StepFuss
          id="B4.1"
          uebungOffen={!fertig}
          geschafft={fertig ? 'Alles geladen' : null}
        />
      }
    />
  )
}

interface Rechteck {
  links: number
  oben: number
  breite: number
  hoehe: number
}

function gleich(a: Rechteck | null, b: Rechteck | null): boolean {
  if (!a || !b) return a === b
  return (
    a.links === b.links &&
    a.oben === b.oben &&
    a.breite === b.breite &&
    a.hoehe === b.hoehe
  )
}

/**
 * Das Drop-Ziel: die freie Bühnenfläche, auf der das Gespann steht.
 *
 * **Warum ein Portal am `body`.** Das Panel trägt `backdrop-filter`
 * (`kh-panel` in `index.css`) und ist damit Containing Block für jeden
 * `position: fixed`-Nachfahren — ein Overlay im Panel läge über dem Panel
 * statt über der Bühne. Der React-Context (und damit `DndContext`) überlebt
 * das Portal, die Kopplung an dnd-kit bleibt also intakt.
 *
 * **Warum es nie Pointer-Ereignisse annimmt.** dnd-kit erkennt Treffer
 * geometrisch über die gemessenen Rechtecke, nicht über Hit-Testing. Das
 * Overlay kann deshalb dauerhaft `pointer-events: none` bleiben — es kann
 * weder das Drehen des Modells noch einen Tap auf den Fuß abfangen.
 *
 * Das Rechteck ist die Bühnenfläche minus dem, was das Panel verdeckt. Beide
 * Werte sind bereits gemessen: die Fläche über die Ref aus dem Bühnen-Slot,
 * der verdeckte Anteil über den `SichtfeldMesser`, der genau diese Frage
 * schon für die Kamera beantwortet.
 */
function Ladeflaeche({
  flaeche,
  aktiv,
}: {
  flaeche: React.RefObject<HTMLDivElement | null>
  aktiv: boolean
}) {
  const { setNodeRef, isOver } = useDroppable({ id: LADEFLAECHE })
  const sichtfeld = useSichtfeld()
  const links = sichtfeld?.links ?? 0
  const unten = sichtfeld?.unten ?? 0
  const [rahmen, setRahmen] = useState<Rechteck | null>(null)
  const letztes = useRef<Rechteck | null>(null)

  const messen = useCallback(() => {
    const f = flaeche.current?.getBoundingClientRect()
    if (!f || f.width <= 0 || f.height <= 0) return
    // Dieselbe Fallunterscheidung wie im `SichtfeldMesser`: quer nimmt das
    // Panel links weg, hochkant unten.
    const quer = f.width > f.height
    const neu: Rechteck = quer
      ? {
          links: f.left + f.width * links,
          oben: f.top,
          breite: f.width * (1 - links),
          hoehe: f.height,
        }
      : {
          links: f.left,
          oben: f.top,
          breite: f.width,
          hoehe: f.height * (1 - unten),
        }
    if (gleich(neu, letztes.current)) return
    letztes.current = neu
    setRahmen(neu)
  }, [flaeche, links, unten])

  useEffect(() => {
    messen()
    const el = flaeche.current
    if (!el) return
    const beobachter = new ResizeObserver(messen)
    beobachter.observe(el)
    return () => beobachter.disconnect()
  }, [messen, flaeche])

  if (!rahmen) return null

  return createPortal(
    <div
      ref={setNodeRef}
      data-testid="b41-ladeflaeche"
      aria-hidden
      className={`pointer-events-none fixed z-30 rounded-kh border-2 transition-colors duration-200 ${
        aktiv
          ? isOver
            ? 'border-kh-signal bg-kh-signal/12'
            : 'border-dashed border-kh-paper/30'
          : 'border-transparent'
      }`}
      style={{
        left: rahmen.links,
        top: rahmen.oben,
        width: rahmen.breite,
        height: rahmen.hoehe,
      }}
    />,
    document.body,
  )
}

/**
 * Der Ladefortschritt im Panel. Vom alten Fahrzeug-Kasten bleibt nur die
 * Buchführung — das Fahrzeug selbst steht jetzt auf der Bühne, und ein zweites,
 * gezeichnetes daneben wäre eine Behauptung zu viel.
 */
function Ladefortschritt({ geladen, fertig }: { geladen: number; fertig: boolean }) {
  return (
    <div className="shrink-0" data-testid="b41-fortschritt">
      <p className="flex flex-wrap items-baseline gap-x-2.5 text-[1.0625rem] font-medium text-kh-paper">
        {fertig
          ? 'Vollständig. Alles drauf, was heute gebraucht wird.'
          : 'Zieh auf den Anhänger, was mit muss.'}
        <span className="font-display text-[1.5rem] leading-none text-kh-paper/60 tabular-nums">
          {geladen}/{NOETIG}
        </span>
      </p>
      {/* Bewusst ohne Liste der geladenen Teile: die stehen abgehakt im Raster
          darunter, und zweimal dasselbe kostet nur Platz. */}
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
        <motion.div
          className={`h-full rounded-full ${fertig ? 'bg-kh-signal' : 'bg-kh-orange'}`}
          initial={false}
          animate={{ width: `${(geladen / NOETIG) * 100}%` }}
          transition={{ type: 'spring', stiffness: 220, damping: 26 }}
        />
      </div>
    </div>
  )
}

function Hallenteil({
  teil,
  geladen,
  abgelehnt,
}: {
  teil: Teil
  geladen: boolean
  abgelehnt: boolean
}) {
  const erledigt = geladen || abgelehnt
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: teil.id,
    disabled: erledigt,
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      data-testid={`b41-${teil.id}`}
      // Die Karte selbst bleibt liegen und verblasst nur — bewegt wird die
      // Kopie im `DragOverlay` (s. dort).
      className={isDragging ? 'opacity-30' : undefined}
    >
      <Karte
        teil={teil}
        zustand={geladen ? 'geladen' : abgelehnt ? 'abgelehnt' : 'offen'}
      />
    </div>
  )
}

/**
 * Drei Zustände, drei Erscheinungen. Was noch im Regal liegt, ist hell und
 * greifbar; was verladen ist, trägt die Signalfarbe; was abgelehnt wurde,
 * verblasst und wird durchgestrichen.
 */
function Karte({
  teil,
  zustand,
  gegriffen = false,
}: {
  teil: Teil
  zustand: 'offen' | 'geladen' | 'abgelehnt'
  /** Die Kopie im Drag-Overlay — leicht vergrößert, mit Schatten. */
  gegriffen?: boolean
}) {
  return (
    <div
      className={`flex min-h-[54px] touch-none items-center gap-2 rounded-kh border-2 px-3 py-1.5 text-left text-[0.9375rem] leading-tight ${
        gegriffen ? 'scale-105 shadow-[0_16px_40px_rgba(0,0,0,0.6)]' : ''
      } ${
        zustand === 'geladen'
          ? 'border-kh-signal/50 bg-kh-signal/12 font-medium text-kh-paper/70'
          : zustand === 'abgelehnt'
            ? 'border-kh-line bg-white/[0.03] text-kh-mute/50 line-through'
            : 'cursor-grab border-transparent bg-kh-paper font-semibold text-[#0E0D0B] active:cursor-grabbing'
      }`}
    >
      {zustand === 'geladen' && (
        <Check className="size-4 shrink-0 text-kh-signal" strokeWidth={3.5} />
      )}
      {zustand === 'abgelehnt' && <X className="size-4 shrink-0" strokeWidth={3} />}
      <span className="min-w-0">{teil.text}</span>
    </div>
  )
}
