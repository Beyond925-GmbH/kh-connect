import { useCallback, useRef, useState } from 'react'
import {
  DndContext,
  PointerSensor,
  useDraggable,
  useSensor,
  useSensors,
  type DragMoveEvent,
} from '@dnd-kit/core'
import { AnimatePresence, motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { AhaKarte } from '@/khpl/komponenten/AhaKarte'
import { Begriff } from '@/khpl/komponenten/Begriff'
import { StepFuss, useStepNavigation } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { merkeAntwort } from '@/khpl/store/fortschritt'

/**
 * M4 — Ein Balken, ein Maß.
 *
 * Übung: Maß ablesen, Schnitt setzen (khpl-flow.md 7 M4). Links die
 * Werkzeichnung mit Länge und Winkel, rechts der Balken. Der Besucher zieht die
 * Schnittlinie an die richtige Stelle und stellt den Winkel ein.
 *
 * „Feedback mit Toleranz: ‚3 cm zu kurz — der Balken ist Ausschuss.‘ Der Fehler
 * kostet Material, und genau das ist die Lektion.“ Der Screen verbindet
 * Planlesen mit Handwerk — die Brücke zu B3.2.
 *
 * Zieh-Geste: Swipe-Navigation ist hier abgeschaltet (flow 6.1).
 */

// ---------------------------------------------------------------------------
// Maße und Text — gebündelt oben (flow 8.4).
// ---------------------------------------------------------------------------

/** Rohling, aus dem geschnitten wird. */
const MIN_MM = 3800
const MAX_MM = 6000
const ZIEL_MM = 4820
/**
 * Was noch als Treffer gilt. 3 cm sind im Feedbacktext der Spec die Grenze zum
 * Ausschuss („Drei Zentimeter zu kurz“) — also ist alles darunter ein Treffer.
 */
const TOLERANZ_MM = 30
const START_MM = 5400

const WINKEL = [30, 45, 60] as const
const ZIEL_WINKEL = 45

type Winkel = (typeof WINKEL)[number]

/** Nach zwei Fehlversuchen bietet die App die Lösung an (flow 6.6). */
const HILFE_AB = 2

const mm = (n: number) => `${(n / 1000).toFixed(2).replace('.', ',')} m`

export function M4() {
  const { weiter } = useStepNavigation('M4')
  const [laenge, setLaenge] = useState(START_MM)
  const [winkel, setWinkel] = useState<Winkel | null>(null)
  const [versuche, setVersuche] = useState(0)
  const [ergebnis, setErgebnis] = useState<Rueckmeldung | null>(null)
  const [geloest, setGeloest] = useState(false)

  const pruefen = () => {
    const r = bewerte(laenge, winkel)
    setErgebnis(r)
    if (r.treffer) {
      setGeloest(true)
      merkeAntwort('m4', { getroffen: true, versuche: versuche + 1 })
    } else {
      const n = versuche + 1
      setVersuche(n)
      merkeAntwort('m4', { getroffen: false, versuche: n })
    }
  }

  const zeigMirWie = () => {
    setLaenge(ZIEL_MM)
    setWinkel(ZIEL_WINKEL)
    setErgebnis(null)
  }

  return (
    <StepShell
      id="M4"
      aufteilung="uebung"
      interaktionOffen={!geloest}
      // Ein Zieh-Vorgang darf nie versehentlich den Step wechseln (flow 6.1).
      wischen={false}
      onWeiter={weiter}
      buehne={<Werkzeichnung />}
      fachtext={
        <p>
          <Begriff id="abbundplan">Abbundplan</Begriff> lesen, Hölzer anzeichnen, ablängen
          und die Verbindungen ausarbeiten — heute meist auf der{' '}
          <Begriff id="abbundanlage">Abbundanlage</Begriff>, bei Sonderteilen von Hand.
          Jedes Teil bekommt eine Nummer, damit es auf der Baustelle seinen Platz findet.
        </p>
      }
      interaktion={
        <Zuschnitt
          laenge={laenge}
          onLaenge={(n) => {
            setLaenge(n)
            setErgebnis(null)
          }}
          winkel={winkel}
          onWinkel={(w) => {
            setWinkel(w)
            setErgebnis(null)
          }}
          gesperrt={geloest}
          ergebnis={ergebnis}
          versuche={versuche}
          onPruefen={pruefen}
          onZeigMirWie={zeigMirWie}
        />
      }
      aha={
        <AhaKarte sichtbar={geloest} eyebrow="Übrigens">
          Den Zuschnitt macht im Betrieb meist eine CNC-Maschine — die Abbundanlage — nach
          genau dem Plan, den du gezeichnet hast. Von Hand kommt, was sie nicht kann. Das
          ist mehr, als man denkt.
        </AhaKarte>
      }
      fuss={<StepFuss id="M4" gedaempft={!geloest} />}
    />
  )
}

// ---------------------------------------------------------------------------
// Bewertung
// ---------------------------------------------------------------------------

interface Rueckmeldung {
  treffer: boolean
  text: string
}

/**
 * Reihenfolge mit Absicht: erst die Länge, dann der Winkel. Wer 20 Zentimeter
 * daneben liegt, will nicht über den Winkel belehrt werden.
 * Texte aus flow 11 (M4).
 */
function bewerte(laenge: number, winkel: Winkel | null): Rueckmeldung {
  const ab = laenge - ZIEL_MM
  if (ab < -TOLERANZ_MM) {
    const cm = Math.round(-ab / 10)
    return {
      treffer: false,
      text: `${cm} Zentimeter zu kurz. Der Balken ist Ausschuss: rund 50 Euro und eine halbe Stunde.`,
    }
  }
  if (ab > TOLERANZ_MM) {
    return {
      treffer: false,
      text: 'Zu lang lässt sich kürzen. Kostet dich Zeit, nicht Material — noch mal.',
    }
  }
  if (winkel === null) {
    return { treffer: false, text: 'Die Länge sitzt. Fehlt noch der Winkel am First.' }
  }
  if (winkel !== ZIEL_WINKEL) {
    return {
      treffer: false,
      text: 'Der Winkel stimmt nicht. Oben am First klafft es, und der Sparren liegt nicht auf.',
    }
  }
  return { treffer: true, text: 'Passt. Nummer drauf — Teil 14 von 68.' }
}

// ---------------------------------------------------------------------------
// Die Werkzeichnung — das Soll
// ---------------------------------------------------------------------------

function Werkzeichnung() {
  return (
    <div className="grid size-full place-items-center bg-kh-band-soft p-3">
      <svg
        viewBox="0 0 320 200"
        className="h-full max-h-[150px] w-full max-w-[320px] landscape:max-h-none"
        role="img"
        aria-label={`Werkzeichnung: Länge ${mm(ZIEL_MM)}, Winkel ${ZIEL_WINKEL} Grad`}
      >
        <text x="14" y="26" fontSize="13" letterSpacing="2" fill="var(--color-kh-grey)">
          WERKZEICHNUNG
        </text>
        <path
          d="M20 96 L280 96 L262 130 L20 130 Z"
          fill="var(--color-kh-orange)"
          opacity="0.18"
          stroke="var(--color-kh-ink)"
          strokeWidth="1.5"
        />
        <path
          d="M20 150 L280 150"
          stroke="var(--color-kh-grey)"
          strokeWidth="1.2"
          strokeDasharray="4 3"
        />
        <text
          x="150"
          y="172"
          fontSize="20"
          fontWeight="700"
          textAnchor="middle"
          fill="var(--color-kh-ink)"
        >
          {mm(ZIEL_MM)}
        </text>
        <path
          d="M266 96 A 26 26 0 0 1 274 114"
          fill="none"
          stroke="var(--color-kh-grey)"
          strokeWidth="1.2"
        />
        <text x="284" y="86" fontSize="18" fontWeight="700" fill="var(--color-kh-ink)">
          {ZIEL_WINKEL}°
        </text>
      </svg>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Der Balken — das Ist
// ---------------------------------------------------------------------------

const GRIFF = 'm4-schnitt'

function Zuschnitt({
  laenge,
  onLaenge,
  winkel,
  onWinkel,
  gesperrt,
  ergebnis,
  versuche,
  onPruefen,
  onZeigMirWie,
}: {
  laenge: number
  onLaenge: (n: number) => void
  winkel: Winkel | null
  onWinkel: (w: Winkel) => void
  gesperrt: boolean
  ergebnis: Rueckmeldung | null
  versuche: number
  onPruefen: () => void
  onZeigMirWie: () => void
}) {
  const bahn = useRef<HTMLDivElement>(null)
  const beimGreifen = useRef(laenge)

  // 8 px Aktivierungsweg: ein Tap auf den Balken soll nichts verschieben, ein
  // Zug soll sofort greifen.
  const sensoren = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  )

  const anteil = (laenge - MIN_MM) / (MAX_MM - MIN_MM)

  const ziehen = useCallback(
    (e: DragMoveEvent) => {
      const breite = bahn.current?.offsetWidth ?? 1
      const proPixel = (MAX_MM - MIN_MM) / breite
      const roh = beimGreifen.current + e.delta.x * proPixel
      // Auf 10 mm runden: die Zeichnung gibt Millimeter an, aber niemand trifft
      // mit dem Finger einen Millimeter.
      const gerundet = Math.round(roh / 10) * 10
      onLaenge(Math.min(MAX_MM, Math.max(MIN_MM, gerundet)))
    },
    [onLaenge],
  )

  return (
    <div className="flex h-full min-h-0 flex-col justify-center gap-4" data-wisch="aus">
      <div className="flex items-baseline gap-3">
        <span
          data-testid="m4-laenge"
          className="text-[clamp(1.8rem,1.3rem+1.8vw,2.8rem)] leading-none font-bold text-kh-orange tabular-nums"
        >
          {mm(laenge)}
        </span>
        <span className="text-[15px] text-kh-grey">
          Zieh die Schnittlinie auf das Maß.
        </span>
      </div>

      <DndContext
        sensors={sensoren}
        onDragStart={() => {
          beimGreifen.current = laenge
        }}
        onDragMove={ziehen}
      >
        <div ref={bahn} className="relative h-[104px] w-full select-none">
          {/* Der Balken. Der Teil rechts der Schnittlinie ist Verschnitt. */}
          <div className="absolute inset-x-0 top-[26px] h-[52px] overflow-hidden rounded-[3px] bg-[#C08A50]">
            <div
              className="absolute inset-y-0 left-0 bg-[#A9743F]"
              style={{ width: `${anteil * 100}%` }}
            />
            <div
              className="absolute inset-y-0 bg-[repeating-linear-gradient(90deg,rgba(0,0,0,0.07)_0_2px,transparent_2px_26px)]"
              style={{ left: 0, right: 0 }}
              aria-hidden
            />
          </div>

          <Schnittgriff anteil={anteil} gesperrt={gesperrt} />
        </div>
      </DndContext>

      <div className="flex flex-col gap-2">
        <p className="text-[15px] text-kh-grey">Und der Winkel am First:</p>
        <div className="flex gap-2">
          {WINKEL.map((w) => (
            <Button
              key={w}
              variant={winkel === w ? 'default' : 'outline'}
              onClick={() => onWinkel(w)}
              disabled={gesperrt}
              data-testid={`m4-winkel-${w}`}
              className="h-[60px] flex-1 gap-2 text-[16px]"
            >
              <svg viewBox="0 0 24 24" className="size-6" aria-hidden>
                <path
                  d={`M2 20 L22 20 L22 ${20 - 20 * Math.tan((w * Math.PI) / 180) * 0.5} Z`}
                  fill="currentColor"
                  opacity="0.45"
                />
              </svg>
              {w}°
            </Button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {ergebnis && (
          <motion.p
            key={ergebnis.text}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            data-testid="m4-rueckmeldung"
            className={`rounded-kh px-4 py-3 text-[15px] ${
              ergebnis.treffer
                ? 'bg-kh-orange/12 text-kh-ink'
                : 'bg-kh-band-soft text-kh-grey'
            }`}
          >
            {ergebnis.text}
          </motion.p>
        )}
      </AnimatePresence>

      {!gesperrt && (
        <div className="flex items-center justify-between gap-3">
          {versuche >= HILFE_AB ? (
            <Button
              variant="ghost"
              onClick={onZeigMirWie}
              data-testid="m4-zeig-mir-wie"
              className="h-[60px] px-4 text-[15px]"
            >
              Zeig mir wie
            </Button>
          ) : (
            <span />
          )}
          <Button onClick={onPruefen} data-testid="m4-pruefen" className="h-[60px] px-7">
            Schnitt setzen
          </Button>
        </div>
      )}
    </div>
  )
}

function Schnittgriff({ anteil, gesperrt }: { anteil: number; gesperrt: boolean }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: GRIFF,
    disabled: gesperrt,
  })

  return (
    // Die Position kommt aus dem Zustand, nicht aus `transform`: so ist der
    // Griff am Rand von selbst begrenzt, ohne ein Modifier-Paket.
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      data-testid="m4-griff"
      aria-label="Schnittlinie verschieben"
      style={{ left: `${anteil * 100}%` }}
      className={`absolute top-0 h-full w-[60px] -translate-x-1/2 cursor-ew-resize touch-none ${
        gesperrt ? 'pointer-events-none' : ''
      }`}
    >
      <div
        className={`absolute top-[18px] bottom-[18px] left-1/2 w-[3px] -translate-x-1/2 rounded-full bg-kh-ink transition-colors ${
          isDragging ? 'bg-kh-orange' : ''
        }`}
      />
      <div
        className={`absolute top-1/2 left-1/2 size-11 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-kh-page bg-kh-orange shadow-lg transition-transform ${
          isDragging ? 'scale-110' : ''
        }`}
      />
    </div>
  )
}
