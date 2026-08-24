import { useState } from 'react'
import type { BerufDef } from '@/khpl/berufe/typen'
import { cn } from '@/lib/utils'

/**
 * Das Motiv eines Berufs — mit einem Ersatz, der kein Platzhalterbild ist.
 *
 * **Warum das nötig ist.** Für den Dachdecker liegt im Repo kein einziges
 * Foto; `MEDIEN-INVENTAR.md` führt Motive für drei Gewerke, und er ist nicht
 * darunter. Ein `<img>` auf eine Datei, die es nicht gibt, ergibt auf iOS ein
 * gebrochenes Symbol auf grauem Grund — auf einem Messestand die auffälligste
 * Stelle des ganzen Screens.
 *
 * Der Ersatz ist deshalb kein Bild, sondern Typografie: der Anfangsbuchstabe
 * in Anton auf der Panelfarbe. Das sieht nach Absicht aus, solange die Fotos
 * fehlen — und verschwindet ohne Codeänderung, sobald sie da sind.
 */
export function BerufBild({ beruf, className }: { beruf: BerufDef; className?: string }) {
  const [gefallen, setGefallen] = useState(false)

  if (gefallen) {
    return (
      <div
        aria-hidden
        className={cn('grid size-full place-items-center bg-kh-raised', className)}
      >
        <span className="font-display text-[clamp(2.5rem,8vw,5rem)] leading-none text-kh-paper/12">
          {beruf.kurz.slice(0, 2).toUpperCase()}
        </span>
      </div>
    )
  }

  return (
    <img
      src={beruf.medien.karte}
      alt=""
      aria-hidden
      loading="lazy"
      decoding="async"
      onError={() => setGefallen(true)}
      // Wie in `Foto`: die Pexels-Motive sind neutral abgestimmt und sehen
      // neben Anton-Versalien und Warnfarben ausgewaschen aus.
      style={{ filter: 'saturate(1.12) contrast(1.06)' }}
      className={cn('size-full object-cover', className)}
    />
  )
}
