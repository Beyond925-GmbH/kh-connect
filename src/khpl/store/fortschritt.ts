import { useSyncExternalStore } from 'react'
import type { StepGraph, StepId } from '@/khpl/flow/steps'
import { istStepId, railIndex, step } from '@/khpl/flow/steps'
import { beruf, istBerufId } from '@/khpl/berufe/registry'
import type { BerufId } from '@/khpl/berufe/typen'
import type { HelmWahl } from '@/khpl/match/helm'

/**
 * Sitzungszustand nach khpl-ui-shell.md 7, erweitert um die vier Berufe.
 *
 * Bewusst gegen khpl-flow.md 5 entschieden. Die Flow-Spec verlangt „kein Zustand
 * überlebt einen Reset“, die UI-Shell-Spec löst genau diesen Widerspruch später
 * und ausdrücklich auf: Idle **löscht nichts**, es bringt die App nur auf den
 * Splash zurück. Der nächste Besucher wählt dort „Neu starten“, wer nur kurz
 * abgelenkt war „Weitermachen“. Die 30-Minuten-Verfallszeit sorgt dafür, dass
 * ein Stand von heute früh niemandem mehr gehört.
 *
 * **Was sich mit den vier Berufen ändert.** Der Fortschritt hängt nicht mehr an
 * der Sitzung, sondern **je Beruf** an ihr. Das ist die Bedingung dafür, dass
 * der Wechsel im Sheet „Dein Weg“ folgenlos ist: wer den Zimmerer bei M5
 * verlässt, findet ihn bei M5 wieder. Ohne das bräuchte jeder Wechsel eine
 * Rückfrage — und eine Rückfrage vor jedem Wechsel heißt, dass niemand
 * wechselt.
 *
 * Helm und Antworten liegen dagegen **an der Sitzung**, nicht am Beruf: sie
 * gehören dem Besucher, nicht dem Tag, und speisen den Vorschlag genau einmal.
 */

const SPEICHER_SCHLUESSEL = 'khpl-progress'

/** Älter als das, gehört der Stand niemandem mehr (khpl-ui-shell.md 7). */
export const VERFALL_MS = 30 * 60 * 1000

/**
 * Welcher Screen gerade läuft. Nie persistiert.
 *
 * Die ersten fünf sind der Trichter (S0–S4), danach beginnt die Anwendung, die
 * es vorher schon gab. `bald` ist der Ausgang für einen Beruf ohne Graph.
 */
export type Bildschirm =
  'splash' | 'helm' | 'fragen' | 'vorschlag' | 'berufe' | 'intro' | 'step' | 'bald'

/**
 * Typisierte Sicht auf `answers`. Bleibt zur Laufzeit ein reines JSON-Objekt.
 *
 * **Vier Abschnitte, einer je Beruf** (khpl-tage.md §6.1 V5). Der Fortschritt
 * liegt zwar schon je Beruf (`berufe: Partial<Record<BerufId, Fortschritt>>`),
 * zur Laufzeit kollidiert also nichts — das *Interface* ist aber gemeinsam,
 * und drei Tage entstehen gleichzeitig. Die Abschnitte sind die Naht, an der
 * drei Agenten dieselbe Datei anfassen können, ohne einander zu überschreiben:
 * **jeder trägt nur in seinem Abschnitt ein.**
 *
 * Die Schlüssel selbst sind dank der Id-Präfixe aus V4 disjunkt — `m*` gehört
 * dem Dachdecker, `c*` dem Zimmerer, `z*` der Zerspanung, `a*` der
 * Anlagenmechanik (siehe `berufe/typen.ts`).
 */
export interface Antworten {
  // -------------------------------------------------------------------------
  // Dachdecker — Schlüssel `m*` / `b*`
  // -------------------------------------------------------------------------

  /** M1 — angetippte Checklistenpunkte und ob schon ausgewertet wurde. */
  m1?: { gewaehlt: string[]; ausgewertet: boolean }
  /** M2 — geschätzter Dachpreis in Euro, und ob die echte Zahl schon stand. */
  m2?: { schaetzung: number; aufgeloest: boolean }
  /** B3.2 — welche Bauteile am 3D-Modell angetippt wurden. */
  b32?: { angetippt: string[] }
  /**
   * M4 — Zuschnitt getroffen, mit Zahl der Versuche. `verladen` ist Protokoll
   * des 3D-Finales (Sparren auf dem Anhänger) und **optional**: alte
   * localStorage-Stände und der Fehlversuch-Zweig kennen es nicht, und die
   * Anzeige hängt allein an `getroffen`.
   */
  m4?: { getroffen: boolean; versuche: number; verladen?: boolean }
  /** B4.1 — korrekt verladene Teile. */
  b41?: { geladen: string[]; fertig: boolean }
  /** M7 — wie weit die Reihenfolge-Abfrage kam. */
  m7?: { gesetzt: string[]; fertig: boolean }
  /** M9 — angesehene Karrierewege, in Reihenfolge des Öffnens. */
  m9?: { angesehen: StepId[] }

  // -------------------------------------------------------------------------
  // Zimmerer — Schlüssel `c*`
  // -------------------------------------------------------------------------

