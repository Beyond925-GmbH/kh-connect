import { StepFoto } from '@/khpl/buehne/Foto'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'

/**
 * A5 — Halb eins, im Transporter. **Die Zäsur** (khpl-tage.md 1, Mechanismus 4):
 * zwischen A4 (führt vor) und A6/A7 (fragt ab) muss Luft sein, sonst ist A7
 * eine Ablesung und keine Erinnerungsleistung.
 *
 * Vier Pausen, vier Bilder — diese hier ist die einzige, in der man **sitzt und
 * nichts sieht als Armaturenbrett und Straße**. Für einen Beruf, der einen
 * erheblichen Teil des Tages im Auto verbringt, ist das die ehrlichste.
 *
 * ⚠️ **Stub.** Was hier noch entsteht (Spec 6, A5):
 *
 * - Drei Fragen, ein Tap, die Antwort ersetzt die vorige (Muster M6). Eine
 *   davon: *Warum heißt der Beruf so kompliziert?* — Sanitär, Heizung, Klima.
 *   Eine zweite: *Was machst du eigentlich morgen?* — die drei Sparten des
 *   Betriebs, Kundendienst, Montage, Sanierung (`INTERVIEW`).
 *   ⚠️ „Wie viele Adressen sind ein normaler Tag?" ist **`NICHT BELEGBAR`**
 *   (Spec 11) — nur weich formulieren oder ersetzen.
 * - **Die ehrliche Kehrseite dieses Tages sitzt hier** (khpl-tage.md 1,
 *   Mechanismus 8): ungeduldige Kunden. In drei von vier Gesprächen dieselbe
 *   Antwort, und die einzige, die dieser Beruf überhaupt nennt.
 * - Auf dem Armaturenbrett liegt ein iPad. Das ist keine Requisite, sondern
 *   der Arbeitsalltag — und löst `technik: 0.85` nebenbei mit ein.
 *
 * **Dreifache Idle-Geduld** wie M6 — das ist eine **Änderung an der Hülle**
 * (`KioskGuard`) und gehört gemeldet, nicht gebaut (khpl-tage.md 6.2).
 *
 * ⚠️ Bühne: Foto oder eine ruhige Zeichnung mit warmem Licht durch die
 * Windschutzscheibe — **die erste Wärme des Tages**. Ein Motiv fehlt (Spec 10),
 * deshalb bleibt die Bühne vorerst leer.
 */
export function A5() {
  return (
    <StepShell
      id="A5"
      interaktionOffen={false}
      buehne={<StepFoto id="A5" />}
      fachtext={
        <p>Zwischen zwei Adressen, auf dem Beifahrersitz, Brote auf dem Schoß.</p>
      }
      fuss={<StepFuss id="A5" />}
    />
  )
}
