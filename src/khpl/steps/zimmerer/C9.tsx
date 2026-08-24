import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'

/**
 * C9 — Dein nächster Schritt. Der CTA.
 *
 * ⚠️ **Stub des Fundament-Agenten.** Gebaut wird der Screen vom Steps-Agenten
 * nach `khpl-tag-zimmerer.md` 6, C9 — unverändert nach dem Muster des
 * gebauten Tages: vollflächig orange, Logo `aufHell`, „Sprich jetzt mit … am
 * Stand“ aus `public/stand.json`, der personalisierte Aufhänger aus dem zuletzt
 * in C8 geöffneten Weg (`answers.c8`, Fallback `AUFHAENGER_OHNE`), daneben
 * „Noch einen Beruf“ und „Von vorn“.
 *
 * ⚠️ **Genau ein orange gefülltes Feld pro Screen** — hier ist es die ganze
 * Fläche. Auf orangem Grund ist `text-[#0E0D0B]` die einzige erlaubte
 * Ausnahme von der Farbregel (khpl-tage.md 3).
 */
export function C9() {
  return (
    <StepShell
      id="C9"
      interaktionOffen={false}
      fachtext={<p>Sprich jetzt mit uns am Stand.</p>}
      fuss={<StepFuss id="C9" />}
    />
  )
}
