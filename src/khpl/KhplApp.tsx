import type { StepId } from '@/khpl/flow/steps'
import { Auftragsannahme } from '@/khpl/shell/Auftragsannahme'
import { KioskGuard } from '@/khpl/shell/KioskGuard'
import { Splash } from '@/khpl/shell/Splash'
import { Platzhalter } from '@/khpl/steps/Platzhalter'
import { useBildschirm, useFortschritt } from '@/khpl/store/fortschritt'

/**
 * KHPL Connect — die Hülle um den Flow (khpl-ui-shell.md 3).
 *
 * Es gibt bewusst keinen Router: die App hat keine URLs, keine Tiefenlinks und
 * keine Zurück-Taste des Browsers, die etwas Sinnvolles täte. Der Zustand ist
 * `bildschirm` + `currentStepId`, mehr nicht.
 */

/** Steps, die schon gebaut sind. Der Rest läuft über den Platzhalter. */
const GEBAUT: Partial<Record<StepId, () => React.ReactNode>> = {}

export function KhplApp() {
  const bildschirm = useBildschirm()
  const { currentStepId } = useFortschritt()

  return (
    <KioskGuard>
      {bildschirm === 'splash' && <Splash />}
      {bildschirm === 'intro' && <Auftragsannahme />}
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
