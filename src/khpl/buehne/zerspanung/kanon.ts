/**
 * Die Maße dieses Tages — an einer Stelle, three-frei.
 *
 * **Ein Profil, alle Ansichten.** Die Zeichnung in Z1, der Werkzeugweg in Z3,
 * das Teil in der Messschraube in Z5 und ein möglicher Drehkörper in Z2 zeigen
 * dasselbe Stück (khpl-tag-zerspanung.md §7). Läge das Profil in der Bühne,
 * hätte es jeder Screen einmal — und beim zweiten Screen wäre es ein anderes.
 *
 * **Warum eine eigene Datei.** Wird der Drehkörper in Z2 wirklich in 3D
 * gebaut, liegt daneben eine `lazy()`-Komponente, die `three` nachzieht. Ein
 * Wert-Export neben so einer Komponente wird von den Steps statisch importiert
 * und zieht `three` in den Erststart (README, `INEFFECTIVE_DYNAMIC_IMPORT`) —
 * dieselbe Regel und derselbe Grund wie bei `buehne/kanon.ts`. Steps und Bühne
 * holen Laufzeitwerte ausschließlich hier.
 */

// ---------------------------------------------------------------------------
// Das Teil — Ø 20 h7, 35 mm lang, vorn eine Fase 2 × 45°
// ---------------------------------------------------------------------------

/** Nennmaß des Durchmessers in mm. */
export const NENNMASS = 20

/**
 * Die Toleranzzone von `Ø 20 h7` in mm. `BELEGT` nach ISO 286
 * (`belege/zerspanung.md` 1): IT7 ist im Nennmaßbereich 18–30 mm 21 µm, und
 * die Lage „h“ setzt das obere Abmaß auf null.
 *
 * ⚠️ **Die Werte hängen am Nennmaß.** Bei Ø 50 wären es 25 µm. Maß und
 * Toleranz gehören deshalb auf jedem Screen zusammen.
 */
export const GROESSTMASS = 20.0
export const KLEINSTMASS = 19.979
/** 0,021 mm — die Zahl, die dem Tag seinen Titel gibt. */
export const TOLERANZ = Number((GROESSTMASS - KLEINSTMASS).toFixed(3))

/** Länge des gedrehten Abschnitts in mm (aus dem Programm, Zeile `G1 Z-35.`). */
export const LAENGE = 35

// ---------------------------------------------------------------------------
// Z1 — die drei Wellen
// ---------------------------------------------------------------------------

/** Wie sich eine Welle im Lagersitz verhält. */
export type Sitz = 'lose' | 'sitzt' | 'klemmt'

/**
 * Die drei Wellen aus Z1 — **auf der Zeichnung stehen bei allen dreien
 * dieselben zwei Zeichen: Ø 20.**
 *
 * Das ist der ganze Screen. Ein Sechzehnjähriger, der zum ersten Mal eine
 * Zeichnung sieht, liest „Ø 20“ als *die* Angabe und hält drei Teile mit
 * derselben Angabe für dasselbe Teil. Erst wenn er sie nacheinander in den
 * Sitz schiebt, merkt er, dass zwei davon nicht gehen — und dann erst wird
 * `h7` zu einer Information statt zu einem Kürzel.
 *
 * Die Werte liegen absichtlich **nicht symmetrisch** um das Nennmaß: Die Zone
 * `h7` reicht von 19,979 bis 20,000, also ausschließlich nach unten. Ein Teil,
 * das mit 20,031 zu groß ist, ist nach der Zeichnung schon bei 20,001 zu groß
 * — und genau diese Schieflage ist der Grund, warum man sich in Serie von oben
 * an das Maß heranarbeitet (siehe `MESSWERTE` weiter unten).
 *
 * ⚠️ **Die Reihenfolge ist die Reihenfolge auf dem Screen** und beginnt
 * bewusst nicht mit der richtigen: Wer beim ersten Griff Glück hat, lernt
 * nichts.
 */
export const WELLEN: readonly {
  readonly id: 'A' | 'B' | 'C'
  /** Der wirklich gemessene Durchmesser in mm. */
  readonly wert: number
  readonly sitz: Sitz
}[] = [
  { id: 'A', wert: 19.962, sitz: 'lose' },
  { id: 'B', wert: 19.988, sitz: 'sitzt' },
  { id: 'C', wert: 20.031, sitz: 'klemmt' },
]

/**
 * Der Abstand zwischen der Welle, die sitzt, und der, die nicht mehr reingeht,
 * in mm — die Zahl, mit der der Screen auflöst.
 *
 * Sie wird **gerechnet und nicht geschrieben**: Ändert jemand oben einen Wert,
 * darf die Auflösung nicht stehen bleiben und etwas Falsches behaupten.
 */
export const WELLEN_ABSTAND = Number(
  (
    (WELLEN.find((w) => w.sitz === 'klemmt')?.wert ?? 0) -
    (WELLEN.find((w) => w.sitz === 'sitzt')?.wert ?? 0)
  ).toFixed(3),
)

