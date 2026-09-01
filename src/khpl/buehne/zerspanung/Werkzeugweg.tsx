import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Bild } from './Bild'
import {
  PROGRAMM_SAETZE,
  STAHL,
  TEIL,
  UEBUNGS_SAETZE,
  WARM,
  type Kapitel,
  type NcSatz,
  type WegZustand,
} from './kanon'

/**
 * Z3 — **die Bühne, auf der Code zu Bewegung wird.** Futter links, Teil
 * gespannt, das Werkzeug wartet — und auf „Abspielen“ fährt es die Sätze des
 * Kapitels **von selbst nacheinander** ab: Eilgang gestrichelt und kalt,
 * Vorschub warm, und wo wirklich geschnitten wird, verschwindet das
 * Material sichtbar unter der Schneide.
 *
 * **Warum die Fahrt am Stück läuft und nicht mehr Satz für Satz auf Tipp:**
 * die Vorfassung ließ den Besucher jeden Satz einzeln antippen und fragte
 * danach ab — das war zu schnell und zu viel auf einmal.
 * Jetzt entscheidet der Besucher nur noch *wann* gefahren wird und wie oft;
 * die Reihenfolge ist Sache des Programms. Genau das ist die Lektion: eine
 * Liste Befehle, einer nach dem anderen.
 *
 * **Wie die Fahrt technisch läuft:** `schritt` zählt den Satz, der gerade
 * fährt. Das Werkzeug ist pro Satz eine eigene Fahrt (Schlüssel am
 * `schritt`), `onAnimationComplete` schaltet weiter — so behält jeder Satz
 * seine eigene Dauer und sein eigenes Easing (Eilgang federt aus, Schnitt
 * läuft linear, wie eine echte Vorschubfahrt). Gefahrene Bahnstücke bleiben
 * stehen; die Materialstreifen der Schnitte schrumpfen synchron zur
 * Werkzeugspitze, weil beide dieselbe Dauer linear abfahren.
 *
 * **Material als Schichten:** unter allem liegt die fertige Kontur — vor der
 * Fahrt schaut sie als Linie durch die Rohmaterial-Streifen hindurch, wie
 * auf einer Zeichnung: „in der Stange steckt das Teil schon drin“. Jeder
 * Streifen gehört zu genau einem Schnitt-Satz und verschwindet mit ihm.
 * Er schrumpft oben **und** unten, obwohl das Werkzeug nur oben ansetzt —
 * das ist kein Fehler, sondern das Drehen selbst: das Teil rotiert, also
 * trägt jede Umdrehung rundum ab. Z3 sagt das im Panel dazu.
 *
 * Unter „Bewegung reduzieren“ springt die Fahrt in ihren Endzustand und
 * meldet sich sofort fertig — die Information (Bahn, fertiges Teil) bleibt,
 * nur die Bewegung entfällt, wie beim Zähler in Z6.
 */

/** Maßstab: Millimeter → Zeicheneinheiten. */
const S = 3.2

/** Drehachse des Teils. */
const MITTE = 150

/** Linke Kante des sichtbaren Rohteils (im Futter). */
const LINKS = 80

/** Wo die Stirnfläche liegt — Z-Nullpunkt beider Kapitel. */
const SCHULTER = LINKS + TEIL.schaftLaenge * S
const STIRN = SCHULTER + TEIL.sitzLaenge * S

/** Z-Position (mm ab Stirn) → Bühnen-x. */
const pxZ = (z: number) => STIRN + z * S

/** Durchmesser (mm) → Bühnen-y der oberen bzw. unteren Mantellinie. */
const pxOben = (d: number) => MITTE - (d / 2) * S
const pxUnten = (d: number) => MITTE + (d / 2) * S

/** Ein Punkt der Bahn: `x` = Z-Achse (Länge), `y` = X-Achse (Durchmesser). */
interface P {
  x: number
  y: number
}

/** Wo das Werkzeug wartet: X44 Z16 — frei über dem Teil, rechts vor der Stirn. */
const PARK_MM = { x: 44, z: 16 } as const

/**
 * Die Sätze eines Kapitels als Punktfolge, ab Parkposition. Fehlt eine
 * Achse im Satz, bleibt ihr Wert stehen — dieselbe Regel, nach der eine
 * Steuerung liest.
 */
function bahn(saetze: readonly NcSatz[]): P[] {
  const punkte: P[] = []
  let d: number = PARK_MM.x
  let z: number = PARK_MM.z
  punkte.push({ x: pxZ(z), y: pxOben(d) })
  for (const s of saetze) {
    if (s.x !== undefined) d = s.x
    if (s.z !== undefined) z = s.z
    punkte.push({ x: pxZ(z), y: pxOben(d) })
  }
  return punkte
}

