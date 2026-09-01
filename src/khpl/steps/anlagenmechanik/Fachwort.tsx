import {
  BEGRIFFE_ANLAGENMECHANIK,
  type AnlagenmechanikBegriffId,
} from '@/khpl/glossar/anlagenmechanik'
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'

/**
 * Fachbegriff im Fließtext — dieselbe Sache wie `komponenten/Begriff.tsx`, nur
 * aus dem Glossar **dieses** Berufs.
 *
 * ⚠️ **Das ist eine Doppelung, und sie ist gemeldet.** `Begriff` ist fest an
 * `glossar/begriffe.ts` verdrahtet (`id: BegriffId`, Nachschlag in `BEGRIFFE`)
 * und kennt die Glossare der drei neuen Tage nicht. Die richtige Lösung ist
 * eine Hüllenänderung — ein `eintrag`-Prop an `Begriff` oder eine Auflösung
 * über den aktiven Beruf —, und die gehört nicht in einen einzelnen Tag: Wer
 * an der Hülle etwas braucht, meldet es, statt es im Vorbeigehen zu ändern.
 * Bis das entschieden ist, hält diese Datei den Tag lauffähig,
 * **ohne** an einer geteilten Datei zu drehen.
 *
 * Markup und Klassen sind bewusst identisch mit `Begriff` übernommen: eine
 * zweite Optik für dieselbe Geste wäre schlimmer als die Doppelung. Wer dort
 * etwas ändert, ändert es hier mit — oder besser: löst die Meldung oben auf
 * und wirft diese Datei weg.
 */
export function Fachwort({
  id,
  children,
}: {
  id: AnlagenmechanikBegriffId
  children?: React.ReactNode
}) {
  const eintrag = BEGRIFFE_ANLAGENMECHANIK[id]

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
