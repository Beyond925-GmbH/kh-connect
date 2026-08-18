import type { ReactNode } from 'react'

/**
 * Der Dachflaechen-Frame (Bauplan 2.1). Innerhalb dieser Gruppe sind Lattung
 * und Windrispen achsparallele Boxen ohne eigene Drehung:
 *
 *   lokal x = Gebaeudelaenge, identisch mit Welt-X
 *   lokal z = Strecke vom First die Dachflaeche hinunter
 *   lokal y = Abstand ueber der Sparrenunterkante
 *
 * Die `-z`-Haelfte entsteht durch Spiegelung der fertigen Haelfte, nicht durch
 * eine zweite Drehung — nur so bleibt lokal y auch dort die Aussenrichtung.
 */
export function Dachflaeche({
  seite,
  hoehe,
  neigung,
  children,
}: {
  seite: 1 | -1
  hoehe: number
  neigung: number
  children: ReactNode
}) {
  return (
    <group scale={[1, 1, seite]}>
      <group position={[0, hoehe, 0]} rotation={[neigung, 0, 0]}>
        {children}
      </group>
    </group>
  )
}
