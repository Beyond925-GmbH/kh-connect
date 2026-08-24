import { StepFoto } from '@/khpl/buehne/Foto'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'

/**
 * Z7 — Und danach? · Der Karrierebereich.
 *
 * Struktur unverändert wie bei allen vier Tagen: drei gleichrangige Karten,
 * im Graphen `immerOffen`, damit sie nicht verschwinden, sobald eine geöffnet
 * wurde. Die Studium-Karte darf sich nicht hinter den anderen verstecken.
 *
 * **Die Inhalte sind eigene** (`karrierewege.ts` in diesem Verzeichnis): kein
 * Handwerksmeister, sondern Industriemeister Metall, Techniker
 * Maschinenbautechnik statt Holztechnik — und keine NRW-Meisterprämie, weil
 * sie für den IHK-Weg nicht gilt (khpl-tage.md §0c).
 *
 * ⚠️ **Gerüst.** Die drei Karten fehlen (Muster: `steps/dachdecker/M9.tsx`);
 * bis dahin bietet der Fuß die drei Wege als gewöhnliche Abstecher an. Für
 * diesen Screen gibt es zudem **kein Motiv im Bestand** — `StepFoto` rendert
 * dann nichts, und die Bühne bleibt leer (§10 führt für Z7 keinen Slot).
 */
export function Z7() {
  return (
    <StepShell
      id="Z7"
      interaktionOffen={false}
      buehne={<StepFoto id="Z7" />}
      fachtext={
        <p>
          Dreieinhalb Jahre Ausbildung, dann Facharbeiter. Danach hört es nicht auf — es
          fängt an. Drei Wege, alle offen.
        </p>
      }
      fuss={<StepFuss id="Z7" />}
    />
  )
}
