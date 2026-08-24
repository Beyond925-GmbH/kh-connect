import { BEGRIFFE_ZERSPANUNG, type BegriffZerspanungId } from '@/khpl/glossar/zerspanung'
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'

/**
 * Fachbegriff im Fließtext — dieselbe Gestalt wie `komponenten/Begriff.tsx`,
 * nur aus dem Glossar **dieses** Berufs.
 *
 * ⚠️ **Das ist eine gemeldete Naht, keine gewählte Doppelung**
 * (khpl-tage.md §3, „wer beim Bauen auf einen Widerspruch stößt, meldet ihn“).
 * V6 trennt die Glossare je Beruf (`glossar/<beruf>.ts`), aber
 * `komponenten/Begriff.tsx` ist weiterhin fest an `glossar/begriffe.ts`
 * gebunden: `BegriffId` ist `keyof typeof BEGRIFFE`, und ein Zerspanungs-Wort
 * ist dort kein gültiger Schlüssel. Die Hülle so umzubauen, dass sie das
 * Glossar über den aktiven Beruf auflöst, wäre eine Änderung für alle vier
 * Tage — und würde parallel dreimal gleichzeitig passieren.
 *
 * Deshalb steht hier eine Kopie von zwölf Zeilen im eigenen Verzeichnis, und
 * die Zusammenführung gehört an die Stelle, die alle vier Berufe im Blick hat.
 * Trigger-Stil, Trefferfläche und Popover sind bewusst **identisch** zur
 * Bestandsfassung: ein Begriff darf sich in diesem Tag nicht anders anfühlen.
 */
export function Begriff({
  id,
  children,
}: {
  id: BegriffZerspanungId
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
