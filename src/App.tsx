import { Suspense, lazy } from 'react'
import { ThemeToggle } from '@/components/theme-toggle'

/**
 * Demos hängen an einem Query-Parameter statt an einem Router: die übrige App
 * bleibt unberührt, und `three` landet dank `lazy` nicht im Hauptbundle.
 */
const DachstuhlDemo = lazy(() => import('@/dachstuhl/DachstuhlDemo'))

/**
 * The page is intentionally blank — this repo is the design system, not a site.
 * Only the theme control is mounted, so dark mode is reachable and reviewable;
 * move it into the real header once there is one.
 */
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

  return (
    <div className="kh-container flex justify-end py-3">
      <ThemeToggle />
    </div>
  )
}
