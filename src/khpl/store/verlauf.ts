import {
  abonniere,
  stelleVerlaufHer,
  verlaufsmarke,
  type Verlaufsmarke,
} from '@/khpl/store/fortschritt'

/**
 * Der Browser-Verlauf der App — Zurück-Taste, Vorwärts-Taste, Reload.
 *
 * **Warum es das jetzt gibt.** Die Hülle war ausdrücklich ohne Router gebaut:
 * keine URLs, keine Tiefenlinks, keine Zurück-Taste, die etwas Sinnvolles täte.
 * Das stimmt für ein festgeschraubtes iPad im Kioskmodus — und für nichts
 * sonst. Auf jedem Gerät mit sichtbarer Browserleiste hieß es: ein Wisch mit
 * zwei Fingern, und der Besucher stand auf dem Splash, während sein Tag noch
 * unversehrt im localStorage lag. Er kam nur nicht mehr hin.
 *
 * **Was hier trotzdem nicht passiert: eine URL.** Es gibt weiterhin keine
 * Adressen und keine Tiefenlinks. Jeder Schritt legt einen Verlaufseintrag an,
 * dessen `state` die Stelle trägt (`Verlaufsmarke`) — die Adresszeile bleibt
 * unberührt. Damit funktioniert Zurück, Vorwärts und Reload, ohne dass ein
 * Besucher eine URL abschreiben und mitten im Tag einsteigen könnte.
 *
 * **Wie es zusammenhängt.**
 *
 *  - Jede Änderung der *Stelle* schiebt einen Eintrag nach (`pushState`).
 *    Änderungen, die nur Antworten betreffen, tun das nicht — sonst hätte ein
 *    Tag hundert Einträge, die alle gleich aussehen.
 *  - Zurück und Vorwärts stellen die Marke des Eintrags wieder her. Beide
 *    Richtungen laufen durch dieselbe Funktion: die Marke *ist* die Stelle,
 *    also braucht keine Richtung einen Sonderfall.
 *  - Der ←-Knopf der App ruft `history.back()` statt selbst zurückzugehen.
 *    Sonst liefen App-Stand und Verlauf auseinander, und die Zurück-Taste des
 *    Browsers spränge anschließend eine Stelle zu weit.
 *
 * **Das Zusammenspiel mit dem localStorage.** Beide speichern dieselbe Stelle,
 * und beide werden gebraucht: der localStorage überlebt einen geschlossenen
 * Tab, der Verlaufseintrag weiß, auf **welchem** von zwanzig Einträgen der
 * Reload passiert ist. Deshalb gewinnt beim Start der Eintrag, wenn es einen
 * gibt (jemand ist dreimal zurückgegangen und lädt dann neu) — sonst der
 * localStorage.
 */

/** Die zuletzt geschriebene Marke. `null`, solange nichts gestartet ist. */
let letzte: Verlaufsmarke | null = null

/** Solange wir selbst gerade wiederherstellen, wird nichts nachgeschoben. */
let unterwegs = false

/** Ein Schub je Ereignis, nicht je Meldung — s. `beiAenderung`. */
let geplant = false

/**
 * Nur die Stelle vergleichen, nicht die ganze Marke.
 *
 * `besucht` wird über die Länge geprüft statt Element für Element: ein Sprung
 * aus „Dein Weg“ auf den Schritt, auf dem man ohnehin steht, ändert nur sie —
 * und ist trotzdem ein Schritt, der einen eigenen Eintrag verdient.
 */
function gleicheStelle(a: Verlaufsmarke, b: Verlaufsmarke): boolean {
  return (
    a.bildschirm === b.bildschirm &&
    a.beruf === b.beruf &&
    a.angesehen === b.angesehen &&
    a.nav?.aktuell === b.nav?.aktuell &&
    a.nav?.abstecherZurueck === b.nav?.abstecherZurueck &&
    (a.nav?.besucht.length ?? -1) === (b.nav?.besucht.length ?? -1)
  )
}

