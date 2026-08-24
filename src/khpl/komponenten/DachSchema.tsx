import { PHASEN } from '@/dachstuhl/zeitachse'

/**
 * Der Dachstuhl als Querschnitt-Schema — die Vorschau zu einem Bauteil.
 *
 * **Wofür.** M5 und M7 verlangen vom Besucher eine Entscheidung über ein Wort:
 * „Stuhlschwelle“, „Kopfband“, „Windrispenband“. Für jemanden mit fünfzehn ist
 * das eine Vokabel ohne Bild — und eine Zieh-Karte, auf der nur das Wort steht,
 * fragt nach etwas, das er noch nie gesehen hat. Diese Zeichnung beantwortet
 * die einzige Frage, die dabei wirklich zählt: **wo sitzt das Ding?**
 *
 * Deshalb Querschnitt und nicht 3D-Miniatur: ein zweites WebGL-Bild neben der
 * Bühne kostet Rahmenzeit, lädt spät und zeigt in Daumennagelgröße weniger als
 * zwölf Striche. Die Zeichnung ist reines SVG, skaliert mit der Karte und
 * rendert in derselben Sekunde wie der Text daneben.
 *
 * **Drei Zustände statt zwei.** Was schon steht, ist blass da; das Bauteil, um
 * das es gerade geht, ist orange und dick; was noch kommt, fehlt ganz. So
 * erzählt schon die Vorschau die Reihenfolge — genau das, was M7 abfragt.
 *
 * Die Geometrie ist **schematisch, nicht maßstäblich**: 45 Grad, drei
 * Pfettenreihen auf Stuhlsäulen, Kehlbalken im oberen Drittel. Sie folgt dem
 * Modell in `dachstuhl/`, aber sie ist kein Riss davon — Windrispenbänder und
 * Kopfbänder laufen in Wirklichkeit längs zum Haus und wären in einem echten
 * Querschnitt unsichtbar. Hier stehen sie als Schräge im Bild, weil die
 * Zeichnung „wo sitzt es“ beantworten soll und nicht „wie wird es
 * gezeichnet“.
 */

/** Reihenfolge = Bauordnung. Die Labels sind die aus `zeitachse.ts`. */
const NR = new Map(PHASEN.map((p) => [p.label, p.nr]))

function nr(label: string): number {
  const n = NR.get(label)
  if (n === undefined) {
    throw new Error(`DachSchema kennt „${label}“ nicht — Label aus zeitachse.ts nehmen.`)
  }
  return n
}

/**
 * Ein Bauteil der Zeichnung. `d` ist Pfad-Geometrie im viewBox-Raum
 * `0 0 240 150`; `strich` heißt: als Linie zeichnen statt als Fläche.
 */
interface Teil {
  label: string
  d: string
  strich?: boolean
  /** Strichstärke im hervorgehobenen Zustand. */
  dick?: number
}

// Eckdaten des Schemas. Traufe links (20|112), First (120|16), 45 Grad.
// Alles Weitere ist daraus abgeleitet, damit die Striche aufeinander sitzen.
const TEILE: Teil[] = [
  {
    label: 'Fußpfetten',
    d: 'M12 104h18v12H12z M210 104h18v12h-18z',
  },
  {
    label: 'Bundbalken',
    d: 'M20 108h200v8H20z',
  },
  {
    label: 'Stuhlschwellen',
    d: 'M58 100h26v8H58z M107 100h26v8h-26z M156 100h26v8h-26z',
  },
  {
    label: 'Stuhlsäulen',
    d: 'M65 70h12v30H65z M114 24h12v76h-12z M163 70h12v30h-12z',
  },
  {
    label: 'Mittelpfetten',
    d: 'M62 60h18v12H62z M160 60h18v12h-18z',
  },
  {
    label: 'Firstpfette',
    d: 'M111 12h18v12h-18z',
  },
  {
    label: 'Kopfbänder',
    d: 'M67 88 84 71 M173 88 156 71 M116 42 99 25 M124 42 141 25',
    strich: true,
    dick: 5,
  },
  {
    label: 'Sparrenpaare',
    d: 'M16 116 120 12 M224 116 120 12',
    strich: true,
    dick: 7,
  },
  {
    label: 'Kehlbalken',
    d: 'M84 50h72v9H84z',
  },
  {
    // Läuft in Wirklichkeit längs unter den Sparren — hier als Schräge über
    // der Dachfläche, weil sonst nichts zu sehen wäre.
    label: 'Windrispenbänder',
    d: 'M36 100 104 34 M204 100 136 34',
    strich: true,
    dick: 3,
  },
  {
    label: 'Konterlattung',
    d: 'M10 110 114 6 M230 110 126 6',
    strich: true,
    dick: 3,
  },
  {
    label: 'Dachlattung',
    d: 'M20 96 34 110 M44 72 58 86 M68 48 82 62 M92 24 106 38 M220 96 206 110 M196 72 182 86 M172 48 158 62 M148 24 134 38',
    strich: true,
    dick: 3,
  },
]

export function DachSchema({
  /** Das Bauteil, um das es geht — orange und dick. */
  hervor,
  /**
   * Was schon steht. Ohne Angabe gilt alles vor `hervor` als gebaut: die
   * Vorschau zeigt dann den Stand, den es zum Zeitpunkt dieses Schritts gäbe.
   */
  gebaut,
  className,
}: {
  hervor: string
  gebaut?: readonly string[]
  className?: string
}) {
  const ziel = nr(hervor)
  const stehtSchon = (label: string) =>
    gebaut ? gebaut.includes(label) : nr(label) < ziel

  return (
    <svg
      viewBox="0 0 240 150"
      className={className}
      role="img"
      aria-label={`Wo im Dachstuhl: ${hervor}`}
    >
      {/* Der Umriss des fertigen Dachs steht immer da, ganz blass.

          Ohne ihn zeigt die Vorschau zum ersten Bauteil zwei Klötzchen auf
          einem Strich — richtig, aber ortlos. Der Umriss macht daraus „ganz
          unten, an den Ecken“: er ist der Rahmen, in dem alles andere eine
          Position hat. */}
      <path
        d="M8 116 120 8 232 116"
        fill="none"
        stroke="var(--color-kh-paper)"
        strokeWidth="2"
        strokeLinejoin="round"
        opacity="0.14"
      />

      {/* Die Rohdecke steht immer. Sie ist der Boden der Zeichnung und macht
          aus zwei losen Strichen einen Ort. */}
      <path
        d="M8 116h224v10H8z"
        fill="var(--color-kh-paper)"
        opacity="0.18"
        strokeLinecap="round"
      />

      {TEILE.map((t) => {
        const dran = t.label === hervor
        if (!dran && !stehtSchon(t.label)) return null
        const farbe = dran ? 'var(--color-kh-orange)' : 'var(--color-kh-paper)'
        return (
          <path
            key={t.label}
            d={t.d}
            fill={t.strich ? 'none' : farbe}
            stroke={t.strich ? farbe : 'none'}
            strokeWidth={t.strich ? (dran ? (t.dick ?? 5) : (t.dick ?? 5) - 1) : 0}
            strokeLinecap="round"
            opacity={dran ? 1 : 0.3}
          />
        )
      })}
    </svg>
  )
}
