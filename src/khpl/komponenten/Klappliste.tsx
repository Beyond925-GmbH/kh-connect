import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { motion } from 'motion/react'
import { useSchmal } from '@/khpl/shell/schmal'

export interface Abschnitt {
  frage: string
  antwort: string
}

/** Ausgeschrieben, weil Tailwind die Klassen sonst nicht findet. */
const SPALTEN: Record<number, string> = {
  2: 'landscape:columns-2',
  3: 'landscape:columns-3',
}

/**
 * Eine Reihe Felder aus Überschrift und Text — auf schmalen Screens klappbar.
 *
 * **Sie steht in `komponenten/`, weil zwei Tage dieselbe Liste tragen.**
 * Gebaut wurde sie für die Zimmerer-Karrierewege; `anlagenmechanik/A8Weg.tsx`
 * hat unabhängig davon dieselbe Antwort auf dieselbe Klemme gefunden. Zwei
 * Fassungen desselben Gedankens sind genau die Doppelung, aus der die
 * widersprüchlichen Bühnen-Messer entstanden sind — die andere gehört hierher
 * migriert, sobald jemand die Zeit hat, sie danach in allen drei Formaten
 * nachzumessen.
 *
 * **Warum es das gibt.** Zwei Screens des Zimmerer-Tages tragen eine Liste, die
 * ausgeschrieben höher ist als das Panel hochkant hergibt: die Karrierewege
 * C8.1–C8.3 (fünf Abschnitte, auf C8.1 lagen 377 px unter der Scrollkante —
 * „Was es kostet“ und „Was du verdienst“ kamen **überhaupt nicht** vor) und die
 * drei Maschinen auf C1.1 (267 px, das Schlusszitat fehlte ganz). Am Messestand
 * wird in einem Panel nicht gescrollt.
 *
 * Die Antwort: jede **Überschrift** bleibt sichtbar (das ist die
 * Verzeichnis-Funktion der Liste), der Text kommt auf Tipp; der erste Eintrag kommt offen an, damit der Screen nicht mit einer
 * Reihe zugeklappter Zeilen anfängt. Immer nur einer ist offen — zwei offene
 * Einträge holen die Scrollkante zurück. **Gekürzt wird nichts**: was in den
 * Feldern steht, ist recherchiert (`belege/`).
 *
 * `ersterOffen={false}` ist für Screens, die über der Liste schon einen Absatz
 * tragen: dort fängt nichts mit zugeklappten Zeilen an, und die Liste ist eher
 * ein Verzeichnis als der Text selbst. Steht die Liste dort unten im Panel,
 * kann der aufgeklappte Text über die Kante hinausragen — deshalb holt die
 * Liste das geöffnete Feld selbst heran. Das Scrollen macht dann die App und
 * nicht der Besucher, und das ist der ganze Unterschied.
 *
 * Das gilt auch quer auf der Kiosk-Stele. Die Vorfassung schrieb dort alle
 * Texte gleichzeitig aus — fünf volle Absätze auf einem Screen, und das
 * Wortbudget (R5, ~50 Wörter sichtbar) gilt im Querformat genauso wie
 * hochkant. `spaltenQuer` legt die Felder im breiten Panel (`karteBreit`) in
 * Spalten nebeneinander — dort ist Höhe knapp und Breite im Überfluss
 * vorhanden.
 */
export function Klappliste({
  abschnitte,
  kennung,
  spaltenQuer = 1,
  ersterOffen = true,
}: {
  abschnitte: readonly Abschnitt[]
  /** Präfix der `data-testid`s, z. B. `c8` → `c8-frage-0`. */
  kennung: string
  /** Wie viele Spalten die Liste quer bekommt. 1 lässt sie untereinander. */
  spaltenQuer?: 1 | 2 | 3
  ersterOffen?: boolean
}) {
  const schmal = useSchmal()
  const [offen, setOffen] = useState(ersterOffen ? 0 : -1)
  const felder = useRef<(HTMLDivElement | null)[]>([])
  // Beim ersten Lauf nicht: der Screen soll nicht schon beim Ankommen
  // gescrollt sein, sondern erst, wenn jemand etwas aufmacht.
  const angekommen = useRef(false)

  useEffect(() => {
    if (!angekommen.current) {
      angekommen.current = true
      return
    }
    if (offen < 0) return
    felder.current[offen]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [offen])

  return (
    // Quer **Spalten statt Raster**. Mit `grid-cols-2` bestimmt der längste
    // Abschnitt einer Zeile deren Höhe — auf C8.1 stand unter „Was ist das“
    // ein 170 px hohes Loch, weil daneben der lange Meister-Alltag liegt, und
    // „Was du verdienst“ fiel trotzdem unter die Kante. Der Spaltenumbruch
    // verteilt nach Höhe statt nach Reihenfolge und liest sich wie eine
    // Zeitungsseite: erst die linke Spalte hinunter, dann die rechte.
    <div
      className={`flex flex-col gap-2.5 ${
        !schmal && spaltenQuer > 1
          ? `landscape:block landscape:gap-2.5 ${SPALTEN[spaltenQuer]}`
          : ''
      }`}
      data-testid={`${kennung}-abschnitte`}
    >
      {abschnitte.map((a, i) => {
        const auf = offen === i
        return (
          <motion.div
            key={a.frage}
            initial={{ opacity: 0, transform: 'translateY(10px)' }}
            animate={{ opacity: 1, transform: 'translateY(0px)' }}
            transition={{ duration: 0.35, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            ref={(el) => {
              felder.current[i] = el
            }}
            // `scroll-mb-10`: der Auslauf-Verlauf der Hülle liegt über den
            // untersten Zeilen des Panels. Ohne den Rand endet das
            // herangeholte Feld genau darunter und seine letzte Zeile ist
            // ausgeblendet.
            //
            // `break-inside-avoid`: kein Feld darf über den Spaltenumbruch
            // reißen — ein Text, der in der einen Spalte anfängt und in der
            // anderen aufhört, ist schlechter als jede Scrollkante.
            className={`kh-feld scroll-mb-10 overflow-hidden break-inside-avoid ${
              !schmal && spaltenQuer > 1 ? 'landscape:mb-2.5' : ''
            }`}
          >
            <button
              type="button"
              onClick={() => setOffen(auf ? -1 : i)}
              aria-expanded={auf}
              data-testid={`${kennung}-frage-${i}`}
              // 48 px: die Zeile ist hier ein Bedienelement, kein Etikett, und
              // wird am Stand mit dem Daumen getroffen.
              className="flex min-h-[48px] w-full items-center justify-between gap-3 px-4 py-2.5 text-left"
            >
              <span className="kh-etikett">{a.frage}</span>
              <ChevronDown
                aria-hidden
                className={`size-5 shrink-0 text-kh-paper/50 transition-transform ${
                  auf ? 'rotate-180' : ''
                }`}
                strokeWidth={2.25}
              />
            </button>
            {auf && (
              <p className="px-4 pb-3 text-[1.0625rem] leading-[1.45] text-kh-paper/90 sm:text-[1.1875rem]">
                {a.antwort}
              </p>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}
