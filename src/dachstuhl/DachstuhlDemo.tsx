import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { STANDARD_PARAMETER } from './parameter'
import { berechneMasse } from './mass'
import { bildeEinheiten, erzeugeTeile, schritteJePhase } from './teileliste'
import type { Bauteil } from './teileliste'
import { leseDebug } from './debug'
import type { Auswahl } from './debug'
import type { Ansicht } from './kamera'
import { phaseAt } from './zeitachse'
import { useAufbau } from './useAufbau'
import { useTapErkennung } from './useTapErkennung'
import { Szene } from './Szene'
import { BauteilKarte } from './BauteilKarte'
import { DebugLeiste } from './DebugLeiste'
import { setTheme, useTheme } from '@/lib/theme'

/**
 * Beweis-Prototyp des parametrischen Dachstuhls (B3.2 + M5).
 * Erreichbar unter ?demo=dachstuhl, noch ohne Einbindung in den Step-Flow.
 */
export default function DachstuhlDemo() {
  const debug = useMemo(() => leseDebug(window.location.search), [])
  const { resolved } = useTheme()
  const dunkel = resolved === 'dark'

  useEffect(() => {
    if (debug.theme) setTheme(debug.theme === 'dunkel' ? 'dark' : 'light')
  }, [debug.theme])

  const reduziert = useMemo(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )

  const parameter = useMemo(
    () =>
      debug.lattungAnteil === null
        ? STANDARD_PARAMETER
        : { ...STANDARD_PARAMETER, lattungAnteil: debug.lattungAnteil },
    [debug.lattungAnteil],
  )
  const masse = useMemo(() => berechneMasse(parameter), [parameter])
  const teile = useMemo(() => erzeugeTeile(masse), [masse])
  const einheiten = useMemo(() => bildeEinheiten(teile), [teile])
  const schritte = useMemo(() => schritteJePhase(teile), [teile])

  const [auswahl, setAuswahl] = useState<Auswahl | null>(debug.teil)
  const [ansicht, setAnsicht] = useState<Ansicht | null>(debug.ansicht)
  const [pausiert, setPausiert] = useState(false)
  const [phase, setPhase] = useState(() => phaseAt(debug.t ?? 0).label)

  const regler = useRef<HTMLInputElement>(null)
  const letztePhase = useRef(phase)

  const onTick = useCallback((t: number) => {
    const feld = regler.current
    if (feld && document.activeElement !== feld) feld.value = String(t)
    const label = phaseAt(t).label
    if (label !== letztePhase.current) {
      letztePhase.current = label
      setPhase(label)
    }
  }, [])

  const { fortschritt, springe } = useAufbau({ fest: debug.t, pausiert, onTick })

  const tap = useTapErkennung()

  const onTap = useCallback((teil: Bauteil) => {
    setAuswahl(teil.antippbar ? { typ: teil.typ, index: teil.auswahlIndex } : null)
  }, [])

  const onBereit = useCallback(() => {
    document.title = `Dachstuhl · ${debug.ansicht ?? 'frei'} · t=${(debug.t ?? 0).toFixed(3)}`
    document.documentElement.dataset.bereit = 'true'
  }, [debug.ansicht, debug.t])

  useEffect(() => {
    return () => {
      delete document.documentElement.dataset.bereit
    }
  }, [])

  return (
    <div
      className="fixed inset-0 overflow-hidden bg-kh-page"
      onPointerDown={(e) => tap.merken(e)}
    >
      <Szene
        masse={masse}
        einheiten={einheiten}
        schritte={schritte}
        fortschrittRef={fortschritt}
        auswahl={auswahl}
        ansicht={ansicht}
        attraktor={!debug.aktiv}
        dpr={debug.dpr}
        dunkel={dunkel}
        reduziert={reduziert}
        tap={tap}
        onTap={onTap}
        onDaneben={() => setAuswahl(null)}
        onBereit={onBereit}
      />

      <div className="pointer-events-none absolute top-4 left-4 z-20 max-w-xs">
        <p className="text-sm tracking-wide text-kh-grey uppercase">
          Dachstuhl · Beweis-Prototyp
        </p>
        <p className="kh-h3 text-kh-orange">{phase}</p>
        <p className="mt-1 text-sm text-kh-grey/80">
          {masse.nPaare} Sparrenpaare · Achsmaß {(masse.e * 100).toFixed(1)} cm ·
          Firsthöhe {masse.yFirstOK.toFixed(2)} m · {masse.aDachGrundriss.toFixed(0)} m²
          über dem Grundriss
        </p>
      </div>

      <BauteilKarte auswahl={auswahl} onSchliessen={() => setAuswahl(null)} />

      {!debug.aktiv && (
        <DebugLeiste
          ansicht={ansicht}
          onAnsicht={setAnsicht}
          pausiert={pausiert}
          onPausiert={setPausiert}
          onSpringe={(t) => {
            setPausiert(true)
            springe(t)
          }}
          reglerRef={regler}
          phase={phase}
        />
      )}

      {debug.perf && <Fpsanzeige />}
    </div>
  )
}

function Fpsanzeige() {
  const [fps, setFps] = useState(0)
  useEffect(() => {
    let id = 0
    let frames = 0
    let letzte = performance.now()
    const schritt = () => {
      frames += 1
      const jetzt = performance.now()
      if (jetzt - letzte >= 500) {
        setFps(Math.round((frames * 1000) / (jetzt - letzte)))
        frames = 0
        letzte = jetzt
      }
      id = requestAnimationFrame(schritt)
    }
    id = requestAnimationFrame(schritt)
    return () => cancelAnimationFrame(id)
  }, [])
  return (
    <div className="absolute top-4 right-4 z-20 rounded-kh bg-kh-surface px-3 py-1 text-sm text-kh-grey tabular-nums">
      {fps} fps
    </div>
  )
}
