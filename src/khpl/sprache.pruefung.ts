import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

/**
 * `pnpm pruefe:sprache` — die Abnahme für die Vereinfachung
 * (`khpl-vereinfachung.md` §7).
 *
 * **Wozu ein Skript und nicht eine Regel im Kopf.** Die vier Tage entstehen
 * gleichzeitig und von verschiedenen Händen. Eine Sprachregel, die nur in
 * einem Dokument steht, wird an vier Stellen verschieden ausgelegt — und das
 * Ergebnis liest sich wie vier Produkte. Dieses Skript ist die einzige
 * Durchsetzung, die das aushält.
 *
 * Gebaut nach dem Vorbild von `src/drei/kamera.pruefung.ts`: über `jiti`
 * gestartet, ohne Testrahmen, ohne App-Importe — es liest nur Quelltext.
 * Deshalb auch keine `@/`-Pfade, die `jiti` nicht auflöst.
 *
 * **Zwei Gänge.**
 *
 *  - *Standard*: bricht bei allem ab, was **heute schon** einzuhalten ist —
 *    die Form der Auftragszeile und die Länge der Ansage. Alles andere wird
 *    berichtet, nach Dringlichkeit sortiert. Das ist die Arbeitsliste für den
 *    Umbau der vier Tage.
 *  - `--streng`: bricht zusätzlich bei Wortbudget und Fachwortdichte ab. Ist
 *    Phase 2 durch, wandert das in `pnpm check`.
 */

// ---------------------------------------------------------------------------
// Budgets — khpl-vereinfachung.md §7.1
// ---------------------------------------------------------------------------

const BUDGET = {
  /** Ein Satz, Imperativ, ein Verb. */
  auftrag: 12,
  /** Was gleich passiert. */
  ansageText: 20,
  /** Der Haken daran. */
  ansageHaken: 15,
  /**
   * Alle Ebenen eines Steps zusammen — für einen **linearen** Screen, den
   * jeder Besucher gleich durchläuft.
   */
  step: 90,
  /**
   * Ein einzelnes Stück Text am Stück: ein Absatz, eine Rückmeldung, die
   * Erklärung zu einer Option.
   *
   * **Das ist die Zahl, die am Stand wirklich weh tut.** Bei einem
   * verzweigten Screen zählt die Dateisumme jede Alternative mit, obwohl ein
   * Besucher nur einen Weg davon liest: A1 hat sechs Prüfungen mit je einem
   * Befund, gesehen werden drei. 416 Wörter in der Datei sind dort keine 416
   * Wörter auf dem Screen — 90 zu erzwingen hieße, funktionierende
   * Verzweigung zu zerstören, um eine Zahl zu treffen. Was dagegen immer
   * gilt: **kein einzelner Absatz über 30 Wörter.**
   */
  stueck: 30,
  /** Höchstens ein Fachwort-Chip je Screen (Regel R2). */
  chips: 1,
} as const

/**
 * Wörter, mit denen eine Auftragszeile **nicht** anfangen darf.
 *
 * Kein Versuch, deutsche Imperative zu erkennen — das ginge ohne Wörterbuch
 * schief. Umgekehrt ist es einfach und trifft genau den Fehler, um den es
 * geht: „Der Ausschnitt ist geschnitten“ ist eine Beschreibung, die sich als
 * Aufgabe ausgibt. Wer mit einem Artikel oder Pronomen anfängt, erzählt.
 */
const KEIN_ANFANG = new Set([
  'der',
  'die',
  'das',
  'ein',
  'eine',
  'einen',
  'einem',
  'eines',
  'du',
  'dein',
  'deine',
  'es',
  'hier',
  'jetzt',
  'dann',
  'so',
  'und',
  'aber',
  'weil',
  'dieser',
  'diese',
  'dieses',
])

const STEPS = 'src/khpl/steps'
const BERUFE = ['dachdecker', 'zimmerer', 'anlagenmechanik'] as const