  /** C1 — das gesuchte Holz aus dem Stapel gefunden, mit Zahl der Versuche. */
  c1?: { gefunden: boolean; versuche: number }
  /** C2 — geschätztes Achsmaß in Zentimetern, und ob 62,5 schon stand. */
  c2?: { schaetzung: number; aufgeloest: boolean }
  /** C3 — welche Schichten der Wand schon liegen, von innen nach außen. */
  c3?: { gelegt: string[]; fertig: boolean }
  /**
   * C4 — Fensterausschnitt getroffen, mit Zahl der Versuche. `abweichungMm` ist
   * **optional**: alte localStorage-Stände und der Fehlversuch-Zweig kennen es
   * nicht, und die Anzeige hängt allein an `getroffen`.
   *
   * `ausschnitt` trägt den **vollen** Ausschnitt in Millimetern, weil er das
   * Fadenobjekt ab C4 kennzeichnet: „Ab C4 gehört das Element dem Besucher —
   * der Ausschnitt ist deiner“ (khpl-tag-zimmerer.md 2). C5, C6 und C7 zeigen
   * dasselbe Fenster wieder, und C6 fragt an ihm ab, wo oben ist — mit einem
   * anderen Fenster als in C4 wäre das keine Erinnerungsleistung, sondern eine
   * Falle. Ebenfalls optional: alte Stände und ein übersprungenes C4 kennen ihn
   * nicht, dann fällt die Bühne auf ihren Standardausschnitt zurück.
   *
   * Strukturell notiert und nicht als `Fensterausschnitt` importiert: der Typ
   * wohnt neben der lazy geladenen Bühne, und diese Datei gehört allen vier
   * Berufen.
   */
  c4?: {
    getroffen: boolean
    versuche: number
    abweichungMm?: number
    ausschnitt?: { xMm: number; yMm: number; breiteMm: number; hoeheMm: number }
  }
  /** C5 — welche der drei Pausenfragen aufgedeckt wurden. */
  c5?: { gelesen: string[] }
  /** C6 — Lage am Haken richtig erkannt, Element versetzt, Zahl der Versuche. */
  c6?: { seiteRichtig: boolean; versetzt: boolean; versuche: number }
  /**
   * C8 — angesehene Karrierewege, in Reihenfolge des Öffnens. Speist den
   * personalisierten Aufhänger in C9.
   *
   * Eigener Schlüssel statt `m9`: `merkeKarriereweg` weiter unten schreibt fest
   * nach `m9`, und `m9` gehört dem Dachdecker. Die Funktion steht in der
   * gemeinsamen Hälfte dieser Datei und ist trotzdem berufsspezifisch — das ist
   * gemeldet, nicht umgebaut. Die Zimmerer-Steps schreiben über `merkeAntwort`.
   */
  c8?: { angesehen: StepId[] }

  // -------------------------------------------------------------------------
  // Zerspanung — Schlüssel `z*`
  // -------------------------------------------------------------------------

  /** Z1 — geschätzte Toleranz in mm, und ob die echte Zahl schon stand. */
  z1?: { schaetzung: number; aufgeloest: boolean }
  /** Z2 — welche der vier Rüst-Handgriffe erledigt sind. */
  z2?: { geruestet: string[]; fertig: boolean }
  /**
   * Z3 — wie weit der Besucher sich durch das Programm getippt hat, ob er die
   * falsche Zeile gefunden hat und ob er blind gestartet ist.
   *
   * `kollision` heißt so, weil die Spec die Signatur so festlegt (§6 Z3). Was
   * der Screen daraus macht, ist der **Luftschnitt**: der eingebaute Fehler ist
   * das fehlende Minuszeichen, und damit fährt das Werkzeug am Teil vorbei ins
   * Leere statt in die Spannbacke (§11, `belege/zerspanung.md` 7).
   */
  z3?: { zeilen: number; gefunden: boolean; kollision: boolean }
  /** Z4 — welche der drei Entdeckungen im Messraum aufgedeckt wurden. */
  z4?: { gelesen: string[] }
  /**
   * Z5 — das Urteil über den Messwert, ob es stimmte, und ob korrigiert wurde.
   *
   * `endwert` ist der Messwert, den der Besucher am Ende von Beat 2 wirklich
   * erreicht hat, in mm. Er steht **zusätzlich** zur Signatur der Spec (§6 Z5)
   * und ist deshalb optional: Der Wert hängt daran, wie weit korrigiert wurde,
   * und Z5 ist das Fadenobjekt-Feld dieses Tages — „deine Zahl“ (§2). Ohne ihn
   * zeigte der Screen nach einem Rücksprung über „Dein Weg“ eine andere Zahl
   * als die, die dort eben noch stand.
   */
  z5?: {
    urteil: 'gut' | 'nacharbeit' | 'ausschuss'
    richtig: boolean
    korrigiert: boolean
    endwert?: number
  }
  /**
   * Z7 — angesehene Karrierewege, in Reihenfolge des Öffnens.
   *
   * Das Gegenstück zu `m9`. Es gibt dafür bewusst **keinen** gemeinsamen
   * Schlüssel: `merkeKarriereweg` schreibt fest nach `m9` und ist damit trotz
   * V5 ein Dachdecker-Stück in gemeinsamem Code — dieser Tag schreibt über
   * `merkeAntwort` in seinen eigenen. Gemeldet, nicht gelöst
   * (khpl-tage.md §6.2).
   */
  z7?: { angesehen: StepId[] }

  // -------------------------------------------------------------------------
  // Anlagenmechanik — Schlüssel `a*`
  //
  // Formen wörtlich aus khpl-tag-anlagenmechanik.md 6, je Step am Ende seines
  // Abschnitts. Alles, was der Rückblick in A7 aufzählt, kommt von hier.
  // -------------------------------------------------------------------------

