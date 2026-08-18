import { useRef } from 'react'
import type { RefObject } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import type { DachstuhlMasse } from './mass'
import type { Bauteil as BauteilDaten, Einheit } from './teileliste'
import { Beleuchtung } from './Beleuchtung'
import { Kamerasteuerung } from './Kamerasteuerung'
import { Dachstuhl } from './Dachstuhl'
import { SZENE_FARBEN } from './bauteil-texte'
import type { Ansicht } from './kamera'
import { FOV, START_KAMERA } from './kamera'
import type { Auswahl } from './debug'
import type { TapErkennung } from './useTapErkennung'

/** Meldet dem DOM, dass wirklich zwei Frames gerendert wurden. */
function Bereitmeldung({ onBereit }: { onBereit: () => void }) {
  const frames = useRef(0)
  const gemeldet = useRef(false)
  useFrame(() => {
    if (gemeldet.current) return
    frames.current += 1
    if (frames.current >= 2) {
      gemeldet.current = true
      onBereit()
    }
  })
  return null
}

export function Szene({
  masse,
  einheiten,
  schritte,
  fortschrittRef,
  auswahl,
  ansicht,
  attraktor,
  kameraAbstand,
  dpr,
  dunkel,
  reduziert,
  tap,
  onTap,
  onDaneben,
  onBereit,
}: {
  masse: DachstuhlMasse
  einheiten: Einheit[]
  schritte: Map<number, number>
  fortschrittRef: RefObject<number>
  auswahl: Auswahl | null
  ansicht: Ansicht | null
  attraktor: boolean
  /** Faktor auf den Kameraabstand — s. Kamerasteuerung. */
  kameraAbstand?: number
  dpr: number | null
  dunkel: boolean
  reduziert: boolean
  tap: TapErkennung
  onTap: (teil: BauteilDaten) => void
  onDaneben: () => void
  onBereit: () => void
}) {
  const hintergrund = (dunkel ? SZENE_FARBEN.dunkel : SZENE_FARBEN.hell).hintergrund

  return (
    <Canvas
      // touchAction muss explizit gesetzt sein — R3F macht das nicht, und ohne
      // das killt iOS Safari die PointerEvents nach wenigen Pixeln Bewegung.
      style={{ touchAction: 'none', width: '100%', height: '100%' }}
      dpr={dpr ?? [1, 2]}
      shadows
      gl={{ antialias: true, alpha: false }}
      camera={{ fov: FOV, near: 0.1, far: 120, position: START_KAMERA.position }}
      onPointerMissed={(e: MouseEvent) => {
        if (tap.istTap(e)) onDaneben()
      }}
    >
      <color attach="background" args={[hintergrund]} />
      <Beleuchtung dunkel={dunkel} />
      <Kamerasteuerung ansicht={ansicht} attraktor={attraktor} abstand={kameraAbstand} />
      <Dachstuhl
        masse={masse}
        einheiten={einheiten}
        schritte={schritte}
        fortschrittRef={fortschrittRef}
        auswahl={auswahl}
        tap={tap}
        onTap={onTap}
        dunkel={dunkel}
        reduziert={reduziert}
      />
      <Bereitmeldung onBereit={onBereit} />
    </Canvas>
  )
}
