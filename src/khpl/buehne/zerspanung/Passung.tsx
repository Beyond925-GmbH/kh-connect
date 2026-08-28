import { useId } from 'react'
import { useSichtfeld } from '@/khpl/shell/SichtfeldKontext'
import { motion } from 'motion/react'
import { RASTER_KURVE, WELLEN, type Sitz } from './kanon'
import { BAUTEIL, STRICH } from './stil'

/**
 * Die Bühne von Z1: drei Wellen, drei Lagersitze.
 *
 * **Wieder reine Zeichnung, ohne Foto darunter.** Eine Zwischenfassung legte
 * ein Motiv gefräster Lagerböcke unter die Zeichnung — bei 30 % Deckkraft
 * unter einem 55-%-Schleier war davon auf der Stele nichts zu sehen, es
 * dunkelte nur die Linien ab. Der Tag zeichnet ohnehin (khpl-tag-zerspanung.md
 * §7): die Werkzeuge dieses Berufs sind Zeichnung, Werkzeugweg und Zahl. Was
 * die Übung lesbar macht, sind Kanten, keine Motive.
 *
 * ---
 *
 * **Der Sitz ist ein Block mit einem echten Loch, keine zwei Balken.**
 *
 * Zwei Fassungen sind daran gescheitert, und beide auf dieselbe Weise: Sobald
 * Ober- und Unterteil getrennte Rechtecke waren, standen auf dem Screen sechs
 * helle Balken übereinander und die Zwischenräume lasen sich als Fugen einer
 * Treppe, nicht als Bohrungen. Der Block trägt deshalb jetzt eine **Maske**:
 * Die Bohrung ist ein Loch *im* Block, und die Welle liegt **darunter** und
 * scheint durch das Loch hindurch. Damit stimmt auch die Verdeckung — eine
 * Welle, die im Sitz steckt, verschwindet hinter dem Material, statt darüber
 * zu liegen.
 *
 * **Alle drei Wellen sind exakt gleich groß gezeichnet — Absicht, keine
 * Vereinfachung.** Der Unterschied zwischen ihnen beträgt vier
 * Hundertstelmillimeter; auf einem iPad wären das ein Zehntel Pixel. Zeichnete
 * man ihn sichtbar, würde der Screen behaupten, man könne so etwas sehen — und
 * dann wäre die ganze Pointe des Tages weg. **Der Unterschied zeigt sich
 * ausschließlich im Verhalten**, so wie in der Werkstatt auch.
 */

/** Die Bühne rechnet in diesem Koordinatensystem und skaliert mit. */
const B = 200
const H = 150

/** Die drei Zeilen, je eine Welle mit ihrem Sitz. */
const ZEILE = [28, 75, 122]

/** Der Lagerbock rechts, im Schnitt. */
const BOCK_X = 116
const BOCK_B = 38
/**
 * Halbe Höhe des Bocks. Deutlich kleiner als der halbe Zeilenabstand, sonst
 * stoßen die drei Böcke aneinander und lesen sich als **eine** Säule statt als
 * drei Bauteile — genau der Fehler der Vorfassung.
 */
const BOCK_H = 20
/**
 * Wie viel Material am Grund der Bohrung stehen bleibt.
 *
 * **Der Sitz ist eine Sacklochbohrung, kein Durchgangsloch — und das ist eine
 * Entscheidung für die Lesbarkeit.** Ein Längsschnitt durch ein durchgehendes
 * Loch zerfällt zwangsläufig in zwei getrennte Rechtecke; wer Zeichnungen
 * liest, sieht darin einen Block, alle anderen sehen zwei Balken. Genau das
 * ist in zwei Fassungen passiert. Bleibt am Grund ein Steg stehen, hängt der
 * Block sichtbar zusammen, und die Welle bekommt obendrein einen Anschlag, an
 * dem sie hörbar ankommt. Ein Lagersitz als Tasche ist in der Sache völlig
 * üblich.
 */
const GRUND = 9
/**
 * Halbe Höhe der Bohrung. Etwas mehr als die halbe Welle: Sonst gäbe es kein
 * Spiel zu zeigen, und die zu kleine Welle säße genauso stramm wie die
 * passende.
 */
const LOCH_H = 8

const WELLE_X = 40
const WELLE_L = 68
/** Halbe Wellenhöhe. */
const WELLE_H = 6

/**
 * Wie weit eine Welle nach rechts fährt, wenn sie probiert wird.
 *
 * `klemmt` bleibt am Mund der Bohrung stehen — die drei Einheiten Überstand
 * sind das ganze Ereignis, und sie müssen sichtbar sein, ohne dass jemand
 * danach suchen muss. Die anderen beiden fahren so weit, dass die Welle
 * bündig im Block steckt.
 */
