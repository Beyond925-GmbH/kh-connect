import { BERUFE } from '@/khpl/berufe/registry'
import { useSitzung } from '@/khpl/store/fortschritt'
import { FRAGEN } from './fragen'
import { werkzeug } from './helm'
import {
  FRAGEN_GEWICHT,
  baueBesucherVektor,
  ranke,
  zitierbareMerkmale,
  type Signal,
  type Treffer,
} from './matching'
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

/**
 * Die Rangfolge aus dem, was der Besucher im Trichter gesagt hat.
 *
 * **Warum der Zweitplatzierte mitkommt.** Zimmerer und Dachdecker liegen im
 * Merkmalsraum dicht beieinander — beide draußen, beide oben, beide auf
 * demselben Dach. Ein Vorschlag, der nur den Sieger nennt, behauptet in genau
 * diesem Fall eine Trennschärfe, die die vier Fragen nicht haben. Wird der
 * Zweite mitgenannt, liest sich dasselbe Ergebnis als ehrlich statt als falsch
 * — und der Knopf „alle vier ansehen“ bekommt einen Grund.
 */
export function useMatch(): Match {
  const sitzung = useSitzung()

  const signale: Signal[] = []

  const w = werkzeug(sitzung.helm?.werkzeug)
  // `zitierbar: false`: dass jemand zur Rohrzange greift, ist ein Indiz und
  // keine Aussage. Im Vorschlag als „du magst Technik“ zu erscheinen, hat es
  // sich nicht verdient.
  if (w) signale.push({ gewichte: w.gewichte, zitierbar: false })

  for (const frage of FRAGEN) {
    const antwortId = sitzung.gefragt[frage.id]
    if (!antwortId) continue
    const antwort = frage.antworten.find((a) => a.id === antwortId)
    if (!antwort) continue
    signale.push({
      gewichte: antwort.gewichte,
      faktor: FRAGEN_GEWICHT,
      zitierbar: true,
    })
  }

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
