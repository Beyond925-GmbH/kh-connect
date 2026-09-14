import assert from 'node:assert/strict'
import { gueltigerAufbau, WANDSCHICHTEN } from '../src/khpl/steps/zimmerer/materialien'
import { tatsaechlicheTaten } from '../src/khpl/steps/zimmerer/rueckblick'
// Ein beschädigter oder alter Spielstand darf kein falsches fertiges Modell ergeben.
assert.deepEqual(gueltigerAufbau(['fassade', 'innen']), [])
assert.deepEqual(gueltigerAufbau(['innen', 'innen', 'dampfbremse']), ['innen'])
assert.deepEqual(gueltigerAufbau(['innen', 'unbekannt']), ['innen'])
assert.deepEqual(gueltigerAufbau(WANDSCHICHTEN.map((s) => s.id)), [
  'innen',
  'dampfbremse',
  'daemmung',
  'holzfaser',
  'fassade',
])
// Ein Besuch oder Fehlversuch ist noch keine abgeschlossene Tätigkeit.
assert.deepEqual(tatsaechlicheTaten({}), [])
assert.deepEqual(
  tatsaechlicheTaten({
    c2: { schaetzung: 40, aufgeloest: false },
    c3: { gelegt: ['innen'], fertig: false },
  }),
  [],
)
assert.deepEqual(
  tatsaechlicheTaten({
    c1: { holzId: 'warm', gefunden: true, versuche: 0 },
    c3: { gelegt: WANDSCHICHTEN.map((s) => s.id), fertig: true },
  }),
  ['Dein Holz gewählt und markiert', 'Fünf Schichten zu einer Wand aufgebaut'],
)
console.log('Zimmerer: gespeicherter Aufbau und tatsächlicher Rückblick geprüft.')
