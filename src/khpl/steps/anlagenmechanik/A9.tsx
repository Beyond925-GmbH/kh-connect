import { StepFoto } from '@/khpl/buehne/Foto'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'

/**
 * A9 — Dein nächster Schritt. Der CTA-Screen, unverändert wie bei allen vier
 * Tagen (Spec 6, A9): vollflächig orange, „Sprich jetzt mit … am Stand" und
 * das Angebot „Noch einen Beruf" (khpl-tage.md 3).
 *
 * ⚠️ **Stub.** Was hier noch entsteht: der personalisierte Aufhänger aus dem
 * zuletzt geöffneten Karriereweg (`karrierewege.ts`, `aufhaenger`, sonst
 * `AUFHAENGER_OHNE`), der Name vom Stand aus `public/stand.json` und der Weg
 * zurück in die Berufsliste. Muster: M10.
 *
 * ⚠️ **Ein Befund für die Hülle, nicht für diesen Tag** (khpl-tage.md 0):
 * der meistgegebene Rat an Neulinge ist quer durch alle 25 Gespräche „mach ein
 * Praktikum" — konkreter als „Sprich jetzt mit … am Stand". Und für diesen
 * Beruf kommt ein zweites Argument dazu, das die Befragten selbst nennen: man
 * kann den Beruf gut gebrauchen, wenn man später selbst ein Haus hat.
 */
export function A9() {
  return (
    <StepShell
      id="A9"
      buehne={<StepFoto id="A9" />}
      fachtext={<p>Sprich jetzt mit uns am Stand.</p>}
      fuss={<StepFuss id="A9" />}
    />
  )
}
