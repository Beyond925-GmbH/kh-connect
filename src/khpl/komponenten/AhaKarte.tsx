import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { HelpCircle, X } from 'lucide-react'

/**
 * Der gelegentliche Einwurf aus khpl-flow.md 6.4 — jetzt als **Banner, das
 * sich meldet**, nicht mehr als Karte, die dasteht.
 *
 * **Warum der zweite Umbau.** Die Einwürfe hingen zuletzt dauerhaft über dem
 * Panel: bei M2 zwei Stück übereinander, unter dem Titel, den ganzen Screen
 * lang. Damit waren sie kein Einwurf mehr, sondern Inhalt — und zwar Inhalt,
 * den niemand angefordert hat und der die Bühne zustellt. Etwas, das immer da
 * ist, liest sich wie Dekoration und wird genau so behandelt: übersehen.
 *
 * Jetzt ist der Normalzustand **weg**. In unregelmäßigen Abständen tippt der
 * Einwurf dem Besucher oben rechts auf die Schulter — eine Zeile, eine Frage,
 * sonst nichts. Wer antippt, bekommt die Antwort und schließt sie selbst. Wer
 * nicht antippt, wird nach ein paar Sekunden wieder in Ruhe gelassen; das
 * Banner verschwindet von allein und kommt später noch einmal, solange der
 * Besucher auf diesem Schritt steht.
 *
 * Zwei Bausteine:
 *
 *  - `AhaKarte` rendert selbst **nichts** mehr. Sie meldet ihre Frage nur bei
 *    der Bühne an, sobald ihr Moment da ist (`sichtbar`), und wieder ab, wenn
 *    er vorbei ist. Die Steps bleiben dadurch unverändert lesbar: dort steht
 *    weiter „hier gibt es diesen Einwurf“, nicht „hier läuft ein Timer“.
 *  - `EinwurfBuehne` hält den Takt und zeigt immer höchstens **einen**
 *    Einwurf. Bei zwei angemeldeten Fragen wechseln sie sich ab, statt sich
 *    zu stapeln.
 */

// ---------------------------------------------------------------------------
// Takt — gebündelt oben (flow 8.4).
// ---------------------------------------------------------------------------

/**
 * Erst einmal ankommen lassen. Der Einwurf meldet sich in dem Moment an, in
 * dem die Übung aufgeht — genau dann liest jemand die Auflösung und darf nicht
 * sofort angetippt werden.
 */
const ERSTE_PAUSE = 4

/**
 * Unregelmäßig, aber nicht zufällig: eine feste Folge, die sich wiederholt.
 * Ein exakter Metronomtakt wird nach dem zweiten Mal vorhersehbar und damit
 * ignorierbar; Zufall macht das Verhalten am Stand unerklärlich, wenn jemand
 * daneben steht und fragt, warum das Ding gerade blinkt.
 */
const PAUSEN = [15, 22, 15, 31]

/** So lange steht das Banner, wenn niemand es antippt. */
const ANZEIGE = 6

type Einwurf = { frage: string; inhalt: React.ReactNode }
type Eintrag = { id: string; daten: { current: Einwurf } }

const EinwurfKontext = createContext<{
  melde: (eintrag: Eintrag) => void
  nimmZurueck: (id: string) => void
} | null>(null)

/**
 * Der Einwurf eines Steps. Ohne eigene Darstellung — sie meldet sich bei der
 * `EinwurfBuehne` an, die entscheidet, wann (und ob) die Frage auftaucht.
 */
export function AhaKarte({
  sichtbar,
  eyebrow = 'Übrigens',
  children,
}: {
  sichtbar: boolean
  /**
   * Die eine Zeile, die im Banner steht. Sie muss neugierig machen, ohne die
   * Pointe zu verraten — sie ist der ganze Grund, warum jemand tippt.
   */
  eyebrow?: string | null
  children: React.ReactNode
}) {
  const id = useId()
  const buehne = useContext(EinwurfKontext)

  // Der Inhalt wandert über eine Ref zur Bühne statt über den State: er ist
  // bei jedem Render ein neues Element, und ein State-Update pro Render wäre
  // eine Schleife.
  const daten = useRef<Einwurf>({ frage: eyebrow ?? 'Übrigens', inhalt: children })
  daten.current = { frage: eyebrow ?? 'Übrigens', inhalt: children }

  useEffect(() => {
    if (!sichtbar || !buehne) return
    buehne.melde({ id, daten })
    return () => buehne.nimmZurueck(id)
  }, [sichtbar, buehne, id])

  return null
}

/**
 * Die Bühne für die Einwürfe — oben rechts, über allem, meistens leer.
 *
 * Sie bekommt die `AhaKarte`n eines Steps als Kinder (die rendern nichts und
 * melden sich nur an) und spielt daraus höchstens einen Einwurf zur Zeit.
 */
