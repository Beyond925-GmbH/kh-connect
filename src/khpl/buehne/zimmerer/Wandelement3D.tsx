import { useMemo, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { Canvas } from '@react-three/fiber'
import { SZENE_FARBEN } from '@/dachstuhl/bauteil-texte'
import { FOV } from '@/drei/kamera'
import { useTapErkennung } from '@/drei/useTapErkennung'
import { useSichtfeld } from '@/khpl/shell/SichtfeldKontext'
import { Hallenlicht } from '@/khpl/buehne/Hallenlicht'
import {
  AmHaken,
  Baustelle,
  Bereitmeldung,
  FlachAufDemTisch,
  Halle,
  Haus,
  huelle,
  Kamerafahrt,
  Licht,
  Verladung,
  WANDACHSE_Z,
  Zielgeist,
} from './kulissen'
import type { Blickfang, HakenSteuerung, ZugEingabe } from './kulissen'
import {
  FensterElement,
  Holzstapel,
  Sandwichaufbau,
  Staenderwerk,
  STANDARD_AUSSCHNITT,
  ELEMENT_FLACH_Y,
  H,
} from './element'

/**
 * Das Wandelement als Bühne — **ein Objekt, sieben Zustände**
 * (khpl-tag-zimmerer.md 2 und 7).
 *
 * Das ist der längste Faden der vier Tage und der Grund, warum dieser Tag ohne
 * einen zweiten Dachstuhl auskommt: dasselbe Element erscheint als Stapel
 * nummerierter Hölzer, als flach liegendes Ständerwerk, als Sandwich, mit
 * *deinem* Fensterausschnitt, aufgerichtet auf dem Anhänger, am Haken und
 * schließlich als Westwand eines Hauses.
 *
 * Aufbau nach dem Vorbild von `Zuschnitt3D`: eigener Canvas, feste Kameras per
 * `passeEin`, `Hallenlicht`-Schein über der Leinwand, Kontextverlust-Schutz.
 * Die Geometrie ist bewusst klein — Rahmen, Beplankung, Fensteröffnung — und
 * lebt in `element.tsx`, die Umgebung in `kulissen.tsx`; beides läuft nur in
 * diesem Lazy-Chunk.
 *
 * **Das Bewegungsgefühl ist Masse** (khpl-tage.md 2): die Kamera fährt mit
 * trägem Nachlauf statt zu schnippen, die Last in C6 pendelt über einen
 * Frame-Loop mit Dämpfung (`PENDEL_DAEMPFUNG`), nichts rastet hart.
 *
 * ---
 *
 * ## Lazy-Grenze
 *
 * Dieses Modul zieht `three` nach. Es darf deshalb **nur** über
 * `lazy(() => import('@/khpl/buehne/zimmerer/Wandelement3D'))` eingebunden
 * werden, nie statisch — sonst landet `three` im Erststart-Bündel und reißt die
 * 1,5-MB-Grenze (khpl-tage.md 3). Als Ladezustand dient
 * `Dachstuhl3DFallback` mit eigenem `text`; er ist three-frei und gewerkeneutral.
 *
 * **Keine Wert-Exporte neben der Default-Komponente.** Laufzeitkonstanten
 * stehen in `kanon.ts`, Typen exportiert diese Datei nur als `type`.
 *
 * ## Wiederverwendet aus `src/drei/`
 *
 * `kamera.ts` (`passeEin`, `FOV`), `useTapErkennung`, `fahrzeug.tsx`
 * (`Gespann`, C5) — nur additiv änderbar (khpl-tage.md §6.1 V7).
 * `src/dachstuhl/**` bleibt unangetastet.
 */

/**
 * Die sieben Zustände des Fadenobjekts, je einer je Step.
 *
 * Bewusst benannt und nicht als Zahl auf einer Zeitachse: khpl-tag-zimmerer.md
 * 7 verlangt, dass der Zustand „als benannter Zustand ins Modell“ gehört und
 * nicht als Zahl in die Steps — dieselbe Regel, die beim Dachdecker das
 * Phasenlabel statt einer Zeitzahl durchsetzt.
 */
export type Elementzustand =
  /** C1 — ein Stapel nummerierter Hölzer auf dem Abbundtisch. */
  | 'stapel'
  /** C2 — das Ständerwerk, flach auf dem Tisch. */
  | 'staenderwerk'
  /** C3 — gedämmt und beplankt, ein Sandwich. */
  | 'schichten'
  /** C4 — mit deinem Fensterausschnitt. Ab hier gehört es dem Besucher. */
  | 'fenster'
  /** C5 — aufgerichtet auf dem Anhänger. */
  | 'verladen'
  /** C6 — am Haken, schwebend. */
  | 'haken'
  /** C7 — die Westwand eines Hauses. */
  | 'haus'

/**
 * Die Kamera. **Die Umschaltung ist der Tag** (khpl-tag-zimmerer.md 7): bis C5
 * liegt alles flach unter einer Draufsicht, ab C6 steht die Kamera am Boden und
 * schaut hinauf. Ein einziger Screen dreht den Tag um 90°.
 *
 * Ohne Angabe leitet die Bühne den Blick aus dem Zustand ab — `stapel` bis
 * `verladen` sind Draufsicht, `haken` und `haus` Untersicht.
 */
export type Blick = 'draufsicht' | 'untersicht'

/**
 * Die Lichtstimmung. Beide innerhalb des bestehenden Dunkelzweigs von
 * `SZENE_FARBEN` — **kein neuer Tokensatz** (khpl-tage.md 3).
 *
 * - `halle` — kaltes Oberlicht, tiefe Schatten, Staub in der Luft.
 * - `nachmittag` — warm und weicher. Nicht Abendlicht: dieser Tag endet um
 *   vier, weil vorgefertigt gebaut wird. Zwei Feierabende dürfen nicht
 *   dasselbe Licht haben.
 */
export type Elementlicht = 'halle' | 'nachmittag'

/** Der Fensterausschnitt, den der Besucher in C4 aufzieht. Alle Maße in Millimetern. */
export interface Fensterausschnitt {
  /** Abstand der linken Ausschnittkante von der linken Elementkante. */
  xMm: number
  /** Höhe der Ausschnittunterkante über Rohboden — das zweite Planmaß. */
  yMm: number
  breiteMm: number
  hoeheMm: number
}

/**
 * Wie das Element am Haken hängt — die Abfrage in C6, Beat 1.
 *
 * Zwei Achsen, zwei Entscheidungen, beide aus dem Kopf. Richtig ist
 * `{ aussenseite: 'holzfaser', oben: 'raehm' }`: nach außen kommt die
 * diffusionsoffene Holzfaserplatte, nicht die glatte, fertig aussehende
 * Innenbeplankung — und oben ist das Rähm, weil dort die Decke aufliegt.
 */
export interface Elementlage {
  /** Welche Seite zeigt nach außen. Die verlockende Falsche ist `beplankung`. */
  aussenseite: 'beplankung' | 'holzfaser'
  /** Welche Kante zeigt nach oben. Wer sich in C4 das Fenster gemerkt hat, weiß es. */
  oben: 'raehm' | 'schwelle'
}

export interface Wandelement3DProps {
  /** Welcher der sieben Zustände gezeigt wird. Das ist die Hauptachse. */
  zustand: Elementzustand
  /** Kamera. Ohne Angabe aus `zustand` abgeleitet. */
  blick?: Blick
  /** Licht. Ohne Angabe: `halle` bis `verladen`, danach `nachmittag`. */
  licht?: Elementlicht

  // -- C1 — Suchen, nicht Sortieren ----------------------------------------
  /**
   * Die Nummer, die die Stückliste verlangt. Die Bühne legt zwölf nummerierte
   * Hölzer aus, zwei davon fast gleich — sie unterscheiden sich nicht in der
   * Länge, sondern in der Ausklinkung.
   */
  gesuchteNummer?: number
  /** Ein Holz wurde angetippt. Der Step entscheidet, was das heißt. */
  onHolz?: (nummer: number) => void

  // -- C2 — Schätzen → Auflösen --------------------------------------------
  /** Reglerwert in Zentimetern, live. Der zweite Ständer folgt ihm. */
  achsmassCm?: number
  /**
   * Auflösung läuft: die Bauplatte legt sich als halbtransparente Fläche über
   * das Ständerwerk, die Stoßkante rastet sichtbar auf einem Ständer ein, die
   * übrigen Ständer fliegen ins Raster. **Keine Dämmmatte** — das Raster kommt
   * vom Plattenformat (belege/zimmerer.md 1).
   */
  aufgeloest?: boolean

  // -- C3 — die geführte Hälfte des Lernpaars ------------------------------
  /**
   * Wie viele der fünf Schichten schon liegen, von innen nach außen. Der Blick
   * wandert dabei leicht in die Schräge, damit die Dicke sichtbar wird — eine
   * Wand von genau oben ist ein Rechteck.
   */
  schichten?: number

  // -- C4 — der Fehler mit Preis -------------------------------------------
  /** Der aufgezogene Ausschnitt. `null` = noch nichts gezogen. */
  ausschnitt?: Fensterausschnitt | null
  /** Während des Ziehens, jeden Frame. */
  onAusschnitt?: (a: Fensterausschnitt) => void
  /**
   * Der Blick nach oben, sobald der Rahmen sitzt: das Element kippt für
   * `AUFRICHTEN_DAUER` in die Senkrechte und zeigt, wo das Fenster ist. Nicht
   * interaktiv. Das ist die halbe Miete für die Abfrage in C6.
   */
  aufrichtenZeigen?: boolean
  /** Feuert, wenn das Aufrichten durch ist. */
  onAufrichtenEnde?: () => void

  // -- C5 — die Zäsur -------------------------------------------------------
  /**
   * Das Gespann fährt weg, der Blick bleibt in der leeren Halle zurück.
   * `prefers-reduced-motion`: es ist sofort fort.
   */
  abfahrt?: boolean
  /** Feuert genau einmal, wenn das Gespann aus dem Bild ist. */
  onAbfahrtEnde?: () => void

  // -- C6 — der Signaturscreen ---------------------------------------------
  /**
   * Beat 1. `null` = das Element dreht sich langsam und wartet darauf,
   * angehalten zu werden.
   */
  lage?: Elementlage | null
  /** Der Besucher hat es angehalten. Richtig oder falsch entscheidet der Step. */
  onLage?: (lage: Elementlage) => void
  /**
   * Beat 2 — Einweisen. Das Element schwebt über die Schwelle und **pendelt**:
   * zu schnell gezogen, und es schwingt über das Ziel hinaus.
   */
  einweisen?: boolean
  /** Feuert, wenn das Element abgesetzt ist. */
  onAbgesetzt?: () => void

  // -- gemeinsam ------------------------------------------------------------
  /**
   * Markiert *dein Element* — ab C4 trägt es den Ausschnitt des Besuchers und
   * ist in C7 als Westwand wiederzuerkennen.
   */
  deinElement?: boolean
  /** Die Szene steht und ist gezeichnet. Für Testhaken und Ladezustände. */
  onBereit?: () => void
}

// ---------------------------------------------------------------------------
// Kamera: ein Blick je Zustand. Draufsicht bis C5, Untersicht ab C6 —
// die Drehung dazwischen fährt `Kamerafahrt` mit Masse.
// ---------------------------------------------------------------------------

function waehleBlickfang(
  zustand: Elementzustand,
  blick: Blick,
  stehend: boolean,
): Blickfang {
  switch (zustand) {
    case 'stapel':
      return {
        richtung: blick === 'untersicht' ? [6.5, -2.6, 9.5] : [0.4, 13, 2.4],
        huelle: huelle([-4.7, 0, -2.1], [4.7, 1.8, 2.1]),
      }
    case 'staenderwerk':
      return {
        richtung: blick === 'untersicht' ? [6.5, -2.6, 9.5] : [0.01, 13, 2.0],
        huelle: huelle([-4.5, 0, -3.3], [4.5, 2.0, 0.9]),
      }
    case 'schichten':
      return {
        richtung: blick === 'untersicht' ? [6.5, -2.6, 9.5] : [3.4, 9.5, 5.2],
        huelle: huelle([-4.5, 0, -3.3], [4.5, 2.3, 1.2]),
      }
    case 'fenster':
      return stehend
        ? {
            richtung: [1.2, 2.6, 10],
            huelle: huelle([-4.4, 0, -1.0], [4.4, ELEMENT_FLACH_Y + H + 0.3, 0.8]),
          }
        : {
            richtung: blick === 'untersicht' ? [6.5, -2.6, 9.5] : [0.01, 13, 1.7],
            huelle: huelle([-4.4, 0, -3.3], [4.4, 1.9, 0.6]),
          }
    case 'verladen':
      return {
        richtung: [9, 3.6, 10],
        huelle: huelle([-7.6, 0, -2.0], [7.6, 4.9, 5.2]),
      }
    case 'haken':
      return {
        richtung: blick === 'draufsicht' ? [0.4, 13, 2.0] : [6.5, -2.6, 9.5],
        huelle: huelle([-4.8, 0, -2.5], [4.8, 8.6, WANDACHSE_Z + 2.4]),
      }
    case 'haus':
      return {
        richtung: blick === 'draufsicht' ? [0.4, 13, 2.0] : [6.5, -1.6, 10.5],
        huelle: huelle([-5, 0, WANDACHSE_Z - 7], [5, 4.1, WANDACHSE_Z + 2.8]),
      }
  }
}

export default function Wandelement3D(props: Wandelement3DProps) {
  const { zustand, blick, licht } = props
  const gezeigterBlick =
    blick ?? (zustand === 'haken' || zustand === 'haus' ? 'untersicht' : 'draufsicht')
  const gezeigtesLicht =
    licht ??
    (zustand === 'haken' || zustand === 'haus' || zustand === 'verladen'
      ? 'nachmittag'
      : 'halle')

  const sichtfeld = useSichtfeld('roh')
  const reduziert = useMemo(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )
  const [kontextWeg, setKontextWeg] = useState(false)
  const [neustart, setNeustart] = useState(0)

  // C6: Taps hält der Wrapper fest (Beat 1), Ziehen füttert die Pendelphysik
  // (Beat 2) — beides über Refs, kein React-State je Frame.
  const tap = useTapErkennung()
  const steuerung = useRef<HakenSteuerung | null>(null)
  const eingabe = useRef<ZugEingabe>({ dx: 0, dy: 0 })
  const zug = useRef<{ id: number; x: number; y: number } | null>(null)
  const einweisenAktiv = zustand === 'haken' && props.einweisen === true

  const zeigerAb = (e: ReactPointerEvent<HTMLDivElement>) => {
    tap.merken(e)
    if (einweisenAktiv && e.isPrimary) {
      zug.current = { id: e.pointerId, x: e.clientX, y: e.clientY }
      e.currentTarget.setPointerCapture(e.pointerId)
    }
  }
  const zeigerZieht = (e: ReactPointerEvent<HTMLDivElement>) => {
    const z = zug.current
    if (!z || z.id !== e.pointerId) return
    eingabe.current.dx += e.clientX - z.x
    eingabe.current.dy += e.clientY - z.y
    z.x = e.clientX
    z.y = e.clientY
  }
  const zeigerAuf = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (zug.current?.id === e.pointerId) zug.current = null
    if (zustand === 'haken' && !einweisenAktiv && props.lage == null && tap.istTap(e)) {
      steuerung.current?.halteAn()
    }
  }

  const stehend = zustand === 'fenster' && props.aufrichtenZeigen === true
  const fang = waehleBlickfang(zustand, gezeigterBlick, stehend)
  const hintergrund = SZENE_FARBEN.dunkel.hintergrund
  // Ab C5 trägt das Element den Ausschnitt sichtbar weiter, auch wenn der
  // Step keinen übergibt — und es ist dann per Default *deins*.
  const spaeterAusschnitt = props.ausschnitt ?? STANDARD_AUSSCHNITT
  const spaeteMarke =
    props.deinElement ??
    (zustand === 'verladen' || zustand === 'haken' || zustand === 'haus')

  return (
    <div
      className="relative size-full touch-none select-none"
      data-buehne="wandelement"
      data-zustand={zustand}
      data-blick={gezeigterBlick}
      data-licht={gezeigtesLicht}
      data-wisch="aus"
      onPointerDown={zeigerAb}
      onPointerMove={zeigerZieht}
      onPointerUp={zeigerAuf}
      onPointerCancel={zeigerAuf}
    >
      <Canvas
        key={neustart}
        style={{ touchAction: 'none', width: '100%', height: '100%' }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: false }}
        camera={{ fov: FOV, near: 0.1, far: 120, position: [8, 9, 8] }}
        onCreated={({ gl }) => {
          const leinwand = gl.domElement
          leinwand.addEventListener('webglcontextlost', (e) => {
            e.preventDefault()
            setKontextWeg(true)
          })
          leinwand.addEventListener('webglcontextrestored', () => {
            setKontextWeg(false)
            setNeustart((n) => n + 1)
          })
        }}
      >
        <color attach="background" args={[hintergrund]} />
        <fog attach="fog" args={[hintergrund, 10, 40]} />
        <Licht licht={gezeigtesLicht} />
        <Kamerafahrt blickfang={fang} sichtfeld={sichtfeld} reduziert={reduziert} />
        <Bereitmeldung onBereit={props.onBereit} />

        {zustand === 'stapel' && (
          <group>
            <Halle />
            <Holzstapel gesuchteNummer={props.gesuchteNummer} onHolz={props.onHolz} />
          </group>
        )}

        {zustand === 'staenderwerk' && (
          <group>
            <Halle mitAuflage />
            <FlachAufDemTisch>
              <Staenderwerk
                achsmassCm={props.achsmassCm}
                aufgeloest={props.aufgeloest}
                reduziert={reduziert}
              />
            </FlachAufDemTisch>
          </group>
        )}

        {zustand === 'schichten' && (
          <group>
            <Halle mitAuflage />
            <FlachAufDemTisch>
              <Sandwichaufbau schichten={props.schichten} reduziert={reduziert} />
            </FlachAufDemTisch>
          </group>
        )}

        {zustand === 'fenster' && (
          <group>
            <Halle mitAuflage />
            <FensterElement
              ausschnitt={props.ausschnitt}
              onAusschnitt={props.onAusschnitt}
              aufrichtenZeigen={props.aufrichtenZeigen}
              onAufrichtenEnde={props.onAufrichtenEnde}
              marke={props.deinElement ?? false}
              reduziert={reduziert}
            />
          </group>
        )}

        {zustand === 'verladen' && (
          <group>
            <Halle />
            <group position={[0, 0, 3.0]}>
              <Verladung
                ausschnitt={spaeterAusschnitt}
                marke={spaeteMarke}
                abfahrt={props.abfahrt}
                onAbfahrtEnde={props.onAbfahrtEnde}
                reduziert={reduziert}
              />
            </group>
          </group>
        )}

        {zustand === 'haken' && (
          <group>
            <Baustelle zielMarke />
            {einweisenAktiv && <Zielgeist />}
            <AmHaken
              lage={props.lage}
              onLage={props.onLage}
              einweisen={props.einweisen}
              onAbgesetzt={props.onAbgesetzt}
              ausschnitt={spaeterAusschnitt}
              marke={spaeteMarke}
              steuerung={steuerung}
              eingabe={eingabe}
              reduziert={reduziert}
            />
          </group>
        )}

        {zustand === 'haus' && (
          <group>
            <Baustelle />
            <Haus ausschnitt={spaeterAusschnitt} marke={spaeteMarke} />
          </group>
        )}
      </Canvas>

      {/* Der Schein, in dem das Modell steht — sonst ist die Leinwand ein
          einfarbiges Rechteck (s. `Hallenlicht`). */}
      <Hallenlicht sichtfeld={sichtfeld} />

      {kontextWeg && (
        <div className="absolute inset-0 z-30 grid place-items-center bg-kh-ink/90">
          <p className="max-w-xs px-6 text-center text-[15px] text-kh-mute">
            Die 3D-Ansicht wird neu aufgebaut. Einen Moment.
          </p>
        </div>
      )}
    </div>
  )
}
