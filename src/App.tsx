import { ThemeToggle } from '@/components/theme-toggle'

/**
 * The page is intentionally blank — this repo is the design system, not a site.
 * Only the theme control is mounted, so dark mode is reachable and reviewable;
 * move it into the real header once there is one.
 */
export default function App() {
  return (
    <div className="kh-container flex justify-end py-3">
      <ThemeToggle />
    </div>
  )
}
