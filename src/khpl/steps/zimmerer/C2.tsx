import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'

/**
 * C2 — Zweiundsechzig Komma fünf. **Der eine Schätzmoment dieses Tages**
 * (khpl-tage.md 1, Mechanismus 3).
 *
 * ⚠️ **Stub des Fundament-Agenten.** Gebaut wird der Screen vom Steps-Agenten
 * nach `khpl-tag-zimmerer.md` 6, C2:
 *
 * 1. Das leere Rähmwerk liegt da, ein Ständer steht drin.
 * 2. Frage: *Wie weit steht der nächste?* Ein Regler, grob 30–120 cm
 *    (`ACHSMASS_MIN_CM`/`ACHSMASS_MAX_CM` in `buehne/zimmerer/kanon.ts`).
 * 3. Auflösung: **62,5 cm** — und der Screen zeigt, **warum**: eine Bauplatte
 *    von 125 cm Breite legt sich über das Feld, ihre Kante trifft die Mitte des
 *    nächsten Ständers. Die restlichen Ständer fliegen ins Raster ein.
 *
 * ⚠️ **Die Begründung ist die Korrektur.** Das Raster kommt vom **Plattenformat**,
 * nicht von der Dämmstoffbreite — die Dämmung richtet sich nach dem Raster, nicht
 * umgekehrt (`belege/zimmerer.md` 1). Beim Auflösen legt sich deshalb eine
 * **Bauplatte** auf, keine Dämmmatte.
 *
 * ⚠️ 62,5 cm ist **kein genormtes Pflichtmaß**: 83,3 cm und 125 cm kommen
 * ebenfalls vor, bei Öffnungen gibt die Statik Sondermaße vor. Der Screen sagt
 * „meist“, nicht „immer“.
 *
 * Kein Fehlerfall — geschätzt wird, nicht gewusst.
 * `answers.c2` `{ schaetzung: number; aufgeloest: boolean }`
 */
export function C2() {
  return (
    <StepShell
      id="C2"
      interaktionOffen={false}
      fachtext={
        <p>
          Die Ständer stehen nicht nach Gefühl, sondern im Raster — und das Raster kommt
          nicht vom Zimmerer.
        </p>
      }
      fuss={<StepFuss id="C2" />}
    />
  )
}
