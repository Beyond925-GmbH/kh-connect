import { StepFoto } from '@/khpl/buehne/Foto'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'

/**
 * A8 — Und danach? Der Karrierebereich, Struktur unverändert wie bei allen vier
 * Tagen (Spec 6, A8).
 *
 * ⚠️ **Stub.** Was hier noch entsteht: drei antippbare Karten aus
 * `karrierewege.ts` (Muster M9), alle drei jederzeit erreichbar — A8.1–A8.3
 * sind im Graphen `immerOffen`. Der Fuß zeigt hier **kein** Abstecher-Angebot:
 * die Karten *sind* das Angebot.
 *
 * ⚠️ **Die Zahlen sind die dieses Berufs und keine geerbten.** Der Bestand in
 * `steps/dachdecker/karrierewege.ts` führt Zimmerer-Zahlen; für SHK gelten
 * andere Kosten, eine andere Technikerfachrichtung und ein anderer
 * Studien-Anker (khpl-tage.md 0c, `belege/ausbildung-karriere.md`).
 *
 * ⚠️ **Kein Motiv vergeben** (Spec 10): die Medienliste dieses Tages nennt für
 * A8 selbst kein Foto, nur für die drei Karten. Die Bühne bleibt vorerst leer.
 */
export function A8() {
  return (
    <StepShell
      id="A8"
      interaktionOffen={false}
      buehne={<StepFoto id="A8" />}
      fachtext={
        // Dreieinhalb Jahre, `BELEGT` (`belege/ausbildung-karriere.md` 2:
        // SHKAMAusbV, 42 Monate). Nicht drei wie beim Dachdecker.
        <p>
          Dreieinhalb Jahre Ausbildung, dann Geselle. Danach hört es nicht auf — es fängt
          an. Drei Wege, alle offen.
        </p>
      }
      fuss={<StepFuss id="A8" />}
    />
  )
}
