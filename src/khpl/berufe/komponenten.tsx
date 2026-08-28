import type { StepId } from '@/khpl/flow/steps'
import type { BerufId } from './typen'
import { M1 } from '@/khpl/steps/dachdecker/M1'
import { M2 } from '@/khpl/steps/dachdecker/M2'
import { M3 } from '@/khpl/steps/dachdecker/M3'
import { B31 } from '@/khpl/steps/dachdecker/B31'
import { B32 } from '@/khpl/steps/dachdecker/B32'
import { M4 } from '@/khpl/steps/dachdecker/M4'
import { B41 } from '@/khpl/steps/dachdecker/B41'
import { M5 } from '@/khpl/steps/dachdecker/M5'
import { B51 } from '@/khpl/steps/dachdecker/B51'
import { M6 } from '@/khpl/steps/dachdecker/M6'
import { M7 } from '@/khpl/steps/dachdecker/M7'
import { M8 } from '@/khpl/steps/dachdecker/M8'
import { M9 } from '@/khpl/steps/dachdecker/M9'
import { B9 } from '@/khpl/steps/dachdecker/B9'
import { M10 } from '@/khpl/steps/dachdecker/M10'
import { A1 } from '@/khpl/steps/anlagenmechanik/A1'
import { A11 } from '@/khpl/steps/anlagenmechanik/A11'
import { A2 } from '@/khpl/steps/anlagenmechanik/A2'
import { A3 } from '@/khpl/steps/anlagenmechanik/A3'
import { A31 } from '@/khpl/steps/anlagenmechanik/A31'
import { A4 } from '@/khpl/steps/anlagenmechanik/A4'
import { A41 } from '@/khpl/steps/anlagenmechanik/A41'
import { A5 } from '@/khpl/steps/anlagenmechanik/A5'
import { A6 } from '@/khpl/steps/anlagenmechanik/A6'
import { A7 } from '@/khpl/steps/anlagenmechanik/A7'
import { A8 } from '@/khpl/steps/anlagenmechanik/A8'
import { A8Weg } from '@/khpl/steps/anlagenmechanik/A8Weg'
import { A9 } from '@/khpl/steps/anlagenmechanik/A9'
import { C1 } from '@/khpl/steps/zimmerer/C1'
import { C11 } from '@/khpl/steps/zimmerer/C11'
import { C2 } from '@/khpl/steps/zimmerer/C2'
import { C3 } from '@/khpl/steps/zimmerer/C3'
import { C31 } from '@/khpl/steps/zimmerer/C31'
import { C4 } from '@/khpl/steps/zimmerer/C4'
import { C5 } from '@/khpl/steps/zimmerer/C5'
import { C51 } from '@/khpl/steps/zimmerer/C51'
import { C6 } from '@/khpl/steps/zimmerer/C6'
import { C7 } from '@/khpl/steps/zimmerer/C7'
import { C8 } from '@/khpl/steps/zimmerer/C8'
import { C8x } from '@/khpl/steps/zimmerer/C8x'
import { C9 } from '@/khpl/steps/zimmerer/C9'
import { Z1 } from '@/khpl/steps/zerspanung/Z1'
import { Z11 } from '@/khpl/steps/zerspanung/Z11'
import { Z2 } from '@/khpl/steps/zerspanung/Z2'
import { Z3 } from '@/khpl/steps/zerspanung/Z3'
import { Z31 } from '@/khpl/steps/zerspanung/Z31'
import { Z4 } from '@/khpl/steps/zerspanung/Z4'
import { Z5 } from '@/khpl/steps/zerspanung/Z5'
import { Z6 } from '@/khpl/steps/zerspanung/Z6'
import { Z61 } from '@/khpl/steps/zerspanung/Z61'
import { Z7 } from '@/khpl/steps/zerspanung/Z7'
import { Z8 } from '@/khpl/steps/zerspanung/Z8'
import { Z8Weg } from '@/khpl/steps/zerspanung/Z8Weg'
import { Z9 } from '@/khpl/steps/zerspanung/Z9'

