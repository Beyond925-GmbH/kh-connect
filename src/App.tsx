import { Suspense, lazy } from 'react'
import { KhplApp } from '@/khpl/KhplApp'

/**
 * Die Dachstuhl-Demo hängt an einem Query-Parameter statt an einem Router: die
 * App bleibt unberührt, und `three` landet dank `lazy` nicht im Hauptbundle
 * (flow 8.5 — Erststart ≤ 1,5 MB).
 */
const DachstuhlDemo = lazy(() => import('@/dachstuhl/DachstuhlDemo'))

export default function App() {
  const demo = new URLSearchParams(window.location.search).get('demo')

  if (demo === 'dachstuhl') {
    return (
      <Suspense
        fallback={
          <div className="fixed inset-0 grid place-items-center bg-kh-page text-kh-grey">
            3D-Modell wird geladen …
          </div>
        }
      >
        <DachstuhlDemo />
      </Suspense>
    )
  }

  return <KhplApp />
}
