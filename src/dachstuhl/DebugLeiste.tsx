import type { RefObject } from 'react'
import { Pause, Play, RotateCcw } from 'lucide-react'
import type { Ansicht } from '@/drei/kamera'
import { ANSICHTEN, KAMERA } from '@/drei/kamera'
import { ThemeToggle } from '@/components/theme-toggle'

/**
 * Bedienleiste der Demo. Der Regler schreibt direkt in den
 * Fortschritts-Ref — kein React-State pro Frame.
 */
export function DebugLeiste({
  ansicht,
  onAnsicht,
  pausiert,
  onPausiert,
  onSpringe,
  reglerRef,
  phase,
}: {
  ansicht: Ansicht | null
  onAnsicht: (a: Ansicht | null) => void
  pausiert: boolean
  onPausiert: (p: boolean) => void
  onSpringe: (t: number) => void
  reglerRef: RefObject<HTMLInputElement | null>
  phase: string
}) {
  return (
    <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-20 border-t border-kh-rule bg-kh-surface/95 px-4 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-3">
        <div className="flex flex-wrap items-center gap-1">
          <Knopf aktiv={ansicht === null} onClick={() => onAnsicht(null)}>
            frei
          </Knopf>
          {ANSICHTEN.map((a) => (
            <Knopf
              key={a}
              aktiv={ansicht === a}
              onClick={() => onAnsicht(a)}
              titel={KAMERA[a].beschreibung}
            >
              {a}
            </Knopf>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <Knopf
            aktiv={false}
            onClick={() => {
              onSpringe(0)
              onPausiert(false)
            }}
            titel="Zurückspulen und abspielen"
          >
            <RotateCcw size={16} strokeWidth={1.5} />
          </Knopf>
          <Knopf
            aktiv={false}
            onClick={() => onPausiert(!pausiert)}
            titel={pausiert ? 'Abspielen' : 'Pause'}
          >
            {pausiert ? (
              <Play size={16} strokeWidth={1.5} />
            ) : (
              <Pause size={16} strokeWidth={1.5} />
            )}
          </Knopf>
        </div>

        <label className="flex min-w-[16rem] flex-1 items-center gap-3">
          <span className="sr-only">Aufbau-Fortschritt</span>
          <input
            ref={reglerRef}
            type="range"
            min={0}
            max={1}
            step={0.001}
            defaultValue={0}
            onPointerDown={() => onPausiert(true)}
            onChange={(e) => onSpringe(Number(e.target.value))}
            className="h-1 w-full flex-1 cursor-pointer appearance-none rounded-full bg-kh-band accent-kh-orange"
          />
        </label>

        <span className="min-w-[10rem] text-sm text-kh-grey">{phase}</span>
        <ThemeToggle />
      </div>
    </div>
  )
}

function Knopf({
  aktiv,
  onClick,
  titel,
  children,
}: {
  aktiv: boolean
  onClick: () => void
  titel?: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={titel}
      className={[
        'grid h-[35px] min-w-[35px] place-items-center rounded-kh border px-3 text-sm transition-colors',
        aktiv
          ? 'border-kh-orange bg-kh-orange text-kh-page'
          : 'border-kh-rule text-kh-grey hover:border-kh-orange hover:text-kh-orange',
      ].join(' ')}
    >
      {children}
    </button>
  )
}