/**
 * Ein Streifen Rohmaterial, den genau ein Satz wegnimmt. Er liegt zwischen
 * zwei Durchmessern und schrumpft während „seines“ Satzes von rechts nach
 * links — die rechte Kante folgt der Werkzeugspitze.
 */
interface Streifen {
  /** Index des Satzes, der ihn abträgt. */
  satz: number
  /** Linke Kante (Bühnen-x) — hier endet der Schnitt. */
  x: number
  breite: number
  /** Oberkante des oberen Streifens. */
  oben: number
  /** Oberkante des unteren Spiegel-Streifens. */
  unten: number
  hoehe: number
}

function streifen(
  satz: number,
  vonZ: number,
  bisZ: number,
  aussenD: number,
  innenD: number,
): Streifen {
  return {
    satz,
    x: pxZ(bisZ),
    breite: pxZ(vonZ) - pxZ(bisZ),
    oben: pxOben(aussenD),
    unten: pxUnten(innenD),
    hoehe: ((aussenD - innenD) / 2) * S,
  }
}

/** Alles, was ein Kapitel an Geometrie mitbringt. */
interface Szene {
  saetze: readonly NcSatz[]
  /** Rohdurchmesser — er bestimmt, wo die Spannbacken greifen. */
  rohD: number
  /** Die fertige Kontur, die unter den Streifen liegt. */
  kontur: string
  streifen: readonly Streifen[]
  /** Die blanke, frisch gedrehte Fläche — erscheint nach dem letzten Schnitt. */
  glanz: string
  /** Ab welchem Schritt der Glanz steht (Index nach dem letzten Span-Satz). */
  glanzAb: number
}

/**
 * Kapitel „befehle“: die Übungs-Stange Ø 24, drei Sätze drehen einen Absatz
 * Ø 20 × 30. Kapitel „programm“: der Bolzen des Tages — Schruppen bis Z −34
 * (davor bleibt ein Bund für die Spannbacken stehen), dann der Schlichtgang
 * mit Fase. Beide Konturen sind aus denselben Zahlen gerechnet wie die Sätze
 * in `kanon.ts`.
 */
const SZENEN: Record<Kapitel, Szene> = {
  befehle: {
    saetze: UEBUNGS_SAETZE,
    rohD: 24,
    kontur: [
      `M ${LINKS} ${pxOben(24)}`,
      `H ${pxZ(-30)}`,
      `V ${pxOben(20)}`,
      `H ${STIRN}`,
      `V ${pxUnten(20)}`,
      `H ${pxZ(-30)}`,
      `V ${pxUnten(24)}`,
      `H ${LINKS}`,
      'Z',
    ].join(' '),
    streifen: [streifen(2, 0, -30, 24, 20)],
    glanz: `M ${pxZ(0)} ${pxOben(20)} H ${pxZ(-30)}`,
    glanzAb: 3,
  },
  programm: {
    saetze: PROGRAMM_SAETZE,
    rohD: 28,
    kontur: [
      `M ${LINKS} ${pxOben(28)}`,
      `H ${pxZ(-34)}`,
      `V ${pxOben(20)}`,
      `H ${SCHULTER}`,
      `V ${pxOben(25)}`,
      `H ${pxZ(-1)}`,
      `L ${STIRN} ${pxOben(23)}`,
      `V ${pxUnten(23)}`,
      `L ${pxZ(-1)} ${pxUnten(25)}`,
      `H ${SCHULTER}`,
      `V ${pxUnten(20)}`,
      `H ${pxZ(-34)}`,
      `V ${pxUnten(28)}`,
      `H ${LINKS}`,
      'Z',
    ].join(' '),
    streifen: [
      // N20: die ganze Länge von Ø 28 auf Ø 26.
      streifen(1, 0, -34, 28, 26),
      // N60/N100: der Schaft in zwei Schnitten auf Ø 23, dann Ø 20.
      streifen(5, -22, -34, 26, 23),
      streifen(9, -22, -34, 23, 20),
      // N160: der Schlichtgang nimmt am Sitz das letzte halbe Millimeter.
      streifen(15, -1, -22, 26, 25),
    ],
    glanz: `M ${pxZ(0)} ${pxOben(23)} L ${pxZ(-1)} ${pxOben(25)} H ${SCHULTER}`,
    glanzAb: 16,
  },
}

