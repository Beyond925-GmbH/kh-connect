import { FEHLERZEILE, FEHLER_CODE, PROFIL, PROGRAMM, ROHLING_DURCHMESSER } from './kanon'

/**
 * Der Werkzeugweg — **aus dem Programm gerechnet, nicht danebengelegt.**
 *
 * Z3 zeigt links den Code und rechts den Weg, und der Reiz des Screens hängt
 * daran, dass beides dasselbe ist: „mit jeder Zeile zeichnet sich ein Stück
 * Kontur“ (khpl-tag-zerspanung.md §6 Z3). Läge der Weg als zweite Punktliste
 * neben `PROGRAMM`, wäre die Aussage des Screens beim ersten Tippfehler falsch
 * — und niemand würde es merken, weil beide Listen für sich plausibel
 * aussähen. Deshalb liest diese Datei die Fahrbefehle aus demselben Code, den
 * der Besucher liest. Eine Quelle, zwei Ansichten (§7).
 *
 * **Was hier Fachwissen ist und deshalb im Kommentar steht:** an der Drehbank
 * ist `X` ein **Durchmesser**, `Z` die Achse. `X20.` heißt Radius 10, nicht
 * Radius 20. Wer das übersieht, zeichnet ein doppelt so dickes Teil und merkt
 * es nicht, weil die Form stimmt.
 *
 * **Keine eigene Datei für die Maße.** Die Werte stehen in `kanon.ts`; hier
 * steht nur die Ableitung. Diese Datei ist three-frei wie alles unter
 * `buehne/zerspanung/` und exportiert ausschließlich Funktionen und Werte —
 * keine Komponente, damit Steps sie ohne Umweg importieren können.
 */

/**
 * Das fertige Teil als geschlossener Schnitt — das Halbprofil aus `kanon.ts`,
 * an der Achse gespiegelt. Dieselbe Kontur, die Z3 aus dem Programm entstehen
 * lässt und die in Z1 als Zeichnung dasteht: **eine Quelle, zwei Ansichten.**
 */
export const KONTUR = (() => {
  const start = PROFIL[0]
  const oben = PROFIL.slice(1).map((p) => `L ${p.z} ${-p.r}`)
  const unten = [...PROFIL].reverse().map((p) => `L ${p.z} ${p.r}`)
  return `M ${start.z} ${-start.r} ${oben.join(' ')} ${unten.join(' ')} Z`
})()

export interface Wegpunkt {
  /** Index der Programmzeile in `PROGRAMM`, die diesen Punkt anfährt. */
  zeile: number
  /** Achsposition in mm. Negativ ist ins Material hinein, wie im Programm. */
  z: number
  /** Radius in mm — der Code nennt den Durchmesser, hier ist halbiert. */
  r: number
  /** `G0`: Eilgang. Es wird nichts abgetragen, die Linie ist gestrichelt. */
  eilgang: boolean
}

/**
 * Nur `G0` und `G1` bewegen etwas. `G21`, `G40`, `G50`, `G90`, `G96` sind
 * Einstellungen und dürfen nicht als Fahrbefehl durchgehen — deshalb das
 * erzwungene Leerzeichen: `G1 ` ja, `G50 ` nein.
 */
const FAHRBEFEHL = /^G([01])\s/
const X_WERT = /X(-?\d+(?:\.\d*)?)/
const Z_WERT = /Z(-?\d+(?:\.\d*)?)/

/**
 * **Die Achsen sind modal.** `G1 Z-35.` nennt kein X, weil X stehen bleibt —
 * genau das macht ein CNC-Programm lesbar und ist der Grund, warum der Weg
 * mitgeführt und nicht je Zeile neu gelesen werden kann.
 */
function ableiten(): Wegpunkt[] {
  const punkte: Wegpunkt[] = []
  let z = 0
  let r = 0

  PROGRAMM.forEach((zeile, i) => {
    const befehl = FAHRBEFEHL.exec(zeile.code)
    if (!befehl) return
    const x = X_WERT.exec(zeile.code)
    const zw = Z_WERT.exec(zeile.code)
    if (x) r = Number(x[1]) / 2
    if (zw) z = Number(zw[1])
    punkte.push({ zeile: i, z, r, eilgang: befehl[1] === '0' })
  })

  return punkte
}

