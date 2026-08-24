import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'

/**
 * C1 — Der Stapel steht schon da. Einstieg, Suchen.
 *
 * ⚠️ **Stub des Fundament-Agenten.** Titel und der eine Satz stehen, damit der
 * Graph durchläuft und alles kompiliert. Gebaut wird der Screen vom
 * Steps-Agenten nach `khpl-tag-zimmerer.md` 6, C1:
 *
 * - Übung: **Suchen, nicht Sortieren.** Zwölf nummerierte Hölzer, die
 *   Stückliste verlangt Nr. 47. Zwei sehen fast gleich aus und unterscheiden
 *   sich nur in der Ausklinkung — nicht die Länge unterscheidet sie, sondern
 *   die Bearbeitung. Bewusst *nicht* die M1-Checkliste.
 * - Bühne: `Wandelement3D` mit `zustand="stapel"`, Draufsicht auf den
 *   Abbundtisch, Nummern als `Html`-Etiketten.
 * - Fehlerfall: das falsche Holz hebt sich an und legt sich zurück, mit einem
 *   Satz *warum*. Kein Fehlerzähler.
 * - Aha: die Maschine hat das heute Nacht geschnitten → führt auf C1.1.
 * - `answers.c1` `{ gefunden: boolean; versuche: number }`
 */
export function C1() {
  return (
    <StepShell
      id="C1"
      interaktionOffen={false}
      fachtext={
        <p>
          Die Abbundanlage hat über Nacht gearbeitet: jedes Holz ist auf Länge, jede
          Ausklinkung gefräst, jedes Teil nummeriert. Du baust nicht aus dem Kopf, du
          baust nach Stückliste.
        </p>
      }
      fuss={<StepFuss id="C1" />}
    />
  )
}
