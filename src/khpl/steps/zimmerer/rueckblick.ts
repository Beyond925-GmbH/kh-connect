import type { Fortschritt } from '@/khpl/store/fortschritt'
/** Nur tatsächlich abgeschlossene Handlungen, auch nach übersprungenen Spielen. */
export function tatsaechlicheTaten(antworten: Fortschritt['answers']): string[] {
  const taten: string[] = []
  if (antworten.c1?.holzId) taten.push('Dein Holz gewählt und markiert')
  if (antworten.c2?.aufgeloest) taten.push('Das Holz passend unter die Platte geschoben')
  if (antworten.c3?.fertig) taten.push('Fünf Schichten zu einer Wand aufgebaut')
  if (antworten.c4?.getroffen) taten.push('Einen passenden Fensterrahmen eingesetzt')
  if (antworten.c6?.versetzt) taten.push('Die Wand am Kran ausgerichtet und abgesetzt')
  return taten
}