  /**
   * A1 — die Suche: welche Prüfungen gelaufen sind, worauf der Besucher getippt
   * hat und ob er richtig lag.
   *
   * `ursache` ist `null`, solange nicht entschieden wurde. `richtig: false` ist
   * **keine Note** — der Screen zeigt danach, welche Prüfung die entscheidende
   * gewesen wäre, und der Preis ist eine zweite Anfahrt, kein Punktabzug.
   */
  a1?: { geprueft: string[]; ursache: string | null; richtig: boolean }
  /** A2 — welche der sechs Bauteile im Keller angetippt wurden. */
  a2?: { angetippt: string[] }
  /** A3 — geschätzte Heizlast in kW, und ob die Auflösung schon stand. */
  a3?: { schaetzung: number; aufgeloest: boolean }
  /**
   * A4 — der Weg der Leitung durch das Kellerraster.
   *
   * **Ab hier gehört der Weg dem Besucher:** in A6 läuft die Wärme genau diese
   * Linie entlang, nicht irgendeine. Deshalb wird der Pfad gespeichert und
   * nicht nur, dass er fertig ist.
   */
  a4?: { pfad: string[]; boegen: number; fertig: boolean }
  /** A5 — welche der drei Pausenfragen gelesen wurden. */
  a5?: { gelesen: string[] }
  /** A6 — Fülldruck im Zielfenster getroffen, mit Zahl der Versuche. */
  a6?: { druckGetroffen: boolean; versuche: number }
  /**
   * A7 — die Abfrage beim Kunden: welche Fragen beantwortet wurden und wie oft
   * die **verständliche** Antwort dabei war.
   *
   * `gut` zählt keine Punkte, sondern speist die Reaktion der Kundin. Es gibt
   * auf diesem Screen kein Richtig und kein Falsch, nur verständlich und nicht
   * verständlich.
   */
  a7?: { beantwortet: string[]; gut: number }
  /**
   * A8 — angesehene Karrierewege, in Reihenfolge des Öffnens.
   *
   * ⚠️ **Noch ohne Schreiber, und das ist gemeldet** (khpl-tage.md 6.2):
   * `merkeKarriereweg` unten schreibt fest verdrahtet nach `answers.m9`, einem
   * Dachdecker-Schlüssel. Zur Laufzeit kollidiert das nicht, weil der
   * Fortschritt je Beruf liegt — V5 verlangt aber disjunkte Schlüssel, und der
   * dieses Tages ist `a8`. Die Auflösung ist ein Parameter an der Funktion und
   * gehört in die Hülle, nicht in einen einzelnen Tag.
   */
  a8?: { angesehen: StepId[] }
}

/** Der Stand **eines** Berufs. */
export interface Fortschritt {
  currentStepId: StepId
  /** Reihenfolge = Zurück-Historie. Kann denselben Step mehrfach enthalten. */
  visited: StepId[]
  /**
   * Der weiteste erreichte Hauptschritt — die Hochwassermarke.
   *
   * Nicht in der Spec, aber ohne sie bricht ein Versprechen aus ui-shell 4:
   * ein ✓ im Sheet ist antippbar, „springt zum Schritt zurück“. Leitet man
   * „besucht“ allein aus der aktuellen Position ab, entwerten sich beim
   * Zurückspringen alle Häkchen dahinter, die Rail schrumpft, und es gibt
   * keinen Weg zurück nach vorn außer mehrfach *Weiter*. Die Marke wächst
   * nur auf der Hauptlinie und **nicht** im Karriere-Skip — sonst sperrte
   * ein neugieriger Tap auf „Karriere-Wege“ neun von zehn Segmenten auf.
   */
  hoechsterStep: StepId
  branchesTaken: StepId[]
  answers: Antworten
  detourReturnTo: StepId | null
}

export interface Sitzung {
  version: 2
  /** Der Beruf, in dem der Besucher gerade steckt. `null` = noch im Trichter. */
  aktiverBeruf: BerufId | null
  /** Angelegt wird ein Eintrag erst, wenn ein Beruf betreten wird. */
  berufe: Partial<Record<BerufId, Fortschritt>>
  helm: HelmWahl | null
  /** Frage-Id → Antwort-Id. Übersprungene Fragen fehlen schlicht. */
  gefragt: Record<string, string>
  updatedAt: number
}

function leererFortschritt(graph: StepGraph): Fortschritt {
  return {
    currentStepId: graph.erster,
    visited: [],
    hoechsterStep: graph.erster,
    branchesTaken: [],
    answers: {},
    detourReturnTo: null,
  }
}

function leereSitzung(): Sitzung {
  return {
    version: 2,
    aktiverBeruf: null,
    berufe: {},
    helm: null,
    gefragt: {},
    updatedAt: Date.now(),
  }
}

/**
 * Prüft die gespeicherten Antworten oberflächlich nach.
 *
 * `version` allein reicht nicht: sie bleibt gleich, während sich die Form von
 * `answers` mit jedem neuen Step ändert. Der reale Fall ist ein Deploy am
 * Messemorgen — ein iPad, das zehn Minuten vorher benutzt wurde, lädt den
 * alten Stand, `version` passt, und der Rückblick in M8 stolpert vor einem
 * Besucher über ein Feld, das es nicht mehr gibt. Was nicht passt, fliegt
 * einzeln raus statt den ganzen Stand mitzureißen.
 *
 * **Vier Abschnitte, einer je Beruf** — dieselbe Naht wie im Interface
 * `Antworten` (khpl-tage.md §6.1 V5). Jeder Agent prüft nur seine eigenen
 * Schlüssel; dank der Id-Präfixe aus V4 überschneiden sie sich nicht. Ein
 * Beruf, der hier nichts stehen hat, hat schlicht noch keine Interaktion.
 */
