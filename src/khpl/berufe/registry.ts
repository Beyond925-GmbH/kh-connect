import { ZIMMERER } from './zimmerer'
import { ANLAGENMECHANIKER, DACHDECKER, ZERSPANUNGSMECHANIKER } from './angekuendigt'
import type { BerufDef, BerufId } from './typen'

/**
 * Das Angebot. Die Reihenfolge hier **ist** die Reihenfolge in der
 * Berufsliste — sortiert wird sie dort nur, wenn ein Vorschlag vorliegt.
 *
 * Der Zimmerer steht vorn, weil er als einziger einen Tag hat. Sobald ein
 * zweiter fertig ist, gehört die Reihenfolge auf den Prüfstand: an einem Stand
 * ist die erste Karte die, die am häufigsten getippt wird.
 */
export const BERUFE: readonly BerufDef[] = [
  ZIMMERER,
  DACHDECKER,
  ZERSPANUNGSMECHANIKER,
  ANLAGENMECHANIKER,
]

const NACH_ID: Readonly<Record<BerufId, BerufDef>> = Object.fromEntries(
  BERUFE.map((b) => [b.id, b]),
) as Record<BerufId, BerufDef>

export function beruf(id: BerufId): BerufDef {
  return NACH_ID[id]
}

export function istBerufId(wert: unknown): wert is BerufId {
  return typeof wert === 'string' && Object.hasOwn(NACH_ID, wert)
}

/** Berufe, die einen begehbaren Tag haben. */
export function gebauteBerufe(): BerufDef[] {
  return BERUFE.filter((b) => b.graph !== null)
}