/**
 * Dicke eines Kopfhaares in mm — der Körper-Anker dieses Tages (R12).
 *
 * ⚠️ `belege/zerspanung.md` 2 gibt 50–70 µm an; Haardicke streut um den Faktor
 * drei. Auf dem Screen steht deshalb immer „ungefähr“ und nie eine Rechnung
 * mit zwei Nachkommastellen.
 */
export const HAAR = 0.06

/** Fase vorn: 2 mm unter 45°. */
export const FASE = 2

/**
 * Die Kontur als Halbschnitt, von der Stirnfläche nach hinten: `z` läuft ins
 * Material (negativ, wie im Programm), `r` ist der Radius.
 *
 * Für die Zeichnung (Z1) wird das Profil an der Achse gespiegelt, für den
 * Werkzeugweg (Z3) genau so abgefahren, für einen Drehkörper (Z2) rotiert.
 */
export const PROFIL: readonly { readonly z: number; readonly r: number }[] = [
  { z: 0, r: NENNMASS / 2 - FASE },
  { z: -FASE, r: NENNMASS / 2 },
  { z: -LAENGE, r: NENNMASS / 2 },
]

/**
 * Durchmesser des Rohlings in mm — **ein Bühnenmaß, keine Fachaussage.** Es
 * sagt nur, wie viel dicker das Rohteil in Z2 aussieht als das fertige Teil;
 * eine Zugabe hängt in Wahrheit an Werkstoff, Verfahren und Betrieb und
 * erscheint deshalb auf keinem Screen als Zahl.
 */
export const ROHLING_DURCHMESSER = 22

// ---------------------------------------------------------------------------
// Z2 — der Nullpunkt
// ---------------------------------------------------------------------------

/**
 * Die drei Stellen, an die der Besucher den Werkstücknullpunkt legen kann.
 *
 * **Drei benannte Orte statt einer freien Zieh-Geste.** Die Foto-Fassung ließ
 * ein Fadenkreuz frei über ein Fräsmaschinen-Motiv ziehen und prüfte gegen
 * einen Treffer-Radius — mit zwei verschiedenen Schwellen in Bühne und Panel,
 * einem Motiv aus dem falschen Gewerk (gefräst statt gedreht) und einem
 * Versatz in „Millimetern“, die ein gefundenes Foto gar nicht hergibt. Drei
 * antippbare Orte auf der gezeichneten Maschine prüfen stattdessen genau das,
 * worum es geht: **erkennt jemand, dass Null ans Werkstück gehört** — nicht,
 * wie ruhig seine Hand ist. Wo die Orte auf der Bühne liegen, ist Bühnenmaß
 * und steht in `Maschine.tsx`; welcher richtig ist, entscheidet die Fachlogik
 * hier.
 */
export type NullWahl = 'futter' | 'werkzeug' | 'stirn'

/** Die Stelle, ab der das Programm wirklich zählt: vorn am Werkstück. */
export const NULL_RICHTIG = 'stirn' satisfies NullWahl

// ---------------------------------------------------------------------------
// Z3 — das Programm
// ---------------------------------------------------------------------------

/**
 * Welche Steuerung der Screen annimmt. **Muss sichtbar dabeistehen**
 * (`khpl-tag-zerspanung.md` §6 Z3): Heidenhain schreibt Klartext, Siemens
 * ShopTurn ist grafisch — „so sieht jedes CNC-Programm aus“ wäre falsch.
 */
export const STEUERUNG = 'ISO-Code nach DIN 66025, wie ihn eine Fanuc-Steuerung liest'

export interface Programmzeile {
  /** Der Code, so wie er auf dem Bildschirm der Maschine stünde. */
  code: string
  /** Die Klammer dahinter — im echten Programm ein Kommentar. */
  kommentar: string
  /**
   * Zeichnet diese Zeile ein Stück Kontur? Rüstzeilen (Werkzeug, Drehzahl,
   * Kühlung) tun das nicht — der Werkzeugweg wächst nur bei Fahrbefehlen.
   */
  faehrt?: boolean
}

/**
 * Das Schlichtprogramm für die Welle Ø 20 h7 mit Fase — vierzehn Zeilen,
 * `belege/zerspanung.md` 7. Dieselbe Kontur, die Z1 als Zeichnung zeigt.
 *
 * ⚠️ **Von der Recherche selbst verfasst und syntaktisch geprüft, aber nicht
 * von einem Zerspaner gegengelesen** (§11). Vor dem Messetag fachlich
 * abnehmen lassen.
 */
