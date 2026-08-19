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
import { StepFoto } from '@/khpl/buehne/Foto'
import { AhaKarte } from '@/khpl/komponenten/AhaKarte'
import { Begriff } from '@/khpl/komponenten/Begriff'
import { Rueckmeldung } from '@/khpl/komponenten/Rueckmeldung'
import { StepFuss } from '@/khpl/shell/StepFuss'
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
 * Solange der Schnitt nicht sitzt, ist „Schnitt setzen“ die Primärhandlung im
 * Fuß und Weiter nur ein leises Überspringen (siehe `Verzweigung`).
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
      interaktionOffen={!geloest}
      // Die Werkzeichnung ist von der Bühne in die Karte gewandert (siehe
      // `interaktion`): sie trägt Sollmaß und Sollwinkel und ist damit die
      // Aufgabenstellung, nicht die Kulisse. Auf der Bühne steht jetzt die
      // Werkstatt selbst — jemand, der genau diesen Schnitt macht.
      buehne={<StepFoto id="M4" />}
      fachtext={
        <p>
          <Begriff id="abbundplan">Abbundplan</Begriff> lesen, Hölzer anzeichnen, ablängen
          — heute meist auf der <Begriff id="abbundanlage">Abbundanlage</Begriff>, bei
          Sonderteilen von Hand. Jedes Teil bekommt eine Nummer.
        </p>
      }
      karteBreit
      interaktion={
        // Quer nebeneinander: die Werkzeichnung ist Nachschlagewerk, der
        // Zuschnitt die Handlung. Untereinander schob die Zeichnung die Übung
        // unter die Kartenkante.
        <div className="flex flex-col gap-3 landscape:flex-row landscape:items-start landscape:gap-5">
          <div className="shrink-0 landscape:w-[38%]">
            <Werkzeichnung />
          </div>
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
          />
        </div>
      }
      aha={
        <AhaKarte sichtbar={geloest} eyebrow="Übrigens">
          Den Zuschnitt macht im Betrieb meist eine CNC-Maschine — die Abbundanlage — nach
          genau dem Plan, den du gezeichnet hast. Von Hand kommt, was sie nicht kann. Das
          ist mehr, als man denkt.
        </AhaKarte>
      }
      fuss={
        <StepFuss
          id="M4"
          uebungOffen={!geloest}
          aktion={
            geloest ? null : (
              <div className="flex items-center gap-2">
                <Button variant="aktion" onClick={pruefen} data-testid="m4-pruefen">
                  Schnitt setzen
                </Button>
                {versuche >= HILFE_AB && (
                  <Button
                    variant="leise"
                    onClick={zeigMirWie}
                    data-testid="m4-zeig-mir-wie"
                  >
                    Zeig mir wie
                  </Button>
                )}
              </div>
            )
          }
          geschafft={geloest ? 'Zuschnitt sitzt' : null}
        />
      }
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

/**
 * Das Soll. Steht in der Karte, nicht auf der Bühne: hier stehen Länge und
 * Winkel, die getroffen werden sollen — wer sie sucht, darf nicht am Bildrand
 * danach schauen müssen, während er unten den Balken zieht.
 *
 * Quer steht sie links neben dem Zuschnitt, hochkant darüber. `viewBox` ohne
 * die leere obere Hälfte, damit sie flach bleibt und die Übung nicht wegdrückt.
 */
