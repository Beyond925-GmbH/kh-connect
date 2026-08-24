import { PROFIL, RASTER_KURVE, ROHLING_DURCHMESSER } from './kanon'
import { motion } from 'motion/react'

/**
 * Die Bühne des Zerspanungs-Tages — **ein Werkstück, sechs Zustände.**
 *
 * Der Dachdecker hat einen Dachstuhl, der als Plan, als Rohholz, als Ladung
 * und als fertiges Dach erscheint. Hier ist es dasselbe Prinzip in flach: der
 * Faden dieses Tages ist *dein Teil, Nr. 1 von 400*, und es ist über den
 * ganzen Tag dieselbe Kontur aus `kanon.ts` — erst als Maß, dann als Weg, dann
 * als Zahl (khpl-tag-zerspanung.md §2 und §7).
 *
 * | Zustand | Step | Was zu sehen ist |
 * | --- | --- | --- |
 * | `zeichnung` | Z1 | die Kontur als Vektorzeichnung, Maßlinien, das Toleranzfeld |
 * | `rohling` | Z2 | halbnah in die Maschine: Futter, Rohling, Revolver |
 * | `werkzeugweg` | Z3 | die Kontur zeichnet sich Zeile für Zeile als Weg |
 * | `messraum` | Z4 | der helle, stille Raum — der einzige Ortswechsel des Tages |
 * | `messung` | Z5 | ganz nah: Mikrometerschraube, Teil, Ziffern |
 * | `kiste` | Z6 | die Sichtkiste, die sich füllt. Eins ist markiert |
 *
 * **Der Zoom ist die Klammer.** Die Kamera geht den ganzen Tag in eine
 * Richtung — Zeichnung, Maschine, Messraum, Messschraube. Deshalb ist `zoom`
 * eine Eigenschaft der Bühne und keine des einzelnen Screens.
 *
 * **Diese Datei ist three-frei und bleibt es.** Der Tag baut keine 3D-Welt; die
 * Werkzeuge dieses Berufs sind die Zeichnung, der Werkzeugweg und die Zahl,
 * und alle drei sind flach. Falls Z2 doch einen Drehkörper bekommt
 * (`THREE.LatheGeometry` über dasselbe `PROFIL`), gehört er in eine eigene
 * Datei daneben und wird **ausschließlich** über `lazy()` geladen —
 * Laufzeitwerte kommen weiterhin aus `kanon.ts` (§7, khpl-tage.md §3).
 *
 * ---
 *
 * ⚠️ **Stand: Gerüst.** Die Props sind die Schnittstelle, gegen die Steps und
 * Bühne gebaut werden — sie sind vollständig und gelten. Gezeichnet ist bisher
 * die Kontur; die einzelnen Zustände füllt der Bühnen-Agent.
 */

export type WerkstueckZustand =
  'zeichnung' | 'rohling' | 'werkzeugweg' | 'messraum' | 'messung' | 'kiste'

/**
 * Wie nah der Tag gerade dran ist. Er geht nur in eine Richtung:
 * `fern` (Zeichnung) → `nah` (Maschine) → `makro` (Messschraube).
 */
export type Zoomstufe = 'fern' | 'nah' | 'makro'

export interface WerkstueckProps {
  zustand: WerkstueckZustand
  /** Ohne Angabe die Stufe, die der Zustand von sich aus mitbringt. */
  zoom?: Zoomstufe

  // -- Z1 -------------------------------------------------------------------
  /** Hebt das Maß `Ø 20 h7` in der Zeichnung hervor. */
  massHervorgehoben?: boolean
  /**
   * Die Auflösung: Der Screen zoomt auf das Toleranzfeld, bis das Maß den
   * halben Bildschirm füllt — der erste Zoom des Tages und damit die Ansage,
   * wie dieser Tag funktioniert.
   */
  toleranzfeld?: boolean

  // -- Z2 -------------------------------------------------------------------
  /**
   * Wie viele der vier Handgriffe erledigt sind (0–4): spannen, bestücken,
   * Werkzeuge vermessen, Nullpunkt setzen. Man kann dabei nichts falsch
   * machen; der Punkt ist, **wie viel passiert, bevor irgendetwas passiert**.
   */
  ruestschritte?: number
  /** Der Höhepunkt des Screens: der gesetzte Werkstücknullpunkt leuchtet auf. */
  nullpunkt?: boolean