export const PROGRAMM: readonly Programmzeile[] = [
  // `D20` statt des `OE20` aus dem Beleg: In einem ISO-Kommentar ist kein „Ø“
  // tippbar, und in der Werkstatt schreibt man dafür `D` oder `DM` — eine
  // ae/oe/ue-Ersatzschreibung fällt ausgerechnet auf dem Screen auf, der
  // dieselbe Kontur wie die Zeichnung („Ø 20 h7“) zeigt. Sachlich gleich; das
  // Programm ist ohnehin von der Recherche selbst verfasst.
  { code: '(SCHLICHTEN WELLE D20 H7)', kommentar: 'Programmkopf' },
  {
    code: 'G21 G40 G90',
    // „Schneidenradiuskorrektur“ flog raus (R10): ein hochspezifischer
    // Fachbegriff ohne Glossar-Chip, in einer Rüstzeile, die für die Lektion
    // des Screens keine Rolle spielt. Sachlich bleibt es dieselbe Zeile.
    kommentar: 'Grundeinstellung der Steuerung',
  },
  { code: 'T0101', kommentar: 'Schlichtdrehmeißel' },
  { code: 'G50 S4000', kommentar: 'Drehzahl begrenzen' },
  { code: 'G96 S200 M4', kommentar: 'konstante Schnittgeschwindigkeit 200 m/min' },
  { code: 'M8', kommentar: 'Kühlung ein' },
  { code: 'G0 X16. Z2.', kommentar: 'anfahren, vor der Stirnfläche', faehrt: true },
  { code: 'G1 Z0 F0.15', kommentar: 'an die Kontur', faehrt: true },
  { code: 'G1 X20. Z-2.', kommentar: 'Fase 2 × 45 Grad', faehrt: true },
  { code: 'G1 Z-35.', kommentar: 'längs drehen auf Ø 20', faehrt: true },
  { code: 'G1 X24.', kommentar: 'radial freifahren', faehrt: true },
  { code: 'G0 X100. Z50. M9', kommentar: 'Rückzug, Kühlung aus', faehrt: true },
  { code: 'M5', kommentar: 'Spindel stopp' },
  { code: 'M30', kommentar: 'Programmende' },
]

/**
 * Index der Zeile, in der der eingebaute Fehler sitzt — `G1 Z-35.`.
 *
 * **Der Fehler ist das fehlende Minuszeichen** (`belege/zerspanung.md` 7,
 * §11): `G1 Z35.` fährt das Werkzeug vom Werkstück weg statt an ihm entlang.
 * Er ist sichtbar (ein Zeichen), findbar (man vergleicht zwei Zeilen) und die
 * Sorte Fehler, über die in der Halle wirklich geredet wird.
 *
 * ⚠️ **Nicht „eine Zustellung zu tief“.** Das stand in der ersten Fassung der
 * Spec und wird von §11 ausdrücklich ersetzt; §6 Z3 trägt den alten Satz noch
 * an einer Stelle mit. Gemeldet, nicht gelöst.
 */
export const FEHLERZEILE = 9

/** Die falsche Fassung dieser Zeile — mit ihr fährt das Werkzeug ins Leere. */
export const FEHLER_CODE = 'G1 Z35.'

// ---------------------------------------------------------------------------
// Z5 — die drei Messwerte
// ---------------------------------------------------------------------------

export type Urteil = 'gut' | 'nacharbeit' | 'ausschuss'

/**
 * Die drei Werte und ihre Asymmetrie — die eigentliche Lektion des Tages
 * (§6 Z5, abgeleitet aus der Toleranz oben).
 *
 * Zu groß ist ein Problem, zu klein ist ein Verlust. Deshalb fährt man sich in
 * Serie **von oben** an das Maß heran.
 *
 * **Der erste Durchgang ist `19.987`**: wer beim ersten Mal ein gutes Teil
 * richtig als gut erkennt, hat verstanden, dass Messen nicht Fehlersuche ist,
 * sondern Prüfen.
 */
export const MESSWERTE: readonly { readonly wert: number; readonly urteil: Urteil }[] = [
  { wert: 19.987, urteil: 'gut' },
  { wert: 20.015, urteil: 'nacharbeit' },
  { wert: 19.97, urteil: 'ausschuss' },
]

/** Um wie viel der Werkzeugkorrektor in Beat 2 verstellt wird, in mm. */
export const KORREKTUR_SCHRITT = 0.01

/** Das Urteil, das ein Messwert nach der Toleranz oben verdient. */
export function urteilFuer(wert: number): Urteil {
  if (wert > GROESSTMASS) return 'nacharbeit'
  if (wert < KLEINSTMASS) return 'ausschuss'
  return 'gut'
}

// ---------------------------------------------------------------------------
// Bewegung
// ---------------------------------------------------------------------------

/**
 * Raster, keine Springs (§7). Kurze, harte Kurve — die bewusste Gegenbewegung
 * zur pendelnden Masse des Zimmerer-Tages.
 */
export const RASTER_KURVE = [0.2, 0, 0, 1] as const

/** Sekunden je Programmzeile, wenn sich der Werkzeugweg zeichnet. */
export const ZEILEN_DAUER = 0.35
