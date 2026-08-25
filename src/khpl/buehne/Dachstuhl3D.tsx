import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { STANDARD_PARAMETER } from '@/dachstuhl/parameter'
import { berechneMasse } from '@/dachstuhl/mass'
import { bildeEinheiten, erzeugeTeile, schritteJePhase } from '@/dachstuhl/teileliste'
import type { Bauteil } from '@/dachstuhl/teileliste'
import type { Auswahl } from '@/dachstuhl/debug'
import type { Ansicht } from '@/drei/kamera'
import type { KulisseProps } from '@/dachstuhl/Dachstuhl'
import type { Lichtstimmung } from '@/drei/Beleuchtung'
import { phaseAt } from '@/dachstuhl/zeitachse'
import { useTapErkennung } from '@/drei/useTapErkennung'
import { Szene } from '@/drei/Szene'
import { useSichtfeld } from '@/khpl/shell/SichtfeldKontext'
import { Hallenlicht } from '@/khpl/buehne/Hallenlicht'
import { ANFAHRT_DAUER } from '@/khpl/buehne/kanon'

/**
 * Der parametrische Dachstuhl als Bühne — einmal gebaut, viermal benutzt:
 *
 *   B3.2  fertiges Modell, drehbar, Bauteile antippbar
 *   M5    Aufbau-Animation bis zu den Sparrenpaaren („schau zu“)
 *   M7    ab dort weiter, aber nur, wenn der Besucher richtig antwortet
 *   M8    das fertige Dach am Abend — das Dach, das er selbst gebaut hat
 *
 * Genau das war die Empfehlung in flow 9 („Im Code parametrisch bauen“): die
 * Aufbau-Animation fällt als Nebenprodukt ab, dasselbe Modell, andere Zeitachse.
 *
 * **Lazy-Grenze.** Dieses Modul zieht `three` nach (≤ 500 KB gzip, flow 8.5).
 * Es darf deshalb nur über `lazy(() => import(...))` eingebunden werden, nie
 * statisch — sonst landet three im Erststart-Bündel und reißt die 1,5-MB-Grenze.
 */

export interface Dachstuhl3DProps {
  /** Zielpunkt auf der Zeitachse, 0 = leere Decke, 1 = fertig gelattet. */
  zielT: number
  /** Startpunkt beim ersten Rendern. Ohne Angabe = `zielT` (kein Aufbau). */
  startT?: number
  /** Sekunden für die volle Strecke 0 → 1. Die Teilstrecke wird anteilig kurz. */
  dauer?: number
  /** Kamerapreset. `null` = frei drehbar. */
  ansicht?: Ansicht | null
  /** Nach 8 s ohne Eingabe dreht das Modell von selbst weiter. */
  attraktor?: boolean
  /**
   * Anteil der Dachfläche, der schon gelattet ist (0…1).
   *
   * Voll gelattet ist der bauliche Endzustand — und genau dann verschwindet
   * die Zimmererarbeit darunter: Pfetten, Stuhlsäulen und Kopfbänder liegen
   * unter einem geschlossenen Lattenteppich. Wo es ums Verstehen geht (B3.2),
   * bleibt die Lattung deshalb angedeutet; wo das fertige Dach die Aussage ist
   * (M8), wird zugelattet.
   */
  lattung?: number
  /** Angetipptes Bauteil. Der Step hält die Auswahl, damit er sie merken kann. */
  auswahl?: Auswahl | null
  onBauteil?: (teil: Bauteil) => void
  onDaneben?: () => void
  /** Label der gerade laufenden Aufbauphase, z. B. „Sparrenpaare“. */
  onPhase?: (label: string) => void
  /** Feuert, wenn `zielT` erreicht ist. */
  onAngekommen?: () => void
  /** 'riss' = Planansicht (M3): Kantenzeichnung statt Koerper. */
  darstellung?: 'koerper' | 'riss'
  /** Lichtstimmung. M6 = 'mittag'. */
  stimmung?: Lichtstimmung
  /** Geparktes Gespann neben der Rohdecke; die Ladung folgt der Zeitachse. */
  kulisse?: boolean
  /**
   * Anfahrt vor dem Aufbau (M5): `ANFAHRT_DAUER` Sekunden Kurvenfahrt, Tipp
   * ueberspringt, `prefers-reduced-motion` springt sofort ans Ende. Solange
   * die Fahrt laeuft, steht der Aufbau-Treiber komplett still — weder
   * `onPhase` noch `onAngekommen` feuern, und OrbitControls sind gesperrt.
   */
  anfahrt?: boolean
  /** Feuert genau einmal, wenn das Gespann steht. */
  onAnfahrtEnde?: () => void
  /** Markiert „deinen Sparren“ (Achse engine-intern abgeleitet). */
  deinSparren?: boolean
}
// KEINE Wert-Exporte neben der Default-Komponente (Bundle-Regel, s. README —
// Laufzeit-Konstanten der Buehnen leben in `kanon.ts`).

