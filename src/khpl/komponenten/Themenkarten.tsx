import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { useSchmal } from '@/khpl/shell/schmal'

/** Ausgeschrieben, weil Tailwind die Klassen sonst nicht findet. */
const SPALTEN: Record<number, string> = {
  2: 'landscape:columns-2',
  3: 'landscape:columns-3',
}

export interface Thema {
  id: string
  /** Das eine Wort auf der Karte — „Mit Luft“, „Simulieren“, „Die Späne“. */
  wort: string
  /**
   * Der Satz darunter, der das Antippen lohnend macht. Alltagssprache, eine
   * Zeile Idee: „das Teil kann sich drehen, wie ein Rad auf der Achse“.
   */
  teaser: string
  /** Der volle Text, der auf Tipp aufgeht. */
  text: string
}

/**
 * **Die Themen-Abstecher in einer Form: Frage → Antwort → Wahl.**
 *
 * **Warum es das gibt.** Die Info-Abstecher („Warum so genau?“, „Ein
 * Tippfehler in Stahl“, …) zeigten drei nackte Wörter und die Zeile „Tipp an,
 * was dich interessiert“ — und weil sie als Übungs-Steps galten, blendete die
 * Shell ausgerechnet den Kontext-Absatz (`warum`) aus. Wer davor stand, hatte
 * keinen Grund, irgendeines der Wörter anzutippen. Am Stand hieß das:
 * weitergewischt.
 *
 * **Die abgestimmte Lesefolge, ein Screen, keine Zwischenstufe:**
 *
 *  1. Die Leitfrage ist der Titel auf der Bühne — deswegen ist man hier.
 *  2. Zwei, drei Sätze Antwort mit Alltagsanker stehen offen da (`warum` des
 *     Steps; der Step meldet sich dafür mit `auftrag={null}` als Lese-Step).
 *  3. Eine Brückenzeile führt zur Wahl hin („Dafür gibt es drei Arten:“).
 *  4. Die Karten: je ein Wort **plus** ein Alltags-Teaser, damit die Wahl
 *     einladend ist statt rätselhaft. Der Text kommt auf Tipp direkt unter
 *     der Karte; alle bleiben erkundbar, Gelesenes trägt seinen Haken.
 *
 * **Mechanik wie `Klappliste`** (ein offenes Feld, `scrollIntoView` fürs
 * geöffnete, quer optional Spalten) — aber eine eigene Komponente: dort ist
 * die Zeile ein Etikett im Verzeichnis, hier ist die Karte selbst die
 * Einladung und führt Wort, Teaser und Lese-Haken. Das in `Klappliste`
 * hineinzuschaltern hätte aus zwei klaren Formen eine mit vier Modi gemacht.
 */
export function Themenkarten({
  kennung,
  bruecke,
  themen,
  spaltenQuer = 1,
}: {
  /** Präfix der `data-testid`s, z. B. `z11` → `z11-spiel`, `z11-text`. */
  kennung: string
  /** Die Brückenzeile über den Karten — „Dafür gibt es drei Arten:“. */
  bruecke?: string
  themen: readonly Thema[]
  /** Wie viele Spalten die Karten quer bekommen. 1 lässt sie untereinander. */
  spaltenQuer?: 1 | 2 | 3
}) {
  const schmal = useSchmal()
  const ruhig = useReducedMotion()
  const [offen, setOffen] = useState<string | null>(null)
  const [gelesen, setGelesen] = useState<string[]>([])
  const karten = useRef<Record<string, HTMLDivElement | null>>({})
  // Beim ersten Lauf nicht: der Screen soll nicht schon beim Ankommen
  // gescrollt sein, sondern erst, wenn jemand etwas aufmacht.
  const angekommen = useRef(false)

  useEffect(() => {
    if (!angekommen.current) {
      angekommen.current = true
      return
    }
    if (offen === null) return
    karten.current[offen]?.scrollIntoView({
      block: 'nearest',
      // Das Heranholen ist Bewegung wie jede andere: wer sie abbestellt hat,
      // bekommt den Sprung statt der Fahrt.
      behavior: ruhig ? 'auto' : 'smooth',
    })
  }, [offen, ruhig])

  const waehle = (id: string) => {
    setOffen((alt) => (alt === id ? null : id))
    setGelesen((g) => (g.includes(id) ? g : [...g, id]))
  }

  return (
    <div className="flex flex-col gap-2.5">
      {bruecke && (
        // Dieselbe leise Stimme wie `Lage`: die Zeile rahmt die Wahl, sie ist
        // weder Auftrag noch Pointe.
        <p className="text-[1rem] leading-[1.45] text-kh-paper/70 sm:text-[1.0625rem]">
          {bruecke}
        </p>
      )}

      <div
        className={`flex flex-col gap-2.5 ${
          !schmal && spaltenQuer > 1
            ? `landscape:block landscape:gap-2.5 ${SPALTEN[spaltenQuer]}`
            : ''
        }`}
        data-testid={`${kennung}-themen`}
      >
        {themen.map((t, i) => {
          const auf = offen === t.id
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, transform: 'translateY(10px)' }}
              animate={{ opacity: 1, transform: 'translateY(0px)' }}
              transition={{ duration: 0.35, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              ref={(el) => {
                karten.current[t.id] = el
              }}
              // `scroll-mb-10` und `break-inside-avoid`: dieselben Gründe wie
              // in der `Klappliste` — der Auslauf-Verlauf der Hülle liegt über
              // den untersten Zeilen, und keine Karte darf über den
              // Spaltenumbruch reißen.
              className={`kh-feld scroll-mb-10 overflow-hidden break-inside-avoid ${
                !schmal && spaltenQuer > 1 ? 'landscape:mb-2.5' : ''
              }`}
            >
              <button
                type="button"
                onClick={() => waehle(t.id)}
                aria-expanded={auf}
                aria-controls={`${kennung}-${t.id}-text`}
                data-testid={`${kennung}-${t.id}`}
                // 56 px: zwei Textzeilen plus Daumen-Ziel am Stand.
                className="flex min-h-[56px] w-full items-center justify-between gap-3 px-4 py-2.5 text-left transition-transform active:scale-[0.99]"
              >
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="flex items-center gap-1.5 text-[1.0625rem] font-semibold text-kh-paper">
                    {/* Auch am offenen Feld: verschwände der Haken beim Öffnen,
                        rückte das Wort bei jedem Auf und Zu zur Seite. */}
                    {gelesen.includes(t.id) && (
                      <Check
                        className="size-4 shrink-0 text-kh-signal"
                        strokeWidth={3}
                        aria-hidden
                      />
                    )}
                    {t.wort}
                  </span>
                  <span className="text-[0.9375rem] leading-snug text-kh-mute">
                    {t.teaser}
                  </span>
                </span>
                <ChevronDown
                  aria-hidden
                  className={`size-5 shrink-0 text-kh-paper/50 transition-transform ${
                    auf ? 'rotate-180' : ''
                  }`}
                  strokeWidth={2.25}
                />
              </button>
              {auf && (
                <p
                  id={`${kennung}-${t.id}-text`}
                  data-auswaehlbar
                  data-testid={`${kennung}-text`}
                  className="px-4 pb-3 text-[1.0625rem] leading-[1.45] text-kh-paper/90"
                >
                  {t.text}
                </p>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
