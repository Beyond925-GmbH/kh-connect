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
 * mitten im Satz kann das nicht einhalten, ohne den Absatz zu zerreißen — die
 * Regel gilt unverändert für alles, was für sich allein steht.
 *
 * Innen- und Außenabstand sind bewusst knapp. Mit `mx` und großzügigem `px`
 * schob der Chip jedes folgende Satzzeichen weg, und die Sätze lasen sich als
 * „Fichte ( KVH ), keine Gaube .“ — bei vier Chips in einem Absatz (M3)
 * zerfiel der Text sichtbar.
 */
export function Begriff({ id, children }: { id: BegriffId; children?: React.ReactNode }) {
  const eintrag = BEGRIFFE[id]

  return (
    <Popover>
      <PopoverTrigger
        className="inline cursor-pointer rounded-[2px] bg-kh-orange/20 px-[0.12em] font-normal text-kh-ink underline decoration-kh-orange-text decoration-2 underline-offset-[0.18em] transition-colors hover:bg-kh-orange/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kh-orange"
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