/** Jeder Fahrbefehl des Programms als angefahrener Punkt, in Programmfolge. */
export const WERKZEUGWEG: readonly Wegpunkt[] = ableiten()

/**
 * Der Schnittweg und der Rückzug danach.
 *
 * `SCHNITT` fängt bei dem Eilgang an, der die Kontur **anfährt** — der Punkt
 * gehört dazu, weil die erste Schnittlinie sonst kein Von hätte. Was danach
 * unter Vorschub gefahren wird, trägt Material ab; der erste Eilgang danach
 * ist der Rückzug und wird gestrichelt gezeichnet.
 */
const { schnitt, rueckzug } = (() => {
  const erster = WERKZEUGWEG.findIndex((p) => !p.eilgang)
  if (erster < 1) return { schnitt: [], rueckzug: [] }
  let letzter = erster
  while (letzter + 1 < WERKZEUGWEG.length && !WERKZEUGWEG[letzter + 1].eilgang) letzter++
  return {
    schnitt: WERKZEUGWEG.slice(erster - 1, letzter + 1),
    rueckzug: WERKZEUGWEG.slice(letzter, letzter + 2),
  }
})()

export const SCHNITT: readonly Wegpunkt[] = schnitt
/** Der Rückzug als Strecke: zwei Punkte, oder leer, wenn keiner folgt. */
export const RUECKZUG: readonly Wegpunkt[] = rueckzug.length === 2 ? rueckzug : []

/**
 * **Was die falsche Zeile wirklich fährt.**
 *
 * Der eingebaute Fehler ist das fehlende Minuszeichen (`belege/zerspanung.md`
 * 7, khpl-tag-zerspanung.md §11): `G1 Z35.` statt `G1 Z-35.`. Ohne das Minus
 * fährt das Werkzeug nicht ins Material, sondern **vom Werkstück weg** — an
 * der Drehbank zeigt `Z+` von der Spannung fort. Es wird kein Span abgenommen,
 * die Kontur entsteht nicht.
 *
 * **Aus demselben Code gerechnet wie der richtige Weg.** `FEHLER_CODE` läuft
 * durch dieselben drei Ausdrücke wie `PROGRAMM`; die Achsen bleiben modal, X
 * steht also da, wo die Fase geendet hat. Eine zweite, danebengelegte
 * Punktliste würde beim ersten Tippfehler etwas anderes behaupten als der
 * Code, den der Besucher liest — und niemand würde es merken (§7, „eine
 * Quelle, zwei Ansichten“).
 */
const fehlweg = (() => {
  const bis = SCHNITT.findIndex((p, i) => i > 0 && p.zeile === FEHLERZEILE)
  const befehl = FAHRBEFEHL.exec(FEHLER_CODE)
  if (bis < 1 || !befehl) return []
  const von = SCHNITT[bis - 1]
  const x = X_WERT.exec(FEHLER_CODE)
  const zw = Z_WERT.exec(FEHLER_CODE)
  return [
    von,
    {
      zeile: FEHLERZEILE,
      z: zw ? Number(zw[1]) : von.z,
      r: x ? Number(x[1]) / 2 : von.r,
      eilgang: befehl[1] === '0',
    },
  ]
})()

/** Die Fahrt der falschen Zeile: zwei Punkte, oder leer, wenn sie nicht fährt. */
export const FEHLWEG: readonly Wegpunkt[] = fehlweg

const LAENGEN = SCHNITT.slice(1).map((p, i) =>
  Math.hypot(p.z - SCHNITT[i].z, p.r - SCHNITT[i].r),
)
const GESAMTLAENGE = LAENGEN.reduce((a, b) => a + b, 0)

/**
 * Wie viel des Schnittwegs bis einschließlich `zeile` gefahren ist, 0…1.
 *
 * **Anteil an der Strecke, nicht an den Zeilen.** Bei gleicher Vorschub-
 * geschwindigkeit dauert `G1 Z-35.` deutlich länger als die Fase davor, und
 * genau so soll es aussehen: der Weg zeichnet sich „in gleichmäßigen
 * Schritten“ (§7), nicht in gleich langen Zeilen.
 */
