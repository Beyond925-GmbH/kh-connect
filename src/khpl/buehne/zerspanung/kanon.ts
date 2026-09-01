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

// ---------------------------------------------------------------------------
// Z3 — die NC-Sätze, die die Werkzeugweg-Bühne fährt
// ---------------------------------------------------------------------------

/**
 * Ein NC-Satz, wie Z3 ihn zeigt und die Bühne ihn fährt. **Eine Quelle für
 * Code und Bewegung:** das Panel druckt `code`, die Bühne rechnet aus `x`/`z`
 * die Bahn — so kann die Zeile auf dem Screen der Fahrt auf der Bühne nie
 * widersprechen.
 *
 * Drehmaschinen-Konvention wie überall an diesem Tag: **X ist ein
 * Durchmesserwort**, Z die Länge ab Stirnfläche (negativ Richtung Futter).
 * Fehlt eine Achse, bleibt sie stehen — genau wie in echtem G-Code.
 */
export interface NcSatz {
  /** Die Zeile, wie sie im Programm steht. */
  code: string
  /** Ziel-Durchmesser in mm. */
  x?: number
  /** Ziel-Position in mm ab Stirnfläche. */
  z?: number
  /** 0 = Eilgang (schnell, schneidet nichts), 1 = Vorschub. */
  g: 0 | 1
  /** Fliegt dabei ein Span? G1 durch Luft (anstellen, antasten) schneidet nichts. */
  span?: boolean
  /** Fahrzeit auf der Bühne in Sekunden. */
  dauer: number
}

/**
 * Kapitel 1 der Z3-Bühne: **drei Befehle, eine Übungs-Stange** (Ø 24).
 * Bewusst das kleinstmögliche Programm, das trotzdem etwas herstellt —
 * hinfahren, zustellen, eine gerade Linie schneiden. Die Nut, die dabei
 * entsteht (Ø 20, 30 lang), ist der ganze Beweis: drei Zeilen, ein Absatz.
 */
export const UEBUNGS_SAETZE: readonly NcSatz[] = [
  { code: 'G0 X26 Z2', x: 26, z: 2, g: 0, dauer: 0.8 },
  { code: 'G1 X20', x: 20, g: 1, dauer: 0.9 },
  { code: 'G1 Z-30', z: -30, g: 1, span: true, dauer: 2.4 },
]

/**
 * Kapitel 2: **das Programm für den Bolzen des Tages** — Schruppen in drei
 * Schnitten, dann der Schlichtgang mit Fase, wie ihn Z1 zeichnet (Ø 25 h7,
 * Sitz 22 lang, Fase 1 × 45°, Schaft Ø 20 dahinter).
 *
 * **Fachlich vereinfacht, aber in sich konsistent:** Rohstange Ø 28; alle
 * Schnitte enden bei Z −34, damit vor den Spannbacken ein Bund Rohmaterial
 * stehen bleibt — abgestochen wird später, nicht in diesem Programm. Der
 * Schaft ist deshalb hier 12 statt 16 mm frei; für die Bühne zählt die
 * Silhouette, nicht die Stückliste. Der Dialekt wäre SINUMERIK — gesagt wird
 * das dem Besucher nicht: Z3 zeigt das Konzept, nicht die Syntax.
 */
export const PROGRAMM_SAETZE: readonly NcSatz[] = [
  { code: 'N10 G0 X26 Z2', x: 26, z: 2, g: 0, dauer: 0.6 },
  { code: 'N20 G1 Z-34 F0.2', z: -34, g: 1, span: true, dauer: 2.4 },
  { code: 'N30 G0 X32', x: 32, g: 0, dauer: 0.35 },
  { code: 'N40 G0 Z-22', z: -22, g: 0, dauer: 0.5 },
  { code: 'N50 G1 X23', x: 23, g: 1, span: true, dauer: 0.5 },
  { code: 'N60 G1 Z-34', z: -34, g: 1, span: true, dauer: 1.6 },
  { code: 'N70 G0 X32', x: 32, g: 0, dauer: 0.35 },
  { code: 'N80 G0 Z-22', z: -22, g: 0, dauer: 0.45 },
  { code: 'N90 G1 X20', x: 20, g: 1, span: true, dauer: 0.5 },
  { code: 'N100 G1 Z-34', z: -34, g: 1, span: true, dauer: 1.6 },
  { code: 'N110 G0 X32', x: 32, g: 0, dauer: 0.35 },
  { code: 'N120 G0 Z2', z: 2, g: 0, dauer: 0.6 },
  { code: 'N130 G0 X23', x: 23, g: 0, dauer: 0.3 },
  { code: 'N140 G1 Z0 F0.1', z: 0, g: 1, dauer: 0.45 },
  { code: 'N150 G1 X25 Z-1', x: 25, z: -1, g: 1, span: true, dauer: 0.5 },
  { code: 'N160 G1 Z-22', z: -22, g: 1, span: true, dauer: 1.9 },
  { code: 'N170 G0 X44 Z16', x: 44, z: 16, g: 0, dauer: 0.7 },
]

/** Die zwei Kapitel der Z3-Bühne: erst drei Befehle, dann das Programm. */
export type Kapitel = 'befehle' | 'programm'

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
  /** Welches Kapitel die Bühne zeigt — es bestimmt Sätze, Rohteil und Kontur. */
  kapitel: Kapitel
  /**
   * Der angetippte Befehl (Index in die Satzliste des Kapitels) — sein Stück
   * Bahn pulsiert als Vorschau. `null` = nichts markiert.
   */
  markiert: number | null
  /**
   * Zähler der gestarteten Fahrten. Jede Erhöhung startet die Fahrt von
   * vorn — `0` heißt: noch nie gefahren. Ein Zähler statt eines Booleans,
   * damit „Nochmal abspielen“ ohne Zwischenzustand auskommt.
   */
  fahrt: number
  /**
   * Das Kapitel wurde schon einmal zu Ende gefahren — beim Mounten (etwa nach
   * einem Wiederbesuch) steht die Bühne dann gleich im Endzustand.
   */
  gefahren: boolean
}

/** Z4 — die Messschraube. */
export interface MessungZustand {
  /** Was die Anzeige zeigt. `null` = noch nichts gemessen. */
  wert: number | null
  /** Die Spindel fährt gerade zu — die Anzeige zählt hoch. */
  misst: boolean
}
