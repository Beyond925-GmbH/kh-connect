import { useEffect, useState } from 'react'

/**
 * Ladezustand, solange das `three`-Bündel unterwegs ist.
 *
 * **Steht mit Absicht in einer eigenen Datei.** Als benannter Export neben
 * `Dachstuhl3D` wurde er von den Steps statisch importiert — und ein Modul,
 * das irgendwo statisch importiert wird, zieht Rollup *ganz* ins Hauptbündel,
 * auch wenn es an anderer Stelle per `lazy()` geholt wird. Damit lag `three`
 * im Erststart — gefordert ist das Gegenteil: `three` wird nur in B3.2 lazy
 * geladen, nie im Erststart, und der Erststart bleibt unter 1,5 MB.
 *
 * Der Build sagt das übrigens laut, wenn man es kaputtmacht:
 * `[INEFFECTIVE_DYNAMIC_IMPORT] … dynamic import will not move module into
 * another chunk.`
 */
export function Dachstuhl3DFallback({
  text = 'Der Dachstuhl wird aufgestellt',
}: {
  /** Ladehinweis je Buehne — M4 richtet die Werkstatt ein, B4.1 faehrt vor. */
  text?: string
}) {
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
      <div className="flex flex-col items-center gap-3">
        {/* Angedeutete Giebel-Silhouette: eine leere Graufläche mit einer
            Textzeile liest sich als Fehler — die Kontur sagt, dass hier
            gleich ein Dach steht, nicht dass etwas kaputt ist. */}
        <svg
          viewBox="0 0 120 54"
          className="w-[104px] animate-pulse text-kh-mute/45"
          aria-hidden
        >
          <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
            <path d="M8 48 L60 8 L112 48" />
            <path d="M24 36 L96 36" />
            <path d="M60 8 L60 48" />
            <path d="M4 48 L116 48" />
          </g>
        </svg>
        <p className="text-[15px] text-kh-mute">
          {text} {punkte}
        </p>
      </div>
    </div>
  )
}
