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
  const [geladen, setGeladen] = useState(false)

  return (
    <div aria-hidden className={cn('relative size-full bg-kh-raised', className)}>
      {/* Der typografische Ersatz liegt schon während des Ladens unter dem
          Foto. So wird aus einem langsamen Bild kein schwarzes Loch in der
          Berufsliste. Bei einem Fehler bleibt genau derselbe Zustand stehen. */}
      <div className="absolute inset-0 grid place-items-center">
        <span className="font-display text-[clamp(2.5rem,8vw,5rem)] leading-none text-kh-paper/35">
          {beruf.kurz.slice(0, 2).toUpperCase()}
        </span>
      </div>
      {!gefallen && (
        <img
          src={beruf.medien.karte}
          alt=""
          aria-hidden
          // `eager`, nicht `lazy`: dieses Motiv steht an jeder seiner drei
          // Stellen (Berufsliste, Vorschlag, „bald“) von Anfang an im Bild.
          loading="eager"
          fetchPriority="high"
          decoding="async"
          onLoad={() => setGeladen(true)}
          onError={() => setGefallen(true)}
          // Wie in `Foto`: die Pexels-Motive sind neutral abgestimmt und sehen
          // neben Anton-Versalien und Warnfarben ausgewaschen aus.
          style={{ filter: 'saturate(1.12) contrast(1.06)' }}
          className={`absolute inset-0 size-full object-cover transition-opacity duration-500 ${geladen ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
    </div>
  )
}
