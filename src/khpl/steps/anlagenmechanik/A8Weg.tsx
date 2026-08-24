import type { StepId } from '@/khpl/flow/steps'
import { StepFoto } from '@/khpl/buehne/Foto'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { karriereweg } from './karrierewege'

/**
 * A8.1–A8.3 — die drei Karrierewege als Abstecher. Eine Komponente für alle
 * drei, wie `B9` beim Dachdecker: dieselbe Form, anderer Inhalt.
 *
 * ⚠️ **Stub.** Was hier noch entsteht: die Abschnitte des Weges als Frage und
 * Antwort, und der Vermerk im Store, welcher Weg zuletzt geöffnet wurde — aus
 * ihm speist sich der personalisierte Aufhänger auf A9.
 *
 * ⚠️ **Dafür fehlt eine Naht in der Hülle** (gemeldet, khpl-tage.md 6.2):
 * `store/fortschritt.ts` merkt sich angesehene Karrierewege in
 * `merkeKarriereweg`, und diese Funktion schreibt **fest verdrahtet** nach
 * `answers.m9` — einem Dachdecker-Schlüssel. Zur Laufzeit kollidiert nichts
 * (der Fortschritt liegt je Beruf), aber V5 verlangt disjunkte Schlüssel je
 * Beruf, und `a8` ist der dieses Tages. Bis die Funktion einen Schlüssel
 * entgegennimmt, vermerkt dieser Screen nichts.
 */
export function A8Weg({ id }: { id: StepId }) {
  const weg = karriereweg(id)

  return (
    <StepShell
      id={id}
      titelZusatz="Abstecher"
      buehne={<StepFoto id={id} />}
      fachtext={<p>{weg?.koeder}</p>}
      fuss={<StepFuss id={id} />}
    />
  )
}
