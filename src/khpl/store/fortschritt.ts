import { useSyncExternalStore } from 'react'
import type { StepGraph, StepId } from '@/khpl/flow/steps'
import { istStepId, railIndex, step } from '@/khpl/flow/steps'
import { beruf, istBerufId } from '@/khpl/berufe/registry'
import type { BerufId } from '@/khpl/berufe/typen'
import type { HelmWahl } from '@/khpl/match/helm'
import { istGeste, type Geste } from '@/khpl/komponenten/gesten'
import { erfasse, neueAnalytikSitzung } from '@/lib/analytik'

/**
 * Sitzungszustand, je Beruf getrennt.
 *
 * **Idle löscht nichts.** Ein naheliegender Reflex wäre „kein Zustand überlebt
 * einen Reset“ — der Leerlauf bringt die App aber nur auf den Splash zurück und
 * wirft nichts weg. Der nächste Besucher wählt dort „Neu starten“, wer nur kurz
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

/** Älter als das, gehört der Stand niemandem mehr. */
export const VERFALL_MS = 30 * 60 * 1000

/**
 * Welcher Screen gerade läuft — **und der wird mitgespeichert**.
 *
 * Die ersten vier sind der Trichter, danach beginnt die Anwendung, die
 * es vorher schon gab. `bald` ist der Ausgang für einen Beruf ohne Graph.
 *
 * `vorschlag` ist entfallen: der Vorschlag ist jetzt die hervorgehobene erste
 * Karte der Berufsliste, kein eigener Screen.
 *
 * **Warum das jetzt in der Sitzung liegt.** Bis hierher war der Screen bewusst
 * flüchtig — mit der Folge, dass ein versehentlicher Reload jeden Besucher auf
 * den Splash warf, obwohl sein Fortschritt unversehrt im localStorage lag. Er
 * kam dort nur nicht mehr hin, ohne den ganzen Tag noch einmal zu tippen. Ein
 * Reload ist kein Sitzungsende, und ein iPad, das jemand aus Versehen mit zwei
 * Fingern wischt, auch nicht.
 *
 * Die Liste steht als Wert da, nicht nur als Typ: gelesen wird sie aus fremdem
 * JSON (localStorage, `history.state`), und dafür braucht es eine Prüfung zur
 * Laufzeit.
 */
const BILDSCHIRME = [
  'splash',
  'helm',
  'fragen',
  'berufe',
  'intro',
  'step',
  'bald',
] as const

export type Bildschirm = (typeof BILDSCHIRME)[number]

