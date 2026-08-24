import { useEffect, useRef } from 'react'
import { Bild } from './Bild'
import { STRICH } from './stil'
import { Kiste } from './Kiste'
import { Maschine } from './Maschine'
import { Messschraube } from './Messschraube'
import { Werkzeugweg } from './Werkzeugweg'
import { Zeichnung } from './Zeichnung'

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
 * Jeder Zustand bringt seine Stufe schon in seinem Bildausschnitt mit; `zoom`
 * sagt nur, wie weit die Kamera **von dort aus** noch vor- oder zurückgeht.
 * Ohne Angabe steht sie da, wo der Zustand sie hinstellt — und ein Step, der
 * nichts anderes will, muss nichts angeben. Ein zurückgenommener Zoom
 * (`zoom="fern"` auf `messung`) zeigt Rand: die Kamera dieses Tages ist dafür
 * gebaut, nach vorn zu gehen.
 *
 * **Diese Datei ist three-frei und bleibt es.** Der Tag baut keine 3D-Welt; die
 * Werkzeuge dieses Berufs sind die Zeichnung, der Werkzeugweg und die Zahl,
 * und alle drei sind flach. Falls Z2 doch einen Drehkörper bekommt
 * (`THREE.LatheGeometry` über dasselbe `PROFIL`), gehört er in eine eigene
 * Datei daneben und wird **ausschließlich** über `lazy()` geladen —
 * Laufzeitwerte kommen weiterhin aus `kanon.ts` (§7, khpl-tage.md §3).
 *
 * Gebaut ist er nicht, und das ist eine Entscheidung: Die Spec erlaubt den
 * Rückfall ausdrücklich („die Beweislast liegt bei 3D, nicht bei 2D", §7).
 * Ein gerenderter Drehkörper wäre der einzige Screen des Tages mit einer
 * anderen Handschrift — ausgerechnet der, auf dem man lesen soll, was wo
 * sitzt. Solange die 2D-Maschine das trägt, kostet 3D nur Startzeit.
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
  const massstab = MASSSTAB[zoom] / MASSSTAB[EIGENER_ZOOM[props.zustand]]

  // Die Bühne ist mit dem ersten Bild da — sie lädt nichts nach. Die Meldung
  // gibt es trotzdem, weil die Steps gegen dieselbe Schnittstelle gebaut sind
  // wie beim Dachstuhl, und ein Step, der auf `onBereit` wartet, hier sonst
  // ewig wartet.
  const gemeldet = useRef(false)
  const onBereit = props.onBereit
  useEffect(() => {
    if (gemeldet.current) return
    gemeldet.current = true
    onBereit?.()
  }, [onBereit])

  return (
    <div className="relative size-full overflow-hidden bg-kh-surface">
      <div
        className="size-full"
        style={{
          transform: `scale(${massstab})`,
          transition: 'transform 0.7s cubic-bezier(0.2, 0, 0, 1)',
        }}
      >
        {props.zustand === 'zeichnung' && (
          <Zeichnung
            massHervorgehoben={props.massHervorgehoben}
            toleranzfeld={props.toleranzfeld}
          />
        )}
        {props.zustand === 'rohling' && (
          <Maschine ruestschritte={props.ruestschritte} nullpunkt={props.nullpunkt} />
        )}
        {props.zustand === 'werkzeugweg' && (
          <Werkzeugweg
            zeile={props.zeile}
            markierteZeile={props.markierteZeile}
            kollision={props.kollision}
          />
        )}
        {props.zustand === 'messraum' && <Messraum />}
        {props.zustand === 'messung' && (
          <Messschraube
            messwert={props.messwert}
            toleranzUeberlagerung={props.toleranzUeberlagerung}
            korrigiert={props.korrigiert}
          />
        )}
        {props.zustand === 'kiste' && <Kiste fuellstand={props.fuellstand} />}
      </div>
    </div>
  )
}

/**
 * Z4 — der Messraum. **Der einzige helle Screen eines Tages, der sonst in
 * dunkler Halle spielt** (khpl-tag-zerspanung.md §6 Z4), und damit der
 * sichtbarste Bruch, den dieser Tag hergibt, ohne die Tokens anzufassen.
 *
 * ⚠️ Z4 trägt im Bestand ein Foto (`berufe/zerspanung.ts`, `quiz-praezision`),
 * und solange das so bleibt, kommt dieser Zustand nicht auf den Screen. Er
 * steht trotzdem hier: Er ist Teil der Schnittstelle, und wenn das Motiv
 * fällt, soll die Zäsur nicht in einer leeren Fläche stattfinden.
 *
 * Hell, leer, ein Messgerät, sonst nichts. Kein Werkzeug, kein Span, kein
 * Mensch — ein Raum, in dem nichts steht außer dem, womit gemessen wird.
 */
function Messraum() {
  const strich = { stroke: 'currentColor', vectorEffect: 'non-scaling-stroke' } as const

  return (
    <Bild viewBox="0 -4 124 84" hell>
      <g className="text-kh-ink" fill="none" strokeWidth={STRICH.voll} {...strich}>
        {/* Wo Wand und Boden sich treffen. Mehr Raum braucht es nicht. */}
        <line x1={0} y1={62} x2={124} y2={62} {...strich} />

        {/* Der Messtisch: eine Granitplatte auf zwei Böcken. Sie ist der
            eigentliche Grund, warum dieser Raum ein eigener Raum ist —
            schwer, eben, und immer gleich warm. */}
        <path
          d="M 18 52 L 106 52 L 106 60 L 18 60 Z"
          className="fill-kh-ink/10"
          {...strich}
        />
        <path d="M 28 60 L 28 76 M 96 60 L 96 76" {...strich} />

        {/* Das Messgerät: Ständer, Arm, Messuhr. Die Spitze steht auf dem
            Teil, das auf zwei Auflagen liegt. */}
        <path d="M 46 52 L 46 12 L 62 12" className="fill-none" {...strich} />
        <circle cx={72} cy={12} r={10} className="fill-kh-ink/8" {...strich} />
        <path d="M 72 12 L 72 5" strokeWidth={STRICH.fein} {...strich} />
        <path d="M 62 12 L 62 30 L 66 30" {...strich} />
        <path
          d="M 66 27 L 74 30 L 66 33 Z"
          className="fill-kh-ink"
          strokeWidth={STRICH.fein}
          {...strich}
        />

        {/* Das Teil auf den Auflagen — dasselbe Drehteil, nur hier oben. */}
        <path
          d="M 60 34 L 96 34 L 96 42 L 60 42 Z"
          className="fill-kh-ink/10"
          {...strich}
        />
        <path d="M 62 42 L 62 52 M 92 42 L 92 52" strokeWidth={STRICH.fein} {...strich} />
      </g>
    </Bild>
  )
}
