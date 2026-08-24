import { Werkstueck } from '@/khpl/buehne/zerspanung/Werkstueck'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { Begriff } from './Begriff'

/**
 * Z2 — Alles muss sitzen, bevor irgendwas läuft.
 *
 * **Die geführte Hälfte des Lernpaars** (Vorbild M5): vier Handgriffe in
 * fester Reihenfolge, je eine Karte, ein Satz, ein Tap. Man kann nichts falsch
 * machen — der Punkt ist nicht die Reihenfolge, sondern **wie viel passiert,
 * bevor irgendetwas passiert** (khpl-tag-zerspanung.md §6 Z2).
 *
 * Der Höhepunkt ist der Werkstücknullpunkt. Verschiebt er sich um einen
 * Zehntel, sind alle 400 Teile um einen Zehntel falsch — der Moment, in dem
 * ein Besucher versteht, warum jemand dafür dreieinhalb Jahre lernt.
 *
 * Und der Morgen hat einen Auftakt, den niemand rät: die Maschine läuft erst
 * einmal warm. `INTERVIEW` — „Warmlaufen macht man jeden Morgen.“
 *
 * ⚠️ **Gerüst.** Die vier Karten fehlen; `answers.z2` ist im Store angelegt.
 * Die Bühne läuft bis auf Weiteres flach (`Werkstueck`) — ein Drehkörper in
 * 3D ist erlaubt, aber nicht Bedingung: „die Beweislast liegt bei 3D, nicht
 * bei 2D“ (§7).
 */
export function Z2() {
  return (
    <StepShell
      id="Z2"
      buehne={<Werkstueck zustand="rohling" />}
      fachtext={
        <p>
          <Begriff id="ruesten">Rüsten</Begriff>: <Begriff id="rohling">Rohling</Begriff>{' '}
          spannen, Werkzeuge bestücken, Werkzeuglängen vermessen, den{' '}
          <Begriff id="werkstuecknullpunkt">Werkstücknullpunkt</Begriff> setzen. Das ist
          der eigentliche Beruf. Die Maschine zerspant; der Mensch richtet ein.
        </p>
      }
      fuss={<StepFuss id="Z2" />}
    />
  )
}
