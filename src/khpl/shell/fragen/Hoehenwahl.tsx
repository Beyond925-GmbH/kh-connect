import { useRef, useState } from 'react'
import { motion } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Helm } from '@/khpl/komponenten/Helm'
import type { Frage } from '@/khpl/match/fragen'
import { useSitzung } from '@/khpl/store/fortschritt'

/**
 * Die Höhenfrage als Handgriff: der eigene Helm — in der Farbe aus der
 * Helmwahl — wird am Maßband nach oben gezogen. Wo er losgelassen wird, ist
 * die Antwort.
 *
 * **Warum ein Regler und keine drei Zeilen.** „Zehn Meter über dem Boden“
 * ist als Text eine Mutprobe zum Ankreuzen; als Griff ist es dieselbe
 * Entscheidung im Körper: Wer nicht hoch will, zieht nicht hoch. Die drei
 * Zonen tragen exakt die Gewichte der alten Textantworten — gemessen wird
 * dasselbe, nur die Hand gibt die Antwort statt des Auges.
 *
 * **Der Boden ist eine Antwort, kein Nullzustand.** Der Helm startet unten,
 * und wer ihn dort lässt und weitergeht, hat „lieber Boden unter den Füßen“
 * gesagt — das ist dieselbe Aussage, die vorher eine eigene Zeile war.
 */

/** Oberkante des Maßbands in Metern. Der First liegt bei zehn — wie im Text. */
const MAX_M = 10

/**
 * Zonengrenzen von oben nach unten, passend zur Antwortreihenfolge der Frage:
 * ab 8 m ist es der First, ab 3 m das Gerüst, darunter der Boden.
 */
const GRENZEN_M = [8, 3] as const

function zoneIndex(meter: number): number {
  if (meter >= GRENZEN_M[0]) return 0
  if (meter >= GRENZEN_M[1]) return 1
  return 2
}

