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
        {/* 12 % war schon auf dem vollen Motiv leise; seit die Karten der
            angekündigten Berufe zusätzlich auf 55 % Deckkraft stehen, blieb
            davon nichts übrig — eine Karte ohne Bild und ohne sichtbaren
            Ersatz sieht aus, als fehle sie. */}
        <span className="font-display text-[clamp(2.5rem,8vw,5rem)] leading-none text-kh-paper/35">
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
      // `eager`, nicht `lazy`: dieses Motiv steht an jeder seiner drei
      // Stellen (Berufsliste, Vorschlag, „bald“) von Anfang an im Bild, und
      // die Fläche darum fährt beim Auftritt herauf. Ein Bild, das erst
      // während dieser Bewegung eintrifft, blitzt mitten hinein — der Screen
      // sieht dann unruhig aus, obwohl die Animation selbst sauber läuft.
      loading="eager"
      decoding="async"
      onError={() => setGefallen(true)}
      // Wie in `Foto`: die Pexels-Motive sind neutral abgestimmt und sehen
      // neben Anton-Versalien und Warnfarben ausgewaschen aus.
      style={{ filter: 'saturate(1.12) contrast(1.06)' }}
      className={cn('size-full object-cover', className)}
    />
  )
}
