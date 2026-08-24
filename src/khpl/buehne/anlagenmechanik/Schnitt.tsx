import type {
  BauteilId,
  BuehnenZustand,
  KnotenId,
  PruefungId,
} from '@/khpl/buehne/anlagenmechanik/kanon'
import { Anlage } from './Anlage'
import { Haus } from './Haus'

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
 * 3D-Bühnen, nur ohne Messung, weil eine Zeichnung keine Kamera nachführen
 * muss.
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
  return (
    <div className="size-full" data-testid="anlagen-buehne" data-szene={zustand.szene}>
      <div className="absolute inset-x-3 top-[76px] bottom-[32%] landscape:inset-y-[7%] landscape:right-[3%] landscape:left-[30%]">
        {zustand.szene === 'anlage' ? (
          <Anlage
            geprueft={zustand.geprueft}
            laeuft={zustand.laeuft}
            ursache={zustand.ursache}
            geloest={zustand.geloest}
            onPruefpunkt={onPruefpunkt}
          />
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