function Werkzeichnung() {
  return (
    <div className="kh-feld flex w-full flex-col gap-1.5 px-3.5 py-2.5">
      <p className="kh-etikett">Soll laut Plan</p>
      <svg
        viewBox="10 80 310 60"
        className="h-[44px] w-full"
        role="img"
        aria-label={`Werkzeichnung: Länge ${mm(ZIEL_MM)}, Winkel ${ZIEL_WINKEL} Grad`}
      >
        <path
          d="M20 96 L280 96 L262 130 L20 130 Z"
          fill="var(--color-kh-orange)"
          opacity="0.3"
          stroke="var(--color-kh-orange)"
          strokeWidth="2"
        />
      </svg>
      {/* Die beiden Sollwerte stehen als Zahlen daneben, nicht als 18-px-Text
          in der Zeichnung. Sie sind die Aufgabe — wer sie sucht, soll sie aus
          zwei Metern Entfernung finden, nicht in einer Vektorgrafik lesen. */}
      <dl className="flex gap-5">
        <div>
          <dt className="text-[0.875rem] text-kh-mute">Länge</dt>
          <dd className="font-display text-[1.5rem] leading-none text-kh-paper tabular-nums">
            {mm(ZIEL_MM)}
          </dd>
        </div>
        <div>
          <dt className="text-[0.875rem] text-kh-mute">Winkel am First</dt>
          <dd className="font-display text-[1.5rem] leading-none text-kh-paper tabular-nums">
            {ZIEL_WINKEL}°
          </dd>
        </div>
      </dl>
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
}: {
  laenge: number
  onLaenge: (n: number) => void
  winkel: Winkel | null
  onWinkel: (w: Winkel) => void
  gesperrt: boolean
  ergebnis: Rueckmeldung | null
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
    <div className="flex min-w-0 flex-1 flex-col gap-2" data-wisch="aus">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
        <span
          data-testid="m4-laenge"
          className="font-display text-[clamp(1.9rem,1.3rem+1.6vw,2.75rem)] leading-none text-kh-signal tabular-nums"
        >
          {mm(laenge)}
        </span>
        <span className="text-[1.0625rem] text-kh-mute">
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
        <div ref={bahn} className="relative h-[76px] w-full shrink-0 select-none">
          {/* Der Balken. Links der Schnittlinie liegt das Teil, rechts der
              Verschnitt — und genau so sieht es jetzt auch aus: das Teil ist
              volles Holz, der Verschnitt ist abgedunkelt und schraffiert.
              Vorher waren beide Hälften fast gleich hell und der Unterschied
              nur an der Sättigung zu erkennen. */}
          <div className="absolute inset-x-0 top-[16px] h-[44px] overflow-hidden rounded-[6px] bg-[#4A382A] ring-1 ring-white/10">
            <div
              className="absolute inset-y-0 left-0 bg-[#C08A50]"
              style={{ width: `${anteil * 100}%` }}
            />
            <div
              aria-hidden
              className="absolute inset-y-0 right-0 bg-[repeating-linear-gradient(-45deg,rgba(255,255,255,0.07)_0_6px,transparent_6px_12px)]"
              style={{ left: `${anteil * 100}%` }}
            />
            <div
              className="absolute inset-y-0 inset-x-0 bg-[repeating-linear-gradient(90deg,rgba(0,0,0,0.12)_0_2px,transparent_2px_26px)]"
              aria-hidden
            />
          </div>

          <Schnittgriff anteil={anteil} gesperrt={gesperrt} />
        </div>
      </DndContext>

      {/* Ist der Schnitt gesetzt, schrumpft die Winkelwahl auf eine Zeile.
          Drei deaktivierte Knöpfe stünden sonst weiter im Weg — und im
          Querformat schob genau das die Erfolgsmeldung aus der Spalte heraus,
          sodass „Passt. Nummer drauf“ überhaupt nicht mehr zu sehen war. */}
      {gesperrt ? (
        <p className="shrink-0 text-[1.0625rem] text-kh-mute">
          Winkel am First: <span className="font-semibold text-kh-paper">{winkel}°</span>
        </p>
      ) : (
        <div className="flex shrink-0 flex-col gap-1.5">
          <p className="text-[1.0625rem] text-kh-mute">Und der Winkel am First:</p>
          <div className="flex gap-2">
            {WINKEL.map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => onWinkel(w)}
                data-testid={`m4-winkel-${w}`}
                aria-pressed={winkel === w}
                className={`flex h-[52px] flex-1 items-center justify-center gap-2 rounded-kh border-2 text-[1.0625rem] font-semibold transition-transform active:scale-95 ${
                  winkel === w
                    ? 'border-kh-signal bg-kh-signal text-[#0E0D0B]'
                    : 'border-kh-line-strong bg-white/5 text-kh-paper'
                }`}
              >
                <svg viewBox="0 0 24 24" className="size-6" aria-hidden>
                  <path
                    d={`M2 20 L22 20 L22 ${20 - 20 * Math.tan((w * Math.PI) / 180) * 0.5} Z`}
                    fill="currentColor"
                    opacity="0.5"
                  />
                </svg>
                {w}°
              </button>
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
        className={`absolute top-[12px] bottom-[12px] left-1/2 w-[3px] -translate-x-1/2 rounded-full transition-colors ${
          isDragging ? 'bg-kh-signal' : 'bg-kh-paper'
        }`}
      />
      <div
        className={`absolute top-1/2 left-1/2 size-12 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-[#0E0D0B] bg-kh-orange shadow-[0_6px_20px_rgba(255,122,26,0.5)] transition-transform ${
          isDragging ? 'scale-110' : ''
        }`}
      />
    </div>
  )
}
