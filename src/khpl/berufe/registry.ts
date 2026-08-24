import { DACHDECKER } from './dachdecker'
import { ZIMMERER } from './zimmerer'
import { ZERSPANUNGSMECHANIKER } from './zerspanung'
import { ANLAGENMECHANIKER } from './anlagenmechanik'
import type { BerufDef, BerufId } from './typen'

/**
 * Das Angebot. Die Reihenfolge hier **ist** die Reihenfolge in der
 * Berufsliste — sortiert wird sie dort nur, wenn ein Vorschlag vorliegt.
 *
 * **Vier Dateien, eine je Beruf, und diese Liste wird nicht mehr angefasst**
 * (khpl-tage.md §6.1 V6). Solange drei Tage gleichzeitig entstehen, ist jede
 * Zeile hier ein Merge-Konflikt zwischen Leuten, die nichts voneinander
 * wissen — der Import steht deshalb schon da, bevor der Beruf etwas kann.
 *
 * Der Dachdecker steht vorn, weil er als einziger einen Tag hat. Sobald ein
 * zweiter fertig ist, gehört die Reihenfolge auf den Prüfstand: an einem Stand
 * ist die erste Karte die, die am häufigsten getippt wird.
 */
export const BERUFE: readonly BerufDef[] = [
  DACHDECKER,
  ZIMMERER,
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