function pruefeAntworten(graph: StepGraph, roh: unknown): Antworten {
  if (typeof roh !== 'object' || roh === null) return {}
  const q = roh as Record<string, unknown>
  const a: Antworten = {}

  const stringListe = (w: unknown) =>
    Array.isArray(w) ? w.filter((x): x is string => typeof x === 'string') : null

  // ---------------------------------------------------------------------
  // Dachdecker — Schlüssel `m*` / `b*`
  // ---------------------------------------------------------------------

  const m1 = q.m1 as Antworten['m1']
  if (m1 && stringListe(m1.gewaehlt)) {
    a.m1 = {
      gewaehlt: stringListe(m1.gewaehlt) as string[],
      ausgewertet: !!m1.ausgewertet,
    }
  }
  const m2 = q.m2 as Antworten['m2']
  if (m2 && typeof m2.schaetzung === 'number' && Number.isFinite(m2.schaetzung)) {
    a.m2 = { schaetzung: m2.schaetzung, aufgeloest: !!m2.aufgeloest }
  }
  const b32 = q.b32 as Antworten['b32']
  if (b32 && stringListe(b32.angetippt)) {
    a.b32 = { angetippt: stringListe(b32.angetippt) as string[] }
  }
  const m4 = q.m4 as Antworten['m4']
  if (m4 && typeof m4.versuche === 'number') {
    a.m4 = { getroffen: !!m4.getroffen, versuche: m4.versuche }
    // Nur ein echtes `true` übernehmen — alles andere bleibt weg.
    if (m4.verladen === true) a.m4.verladen = true
  }
  const b41 = q.b41 as Antworten['b41']
  if (b41 && stringListe(b41.geladen)) {
    a.b41 = { geladen: stringListe(b41.geladen) as string[], fertig: !!b41.fertig }
  }
  const m7 = q.m7 as Antworten['m7']
  if (m7 && stringListe(m7.gesetzt)) {
    a.m7 = { gesetzt: stringListe(m7.gesetzt) as string[], fertig: !!m7.fertig }
  }
  const m9 = q.m9 as Antworten['m9']
  if (m9 && Array.isArray(m9.angesehen)) {
    // Fällt eine StepId aus dem Graphen, darf sie nicht als `titel` wieder
    // auftauchen.
    a.m9 = { angesehen: m9.angesehen.filter((x) => istStepId(graph, x)) }
  }

  // ---------------------------------------------------------------------
  // Zimmerer — Schlüssel `c*`
  // ---------------------------------------------------------------------

  const c1 = q.c1 as Antworten['c1']
  if (c1 && typeof c1.versuche === 'number') {
    a.c1 = { gefunden: !!c1.gefunden, versuche: c1.versuche }
  }
  const c2 = q.c2 as Antworten['c2']
  if (c2 && typeof c2.schaetzung === 'number' && Number.isFinite(c2.schaetzung)) {
    a.c2 = { schaetzung: c2.schaetzung, aufgeloest: !!c2.aufgeloest }
  }
  const c3 = q.c3 as Antworten['c3']
  if (c3 && stringListe(c3.gelegt)) {
    a.c3 = { gelegt: stringListe(c3.gelegt) as string[], fertig: !!c3.fertig }
  }
  const c4 = q.c4 as Antworten['c4']
  if (c4 && typeof c4.versuche === 'number') {
    a.c4 = { getroffen: !!c4.getroffen, versuche: c4.versuche }
    // Nur eine echte Zahl übernehmen — alles andere bleibt weg.
    if (typeof c4.abweichungMm === 'number' && Number.isFinite(c4.abweichungMm)) {
      a.c4.abweichungMm = c4.abweichungMm
    }
    // Alle vier Maße oder keines: ein halber Ausschnitt zeichnet ein halbes
    // Fenster, und die Bühne hat für „keiner“ einen Rückfall.
    const s = c4.ausschnitt
    if (
      s &&
      Number.isFinite(s.xMm) &&
      Number.isFinite(s.yMm) &&
      Number.isFinite(s.breiteMm) &&
      Number.isFinite(s.hoeheMm) &&
      s.breiteMm > 0 &&
      s.hoeheMm > 0
    ) {
      a.c4.ausschnitt = {
        xMm: s.xMm,
        yMm: s.yMm,
        breiteMm: s.breiteMm,
        hoeheMm: s.hoeheMm,
      }
    }
  }
  const c5 = q.c5 as Antworten['c5']
  if (c5 && stringListe(c5.gelesen)) {
    a.c5 = { gelesen: stringListe(c5.gelesen) as string[] }
  }
  const c6 = q.c6 as Antworten['c6']
  if (c6 && typeof c6.versuche === 'number') {
    a.c6 = {
      seiteRichtig: !!c6.seiteRichtig,
      versetzt: !!c6.versetzt,
      versuche: c6.versuche,
    }
  }
  const c8 = q.c8 as Antworten['c8']
  if (c8 && Array.isArray(c8.angesehen)) {
    // Fällt eine StepId aus dem Graphen, darf sie nicht als `titel` wieder
    // auftauchen.
    a.c8 = { angesehen: c8.angesehen.filter((x) => istStepId(graph, x)) }
  }

  // ---------------------------------------------------------------------
  // Zerspanung — Schlüssel `z*`
  // ---------------------------------------------------------------------

  const z1 = q.z1 as Antworten['z1']
  if (z1 && typeof z1.schaetzung === 'number' && Number.isFinite(z1.schaetzung)) {
    a.z1 = { schaetzung: z1.schaetzung, aufgeloest: !!z1.aufgeloest }
  }
  const z2 = q.z2 as Antworten['z2']
  if (z2 && stringListe(z2.geruestet)) {
    a.z2 = { geruestet: stringListe(z2.geruestet) as string[], fertig: !!z2.fertig }
  }
  const z3 = q.z3 as Antworten['z3']
  if (z3 && typeof z3.zeilen === 'number' && Number.isFinite(z3.zeilen)) {
    a.z3 = { zeilen: z3.zeilen, gefunden: !!z3.gefunden, kollision: !!z3.kollision }
  }
  const z4 = q.z4 as Antworten['z4']
  if (z4 && stringListe(z4.gelesen)) {
    a.z4 = { gelesen: stringListe(z4.gelesen) as string[] }
  }
  const URTEILE: readonly string[] = ['gut', 'nacharbeit', 'ausschuss']
  const z5 = q.z5 as Antworten['z5']
  // Ein Urteil, das es nicht mehr gibt, darf nicht als „falsch beantwortet“
  // wieder auftauchen — der ganze Eintrag fliegt dann raus.
  if (z5 && URTEILE.includes(z5.urteil)) {
    a.z5 = {
      urteil: z5.urteil,
      richtig: !!z5.richtig,
      korrigiert: !!z5.korrigiert,
    }
    // Nur eine echte Zahl übernehmen; alles andere fällt weg, und Z5 rechnet
    // dann wieder mit seinem Ersatzwert.
    if (typeof z5.endwert === 'number' && Number.isFinite(z5.endwert)) {
      a.z5.endwert = z5.endwert
    }
  }
  const z7 = q.z7 as Antworten['z7']
  if (z7 && Array.isArray(z7.angesehen)) {
    // Fällt eine StepId aus dem Graphen, darf sie in Z8 nicht als Aufhänger
    // wieder auftauchen.
    a.z7 = { angesehen: z7.angesehen.filter((x) => istStepId(graph, x)) }
  }

  // ---------------------------------------------------------------------
  // Anlagenmechanik — Schlüssel `a*`
  // ---------------------------------------------------------------------

  const a1 = q.a1 as Antworten['a1']
  if (a1 && stringListe(a1.geprueft)) {
    a.a1 = {
      geprueft: stringListe(a1.geprueft) as string[],
      // Alles, was kein String ist, wird zu „noch nicht entschieden“ — ein
      // halb gelesener Stand darf in A7 nicht als gelöste Störung auftauchen.
      ursache: typeof a1.ursache === 'string' ? a1.ursache : null,
      richtig: !!a1.richtig,
    }
  }
  const a2 = q.a2 as Antworten['a2']
  if (a2 && stringListe(a2.angetippt)) {
    a.a2 = { angetippt: stringListe(a2.angetippt) as string[] }
  }
  const a3 = q.a3 as Antworten['a3']
  if (a3 && typeof a3.schaetzung === 'number' && Number.isFinite(a3.schaetzung)) {
    a.a3 = { schaetzung: a3.schaetzung, aufgeloest: !!a3.aufgeloest }
  }
  const a4 = q.a4 as Antworten['a4']
  if (a4 && stringListe(a4.pfad)) {
    a.a4 = {
      pfad: stringListe(a4.pfad) as string[],
      // `boegen` fällt aus dem Pfad ab und wird nur mitgeführt; ein kaputter
      // Wert darf den Weg nicht mitreißen, aus dem A6 seine Linie zieht.
      boegen: typeof a4.boegen === 'number' && Number.isFinite(a4.boegen) ? a4.boegen : 0,
      fertig: !!a4.fertig,
    }
  }
  const a5 = q.a5 as Antworten['a5']
  if (a5 && stringListe(a5.gelesen)) {
    a.a5 = { gelesen: stringListe(a5.gelesen) as string[] }
  }
  const a6 = q.a6 as Antworten['a6']
  if (a6 && typeof a6.versuche === 'number' && Number.isFinite(a6.versuche)) {
    a.a6 = { druckGetroffen: !!a6.druckGetroffen, versuche: a6.versuche }
  }
  const a7 = q.a7 as Antworten['a7']
  if (a7 && stringListe(a7.beantwortet)) {
    a.a7 = {
      beantwortet: stringListe(a7.beantwortet) as string[],
      gut: typeof a7.gut === 'number' && Number.isFinite(a7.gut) ? a7.gut : 0,
    }
  }
  const a8 = q.a8 as Antworten['a8']
  if (a8 && Array.isArray(a8.angesehen)) {
    // Fällt eine StepId aus dem Graphen, darf sie nicht als Aufhänger auf A9
    // wieder auftauchen.
    a.a8 = { angesehen: a8.angesehen.filter((x) => istStepId(graph, x)) }
  }

  return a
}

