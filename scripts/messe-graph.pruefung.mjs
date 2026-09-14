import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { createJiti } from 'jiti'
const jiti = createJiti(import.meta.url, {
  alias: { '@': fileURLToPath(new URL('../src', import.meta.url)) },
})
const { BERUFE } = await jiti.import('../src/khpl/berufe/registry.ts')
const erwartete = {
  zimmerer: ['C1', 'C2', 'C3', 'C4', 'C6', 'C9'],
  dachdecker: ['M1', 'M4', 'B4.1', 'M5', 'M7', 'M10'],
  zerspanungsmechaniker: ['Z2', 'Z3', 'Z4', 'Z6', 'Z9'],
  anlagenmechaniker: ['A1', 'A2', 'A4', 'A6', 'A7', 'A9'],
}
for (const beruf of BERUFE) {
  const g = beruf.graph
  assert.ok(g)
  const weg = []
  let id = g.erster
  while (id) {
    assert.ok(!weg.includes(id), `${beruf.id}: Schleife bei ${id}`)
    weg.push(id)
    assert.equal(g.steps[id].art, 'haupt')
    id = g.steps[id].weiter
  }
  assert.deepEqual(weg, erwartete[beruf.id])
  assert.deepEqual(
    g.haupt.map((s) => s.id),
    weg,
  )
  assert.equal(g.alle.filter((s) => s.weiter === null).length, 1)
  for (const s of g.alle) {
    if (s.art === 'abstecher') {
      assert.equal(g.steps[s.eltern].art, 'haupt')
      assert.ok(g.steps[s.eltern].abstecher.includes(s.id))
      assert.equal(g.steps[s.weiter].art, 'haupt')
    }
  }
  assert.ok(g.karriereBereich.includes(g.karriereEinstieg))
  console.log(`${beruf.kurz}: ${weg.join(' → ')}; alle Vertiefungen erreichbar`)
}
