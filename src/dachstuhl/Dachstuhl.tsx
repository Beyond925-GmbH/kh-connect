import { useEffect, useMemo, useRef } from 'react'
import type { RefObject } from 'react'
import type * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import type { DachstuhlMasse } from './mass'
import type { Bauteil as BauteilDaten, Einheit } from './teileliste'
import { erzeugeGeometrien } from './geometrien'
import { Bauteil } from '@/drei/Bauteil'
import { Dachflaeche } from './Dachflaeche'
import { Aufbau } from './Aufbau'
import { AUSWAHL_EMISSIV, ROHDECKE_FARBE, SIGNAL_MARKE } from './bauteil-texte'
import { Gespann, GespannFahrt, PARKPLATZ } from '@/drei/fahrzeug'
import { LETZTE_BAUPHASE, klemme, sichtbar } from './zeitachse'
import type { Auswahl } from './debug'
import { passt } from './debug'
import type { TapErkennung } from '@/drei/useTapErkennung'

/**
 * „Dein Sparren“: die aeusserste kamerazugewandte Achse. Die iso-Kamera steht
 * bei [+x, +y, +z] — also Ortgangseite x+, Dachhaelfte z+, kein `spiegelZ`.
 * Engine-intern aus `masse` abgeleitet, nie hartkodiert und nie aus einem
 * Buehnen-Modul exportiert.
 */
function deinSparrenEinheit(m: DachstuhlMasse): string {
  return `sparrenpaar-j+${m.nHalb}`
}

/** Kulissen-Optionen — s. `Szene`. */
export interface KulisseProps {
  /** Geparktes Gespann am `PARKPLATZ`. */
  gespann: boolean
  /** Ladung folgt der Zeitachse: `ladung = 1 − t / LETZTE_BAUPHASE.bis`. */
  ladungAusFortschritt: boolean
}

/**
 * Setzt die Teileliste in Meshes um. Weltteile direkt, Dachflaechen-Teile in
 * die beiden gespiegelten Dachflaechen-Gruppen, Sparrenpaare in eine
 * gemeinsame Animationsgruppe.
 */
export function Dachstuhl({
  masse,
  einheiten,
  schritte,
  fortschrittRef,
  auswahl,
  tap,
  onTap,
  dunkel,
  reduziert,
  deinSparren = false,
  kulisse = null,
  fahrtRef = null,
}: {
  masse: DachstuhlMasse
  einheiten: Einheit[]
  schritte: Map<number, number>
  fortschrittRef: RefObject<number>
  auswahl: Auswahl | null
  tap: TapErkennung
  onTap: (teil: BauteilDaten) => void
  dunkel: boolean
  reduziert: boolean
  /** Markiert „deinen Sparren“ (Band im Dach und auf der Anhaenger-Ladung). */
  deinSparren?: boolean
  kulisse?: KulisseProps | null
  /** 0..1 Anfahrt; wenn gesetzt, faehrt das Gespann statt geparkt zu stehen. */
  fahrtRef?: RefObject<number> | null
}) {
  const geometrien = useMemo(() => erzeugeGeometrien(masse), [masse])
  useEffect(() => () => geometrien.entsorge(), [geometrien])

  const gruppen = useRef<Map<string, THREE.Group>>(new Map())
  const etwasGewaehlt = auswahl !== null

  const geometrieFuer = (t: BauteilDaten) => {
    if (t.form === 'sparren') return geometrien.sparren
    if (t.form === 'mittelpfette') return geometrien.mittelpfette
    if (t.form === 'firstpfette') return geometrien.firstpfette
    return geometrien.wuerfel
  }

  const markeEinheit = deinSparrenEinheit(masse)

  const rendere = (e: Einheit) => (
    <group
      key={e.id}
      position={e.position}
      rotation={e.rotation}
      ref={(el) => {
        if (el) gruppen.current.set(e.id, el)
        else gruppen.current.delete(e.id)
      }}
    >
      {/* Das Band fliegt in derselben Animationsgruppe mit dem Paar ein. */}
      {deinSparren && e.id === markeEinheit && <SparrenMarke masse={masse} />}
      {e.teile.map((t) => {
        const hervorgehoben = passt(auswahl, t.typ, t.auswahlIndex)
        return (
          <Bauteil
            key={t.id}
            teil={t}
            geometrie={geometrieFuer(t)}
            grundfarbe={
              t.typ === 'rohdecke' ? ROHDECKE_FARBE[dunkel ? 'dunkel' : 'hell'] : t.farbe
            }
            hervorgehoben={hervorgehoben}
            gedimmt={etwasGewaehlt && !hervorgehoben}
            tap={tap}
            onTap={onTap}
          />
        )
      })}
    </group>
  )

  const welt = einheiten.filter((e) => e.rahmen === 'welt')
  const dachPlus = einheiten.filter((e) => e.rahmen === 'dach+')
  const dachMinus = einheiten.filter((e) => e.rahmen === 'dach-')

  const firstGewaehlt = passt(auswahl, 'zone-first', null)

  return (
    <>
      {welt.map(rendere)}
      <Dachflaeche seite={1} hoehe={masse.C} neigung={masse.p.alpha}>
        {dachPlus.map(rendere)}
      </Dachflaeche>
      <Dachflaeche seite={-1} hoehe={masse.C} neigung={masse.p.alpha}>
        {dachMinus.map(rendere)}
      </Dachflaeche>

      {/* Marker fuer die beiden Kanten, die keine Bauteile sind. */}
      {firstGewaehlt && (
        <mesh position={[0, masse.yFirstOK + 0.02, 0]}>
          <boxGeometry args={[masse.LD, 0.05, 0.05]} />
          <meshBasicMaterial color={AUSWAHL_EMISSIV} />
        </mesh>
      )}
      {[1, -1].map((s) =>
        passt(auswahl, 'zone-traufe', s) ? (
          <mesh
            key={s}
            position={[0, masse.C - masse.zT + masse.dY / 2, s * (masse.zT + 0.03)]}
          >
            <boxGeometry args={[masse.LD, 0.06, 0.06]} />
            <meshBasicMaterial color={AUSWAHL_EMISSIV} />
          </mesh>
        ) : null,
      )}

      {kulisse?.gespann && (
        <Kulisse
          masse={masse}
          schritte={schritte}
          fortschrittRef={fortschrittRef}
          kulisse={kulisse}
          deinSparren={deinSparren}
          fahrtRef={fahrtRef}
          reduziert={reduziert}
        />
      )}

      <Aufbau
        einheiten={einheiten}
        schritte={schritte}
        fortschrittRef={fortschrittRef}
        gruppen={gruppen}
        reduziert={reduziert}
      />
    </>
  )
}