function weg(sitz: Sitz): number {
  const bisMund = BOCK_X - (WELLE_X + WELLE_L)
  return sitz === 'klemmt' ? bisMund - 3 : bisMund + BOCK_B - GRUND
}

export function Passung({
  aktiv,
  probiert,
  onProbieren,
}: {
  /** Welche Welle gerade fährt. `null` = alle liegen. */
  aktiv: string | null
  /** Welche schon probiert wurden — die bleiben an ihrem Ergebnis stehen. */
  probiert: readonly string[]
  onProbieren?: (id: string) => void
}) {
  // Masken-Ids müssen im Dokument eindeutig sein — zwei Bühnen gleichzeitig
  // gibt es zwar nicht, aber `useId` kostet nichts und der Fehler wäre still.
  const maske = useId().replace(/:/g, '')

  /*
    **Die Zeichnung steht im freien Feld, gemessen — nicht in geschätzten
    Prozenten.**

    Die Vorfassung hielt mit `bottom-[30%] landscape:bottom-[6%]` Abstand zur
    Konsole. Hochkant ging das auf; **quer nicht**, denn dort liegt das Panel
    nicht unten, sondern **links** — und zwar über der halben Breite. Die
    Zeichnung lief unverändert über die volle Fläche, die Wellen B und C lagen
    hinter der Karte, und man konnte eine Übung nicht lösen, deren Hälfte man
    nicht sah.

    `useSichtfeld` misst, wo die Karte wirklich steht (dieselbe Quelle, aus
    der die 3D-Kamera ihr Fenster nimmt). Daraus wird ein Rahmen, und darin
    passt sich die Zeichnung ein — in jeder Lage und bei jeder Panelhöhe.
  */
  const frei = useSichtfeld('roh')
  const rahmen = {
    left: `${(frei?.links ?? 0) * 100}%`,
    right: `${(frei?.rechts ?? 0) * 100}%`,
    top: `${(frei?.oben ?? 0) * 100 + 3}%`,
    bottom: `${(frei?.unten ?? 0) * 100 + 3}%`,
  }

  return (
    <div className="relative size-full">
      {/*
        **Die Zeichnung hält Abstand zur Konsole** (R2 — Bühne und Konsole
        kollidieren nie). Hochkant deckt das Panel das untere Drittel; wäre die
        Zeichnung wie üblich über die ganze Fläche zentriert, läge die dritte
        Welle darunter und man könnte sie weder sehen noch antippen. Quer sitzt
        das Panel links, dort bleibt unten alles frei.
      */}
      {/*
        **Der Rahmen liegt auf einem `div`, nicht auf dem `svg`.** Ein
        SVG-Element ist ein *replaced element*: Sind `width`/`height` auto,
        leitet der Browser die Größe aus dem Seitenverhältnis der `viewBox` ab
        und **ignoriert `bottom`**. Genau so stand die Zeichnung quer trotz
        gesetztem `bottom: 38%` über die volle Höhe und unter dem Panel. Das
        `div` ist ein normaler Block, das `svg` füllt es.
      */}
      <div className="absolute" style={rahmen}>
        <svg
          viewBox={`0 0 ${B} ${H}`}
          preserveAspectRatio="xMidYMid meet"
          className="size-full"
          data-testid="z1-passung"
        >
          <defs>
            {WELLEN.map((w, i) => (
              <mask key={w.id} id={`${maske}-${w.id}`}>
                {/* Weiß = Material, Schwarz = Loch. */}
                <rect
                  x={BOCK_X}
                  y={ZEILE[i] - BOCK_H}
                  width={BOCK_B}
                  height={BOCK_H * 2}
                  fill="white"
                />
                {/* Links über die Kante hinaus (die Bohrung ist offen), rechts
                  `GRUND` vor der Kante zu Ende. */}
                <rect
                  x={BOCK_X - 1}
                  y={ZEILE[i] - LOCH_H}
                  width={BOCK_B + 1 - GRUND}
                  height={LOCH_H * 2}
                  fill="black"
                />
              </mask>
            ))}
          </defs>

          {WELLEN.map((w, i) => {
            const y = ZEILE[i]
            const faehrt = aktiv === w.id || probiert.includes(w.id)
            const drin = faehrt && w.sitz !== 'klemmt'
            /*
            **Das Spiel wird als Schräglage gezeigt, nicht als Absacken.**

            Ein Absacken um die zwei Einheiten Luft, die im Schlitz übrig sind,
            war auf dem Screen nicht von „sitzt" zu unterscheiden — beide
            Wellen standen waagerecht in einem waagerechten Schlitz, und zwei
            Einheiten sind auf der Stele ein Wimpernschlag. Wer irgendwann eine
            ausgeschlagene Bohrung in der Hand hatte, kennt aber genau das
            Bild: Das Teil steckt drin und **steht schief**. Die Kippung um den
            Bohrungsgrund zeigt dasselbe, ist aus zwei Metern zu sehen und
            behauptet nichts Falsches — die Luft, um die sie kippt, ist
            dieselbe.
          */
            const lose = faehrt && w.sitz === 'lose'

            return (
              <g key={w.id}>
                {/* Die Welle liegt **unter** dem Block und scheint durch dessen
                  Bohrung. Deshalb steht sie im DOM zuerst. */}
                <motion.g
                  initial={false}
                  animate={{
                    x: faehrt ? weg(w.sitz) : 0,
                    y: lose ? LOCH_H - WELLE_H : 0,
                    rotate: lose ? 2.6 : 0,
                  }}
                  /*
                  Gedreht wird um das **rechte Ende der Welle** — im
                  eingeschobenen Zustand ist das der Grund der Tasche, wo sie
                  anliegt und nicht ausweichen kann. Das freie Ende schwenkt.

                  `transformBox: 'fill-box'` ist dafür Pflicht: Ohne sie
                  rechnet der Browser den Ursprung gegen die **View-Box** der
                  ganzen Bühne, und die Welle rotiert dann um einen Punkt weit
                  außerhalb ihrer selbst — in der Vorfassung flog sie damit aus
                  dem Bild.
                */
                  style={{ transformBox: 'fill-box', transformOrigin: 'right center' }}
                  transition={
                    faehrt && w.sitz === 'klemmt'
                      ? // Sie stößt an und federt einen Hauch zurück. Ohne
                        // diesen Rest hielte man das Anhalten für ein Hakeln in
                        // der Animation statt für das Ergebnis.
                        { type: 'spring', stiffness: 260, damping: 11 }
                      : { duration: 0.55, ease: [...RASTER_KURVE] }
                  }
                >
                  <rect
                    x={WELLE_X}
                    y={y - WELLE_H}
                    width={WELLE_L}
                    height={WELLE_H * 2}
                    rx={WELLE_H}
                    className={
                      drin
                        ? 'fill-kh-raised stroke-kh-signal'
                        : `${BAUTEIL} cursor-pointer`
                    }
                    strokeWidth={STRICH.voll}
                    vectorEffect="non-scaling-stroke"
                    onClick={onProbieren && !faehrt ? () => onProbieren(w.id) : undefined}
                  />
                  {/* Das Maß steht auf **jeder** Welle, und es ist auf allen
                    dreien dasselbe. Genau darum geht es. */}
                  <text
                    x={WELLE_X + WELLE_L / 2}
                    y={y + 3}
                    textAnchor="middle"
                    pointerEvents="none"
                    className="fill-kh-paper text-[8px] font-semibold"
                  >
                    Ø 20
                  </text>
                </motion.g>

                {/* Der Block. Die Maske schneidet die Bohrung heraus; was
                  dahinter liegt — Foto oder Welle — steht dann darin. */}
                <g mask={`url(#${maske}-${w.id})`} pointerEvents="none">
                  <rect
                    x={BOCK_X}
                    y={y - BOCK_H}
                    width={BOCK_B}
                    height={BOCK_H * 2}
                    rx={2}
                    className={BAUTEIL}
                    strokeWidth={STRICH.voll}
                    vectorEffect="non-scaling-stroke"
                  />
                </g>
                {/* Die beiden Bohrungswände als eigene Striche: Die Maske
                  schneidet die Kontur mit weg, und ohne sie hätte das Loch
                  keinen Rand. */}
                <g
                  className="stroke-kh-paper/65"
                  strokeWidth={STRICH.fein}
                  vectorEffect="non-scaling-stroke"
                  pointerEvents="none"
                >
                  <line
                    x1={BOCK_X}
                    y1={y - LOCH_H}
                    x2={BOCK_X + BOCK_B - GRUND}
                    y2={y - LOCH_H}
                  />
                  <line
                    x1={BOCK_X}
                    y1={y + LOCH_H}
                    x2={BOCK_X + BOCK_B - GRUND}
                    y2={y + LOCH_H}
                  />
                  <line
                    x1={BOCK_X + BOCK_B - GRUND}
                    y1={y - LOCH_H}
                    x2={BOCK_X + BOCK_B - GRUND}
                    y2={y + LOCH_H}
                  />
                </g>

                {/* Solange nicht probiert wurde, trägt die Welle links ein
                  limettes Zeichen — R8, „hier geht's weiter" auf der Bühne. */}
                {!faehrt && onProbieren && (
                  <motion.circle
                    cx={WELLE_X - 8}
                    cy={y}
                    r={3}
                    className="fill-kh-signal"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.25 }}
                  />
                )}

                <text
                  x={WELLE_X - 15}
                  y={y + 3.5}
                  textAnchor="end"
                  className="fill-kh-mute text-[9px] font-semibold"
                >
                  {w.id}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}
