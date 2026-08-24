import type { StepId } from '@/khpl/flow/steps'
import type { BerufId } from './typen'
import { M1 } from '@/khpl/steps/M1'
import { M2 } from '@/khpl/steps/M2'
import { M3 } from '@/khpl/steps/M3'
import { B31 } from '@/khpl/steps/B31'
import { B32 } from '@/khpl/steps/B32'
import { M4 } from '@/khpl/steps/M4'
import { B41 } from '@/khpl/steps/B41'
import { M5 } from '@/khpl/steps/M5'
import { B51 } from '@/khpl/steps/B51'
import { M6 } from '@/khpl/steps/M6'
import { M7 } from '@/khpl/steps/M7'
import { M8 } from '@/khpl/steps/M8'
import { M9 } from '@/khpl/steps/M9'
import { B9 } from '@/khpl/steps/B9'
import { M10 } from '@/khpl/steps/M10'

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
 */
export const BERUF_KOMPONENTEN: Partial<
  Record<BerufId, Readonly<Record<StepId, () => React.ReactNode>>>
> = {
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
}
