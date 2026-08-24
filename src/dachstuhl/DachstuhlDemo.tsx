import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { STANDARD_PARAMETER } from './parameter'
import { berechneMasse } from './mass'
import {
  bildeEinheiten,
  erzeugeTeile,
  pruefeTeileliste,
  schritteJePhase,
} from './teileliste'
import type { Bauteil } from './teileliste'
import { leseDebug } from './debug'
import type { Auswahl } from './debug'
import type { Ansicht } from './kamera'
import { phaseAt, pruefeEndbild } from './zeitachse'
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

  // Abnahme-Assertionen. Die Teilelisten-Pruefung deckt genau den Fall ab, der
  // frueher als TypeError aus `veredle` kam: ein Bauteil ohne Stammdatensatz,
  // also ohne Begriff und ohne antippbar-Flag — und damit ohne das, worauf
  // B3.2 aufbaut. Die Endbild-Pruefung deckt Anfang und Ende der Animation ab.
  useEffect(() => {
    if (!import.meta.env.DEV) return
    const listenMaengel = pruefeTeileliste(teile)
    if (listenMaengel.length > 0)
      console.error('[dachstuhl] Teileliste unvollstaendig:\n' + listenMaengel.join('\n'))
    const maengel = pruefeEndbild(teile, schritte)
    if (maengel.length > 0)
      console.warn('[dachstuhl] Endbild unvollstaendig:\n' + maengel.join('\n'))
  }, [teile, schritte])

  // Abnahme-Flags des 3D-Remodels, bewusst nur hier und nicht in `debug.ts`:
  // ?marke=1 zeigt „deinen Sparren“, ?kulisse=1 das geparkte Gespann,
  // ?riss=1 die Planansicht (M3).
  const extras = useMemo(() => {
    const p = new URLSearchParams(window.location.search)
    return {
      deinSparren: p.has('marke'),
      kulisse: p.has('kulisse'),
      riss: p.has('riss'),
    }
  }, [])

  const [auswahl, setAuswahl] = useState<Auswahl | null>(debug.teil)
  const [ansicht, setAnsicht] = useState<Ansicht | null>(debug.ansicht)
  const [pausiert, setPausiert] = useState(false)
  // Zaehler statt Wahrheitswert: er dient als `key` der Szene und baut sie
  // nach einem Kontextverlust wirklich neu auf, statt nur weiterzulaufen.
  const [neustart, setNeustart] = useState(0)
  const [kontextWeg, setKontextWeg] = useState(false)
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
        key={neustart}
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
        deinSparren={extras.deinSparren}
        kulisse={extras.kulisse ? { gespann: true, ladungAusFortschritt: true } : null}
        darstellung={extras.riss ? 'riss' : 'koerper'}
        tap={tap}
        onTap={onTap}
        onDaneben={() => setAuswahl(null)}
        onBereit={onBereit}
        onKontextVerloren={() => setKontextWeg(true)}
        onKontextZurueck={() => {
          setKontextWeg(false)
          setNeustart((n) => n + 1)
        }}
      />

      {kontextWeg && (
        <div className="absolute inset-0 z-30 grid place-items-center bg-kh-page/90">
          <div className="rounded-kh bg-kh-surface px-6 py-5 text-center">
            <p className="kh-h3 text-kh-orange">3D-Ansicht wird neu geladen</p>
            <p className="mt-2 max-w-xs text-sm text-kh-grey">
              Die Grafikausgabe des Geräts wurde zurückgesetzt. Das Modell baut sich
              gleich von selbst wieder auf.
            </p>
            <button
              type="button"
              className="mt-4 rounded-kh bg-kh-orange px-4 py-2 text-sm text-kh-page"
              onClick={() => window.location.reload()}
            >
              Seite neu laden
            </button>
          </div>
        </div>
      )}

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
