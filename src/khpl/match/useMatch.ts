import { BERUFE } from '@/khpl/berufe/registry'
import { useSitzung } from '@/khpl/store/fortschritt'
import { signaleAusAntworten } from './fragen'
import { werkzeug } from './helm'
import { baueBesucherVektor, ranke, zitierbareMerkmale, type Treffer } from './matching'
import type { MerkmalId } from './merkmale'

export interface Match {
  /** Alle Berufe, bester zuerst. */
  rangfolge: Treffer[]
  /** Der beste Treffer. `null` nur beim Kaltstart. */
  bester: Treffer | null
  /** Der zweite — „dicht dahinter“. Nie zu unterschlagen, siehe unten. */
  zweiter: Treffer | null
  /** Nichts gesagt: dann gibt es keinen Vorschlag, nur die Liste. */
  kaltstart: boolean
  /** Was der Besucher stark genug geäußert hat, um es zurückzuhören. */
  merkmale: MerkmalId[]
}

/** Gewähltes Werkzeug und Bildantworten geben eine unverbindliche Reihenfolge. */
export function useMatch(): Match {
  const sitzung = useSitzung()
  const signale = signaleAusAntworten(sitzung.gefragt)
  const gewaehlt = werkzeug(sitzung.helm?.werkzeug)
  if (gewaehlt) signale.push({ gewichte: gewaehlt.gewichte, faktor: 1, zitierbar: false })
  const besucher = baueBesucherVektor(signale)
  const rangfolge = ranke(besucher, BERUFE)

  return {
    rangfolge,
    bester: besucher.kaltstart ? null : (rangfolge[0] ?? null),
    zweiter: besucher.kaltstart ? null : (rangfolge[1] ?? null),
    kaltstart: besucher.kaltstart,
    merkmale: zitierbareMerkmale(besucher.roh),
  }
}
