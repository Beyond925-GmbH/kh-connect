import { BEGRIFFE_ZERSPANUNG, type ZerspanungBegriffId } from '@/khpl/glossar/zerspanung'
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'

/**
 * Fachbegriff im Fließtext — dieselbe Sache wie `komponenten/Begriff.tsx`,
 * nur aus dem Glossar **dieses** Berufs.
 *
 * ⚠️ **Dieselbe gemeldete Doppelung wie bei Zimmerer (`steps/zimmerer/
 * Begriff.tsx`) und Anlagenmechanik (`Fachwort.tsx`):** die geteilte
 * `Begriff`-Komponente ist fest an `glossar/begriffe.ts` verdrahtet und
 * kennt die Glossare der Tage nicht. Die richtige Lösung ist eine
 * Hüllenänderung (ein `eintrag`-Prop oder die Auflösung über den aktiven
 * Beruf) und gehört nicht in einen einzelnen Tag. Markup und Klassen sind
 * absichtlich zeichengleich mit dem Original — eine zweite Optik für
 * dieselbe Geste wäre schlimmer als die Doppelung.
 */
export function Begriff({
  id,
  children,
}: {
  id: ZerspanungBegriffId
  children?: React.ReactNode
}) {
  const eintrag = BEGRIFFE_ZERSPANUNG[id]

  return (
    <Popover>
      <PopoverTrigger
        className="inline cursor-pointer rounded-[3px] bg-kh-orange/10 px-[0.14em] font-semibold text-kh-paper underline decoration-kh-orange decoration-[3px] underline-offset-[0.2em] transition-colors active:bg-kh-orange active:text-[#0E0D0B]"
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
