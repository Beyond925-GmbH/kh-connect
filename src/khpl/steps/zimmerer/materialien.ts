/** Lernschichten: dieselben IDs verbinden Karten, Fortschritt und 3D-Modell. */
export const WANDSCHICHTEN = [
  {
    id: 'innen',
    name: 'Zimmerwand',
    fachwort: 'Innenbeplankung',
    zweck: 'Die helle Platte bildet die Wand im Zimmer.',
    hinweis: 'Beginne auf der Zimmerseite mit der hellen Platte.',
    farbe: '#DDD8CF',
  },
  {
    id: 'dampfbremse',
    name: 'Schutzfolie',
    fachwort: 'Dampfbremse',
    zweck: 'Sie hält feuchte Raumluft von der Dämmung fern.',
    hinweis: 'Die Folie schützt die Dämmung vor feuchter Luft aus dem Zimmer.',
    farbe: '#7FA9B5',
  },
  {
    id: 'daemmung',
    name: 'Holz mit Dämmung',
    fachwort: 'Gedämmtes Ständerwerk',
    zweck: 'Das Holz trägt. Die weiche Füllung hält die Wärme im Haus.',
    hinweis: 'Jetzt kommt das tragende Holz mit der weichen Füllung.',
    farbe: '#D8C48F',
  },
  {
    id: 'holzfaser',
    name: 'Äußere Holzplatte',
    fachwort: 'Holzfaserplatte',
    zweck: 'Sie schützt die Dämmung und lässt Feuchtigkeit nach außen entweichen.',
    hinweis: 'Die braune Holzplatte liegt zwischen Dämmung und Fassade.',
    farbe: '#B58C4C',
  },
  {
    id: 'fassade',
    name: 'Fassade',
    fachwort: 'Außenbekleidung',
    zweck: 'Diese Oberfläche siehst du draußen am Haus.',
    hinweis: 'Ganz außen fehlt noch die sichtbare Hauswand.',
    farbe: '#A8814A',
  },
] as const
export type WandschichtId = (typeof WANDSCHICHTEN)[number]['id']

export function gueltigerAufbau(gelegt: readonly string[]): WandschichtId[] {
  const gueltig: WandschichtId[] = []
  for (const schicht of WANDSCHICHTEN) {
    if (gelegt[gueltig.length] !== schicht.id) break
    gueltig.push(schicht.id)
  }
  return gueltig
}
