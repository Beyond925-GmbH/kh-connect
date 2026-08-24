import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'

/**
 * C8 — Und danach? Der Karrierebereich.
 *
 * ⚠️ **Stub des Fundament-Agenten.** Gebaut wird der Screen vom Steps-Agenten
 * nach `khpl-tag-zimmerer.md` 6, C8: drei gleichrangige Karten aus
 * `karrierewege.ts`, alle drei `immerOffen` — **Studium darf sich nicht hinter
 * den anderen verstecken.**
 *
 * ⚠️ **Für diesen Screen liegt kein Motiv im Repo.** Die Spec führt unter
 * „vorhanden“ nur `b91`–`b93` für C8.**x** auf, kein Bild für die Übersicht
 * selbst (khpl-tag-zimmerer.md 10). Gemeldeter Medienbedarf.
 */
export function C8() {
  return (
    <StepShell
      id="C8"
      interaktionOffen={false}
      fachtext={<p>Nach der Ausbildung geht es weiter: Meister, Techniker, Studium.</p>}
      fuss={<StepFuss id="C8" />}
    />
  )
}