interface Befund {
  datei: string
  regel: string
  text: string
  hart: boolean
}

const befunde: Befund[] = []
function melde(datei: string, regel: string, text: string, hart: boolean) {
  befunde.push({ datei, regel, text, hart })
}

// ---------------------------------------------------------------------------
// Textgewinnung
// ---------------------------------------------------------------------------

/** Kommentare raus. Sie sind in diesem Repo länger als der Inhalt. */
function ohneKommentare(quelle: string): string {
  return quelle.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '')
}

function woerter(text: string): number {
  return text
    .replace(/\s+/g, ' ')
    .split(' ')
    .filter((w) => /[a-zäöüßA-ZÄÖÜ]{2,}/.test(w)).length
}

/**
 * Ist dieses Stück Text deutsche Prosa — oder Quelltext, der zufällig zwischen
 * zwei spitzen Klammern stand?
 *
 * **Diese Funktion ist beim Bauen nachgereicht worden, und der Grund ist
 * lehrreich.** Die erste Fassung nahm alles zwischen `>` und `<` plus jedes
 * längere String-Literal. In einer TSX-Datei heißt das: `for (let i =
 * a.length - 1; i > 0; i--)` liefert „0; i-" als „Text", `() => (zieht ?`
 * ebenso, und `import { DndContext, DragOverlay, … }` zählte als vierzehn
 * Wörter. Auf M7 waren **45 der angeblich 332 Wörter** eine einzige
 * `useSensors`-Zeile.
 *
 * Damit maß das Skript nicht Textmenge, sondern Codemenge — und hätte die
 * Kürzungsarbeit an den falschen Screens angesetzt. Ein Messwerkzeug, das in
 * die falsche Richtung zeigt, ist schlimmer als keines.
 *
 * Die Regeln unten sind bewusst grob und schließen im Zweifel **aus**: ein zu
 * niedriger Wert kostet eine Prüfung von Hand, ein zu hoher schickt jemanden
 * los, Code zu kürzen.
 */
