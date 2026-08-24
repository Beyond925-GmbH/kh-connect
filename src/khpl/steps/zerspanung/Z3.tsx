import { Werkstueck } from '@/khpl/buehne/zerspanung/Werkstueck'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { Begriff } from './Begriff'

/**
 * Z3 — Zeile für Zeile. **Der Fehler mit Preis.**
 *
 * **Erst die Freude, dann der Fehler — in dieser Reihenfolge**
 * (khpl-tag-zerspanung.md §6 Z3). Der Besucher tippt sich Zeile für Zeile
 * durch das Programm, und mit jeder Zeile zeichnet sich ein Stück Kontur: aus
 * Text wird eine Form, und man hat sie selbst entstehen lassen. Erst wenn die
 * Kontur steht, wird sie zur Aufgabe.
 *
 * Die Reihenfolge ist nicht Geschmack. Die Interviews sagen einhellig, dass
 * das Programmieren der **beliebteste** Teil des Berufs ist — ein Screen, auf
 * dem es primär als Fehlerquelle vorkommt, verkauft den Beruf unter Wert.
 *
 * Wer blind bis ans Ende fährt und Start drückt, fährt das Werkzeug in die
 * Spannbacke. Der Preis: Werkzeug und Spannung — und danach muss alles neu
 * vermessen werden. Genau deshalb wird an einer CNC nie ohne Simulation
 * gestartet.
 *
 * ⚠️ **Der Crash ist der Extremfall, nicht der Alltag.** Kein Befragter nennt
 * ihn; genannt werden nicht haltbare Toleranzen, Termindruck und ein defekter
 * Späneförderer. Der Screen darf den Crash zeigen, weil er die Lektion trägt —
 * der Fachtext darf ihn nicht als Normalfall erzählen.
 *
 * ⚠️ **Gerüst.** Codeliste, Werkzeugweg und Fehlersuche fehlen; Programm,
 * Fehlerzeile und Steuerungsdialekt stehen in `buehne/zerspanung/kanon.ts`,
 * `answers.z3` im Store.
 */
export function Z3() {
  return (
    <StepShell
      id="Z3"
      buehne={<Werkstueck zustand="werkzeugweg" />}
      fachtext={
        <p>
          Das Programm sagt der Maschine, wohin das Werkzeug fährt. Der Zerspaner schreibt
          es nicht immer selbst — aber er muss es <em>lesen</em> können, bevor er Start
          drückt. Jede Zeile ist ein Weg: ein Maß, ein{' '}
          <Begriff id="vorschub">Vorschub</Begriff>, eine{' '}
          <Begriff id="drehzahl">Drehzahl</Begriff>.
        </p>
      }
      fuss={<StepFuss id="Z3" />}
    />
  )
}
