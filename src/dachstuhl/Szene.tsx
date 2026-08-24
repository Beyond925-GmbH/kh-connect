import { useMemo, useRef } from 'react'
import type { RefObject } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { DachstuhlMasse } from './mass'
import type { Bauteil as BauteilDaten, Einheit } from './teileliste'
import { Beleuchtung, Schattenauffrischung } from './Beleuchtung'
import type { Lichtstimmung } from './Beleuchtung'
import { Kamerasteuerung } from './Kamerasteuerung'
import { Dachstuhl } from './Dachstuhl'
import type { KulisseProps } from './Dachstuhl'
import { Planriss } from './riss'
import { SZENE_FARBEN } from './bauteil-texte'
import type { Ansicht, Sichtfeld } from './kamera'
import { FOV } from './kamera'
import type { Auswahl } from './debug'
import type { TapErkennung } from './useTapErkennung'

/**
 * Tiefenstaffelung. In der reinen Seitenansicht ueberlagern sich vordere und
 * hintere Sparrenreihe sonst zu einem Liniengitter; der leichte Dunst setzt
 * die hintere Reihe ab, ohne die freie Drehung mit einer unsichtbaren Wand
 * einzuschraenken.
 *
 * Die Reichweite haengt an der aktuellen Kameradistanz, nicht an festen
 * Metern: seit die Kamera sich ans Seitenverhaeltnis anpasst, steht sie im
 * Hochformat deutlich weiter weg — mit festem Nebel waere das Modell dort
 * flaechig eingegraut.
 */
function Tiefenstaffelung({ farbe, mitte }: { farbe: string; mitte: THREE.Vector3 }) {
  const nebel = useRef<THREE.Fog>(null)
  useFrame(({ camera }) => {
    const f = nebel.current
    if (!f) return
    const d = camera.position.distanceTo(mitte)
    f.near = Math.max(d * 0.62, 0.1)
    f.far = d * 2.1
  })
  return <fog ref={nebel} attach="fog" args={[farbe, 11, 40]} />
}

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
  sichtfeld,
  dpr,
  dunkel,
  reduziert,
  tap,
  onTap,
  onDaneben,
  onBereit,
  onKontextVerloren,
  onKontextZurueck,
  darstellung = 'koerper',
  stimmung = 'standard',
  kulisse = null,
  fahrtRef = null,
  deinSparren = false,
  steuerungGesperrt = false,
}: {
  masse: DachstuhlMasse
  einheiten: Einheit[]
  schritte: Map<number, number>
  fortschrittRef: RefObject<number>
  auswahl: Auswahl | null
  ansicht: Ansicht | null
  attraktor: boolean
  /** Verdeckte Anteile der Leinwand — s. `Sichtfeld` in `kamera.ts`. */
  sichtfeld?: Sichtfeld
  dpr: number | null
  dunkel: boolean
  reduziert: boolean
  tap: TapErkennung
  onTap: (teil: BauteilDaten) => void
  onDaneben: () => void
  onBereit: () => void
  onKontextVerloren: () => void
  onKontextZurueck: () => void
  /** 'riss' = Planansicht (M3): Kantenzeichnung statt Koerper, Tap inaktiv. */
  darstellung?: 'koerper' | 'riss'
  stimmung?: Lichtstimmung
  /** Geparktes Gespann neben der Rohdecke. */
  kulisse?: KulisseProps | null
  /** 0..1 Anfahrt; wenn gesetzt, faehrt das Gespann auf der Kurve. */
  fahrtRef?: RefObject<number> | null
  deinSparren?: boolean
  /** Sperrt OrbitControls, ohne die Ansicht zu wechseln (Fahrt). */
  steuerungGesperrt?: boolean
}) {
  const hintergrund = (dunkel ? SZENE_FARBEN.dunkel : SZENE_FARBEN.hell).hintergrund
  const mitte = useRef(new THREE.Vector3(...masse.huelle.mitte))
  mitte.current.set(...masse.huelle.mitte)

  // Kamerahuelle bei Kulisse: nur `max.z + 3.0` (Gespannbreite 2,2 + Abstand
  // 0,8), x/y unveraendert — das Gespann ist laenger als das Dach, die
  // Transporter-Front darf am Bildrand anschneiden (bewusste Inszenierung).
  const mitGespann = kulisse !== null || fahrtRef !== null
  const huelle = useMemo(() => {
    if (!mitGespann) return masse.huelle
    const h = masse.huelle
    return {
      min: h.min,
      max: [h.max[0], h.max[1], h.max[2] + 3.0] as [number, number, number],
      mitte: h.mitte,
    }
  }, [masse.huelle, mitGespann])

  return (
    <Canvas
      // touchAction muss explizit gesetzt sein — R3F macht das nicht, und ohne
      // das killt iOS Safari die PointerEvents nach wenigen Pixeln Bewegung.
      style={{ touchAction: 'none', width: '100%', height: '100%' }}
      // Perf 5.4: DPR-Deckel bei 1,75 — auf dem 2x-iPad ist der Unterschied
      // unsichtbar, die Fuellrate sinkt um fast die Haelfte.
      dpr={dpr ?? [1, 1.75]}
      // 'percentage' = PCFShadowMap. Der Default 'soft' (PCFSoftShadowMap) ist
      // in three r185 deprecated und faellt intern ohnehin auf PCF zurueck —
      // die Weichheit kommt hier ueber die 2048er Shadow-Map.
      shadows="percentage"
      gl={{ antialias: true, alpha: false }}
      camera={{ fov: FOV, near: 0.1, far: 160, position: [14, 7, 13] }}
      // Der WebGL-Kontext geht auf dem iPad verloren, wenn iOS Speicher
      // zurueckfordert — nach stundenlangem Standbetrieb ist das der
      // wahrscheinlichste Ausfall. Ohne `preventDefault` stellt der Browser
      // ihn gar nicht erst wieder her, und zurueck bleibt eine schwarze
      // Flaeche, die von allein nicht wiederkommt.
      onCreated={({ gl }) => {
        // Perf 5.2: Schattenkarte einfrieren; `Schattenauffrischung` fordert
        // Updates nur an, wenn sich das Modell wirklich aendert.
        gl.shadowMap.autoUpdate = false
        const leinwand = gl.domElement
        leinwand.addEventListener('webglcontextlost', (e) => {
          e.preventDefault()
          onKontextVerloren()
        })
        leinwand.addEventListener('webglcontextrestored', () => onKontextZurueck())
      }}
      onPointerMissed={(e: MouseEvent) => {
        if (tap.istTap(e)) onDaneben()
      }}
    >
      <color attach="background" args={[hintergrund]} />
      <Tiefenstaffelung farbe={hintergrund} mitte={mitte.current} />
      <Beleuchtung dunkel={dunkel} stimmung={stimmung} />
      <Schattenauffrischung fortschrittRef={fortschrittRef} extraRef={fahrtRef} />
      <Kamerasteuerung
        ansicht={ansicht}
        huelle={huelle}
        attraktor={attraktor}
        sichtfeld={sichtfeld}
        gesperrt={steuerungGesperrt}
      />
      {darstellung === 'riss' ? (
        <Planriss masse={masse} einheiten={einheiten} />
      ) : (
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
          deinSparren={deinSparren}
          kulisse={kulisse}
          fahrtRef={fahrtRef}
        />
      )}
      <Bereitmeldung onBereit={onBereit} />
    </Canvas>
  )
}
