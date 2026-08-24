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
// -- Zerspanung ------------------------------------------------------------
import { Z1 } from '@/khpl/steps/zerspanung/Z1'
import { Z11 } from '@/khpl/steps/zerspanung/Z11'
import { Z2 } from '@/khpl/steps/zerspanung/Z2'
import { Z21 } from '@/khpl/steps/zerspanung/Z21'
import { Z3 } from '@/khpl/steps/zerspanung/Z3'
import { Z4 } from '@/khpl/steps/zerspanung/Z4'
import { Z5 } from '@/khpl/steps/zerspanung/Z5'
import { Z6 } from '@/khpl/steps/zerspanung/Z6'
import { Z7 } from '@/khpl/steps/zerspanung/Z7'
import { Z7Weg } from '@/khpl/steps/zerspanung/Z7Weg'
import { Z8 } from '@/khpl/steps/zerspanung/Z8'

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
 * **Geteilte Datei, vier Blöcke** (khpl-tage.md §6.1 V6 und §6.2). Alle vier
 * Schlüssel stehen schon da, die drei ungebauten als leeres Objekt. Jeder
 * Agent trägt **nur in seinem Block** ein und rührt die anderen drei nicht an;
 * die Step-Ids kollidieren dank der Präfixe aus V4 nicht (`M`/`B`, `C`, `Z`,
 * `A`). Die Import-Zeilen oben gehören zum jeweiligen Block.
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
  zimmerer: {},

  // ---------------------------------------------------------------------
  // Zerspanung — Ids `Z*` · Steps in `steps/zerspanung/`
  // ---------------------------------------------------------------------
  zerspanungsmechaniker: {
    Z1: () => <Z1 />,
    'Z1.1': () => <Z11 />,
    Z2: () => <Z2 />,
    'Z2.1': () => <Z21 />,
    Z3: () => <Z3 />,
    Z4: () => <Z4 />,
    Z5: () => <Z5 />,
    Z6: () => <Z6 />,
    Z7: () => <Z7 />,
    'Z7.1': () => <Z7Weg id="Z7.1" />,
    'Z7.2': () => <Z7Weg id="Z7.2" />,
    'Z7.3': () => <Z7Weg id="Z7.3" />,
    Z8: () => <Z8 />,
  },

  // ---------------------------------------------------------------------
  // Anlagenmechanik — Ids `A*` · Steps in `steps/anlagenmechanik/`
  // ---------------------------------------------------------------------
  anlagenmechaniker: {},
}