export function Werkzeugweg({
  zustand,
  onSchritt,
  onGefahren,
}: {
  zustand: WegZustand
  /**
   * Meldet den Satz, der gerade fährt (Index), sonst `null` — das Panel
   * hebt damit die laufende Programmzeile hervor: Code und Bewegung sind
   * dieselbe Sache, und genau das soll man sehen.
   */
  onSchritt?: (satz: number | null) => void
  /** Die Fahrt ist durch — der Step schaltet seine Rückmeldung frei. */
  onGefahren?: () => void
}) {
  const { kapitel, markiert, fahrt, gefahren } = zustand
  const ruhig = useReducedMotion() ?? false
  const szene = SZENEN[kapitel]
  const { saetze } = szene
  const punkte = bahn(saetze)

  /**
   * Der Satz, der gerade fährt. `-1` = noch nie gefahren (Werkzeug parkt),
   * `saetze.length` = Fahrt zu Ende (alles steht, das Teil ist fertig).
   */
  const [schritt, setSchritt] = useState(() => (gefahren ? saetze.length : -1))
  const laeuft = fahrt > 0 && schritt >= 0 && schritt < saetze.length

  // Jede neue Fahrt beginnt vorn — unter „Bewegung reduzieren“ direkt am Ende.
  // Layout-Effekt, kein passiver: beim „Nochmal abspielen“ stünde sonst für
  // einen gemalten Frame noch der alte Endzustand da, bevor die Bahn leert.
  useLayoutEffect(() => {
    if (fahrt > 0) setSchritt(ruhig ? saetze.length : 0)
  }, [fahrt, ruhig, saetze.length])

  /**
   * Fertig gemeldet wird je Fahrt genau einmal — über eine Ref statt über
   * Effekt-Abhängigkeiten, weil der Callback im Step bei jedem Render neu
   * entsteht und ein Effekt daran sonst mehrfach feuern würde.
   */
  const gemeldet = useRef(0)
  useEffect(() => {
    if (fahrt > 0 && schritt >= saetze.length && gemeldet.current !== fahrt) {
      gemeldet.current = fahrt
      onGefahren?.()
    }
  })
  // Der Step reicht `onSchritt` memoisiert herein (`useCallback`) — sonst
  // liefe dieser Effekt bei jedem Render statt bei jedem Schritt.
  useEffect(() => {
    onSchritt?.(laeuft ? schritt : null)
  }, [laeuft, schritt, onSchritt])

  const werkzeug =
    schritt >= saetze.length
      ? punkte[saetze.length]
      : schritt >= 0
        ? punkte[schritt + 1]
        : punkte[0]

  const rohS = (szene.rohD / 2) * S

  return (
    <Bild testid="werkzeugweg-buehne">
      {() => (
        <svg
          viewBox="0 0 320 240"
          preserveAspectRatio="xMidYMid meet"
          className="size-full"
        >
          {/* Futter: Körper und zwei sichtbare Backen, die das Rohteil greifen.
              Schmaler als früher (24 statt 34), damit die Schnitte bis Z −34
              sichtbar vor den Backen enden statt in ihnen. */}
          <rect
            x="16"
            y={MITTE - 62}
            width="52"
            height="124"
            rx="6"
            fill={STAHL.flaeche}
            stroke={STAHL.linieMatt}
            strokeWidth="1.5"
          />
          <rect
            x="60"
            y={MITTE - rohS - 16}
            width="24"
            height="16"
            rx="2"
            fill={STAHL.flaeche}
            stroke={STAHL.linie}
            strokeWidth="1.5"
          />
          <rect
            x="60"
            y={MITTE + rohS}
            width="24"
            height="16"
            rx="2"
            fill={STAHL.flaeche}
            stroke={STAHL.linie}
            strokeWidth="1.5"
          />

          {/* Drehachse. */}
          <line
            x1="20"
            y1={MITTE}
            x2={STIRN + 28}
            y2={MITTE}
            stroke={STAHL.linieMatt}
            strokeWidth="1"
            strokeDasharray="10 3 2 3"
          />

          {/* Die fertige Kontur — sie liegt unter dem Rohmaterial und schaut
              als Linie hindurch: das Teil steckt schon in der Stange. */}
          <path
            d={szene.kontur}
            fill="rgb(198 210 220 / 0.08)"
            stroke={STAHL.linie}
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* Das Rohmaterial über der Kontur, je Schnitt ein Streifenpaar.
              `key={fahrt}`: jede neue Fahrt beginnt mit vollem Material. */}
          <g key={`material-${fahrt}`}>
            {szene.streifen.map((st) => {
              /*
                Der Schnitt-Satz kann rechts vom Material beginnen (N20
                startet bei Z+2, der Streifen bei Z0): der Streifen wartet
                dann genau die Zeit, die die Schneide bis zu seiner rechten
                Kante braucht — sonst liefe die Materialkante der
                Werkzeugspitze ein Stück voraus.
              */
              const von = punkte[st.satz].x
              const bis = punkte[st.satz + 1].x
              const rechts = st.x + st.breite
              const anteil = Math.min(1, Math.max(0, (von - rechts) / (von - bis)))
              const dauer = saetze[st.satz].dauer
              return (
                <Materialstreifen
                  key={st.satz}
                  streifen={st}
                  schritt={schritt}
                  verzoegerung={dauer * anteil}
                  dauer={dauer * (1 - anteil)}
                />
              )
            })}
          </g>

          {/* Achsenkreuz der Drehmaschine: Z längs, X quer. */}
          <g
            stroke={STAHL.linieMatt}
            strokeWidth="1.5"
            fill={STAHL.linieMatt}
            fontSize="9"
          >
            <line x1="262" y1="212" x2="294" y2="212" />
            <path d="M 294 212 l -6 -2.4 v 4.8 Z" />
            <line x1="262" y1="212" x2="262" y2="184" />
            <path d="M 262 184 l -2.4 6 h 4.8 Z" />
            <text x="298" y="215" stroke="none">
              Z
            </text>
            <text x="258" y="178" stroke="none" textAnchor="middle">
              X
            </text>
          </g>

          {/* Die Bahn: gefahrene Stücke bleiben stehen, das laufende zeichnet
              sich in Satz-Geschwindigkeit. */}
          <g key={`bahn-${fahrt}`}>
            {saetze.map((s, i) =>
              i < schritt ? (
                <Bahnstueck key={s.code} von={punkte[i]} bis={punkte[i + 1]} satz={s} />
              ) : i === schritt ? (
                <Bahnstueck
                  key={s.code}
                  von={punkte[i]}
                  bis={punkte[i + 1]}
                  satz={s}
                  animiert
                />
              ) : null,
            )}
          </g>

          {/* Die frisch gedrehte Fläche glänzt, sobald der letzte Schnitt
              durch ist — dieselbe blanke Kante wie an den Bolzen in Z6. */}
          {schritt >= szene.glanzAb && (
            <motion.path
              d={szene.glanz}
              fill="none"
              stroke={STAHL.glanz}
              strokeWidth="1.6"
              strokeLinecap="round"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.9 }}
              transition={{ duration: 0.6 }}
              data-testid="weg-glanz"
            />
          )}

          {/* Vorschau des angetippten Befehls: sein Stück Bahn pulsiert, ein
              Ring markiert, wo die Fahrt endet. Während einer Fahrt zeigt die
              Bühne nur die Fahrt selbst. */}
          {markiert !== null && !laeuft && markiert < saetze.length && (
            <Vorschau
              von={punkte[markiert]}
              bis={punkte[markiert + 1]}
              satz={saetze[markiert]}
              ruhig={ruhig}
            />
          )}

          {/* Das Werkzeug: Halter von oben, Schneidplatte als Spitze. Jeder
              Satz ist eine eigene Fahrt — deshalb der `key` am Schritt. */}
          <motion.g
            key={`werkzeug-${fahrt}-${schritt}`}
            initial={laeuft ? { x: punkte[schritt].x, y: punkte[schritt].y } : false}
            animate={{ x: werkzeug.x, y: werkzeug.y }}
            transition={{
              duration: laeuft ? saetze[schritt].dauer : 0.4,
              ease: laeuft && saetze[schritt].g === 1 ? 'linear' : [0.22, 1, 0.36, 1],
            }}
            onAnimationComplete={() => {
              if (laeuft) setSchritt((s) => s + 1)
            }}
          >
            {/* Koordinatenursprung der Gruppe ist die Werkzeugspitze. */}
            <g>
              <rect
                x="1"
                y="-58"
                width="14"
                height="46"
                rx="2"
                fill={STAHL.flaeche}
                stroke={STAHL.linieMatt}
                strokeWidth="1.5"
              />
              <path
                d="M 0 0 L 12 -14 L 3 -16 Z"
                fill={STAHL.blank}
                stroke={STAHL.linie}
                strokeWidth="1"
              />
              {/* Der Span: nur, solange wirklich geschnitten wird. */}
              {laeuft && saetze[schritt].span && (
                <motion.circle
                  r="4"
                  fill={WARM.heiss}
                  animate={{ opacity: [0.9, 0.35, 0.9], scale: [1, 1.5, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                />
              )}
            </g>
          </motion.g>
        </svg>
      )}
    </Bild>
  )
}

