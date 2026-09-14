import type { Ref } from 'react'
import { ArrowRight, Check, CircleHelp } from 'lucide-react'
import type { Frage } from '@/khpl/match/fragen'

export function Bildwahl({
  frage,
  gewaehlt,
  onWahl,
  titelRef,
}: {
  frage: Frage
  gewaehlt: string | null
  onWahl: (antwortId: string) => void
  titelRef?: Ref<HTMLHeadingElement>
}) {
  const neutral = frage.antworten.find((a) => a.neutral)
  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <header className="shrink-0">
        <p className="kh-etikett">{frage.etikett}</p>
        <h1
          ref={titelRef}
          tabIndex={-1}
          className="mt-2 font-display text-[clamp(1.8rem,1.2rem+2.6vw,3.2rem)] leading-tight uppercase outline-none"
        >
          {frage.frage}
        </h1>
      </header>
      <div
        data-scroll
        className="grid min-h-0 flex-1 auto-rows-[minmax(96px,1fr)] grid-rows-3 gap-3 overflow-y-auto p-1 landscape:grid-cols-3 landscape:grid-rows-1"
      >
        {frage.antworten
          .filter((a) => !a.neutral)
          .map((a) => {
            const aktiv = gewaehlt === a.id
            return (
              <button
                key={a.id}
                type="button"
                data-testid={`antwort-${a.id}`}
                onClick={() => onWahl(a.id)}
                aria-pressed={aktiv}
                aria-disabled={gewaehlt !== null}
                className={`relative min-h-24 overflow-hidden rounded-kh-lg text-left transition-opacity duration-150 focus-visible:outline-4 focus-visible:outline-kh-paper ${aktiv ? 'ring-4 ring-kh-orange' : gewaehlt ? 'opacity-40' : ''}`}
              >
                <img
                  src={a.bild}
                  alt=""
                  draggable={false}
                  loading="eager"
                  className="absolute inset-0 size-full object-cover"
                  style={{ objectPosition: a.fokus }}
                />
                <span
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-[#0E0D0B] via-[#0E0D0B]/25 to-transparent"
                />
                <span className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 p-4">
                  <span className="text-[clamp(1.0625rem,0.95rem+0.5vw,1.375rem)] leading-snug font-semibold text-kh-paper">
                    {a.text}
                  </span>
                  {aktiv ? (
                    <Check className="size-6 shrink-0 text-kh-orange" aria-hidden />
                  ) : (
                    <ArrowRight className="size-6 shrink-0 text-kh-orange" aria-hidden />
                  )}
                </span>
              </button>
            )
          })}
      </div>
      {neutral && (
        <button
          type="button"
          data-testid="antwort-offen"
          onClick={() => onWahl(neutral.id)}
          aria-pressed={gewaehlt === neutral.id}
          aria-disabled={gewaehlt !== null}
          className="flex min-h-14 shrink-0 items-center justify-center gap-3 rounded-kh border-2 border-kh-line-strong bg-white/5 px-4 text-lg font-semibold text-kh-paper focus-visible:outline-4 focus-visible:outline-kh-paper"
        >
          <CircleHelp className="size-5" aria-hidden />
          {neutral.text}
        </button>
      )}
    </div>
  )
}
