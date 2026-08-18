import { Component, Suspense, lazy } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { ThemeToggle } from '@/components/theme-toggle'

/**
 * Demos hängen an einem Query-Parameter statt an einem Router: die übrige App
 * bleibt unberührt, und `three` landet dank `lazy` nicht im Hauptbundle.
 */
const DachstuhlDemo = lazy(() => import('@/dachstuhl/DachstuhlDemo'))

/**
 * Auffangnetz für den Messestand. Das iPad steht dort stundenlang
 * unbeaufsichtigt; ein Fehler in der 3D-Ansicht darf nicht die ganze Seite
 * abräumen und ein weißes Rechteck hinterlassen, sondern muss eine Aussage
 * und einen Weg zurück zeigen.
 */
class Auffangnetz extends Component<{ children: ReactNode }, { gefallen: boolean }> {
  state = { gefallen: false }

  static getDerivedStateFromError() {
    return { gefallen: true }
  }

  componentDidCatch(fehler: Error, info: ErrorInfo) {
    console.error('[dachstuhl] Ansicht abgestürzt:', fehler, info.componentStack)
  }

  render() {
    if (!this.state.gefallen) return this.props.children
    return (
      <div className="fixed inset-0 grid place-items-center bg-kh-page p-6 text-center">
        <div>
          <p className="kh-h3 text-kh-orange">Die 3D-Ansicht ist ausgefallen</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-kh-grey">
            Bitte die Seite neu laden. Wenn es erneut passiert, hilft ein Neustart des
            Geräts.
          </p>
          <button
            type="button"
            className="mt-4 rounded-kh bg-kh-orange px-4 py-2 text-sm text-kh-page"
            onClick={() => window.location.reload()}
          >
            Seite neu laden
          </button>
        </div>
      </div>
    )
  }
}

/**
 * The page is intentionally blank — this repo is the design system, not a site.
 * Only the theme control is mounted, so dark mode is reachable and reviewable;
 * move it into the real header once there is one.
 */
export default function App() {
  const demo = new URLSearchParams(window.location.search).get('demo')

  if (demo === 'dachstuhl') {
    return (
      <Auffangnetz>
        <Suspense
          fallback={
            <div className="fixed inset-0 grid place-items-center bg-kh-page text-kh-grey">
              3D-Modell wird geladen …
            </div>
          }
        >
          <DachstuhlDemo />
        </Suspense>
      </Auffangnetz>
    )
  }

  return (
    <div className="kh-container flex justify-end py-3">
      <ThemeToggle />
    </div>
  )
}