export function schnittAnteil(zeile: number): number {
  if (GESAMTLAENGE === 0) return 0
  let gefahren = 0
  SCHNITT.slice(1).forEach((p, i) => {
    if (p.zeile <= zeile) gefahren += LAENGEN[i]
  })
  return gefahren / GESAMTLAENGE
}

/**
 * Wie weit die Kontur gediehen ist, wenn die falsche Zeile an der Reihe ist —
 * der Stand, auf dem das Bild beim blinden Start stehen bleibt. Steht hier und
 * nicht oben bei `FEHLWEG`, weil `schnittAnteil` die Streckenlängen braucht.
 */
export const ANTEIL_VOR_FEHLER = schnittAnteil(FEHLERZEILE - 1)

/** Der Schnittweg bis zum Anteil `anteil` (0…1), letzter Punkt interpoliert. */
export function schnittBis(anteil: number): { z: number; r: number }[] {
  if (SCHNITT.length === 0) return []
  const ziel = Math.max(0, Math.min(1, anteil)) * GESAMTLAENGE
  const punkte = [{ z: SCHNITT[0].z, r: SCHNITT[0].r }]
  let rest = ziel

  for (let i = 0; i < LAENGEN.length; i++) {
    const von = SCHNITT[i]
    const nach = SCHNITT[i + 1]
    if (rest >= LAENGEN[i]) {
      punkte.push({ z: nach.z, r: nach.r })
      rest -= LAENGEN[i]
      continue
    }
    const t = LAENGEN[i] === 0 ? 0 : rest / LAENGEN[i]
    if (t > 0) {
      punkte.push({ z: von.z + (nach.z - von.z) * t, r: von.r + (nach.r - von.r) * t })
    }
    break
  }

  return punkte
}

/** Punktliste als SVG-Pfad in Bühnenkoordinaten: x ist `z`, y ist `-r`. */
export function alsPfad(punkte: readonly { z: number; r: number }[]): string {
  if (punkte.length === 0) return ''
  const [erst, ...rest] = punkte
  return `M ${erst.z} ${-erst.r}` + rest.map((p) => ` L ${p.z} ${-p.r}`).join('')
}

/**
 * Das Teil, das der Weg bis hierher freigelegt hat — als geschlossene Kontur
 * um die Achse.
 *
 * **Warum das so einfach ist.** Beim Längsdrehen ist alles über dem Schneid-
 * weg weg, alles darunter bleibt stehen. Die Mantellinie des Fertigteils
 * *ist* also der Schneidweg.
 *
 * Zwei Klammern braucht es trotzdem, und beide sind Zerspanung, nicht Grafik:
 *
 *  - **`z > 0` liegt vor der Stirnfläche.** `G0 X16. Z2.` fährt zwei
 *    Millimeter vor dem Teil an; dort ist kein Material, das abgetragen
 *    werden könnte.
 *  - **`r` über dem Rohling ist Luft.** `G1 X24.` fährt radial frei, also von
 *    Ø 20 auf Ø 24 — an einem Rohling mit Ø 22 schneidet der letzte
 *    Millimeter davon nichts mehr. Ohne die Klammer stünde am linken Ende ein
 *    Absatz, den es nie gab.
 *
 * Gespiegelt wird, weil Z1 den ganzen Schnitt zeigt und nicht das Halbprofil.
 */
export function koerperPfad(anteil: number): string {
  const punkte: { z: number; r: number }[] = []
  for (const p of schnittBis(anteil)) {
    const [z, r] = [Math.min(p.z, 0), Math.min(p.r, ROHLING_DURCHMESSER / 2)]
    const letzter = punkte[punkte.length - 1]
    if (letzter && letzter.z === z && letzter.r === r) continue
    punkte.push({ z, r })
  }
  if (punkte.length < 2) return ''

  const ende = punkte[punkte.length - 1]
  const oben = punkte.map((p) => ` L ${p.z} ${-p.r}`).join('')
  const unten = [...punkte]
    .reverse()
    .map((p) => ` L ${p.z} ${p.r}`)
    .join('')

  return `M ${punkte[0].z} 0${oben} L ${ende.z} 0${unten} Z`
}