/**
 * Pick-Toleranz fuer den Tap auf ein Bauteil (B3.2).
 *
 * Ein einzelner Sparren ist auf dem Handy hochkant nur ~6 px breit — die
 * 44-px-Faustregel ist mit exakter Trefferpruefung nicht zu halten, und der
 * Step gilt erst nach zwei angetippten Bauteilen als gelaufen. Geht ein Tap
 * daneben, wird deshalb in Ringen um den Beruehrpunkt nachgefasst: derselbe
 * Raycast, nur an leicht versetzten Bildschirmpunkten. Das laeuft komplett
 * diesseits der Leinwand (synthetische Zeigerereignisse auf dem Canvas) und
 * laesst `src/drei/**` unangetastet.
 */
const PICK_RADIEN = [10, 18, 26]
const PICK_STRAHLEN = 8

export default function Dachstuhl3D({
  zielT,
  startT,
  dauer = 16,
  ansicht = null,
  attraktor = false,
  lattung,
  auswahl = null,
  onBauteil,
  onDaneben,
  onPhase,
  onAngekommen,
  darstellung = 'koerper',
  stimmung = 'standard',
  kulisse = false,
  anfahrt = false,
  onAnfahrtEnde,
  deinSparren = false,
}: Dachstuhl3DProps) {
  const sichtfeld = useSichtfeld()
  // Nach Stunden Standbetrieb fordert iOS Speicher zurück und nimmt der Seite
  // den WebGL-Kontext. Ohne Behandlung bleibt eine schwarze Fläche stehen, die
  // von allein nicht wiederkommt — und niemand am Stand weiß, dass ein Neuladen
  // hilft. Die Szene wird deshalb über `key` neu aufgebaut, sobald der Kontext
  // zurück ist, und solange liegt eine Erklärung darüber.
  const [kontextWeg, setKontextWeg] = useState(false)
  const [neustart, setNeustart] = useState(0)
  const masse = useMemo(
    () =>
      berechneMasse(
        lattung === undefined
          ? STANDARD_PARAMETER
          : { ...STANDARD_PARAMETER, lattungAnteil: lattung },
      ),
    [lattung],
  )
  const teile = useMemo(() => erzeugeTeile(masse), [masse])
  const einheiten = useMemo(() => bildeEinheiten(teile), [teile])
  const schritte = useMemo(() => schritteJePhase(teile), [teile])

  const reduziert = useMemo(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )

  const fortschritt = useRef(startT ?? zielT)
  const tap = useTapErkennung()

  // ---- Pick-Toleranz (s. PICK_RADIEN oben) --------------------------------
  const wurzel = useRef<HTMLDivElement>(null)
  /** Wo der letzte echte Tap ansetzte — Startpunkt der Ringsuche. */
  const zeigerOrt = useRef<{ x: number; y: number } | null>(null)
  /** Laeuft gerade eine Ringsuche? Dann keine Rekursion, kein Fehl-Daneben. */
  const suchlauf = useRef(false)
  const sucheTraf = useRef(false)

  // Rückmeldungen laufen über ein Ref: `useFrame` liest den Fortschritt jeden
  // Frame, React rendert dabei nicht neu.
  const melder = useRef({ onPhase, onAngekommen, onAnfahrtEnde })
  useEffect(() => {
    melder.current = { onPhase, onAngekommen, onAnfahrtEnde }
  })

  // ---- Anfahrt (M5) --------------------------------------------------------
  // Solange die Fahrt läuft, ist der Aufbau-Treiber unten komplett angehalten:
  // bei `zielT = M5_ENDE` und `fortschritt = startT` würde er sonst sofort
  // losfahren — und bei `|rest| < 0.0005` bzw. `reduziert` schon im ersten
  // Frame `onAngekommen` feuern.
  const [fahrtLaeuft, setFahrtLaeuft] = useState(anfahrt)
  const fahrtRef = useRef(anfahrt ? 0 : 1)
  const anfahrtGemeldet = useRef(false)

  useEffect(() => {
    if (!fahrtLaeuft) return

    const fertig = () => {
      setFahrtLaeuft(false)
      if (!anfahrtGemeldet.current) {
        anfahrtGemeldet.current = true
        melder.current.onAnfahrtEnde?.()
      }
    }

    // Reduzierte Bewegung: keine Fahrt, das Gespann steht sofort geparkt.
    if (reduziert) {
      fahrtRef.current = 1
      fertig()
      return
    }

    let id = 0
    const start = performance.now()
    const glatt = (u: number) => u * u * (3 - 2 * u)
    const schritt = (jetzt: number) => {
      const u = Math.min((jetzt - start) / 1000 / ANFAHRT_DAUER, 1)
      // Der Skip-Tipp setzt den Ref direkt auf 1 — nie dahinter zurückfallen.
      fahrtRef.current = Math.max(fahrtRef.current, glatt(u))
      if (fahrtRef.current >= 1) {
        fertig()
        return
      }
      id = requestAnimationFrame(schritt)
    }
    id = requestAnimationFrame(schritt)
    return () => cancelAnimationFrame(id)
  }, [fahrtLaeuft, reduziert])

  useEffect(() => {
    // Während der Anfahrt steht die Zeitachse: kein rAF-Fortschritt, keine
    // Meldungen. Der Effekt läuft nach `setFahrtLaeuft(false)` erneut und
    // startet dann den unveränderten Treiber von `startT` aus.
    if (fahrtLaeuft) return

    // Bei reduzierter Bewegung wird nicht gefahren, sondern gesetzt.
    if (reduziert) {
      fortschritt.current = zielT
      melder.current.onPhase?.(phaseAt(zielT).label)
      melder.current.onAngekommen?.()
      return
    }

    let id = 0
    let letzte = performance.now()
    let letztesLabel = ''
    let gemeldet = false

    const schritt = (jetzt: number) => {
      const dt = Math.min((jetzt - letzte) / 1000, 0.1)
      letzte = jetzt

      const rest = zielT - fortschritt.current
      if (Math.abs(rest) < 0.0005) {
        fortschritt.current = zielT
        if (!gemeldet) {
          gemeldet = true
          melder.current.onAngekommen?.()
        }
      } else {
        const weg = (dt / dauer) * Math.sign(rest)
        fortschritt.current =
          Math.abs(weg) > Math.abs(rest) ? zielT : fortschritt.current + weg
      }

      const label = phaseAt(fortschritt.current).label
      if (label !== letztesLabel) {
        letztesLabel = label
        melder.current.onPhase?.(label)
      }

      id = requestAnimationFrame(schritt)
    }

    id = requestAnimationFrame(schritt)
    return () => cancelAnimationFrame(id)
  }, [zielT, dauer, reduziert, fahrtLaeuft])

  /**
   * Fasst um den letzten Tap herum nach: dieselben Zeigerereignisse, die ein
   * echter Tap ausloest, nur an ringfoermig versetzten Punkten. Trifft ein
   * Strahl ein antippbares Bauteil, laeuft dessen normaler Weg (`tippen`)
   * — die Suche merkt das ueber `sucheTraf` und bricht ab. Die Dispatches
   * laufen synchron; `bubbles` bleibt aus, damit React (Wrapper-Handler,
   * Fahrt-Skip) die Kunststrahlen nicht als neue Taps sieht.
   */
  const sucheNah = useCallback((): boolean => {
    const p = zeigerOrt.current
    const leinwand = wurzel.current?.querySelector('canvas')
    if (!p || !leinwand || !onBauteil) return false
    suchlauf.current = true
    sucheTraf.current = false
    try {
      for (const radius of PICK_RADIEN) {
        for (let i = 0; i < PICK_STRAHLEN && !sucheTraf.current; i++) {
          const winkel = (i / PICK_STRAHLEN) * 2 * Math.PI
          const x = p.x + radius * Math.cos(winkel)
          const y = p.y + radius * Math.sin(winkel)
          // Der Startpunkt der Tap-Erkennung muss mitwandern, sonst zaehlt
          // der Versatz als Wischbewegung und `istTap` lehnt den Strahl ab.
          tap.merken({ clientX: x, clientY: y })
          for (const typ of ['pointerdown', 'pointerup'] as const) {
            leinwand.dispatchEvent(
              new PointerEvent(typ, {
                clientX: x,
                clientY: y,
                pointerId: 999,
                pointerType: 'mouse',
                isPrimary: true,
              }),
            )
          }
        }
        if (sucheTraf.current) break
      }
    } finally {
      suchlauf.current = false
    }
    return sucheTraf.current
  }, [onBauteil, tap])

  const tippen = useCallback(
    (teil: Bauteil) => {
      if (teil.antippbar) {
        sucheTraf.current = true
        onBauteil?.(teil)
        return
      }
      // Ein Suchstrahl streifte z. B. die Rohdecke — weitersuchen, nicht melden.
      if (suchlauf.current) return
      // Echter Tap auf ein stummes Teil: erst nachfassen (der gemeinte Sparren
      // liegt oft direkt daneben), erst dann ist es wirklich ein Daneben.
      if (!sucheNah()) onDaneben?.()
    },
    [onBauteil, onDaneben, sucheNah],
  )

  const daneben = useCallback(() => {
    if (suchlauf.current) return
    if (!sucheNah()) onDaneben?.()
  }, [onDaneben, sucheNah])
  const bereit = useCallback(() => {
    document.documentElement.dataset.dachstuhlBereit = 'true'
  }, [])

  useEffect(
    () => () => {
      delete document.documentElement.dataset.dachstuhlBereit
    },
    [],
  )

  const kulisseProps = useMemo<KulisseProps | null>(
    () => (kulisse ? { gespann: true, ladungAusFortschritt: true } : null),
    [kulisse],
  )

  return (
    <div
      ref={wurzel}
      className="relative size-full"
      // Skip der Fahrt: `pointerdown` im Capture, vor OrbitControls (die
      // während der Fahrt ohnehin gesperrt sind). Der Tipp wird konsumiert.
      onPointerDownCapture={(e) => {
        if (fahrtLaeuft && fahrtRef.current < 1) {
          fahrtRef.current = 1
          e.stopPropagation()
        }
      }}
      onPointerDown={(e) => {
        if (!fahrtLaeuft) {
          tap.merken(e)
          zeigerOrt.current = { x: e.clientX, y: e.clientY }
        }
      }}
      data-wisch="aus"
    >
      <Szene
        key={neustart}
        masse={masse}
        einheiten={einheiten}
        schritte={schritte}
        fortschrittRef={fortschritt}
        auswahl={auswahl}
        ansicht={ansicht}
        attraktor={attraktor}
        sichtfeld={sichtfeld}
        dpr={null}
        // Immer der Dunkel-Zweig. Die Bühne muss denselben Grund haben wie das
        // Panel davor — eine hell ausgeleuchtete 3D-Fläche zwischen fünfzehn
        // dunklen Screens war der einzige Ort, an dem die App ihre eigene Farbe
        // verließ. Das Abendlicht von M8 liegt als zwei Farbschichten *über*
        // der Leinwand und braucht dafür keinen eigenen Zweig mehr.
        dunkel
        reduziert={reduziert}
        darstellung={darstellung}
        stimmung={stimmung}
        kulisse={kulisseProps}
        fahrtRef={anfahrt ? fahrtRef : null}
        deinSparren={deinSparren}
        steuerungGesperrt={fahrtLaeuft}
        tap={tap}
        onTap={tippen}
        onDaneben={daneben}
        onBereit={bereit}
        onKontextVerloren={() => setKontextWeg(true)}
        onKontextZurueck={() => {
          setKontextWeg(false)
          setNeustart((n) => n + 1)
        }}
      />

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
