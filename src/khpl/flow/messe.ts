import { baueGraph, type GraphKonfig, type StepDef, type StepGraph } from './steps'

/** Kurze Spielstrecke; vorhandene Vertiefungen bleiben unter ihrem Thema erreichbar. */
export function baueMesseGraph(
  ursprung: readonly StepDef[],
  hauptIds: readonly string[],
  konfig: GraphKonfig,
): StepGraph {
  if (hauptIds.length === 0 || new Set(hauptIds).size !== hauptIds.length) {
    throw new Error('Die Messestrecke braucht eindeutige Hauptschritte.')
  }
  const original = new Map(ursprung.map((s) => [s.id, s]))
  for (const id of hauptIds) {
    if (!original.has(id)) throw new Error(`Unbekannter Hauptschritt: ${id}`)
  }
  const haupt = new Set(hauptIds)
  const eltern = new Map<string, string>()
  let bezug = hauptIds[0]
  for (const s of ursprung) {
    if (haupt.has(s.id)) bezug = s.id
    else eltern.set(s.id, bezug)
  }
  const alle: StepDef[] = []
  const weiterTexte: Record<string, string> = {}
  for (const [index, id] of hauptIds.entries()) {
    const naechster = hauptIds[index + 1] ?? null
    const extras = ursprung.filter((s) => eltern.get(s.id) === id)
    alle.push({
      ...original.get(id)!,
      art: 'haupt',
      eltern: null,
      weiter: naechster,
      abstecher: extras.map((s) => s.id),
    })
    weiterTexte[id] = index === hauptIds.length - 2 ? 'Zum Abschluss' : 'Weiter'
    for (const extra of extras) {
      alle.push({
        ...extra,
        art: 'abstecher',
        eltern: id,
        weiter: naechster ?? id,
        abstecher: [],
      })
      weiterTexte[extra.id] = 'Weiter im Beruf'
    }
  }
  return baueGraph(alle, {
    ...konfig,
    erster: hauptIds[0],
    karriereSkipAuf: hauptIds,
    weiterTexte,
  })
}