/**
 * Ein Streifenpaar Rohmaterial. Solange sein Satz nicht dran war, steht es
 * voll; während des Satzes folgt seine rechte Kante der Werkzeugspitze
 * (beide fahren dieselbe Dauer linear); danach ist es weg.
 */
function Materialstreifen({
  streifen: st,
  schritt,
  verzoegerung,
  dauer,
}: {
  streifen: Streifen
  schritt: number
  /** Anlaufzeit, bis die Schneide die rechte Materialkante erreicht. */
  verzoegerung: number
  dauer: number
}) {
  if (schritt > st.satz) return null
  const faehrt = schritt === st.satz

  return (
    <g data-testid={`weg-material-${st.satz}`}>
      {[st.oben, st.unten].map((y) => (
        <motion.rect
          key={y}
          x={st.x}
          y={y}
          height={st.hoehe}
          fill={STAHL.flaeche}
          stroke={STAHL.linieMatt}
          strokeWidth="1"
          opacity="0.9"
          initial={{ width: st.breite }}
          animate={{ width: faehrt ? 0 : st.breite }}
          transition={{
            duration: faehrt ? dauer : 0,
            delay: faehrt ? verzoegerung : 0,
            ease: 'linear',
          }}
        />
      ))}
    </g>
  )
}

/**
 * Ein gefahrenes Stück Bahn: Eilgang gestrichelt und kalt, Schnitt warm.
 *
 * Zwei Zeichenwege, mit Absicht: der Schnitt wächst über `pathLength`, der
 * Eilgang über seinen **Endpunkt**. Sobald `pathLength` animiert, setzt
 * motion nämlich selbst ein auf die Pfadlänge normiertes `strokeDasharray`
 * — und überschriebe damit die Strichelung, die den Eilgang als „schnell,
 * schneidet nichts“ lesbar macht.
 */