/**
 * Typisierte Sicht auf `answers`. Bleibt zur Laufzeit ein reines JSON-Objekt.
 *
 * **Ein Abschnitt je gebautem Beruf.** Der Fortschritt liegt zwar schon je
 * Beruf (`berufe: Partial<Record<BerufId, Fortschritt>>`), zur Laufzeit
 * kollidiert also nichts — das *Interface* ist aber gemeinsam, und drei Tage
 * entstehen gleichzeitig. Die Abschnitte sind die Naht, an der drei Agenten
 * dieselbe Datei anfassen können, ohne einander zu überschreiben: **jeder
 * trägt nur in seinem Abschnitt ein.**
 *
 * Die Schlüssel selbst sind dank der Id-Präfixe je Beruf disjunkt — `m*` gehört
 * dem Dachdecker, `c*` dem Zimmerer, `a*` der Anlagenmechanik, `z*` der
 * Zerspanung (siehe `berufe/typen.ts`).
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
   * Fadenobjekt ab C4 kennzeichnet: Ab C4 gehört das Element dem Besucher —
   * der Ausschnitt ist seiner. C5, C6 und C7 zeigen
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
  // Anlagenmechanik — Schlüssel `a*`
  //
  // Formen je Step am Ende seines Abschnitts. Alles, was der Rückblick in A7
  // aufzählt, kommt von hier.
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
  /**
   * A3 — welche Wasserkocher-Antwort getippt wurde. Der Tipp löst sofort auf,
   * ein eigenes `aufgeloest`-Flag trüge nichts; der Rückblick in A7 liest
   * direkt `tipp`.
   *
   * ⚠️ **Die Form hat sich mit jedem Umbau geändert** (erst
   * `{ schaetzung, aufgeloest }`, ein Reglerwert in kW; dann
   * `{ verluste, aufgeloest }`, die Flächensuche). Ein alter Stand fällt in
   * `pruefeAntworten` von selbst auf den Boden — `tipp` fehlt, der Eintrag
   * wird verworfen, A3 startet neu.
   */
  a3?: { tipp: string }
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
   * ⚠️ **Noch ohne Schreiber, und das ist gemeldet:** `merkeKarriereweg` unten
   * schreibt fest verdrahtet nach `answers.m9`, einem Dachdecker-Schlüssel.
   * Zur Laufzeit kollidiert das nicht, weil der Fortschritt je Beruf liegt —
   * die Schlüssel sollen aber je Beruf disjunkt bleiben, und der dieses Tages
   * ist `a8`. Die Auflösung ist ein Parameter an der Funktion und gehört in
   * die Hülle, nicht in einen einzelnen Tag.
   */
  a8?: { angesehen: StepId[] }

  // -------------------------------------------------------------------------
  // Zerspanung — Schlüssel `z*`
  //
  // Formen je Step am Kopf seiner Datei (`steps/zerspanung/`). Alles, was
  // der Rückblick in Z7 aufzählt, kommt von hier.
  // -------------------------------------------------------------------------

  /**
   * Z1 — die einsortierten Dinge der Genauigkeits-Leiter, in Reihenfolge.
   *
   * `treffer` zählt keine Punkte, sondern speist nur die Auswertung — auf
   * dem Screen erscheint die Zahl nie (wie `gut` in A7). `fertig` heißt:
   * alle vier einsortiert.
   */
  z1?: { zugeordnet: string[]; treffer: number; fertig: boolean }
  /**
   * Z2 — Rohteil gespannt (mit Zahl der Fehlgriffe), Drehzahl geschätzt und
   * aufgelöst. `schaetzung` ist der Reglerwert in U/min.
   */
  z2?: { gespannt: boolean; versuche: number; schaetzung: number; aufgeloest: boolean }
  /**
   * Z3 — besuchte Kapitel (`maschine`, `befehle`, `programm`); `gefunden`
   * heißt: das Programm bis zum Ende laufen gesehen. `versuche` ist ein
   * Altfeld aus der Quiz-Fassung und bleibt 0.
   */
  z3?: { gesehen: string[]; gefunden: boolean; versuche: number }
  /**
   * Z4 — das Probeteil: Serie freigegeben, Zahl der Nachdreh-Versuche und
   * die Korrektur, mit der das Maß am Ende im Fenster lag (in mm, negativ).
   */
  z4?: { freigegeben: boolean; versuche: number; korrektur: number }
  /** Z5 — welche der drei Pausenfragen gelesen wurden. */
  z5?: { gelesen: string[] }
  /** Z6 — Stand des Zählers, und ob die Verschleiß-Korrektur drin ist. */
  z6?: { stueck: number; nachkorrigiert: boolean; stabil: boolean }
  /** Z8 — angesehene Karrierewege, in Reihenfolge des Öffnens. */
  z8?: { angesehen: StepId[] }
}

