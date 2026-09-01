import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'
import { BEGRIFFE_ZIMMERER, type ZimmererBegriffId } from '@/khpl/glossar/zimmerer'

/**
 * Fachbegriff im Fließtext dieses Tages — dasselbe Verhalten wie
 * `komponenten/Begriff`, nur mit dem Glossar des Zimmerers.
 *
 * **Warum eine zweite Komponente und nicht ein Parameter an der ersten.**
 * `komponenten/Begriff` ist auf `BegriffId` aus `glossar/begriffe.ts` typisiert
 * und wird vom gebauten Dachdecker-Tag benutzt. Die zehn neuen Holzrahmenbau-
 * Begriffe stehen dort nicht, und `komponenten/` gehört keinem der drei
 * Agenten — eine gemeinsame Datei umzubauen, während drei
 * Tage gleichzeitig entstehen, ist genau die Kollision, die die Dateihoheit
 * verhindern soll.
 *
 * Der Preis sind zwanzig Zeilen Doppelung; sie ist gemeldet. Sobald alle vier
 * Tage stehen, gehört `Begriff` einmal auf ein Glossar je Beruf umgestellt —
 * das ist die Vereinheitlichung zu Ende gedacht und betrifft alle vier, also
 * nicht die Hoheit eines einzelnen Tages.
 *
 * Klassen identisch zu `komponenten/Begriff`: zwei Begriffe im
 * selben Absatz dürfen nicht unterschiedlich aussehen, nur weil sie aus
 * verschiedenen Listen kommen.
 */
export function Begriff({
  id,
  children,
}: {
  id: ZimmererBegriffId
  children?: React.ReactNode
}) {
  const eintrag = BEGRIFFE_ZIMMERER[id]

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