/**
 * Welcher Step welches Modul rendert — je Beruf.
 *
 * **Warum das nicht in `berufe/<name>.ts` steht.** Ein Step-Modul liest den
 * Store, der Store liest die Registry, die Registry lädt die Berufe. Läge die
 * Komponentenliste im Beruf, schlösse sich dieser Ring, und er schlösse sich
 * ausgerechnet während der Modulauswertung — der Store würde `beruf()` rufen,
 * bevor die Registry fertig gebaut ist. Die Zuordnung ist außerdem der einzige
 * Teil eines Berufs, der kein Datum ist, sondern Code.
 *
 * Ein Beruf, dessen Stationen aus wiederverwendbaren Übungen bestehen, taucht
 * hier gar nicht auf: was fehlt, rendert der `Platzhalter`.
 *
 * **Geteilte Datei, ein Block je gebautem Beruf** (khpl-tage.md §6.1 V6 und
 * §6.2). Jeder Agent trägt **nur in seinem Block** ein und rührt die anderen
 * nicht an; die Step-Ids kollidieren dank der Präfixe aus V4 nicht (`M`/`B`,
 * `C`, `A`, `Z`). Die Import-Zeilen oben gehören zum jeweiligen Block.
 */
export const BERUF_KOMPONENTEN: Partial<
  Record<BerufId, Readonly<Record<StepId, () => React.ReactNode>>>
> = {
  // ---------------------------------------------------------------------
  // Dachdecker — Ids `M*` / `B*` · Steps in `steps/dachdecker/`
  // ---------------------------------------------------------------------
  dachdecker: {
    M1: () => <M1 />,
    M2: () => <M2 />,
    M3: () => <M3 />,
    'B3.1': () => <B31 />,
    'B3.2': () => <B32 />,
    M4: () => <M4 />,
    'B4.1': () => <B41 />,
    M5: () => <M5 />,
    'B5.1': () => <B51 />,
    M6: () => <M6 />,
    M7: () => <M7 />,
    M8: () => <M8 />,
    M9: () => <M9 />,
    'B9.1': () => <B9 id="B9.1" />,
    'B9.2': () => <B9 id="B9.2" />,
    'B9.3': () => <B9 id="B9.3" />,
    M10: () => <M10 />,
  },

  // ---------------------------------------------------------------------
  // Zimmerer — Ids `C*` · Steps in `steps/zimmerer/`
  // ---------------------------------------------------------------------
  zimmerer: {
    C1: () => <C1 />,
    'C1.1': () => <C11 />,
    C2: () => <C2 />,
    C3: () => <C3 />,
    'C3.1': () => <C31 />,
    C4: () => <C4 />,
    C5: () => <C5 />,
    'C5.1': () => <C51 />,
    C6: () => <C6 />,
    C7: () => <C7 />,
    C8: () => <C8 />,
    'C8.1': () => <C8x id="C8.1" />,
    'C8.2': () => <C8x id="C8.2" />,
    'C8.3': () => <C8x id="C8.3" />,
    C9: () => <C9 />,
  },

  // ---------------------------------------------------------------------
  // Zerspanung — Ids `Z*` · Steps in `steps/zerspanung/`
  // ---------------------------------------------------------------------
  zerspanungsmechaniker: {
    Z1: () => <Z1 />,
    'Z1.1': () => <Z11 />,
    Z2: () => <Z2 />,
    Z3: () => <Z3 />,
    'Z3.1': () => <Z31 />,
    Z4: () => <Z4 />,
    Z5: () => <Z5 />,
    Z6: () => <Z6 />,
    'Z6.1': () => <Z61 />,
    Z7: () => <Z7 />,
    Z8: () => <Z8 />,
    // Drei Karrierewege, eine Komponente — wie `B9` und `A8Weg`.
    'Z8.1': () => <Z8Weg id="Z8.1" />,
    'Z8.2': () => <Z8Weg id="Z8.2" />,
    'Z8.3': () => <Z8Weg id="Z8.3" />,
    Z9: () => <Z9 />,
  },

  // ---------------------------------------------------------------------
  // Anlagenmechanik — Ids `A*` · Steps in `steps/anlagenmechanik/`
  // ---------------------------------------------------------------------
  anlagenmechaniker: {
    A1: () => <A1 />,
    'A1.1': () => <A11 />,
    A2: () => <A2 />,
    A3: () => <A3 />,
    'A3.1': () => <A31 />,
    A4: () => <A4 />,
    'A4.1': () => <A41 />,
    A5: () => <A5 />,
    A6: () => <A6 />,
    A7: () => <A7 />,
    A8: () => <A8 />,
    // Drei Karrierewege, eine Komponente — wie `B9` beim Dachdecker.
    'A8.1': () => <A8Weg id="A8.1" />,
    'A8.2': () => <A8Weg id="A8.2" />,
    'A8.3': () => <A8Weg id="A8.3" />,
    A9: () => <A9 />,
  },
}