function pruefeFortschritt(graph: StepGraph, roh: unknown): Fortschritt | null {
  if (typeof roh !== 'object' || roh === null) return null
  const p = roh as Partial<Fortschritt>
  if (!istStepId(graph, p.currentStepId)) return null

  const visited = Array.isArray(p.visited)
    ? p.visited.filter((x) => istStepId(graph, x))
    : []

  return {
    currentStepId: p.currentStepId,
    visited,
    hoechsterStep: istStepId(graph, p.hoechsterStep) ? p.hoechsterStep : p.currentStepId,
    branchesTaken: Array.isArray(p.branchesTaken)
      ? p.branchesTaken.filter((x) => istStepId(graph, x))
      : [],
    answers: pruefeAntworten(graph, p.answers),
    detourReturnTo: istStepId(graph, p.detourReturnTo) ? p.detourReturnTo : null,
  }
}

/**
 * Liest den gespeicherten Stand. Alles, was nicht exakt passt — falsche
 * `version`, kaputtes JSON, unbekannte Id — wird still verworfen. Ein
 * Datenmodell-Wechsel darf am Messestand nicht crashen. Die Fassung mit einem
 * einzigen Beruf trug `version: 1` und fällt hier ohne Umweg auf den Boden.
 *
 * Der **Verfall wird hier nicht geprüft**: siehe `pruefeVerfall`.
 */
function lade(): Sitzung | null {
  let roh: string | null
  try {
    roh = localStorage.getItem(SPEICHER_SCHLUESSEL)
  } catch {
    return null
  }
  if (!roh) return null

  try {
    const daten: unknown = JSON.parse(roh)
    if (typeof daten !== 'object' || daten === null) return null
    const s = daten as Partial<Sitzung>
    if (s.version !== 2) return null
    if (typeof s.updatedAt !== 'number') return null

    const berufe: Partial<Record<BerufId, Fortschritt>> = {}
    for (const [id, wert] of Object.entries(s.berufe ?? {})) {
      if (!istBerufId(id)) continue
      const graph = beruf(id).graph
      if (!graph) continue
      const f = pruefeFortschritt(graph, wert)
      if (f) berufe[id] = f
    }

    const aktiv = istBerufId(s.aktiverBeruf) ? s.aktiverBeruf : null

    return {
      version: 2,
      // Ein aktiver Beruf ohne Stand ist kein Wiedereinstieg, sondern ein
      // Zeiger ins Leere — er käme als „Weitermachen bei …“ auf den Splash und
      // landete auf dem ersten Step eines Tages, den nie jemand angefangen hat.
      aktiverBeruf: aktiv && berufe[aktiv] ? aktiv : null,
      berufe,
      helm: pruefeHelm(s.helm),
      gefragt: pruefeGefragt(s.gefragt),
      updatedAt: s.updatedAt,
    }
  } catch {
    return null
  }
}

