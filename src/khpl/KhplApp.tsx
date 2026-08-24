import type { StepId } from '@/khpl/flow/steps'
import { KioskGuard } from '@/khpl/shell/KioskGuard'
import { Splash } from '@/khpl/shell/Splash'
import { Platzhalter } from '@/khpl/steps/Platzhalter'
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
import { useBildschirm, useFortschritt } from '@/khpl/store/fortschritt'

/**
 * KHPL Connect — die Hülle um den Flow (khpl-ui-shell.md 3).
 *
 * Es gibt bewusst keinen Router: die App hat keine URLs, keine Tiefenlinks und
 * keine Zurück-Taste des Browsers, die etwas Sinnvolles täte. Der Zustand ist
 * `bildschirm` + `currentStepId`, mehr nicht.
 */

/** Steps, die schon gebaut sind. Der Rest läuft über den Platzhalter. */
const GEBAUT: Partial<Record<StepId, () => React.ReactNode>> = {
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
}

export function KhplApp() {
  const bildschirm = useBildschirm()
  const { currentStepId } = useFortschritt()

  return (
    <KioskGuard>
      {bildschirm === 'splash' && <Splash />}
      {bildschirm === 'step' && <Step id={currentStepId} />}
    </KioskGuard>
  )
}

function Step({ id }: { id: StepId }) {
  const gebaut = GEBAUT[id]
  // `key` erzwingt einen frischen Mount pro Step: kein Interaktionszustand
  // eines Schritts leckt in den nächsten.
  return gebaut ? (
    <div key={id} className="contents">
      {gebaut()}
    </div>
  ) : (
    <Platzhalter key={id} id={id} />
  )
}
