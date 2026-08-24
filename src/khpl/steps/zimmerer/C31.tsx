import { StepFoto } from '@/khpl/buehne/Foto'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'

/**
 * C3.1 — Holz ist der einzige Baustoff, der… Abstecher von C3, mündet in C4.
 *
 * ⚠️ **Stub des Fundament-Agenten.** Gebaut wird der Screen vom Steps-Agenten
 * nach `khpl-tag-zimmerer.md` 6, C3.1:
 *
 * - **Eine Korrektur, keine Werbung.** Der Screen sagt zuerst die Halbwahrheit
 *   des Miro-Boards, streicht sie sichtbar durch und nennt die anderen
 *   nachwachsenden Baustoffe: Stroh, Hanf, Flachs, Schilf, Kork, Bambus.
 *   **Kein Fehler des Besuchers** — eine Korrektur an der App, vor seinen Augen.
 * - Richtig ist „einer der besten CO₂-Speicher“, falsch „der einzige
 *   nachwachsende Baustoff“. `BELEGT` (`belege/zimmerer.md` 3).
 * - ⚠️ **Zahlen nur als Spanne und nie ausmultipliziert**: rund 1 t CO₂ je m³
 *   verbautem Holz (real 0,6–1,7 t), 30 bis 70 m³ in einem Einfamilienhaus.
 *   „Ein Holzhaus speichert 50 Tonnen“ wäre eine Zahl aus zwei Spannen und
 *   täuschte eine Genauigkeit vor, die es nicht gibt.
 * - Bühne: Foto. ⚠️ **Für diesen Screen liegt kein Motiv im Repo**
 *   (khpl-tag-zimmerer.md 10) — `StepFoto` rendert deshalb nichts.
 */
export function C31() {
  return (
    <StepShell
      id="C3.1"
      titelZusatz="Abstecher"
      interaktionOffen={false}
      buehne={<StepFoto id="C3.1" />}
      fachtext={
        <p>
          Holz bindet CO₂, solange es verbaut ist — ein Haus aus Holz ist auf Jahrzehnte
          ein Lager.
        </p>
      }
      fuss={<StepFuss id="C3.1" />}
    />
  )
}