function pruefeHelm(roh: unknown): HelmWahl | null {
  if (typeof roh !== 'object' || roh === null) return null
  const h = roh as Partial<HelmWahl>
  if (typeof h.farbe !== 'string' || typeof h.werkzeug !== 'string') return null
  return { farbe: h.farbe, werkzeug: h.werkzeug }
}

function pruefeGefragt(roh: unknown): Record<string, string> {
  if (typeof roh !== 'object' || roh === null) return {}
  const raus: Record<string, string> = {}
  for (const [k, v] of Object.entries(roh)) {
    if (typeof v === 'string') raus[k] = v
  }
  return raus
}

let sitzung: Sitzung = lade() ?? leereSitzung()
/** Ob ein Stand zum Weitermachen bereitliegt. */
let hatWiedereinstieg = wiedereinstiegMoeglich(sitzung)
let bildschirm: Bildschirm = 'splash'

function wiedereinstiegMoeglich(s: Sitzung): boolean {
  const aktiv = s.aktiverBeruf
  if (!aktiv) return false
  return (s.berufe[aktiv]?.visited.length ?? 0) > 0
}

const hoerer = new Set<() => void>()

function melde() {
  hoerer.forEach((h) => h())
}

function vergiss() {
  sitzung = leereSitzung()
  hatWiedereinstieg = false
  try {
    localStorage.removeItem(SPEICHER_SCHLUESSEL)
  } catch {
    // s. u.
  }
}

/**
 * Verwirft einen abgelaufenen Stand. Gibt zurück, ob etwas verworfen wurde.
 *
 * Muss **zur Lesezeit** laufen, nicht beim Laden des Moduls: das Kiosk-iPad
 * lädt die Seite genau einmal am Messemorgen und läuft dann stundenlang. Ein
 * Verfallstest, der nur beim Modulstart stattfindet, ist in genau dem einzigen
 * Betriebsmodus tot, für den er geschrieben wurde — der Splash böte um halb
 * zwölf noch an, die Sitzung von neun Uhr fortzusetzen, samt fremder Antworten
 * im Rückblick von M8.
 */
export function pruefeVerfall(): boolean {
  if (!hatWiedereinstieg) return false
  if (Date.now() - sitzung.updatedAt <= VERFALL_MS) return false
  vergiss()
  melde()
  return true
}

function sichere() {
  try {
    localStorage.setItem(SPEICHER_SCHLUESSEL, JSON.stringify(sitzung))
  } catch {
    // Speicher gesperrt oder voll (privater Modus, Sandbox) — die Sitzung läuft
    // trotzdem, sie überlebt nur keinen Reload.
  }
}

/** Reißleine gegen eine Historie, die durch Hin-und-Her-Tappen davonläuft. */
const MAX_HISTORIE = 300

function aendere(f: (alt: Sitzung) => Sitzung) {
  const neu = f(sitzung)
  // Wirkungslose Aktionen — ← auf dem ersten Step, ein Sprung ins Gesperrte —
  // dürfen weder speichern noch `updatedAt` auffrischen: sonst hält ein
  // Besucher, der auf dem ersten Screen herumtippt, den Verfall ewig offen.
  if (neu === sitzung) return

  sitzung = { ...neu, updatedAt: Date.now() }
  hatWiedereinstieg = wiedereinstiegMoeglich(sitzung)
  sichere()
  melde()
}

/**
 * Ändert den Stand **des aktiven Berufs**. Ohne aktiven Beruf wirkungslos —
 * jede dieser Aktionen kommt von einem Step-Screen, und ohne Beruf gibt es
 * keinen.
 */
function aendereFortschritt(f: (alt: Fortschritt, graph: StepGraph) => Fortschritt) {
  aendere((s) => {
    const id = s.aktiverBeruf
    if (!id) return s
    const graph = beruf(id).graph
    const alt = s.berufe[id]
    if (!graph || !alt) return s

    const neu = f(alt, graph)
    if (neu === alt) return s

    return {
      ...s,
      berufe: {
        ...s.berufe,
        [id]: {
          ...neu,
          visited:
            neu.visited.length > MAX_HISTORIE
              ? neu.visited.slice(-MAX_HISTORIE)
              : neu.visited,
        },
      },
    }
  })
}

function setzeBildschirm(neu: Bildschirm) {
  bildschirm = neu
  melde()
}

/** Hochwassermarke fortschreiben — nur auf der Hauptlinie, nie im Skip. */
function marke(graph: StepGraph, alt: Fortschritt, ziel: StepId): StepId {
  if (alt.detourReturnTo !== null) return alt.hoechsterStep
  return railIndex(graph, ziel) > railIndex(graph, alt.hoechsterStep)
    ? ziel
    : alt.hoechsterStep
}

/**
 * Verlässt ein Zug den Karriere-Bereich, ist der Skip vorbei — egal ob über
 * die Rückkehr-Leiste, über ← oder über einen Wisch. Bliebe `detourReturnTo`
 * stehen, zeigte die App für den Rest der Sitzung die Skip-Leiste statt der
 * Rail, und ui-shell 4 („auf **jedem** S2-Screen“) wäre gebrochen.
 */
function skipStand(graph: StepGraph, alt: Fortschritt, ziel: StepId): StepId | null {
  if (alt.detourReturnTo === null) return null
  return graph.karriereBereich.includes(ziel) ? alt.detourReturnTo : null
}

// ---------------------------------------------------------------------------
// Trichter (S0–S4)
// ---------------------------------------------------------------------------

