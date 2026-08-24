import type {
  BauteilId,
  BuehnenZustand,
  KnotenId,
  PruefungId,
} from '@/khpl/buehne/anlagenmechanik/kanon'

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
 * **Dieser Tag hat kein `three`** (Spec 7). Nicht als Verzicht, sondern als
 * Beweis, dass die Hülle nicht am 3D hängt. Diese Datei darf deshalb ganz
 * normal statisch importiert werden — sie hat keine lazy-Grenze und braucht
 * keine.
 *
 * **Bewegungsgefühl: Fluss.** Lange Easings, Verläufe, die an Pfaden
 * entlanglaufen (`stroke-dashoffset` oder ein Gradient entlang der Linie). Bei
 * `prefers-reduced-motion` stehen die Endzustände sofort, die Wanderung
 * entfällt.
 *
 * **Farbe:** ausschließlich `KALT` und `WARM` aus `kanon.ts`. Kein Token, kein
 * Eingriff in `src/index.css`, und keine gefüllte orange Fläche — die eine pro
 * Screen ist *Weiter* (khpl-tage.md 3).
 *
 * ---
 *
 * ⚠️ **Stub.** Diese Fassung hält die Schnittstelle und malt noch nichts. Sie
 * steht hier, damit der Steps-Agent und der Bühnen-Agent gegen dieselben Props
 * bauen können; die Zeichnungen sind die eigentliche Medienarbeit dieses Tages
 * (Spec 10) und kommen von der Bühnenseite. Wer sie ersetzt, ändert den Inhalt
 * dieser Datei — **nicht** die Props: an ihnen hängen die Steps.
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

export function Schnitt(props: SchnittProps) {
  return (
    <div
      className="size-full bg-kh-surface"
      data-testid="anlagen-buehne"
      data-szene={props.zustand.szene}
    />
  )
}
