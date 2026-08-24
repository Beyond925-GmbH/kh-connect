import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { Begriff } from './Begriff'

/**
 * C3 — Eine Wand ist ein Sandwich. **Die geführte Hälfte des Lernpaars.**
 *
 * ⚠️ **Stub des Fundament-Agenten.** Gebaut wird der Screen vom Steps-Agenten
 * nach `khpl-tag-zimmerer.md` 6, C3:
 *
 * - Fünf Schichten, eine Karte je Schicht, in fester Reihenfolge, mit je einem
 *   Satz. Ein Tap, die Schicht legt sich auf. **Man kann nichts falsch machen** —
 *   genau wie M5 beim Dachdecker.
 * - Die Schichtenfolge innen → außen: Innenbekleidung · Installationsebene ·
 *   **Dampfbremse auf der warmen Innenseite** · Tragkonstruktion mit
 *   Gefachdämmung · diffusionsoffene Außenbeplankung · Fassade. `BELEGT`
 *   (`belege/zimmerer.md` 2).
 * - Das Prinzip in einem Satz: *innen dichter als außen.*
 * - ⚠️ Vorbehalt: Es gibt Bauweisen ohne separate Dampfbremsfolie (die
 *   OSB-Beplankung übernimmt die Funktion) und feuchtevariable Bahnen. Der
 *   Screen zeigt den Regelfall und sagt nicht „immer“.
 * - **Hier wird nichts abgefragt.** Die Abfrage kommt in C6, nach der Zäsur,
 *   und in anderer Form. Das ist das Lernpaar dieses Tages.
 * - `answers.c3` `{ gelegt: string[]; fertig: boolean }`
 */
export function C3() {
  return (
    <StepShell
      id="C3"
      interaktionOffen={false}
      fachtext={
        <p>
          Der Aufbau von innen nach außen: <Begriff id="beplankung">Beplankung</Begriff>,{' '}
          <Begriff id="dampfbremse">Dampfbremse</Begriff>, Ständer mit Dämmung,{' '}
          <Begriff id="holzfaserplatte">Holzfaserplatte</Begriff>, Fassade. Die
          Reihenfolge entscheidet, ob das Haus trocken bleibt.
        </p>
      }
      fuss={<StepFuss id="C3" />}
    />
  )
}
