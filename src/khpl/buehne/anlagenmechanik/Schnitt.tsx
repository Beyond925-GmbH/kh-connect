import { useCallback, useEffect, useRef, useState } from 'react'
import type {
  BauteilId,
  BuehnenZustand,
  KnotenId,
  PruefungId,
} from '@/khpl/buehne/anlagenmechanik/kanon'
import { Anlage } from './Anlage'
import { Haus } from './Haus'
import { Transporter } from './Transporter'

/**
 * Die Bühne dieses Tages — **der Schnitt**.
 *
 * Die eigene Bildsprache dieses Gewerks ist das Anlagenschema: Kessel,
 * Speicher, Verteiler, Vor- und Rücklauf, alles als Linie und Symbol. Drei
 * Zeichnungen tragen den ganzen Tag, und der Kellerschnitt allein viermal, in
 * vier Zuständen — leer und alt (A2), mit Raster (A4), mit Wärme (A6), fertig
 * (A7). Welcher Zustand gerade dran ist, sagt `zustand`; die Fälle stehen als
 * `BuehnenZustand` in `kanon.ts`, mit der Zuordnung zu den Steps.
 *
 * **Es sind zwei Zeichnungen und nicht sechs.** A1 hat den Anlagenausschnitt
 * für sich — er zeigt eine fremde Anlage, in der gesucht wird, und hat mit dem
 * Haus des zweiten Auftrags nichts zu tun. Alles andere spielt in **einer**
 * Welt (`Haus`): dieselbe `viewBox`, dieselben Koordinaten, nur ein anderer
 * Kamerarahmen. Deshalb ist der Keller in A4 sichtbar derselbe wie in A2 und
 * nicht ein zweiter, der ihm ähnelt — „eine Welt, viele Zustände"
 * (khpl-tage.md 1, Mechanismus 2), gezeichnet statt gebaut.
 *
 * **Dieser Tag hat kein `three`** (Spec 7). Nicht als Verzicht, sondern als
 * Beweis, dass die Hülle nicht am 3D hängt. Diese Datei darf deshalb ganz
 * normal statisch importiert werden — sie hat keine lazy-Grenze und braucht
 * keine.
 *
 * **Bewegungsgefühl: Fluss.** Lange Easings, Verläufe, die an Pfaden
 * entlanglaufen (`pathLength` über die gezogene Leitung). Bei
 * `prefers-reduced-motion` stehen die Endzustände sofort, die Wanderung
 * entfällt.
 *
 * **Farbe:** ausschließlich `KALT` und `WARM` aus `kanon.ts`. Kein Token, kein
 * Eingriff in `src/index.css`, und keine gefüllte orange Fläche — die eine pro
 * Screen ist *Weiter* (khpl-tage.md 3). Warm erscheint hier als Strich, als
 * Verlauf und als sehr flacher Schein, nie als Fläche.
 *
 * **Wo die Zeichnung im Screen sitzt.** Nicht bildfüllend: die `StepShell`
 * legt Titel und Panel über die Bühne, quer unten links, hoch unten. Ein
 * Schnitt, der mittig sitzt, verliert genau die Hälfte, auf die es ankommt —
 * den Keller. Deshalb hat der Rahmen hier eine Vorspannung: hoch nach oben,
 * quer nach rechts. Das ist die 2D-Entsprechung zum `SichtfeldMesser` der
 * 3D-Bühnen.
 *
 * **Hochkant wird die Unterkante gemessen und nicht geschätzt.** Die
 * Vorfassung setzte sie auf feste 32 % der Höhe. Das Panel ist aber unten
 * verankert und **unterschiedlich hoch**: es schrumpft, sobald eine Übung
 * gelöst ist, und wächst mit jeder Zeile Fachtext. Auf 1080 × 1920 klaffte
 * dadurch zwischen der Unterkante der Zeichnung und der Oberkante des Panels
 * ein toter schwarzer Streifen von 300 bis 550 px — am deutlichsten auf A1
 * nach dem Lösen. Jetzt läuft die Bühne hochkant bis kurz über die
 * Panelkante, und die Zeichnung füllt den Raum, den sie tatsächlich hat.
 * Quer bleibt es beim festen Rahmen: dort steht das Panel links und nimmt
 * keine Höhe weg.
 */
export interface SchnittProps {
  /** Welche Zeichnung, in welchem Zustand. */
  zustand: BuehnenZustand
  /** A1 — der Besucher prüft einen Punkt der Anlage. */
  onPruefpunkt?: (id: PruefungId) => void
  /** A2 — der Besucher tippt ein Bauteil im Keller an. */
  onBauteil?: (id: BauteilId) => void
  /**
   * A4 — die Zeichnung führt die Geste, der Step bekommt den Weg.
   *
   * Feuert während des Ziehens, nicht erst am Ende: der Verlustbalken läuft
   * mit, und ein Balken, der erst beim Loslassen springt, erklärt nichts.
   * Bögen und Verlust rechnet der Step über `zaehleBoegen` und `druckverlust`
   * aus — die Zeichnung kennt nur den Weg.
   */
  onPfad?: (pfad: readonly KnotenId[]) => void
  /**
   * A4 — der Weg endet an der tragenden Wand. Die Leitung geht nicht weiter,
   * blockiert wird aber nichts; **den Satz dazu sagt der Step**, damit die Copy
   * an einer Stelle liegt.
   */
  onAbgewiesen?: (knoten: KnotenId) => void
  /** A6 — die Wärme ist oben angekommen. Der Moment, für den der Tag gebaut ist. */
  onWaermeAngekommen?: () => void
}