export function EinwurfBuehne({ children }: { children: React.ReactNode }) {
  const [eintraege, setEintraege] = useState<Eintrag[]>([])
  const [phase, setPhase] = useState<'pause' | 'banner' | 'offen'>('pause')
  // Zählt, wie oft sich schon jemand gemeldet hat: bestimmt sowohl die Länge
  // der nächsten Pause als auch, welcher Einwurf dran ist.
  const [runde, setRunde] = useState(0)

  const melde = useCallback((eintrag: Eintrag) => {
    setEintraege((liste) =>
      liste.some((e) => e.id === eintrag.id) ? liste : [...liste, eintrag],
    )
  }, [])
  const nimmZurueck = useCallback((id: string) => {
    setEintraege((liste) => liste.filter((e) => e.id !== id))
  }, [])
  const kontext = useMemo(() => ({ melde, nimmZurueck }), [melde, nimmZurueck])

  const anzahl = eintraege.length

  // Kein Einwurf angemeldet (Übung noch offen, oder gerade zurückgegangen):
  // zurück auf Anfang, damit der nächste wieder mit der ersten Pause startet.
  useEffect(() => {
    if (anzahl === 0) {
      setPhase('pause')
      setRunde(0)
    }
  }, [anzahl])

  // Pause → Banner.
  useEffect(() => {
    if (anzahl === 0 || phase !== 'pause') return
    const sekunden = runde === 0 ? ERSTE_PAUSE : PAUSEN[(runde - 1) % PAUSEN.length]
    const uhr = setTimeout(() => setPhase('banner'), sekunden * 1000)
    return () => clearTimeout(uhr)
  }, [anzahl, phase, runde])

  // Banner → Pause, wenn niemand antippt. Angetippt (`offen`) läuft keine Uhr:
  // wer liest, entscheidet selbst, wann Schluss ist.
  useEffect(() => {
    if (phase !== 'banner') return
    const uhr = setTimeout(() => {
      setPhase('pause')
      setRunde((r) => r + 1)
    }, ANZEIGE * 1000)
    return () => clearTimeout(uhr)
  }, [phase])

  const schliessen = useCallback(() => {
    setPhase('pause')
    setRunde((r) => r + 1)
  }, [])

  const dran = anzahl > 0 ? eintraege[runde % anzahl] : null
  const offen = phase === 'offen'

  return (
    <EinwurfKontext.Provider value={kontext}>
      {children}
      <AnimatePresence>
        {dran && phase !== 'pause' && (
          <motion.aside
            // Der Schlüssel enthält die Runde: kommt derselbe Einwurf später
            // noch einmal, ist das ein neuer Auftritt und keine Fortsetzung —
            // sonst fliegt beim zweiten Mal nichts mehr herein.
            key={`${dran.id}-${runde}`}
            layout
            initial={{ opacity: 0, x: 28, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 28, scale: 0.97 }}
            transition={{
              duration: 0.38,
              ease: [0.22, 1, 0.36, 1],
              layout: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
            }}
            data-testid="aha"
            data-offen={offen}
            className="pointer-events-auto w-fit max-w-full origin-top-right overflow-hidden rounded-kh-lg border-2 border-kh-orange/60 bg-[#1B1509]/92 shadow-[0_18px_50px_rgba(0,0,0,0.55)] backdrop-blur-md"
          >
            <motion.div layout="position" className="flex items-start">
              <button
                type="button"
                // Nur aus `banner` heraus: ein Tap, der die letzten Millisekunden
                // der Ausblende trifft, würde sonst die **nächste** Frage
                // aufklappen — angetippt hat jemand aber die, die er gerade
                // gelesen hat.
                onClick={() => setPhase((p) => (p === 'banner' ? 'offen' : p))}
                aria-expanded={offen}
                data-testid="aha-schalter"
                disabled={offen}
                className="flex min-h-[56px] flex-1 items-center gap-3 py-2.5 pr-4 pl-3 text-left transition-transform active:scale-[0.985] disabled:pointer-events-none"
              >
                <motion.span
                  aria-hidden
                  animate={offen ? {} : { scale: [1, 1.14, 1] }}
                  transition={{
                    duration: 1.6,
                    repeat: offen ? 0 : Infinity,
                    repeatDelay: 1.6,
                  }}
                  className="grid size-9 shrink-0 place-items-center rounded-full bg-kh-orange text-[#0E0D0B]"
                >
                  <HelpCircle className="size-5" strokeWidth={2.75} />
                </motion.span>
                <span className="min-w-0 text-[1.0625rem] leading-snug font-semibold text-balance text-kh-paper">
                  {dran.daten.current.frage}
                </span>
              </button>

              {/* Erst wenn sie offen ist, gibt es ein Schließen — vorher
                  räumt das Banner sich ohnehin selbst weg. */}
              {offen && (
                <button
                  type="button"
                  onClick={schliessen}
                  aria-label="Einwurf schließen"
                  data-testid="aha-schliessen"
                  className="grid size-[52px] shrink-0 place-items-center text-kh-paper/45 transition-transform active:scale-90"
                >
                  <X className="size-5" strokeWidth={2.5} />
                </button>
              )}
            </motion.div>

            <AnimatePresence initial={false}>
              {offen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <motion.div
                    layout="position"
                    data-auswaehlbar
                    className="max-w-[42ch] px-4 pt-0.5 pb-4 text-[1.0625rem] leading-[1.45] text-kh-paper/90 sm:text-[1.125rem]"
                  >
                    {dran.daten.current.inhalt}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.aside>
        )}
      </AnimatePresence>
    </EinwurfKontext.Provider>
  )
}