/** Der Stand **eines** Berufs. */
export interface Fortschritt {
  currentStepId: StepId
  /** Reihenfolge = Zurück-Historie. Kann denselben Step mehrfach enthalten. */
  visited: StepId[]
  /**
   * Der weiteste erreichte Hauptschritt — die Hochwassermarke.
   *
   * Ohne sie bricht ein Versprechen des Sheets „Dein Weg“: ein ✓ dort ist
   * antippbar und springt zum Schritt zurück. Leitet man
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
  /**
   * Welcher Screen zuletzt lief. Damit überlebt die **Stelle** einen Reload,
   * nicht nur der Fortschritt (siehe `Bildschirm`).
   */
  bildschirm: Bildschirm
  /**
   * Welcher angekündigte Beruf auf dem `bald`-Screen liegt.
   *
   * Gehört mit gespeichert, weil `bald` ein Screen ist, den ein Reload treffen
   * kann — ohne den Beruf dazu wäre er leer.
   */
  angesehenerBeruf: BerufId | null
  /** Der Beruf, in dem der Besucher gerade steckt. `null` = noch im Trichter. */
  aktiverBeruf: BerufId | null
  /** Angelegt wird ein Eintrag erst, wenn ein Beruf betreten wird. */
  berufe: Partial<Record<BerufId, Fortschritt>>
  helm: HelmWahl | null
  /** Frage-Id → Antwort-Id. Übersprungene Fragen fehlen schlicht. */
  gefragt: Record<string, string>
  /**
   * Welche Gesten der Besucher schon angesagt bekommen hat (`Ansage.tsx`).
   *
   * **An der Sitzung, nicht am Beruf.** Wer im Zimmerer-Tag gelernt hat, wie
   * man eine Linie zieht, soll das beim Wechsel auf Anlagenmechanik nicht noch
   * einmal erklärt bekommen — die Geste gehört dem Besucher, nicht dem Tag.
   * Genau wie `helm` und `gefragt`.
   */
  gelernteGesten: Geste[]
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
    bildschirm: 'splash',
    angesehenerBeruf: null,
    aktiverBeruf: null,
    berufe: {},
    helm: null,
    gefragt: {},
    gelernteGesten: [],
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
 * `Antworten`. Jeder Agent prüft nur seine eigenen Schlüssel; dank der
 * Id-Präfixe je Beruf überschneiden sie sich nicht. Ein
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
  if (a3 && typeof a3.tipp === 'string') {
    a.a3 = { tipp: a3.tipp }
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

  // ---------------------------------------------------------------------
  // Zerspanung — Schlüssel `z*`
  // ---------------------------------------------------------------------

  const z1 = q.z1 as Antworten['z1']
  if (z1 && stringListe(z1.zugeordnet)) {
    a.z1 = {
      zugeordnet: stringListe(z1.zugeordnet) as string[],
      treffer:
        typeof z1.treffer === 'number' && Number.isFinite(z1.treffer) ? z1.treffer : 0,
      fertig: !!z1.fertig,
    }
  }
  const z2 = q.z2 as Antworten['z2']
  if (z2 && typeof z2.versuche === 'number' && Number.isFinite(z2.versuche)) {
    a.z2 = {
      gespannt: !!z2.gespannt,
      versuche: z2.versuche,
      // Ein kaputter Reglerwert darf die Auflösung nicht mitreißen — er wird
      // nur zum Vergleich angezeigt.
      schaetzung:
        typeof z2.schaetzung === 'number' && Number.isFinite(z2.schaetzung)
          ? z2.schaetzung
          : 0,
      aufgeloest: !!z2.aufgeloest,
    }
  }
  const z3 = q.z3 as Antworten['z3']
  if (z3 && stringListe(z3.gesehen)) {
    a.z3 = {
      gesehen: stringListe(z3.gesehen) as string[],
      gefunden: !!z3.gefunden,
      versuche:
        typeof z3.versuche === 'number' && Number.isFinite(z3.versuche) ? z3.versuche : 0,
    }
  }
  const z4 = q.z4 as Antworten['z4']
  if (z4 && typeof z4.versuche === 'number' && Number.isFinite(z4.versuche)) {
    a.z4 = {
      freigegeben: !!z4.freigegeben,
      versuche: z4.versuche,
      // Nur eine echte Zahl übernehmen — Z4 rechnet damit das Anzeige-Maß.
      korrektur:
        typeof z4.korrektur === 'number' && Number.isFinite(z4.korrektur)
          ? z4.korrektur
          : 0,
    }
  }
  const z5 = q.z5 as Antworten['z5']
  if (z5 && stringListe(z5.gelesen)) {
    a.z5 = { gelesen: stringListe(z5.gelesen) as string[] }
  }
  const z6 = q.z6 as Antworten['z6']
  if (z6 && typeof z6.stueck === 'number' && Number.isFinite(z6.stueck)) {
    a.z6 = { stueck: z6.stueck, nachkorrigiert: !!z6.nachkorrigiert, stabil: !!z6.stabil }
  }
  const z8 = q.z8 as Antworten['z8']
  if (z8 && Array.isArray(z8.angesehen)) {
    // Fällt eine StepId aus dem Graphen, darf sie nicht als Aufhänger auf Z9
    // wieder auftauchen.
    a.z8 = { angesehen: z8.angesehen.filter((x) => istStepId(graph, x)) }
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

    const roher = istBerufId(s.aktiverBeruf) ? s.aktiverBeruf : null
    // Ein aktiver Beruf ohne Stand ist kein Wiedereinstieg, sondern ein
    // Zeiger ins Leere — er käme als „Weitermachen bei …“ auf den Splash und
    // landete auf dem ersten Step eines Tages, den nie jemand angefangen hat.
    const aktiv = roher && berufe[roher] ? roher : null
    const angesehen = istBerufId(s.angesehenerBeruf) ? s.angesehenerBeruf : null

    return {
      version: 2,
      bildschirm: stimmigerBildschirm(pruefeBildschirm(s.bildschirm), aktiv, angesehen),
      angesehenerBeruf: angesehen,
      aktiverBeruf: aktiv,
      berufe,
      helm: pruefeHelm(s.helm),
      gefragt: pruefeGefragt(s.gefragt),
      gelernteGesten: pruefeGesten(s.gelernteGesten),
      updatedAt: s.updatedAt,
    }
  } catch {
    return null
  }
}

function pruefeBildschirm(roh: unknown): Bildschirm {
  return BILDSCHIRME.includes(roh as Bildschirm) ? (roh as Bildschirm) : 'splash'
}

/**
 * Ein Screen, der ins Leere zeigt, fällt auf den Splash zurück.
 *
 * Der Fall ist real: zwischen dem Speichern und dem Wiederherstellen kann ein
 * Deploy liegen, der einen Beruf umbenannt oder seinen Graphen entfernt hat.
 * Dann steht in der Sitzung „step“, aber es gibt keinen Beruf mehr, dessen
 * Step das wäre — und `KhplApp` rendert einen leeren Screen. Der Splash ist
 * hier immer die richtige Antwort: von dort kommt jeder weiter.
 */
function stimmigerBildschirm(
  bildschirm: Bildschirm,
  aktiv: BerufId | null,
  angesehen: BerufId | null,
): Bildschirm {
  if ((bildschirm === 'step' || bildschirm === 'intro') && !aktiv) return 'splash'
  if (bildschirm === 'bald' && !angesehen) return 'splash'
  return bildschirm
}

function pruefeHelm(roh: unknown): HelmWahl | null {
  if (typeof roh !== 'object' || roh === null) return null
  const h = roh as Partial<HelmWahl>
  if (typeof h.farbe !== 'string' || typeof h.werkzeug !== 'string') return null
  return { farbe: h.farbe, werkzeug: h.werkzeug }
}

function pruefeGesten(roh: unknown): Geste[] {
  // Ein unbekannter Name aus einem alten Stand fliegt still raus. Die Folge
  // wäre sonst eine Geste, die als „schon erklärt“ gilt, weil sie früher
  // einmal anders hieß — und damit eine Ansage, die nie erscheint.
  return Array.isArray(roh) ? roh.filter(istGeste) : []
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

// Der Verfall wird **beim Laden** geprüft und nicht erst auf dem Splash: seit
// der Screen mitgespeichert wird, landet ein Reload wieder mitten im Tag, und
// der Splash — der einzige Ort, an dem `pruefeVerfall` sonst läuft — käme nie
// mehr vorbei. Ein iPad, das über Nacht steht, böte morgens den Stand von
// gestern an, samt fremder Antworten im Rückblick.
if (Date.now() - sitzung.updatedAt > VERFALL_MS) sitzung = leereSitzung()

/** Ob ein Stand zum Weitermachen bereitliegt. */
let hatWiedereinstieg = wiedereinstiegMoeglich(sitzung)

function wiedereinstiegMoeglich(s: Sitzung): boolean {
  const aktiv = s.aktiverBeruf
  if (!aktiv) return false
  return (s.berufe[aktiv]?.visited.length ?? 0) > 0
}

const hoerer = new Set<() => void>()

function melde() {
  hoerer.forEach((h) => h())
}

/**
 * Wirft alles weg und setzt den Screen neu.
 *
 * Speichert **sofort** statt nur zu löschen: der leere Stand trägt jetzt den
 * Screen mit sich, und der soll einen Reload direkt danach überleben — wer
 * gerade „Neu starten“ getippt hat und das iPad neu lädt, will nicht zurück
 * auf den Splash, sondern bei der Helmwahl stehen.
 */
function vergiss(neuerBildschirm: Bildschirm) {
  // Mit der Sitzung stirbt die Analytik-Identität — der nächste Besucher
  // zählt als eigener. Die Cookie-Entscheidung bleibt davon unberührt: sie
  // liegt am Gerät (`lib/analytik.ts`) und überlebt jeden Reset.
  neueAnalytikSitzung()
  sitzung = { ...leereSitzung(), bildschirm: neuerBildschirm }
  hatWiedereinstieg = false
  sichere()
  melde()
  erfasse('bildschirm_gesehen', { bildschirm: neuerBildschirm })
}

/**
 * Verwirft einen abgelaufenen Stand. Gibt zurück, ob etwas verworfen wurde.
 *
 * Läuft **zur Lesezeit**, nicht nur beim Laden des Moduls: das Kiosk-iPad lädt
 * die Seite genau einmal am Messemorgen und läuft dann stundenlang. Ein
 * Verfallstest, der nur beim Modulstart stattfindet, ist in genau dem einzigen
 * Betriebsmodus tot, für den er geschrieben wurde — der Splash böte um halb
 * zwölf noch an, die Sitzung von neun Uhr fortzusetzen, samt fremder Antworten
 * im Rückblick von M8.
 *
 * Den Test beim Modulstart gibt es trotzdem (oben, direkt nach `lade`), und
 * zwar seit der Screen mitgespeichert wird: ein Reload landet jetzt wieder
 * mitten im Tag und käme am Splash — dem einzigen Ort, an dem diese Funktion
 * sonst läuft — nie mehr vorbei.
 */
export function pruefeVerfall(): boolean {
  if (!hatWiedereinstieg) return false
  if (Date.now() - sitzung.updatedAt <= VERFALL_MS) return false
  erfasse('sitzung_verfallen', { beruf: sitzung.aktiverBeruf })
  vergiss('splash')
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
  aendere((s) => {
    if (s.bildschirm === neu) return s
    // Screen-Wechsel als Ereignis: die App hat keine URLs, das hier ist ihr
    // Pageview. Bewusst im Updater — nur ein echter Wechsel zählt.
    erfasse('bildschirm_gesehen', { bildschirm: neu })
    return { ...s, bildschirm: neu }
  })
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
 * Rail — die Rail gehört aber auf **jeden** Step-Screen.
 */
function skipStand(graph: StepGraph, alt: Fortschritt, ziel: StepId): StepId | null {
  if (alt.detourReturnTo === null) return null
  return graph.karriereBereich.includes(ziel) ? alt.detourReturnTo : null
}

// ---------------------------------------------------------------------------
// Trichter — Splash bis Berufsliste
// ---------------------------------------------------------------------------

/** Splash → Helmwahl. Verwirft einen alten Stand vollständig. */
export function starteNeu() {
  vergiss('helm')
  erfasse('sitzung_gestartet')
}

/** Vom Splash dorthin, wo der letzte Besucher aufgehört hat. */
export function machWeiter() {
  if (pruefeVerfall()) return
  erfasse('sitzung_fortgesetzt', { beruf: sitzung.aktiverBeruf })
  setzeBildschirm(sitzung.aktiverBeruf ? 'step' : 'berufe')
}

export function merkeHelm(wahl: HelmWahl) {
  aendere((s) => ({ ...s, helm: wahl }))
  erfasse('helm_gewaehlt', { farbe: wahl.farbe, werkzeug: wahl.werkzeug || null })
}

/**
 * Hält fest, dass eine Geste angesagt wurde (`Ansage.tsx`).
 *
 * Idempotent: die Ansage ruft das beim Wegtippen, und ein zweiter Aufruf
 * derselben Geste darf weder speichern noch `updatedAt` auffrischen — sonst
 * hält ein Besucher, der auf einem Screen herumtippt, den Verfall offen
 * (`aendere` gibt bei `neu === alt` auf).
 */
export function merkeGeste(geste: Geste) {
  aendere((s) =>
    s.gelernteGesten.includes(geste)
      ? s
      : { ...s, gelernteGesten: [...s.gelernteGesten, geste] },
  )
}

export function merkeFrage(frageId: string, antwortId: string) {
  aendere((s) => ({ ...s, gefragt: { ...s.gefragt, [frageId]: antwortId } }))
  erfasse('frage_beantwortet', { frage: frageId, antwort: antwortId })
}

export function zeigeFragen() {
  setzeBildschirm('fragen')
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
    erfasse('beruf_bald_angesehen', { beruf: id })
    setzeBildschirm('bald')
    return
  }

  const schonDa = (sitzung.berufe[id]?.visited.length ?? 0) > 0
  erfasse('beruf_betreten', { beruf: id, fortgesetzt: schonDa })
  aendere((s) => ({
    ...s,
    aktiverBeruf: id,
    berufe: s.berufe[id] ? s.berufe : { ...s.berufe, [id]: leererFortschritt(graph) },
  }))
  setzeBildschirm(schonDa ? 'step' : 'intro')
}

function merkeAngesehen(id: BerufId) {
  aendere((s) => (s.angesehenerBeruf === id ? s : { ...s, angesehenerBeruf: id }))
}

/** Intro → erster Step. „Auftrag annehmen“ ist der erste Besuch des ersten Steps. */
export function nimmAuftragAn() {
  const id = sitzung.aktiverBeruf
  if (!id || !beruf(id).graph) return
  erfasse('auftrag_angenommen', { beruf: id })

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

/** Idle-Rückfall: zurück auf den Splash, **ohne** zu löschen. */
export function zumSplash() {
  erfasse('idle_zurueckgefallen', { bildschirm: sitzung.bildschirm })
  setzeBildschirm('splash')
}

/** Harter Reset für das Standpersonal. */
export function setzeZurueck() {
  erfasse('sitzung_zurueckgesetzt')
  vergiss('splash')
}

// ---------------------------------------------------------------------------
// Browser-Verlauf
//
// Die Mechanik selbst steht in `store/verlauf.ts`; hier liegt nur, was sie vom
// Stand braucht: eine Momentaufnahme der **Stelle** und der Weg zurück.
// ---------------------------------------------------------------------------

/**
 * Wo der Besucher steht — genug, um exakt hierher zurückzukommen.
 *
 * Was **nicht** darin steht, ist so wichtig wie das, was darin steht:
 *
 *  - `answers` und `branchesTaken` bleiben draußen. Sie sind Gelerntes, keine
 *    Stelle. Wer zurückgeht, soll seine Schätzung aus M2 nicht vergessen.
 *  - `hoechsterStep` bleibt draußen. Die Hochwassermarke fällt nie — sonst
 *    entwerten sich beim Zurückgehen alle Häkchen im Sheet, und der Weg nach
 *    vorn wäre zu.
 *
 * `tiefe` zählt nur **unsere eigenen** Einträge, damit der ←-Knopf der App weiß,
 * ob hinter ihm überhaupt einer von uns liegt oder schon die Seite davor.
 */
export interface Verlaufsmarke {
  tiefe: number
  bildschirm: Bildschirm
  beruf: BerufId | null
  angesehen: BerufId | null
  nav: { aktuell: StepId; besucht: StepId[]; abstecherZurueck: StepId | null } | null
}

/** Die aktuelle Stelle als Marke — das, was in einen Verlaufseintrag geht. */
export function verlaufsmarke(tiefe: number): Verlaufsmarke {
  const id = sitzung.aktiverBeruf
  const f = id ? sitzung.berufe[id] : undefined
  return {
    tiefe,
    bildschirm: sitzung.bildschirm,
    beruf: id,
    angesehen: sitzung.angesehenerBeruf,
    nav: f
      ? {
          aktuell: f.currentStepId,
          besucht: [...f.visited],
          abstecherZurueck: f.detourReturnTo,
        }
      : null,
  }
}

/**
 * Setzt den Stand auf eine Marke zurück — die Zurück- **und** die
 * Vorwärts-Taste des Browsers laufen beide hier durch.
 *
 * Deshalb wird `visited` gesetzt und nicht abgeschnitten: die Marke trägt die
 * Historie, wie sie an dieser Stelle war, und das gilt in beide Richtungen.
 *
 * Alles wird noch einmal geprüft. Der Verlauf des Browsers überlebt einen
 * Deploy, ein gelöschter Stand (Personal-Reset) liegt danach hinter uns, und in
 * beiden Fällen zeigt eine Marke auf etwas, das es nicht mehr gibt.
 */
export function stelleVerlaufHer(m: Verlaufsmarke) {
  aendere((s) => {
    const id = istBerufId(m.beruf) && s.berufe[m.beruf] ? m.beruf : null
    const angesehen = istBerufId(m.angesehen) ? m.angesehen : null
    let berufe = s.berufe

    if (id && m.nav) {
      const graph = beruf(id).graph
      const alt = s.berufe[id]
      if (graph && alt && istStepId(graph, m.nav.aktuell)) {
        berufe = {
          ...s.berufe,
          [id]: {
            ...alt,
            currentStepId: m.nav.aktuell,
            visited: Array.isArray(m.nav.besucht)
              ? m.nav.besucht.filter((x) => istStepId(graph, x))
              : alt.visited,
            detourReturnTo: istStepId(graph, m.nav.abstecherZurueck)
              ? m.nav.abstecherZurueck
              : null,
          },
        }
      }
    }

    // Trägt die Marke keinen Beruf (Splash, Helm, Fragen, Berufsliste), bleibt
    // der bisherige stehen, statt gelöscht zu werden. Sonst verlöre ein
    // Besucher, der bis auf den Splash zurückgeht, dort sein „Weitermachen bei
    // Dachdecker“ — obwohl sein Tag unversehrt daneben liegt. Genauso hält es
    // `zeigeBerufe`: ein Screen ohne Beruf ist kein Verlassen des Berufs.
    const aktiv = id ?? s.aktiverBeruf

    return {
      ...s,
      bildschirm: stimmigerBildschirm(pruefeBildschirm(m.bildschirm), aktiv, angesehen),
      angesehenerBeruf: angesehen,
      aktiverBeruf: aktiv,
      berufe,
    }
  })
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
    // genommener Abstecher: alle drei sollen jederzeit im Angebot bleiben, und sie
    // gehören nicht in den Rückblick von M8 — „du hast heute … eine Info-Seite
    // gelesen“ ist keine Tageleistung. Angesehen wird in `answers.m9` vermerkt.
    const zaehlt = def.art === 'abstecher' && !def.immerOffen
    erfasse('step_gesehen', { beruf: sitzung.aktiverBeruf, step: ziel, art: def.art })
    // `weiter: null` gibt es nur am Ende der Hauptlinie — das ist die
    // Conversion des Tages. Der Besuchtheits-Test hält Wiederholungen nach
    // einem ← draußen.
    if (def.weiter === null && !alt.visited.includes(ziel)) {
      erfasse('tag_abgeschlossen', { beruf: sitzung.aktiverBeruf })
    }
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
    erfasse('karriereweg_angesehen', { beruf: sitzung.aktiverBeruf, step: ziel })
    return {
      ...alt,
      answers: {
        ...alt.answers,
        // Reihenfolge des Öffnens; der zuletzt geöffnete Weg speist den
        // personalisierten Aufhänger in M10.
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
  erfasse('karriere_geoeffnet', { beruf: sitzung.aktiverBeruf })
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
 * Abstecher: danach soll alles aussehen wie davor.
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
  // Der Stand der Übung als Ereignis — Versuche, Schätzungen, Trefferquoten.
  erfasse('uebung_stand', {
    beruf: sitzung.aktiverBeruf,
    uebung: schluessel,
    stand: wert,
  })
}

// ---------------------------------------------------------------------------
// Lesen
// ---------------------------------------------------------------------------

export function abonniere(hoerer_: () => void) {
  hoerer.add(hoerer_)
  return () => {
    hoerer.delete(hoerer_)
  }
}

export function useSitzung(): Sitzung {
  return useSyncExternalStore(abonniere, () => sitzung)
}

export function useBildschirm(): Bildschirm {
  return useSyncExternalStore(abonniere, () => sitzung.bildschirm)
}

/** Der Beruf, in dem der Besucher steckt — oder der zuletzt angesehene. */
export function useAktiverBeruf(): BerufId | null {
  return useSyncExternalStore(abonniere, () => sitzung.aktiverBeruf)
}

export function useAngesehenerBeruf(): BerufId | null {
  return useSyncExternalStore(abonniere, () => sitzung.angesehenerBeruf)
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

/** Für den Splash: gibt es überhaupt etwas zum Weitermachen? */
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

/**
 * Welche Berufe der Besucher in dieser Sitzung **zu Ende** gespielt hat: der
 * Schlussstep eines Tages ist der mit `weiter: null` — wer dort war, hat den
 * CTA gesehen. Ohne diese Auskunft trug ein komplett durchgespielter Tag auf
 * der Berufsliste dieselbe Marke „Angefangen — da weitermachen“ wie ein
 * halbfertiger (Nachprüfung 25.08.).
 */
export function useFertigeBerufe(): BerufId[] {
  const s = useSitzung()
  return (Object.keys(s.berufe) as BerufId[]).filter((id) => {
    const graph = beruf(id).graph
    const visited = s.berufe[id]?.visited
    if (!graph || !visited?.length) return false
    return visited.some((v) => istStepId(graph, v) && step(graph, v).weiter === null)
  })
}
