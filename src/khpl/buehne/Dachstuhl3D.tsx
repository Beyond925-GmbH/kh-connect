import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { STANDARD_PARAMETER } from '@/dachstuhl/parameter'
import { berechneMasse } from '@/dachstuhl/mass'
import { bildeEinheiten, erzeugeTeile, schritteJePhase } from '@/dachstuhl/teileliste'
import type { Bauteil } from '@/dachstuhl/teileliste'
import type { Auswahl } from '@/dachstuhl/debug'
import type { Ansicht } from '@/dachstuhl/kamera'
import { phaseAt } from '@/dachstuhl/zeitachse'
import { useTapErkennung } from '@/dachstuhl/useTapErkennung'
import { Szene } from '@/dachstuhl/Szene'
import { useSichtfeld } from '@/khpl/shell/SichtfeldKontext'

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
}

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

  // Rückmeldungen laufen über ein Ref: `useFrame` liest den Fortschritt jeden
  // Frame, React rendert dabei nicht neu.
  const melder = useRef({ onPhase, onAngekommen })
  useEffect(() => {
    melder.current = { onPhase, onAngekommen }
  })

  useEffect(() => {
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
  }, [zielT, dauer, reduziert])

  const tippen = useCallback(
    (teil: Bauteil) => {
      if (teil.antippbar) onBauteil?.(teil)
      else onDaneben?.()
    },
    [onBauteil, onDaneben],
  )

  const daneben = useCallback(() => onDaneben?.(), [onDaneben])
  const bereit = useCallback(() => {
    document.documentElement.dataset.dachstuhlBereit = 'true'
  }, [])

  useEffect(
    () => () => {
      delete document.documentElement.dataset.dachstuhlBereit
    },
    [],
  )

  return (
    <div
      className="relative size-full"
      onPointerDown={(e) => tap.merken(e)}
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
