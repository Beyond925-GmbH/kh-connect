import { Werkstueck } from '@/khpl/buehne/zerspanung/Werkstueck'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { Begriff } from './Begriff'
import { MESSWERTE } from '@/khpl/buehne/zerspanung/kanon'

/**
 * Z5 — Und, passt es? **Der Signaturscreen.**
 *
 * Hier zahlt sich Z1 aus, vier Minuten später und an einem Teil, das der
 * Besucher selbst hat laufen lassen. Das ist das Gegenstück zu M7: dieselbe
 * Kenntnis, aus dem Kopf, ohne Ansage — und ausdrücklich **keine**
 * Reihenfolge-Übung, denn zwei Tage dürfen nicht dieselbe Hauptübung haben
 * (khpl-tage.md §4).
 *
 * **Zwei Beats** (khpl-tag-zerspanung.md §6 Z5):
 *
 *  1. **Messen.** Die Mikrometerschraube zudrehen, den Wert lesen, urteilen:
 *     Gut · Nacharbeiten · Ausschuss. Die drei Knöpfe sind kein Entwurf,
 *     sondern die Formulierung eines Azubis. Falsch geantwortet gibt keinen
 *     Tadel: das Toleranzfeld fährt ein und legt sich über den Messwert.
 *  2. **Korrigieren.** Beim zweiten Teil steht 20,015 da — zu dick. Der
 *     Werkzeugkorrektor um einen Hundertstel verstellt, noch eins laufen
 *     lassen, jetzt passt es.
 *
 * Die Asymmetrie ist die Lektion: zu groß ist ein Problem, zu klein ist ein
 * Verlust. Deshalb fährt man sich in Serie von oben an das Maß heran — und
 * deshalb wurde in Z2 so lange gerüstet und in Z3 so vorsichtig gestartet.
 *
 * ⚠️ **Gerüst.** Die drei Werte stehen in `buehne/zerspanung/kanon.ts`, der
 * erste Durchgang ist `19,987`. `answers.z5` ist im Store angelegt.
 */
export function Z5() {
  return (
    <StepShell
      id="Z5"
      buehne={<Werkstueck zustand="messung" messwert={MESSWERTE[0].wert} />}
      fachtext={
        <p>
          Das Teil liegt in der{' '}
          <Begriff id="buegelmessschraube">Mikrometerschraube</Begriff>. Ein Wert steht da
          — und jetzt die Frage, auf die es in diesem Beruf hinausläuft: gut, nacharbeiten
          oder <Begriff id="ausschuss">Ausschuss</Begriff>?
        </p>
      }
      fuss={<StepFuss id="Z5" />}
    />
  )
}
