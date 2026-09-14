import assert from 'node:assert/strict'
import { FRAGEN, signaleAusAntworten } from './fragen'
import { baueBesucherVektor, zitierbareMerkmale } from './matching'

const besucher = (antworten: Record<string, string>) =>
  baueBesucherVektor(signaleAusAntworten(antworten))
assert.equal(FRAGEN.filter((f) => f.art === 'bilder').length, 2)
assert.equal(FRAGEN.filter((f) => f.art === 'radio').length, 1)
const neutral: Record<string, string>[] = [
  {},
  { umgebung: 'offen', taetigkeit: 'offen' },
  { umgebung: 'ungueltig', taetigkeit: 'unbekannt' },
  { musik: 'rock', hoehe: 'her-damit', ort: 'draussen', dach: 'tragwerk' },
]
for (const antworten of neutral) {
  const v = besucher(antworten)
  assert.equal(
    v.kaltstart,
    true,
    'Keine Empfehlung aus neutralen, alten oder unbekannten Antworten',
  )
  assert.deepEqual(zitierbareMerkmale(v.roh), [])
}
const allein = besucher({ taetigkeit: 'maschine' })
const mitNeutral = besucher({ umgebung: 'offen', taetigkeit: 'maschine' })
assert.deepEqual(
  allein,
  mitNeutral,
  'Unsicherheit darf ein tatsächliches Interesse nicht ändern',
)
assert.equal(allein.kaltstart, false)
assert.ok(zitierbareMerkmale(allein.roh).includes('technik'))
for (const frage of FRAGEN) {
  assert.ok(frage.antworten.some((a) => a.neutral))
  for (const antwort of frage.antworten) {
    assert.equal(
      antwort.gewichte.hoehe,
      undefined,
      'Aus Bildvorlieben keine Aussage über Höhe ableiten',
    )
  }
}
console.log(
  'Matching: neutrale Antworten, Altantworten und ausdrückliches Interesse geprüft.',
)
