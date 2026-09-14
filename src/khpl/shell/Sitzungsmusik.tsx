import { useEffect } from 'react'
import { Music2, SlidersHorizontal, Volume2, VolumeX } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'
import { RADIO_SENDER } from '@/khpl/match/fragen'
import { useBildschirm } from '@/khpl/store/fortschritt'
import {
  pausiere,
  spiele,
  setzeSitzungsmusikZurueck,
  useSitzungsmusik,
  waehleMusikstil,
} from './musik-store'

/** Einmal in KhplApp montieren. Die Klasse bestimmt die Position des Schalters. */
export function SitzungsmusikSteuerung({ className = '' }: { className?: string }) {
  const musik = useSitzungsmusik()
  const bildschirm = useBildschirm()

  // Nur beim Betreten stummschalten. Manuelles Einschalten bleibt danach bestehen.
  useEffect(() => {
    if (bildschirm === 'berufe') pausiere()
  }, [bildschirm])
  const sender = RADIO_SENDER.find((s) => s.stil === musik.stil) ?? RADIO_SENDER[1]

  useEffect(() => {
    const hintergrund = () => {
      if (document.visibilityState === 'hidden') pausiere()
    }
    window.addEventListener('khpl:sitzung-neu', setzeSitzungsmusikZurueck)
    window.addEventListener('pagehide', pausiere)
    document.addEventListener('visibilitychange', hintergrund)
    return () => {
      window.removeEventListener('khpl:sitzung-neu', setzeSitzungsmusikZurueck)
      window.removeEventListener('pagehide', pausiere)
      document.removeEventListener('visibilitychange', hintergrund)
      pausiere()
    }
  }, [])

  return (
    <div className={`${className} flex items-center gap-1`} data-testid="sitzungsmusik">
      <button
        type="button"
        data-testid="musik-direkt-umschalten"
        aria-label={musik.an ? 'Musik ausschalten' : 'Musik einschalten'}
        aria-pressed={musik.an}
        disabled={musik.startet}
        onClick={() => (musik.an ? pausiere() : void spiele(musik.stil))}
        className="flex min-h-12 items-center gap-2 rounded-kh-pill border border-white/20 bg-[#171611] px-3 text-base font-semibold text-kh-paper focus-visible:outline-4 focus-visible:outline-kh-orange disabled:opacity-60"
      >
        {musik.an ? (
          <Volume2 className="size-5" aria-hidden />
        ) : (
          <VolumeX className="size-5" aria-hidden />
        )}
        <span className="hidden sm:inline">Musik</span>
      </button>
      <Popover>
        <PopoverTrigger
          data-testid="musik-oeffnen"
          aria-label={`Musik ${musik.an ? `an: ${sender.name}` : 'aus'}. Musik einstellen`}
          className="flex min-h-12 items-center gap-2 rounded-kh-pill border border-white/20 bg-[#171611] px-3 text-base font-semibold text-kh-paper focus-visible:outline-4 focus-visible:outline-kh-orange"
        >
          <SlidersHorizontal className="size-5" aria-hidden />
        </PopoverTrigger>
        <PopoverContent className="w-80 max-w-[calc(100vw-2rem)]">
          <PopoverTitle>Dein Baustellenradio</PopoverTitle>
          <button
            type="button"
            data-testid="musik-umschalten"
            aria-pressed={musik.an}
            disabled={musik.startet}
            onClick={() => (musik.an ? pausiere() : void spiele(musik.stil))}
            className="mt-4 flex min-h-14 w-full items-center justify-center gap-3 rounded-kh bg-kh-orange px-4 font-semibold text-kh-ink disabled:opacity-60"
          >
            {musik.an ? (
              <VolumeX className="size-5" aria-hidden />
            ) : (
              <Volume2 className="size-5" aria-hidden />
            )}
            {musik.startet ? 'Musik startet' : musik.an ? 'Musik aus' : 'Musik an'}
          </button>
          <fieldset className="mt-5">
            <legend className="kh-etikett mb-2">Dein Stil</legend>
            <div className="grid grid-cols-2 gap-2">
              {RADIO_SENDER.map((s) => (
                <button
                  key={s.stil}
                  type="button"
                  data-testid={`musik-stil-${s.stil}`}
                  aria-pressed={musik.stil === s.stil}
                  onClick={() => waehleMusikstil(s.stil)}
                  className={`flex min-h-12 items-center gap-2 rounded-kh border-2 px-3 text-left font-semibold ${musik.stil === s.stil ? 'border-kh-orange bg-kh-orange/10 text-kh-paper' : 'border-kh-line-strong text-kh-paper/80'}`}
                >
                  <Music2 className="size-4 shrink-0" aria-hidden />
                  {s.name}
                </button>
              ))}
            </div>
          </fieldset>
          <p className="mt-4 text-sm leading-snug text-kh-paper/70">
            Hier kannst du die Musik jederzeit ein- und ausschalten.
          </p>
          <p role="status" className="mt-2 text-sm text-kh-paper">
            {musik.fehler}
          </p>
        </PopoverContent>
      </Popover>
    </div>
  )
}
