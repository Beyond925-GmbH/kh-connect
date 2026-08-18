import { PHASEN } from '@/dachstuhl/zeitachse'

/**
 * Wo M5 aufhört und M7 anfängt — abgeleitet aus der Zeitachse, nicht als Zahl
 * hineingeschrieben.
 *
 * `src/dachstuhl/zeitachse.ts` ist in Bewegung: Phasen kommen dazu, Grenzen
 * verschieben sich, und die Zahlen darin sind Animationsparameter, keine
 * Vertragswerte. Ein hart notiertes `0.76` in M5 wäre beim nächsten
 * eingeschobenen Bauteil still falsch — der Schnitt läge dann mitten in einer
 * Phase, und M7 fragte nach etwas, das schon steht.
 *
 * Deshalb wird über das **Label** gesucht. Die Aufrichtfolge ist fachlich
 * festgelegt und ihre Namen ändern sich nicht, auch wenn die Zeitachse
 * feiner wird.
 */

function grenzen(label: string): { von: number; bis: number } {
  const p = PHASEN.find((x) => x.label === label)
  if (!p) {
    throw new Error(
      `Aufbauphase „${label}“ fehlt in zeitachse.ts — M5 und M7 hängen an ihr.`,
    )
  }
  return { von: p.von, bis: p.bis }
}

const sparren = grenzen('Sparrenpaare')

/**
 * M5 zeigt den Unterbau: alles, worauf die Sparren später aufliegen.
 * Hier hält die Animation an — genau der Moment, in dem laut flow 7 M5 die
 * Sicherung steht, „bevor der erste Sparren fliegt“.
 */
export const M5_SICHERUNG = sparren.von

/**
 * Danach fliegen die Sparrenpaare ein. Damit endet der Vormittag.
 *
 * Ein Hauch **vor** der Phasengrenze: genau auf ihr gilt das erste Bauteil der
 * Folgephase schon als sichtbar (`sichtbar` prüft `t >= start`) und stünde mit
 * Fortschritt 0 an seiner Einflugposition in der Luft — und `phaseAt` schriebe
 * bereits „Kehlbalken“ an einen Screen, der davon noch nichts zeigt.
 */
const HAARBREIT = 0.002

export const M5_ENDE = sparren.bis - HAARBREIT

/** M7 macht genau dort weiter und baut bis zum fertigen Dach. */
export const M7_START = M5_ENDE
export const M7_ENDE = 1
