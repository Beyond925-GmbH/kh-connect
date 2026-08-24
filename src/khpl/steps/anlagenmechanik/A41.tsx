import { StepFoto } from '@/khpl/buehne/Foto'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'

/**
 * A4.1 — Löten, pressen, stecken. Abstecher von A4, mündet in A5.
 *
 * ⚠️ **Stub.** Drei Arten, zwei Rohre zu verbinden — und wann was (Spec 4).
 *
 * ⚠️ Bühne: `gallery-2.webp` (Rohrverteiler). **Passt nur halb** (Spec 10) —
 * das Motiv zeigt das Ergebnis, nicht den Handgriff. Bis ein besseres Motiv
 * vorliegt, trägt es den Screen.
 */
export function A41() {
  return (
    <StepShell
      id="A4.1"
      titelZusatz="Abstecher"
      buehne={<StepFoto id="A4.1" />}
      fachtext={<p>Drei Arten, zwei Rohre zu verbinden — und wann was.</p>}
      fuss={<StepFuss id="A4.1" />}
    />
  )
}