export function Hoehenwahl({
  frage,
  onFertig,
}: {
  frage: Frage
  onFertig: (antwortId: string) => void
}) {
  const sitzung = useSitzung()
  const [meter, setMeter] = useState(0.6)
  const [bewegt, setBewegt] = useState(false)
  const band = useRef<HTMLDivElement>(null)

  const antwort = frage.antworten[zoneIndex(meter)]

  const ziehe = (clientY: number) => {
    const el = band.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const anteil = Math.min(1, Math.max(0, 1 - (clientY - r.top) / r.height))
    setMeter(anteil * MAX_M)
  }

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      {/* Die Bühne: Blick von unten ins Sparrenwerk — das Motiv schaut dahin,
          wohin gezogen wird. Stark abgedunkelt, damit Maßband und Helm die
          Vordergrundrolle behalten. */}
      <img
        src={frage.buehne}
        alt=""
        draggable={false}
        className="absolute inset-0 size-full rounded-kh-lg object-cover"
      />
      <div
        aria-hidden
        className="absolute inset-0 rounded-kh-lg bg-gradient-to-r from-[#0E0D0B]/92 via-[#0E0D0B]/70 to-[#0E0D0B]/30"
      />

      <div className="relative flex min-h-0 flex-1 gap-4 p-4 landscape:gap-10 landscape:p-6">
        {/* Linke Spalte: Frage, Messwert, Zonenurteil, Weiter. */}
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-4">
          <header className="flex shrink-0 flex-col gap-1.5">
            <span className="kh-etikett flex items-center gap-2">
              <span aria-hidden className="h-[3px] w-7 rounded-full bg-kh-orange" />
              {frage.etikett}
            </span>
            <h1 className="font-display text-[clamp(1.8rem,1.2rem+2.6vw,3.2rem)] leading-[0.96] text-balance uppercase">
              {frage.frage}
            </h1>
          </header>

          <div className="flex min-h-0 flex-col gap-2">
            <span className="kh-zahl" data-testid="hoehe-meter">
              {meter.toFixed(1).replace('.', ',')}&nbsp;m
            </span>
            {/* Das Urteil wechselt mit der Zone — es ist die alte Antwortzeile,
                nur dass sie jetzt dem Griff folgt statt dem Finger. */}
            <motion.p
              key={antwort.id}
              initial={{ opacity: 0, transform: 'translateY(10px)' }}
              animate={{ opacity: 1, transform: 'translateY(0px)' }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              aria-live="polite"
              className="kh-titel-klein max-w-[18ch] text-kh-paper"
            >
              {antwort.text}
            </motion.p>
          </div>

          <div className="shrink-0">
            <Button
              variant="weiter"
              size="lg"
              onClick={() => onFertig(antwort.id)}
              data-testid="hoehe-weiter"
            >
              Da will ich hin
              <ArrowRight className="size-5" strokeWidth={2.5} />
            </Button>
          </div>
        </div>

        {/* Das Maßband. Die ganze Spalte ist Griff­fläche: Antippen springt,
            Ziehen zieht — auf einem Kiosk ist ein 44-px-Griff eine Falle. */}
        <div
          role="slider"
          tabIndex={0}
          aria-label="Höhe wählen"
          aria-valuemin={0}
          aria-valuemax={MAX_M}
          aria-valuenow={Math.round(meter * 10) / 10}
          aria-valuetext={`${meter.toFixed(1).replace('.', ',')} Meter — ${antwort.text}`}
          data-testid="hoehe-band"
          className="relative w-[8.5rem] shrink-0 cursor-grab touch-none rounded-kh-lg bg-[#0E0D0B]/50 backdrop-blur-[2px] select-none max-sm:w-[6.5rem] landscape:w-[10rem]"
          onPointerDown={(e) => {
            try {
              e.currentTarget.setPointerCapture(e.pointerId)
            } catch {
              // Ohne Capture zieht es trotzdem, nur nicht über den Rand hinaus.
            }
            setBewegt(true)
            ziehe(e.clientY)
          }}
          onPointerMove={(e) => {
            if (e.buttons > 0) ziehe(e.clientY)
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
              setBewegt(true)
              setMeter((m) => Math.min(MAX_M, m + 0.5))
            }
            if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
              setBewegt(true)
              setMeter((m) => Math.max(0, m - 0.5))
            }
          }}
        >
          {/* Innenliegende Laufstrecke: oben und unten so viel Rand, dass der
              Helm an den Anschlägen nicht aus der Spalte fällt. */}
          <div ref={band} className="absolute inset-x-0 top-12 bottom-12">
            {/* Schiene mit Füllstand: der orange Teil ist die geschaffte Höhe. */}
            <div className="absolute inset-y-0 left-1/2 w-[6px] -translate-x-1/2 rounded-full bg-white/12" />
            <div
              className="absolute bottom-0 left-1/2 w-[6px] -translate-x-1/2 rounded-full bg-kh-orange"
              style={{ height: `${(meter / MAX_M) * 100}%` }}
            />

            {/* Meterstriche. Beschriftet nur, wo es etwas zu wissen gibt. */}
            {Array.from({ length: MAX_M + 1 }, (_, m) => (
              <div
                key={m}
                aria-hidden
                className="absolute left-1/2 -translate-x-1/2"
                style={{ bottom: `${(m / MAX_M) * 100}%` }}
              >
                <div
                  className={`h-px -translate-y-1/2 ${
                    m % 5 === 0 ? 'w-9 bg-white/40' : 'w-5 bg-white/20'
                  } mx-auto`}
                />
                {m % 5 === 0 && (
                  <span className="absolute top-1/2 right-full mr-2 -translate-y-1/2 text-[0.8125rem] font-semibold text-kh-paper/70 tabular-nums">
                    {m}&nbsp;m
                  </span>
                )}
              </div>
            ))}

            {/* Zonengrenzen als gestrichelte Marken. */}
            {GRENZEN_M.map((g) => (
              <div
                key={g}
                aria-hidden
                className="absolute left-1/2 w-16 -translate-x-1/2 -translate-y-1/2 border-t border-dashed border-white/25"
                style={{ bottom: `${(g / MAX_M) * 100}%` }}
              />
            ))}

            {/* Der Helm — die Farbe aus der Helmwahl. Bis zum ersten Griff
                pulsiert ein Ring darunter: „hier anfassen“, dieselbe Sprache
                wie der Splash. */}
            <div
              className="absolute left-1/2 -translate-x-1/2 translate-y-1/2"
              style={{ bottom: `${(meter / MAX_M) * 100}%` }}
            >
              <div
                className={`grid size-[5.5rem] place-items-center rounded-full landscape:size-[6.5rem] ${
                  bewegt ? '' : 'animate-puls'
                } bg-[#0E0D0B]/55 backdrop-blur-sm`}
              >
                <Helm
                  farbe={sitzung.helm?.farbe}
                  className="w-[4.25rem] drop-shadow-[0_8px_18px_rgba(0,0,0,0.6)] landscape:w-[5rem]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