/** S0 → S1. Verwirft einen alten Stand vollständig. */
export function starteNeu() {
  vergiss()
  sichere()
  setzeBildschirm('helm')
}

/** S0 → dorthin, wo der letzte Besucher aufgehört hat. */
export function machWeiter() {
  if (pruefeVerfall()) return
  setzeBildschirm(sitzung.aktiverBeruf ? 'step' : 'berufe')
}

export function merkeHelm(wahl: HelmWahl) {
  aendere((s) => ({ ...s, helm: wahl }))
}

export function merkeFrage(frageId: string, antwortId: string) {
  aendere((s) => ({ ...s, gefragt: { ...s.gefragt, [frageId]: antwortId } }))
}

export function zeigeFragen() {
  setzeBildschirm('fragen')
}

export function zeigeVorschlag() {
  setzeBildschirm('vorschlag')
}

export function zeigeBerufe() {
  setzeBildschirm('berufe')
}

export function zeigeHelm() {
  setzeBildschirm('helm')
}

/**
 * Einen Beruf betreten — aus dem Vorschlag, aus der Liste, aus dem Sheet.
 *
 * Drei Ausgänge, und der mittlere ist der, an dem der Wechsel steht und fällt:
 * wer diesen Beruf schon angefangen hat, landet **da, wo er war**. Ohne das
 * wäre jeder Wechsel ein Verlust, und die Liste eine Falle statt eines
 * Angebots.
 */
export function betreteBeruf(id: BerufId) {
  const graph = beruf(id).graph
  if (!graph) {
    // `aktiverBeruf` bleibt stehen. Ein Blick auf einen angekündigten Beruf
    // ist ein Blick, kein Wechsel — wer mitten im Zimmerer-Tag neugierig auf
    // Dachdecker tippt, soll danach ohne Umweg weitermachen können.
    merkeAngesehen(id)
    setzeBildschirm('bald')
    return
  }

  const schonDa = (sitzung.berufe[id]?.visited.length ?? 0) > 0
  aendere((s) => ({
    ...s,
    aktiverBeruf: id,
    berufe: s.berufe[id] ? s.berufe : { ...s.berufe, [id]: leererFortschritt(graph) },
  }))
  setzeBildschirm(schonDa ? 'step' : 'intro')
}

/**
 * Welcher angekündigte Beruf gerade auf dem „bald“-Screen liegt.
 *
 * Bewusst **kein** Teil der gespeicherten Sitzung: das ist die Adresse eines
 * Screens, kein Stand. Nach einem Reload wieder dort zu landen wäre falsch.
 */
let angesehenerBeruf: BerufId | null = null

function merkeAngesehen(id: BerufId) {
  angesehenerBeruf = id
  melde()
}

/** S5 → S6. „Auftrag annehmen“ ist der erste Besuch des ersten Steps. */
export function nimmAuftragAn() {
  const id = sitzung.aktiverBeruf
  if (!id || !beruf(id).graph) return

  aendere((s) => {
    const graph = beruf(id).graph
    if (!graph) return s
    // Vollständiger Reset **dieses Berufs**, nicht nur des Zeigers: sonst erbt
    // ein zweiter Durchlauf Abstecher und Antworten des ersten. Die anderen
    // Berufe bleiben unberührt — sie gehören demselben Besucher.
    return {
      ...s,
      berufe: {
        ...s.berufe,
        [id]: {
          ...leererFortschritt(graph),
          visited: [graph.erster],
        },
      },
    }
  })
  setzeBildschirm('step')
}

/** Idle-Rückfall: zurück auf S0, **ohne** zu löschen. */
export function zumSplash() {
  setzeBildschirm('splash')
}

/** Harter Reset für das Standpersonal. */
export function setzeZurueck() {
  vergiss()
  setzeBildschirm('splash')
}

// ---------------------------------------------------------------------------
// Innerhalb eines Berufs
// ---------------------------------------------------------------------------

/**
 * Ein Schritt vorwärts. Ein Abstecher wird zusätzlich in `branchesTaken`
 * vermerkt — daraus speist sich der Rückblick in M8.
 */
export function geheZu(ziel: StepId) {
  aendereFortschritt((alt, graph) => {
    const def = step(graph, ziel)
    // `immerOffen` sind die drei Karrierekarten. Sie zählen nicht als
    // genommener Abstecher: sie sollen im Angebot bleiben (flow 7 M9), und sie
    // gehören nicht in den Rückblick von M8 — „du hast heute … eine Info-Seite
    // gelesen“ ist keine Tageleistung. Angesehen wird in `answers.m9` vermerkt.
    const zaehlt = def.art === 'abstecher' && !def.immerOffen
    return {
      ...alt,
      currentStepId: ziel,
      visited: [...alt.visited, ziel],
      hoechsterStep: marke(graph, alt, ziel),
      detourReturnTo: skipStand(graph, alt, ziel),
      branchesTaken:
        zaehlt && !alt.branchesTaken.includes(ziel)
          ? [...alt.branchesTaken, ziel]
          : alt.branchesTaken,
    }
  })
}

/** Merkt einen angesehenen Karriereweg — Grundlage für den CTA in M10. */
export function merkeKarriereweg(ziel: StepId) {
  aendereFortschritt((alt) => {
    const bisher = alt.answers.m9?.angesehen ?? []
    if (bisher[bisher.length - 1] === ziel) return alt
    return {
      ...alt,
      answers: {
        ...alt.answers,
        // Reihenfolge des Öffnens; der zuletzt geöffnete Weg speist den
        // personalisierten Aufhänger in M10 (flow 11, M10).
        m9: { angesehen: [...bisher.filter((x) => x !== ziel), ziel] },
      },
    }
  })
}

