/**
 * Der Kanon der Zerspanungs-Bühne: **Farben, das Maß des Tages und die
 * Zustandsformen**, die Steps und Zeichnungen gemeinsam brauchen.
 *
 * Dieselbe Trennung wie bei `buehne/anlagenmechanik/kanon.ts`: Steps
 * importieren Laufzeitwerte der Bühne ausschließlich von hier, aus den
 * Bühnenmodulen selbst nur `import type`. **Dieser Tag hat kein `three`** —
 * seine Bühnen sind Zeichnungen (technische Zeichnung, Werkzeugweg,
 * Messschraube) und dürfen statisch importiert werden.
 *
 * **Die Farbregel:** Stahl lebt ausschließlich auf der Bühne, nie in der
 * Bedienung. Orange erscheint als Linie und Glanz — der laufende Span, das
 * gefundene Maß —, nie als Fläche unter einem Knopf. Es bleibt bei genau
 * einer gefüllten Signalfläche pro Screen, und das ist *Weiter*.
 */

// ---------------------------------------------------------------------------
// Farben — Bühnen-Konstanten, keine Tokens
// ---------------------------------------------------------------------------

/**
 * Stahl: eine kühle, entsättigte Graufamilie mit einem blanken Glanzton.
 * Bewusst **kein** neuer Token in `src/index.css` — das Metall ist die
 * Geschichte dieses einen Berufs, keine Aussage des Designsystems.
 */
export const STAHL = {
  /** Konturlinien der Zeichnungen. */
  linie: '#93a1ad',
  /** Nebenlinien: Mittellinien, Raster, Maßhilfslinien. */
  linieMatt: '#525d68',
  /** Gefüllte Flächen: Futter, Bügel, Schlitten. */
  flaeche: '#242b32',
  /** Dunklere Fläche dahinter — Tiefe, kein Schwarz. */
  tiefe: '#171c21',
  /** Blankes, frisch gedrehtes Metall. */
  blank: '#c6d2dc',
  /** Das Glanzlicht darauf — die Kante, an der es rund wird. */
  glanz: '#eef4f9',
} as const

/**
 * Warm: dieselbe Orangefamilie wie überall (`--color-kh-orange`), hier als
 * Zeichnungswerte gespiegelt — der Span, der Schnitt, das entscheidende Maß.
 */
export const WARM = {
  linie: '#ff9f2a',
  heiss: '#ff7a1a',
  schimmer: '#8a4a00',
} as const

// ---------------------------------------------------------------------------
// Das Maß des Tages
// ---------------------------------------------------------------------------

/**
 * Der Lagersitz des Bolzens: **Ø 25 h7**.
 *
 * Nach ISO 286 heißt h7 bei Nennmaß 18–30 mm: höchstes Maß = Nennmaß,
 * kleinstes Maß = Nennmaß − 0,021 mm. Die digitale Messschraube des Tages
 * zeigt zwei Nachkommastellen, deshalb rechnet das Spiel mit dem auf
 * Hundertstel gerundeten Fenster **24,98 bis 25,00** — die Erklärtexte
 * nennen die echten 21 Tausendstel.
 */
export const SOLL = { unten: 24.98, oben: 25.0 } as const

/**
 * Was das erste Teil misst: **absichtlich vier Hundertstel zu groß.**
 *
 * Das ist das Aufmaß — die Sicherheitsreserve beim Einrichten. Zu groß kann
 * man nachdrehen, zu klein ist Ausschuss; deshalb lässt niemand das erste
 * Teil „auf Anschlag“ laufen.
 */
export const ERSTES_MASS = 25.04

/** Eine Korrektur wird in Hundertsteln eingegeben — das Raster des Tages. */
export const KORREKTUR_SCHRITT = 0.01

/**
 * Die Drehzahl der Auflösung in Z2, in Umdrehungen je Minute.
 *
 * Abgeleitet, nicht gesetzt: Hartmetall auf Baustahl schneidet mit rund
 * 200 m/min Schnittgeschwindigkeit; bei Ø 25 mm ist das
 * n = 200.000 / (π · 25) ≈ 2.546 — auf dem Screen steht „rund 2.500“.
 * Die Anker daneben: der Schleudergang einer Waschmaschine (1.400) und das
 * Radfahrtempo, mit dem die Oberfläche an der Schneide vorbeiläuft
 * (200 m/min = 12 km/h).
 */
export const DREHZAHL = 2500
export const WASCHMASCHINE = 1400

/** Ein Maß als deutsche Zahl mit zwei Nachkommastellen: `25,04`. */
export function mm(wert: number): string {
  return wert.toFixed(2).replace('.', ',')
}

// ---------------------------------------------------------------------------
// Das Teil — eine Geometrie, drei Zeichnungen
// ---------------------------------------------------------------------------

/**
 * Der Bolzen des Tages, in Millimetern. **Eine Welt, viele Zustände:**
 * die technische Zeichnung (Z1), der Werkzeugweg (Z3) und die Messschraube
 * (Z4) zeigen dasselbe Teil aus denselben Zahlen — nicht drei Teile, die
 * einander ähneln.
 *
 * Vorn (an der Planseite) der Lagersitz Ø 25 h7, 22 lang, mit Fase 1 × 45°;
 * dahinter der Absatz Ø 20, 16 lang. Gesamt 38.
 */
export const TEIL = {
  sitzDurchmesser: 25,
  sitzLaenge: 22,
  schaftDurchmesser: 20,
  schaftLaenge: 16,
  gesamt: 38,
  fase: 1,
} as const

// ---------------------------------------------------------------------------
// Zustände der Zeichnungen
// ---------------------------------------------------------------------------

/** Ein antippbares Maß auf der Zeichnung (Z1). */
export type MassId = 'laenge' | 'schaft' | 'sitz' | 'fase'

/** Ein NC-Satz des Schlichtgangs (Z3). */
export type SatzId = 'n10' | 'n20' | 'n30' | 'n40'

/** Reihenfolge der Sätze — die Bühne fährt sie in dieser Ordnung. */
export const SAETZE: readonly SatzId[] = ['n10', 'n20', 'n30', 'n40']

/** Z1 — die technische Zeichnung. */
export interface ZeichnungZustand {
  angetippt: readonly MassId[]
  /** Das zuletzt angetippte Maß — es hebt sich heraus. */
  offen: MassId | null
  /** Das entscheidende Maß ist gefunden — es bleibt warm markiert. */
  gefunden: boolean
}

/** Z3 — der Werkzeugweg über dem Teil. */
export interface WegZustand {
  /** Der Satz, den die Zeichnung gerade abfährt. `null` = Werkzeug wartet. */
  aktiv: SatzId | null
  /** Schon abgefahrene Sätze — ihre Bahn bleibt stehen. */
  gesehen: readonly SatzId[]
  /** Die Fase ist gefunden — ihr Stück der Bahn bleibt warm. */
  geloest: boolean
}

/** Z4 — die Messschraube. */
export interface MessungZustand {
  /** Was die Anzeige zeigt. `null` = noch nichts gemessen. */
  wert: number | null
  /** Die Spindel fährt gerade zu — die Anzeige zählt hoch. */
  misst: boolean
}
