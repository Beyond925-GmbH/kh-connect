import { createContext } from 'react'
export const HOLZWAHL = [
  { id: 'hell', name: 'Holz mit einem Strich', farbe: '#DDC192', striche: 1 },
  { id: 'warm', name: 'Holz mit zwei Strichen', farbe: '#BC8F59', striche: 2 },
  { id: 'dunkel', name: 'Holz mit drei Strichen', farbe: '#A47746', striche: 3 },
] as const
export function gewaehltesHolz(id?: string) {
  return HOLZWAHL.find((holz) => holz.id === id) ?? HOLZWAHL[0]
}
export const HolzKontext = createContext<string | undefined>(undefined)
