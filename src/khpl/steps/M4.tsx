import { useCallback, useRef, useState } from 'react'
import {
  DndContext,
  PointerSensor,
  useDraggable,
  useSensor,
  useSensors,
  type DragMoveEvent,
} from '@dnd-kit/core'
import { Button } from '@/components/ui/button'
import { AhaKarte } from '@/khpl/komponenten/AhaKarte'
import { Begriff } from '@/khpl/komponenten/Begriff'
import { Rueckmeldung } from '@/khpl/komponenten/Rueckmeldung'
import { StepFuss, useStepNavigation } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { merkeAntwort, useFortschritt } from '@/khpl/store/fortschritt'

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
  const gespeichert = useFortschritt().answers.m4
  const fertig = !!gespeichert?.getroffen
  const [laenge, setLaenge] = useState(() => (fertig ? ZIEL_MM : START_MM))
  const [winkel, setWinkel] = useState<Winkel | null>(() => (fertig ? ZIEL_WINKEL : null))
  const [versuche, setVersuche] = useState(() => gespeichert?.versuche ?? 0)
  const [ergebnis, setErgebnis] = useState<Rueckmeldung | null>(() =>
    fertig ? { treffer: true, text: 'Passt. Nummer drauf — Teil 14 von 68.' } : null,
  )
  const [geloest, setGeloest] = useState(fertig)

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

  // `justify-start` + `shrink-0` statt `justify-center`: bei zentrierter
  // Ausrichtung überlappen die Kinder, sobald der Fuß wächst (Abstecher-Angebot
  // plus Aha-Karte) — der Balken lief dann quer durch die Winkelknöpfe.
  return (
    <div
      className="flex h-full min-h-0 flex-col justify-start gap-3 overflow-hidden"
      data-wisch="aus"
    >
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
        <div ref={bahn} className="relative h-[92px] w-full shrink-0 select-none">
          {/* Der Balken. Der Teil rechts der Schnittlinie ist Verschnitt. */}
          <div className="absolute inset-x-0 top-[22px] h-[48px] overflow-hidden rounded-[3px] bg-[#C08A50]">
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

          <Schnittgriff anteil={anteil} gesperrt={gesperrt} winkel={winkel} />
        </div>
      </DndContext>

      {/* Ist der Schnitt gesetzt, schrumpft die Winkelwahl auf eine Zeile.
          Drei deaktivierte 60-px-Knöpfe stehen sonst weiter im Weg — und im
          Querformat schob genau das die Erfolgsmeldung aus der Spalte heraus,
          sodass „Passt. Nummer drauf“ überhaupt nicht mehr zu sehen war. */}
      {gesperrt ? (
        <p className="shrink-0 text-[15px] text-kh-grey">
          Winkel am First: <span className="font-normal text-kh-ink">{winkel}°</span>
        </p>
      ) : (
        <div className="flex shrink-0 flex-col gap-2">
          <p className="text-[15px] text-kh-grey">Und der Winkel am First:</p>
          <div className="flex gap-2">
            {WINKEL.map((w) => (
              <Button
                key={w}
                variant={winkel === w ? 'default' : 'outline'}
                onClick={() => onWinkel(w)}
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
      )}

      <div className="shrink-0">
        <Rueckmeldung
          ok={ergebnis ? ergebnis.treffer : null}
          text={ergebnis ? ergebnis.text : null}
          testid="m4-rueckmeldung"
        />
      </div>

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

function Schnittgriff({
  anteil,
  gesperrt,
  winkel,
}: {
  anteil: number
  gesperrt: boolean
  winkel: Winkel | null
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: GRIFF,
    disabled: gesperrt,
  })

  // Gleiche Geometrie wie das Dreieck auf den Winkelknöpfen: je kleiner der
  // Winkel am First, desto schräger die Schnittlinie gegen die Senkrechte.
  const grad = 90 - (winkel ?? 90)

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
        data-testid="m4-schnittlinie"
        style={{ transform: `translateX(-50%) rotate(${grad}deg)` }}
        className={`absolute top-[18px] bottom-[18px] left-1/2 w-[3px] origin-center rounded-full bg-kh-ink transition-all duration-200 ${
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