/** Ein Schritt zurück in der besuchten Historie. Auf dem ersten Step wirkungslos. */
export function geheZurueck() {
  aendereFortschritt((alt, graph) => {
    if (alt.visited.length < 2) return alt
    const historie = alt.visited.slice(0, -1)
    const ziel = historie[historie.length - 1]
    return {
      ...alt,
      currentStepId: ziel,
      visited: historie,
      detourReturnTo: skipStand(graph, alt, ziel),
    }
  })
}

/**
 * Sprung aus dem Sheet „Dein Weg“ auf einen bereits besuchten Schritt.
 *
 * Die Historie wird **nicht** zurückgeschnitten, sondern fortgeschrieben: der
 * Sprung ist selbst ein Schritt, und „Zurück“ macht ihn rückgängig. Das ist das
 * Verhalten, das jeder von einem Browser kennt — und es erhält den Rückblick in
 * M8, der aus derselben Liste gespeist wird.
 *
 * Die Sperre gegen Sprünge nach vorn steht hier noch einmal, nicht nur in der
 * Darstellung des Sheets: eine Regel, die nur im Rendern lebt, ist keine.
 */
export function springeZuBesuchtem(ziel: StepId) {
  aendereFortschritt((alt, graph) => {
    if (!alt.visited.includes(ziel)) return alt
    if (railIndex(graph, ziel) > railIndex(graph, alt.hoechsterStep)) return alt
    return {
      ...alt,
      currentStepId: ziel,
      visited: [...alt.visited, ziel],
      detourReturnTo: skipStand(graph, alt, ziel),
    }
  })
}

/** Karriere-Skip: merkt den aktuellen Schritt und öffnet den Karriere-Bereich. */
export function starteKarriereSkip() {
  aendereFortschritt((alt, graph) => ({
    ...alt,
    detourReturnTo: alt.currentStepId,
    currentStepId: graph.karriereEinstieg,
    visited: [...alt.visited, graph.karriereEinstieg],
  }))
}

/**
 * „Zurück zu deinem Tag“ — exakt an dieselbe Stelle, ein Tap raus.
 *
 * Die Historie wird dabei **auf den Einstiegspunkt zurückgeschnitten**, nicht
 * fortgeschrieben. Sonst endet sie auf `[…, M2, M9, B9.3, M10, M2]`, und ein
 * einziger Druck auf ← nach der Rückkehr wirft den Besucher auf den
 * CTA-Screen — mit voller Rail und ohne Rückkehr-Leiste. Der Skip ist ein
 * Abstecher: danach soll alles aussehen wie davor (ui-shell 6).
 */
export function beendeKarriereSkip() {
  aendereFortschritt((alt) => {
    if (!alt.detourReturnTo) return alt
    const ziel = alt.detourReturnTo
    const index = alt.visited.lastIndexOf(ziel)
    return {
      ...alt,
      currentStepId: ziel,
      visited: index >= 0 ? alt.visited.slice(0, index + 1) : [...alt.visited, ziel],
      detourReturnTo: null,
    }
  })
}

export function merkeAntwort<K extends keyof Antworten>(
  schluessel: K,
  wert: Antworten[K],
) {
  aendereFortschritt((alt) => ({
    ...alt,
    answers: { ...alt.answers, [schluessel]: wert },
  }))
}

// ---------------------------------------------------------------------------
// Lesen
// ---------------------------------------------------------------------------

function abonniere(hoerer_: () => void) {
  hoerer.add(hoerer_)
  return () => {
    hoerer.delete(hoerer_)
  }
}

export function useSitzung(): Sitzung {
  return useSyncExternalStore(abonniere, () => sitzung)
}

export function useBildschirm(): Bildschirm {
  return useSyncExternalStore(abonniere, () => bildschirm)
}

/** Der Beruf, in dem der Besucher steckt — oder der zuletzt angesehene. */
export function useAktiverBeruf(): BerufId | null {
  return useSyncExternalStore(abonniere, () => sitzung.aktiverBeruf)
}

export function useAngesehenerBeruf(): BerufId | null {
  return useSyncExternalStore(abonniere, () => angesehenerBeruf)
}

/**
 * Der Graph des aktiven Berufs. Auf jedem Step-Screen vorhanden — ohne
 * aktiven Beruf wird kein Step gerendert.
 */
export function useGraph(): StepGraph {
  const id = useAktiverBeruf()
  const graph = id ? beruf(id).graph : null
  if (!graph) throw new Error('Kein aktiver Beruf — hier darf kein Step stehen.')
  return graph
}

/**
 * Der Stand des aktiven Berufs.
 *
 * Gibt es keinen, kommt ein leerer Stand statt `null` zurück: die Alternative
 * wäre, jeden Step-Screen und den KioskGuard mit einer Fallunterscheidung zu
 * versehen, die auf einem Step-Screen nie eintreten kann.
 */
export function useFortschritt(): Fortschritt {
  const s = useSitzung()
  const id = s.aktiverBeruf
  const stand = id ? s.berufe[id] : undefined
  return stand ?? LEER_ERSATZ
}

const LEER_ERSATZ: Fortschritt = {
  currentStepId: '',
  visited: [],
  hoechsterStep: '',
  branchesTaken: [],
  answers: {},
  detourReturnTo: null,
}

/** Für S0: gibt es überhaupt etwas zum Weitermachen? */
export function useWiedereinstieg(): { beruf: BerufId; fortschritt: Fortschritt } | null {
  const s = useSitzung()
  const moeglich = useSyncExternalStore(abonniere, () => hatWiedereinstieg)
  const id = s.aktiverBeruf
  const stand = id ? s.berufe[id] : undefined
  if (!moeglich || !id || !stand) return null
  return { beruf: id, fortschritt: stand }
}

/** Welche Berufe der Besucher in dieser Sitzung schon betreten hat. */
export function useBesuchteBerufe(): BerufId[] {
  const s = useSitzung()
  return (Object.keys(s.berufe) as BerufId[]).filter(
    (id) => (s.berufe[id]?.visited.length ?? 0) > 0,
  )
}