function Bahnstueck({
  von,
  bis,
  satz,
  animiert = false,
}: {
  von: P
  bis: P
  satz: NcSatz
  animiert?: boolean
}) {
  const schnitt = satz.g === 1
  const stil = {
    stroke: schnitt ? WARM.linie : STAHL.linie,
    strokeWidth: schnitt ? 3 : 2,
    strokeLinecap: 'round',
    opacity: schnitt ? 0.95 : 0.7,
    'data-testid': `weg-satz-${satz.code}`,
  } as const

  if (!schnitt) {
    return (
      <motion.line
        x1={von.x}
        y1={von.y}
        strokeDasharray="6 5"
        initial={animiert ? { x2: von.x, y2: von.y } : false}
        animate={{ x2: bis.x, y2: bis.y }}
        transition={{ duration: animiert ? satz.dauer : 0, ease: [0.22, 1, 0.36, 1] }}
        {...stil}
      />
    )
  }

  return (
    <motion.line
      x1={von.x}
      y1={von.y}
      x2={bis.x}
      y2={bis.y}
      initial={animiert ? { pathLength: 0 } : false}
      animate={{ pathLength: 1 }}
      transition={{ duration: animiert ? satz.dauer : 0, ease: 'linear' }}
      {...stil}
    />
  )
}

/**
 * Die Vorschau eines angetippten Befehls: das Bahnstück pulsiert, ein Ring
 * zeigt den Zielpunkt — „fahr an **diese** Stelle“. Unter „Bewegung
 * reduzieren“ steht beides ruhig da.
 */
function Vorschau({
  von,
  bis,
  satz,
  ruhig,
}: {
  von: P
  bis: P
  satz: NcSatz
  ruhig: boolean
}) {
  const schnitt = satz.g === 1
  const farbe = schnitt ? WARM.heiss : STAHL.blank

  return (
    <motion.g
      animate={ruhig ? { opacity: 0.9 } : { opacity: [0.45, 1, 0.45] }}
      transition={ruhig ? undefined : { duration: 1.4, repeat: Infinity }}
      data-testid="weg-vorschau"
    >
      <line
        x1={von.x}
        y1={von.y}
        x2={bis.x}
        y2={bis.y}
        stroke={farbe}
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={schnitt ? undefined : '6 5'}
      />
      <circle cx={bis.x} cy={bis.y} r="6" fill="none" stroke={farbe} strokeWidth="2" />
    </motion.g>
  )
}
