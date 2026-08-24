import type { BerufDef } from '@/khpl/berufe/typen'
import {
  MERKMALE,
  leererVektor,
  type MerkmalGewichte,
  type MerkmalId,
  type MerkmalVektor,
} from './merkmale'

/**
 * Das Matching. Portiert aus dem Vorgänger-Repo `kh-connect`
 * (`src/domain/matching.ts`), wo es unter Tests stand und zwei Fallen bereits
 * eingefangen hat, die man sonst zweimal baut. Beide sind hier erhalten:
 *
 * **1. Fragen wiegen doppelt.** Eine beantwortete Frage ist eine Aussage. Ein
 * Werkzeug, nach dem jemand greift, ist ein Indiz. Beides gleich zu wiegen
 * hieße, die Personalisierung zum Fragebogen zu erklären, den sie nicht ist.
 *
 * **2. Zurückgesagt wird nur, was jemand ausdrücklich gesagt hat**
 * (`zitierbar`). Der Grund steht in der Vorlage und ist es wert, wiederholt zu
 * werden: die Min-Max-Normierung hebt *jedes* unberührte Merkmal auf einen
 * positiven Wert, sobald irgendein Merkmal negativ wurde. Der normierte Vektor
 * kann danach „dazu ja gesagt“ nicht mehr von „nie erwähnt“ unterscheiden. Wer
 * die Erklärungen daraus speist, erzählt jemandem, der jede Frage übersprungen
 * hat, er möge Höhe.
 */

export const FRAGEN_GEWICHT = 2

/** Unterhalb dieser Gesamtstärke hat der Besucher praktisch nichts gesagt. */
const KALTSTART_EPSILON = 0.05

/**
 * Ein Merkmal darf nur zurückgesagt werden, wenn der Besucher echtes Gewicht
 * dahinter gesetzt hat — mindestens diesen Anteil seines eigenen stärksten
 * Signals.
 */
const ZITIERBAR_ANTEIL = 0.4

export interface Signal {
  gewichte: MerkmalGewichte
  faktor?: number
  /**
   * Ob dieses Signal eine ausdrückliche Aussage des Besuchers ist, die man ihm
   * zitieren darf. Eine Frage zu beantworten ist eine; einen Helm in Blau zu
   * wählen ist keine.
   */
  zitierbar?: boolean
}

export interface BesucherVektor {
  vektor: MerkmalVektor
  /**
   * Rohsummen **nur der zitierbaren** Quellen, vor der Normierung. Grundlage
   * für „Du magst …“ — siehe Kopfkommentar, Punkt 2.
   */
  roh: Record<MerkmalId, number>
  /** Der Besucher hat (fast) nichts gesagt. Dann gibt es keinen Vorschlag. */
  kaltstart: boolean
}

function addiere(
  ziel: Record<MerkmalId, number>,
  gewichte: MerkmalGewichte,
  faktor: number,
) {
  for (const m of MERKMALE) {
    const w = gewichte[m]
    if (w !== undefined) ziel[m] += w * faktor
  }
}

/** Min-Max-normiert auf 0..1, damit Sitzungen vergleichbar bleiben. */
export function baueBesucherVektor(signale: readonly Signal[]): BesucherVektor {
  const summe = leererVektor()
  const zitierbar = leererVektor()
  for (const { gewichte, faktor, zitierbar: z } of signale) {
    addiere(summe, gewichte, faktor ?? 1)
    if (z) addiere(zitierbar, gewichte, faktor ?? 1)
  }

  const werte = MERKMALE.map((m) => summe[m])
  const staerke = werte.reduce((s, v) => s + Math.abs(v), 0)
  if (staerke < KALTSTART_EPSILON) {
    return { vektor: leererVektor(), roh: zitierbar, kaltstart: true }
  }

  const min = Math.min(...werte, 0)
  const max = Math.max(...werte)
  const spanne = max - min || 1
  const vektor = Object.fromEntries(
    MERKMALE.map((m) => [m, (summe[m] - min) / spanne]),
  ) as MerkmalVektor

  return { vektor, roh: zitierbar, kaltstart: false }
}

/** Merkmale, die der Besucher stark genug geäußert hat, um sie zu hören. */
export function zitierbareMerkmale(roh: Record<MerkmalId, number>): MerkmalId[] {
  const staerkstes = Math.max(...MERKMALE.map((m) => roh[m]), 0)
  if (staerkstes <= 0) return []
  return MERKMALE.filter((m) => roh[m] >= staerkstes * ZITIERBAR_ANTEIL).sort(
    (a, b) => roh[b] - roh[a],
  )
}

function kosinus(a: MerkmalVektor, b: MerkmalVektor): number {
  let punkt = 0
  let normA = 0
  let normB = 0
  for (const m of MERKMALE) {
    punkt += a[m] * b[m]
    normA += a[m] * a[m]
    normB += b[m] * b[m]
  }
  if (normA === 0 || normB === 0) return 0
  return punkt / (Math.sqrt(normA) * Math.sqrt(normB))
}

export interface Treffer {
  beruf: BerufDef
  /** 0..100, gerundet. Nur zur Anzeige — sortiert wird über den Rohwert. */
  punkte: number
  /**
   * Die Merkmale, die diesen Beruf **und** den Besucher stark machen. Genau
   * daraus wird der Begründungssatz gebaut, und nur daraus.
   */
  merkmale: MerkmalId[]
}

/**
 * Rangfolge über alle Berufe. Angekündigte Berufe (`graph === null`) laufen
 * bewusst mit: sie sind Teil des Angebots, und ein Vorschlag, der sie
 * unterschlägt, würde beim Freischalten still die Empfehlung ändern.
 */
export function ranke(besucher: BesucherVektor, berufe: readonly BerufDef[]): Treffer[] {
  const zitierbar = new Set(zitierbareMerkmale(besucher.roh))

  return berufe
    .map((beruf) => {
      const punkte = kosinus(besucher.vektor, beruf.merkmale)
      return {
        beruf,
        punkte: Math.round(Math.max(0, punkte) * 100),
        // Nur was beiden gehört: der Besucher hat es gesagt, und der Beruf
        // bedient es wirklich. „Du magst Technik“ unter einem Beruf mit
        // technik 0.2 ist eine Begründung, die gegen sich selbst spricht.
        merkmale: MERKMALE.filter(
          (m) => zitierbar.has(m) && beruf.merkmale[m] >= 0.6,
        ).slice(0, 2),
      }
    })
    .sort((a, b) => b.punkte - a.punkte)
}
