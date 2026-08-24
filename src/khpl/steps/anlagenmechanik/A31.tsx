import { StepFoto } from '@/khpl/buehne/Foto'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'

/**
 * A3.1 — Wärmepumpe gegen Ölkessel. Abstecher von A3, mündet in A4.
 *
 * ⚠️ **Stub.** Die Rechnung ausführlicher: Anschaffung, Betrieb, Förderung,
 * Amortisation (Spec 6, A3.1).
 *
 * ⚠️ **Dieser Abstecher nennt keine Fördersätze.** Die KfW-Konditionen haben
 * sich am 21.07.2026 geändert, die nächste Absenkung ist für den 01.02.2027
 * angekündigt — und dieses Gerät läuft an vielen Tagen über Monate. Die Spec
 * entscheidet sich ausdrücklich für Weg 1 (Spec 6, A3.1): der Screen erklärt,
 * *dass* gefördert wird und dass die Sätze sich ändern, und sagt, wo man
 * nachsieht. Ein Vierzehnjähriger trifft keine Förderentscheidung, und ein
 * Kiosk mit veralteten Fördersätzen schadet der Kreishandwerkerschaft mehr, als
 * der Screen nützt.
 *
 * Bühne: `gallery-1.webp` — Wärmepumpe im Garten. Sie löst nebenbei den
 * schwachen `draussen`-Wert dieses Berufs ein.
 */
export function A31() {
  return (
    <StepShell
      id="A3.1"
      titelZusatz="Abstecher"
      buehne={<StepFoto id="A3.1" />}
      fachtext={<p>Zwei Anlagen, dasselbe Haus, eine Rechnung.</p>}
      fuss={<StepFuss id="A3.1" />}
    />
  )
}
