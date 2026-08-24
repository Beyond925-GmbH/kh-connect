import { Schnitt } from '@/khpl/buehne/anlagenmechanik/Schnitt'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'

/**
 * A2 — Vierzig Jahre Keller. Die **geführte Hälfte des Lernpaars**: was dieser
 * Screen aufbaut, fragt A7 ab.
 *
 * ⚠️ **Stub.** Was hier noch entsteht (Spec 6, A2):
 *
 * - Sechs Bauteile im Keller, jedes antippbar, jedes mit einem Satz: **was es
 *   tut** und **ob es bleibt**. Kein Falsch, kein Richtig.
 * - **Der Screen beginnt mit einem Handgriff, den keiner der anderen drei Tage
 *   hat: dem Schutz einer fremden Wohnung.** Bevor irgendetwas ausgebaut wird,
 *   werden empfindliche Sachen abgeklebt und mit Vlies geschützt (`INTERVIEW`).
 *   Zwei Sätze und eine kleine Handlung — die Vliesbahn ausrollen.
 * - Aha: Der Kessel läuft noch. Er ist nicht kaputt — er ist vierzig Jahre alt
 *   und verbrennt Öl. Das ist der ganze Grund.
 *
 * Die sechs Bauteile stehen als `BAUTEILE` in `buehne/anlagenmechanik/kanon.ts`;
 * die Sätze dazu gehören hierher, nicht in die Zeichnung.
 */
export function A2() {
  return (
    <StepShell
      id="A2"
      buehne={
        <Schnitt
          zustand={{ szene: 'keller', vlies: false, angetippt: [], offen: null }}
        />
      }
      fachtext={
        <p>
          Der zweite Auftrag beginnt mit Hinsehen. Vieles davon bleibt, vieles fliegt
          raus, und man muss wissen, was was tut.
        </p>
      }
      fuss={<StepFuss id="A2" />}
    />
  )
}
