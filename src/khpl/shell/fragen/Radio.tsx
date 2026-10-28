import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { ArrowRight, Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Antwortmoeglichkeit, Frage } from '@/khpl/match/fragen'
import { pausiere, spiele, useSitzungsmusik } from '../musik-store'

/** Das Frequenzband steuert dasselbe Radio wie der globale Musikschalter. */

const BAND_MIN = 87
const BAND_MAX = 108

/**
 * Loslassen näher als das zieht auf den Sender — großzügig, Messefinger.
 * Obergrenze: der halbe Senderabstand (4,2 MHz in `fragen.ts`), sonst
 * gehören Bandstücke zwei Sendern.
 */
const FANG_MHZ = 2
/** Näher als das gilt als eingerastet (Anzeige, Bild, Klang, Weiter-Knopf). */
const RAST_MHZ = 0.3

const anteil = (mhz: number) => (mhz - BAND_MIN) / (BAND_MAX - BAND_MIN)
const komma = (mhz: number) => mhz.toFixed(1).replace('.', ',')

export function Radio({
  frage,
  onFertig,
}: {
  frage: Frage
  onFertig: (antwortId: string) => void
}) {
  const musik = useSitzungsmusik()
  const reduziert = useReducedMotion()
  const [mhz, setMhz] = useState(() =>
    musik.an
      ? (frage.antworten.find((a) => a.sender?.stil === musik.stil)?.sender?.mhz ?? 95.4)
      : 95.4,
  )
  const [beruehrt, setBeruehrt] = useState(false)
  const band = useRef<HTMLDivElement>(null)

  // Der Stand für `raste`: ein schneller Tipp feuert down und up im selben
  // Frame, bevor React neu gerendert hat — ein Handler, der den State aus
  // seinem Render liest, rastet dann auf der Frequenz von **vor** dem Tipp.
  const mhzJetzt = useRef(mhz)
  const stelle = (wert: number) => {
    mhzJetzt.current = wert
    setMhz(wert)
  }

  const eingestellt: Antwortmoeglichkeit | null =
    frage.antworten.find((a) => a.sender && Math.abs(a.sender.mhz - mhz) <= RAST_MHZ) ??
    null
  const sender = eingestellt?.sender ?? null

  // Ein Senderwechsel am globalen Schalter erscheint auch auf dem Frequenzband.
  const letzterStil = useRef(musik.stil)
  useEffect(() => {
    if (letzterStil.current === musik.stil && !musik.an) return
    letzterStil.current = musik.stil
    const neu = frage.antworten.find((a) => a.sender?.stil === musik.stil)?.sender
    if (neu) {
      mhzJetzt.current = neu.mhz
      setMhz(neu.mhz)
    }
  }, [musik.stil, musik.an, frage.antworten])

  const waehleFrequenz = (wert: number) => {
    stelle(wert)
    const neu = frage.antworten.find(
      (a) => a.sender && Math.abs(a.sender.mhz - wert) <= RAST_MHZ,
    )?.sender
    if (neu && (!musik.an || musik.stil !== neu.stil)) void spiele(neu.stil)
  }

  const schalteMusik = () => {
    if (musik.an) {
      pausiere()
      return
    }
    const ziel =
      sender ?? frage.antworten.find((a) => a.sender?.stil === musik.stil)?.sender
    if (!ziel) return
    stelle(ziel.mhz)
    setBeruehrt(true)
    void spiele(ziel.stil)
  }

  const drehe = (clientX: number) => {
    const el = band.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const a = Math.min(1, Math.max(0, (clientX - r.left) / r.width))
    stelle(BAND_MIN + a * (BAND_MAX - BAND_MIN))
  }

  const raste = () => {
    const f = mhzJetzt.current
    let nah: number | null = null
    for (const a of frage.antworten) {
      if (!a.sender) continue
      const abstand = Math.abs(a.sender.mhz - f)
      if (abstand <= FANG_MHZ && (nah === null || abstand < Math.abs(nah - f))) {
        nah = a.sender.mhz
      }
    }
    if (nah !== null) waehleFrequenz(nah)
  }

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      {/* Die Bühne: ein Motiv, das mit dem Empfang lebt — klar und im
          Bühnenlicht des Senders, sobald einer steht; dunkel und verrauscht
          dazwischen. */}
      <div className="absolute inset-0 overflow-hidden rounded-kh-lg bg-kh-surface">
        <img
          src={frage.buehne}
          alt=""
          draggable={false}
          className={`absolute inset-0 size-full object-cover transition-opacity duration-200 motion-reduce:transition-none ${
            eingestellt ? 'opacity-100' : 'opacity-40 blur-[2px]'
          }`}
        />
        {/* Das Bühnenlicht: ein Farbwash von oben in der Senderfarbe. */}
        <div
          aria-hidden
          className="absolute inset-0 transition-opacity duration-200 motion-reduce:transition-none"
          style={{
            opacity: sender ? 1 : 0,
            background: `radial-gradient(110% 80% at 50% 0%, ${sender?.farbe ?? '#000000'}59, transparent 62%)`,
          }}
        />
        {/* Rauschen: solange kein Sender steht, flackert eine feine
            Zeilenstruktur über dem dunklen Grund. */}
        {!eingestellt && (
          <motion.div
            aria-hidden
            animate={{
              opacity: reduziert || !musik.an ? 0.13 : [0.1, 0.22, 0.13, 0.24, 0.1],
            }}
            transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.14)_0px,rgba(255,255,255,0.14)_1px,transparent_1px,transparent_4px)]"
          />
        )}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-[#0E0D0B] via-[#0E0D0B]/45 to-[#0E0D0B]/20"
        />
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col justify-between gap-4 p-4 landscape:p-6">
        <header className="flex shrink-0 flex-col gap-1.5">
          <span className="kh-etikett flex items-center gap-2">
            <span aria-hidden className="h-[3px] w-7 rounded-full bg-kh-orange" />
            {frage.etikett}
          </span>
          <h1 className="font-display text-[clamp(1.8rem,1.2rem+2.6vw,3.2rem)] leading-[0.96] text-balance uppercase">
            {frage.frage}
          </h1>
        </header>

        {/* Das Gerät. Ein Panel wie überall im System — die Anzeige oben,
            das Band darunter, nichts weiter. */}
        <div className="kh-panel shrink-0 p-4 landscape:mx-auto landscape:w-full landscape:max-w-[56rem] landscape:p-5">
          <div className="flex min-h-[4.5rem] items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3.5">
              {/* Der Pegel läuft nur, wenn ein Sender steht — im Takt und in
                  der Farbe des Senders. */}
              <span aria-hidden className="flex h-9 shrink-0 items-end gap-[3px]">
                {[0.55, 0.9, 0.7, 1, 0.45].map((h, i) => (
                  <span
                    key={i}
                    className={`w-[5px] origin-bottom rounded-full ${
                      sender && musik.an && !reduziert ? 'animate-eq' : 'bg-white/15'
                    }`}
                    style={{
                      height: `${h * 100}%`,
                      backgroundColor: sender?.farbe,
                      animationDelay: `${i * 0.11}s`,
                      animationDuration: sender
                        ? `${((60 / sender.bpm) * [2, 1, 1.5, 0.5, 1][i]).toFixed(3)}s`
                        : undefined,
                    }}
                  />
                ))}
              </span>
              <div className="min-w-0">
                {sender ? (
                  <motion.div
                    key={eingestellt?.id}
                    initial={false}
                    animate={{ opacity: 1, transform: 'translateY(0px)' }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div
                      className="kh-titel-klein truncate"
                      style={{ color: sender.farbe }}
                    >
                      {sender.name}
                    </div>
                    <p className="text-[1rem] leading-snug font-medium text-kh-paper/85">
                      {eingestellt?.text}
                    </p>
                  </motion.div>
                ) : (
                  <div>
                    <div className="kh-titel-klein text-kh-paper/75">Rauschen</div>
                    <p className="text-[1rem] leading-snug text-kh-paper/70">
                      Tippe auf einen Sender.
                    </p>
                  </div>
                )}
              </div>
            </div>
            <span
              className={`shrink-0 font-display text-[2rem] leading-[0.9] tabular-nums transition-colors landscape:text-[2.4rem] ${
                sender ? '' : 'text-kh-paper/75'
              }`}
              style={sender ? { color: sender.farbe } : undefined}
              data-testid="radio-frequenz"
            >
              {komma(mhz)}
            </span>
          </div>

          {/* Das Frequenzband. Die ganze Zeile ist Grifffläche. */}
          <div
            role="slider"
            tabIndex={0}
            aria-label="Sender einstellen"
            aria-valuemin={BAND_MIN}
            aria-valuemax={BAND_MAX}
            aria-valuenow={Math.round(mhz * 10) / 10}
            aria-valuetext={
              sender
                ? `${komma(mhz)} Megahertz — ${sender.name}`
                : `${komma(mhz)} Megahertz — Rauschen`
            }
            data-testid="radio-band"
            className="relative mt-1 h-28 cursor-grab touch-none select-none"
            onPointerDown={(e) => {
              try {
                e.currentTarget.setPointerCapture(e.pointerId)
              } catch {
                // Ohne Capture dreht es trotzdem, nur nicht über den Rand hinaus.
              }
              setBeruehrt(true)
              drehe(e.clientX)
            }}
            onPointerMove={(e) => {
              if (e.buttons > 0) drehe(e.clientX)
            }}
            onPointerUp={raste}
            onPointerCancel={raste}
            onKeyDown={(e) => {
              if (e.target !== e.currentTarget) return
              const delta =
                e.key === 'ArrowRight' || e.key === 'ArrowUp'
                  ? 0.1
                  : e.key === 'ArrowLeft' || e.key === 'ArrowDown'
                    ? -0.1
                    : 0
              if (!delta && e.key !== 'Home' && e.key !== 'End') return
              e.preventDefault()
              setBeruehrt(true)
              waehleFrequenz(
                e.key === 'Home'
                  ? BAND_MIN
                  : e.key === 'End'
                    ? BAND_MAX
                    : Math.min(BAND_MAX, Math.max(BAND_MIN, mhzJetzt.current + delta)),
              )
            }}
          >
            {/* Drei Etagen, damit nichts kollidiert: Sendernamen über dem
                Band, Striche auf dem Band, Zahlen darunter. */}
            <div ref={band} className="absolute inset-x-3 top-10 bottom-8">
              {/* Skala: feine Striche, alle vier MHz beschriftet. */}
              {Array.from({ length: BAND_MAX - BAND_MIN + 1 }, (_, i) => {
                const f = BAND_MIN + i
                const beschriftet = f % 4 === 0
                return (
                  <div
                    key={f}
                    aria-hidden
                    className="absolute top-0 -translate-x-1/2"
                    style={{ left: `${anteil(f) * 100}%` }}
                  >
                    <div
                      className={`w-px ${
                        beschriftet ? 'h-5 bg-white/40' : 'h-3 bg-white/18'
                      }`}
                    />
                    {beschriftet && (
                      <span className="absolute top-6 left-1/2 -translate-x-1/2 text-[0.75rem] font-semibold text-kh-mute tabular-nums">
                        {f}
                      </span>
                    )}
                  </div>
                )
              })}

              {/* Sendermarken: antippbar — wer nicht drehen mag, tippt. Jede
                  Marke trägt ihre Senderfarbe: das Band verspricht die
                  Vielfalt, bevor der erste Dreh sie beweist. */}
              {frage.antworten.map((a) => {
                const s = a.sender
                if (!s) return null
                const aktiv = eingestellt?.id === a.id
                return (
                  <button
                    key={a.id}
                    type="button"
                    data-testid={`antwort-${a.id}`}
                    aria-label={`${s.name}, ${komma(s.mhz)} Megahertz`}
                    onPointerDown={(e) => e.stopPropagation()}
                    onPointerUp={(e) => e.stopPropagation()}
                    onClick={() => {
                      setBeruehrt(true)
                      waehleFrequenz(s.mhz)
                    }}
                    className="absolute -top-10 bottom-0 flex min-w-11 -translate-x-1/2 flex-col items-center rounded focus-visible:outline-2 focus-visible:outline-kh-orange"
                    style={{ left: `${anteil(s.mhz) * 100}%` }}
                  >
                    <span
                      className="flex h-8 items-center text-[0.6875rem] font-semibold tracking-[0.02em] sm:text-[0.8125rem] sm:tracking-[0.1em] whitespace-nowrap uppercase transition-[color,opacity]"
                      style={{ color: s.farbe, opacity: aktiv ? 1 : 0.65 }}
                    >
                      {s.name}
                    </span>
                    <span
                      aria-hidden
                      className={`mt-1 size-3 rounded-full transition-[transform,opacity] ${
                        aktiv ? 'scale-125' : 'opacity-70'
                      }`}
                      style={{ backgroundColor: s.farbe }}
                    />
                  </button>
                )
              })}

              {/* Die Nadel. Bis zum ersten Griff pulsiert der Knauf. */}
              <div
                aria-hidden
                className="pointer-events-none absolute -top-2 -bottom-1 -translate-x-1/2"
                style={{ left: `${anteil(mhz) * 100}%` }}
              >
                <div className="mx-auto h-full w-[3px] rounded-full bg-kh-orange shadow-[0_0_14px_rgba(255,122,26,0.6)]" />
                <div
                  className={`absolute -bottom-4 left-1/2 size-8 -translate-x-1/2 rounded-full border-4 border-[#0E0D0B] bg-kh-orange ${
                    beruehrt || reduziert ? '' : 'animate-puls'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              data-testid="radio-musik-umschalten"
              aria-pressed={musik.an}
              disabled={musik.startet}
              onClick={schalteMusik}
              className="flex min-h-12 items-center gap-2 rounded-kh border border-white/35 bg-kh-ink/80 px-4 font-semibold text-kh-paper focus-visible:outline-4 focus-visible:outline-kh-orange disabled:opacity-60"
            >
              {musik.an ? (
                <VolumeX className="size-5" aria-hidden />
              ) : (
                <Volume2 className="size-5" aria-hidden />
              )}
              {musik.startet
                ? 'Musik startet'
                : musik.an
                  ? 'Musik ausschalten'
                  : 'Musik einschalten'}
            </button>
            <span className="text-sm text-kh-paper/80">
              {musik.an ? 'Läuft bei den nächsten Fragen weiter.' : 'Musik ist aus.'}
            </span>
          </div>
          {musik.fehler && (
            <p role="status" className="text-sm text-kh-paper">
              {musik.fehler}
            </p>
          )}
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              data-testid="radio-ueberspringen"
              onClick={() => onFertig('offen')}
              className="min-h-12 rounded-kh px-2 font-semibold text-kh-paper/80 underline underline-offset-4 focus-visible:outline-4 focus-visible:outline-kh-orange"
            >
              Überspringen
            </button>
            {eingestellt && (
              <Button
                variant="weiter"
                size="lg"
                onClick={() => onFertig(eingestellt.id)}
                data-testid="radio-weiter"
              >
                Weiter
                <ArrowRight className="size-5" strokeWidth={2.5} aria-hidden />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
