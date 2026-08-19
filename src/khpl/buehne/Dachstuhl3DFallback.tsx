import { useEffect, useState } from 'react'

/**
 * Ladezustand, solange das `three`-Bündel unterwegs ist.
 *
 * **Steht mit Absicht in einer eigenen Datei.** Als benannter Export neben
 * `Dachstuhl3D` wurde er von den Steps statisch importiert — und ein Modul,
 * das irgendwo statisch importiert wird, zieht Rollup *ganz* ins Hauptbündel,
 * auch wenn es an anderer Stelle per `lazy()` geholt wird. Damit lag `three`
 * im Erststart, und flow 8.5 verlangt das Gegenteil: „nur in B3.2 lazy
 * geladen, nie im Erststart“, Erststart ≤ 1,5 MB.
 *
 * Der Build sagt das übrigens laut, wenn man es kaputtmacht:
 * `[INEFFECTIVE_DYNAMIC_IMPORT] … dynamic import will not move module into
 * another chunk.`
 */
export function Dachstuhl3DFallback() {
  const [punkte, setPunkte] = useState('')

  useEffect(() => {
    const id = window.setInterval(
      () => setPunkte((p) => (p.length >= 3 ? '' : p + '·')),
      400,
    )
    return () => window.clearInterval(id)
  }, [])

  return (
    <div className="grid size-full place-items-center bg-kh-surface">
      <p className="text-[15px] text-kh-mute">Der Dachstuhl wird aufgestellt {punkte}</p>
    </div>
  )
}
