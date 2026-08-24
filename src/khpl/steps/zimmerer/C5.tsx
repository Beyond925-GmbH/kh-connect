import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { Begriff } from './Begriff'

/**
 * C5 — Elf Uhr, das Element geht raus. **Die Zäsur.**
 *
 * ⚠️ **Stub des Fundament-Agenten.** Gebaut wird der Screen vom Steps-Agenten
 * nach `khpl-tag-zimmerer.md` 6, C5:
 *
 * - Drei Sätze, keine Aufgabe, danach die Fahrt. In der Vorfertigung ist die
 *   Pause der Transport: man sitzt, es passiert etwas, man tut nichts.
 * - **Etwas zu entdecken, nach dem Muster von M6**: drei Fragen, jede einen Tap
 *   von ihrer Antwort entfernt, jede Antwort ersetzt die vorige.
 *   – *Wie viel wiegt so ein Element?* 70–125 kg je m², ein Element von 8 × 3 m
 *     liegt bei **rund 1,5 bis 3 Tonnen**. `BELEGT` **als Spanne**, nie als
 *     Punktwert (`belege/zimmerer.md` 4).
 *   – *Warum steht es hochkant?* Transportmaße — und damit der Kran es direkt
 *     vom Anhänger an seinen Platz heben kann. `BELEGT`.
 *   – ⚠️ *Wie viele Elemente sind ein Haus?* **Gestrichen**, `NICHT BELEGBAR`.
 * - **Die ehrliche Kehrseite dieses Tages sitzt hier.** Beide Hälften des
 *   `INTERVIEW`-Zitats gehören auf den Screen, in dieser Reihenfolge: der
 *   Regentag, den man durchzieht, weil der Kran bestellt ist — und die
 *   Zufriedenheit am Abend. Der zweite Satz ohne den ersten ist Werbung, der
 *   erste ohne den zweiten Abschreckung.
 * - Dazu die Gegenrechnung: der halbe Beruf findet im Trockenen statt, gerade
 *   in den Wintermonaten.
 * - Bühne: das Gespann fährt **weg**, der Blick bleibt in der leeren Halle
 *   zurück (`abfahrt`). `prefers-reduced-motion`: sofort fort.
 * - ⚠️ **Gemeldet, nicht gebaut** (khpl-tage.md §6.2): Dieser Screen bräuchte
 *   wie M6 die dreifache Geduld im `KioskGuard`. Der Timer kennt heute genau
 *   einen Ausnahme-Step, und `shell/` ist eingefroren.
 * - `answers.c5` `{ gelesen: string[] }`
 */
export function C5() {
  return (
    <StepShell
      id="C5"
      interaktionOffen={false}
      fachtext={
        <p>
          Das Element wird aufgestellt, auf den{' '}
          <Begriff id="innenlader">Innenlader</Begriff> gefahren, gesichert. Danach die
          Fahrt.
        </p>
      }
      fuss={<StepFuss id="C5" />}
    />
  )
}