  // -- Z3 -------------------------------------------------------------------
  /**
   * Bis zu welcher Programmzeile die Kontur gezeichnet ist (Index in
   * `PROGRAMM`). Mit jeder Zeile wächst ein Stück Weg — das ist der Reiz des
   * Screens: aus Text wird eine Form, und man hat sie selbst entstehen lassen.
   */
  zeile?: number
  /** Angetippte Zeile — die, die der Besucher für falsch hält. */
  markierteZeile?: number | null
  /**
   * Blind bis ans Ende gefahren und Start gedrückt: das Werkzeug fährt in die
   * Spannbacke, das Bild friert. Der Preis dieses Tages ist nicht Material und
   * nicht Zeit, sondern das Werkzeug, die Spannung — und der Vertrauensverlust,
   * denn danach muss alles neu vermessen werden.
   */
  kollision?: boolean

  // -- Z5 -------------------------------------------------------------------
  /**
   * Der Messwert in mm. Die Anzeige **rastet in Hundertstel**, sie gleitet
   * nicht: dieser Tag gehört den Ziffern.
   */
  messwert?: number
  /**
   * Nach einer falschen Antwort fährt das Toleranzfeld ein und legt sich über
   * den Messwert — man **sieht**, dass die Zahl außerhalb liegt. Kein Tadel,
   * kein Rot.
   */
  toleranzUeberlagerung?: boolean
  /** Beat 2: der Werkzeugkorrektor ist verstellt, das nächste Teil passt. */
  korrigiert?: boolean

  // -- Z6 -------------------------------------------------------------------
  /**
   * Füllstand der Sichtkiste, 0…1. Sie füllt sich, während man hinsieht — die
   * Maschine macht weiter, wenn du gehst.
   */
  fuellstand?: number

  /** Feuert, sobald die Bühne steht (Muster: `onBereit` der 3D-Bühne). */
  onBereit?: () => void
}

/** Die Zoomstufe, die ein Zustand von sich aus mitbringt. */
const EIGENER_ZOOM: Record<WerkstueckZustand, Zoomstufe> = {
  zeichnung: 'fern',
  rohling: 'nah',
  werkzeugweg: 'fern',
  messraum: 'nah',
  messung: 'makro',
  kiste: 'nah',
}

const MASSSTAB: Record<Zoomstufe, number> = { fern: 1, nah: 1.6, makro: 2.8 }

export function Werkstueck(props: WerkstueckProps) {
  const zoom = props.zoom ?? EIGENER_ZOOM[props.zustand]

  return (
    <div className="relative size-full overflow-hidden bg-kh-surface" data-wisch="aus">
      <motion.svg
        viewBox="-42 -18 50 36"
        className="size-full"
        aria-hidden
        initial={false}
        animate={{ scale: MASSSTAB[zoom] }}
        transition={{ duration: 0.7, ease: RASTER_KURVE }}
      >
        {/* Die Mittelachse — in einer technischen Zeichnung strichpunktiert. */}
        <line
          x1={-40}
          y1={0}
          x2={4}
          y2={0}
          stroke="currentColor"
          strokeWidth={0.18}
          strokeDasharray="3 1 0.6 1"
          className="text-kh-line-strong"
        />

        {props.zustand === 'rohling' && (
          <rect
            x={-38}
            y={-ROHLING_DURCHMESSER / 2}
            width={38}
            height={ROHLING_DURCHMESSER}
            className="fill-kh-raised"
          />
        )}

        <path
          d={kontur()}
          className="fill-none text-kh-paper"
          stroke="currentColor"
          strokeWidth={0.4}
          strokeLinejoin="round"
        />
      </motion.svg>
    </div>
  )
}

/**
 * Die Kontur als geschlossener Pfad: das Halbprofil aus `kanon.ts`, an der
 * Achse gespiegelt. `z` läuft ins Material und damit nach links, `r` nach oben
 * und unten.
 */
function kontur(): string {
  const start = PROFIL[0]
  const oben = PROFIL.slice(1).map((p) => `L ${p.z} ${-p.r}`)
  const unten = [...PROFIL].reverse().map((p) => `L ${p.z} ${p.r}`)
  return `M ${start.z} ${-start.r} ${oben.join(' ')} ${unten.join(' ')} Z`
}
