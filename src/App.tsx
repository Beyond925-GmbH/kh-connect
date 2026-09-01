import { Component, Suspense, lazy } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { KhplApp } from '@/khpl/KhplApp'

/**
 * Die Dachstuhl-Demo hängt an einem Query-Parameter statt an einem Router: die
 * App bleibt unberührt, und `three` landet dank `lazy` nicht im Hauptbundle
 * (Erststart ≤ 1,5 MB).
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
      <div className="fixed inset-0 grid place-items-center bg-kh-ink p-6 text-center">
        <div>
          <p className="kh-titel-klein text-kh-orange">Die 3D-Ansicht ist ausgefallen</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-kh-mute">
            Bitte die Seite neu laden. Wenn es erneut passiert, hilft ein Neustart des
            Geräts.
          </p>
          <button
            type="button"
            className="mt-4 rounded-kh-pill bg-kh-orange px-5 py-2.5 text-sm font-semibold text-[#0E0D0B]"
            onClick={() => window.location.reload()}
          >
            Seite neu laden
          </button>
        </div>
      </div>
    )
  }
}

export default function App() {
  const demo = new URLSearchParams(window.location.search).get('demo')

  if (demo === 'dachstuhl') {
    return (
      <Auffangnetz>
        <Suspense
          fallback={
            <div className="fixed inset-0 grid place-items-center bg-kh-ink text-kh-mute">
              3D-Modell wird geladen …
            </div>
          }
        >
          <DachstuhlDemo />
        </Suspense>
      </Auffangnetz>
    )
  }

  return <KhplApp />
}