/**
 * Das umlaufende Band an „deinem Sparren“: sitzt im lattenfreien Streifen
 * zwischen Trauflatte und regulaerem Lattenfeld (`mass.ts`: die erste Latte
 * liegt an der Traufkante, danach kommt der Traufgang von `0,85 · lw` —
 * dieser Zwischenraum bleibt frei) und ueberragt den gesamten Dachaufbau
 * (`dachOben` = Sparren + Konter- + Traglatte) um 6 cm — nur so bricht es
 * bei voller Lattung sichtbar durch die Dachflaeche. Alles aus `masse`
 * berechnet.
 */
function SparrenMarke({ masse }: { masse: DachstuhlMasse }) {
  const a = masse.p.alpha
  // Mitte des lattenfreien Streifens, im Dachflaechen-Frame gemessen.
  const s = masse.dachZTraufe - 0.04 - (0.85 * masse.p.lw) / 2
  // Bandmitte lotrecht zur Dachflaeche: von unter der Sparren-Unterkante bis
  // ueber die Traglattenoberkante.
  const unten = -0.05
  const oben = masse.dachOben + 0.06
  const yc = (unten + oben) / 2
  return (
    <mesh
      position={[
        masse.nHalb * masse.e,
        masse.C + yc * Math.cos(a) - s * Math.sin(a),
        yc * Math.sin(a) + s * Math.cos(a),
      ]}
      rotation={[a, 0, 0]}
    >
      {/* Bewusst breiter als der Sparren selbst: im M8-Maßstab misst das
          Modell ~320 px, ein sparrenbreites Band (0,13 m) wäre dort ein
          2-px-Punkt. 0,24 m quer und 0,20 m längs füllen den lattenfreien
          Traufstreifen (0,312 m, je ±1,6 cm Luft zu den Nachbarlatten) und
          bleiben aus der iso-Ansicht als Marke lesbar. */}
      <boxGeometry args={[masse.p.q.sparren.b + 0.16, oben - unten, 0.2]} />
      <meshBasicMaterial color={SIGNAL_MARKE} />
    </mesh>
  )
}

/**
 * Geparktes (oder anfahrendes) Gespann neben der Rohdecke. Ladung und Band
 * werden je Frame aus dem Aufbau-Fortschritt abgeleitet — „Zuletzt geladen ist
 * zuerst gebraucht“ woertlich: das markierte Stueck verschwindet vom Anhaenger
 * exakt dann, wenn seine Achse im Dach sichtbar wird.
 */
function Kulisse({
  masse,
  schritte,
  fortschrittRef,
  kulisse,
  deinSparren,
  fahrtRef,
  reduziert,
}: {
  masse: DachstuhlMasse
  schritte: Map<number, number>
  fortschrittRef: RefObject<number>
  kulisse: KulisseProps
  deinSparren: boolean
  fahrtRef: RefObject<number> | null
  reduziert: boolean
}) {
  const ladungRef = useRef(1)
  const bandRef = useRef(deinSparren)

  // Phase und Staffelindex der markierten Achse (j = +nHalb ist die letzte).
  const sparrenPhase = 8
  const markeIndex = 2 * masse.nHalb
  const nSchritte = schritte.get(sparrenPhase) ?? 1

  useFrame(() => {
    const t = fortschrittRef.current
    ladungRef.current = kulisse.ladungAusFortschritt
      ? 1 - klemme(t / LETZTE_BAUPHASE.bis, 0, 1)
      : 1
    bandRef.current = deinSparren && !sichtbar(t, sparrenPhase, markeIndex, nSchritte)
  })

  if (fahrtRef) {
    return (
      <GespannFahrt
        fortschrittRef={fahrtRef}
        ladung={1}
        ladungRef={ladungRef}
        deinSparren={deinSparren}
        deinSparrenRef={bandRef}
        reduziert={reduziert}
      />
    )
  }
  return (
    <group position={PARKPLATZ.position} rotation={[0, PARKPLATZ.drehungY, 0]}>
      <Gespann
        ladung={1}
        ladungRef={ladungRef}
        deinSparren={deinSparren}
        deinSparrenRef={bandRef}
        reduziert={reduziert}
      />
    </group>
  )
}
