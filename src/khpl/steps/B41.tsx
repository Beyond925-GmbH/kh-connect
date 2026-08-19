import { useState } from 'react'
import {
  DndContext,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { motion } from 'motion/react'
import { Check, Truck, X } from 'lucide-react'
import { StepFoto } from '@/khpl/buehne/Foto'
import { Rueckmeldung } from '@/khpl/komponenten/Rueckmeldung'
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
 * Zieh-Geste: Swipe-Navigation abgeschaltet (flow 6.1).
 */

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
const LADEFLAECHE = 'b41-fahrzeug'

export function B41() {
  const gespeichert = useFortschritt().answers.b41
  const [geladen, setGeladen] = useState<string[]>(() => gespeichert?.geladen ?? [])
  const [abgelehnt, setAbgelehnt] = useState<string[]>([])
  const [letzte, setLetzte] = useState<{ teil: Teil; ok: boolean } | null>(null)

  const sensoren = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  )

  const fertig = geladen.length >= NOETIG

  const ablegen = (e: DragEndEvent) => {
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
      interaktionOffen={!fertig}
      // Vorher trug dieser Step überhaupt kein Bild — weiße Fläche hinter
      // einer Zieh-Übung. Jetzt die Halle, aus der geladen wird.
      buehne={<StepFoto id="B4.1" />}
      fachtext={
        <p>
          In der Halle liegt mehr, als du brauchst. Was für dieses Dach gebraucht wird,
          kommt aufs Fahrzeug. Was du vergisst, fehlt dir morgen früh um sieben auf der
          Baustelle.
        </p>
      }
      interaktion={
        <DndContext sensors={sensoren} onDragEnd={ablegen}>
          <div className="flex flex-col gap-3" data-wisch="aus">
            <Fahrzeug geladen={geladen} fertig={fertig} />

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

function Fahrzeug({ geladen, fertig }: { geladen: string[]; fertig: boolean }) {
  const { setNodeRef, isOver } = useDroppable({ id: LADEFLAECHE })

  return (
    <div
      ref={setNodeRef}
      data-testid="b41-fahrzeug"
      className={`flex min-h-[104px] shrink-0 items-center gap-4 rounded-kh border-2 border-dashed px-4 py-3 transition-colors ${
        isOver
          ? 'border-kh-signal bg-kh-signal/15'
          : 'border-kh-line-strong bg-white/[0.04]'
      }`}
    >
      <Truck
        className={`size-10 shrink-0 transition-colors ${
          fertig ? 'text-kh-signal' : 'text-kh-paper/45'
        }`}
        strokeWidth={1.75}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-baseline gap-x-2.5 text-[1.0625rem] font-medium text-kh-paper">
          {fertig
            ? 'Vollständig. Alles drauf, was heute gebraucht wird.'
            : 'Zieh hierher, was mit muss.'}
          <span className="font-display text-[1.5rem] leading-none text-kh-paper/60 tabular-nums">
            {geladen.length}/{NOETIG}
          </span>
        </p>
        {/* Bewusst ohne Liste der geladenen Teile: die stehen abgehakt im Raster
            darunter, und zweimal dasselbe kostet nur Platz. */}
        <div className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-white/10">
          <motion.div
            className={`h-full rounded-full ${fertig ? 'bg-kh-signal' : 'bg-kh-orange'}`}
            initial={false}
            animate={{ width: `${(geladen.length / NOETIG) * 100}%` }}
            transition={{ type: 'spring', stiffness: 220, damping: 26 }}
          />
        </div>
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
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: teil.id,
    disabled: erledigt,
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      data-testid={`b41-${teil.id}`}
      style={
        transform
          ? {
              transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
              zIndex: 30,
            }
          : undefined
      }
      // Drei Zustände, drei Erscheinungen. Was noch im Regal liegt, ist hell
      // und greifbar; was verladen ist, trägt die Signalfarbe; was abgelehnt
      // wurde, verblasst und wird durchgestrichen. Vorher waren alle drei
      // Graustufen desselben Kastens.
      className={`flex min-h-[62px] touch-none items-center gap-2 rounded-kh border-2 px-3 py-2 text-left text-[1rem] leading-tight transition-transform ${
        isDragging ? 'scale-105 shadow-[0_16px_40px_rgba(0,0,0,0.6)]' : ''
      } ${
        geladen
          ? 'border-kh-signal/50 bg-kh-signal/12 font-medium text-kh-paper/70'
          : abgelehnt
            ? 'border-kh-line bg-white/[0.03] text-kh-mute/50 line-through'
            : 'cursor-grab border-transparent bg-kh-paper font-semibold text-[#0E0D0B] active:cursor-grabbing'
      }`}
    >
      {geladen && <Check className="size-4 shrink-0 text-kh-signal" strokeWidth={3.5} />}
      {abgelehnt && <X className="size-4 shrink-0" strokeWidth={3} />}
      <span className="min-w-0">{teil.text}</span>
    </div>
  )
}