/**
 * Liest eine Marke aus `history.state`. Oberflächlich — die Feinprüfung macht
 * `stelleVerlaufHer`, weil nur der Store weiß, welche Ids es noch gibt.
 */
function markeAus(roh: unknown): Verlaufsmarke | null {
  if (typeof roh !== 'object' || roh === null) return null
  const s = roh as { khpl?: unknown }
  if (typeof s.khpl !== 'object' || s.khpl === null) return null
  const m = s.khpl as Partial<Verlaufsmarke>
  if (typeof m.tiefe !== 'number' || typeof m.bildschirm !== 'string') return null
  return m as Verlaufsmarke
}

function schreibe(m: Verlaufsmarke, ersetzen: boolean) {
  try {
    // Zweites Argument leer, drittes gar nicht: die Adresszeile soll sich
    // nicht ändern. Ein Eintrag ohne URL-Wechsel ist trotzdem ein Eintrag.
    if (ersetzen) history.replaceState({ khpl: m }, '')
    else history.pushState({ khpl: m }, '')
  } catch {
    // Manche eingebetteten Webviews verbieten `pushState`. Dann gibt es eben
    // keine Zurück-Taste — der localStorage trägt den Reload trotzdem.
  }
}

function beiPopstate(ereignis: PopStateEvent) {
  const m = markeAus(ereignis.state)
  // Kein `khpl` im Eintrag heißt: der Eintrag gehört nicht uns (die Seite, von
  // der jemand hergekommen ist). Da hat die App nichts zu melden.
  if (!m) return

  unterwegs = true
  try {
    stelleVerlaufHer(m)
  } finally {
    unterwegs = false
  }

  // Der wiederhergestellte Stand kann von der Marke abweichen — ein Beruf, den
  // der Personal-Reset seither gelöscht hat, fällt auf den Splash zurück. Dann
  // muss der Eintrag mitkorrigiert werden, sonst versucht er es beim nächsten
  // Mal wieder.
  letzte = verlaufsmarke(m.tiefe)
  schreibe(letzte, true)
}

function beiAenderung() {
  if (unterwegs || geplant) return
  // Ein Schritt besteht oft aus zwei Meldungen — `betreteBeruf` setzt erst den
  // Beruf, dann den Screen. Ohne das Sammeln im Microtask entstünde dazwischen
  // ein Eintrag, den nie jemand gesehen hat, und die Zurück-Taste bräuchte
  // zwei Anläufe.
  geplant = true
  queueMicrotask(() => {
    geplant = false
    if (unterwegs || !letzte) return
    const jetzt = verlaufsmarke(letzte.tiefe + 1)
    if (gleicheStelle(jetzt, letzte)) return
    letzte = jetzt
    schreibe(jetzt, false)
  })
}

/**
 * Einmal beim Start aufrufen — vor dem ersten Rendern, damit der Screen sofort
 * stimmt und nicht erst nach einem Bild.
 */
export function starteVerlauf() {
  if (letzte) return

  const vorhanden = markeAus(history.state)
  if (vorhanden) {
    // Reload auf einem Eintrag, den wir selbst gesetzt haben: er ist genauer
    // als der localStorage — er weiß, wie oft der Besucher zurückgegangen ist.
    unterwegs = true
    try {
      stelleVerlaufHer(vorhanden)
    } finally {
      unterwegs = false
    }
    letzte = verlaufsmarke(vorhanden.tiefe)
  } else {
    letzte = verlaufsmarke(0)
  }

  schreibe(letzte, true)
  window.addEventListener('popstate', beiPopstate)
  abonniere(beiAenderung)
}

/** Ob hinter der aktuellen Stelle ein Eintrag **von uns** liegt. */
export function kannVerlaufZurueck(): boolean {
  return (letzte?.tiefe ?? 0) > 0
}

/** Einen Eintrag zurück. Die Wiederherstellung macht `beiPopstate`. */
export function verlaufZurueck() {
  history.back()
}