export function Schnitt({
  zustand,
  onPruefpunkt,
  onBauteil,
  onPfad,
  onAbgewiesen,
  onWaermeAngekommen,
}: SchnittProps) {
  const { flaeche, rahmen } = useRahmen()

  return (
    <div
      ref={flaeche}
      className="size-full"
      data-testid="anlagen-buehne"
      data-szene={zustand.szene}
    >
      <div className="absolute" style={rahmen}>
        {zustand.szene === 'anlage' ? (
          <Anlage
            geprueft={zustand.geprueft}
            laeuft={zustand.laeuft}
            ursache={zustand.ursache}
            geloest={zustand.geloest}
            onPruefpunkt={onPruefpunkt}
          />
        ) : zustand.szene === 'transporter' ? (
          <Transporter licht={zustand.licht} />
        ) : (
          <Haus
            zustand={zustand}
            onBauteil={onBauteil}
            onPfad={onPfad}
            onAbgewiesen={onAbgewiesen}
            onWaermeAngekommen={onWaermeAngekommen}
          />
        )}
      </div>
    </div>
  )
}

/** Wie viel Luft hochkant zwischen Zeichnung und Panelkante bleibt. */
const LUFT_ZUM_PANEL = 14

/** Oberkante der Bühne — darüber schwebt die Leiste. */
const UNTER_DER_LEISTE = 76

/** Seitlicher Rand hochkant. */
const RAND = 12

/**
 * Das Seitenverhältnis aller drei Zeichnungen dieses Tages (320 × 260,
 * `WELT`). Alle drei stehen in derselben `viewBox`, deshalb reicht **eine**
 * Zahl — und der Rahmen kann sich nach ihr richten, statt die Zeichnung in
 * einem zu hohen Kasten schweben zu lassen.
 */
const SEITENVERHAELTNIS = 320 / 260

/**
 * Der Rahmen, in dem die Zeichnung sitzt — quer fest, hochkant gemessen.
 *
 * Gemessen wird das Panel der `StepShell` (`[data-testid="karte"]`) gegen die
 * eigene Fläche. Das ist derselbe Gedanke wie im `SichtfeldMesser`, nur ohne
 * Kamera: eine Zeichnung muss nichts nachführen, sie muss nur wissen, wo sie
 * aufhören darf. Der `SichtfeldMesser` selbst steht hier nicht zur Verfügung —
 * ihn stellt die Hülle nur den Steps mit `buehneInteraktiv` bereit, und das ist
 * an diesem Tag allein A4.
 *
 * Solange nichts gemessen ist, gilt der alte Festwert: ein Screen, der beim
 * ersten Bild einmal zu klein zeichnet, ist besser als einer, der springt.
 */
function useRahmen() {
  const flaeche = useRef<HTMLDivElement>(null)
  const [rahmen, setRahmen] = useState<React.CSSProperties>({
    inset: '76px 12px 32% 12px',
  })

  const messen = useCallback(() => {
    const el = flaeche.current
    const f = el?.getBoundingClientRect()
    if (!el || !f || f.width <= 0 || f.height <= 0) return
    if (f.width > f.height) {
      setRahmen({ inset: '7% 3% 7% 30%' })
      return
    }
    const panel = el
      .closest('[data-testid="step"]')
      ?.querySelector('[data-testid="karte"]')
      ?.getBoundingClientRect()
    // Der Deckel ist die Reißleine für kleine Fenster: ein Panel, das fast die
    // ganze Höhe nimmt, dürfte den Rahmen nicht auf null oder ins Negative
    // drücken.
    const unten = Math.min(
      panel ? Math.max(0, f.bottom - panel.top + LUFT_ZUM_PANEL) : f.height * 0.32,
      f.height - UNTER_DER_LEISTE - 80,
    )
    /*
      **Der Überschuss fällt überwiegend nach oben.** Hochkant ist der freie
      Kasten viel höher, als die Zeichnung breit ist: sie ist
      breitenbegrenzt, und `preserveAspectRatio="xMidYMid meet"` verteilt den
      Rest gleichmäßig — die Hälfte davon lag als schwarzer Streifen zwischen
      Zeichnung und Panel. Der Rahmen bekommt deshalb nur die Höhe, die die
      Zeichnung wirklich braucht, und der Rest wandert zu 60 % nach oben unter
      die Leiste, wo bei einem Gebäudeschnitt ohnehin Himmel wäre. Übrig
      bleibt unten eine Kante Luft, keine Lücke.
    */
    const noetig = (f.width - 2 * RAND) / SEITENVERHAELTNIS
    const frei = f.height - UNTER_DER_LEISTE - unten
    const oben = UNTER_DER_LEISTE + Math.max(0, frei - noetig) * 0.6
    setRahmen({
      inset: `${Math.round(oben)}px ${RAND}px ${Math.round(unten)}px ${RAND}px`,
    })
  }, [])

  useEffect(() => {
    messen()
    const el = flaeche.current
    if (!el) return
    const panel = el
      .closest('[data-testid="step"]')
      ?.querySelector('[data-testid="karte"]')
    const beobachter = new ResizeObserver(messen)
    beobachter.observe(el)
    if (panel) beobachter.observe(panel)
    /*
      Das Panel fährt beim Betreten des Steps 22 px von unten herein
      (`StepShell`, `initial={{ y: 22 }}`). Eine Verschiebung ist keine
      Größenänderung und meldet sich beim `ResizeObserver` nicht — ohne diese
      zweite Messung bliebe die Zeichnung um genau diese 22 px zu hoch.
    */
    const nachtreten = window.setTimeout(messen, 700)
    return () => {
      beobachter.disconnect()
      window.clearTimeout(nachtreten)
    }
  }, [messen])

  return { flaeche, rahmen }
}