function istProsa(roh: string): boolean {
  const t = roh.trim()
  if (t.length < 8) return false
  // Mindestens zwei Wörter, und Buchstaben darin.
  if (!/[a-zäöüß]{3}/.test(t) || !/\s/.test(t)) return false
  // Syntax, die in einem deutschen Satz nicht vorkommt.
  if (/[{}()[\];=|&`$]|=>|\/\/|\.\.\./.test(t)) return false
  // Importpfade, Dateinamen, Testids.
  if (/^[@./]|\.(tsx?|webp|mp4|json)\b/.test(t)) return false
  // Bezeichner aus dem Quelltext.
  if (
    /\b(const|let|import|export|from|function|return|type|interface|useState|useRef|useMemo|useEffect|className|data-testid)\b/.test(
      t,
    )
  )
    return false
  // Tailwind-Ketten: Bindestriche und Doppelpunkte, aber keine Satzzeichen und
  // keine Großbuchstaben — „flex flex-col gap-3 max-sm:px-2".
  if (/[:-]/.test(t) && !/[.,!?—„“"]/.test(t) && !/[A-ZÄÖÜ]/.test(t)) return false
  return true
}

/**
 * Der sichtbare Text eines Steps, so gut es ohne echten Parser geht:
 * JSX-Textknoten plus deutschsprachige String-Literale, gefiltert durch
 * `istProsa`.
 */
function sichtbarerText(quelle: string): string {
  /*
    Erst einsammeln, dann an den Ausdrücken **zerteilen** — nicht die Ausdrücke
    löschen.

    Der Unterschied ist in diesem Repo alles. Die Prosa steht hier fast
    vollständig *innerhalb* geschweifter Klammern: `warum={<p>…</p>}`,
    `interaktion={…}`, `aha={…}`. Ein Durchgang, der `{…}` wegräumt, räumt
    damit den ganzen Screen weg — gemessen wurden dann 6 statt 115 Wörter je
    Step.

    Umgekehrt darf ein Textknoten mit eingebettetem Ausdruck auch nicht ganz
    verworfen werden: „Der Rahmen ist {m(breite)} breit" ist Prosa mit einer
    Zahl darin. Zerteilt man ihn am Ausdruck, bleiben zwei Bruchstücke, die
    beide für sich Prosa sind — und `{' '}`, der übliche Worttrenner vor einem
    Chip, ist damit von selbst erledigt.
  */
  const roh = [
    ...[...quelle.matchAll(/>([^<>]{4,})</g)].map((m) => m[1]),
    ...[...quelle.matchAll(/'([^'\\\n]{12,})'/g)].map((m) => m[1]),
  ]
  return (
    roh
      .flatMap((t) => t.split(/\{[^{}]*\}/))
      .filter(istProsa)
      // `¶` als Fuge: oben werden die Stücke wieder zerlegt, um den längsten
      // Absatz zu finden. Ein Zeichen, das in keinem deutschen Satz vorkommt.
      .join(' ¶ ')
  )
}

/**
 * Den Wert einer Prop aus einem `<StepShell …>`-Aufruf holen.
 *
 * Klammerzählung statt eines Ausdrucks mit `[^}]*`: `auftrag={geloest ? null :
 * 'Tipp …'}` trägt selbst geschweifte Klammern, sobald eine Vorlage darin
 * steht, und ein gieriges Muster verschluckt den halben Screen.
 */
function propWert(quelle: string, prop: string): string | null {
  const start = quelle.search(new RegExp(`\\n\\s*${prop}=\\{`))
  if (start === -1) return null
  let i = quelle.indexOf('{', start)
  let tiefe = 0
  for (let j = i; j < quelle.length; j++) {
    if (quelle[j] === '{') tiefe++
    else if (quelle[j] === '}') {
      tiefe--
      if (tiefe === 0) return quelle.slice(i + 1, j).trim()
    }
  }
  return null
}

/** Alle String-Literale eines Ausdrucks — die Fassungen einer Auftragszeile. */
function literale(ausdruck: string): string[] {
  return [
    ...[...ausdruck.matchAll(/'((?:[^'\\]|\\.)*)'/g)].map((m) => m[1]),
    ...[...ausdruck.matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((m) => m[1]),
  ].filter((s) => /[a-zäöüß]/.test(s))
}

// ---------------------------------------------------------------------------
// Die Prüfungen
// ---------------------------------------------------------------------------

interface Bericht {
  datei: string
  beruf: string
  step: string
  woerter: number
  /** Wie viele Textblöcke — viele heißt verzweigt, nicht zwangsläufig lang. */
  stuecke: number
  /** Der längste Absatz. Die Zahl, die am Stand wirklich weh tut. */
  laengstes: number
  chips: number
  hatAuftrag: boolean
  hatAnsage: boolean
}

function pruefeDatei(beruf: string, dateiname: string): Bericht | null {
  const pfad = join(STEPS, beruf, dateiname)
  const roh = readFileSync(pfad, 'utf8')
  if (!roh.includes('<StepShell')) return null
  const quelle = ohneKommentare(roh)
  const kurz = `${beruf}/${dateiname.replace('.tsx', '')}`

  // --- Auftrag -------------------------------------------------------------
  const auftrag = propWert(quelle, 'auftrag')
  const hatAuftrag = auftrag !== null && auftrag !== 'null'
  if (hatAuftrag) {
    for (const satz of literale(auftrag)) {
      const n = woerter(satz)
      if (n > BUDGET.auftrag) {
        melde(
          kurz,
          'auftrag zu lang',
          `${n} statt ≤ ${BUDGET.auftrag} Wörter: „${satz}"`,
          true,
        )
      }
      const erstes = satz
        .split(/\s+/)[0]
        ?.toLowerCase()
        .replace(/[^a-zäöüß]/g, '')
      if (erstes && KEIN_ANFANG.has(erstes)) {
        melde(
          kurz,
          'auftrag ist keine Aufgabe',
          `beginnt mit „${erstes}": „${satz}"`,
          true,
        )
      }
      // Zwei Sätze sind zwei Handlungen. Der Screen hat eine.
      const saetze = satz.split(/[.!?]+\s+/).filter(Boolean).length
      if (saetze > 1) {
        melde(kurz, 'auftrag hat zwei Sätze', `„${satz}"`, true)
      }
    }
  }

  // --- Ansage --------------------------------------------------------------
  const ansage = propWert(quelle, 'ansage')
  const hatAnsage = ansage !== null && ansage !== 'null'
  if (hatAnsage) {
    const text = /text:\s*(['"])((?:[^\\]|\\.)*?)\1/.exec(ansage)?.[2]
    const haken = /haken:\s*(['"])((?:[^\\]|\\.)*?)\1/.exec(ansage)?.[2]
    if (text && woerter(text) > BUDGET.ansageText) {
      melde(
        kurz,
        'ansage.text zu lang',
        `${woerter(text)} statt ≤ ${BUDGET.ansageText}`,
        true,
      )
    }
    if (haken && woerter(haken) > BUDGET.ansageHaken) {
      melde(
        kurz,
        'ansage.haken zu lang',
        `${woerter(haken)} statt ≤ ${BUDGET.ansageHaken}`,
        true,
      )
    }
  }

  // --- Dichte (weich, bis Phase 2 durch ist) -------------------------------
  /*
    Fachwörter **je Block**, nicht je Datei.

    Regel R2 sagt „höchstens ein Fachwort je Screen". Gezählt wurde zuerst
    über die ganze Datei — und damit fielen genau die Screens durch, bei denen
    die Chips in verschiedenen Zweigen sitzen: A2 erklärt sechs Bauteile,
    eines je Tap, und sieht drei Chips lang aus, obwohl nie zwei gleichzeitig
    dastehen. Dieselbe Verwechslung wie beim Wortbudget (siehe `BUDGET.stueck`).

    Gezählt wird deshalb je Absatz: an `<p`, `<AhaKarte` und `<>` geteilt, in
    jedem Stück die Chips. Was ein Besucher in einem Atemzug liest, ist der
    Maßstab.
  */
  const bloecke = quelle.split(/<(?=p[\s>]|AhaKarte[\s>]|>)/)
  const chips = bloecke.reduce(
    (hoechste, block) =>
      Math.max(
        hoechste,
        new Set(
          [...block.matchAll(/<(?:Begriff|Fachwort)\s+id="([a-zA-Z]+)"/g)].map(
            (m) => m[1],
          ),
        ).size,
      ),
    0,
  )
  /*
    Auftrag und Ansage kommen **dazugezählt**, nicht mitgelesen: ihre Texte
    stehen in `{…}` und werden von `sichtbarerText` mit dem übrigen Quelltext
    weggeräumt. Sie sind aber das Erste, was jemand sieht — sie draußen zu
    lassen hieße, den Screen an seinem sichtbarsten Satz vorbeizumessen.
  */
  const zusatz = [
    ...(hatAuftrag && auftrag ? literale(auftrag) : []),
    ...(hatAnsage && ansage ? literale(ansage) : []),
  ].join(' ')
  const stuecke = sichtbarerText(quelle).split(' ¶ ').filter(Boolean)
  const n = woerter(stuecke.join(' ')) + woerter(zusatz)
  const zuLang = stuecke.filter((t) => woerter(t) > BUDGET.stueck)
  for (const t of zuLang) {
    melde(
      kurz,
      'Absatz zu lang',
      `${woerter(t)} statt ≤ ${BUDGET.stueck} Wörter: „${t.trim().replace(/\s+/g, ' ').slice(0, 70)}…"`,
      false,
    )
  }
  if (chips > BUDGET.chips) {
    melde(
      kurz,
      'zu viele Fachwörter in einem Block',
      `${chips} statt ≤ ${BUDGET.chips}`,
      false,
    )
  }
  if (n > BUDGET.step) {
    melde(kurz, 'Wortbudget überschritten', `${n} statt ≤ ${BUDGET.step}`, false)
  }

  return {
    datei: kurz,
    beruf,
    step: dateiname.replace('.tsx', ''),
    woerter: n,
    stuecke: stuecke.length,
    laengstes: stuecke.reduce((a, t) => Math.max(a, woerter(t)), 0),
    chips,
    hatAuftrag,
    hatAnsage,
  }
}

// ---------------------------------------------------------------------------
// Lauf
// ---------------------------------------------------------------------------

const streng = process.argv.includes('--streng')
const berichte: Bericht[] = []

for (const beruf of BERUFE) {
  for (const datei of readdirSync(join(STEPS, beruf)).sort()) {
    if (!datei.endsWith('.tsx')) continue
    const b = pruefeDatei(beruf, datei)
    if (b) berichte.push(b)
  }
}

const offenAuftrag = berichte.filter((b) => !b.hatAuftrag)
const gesamtWoerter = berichte.reduce((a, b) => a + b.woerter, 0)

console.log('')
console.log('KHPL — Sprachprüfung (khpl-vereinfachung.md §7)')
console.log('='.repeat(72))
console.log(`Steps mit StepShell:      ${berichte.length}`)
console.log(`… davon mit Auftragszeile: ${berichte.length - offenAuftrag.length}`)
console.log(`… davon mit Ansage:        ${berichte.filter((b) => b.hatAnsage).length}`)
console.log(
  `Sichtbare Wörter gesamt:  ${gesamtWoerter} (Mittel ${Math.round(gesamtWoerter / berichte.length)} je Step, Budget ${BUDGET.step})`,
)

console.log('')
console.log('Die zehn dichtesten Screens — hier zuerst kürzen:')
console.log(
  '  (Wörter = ganze Datei, also bei verzweigten Screens alle Alternativen;' +
    ' „längster" = ein Absatz am Stück)',
)
for (const b of [...berichte].sort((a, c) => c.woerter - a.woerter).slice(0, 10)) {
  const marke = b.woerter > BUDGET.step ? '✗' : '✓'
  console.log(
    `  ${marke} ${b.datei.padEnd(24)} ${String(b.woerter).padStart(4)} W` +
      ` · ${String(b.stuecke).padStart(2)} Absätze` +
      ` · längster ${String(b.laengstes).padStart(3)}` +
      (b.laengstes > BUDGET.stueck ? ' ✗' : ' ✓') +
      (b.chips > BUDGET.chips ? `  · ${b.chips} Fachwörter` : ''),
  )
}

const hart = befunde.filter((b) => b.hart)
const weich = befunde.filter((b) => !b.hart)

if (hart.length > 0) {
  console.log('')
  console.log('FEHLER — Form der Auftragszeile / Länge der Ansage:')
  for (const b of hart) console.log(`  ✗ ${b.datei}: ${b.regel} — ${b.text}`)
}

if (weich.length > 0) {
  console.log('')
  console.log(
    `Offen (${weich.length}) — Wortbudget und Fachwortdichte. ` +
      'Arbeitsliste für Phase 2, noch kein Abbruch.',
  )
}

if (offenAuftrag.length > 0) {
  console.log('')
  console.log(`Ohne Auftragszeile (${offenAuftrag.length}):`)
  console.log('  ' + offenAuftrag.map((b) => b.datei).join(', '))
  console.log(
    '  Reine Lese-Steps setzen `auftrag={null}` bewusst — die stehen hier zu Recht.',
  )
}

console.log('')

if (hart.length > 0 || (streng && weich.length > 0)) {
  console.error(
    `Abbruch: ${hart.length} harte${streng ? ` und ${weich.length} weiche` : ''} Befunde.`,
  )
  process.exit(1)
}
