import { useSyncExternalStore } from 'react'
import { RADIO_SENDER, type RadioStil } from '@/khpl/match/fragen'
import { Radioklang } from './fragen/radioklang'

interface Musikstand {
  an: boolean
  stil: RadioStil
  startet: boolean
  fehler: string | null
}
const anfang: Musikstand = { an: false, stil: 'pop', startet: false, fehler: null }
let stand = anfang
let klang: Radioklang | null = null
let generation = 0
let zielpegel = 1
const hoerer = new Set<() => void>()
const abonniere = (h: () => void) => {
  hoerer.add(h)
  return () => {
    hoerer.delete(h)
  }
}
const snapshot = () => stand
function melde(neu: Musikstand) {
  stand = neu
  hoerer.forEach((h) => h())
}

/** Absichtlich nur im Arbeitsspeicher. Neue Besucher und Reloads starten stumm. */
export function setzeSitzungsmusikZurueck() {
  generation += 1
  klang?.zerstoere()
  klang = null
  melde({ ...anfang })
}

export function pausiere() {
  generation += 1
  klang?.zerstoere()
  klang = null
  melde({ ...stand, an: false, startet: false, fehler: null })
}

/** Fragen dürfen den Pegel senken, aber niemals selbst Musik starten. */
export function blendeMusik(anteil: number, sekunden = 0.8) {
  if (!stand.an && !stand.startet) return
  zielpegel = anteil
  klang?.lautstaerke(anteil, sekunden)
}

export async function spiele(stil: RadioStil, pegel = 1) {
  const lauf = ++generation
  const sender = RADIO_SENDER.find((s) => s.stil === stil)
  if (!sender) return
  zielpegel = pegel
  melde({ an: false, startet: true, stil, fehler: null })
  try {
    klang ??= new Radioklang()
    const geraet = klang
    // Direkt vom Button-Handler aus entsperren, bevor ein await die Geste verlässt.
    await geraet.entsperre()
    if (generation !== lauf) return
    geraet.lautstaerke(zielpegel, 0.1)
    geraet.sender(sender.stil, sender.bpm)
    melde({ an: true, startet: false, stil, fehler: null })
  } catch {
    if (generation !== lauf) return
    klang?.zerstoere()
    klang = null
    melde({
      an: false,
      startet: false,
      stil,
      fehler: 'Ton konnte nicht starten. Tippe noch einmal auf Musik an.',
    })
  }
}

/** Senderwahl bleibt stumm, bis Musik bewusst eingeschaltet wurde. */
export function waehleMusikstil(stil: RadioStil) {
  if (stand.stil === stil) return
  if (stand.an || stand.startet) void spiele(stil, zielpegel)
  else melde({ ...stand, stil, fehler: null })
}

export function useSitzungsmusik() {
  return useSyncExternalStore(abonniere, snapshot)
}
