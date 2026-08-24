import { StepFoto } from '@/khpl/buehne/Foto'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'

/**
 * A1.1 — Wer fährt eigentlich nachts? Abstecher von A1, mündet in A2.
 *
 * **Warum der Abstecher da ist:** ein Vierzehnjähriger, der später erfährt,
 * dass zum Beruf Bereitschaft gehört, fühlt sich verkauft. Ein Screen, der es
 * von selbst sagt, ist glaubwürdiger als zehn, die es weglassen.
 *
 * ⚠️ **Es gibt keinen Bundestarif für Rufbereitschaft** (Spec 6 und 11),
 * `TEILWEISE BELEGT`. Belegt ist ein Beispiel aus Niedersachsen; **die
 * NRW-Sätze fehlen, und dieser Kiosk steht in NRW.** Der Abstecher nennt
 * deshalb **keinen Betrag**, sondern nur die Sache: dass es Bereitschaft gibt,
 * dass sie reihum geht und dass sie zusätzlich vergütet wird. Wer die Zahl
 * will, fragt den Fachverband SHK NRW.
 *
 * ⚠️ **Stub.** Bühne: Foto — es fehlt noch eins (Spec 10), deshalb bleibt die
 * Bühne vorerst leer.
 */
export function A11() {
  return (
    <StepShell
      id="A1.1"
      titelZusatz="Abstecher"
      buehne={<StepFoto id="A1.1" />}
      fachtext={
        <p>
          Notdienst, Bereitschaft, Wochenende. Ehrlich: es gehört dazu, es ist nicht jeden
          Tag, und es wird bezahlt.
        </p>
      }
      fuss={<StepFuss id="A1.1" />}
    />
  )
}
