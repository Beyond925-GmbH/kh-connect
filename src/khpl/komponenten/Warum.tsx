import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronDown, HelpCircle } from 'lucide-react'
import { AhaKontext, type AhaEintrag } from './AhaKarte'

/**
 * Die Klappzeile über dem Auftrag — **Vertiefung, nicht Aufgabe.**
 *
 * **Die eine Änderung, an der der ganze Umbau hängt: der Fachtext ist nicht
 * mehr der Standardinhalt des Panels. Der Auftrag ist es.**
 *
 * Gemessen trug ein Step im Mittel 130 sichtbare Wörter, in der Spitze 333
 * (Z3), 308 (A2), 303 (M7). Ein ganzer Tag kam auf 1.500–2.000 Wörter — gegen
 * ein Zeitbudget von drei bis fünf Minuten, im Stehen, an einem Messestand.
 * Selbst ohne eine einzige Interaktion ginge das nicht auf. Also wurde nicht
 * gelesen, und was nicht gelesen wurde, enthielt ausgerechnet auch die
 * Anweisung.
 *
 * Der Fachtext ist gut. Er ist nur nicht das, was auf einem Screen zuerst
 * dastehen muss. Wer wissen will, warum, tippt — und bekommt ihn.
 *
 * **Und der Einwurf wohnt jetzt hier.** Sobald eine Übung gelöst ist, geht
 * die Zeile **einmal von selbst auf** und zeigt ihn (siehe `AhaKarte.tsx`).
 * Kein zweiter Bildschirmbereich, keine Uhr, kein Wettbewerb mit der Arbeit,
 * die gerade läuft.
 *
 * **Was daraus folgt.** Das Panel ist im Ruhezustand rund drei Zeilen hoch
 * statt 62–84 % des Screens. Damit entfällt der Klappgriff („Mehr Platz zum
 * Arbeiten“) — ein Bedienelement, das erst Sinn ergab, wenn man schon gemerkt
 * hatte, dass das Panel im Weg ist. Es behandelte das Symptom.
 */
