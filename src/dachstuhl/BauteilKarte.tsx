import { X } from 'lucide-react'
import { BAUTEIL_TEXTE } from './bauteil-texte'
import type { Auswahl } from './debug'

/**
 * Erklärkarte als DOM-Element, nicht als <Html> im Canvas: Schrift, Farben und
 * Theme kommen so unverändert aus dem Design-System.
 */
export function BauteilKarte({
  auswahl,
  onSchliessen,
}: {
  auswahl: Auswahl | null
  onSchliessen: () => void
}) {
  if (!auswahl) return null
  const text = BAUTEIL_TEXTE[auswahl.typ]

  return (
    <div className="pointer-events-auto absolute right-4 bottom-24 z-20 w-[min(24rem,calc(100vw-2rem))] animate-fade-up rounded-kh border border-kh-rule bg-kh-surface p-5 shadow-xl">
      <button
        type="button"
        onClick={onSchliessen}
        aria-label="Erklärung schließen"
        className="absolute top-3 right-3 rounded-kh p-1 text-kh-grey transition-colors hover:text-kh-orange"
      >
        <X size={18} strokeWidth={1.5} />
      </button>
      <h3 className="kh-h3 pr-6 text-kh-orange">{text.label}</h3>
      <p className="mt-2 text-kh-grey">{text.text}</p>
      {auswahl.index !== null && (
        <p className="mt-3 text-sm text-kh-grey/70">Ausgewähltes Teil: Achse {auswahl.index}</p>
      )}
    </div>
  )
}
