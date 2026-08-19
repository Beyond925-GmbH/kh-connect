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
 * unterlegt und dick unterstrichen — wer weitergehen will, geht weiter; wer
 * stolpert, bekommt die Antwort an Ort und Stelle.
 *
 * Die Unterstreichung ist 3 px stark statt 2 und der Begriff halbfett: auf
 * dunklem Grund, hinter einer Fensterscheibe aus Hallenlicht, war die feine
 * Variante als antippbar nicht zu erkennen.
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
        className="inline cursor-pointer rounded-[3px] bg-kh-orange/25 px-[0.14em] font-semibold text-kh-paper underline decoration-kh-orange decoration-[3px] underline-offset-[0.2em] transition-colors active:bg-kh-orange active:text-[#0E0D0B]"
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
