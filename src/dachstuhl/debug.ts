import type { BauteilTyp } from './bauteil-texte'
import { BAUTEIL_TEXTE } from './bauteil-texte'
import type { Ansicht } from './kamera'
import { ANSICHTEN } from './kamera'
import { klemme } from './zeitachse'

/**
 * Debug-Schnittstelle (Bauplan 6). Unbekannte Werte fallen still auf den
 * Default zurueck — ein Tippfehler in der URL darf die Seite nicht zerlegen.
 */

export interface Auswahl {
  typ: BauteilTyp
  /** null = alle Teile dieses Typs. */
  index: number | null
}

export interface DebugZustand {
  ansicht: Ansicht | null
  /** Fester Zeitpunkt. Ist er gesetzt, laeuft die Animation nicht. */
  t: number | null
  teil: Auswahl | null
  lattungAnteil: number | null
  dpr: number | null
  perf: boolean
  theme: 'hell' | 'dunkel' | null
  /** Irgendein Parameter gesetzt: Attraktor-Modus und Bedienleiste bleiben aus. */
  aktiv: boolean
}

function istBauteilTyp(wert: string): wert is BauteilTyp {
  return Object.hasOwn(BAUTEIL_TEXTE, wert)
}

function zahl(wert: string | null): number | null {
  if (wert === null) return null
  const n = Number(wert)
  return Number.isFinite(n) ? n : null
}

export function leseDebug(suche: string): DebugZustand {
  const p = new URLSearchParams(suche)

  const ansichtRoh = p.get('view')
  const ansicht =
    ansichtRoh !== null && (ANSICHTEN as string[]).includes(ansichtRoh)
      ? (ansichtRoh as Ansicht)
      : null

  const tRoh = zahl(p.get('t'))
  const t = tRoh === null ? null : klemme(tRoh, 0, 1)

  let teil: Auswahl | null = null
  const teilRoh = p.get('teil')
  if (teilRoh !== null && teilRoh !== '') {
    const trenner = teilRoh.lastIndexOf(':')
    const typ = trenner > 0 ? teilRoh.slice(0, trenner) : teilRoh
    const indexRoh = trenner > 0 ? zahl(teilRoh.slice(trenner + 1)) : null
    if (istBauteilTyp(typ)) teil = { typ, index: indexRoh }
  }

  const lattenRoh = zahl(p.get('latten'))
  const dprRoh = zahl(p.get('dpr'))
  const themeRoh = p.get('theme')

  return {
    ansicht,
    t,
    teil,
    lattungAnteil: lattenRoh === null ? null : klemme(lattenRoh, 0, 1),
    dpr: dprRoh === null ? null : klemme(dprRoh, 1, 3),
    perf: p.get('perf') === '1',
    theme: themeRoh === 'hell' || themeRoh === 'dunkel' ? themeRoh : null,
    aktiv:
      ansicht !== null ||
      t !== null ||
      teil !== null ||
      lattenRoh !== null ||
      dprRoh !== null ||
      p.get('perf') === '1',
  }
}

/** Trifft die Auswahl dieses Bauteil? */
export function passt(auswahl: Auswahl | null, typ: BauteilTyp, index: number | null): boolean {
  if (auswahl === null) return false
  if (auswahl.typ !== typ) return false
  return auswahl.index === null || auswahl.index === index
}
