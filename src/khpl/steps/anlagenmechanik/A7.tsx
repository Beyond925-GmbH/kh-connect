import { Schnitt } from '@/khpl/buehne/anlagenmechanik/Schnitt'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'

/**
 * A7 — Jetzt erklärst du es. **Zwei Dinge auf einem Screen: die Abfrage und
 * der Rückblick.** Das ist möglich, weil es dieselbe Sache ist — was man der
 * Kundin erzählt, ist genau das, was man heute getan hat.
 *
 * ⚠️ **Stub.** Was hier noch entsteht (Spec 6, A7):
 *
 * **Beat 1 — die Abfrage.** Drei Fragen, je drei Antwortmöglichkeiten, und die
 * Antworten sind nicht *richtig* und *falsch*, sondern **verständlich** und
 * **nicht verständlich**:
 *
 * - „Und das reicht wirklich, wenn es draußen friert?"
 * - „Warum ist das Ding so groß?"
 * - „Was mache ich, wenn da mal was blinkt?"
 *
 * Die Fachantwort ist korrekt und hilft nicht. Die gute Antwort ist beides.
 * Feedback: die Kundin nickt oder schaut ratlos — **kein Häkchen, keine Note**,
 * eine Reaktion. Wer daneben liegt, sieht die bessere Antwort und darf sie noch
 * einmal sagen.
 *
 * **Beat 2 — Rückblick statt Punkte**, zwei Fassungen je Eintrag (Spec 6, A7,
 * `VALIDIERT`): A1 · A2 · A3 · A4 · A6, jeweils „gelöst" und „nur gesehen".
 * Beides wahr, keines ein Tadel.
 *
 * **Das ist die zweite Hälfte des Lernpaars zu A2** und die stärkste Umkehrung
 * der vier Tage: sieben Screens lang hat die App erklärt, hier erklärt der
 * Besucher.
 */
export function A7() {
  return (
    <StepShell
      id="A7"
      buehne={<Schnitt zustand={{ szene: 'uebergabe', pfad: [] }} />}
      fachtext={<p>Die Bauherrin des zweiten Hauses steht im Keller und fragt.</p>}
      fuss={<StepFuss id="A7" />}
    />
  )
}
