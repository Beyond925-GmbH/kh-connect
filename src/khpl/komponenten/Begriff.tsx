import { BEGRIFFE, type BegriffId } from '@/khpl/glossar/begriffe'
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'

/**
 * Fachbegriff im Fließtext (khpl-flow.md 6.3). Antippbar, in Markerfarbe
 * unterlegt und unterstrichen — wer weitergehen will, geht weiter; wer
 * stolpert, bekommt die Antwort an Ort und Stelle.
 *
 * Trefferfläche: khpl-flow.md 8.5 setzt 60 pt für diskrete Ziele. Ein Begriff
 * mitten im Satz kann das nicht einhalten, ohne den Absatz zu zerreißen —
 * deshalb hier großzügiges Innenmaß statt fester Höhe. Die Regel gilt
 * unverändert für alles, was für sich allein steht.
 */
export function Begriff({ id, children }: { id: BegriffId; children?: React.ReactNode }) {
  const eintrag = BEGRIFFE[id]

  return (
    <Popover>
      <PopoverTrigger
        className="mx-[0.05em] inline cursor-pointer rounded-[3px] bg-kh-orange/15 px-[0.3em] py-[0.15em] font-normal text-kh-ink underline decoration-kh-orange decoration-2 underline-offset-[0.2em] transition-colors hover:bg-kh-orange/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kh-orange"
        aria-label={`${eintrag.label} — was ist das?`}
      >
        {children ?? eintrag.label}
      </PopoverTrigger>
      <PopoverContent>
        <PopoverTitle>{eintrag.label}</PopoverTitle>
        <PopoverDescription>{eintrag.erklaerung}</PopoverDescription>
      </PopoverContent>
    </Popover>
  )
}