export function WarumBereich({
  warum,
  offenAnfangs = false,
  children,
}: {
  /** Der frühere `fachtext`. */
  warum?: React.ReactNode
  /**
   * Aufgeklappt ankommen.
   *
   * Gesetzt, solange ein Step noch keinen eigenen `auftrag` hat: dort steht
   * die Anweisung weiterhin im Fachtext, und die zuzuklappen hieße, sie zu
   * verstecken. Die Zeile heilt sich damit selbst — sobald ein Step seinen
   * Auftrag deklariert, klappt sein Warum zu.
   */
  offenAnfangs?: boolean
  /** Die `AhaKarte`n des Steps. Sie rendern nichts, sie melden sich an. */
  children?: React.ReactNode
}) {
  const [eintraege, setEintraege] = useState<AhaEintrag[]>([])
  const [offen, setOffen] = useState(offenAnfangs)
  /** Welche `zugeklappt`-Einwürfe jemand schon aufgetippt hat. */
  const [aufgetippt, setAufgetippt] = useState<string[]>([])
  /** Das automatische Aufklappen gibt es **einmal** je Step, nicht bei jedem Aha. */
  const schonAufgegangen = useRef(false)

  const melde = useCallback((eintrag: AhaEintrag) => {
    setEintraege((liste) =>
      liste.some((e) => e.id === eintrag.id) ? liste : [...liste, eintrag],
    )
  }, [])
  const nimmZurueck = useCallback((id: string) => {
    setEintraege((liste) => liste.filter((e) => e.id !== id))
  }, [])
  const kontext = useMemo(() => ({ melde, nimmZurueck }), [melde, nimmZurueck])

  const anzahl = eintraege.length

  useEffect(() => {
    if (anzahl === 0 || schonAufgegangen.current) return
    schonAufgegangen.current = true
    setOffen(true)
  }, [anzahl])

  const hatInhalt = warum != null || anzahl > 0
  /**
   * Im geschlossenen Zustand wirbt die Zeile mit der **Frage** des Einwurfs,
   * nicht mit „Warum das so ist“. Die Frage ist der Grund, warum jemand tippt;
   * eine Rubrik ist keiner.
   */
  const zeile = anzahl > 0 ? eintraege[0].daten.current.frage : 'Warum das so ist'

  return (
    <AhaKontext.Provider value={kontext}>
      {children}
      {hatInhalt && (
        <div className="shrink-0" data-testid="warum">
          <button
            type="button"
            onClick={() => setOffen((v) => !v)}
            aria-expanded={offen}
            data-testid="warum-schalter"
            className="flex min-h-[44px] w-full items-center gap-2.5 py-1 text-left transition-transform active:scale-[0.99]"
          >
            {anzahl > 0 ? (
              <motion.span
                aria-hidden
                animate={offen ? {} : { scale: [1, 1.12, 1] }}
                transition={{
                  duration: 1.6,
                  repeat: offen ? 0 : Infinity,
                  repeatDelay: 2,
                }}
                className="grid size-7 shrink-0 place-items-center rounded-full bg-kh-orange text-[#0E0D0B]"
              >
                <HelpCircle className="size-[18px]" strokeWidth={2.75} />
              </motion.span>
            ) : (
              <span
                aria-hidden
                className="h-[3px] w-5 shrink-0 rounded-full bg-kh-paper/30"
              />
            )}
            <span
              className={`min-w-0 flex-1 truncate text-[1rem] font-medium ${
                anzahl > 0 ? 'text-kh-paper' : 'text-kh-paper/55'
              }`}
            >
              {zeile}
            </span>
            <motion.span
              aria-hidden
              animate={{ rotate: offen ? 180 : 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="shrink-0 text-kh-paper/45"
            >
              <ChevronDown className="size-5" strokeWidth={2.25} />
            </motion.span>
          </button>

          <AnimatePresence initial={false}>
            {offen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div
                  data-auswaehlbar
                  className="flex flex-col gap-3.5 border-t border-kh-line pt-3 pb-1"
                >
                  {eintraege.map((e, i) => {
                    /*
                      **Der erste Einwurf bekommt keine eigene Überschrift** —
                      die Schaltzeile darüber ist bereits seine.

                      Sonst steht seine Frage zweimal direkt untereinander:
                      „Wozu überhaupt eine Fuge?" in der Zeile und „WOZU
                      ÜBERHAUPT EINE FUGE?" als Etikett zwei Pixel darunter
                      (auf C4 gesehen). Genau die Sorte Dopplung, gegen die
                      dieser Umbau angetreten ist.

                      Ab dem zweiten trennt die Überschrift die Antworten
                      voneinander und wird gebraucht — und ab dem zweiten
                      greift auch `zugeklappt`: der erste hat sein Akkordeon
                      schon (die Schaltzeile), ein zweiter automatisch
                      ausgeschriebener sprengt das Wortbudget (R5). Seine
                      Überschrift wird dann zur Klappzeile.
                    */
                    const klappbar = i > 0 && e.daten.current.zugeklappt
                    const zu = klappbar && !aufgetippt.includes(e.id)
                    return (
                      <div key={e.id} className="flex flex-col gap-1">
                        {i > 0 &&
                          (klappbar ? (
                            <button
                              type="button"
                              aria-expanded={!zu}
                              data-testid={`aha-schalter-${i}`}
                              onClick={() =>
                                setAufgetippt((liste) =>
                                  zu ? [...liste, e.id] : liste.filter((x) => x !== e.id),
                                )
                              }
                              className="flex min-h-[44px] w-full items-center justify-between gap-2 text-left transition-transform active:scale-[0.99]"
                            >
                              <span className="kh-etikett">{e.daten.current.frage}</span>
                              <ChevronDown
                                aria-hidden
                                className={`size-4 shrink-0 text-kh-paper/45 transition-transform ${
                                  zu ? '' : 'rotate-180'
                                }`}
                                strokeWidth={2.25}
                              />
                            </button>
                          ) : (
                            <span className="kh-etikett">{e.daten.current.frage}</span>
                          ))}
                        {!zu && (
                          <div className="text-[1.0625rem] leading-[1.45] text-kh-paper/90">
                            {e.daten.current.inhalt}
                          </div>
                        )}
                      </div>
                    )
                  })}
                  {warum && <div className="kh-fachtext">{warum}</div>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </AhaKontext.Provider>
  )
}
