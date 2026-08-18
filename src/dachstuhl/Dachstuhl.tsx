import { useEffect, useMemo, useRef } from 'react'
import type { RefObject } from 'react'
import type * as THREE from 'three'
import type { DachstuhlMasse } from './mass'
import type { Bauteil as BauteilDaten, Einheit } from './teileliste'
import { erzeugeGeometrien } from './geometrien'
import { Bauteil } from './Bauteil'
import { Dachflaeche } from './Dachflaeche'
import { Aufbau } from './Aufbau'
import { AUSWAHL_EMISSIV, ROHDECKE_FARBE } from './bauteil-texte'
import type { Auswahl } from './debug'
import { passt } from './debug'
import type { TapErkennung } from './useTapErkennung'

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
