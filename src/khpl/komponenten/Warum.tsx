import { useCallback, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronDown, HelpCircle } from 'lucide-react'
import { AhaKontext, type AhaEintrag } from './AhaKarte'

/**
 * Der Bereich unter dem Titel — **Fachtext plus Vertiefungen.**
 *
 * **Die eine Änderung, an der der ganze Umbau hängt: der Fachtext ist nicht
 * mehr der Standardinhalt des Panels. Der Auftrag ist es.** Wer wissen will,
 * warum, liest hier weiter.
 *
 * **Aufbau, und warum genau so.** Der frühere eine Master-Schalter über allem
 * hat drei Dinge verwechselt, die nicht zusammengehören:
 *
 *  - **Der Fachtext** (`warum`) ist der Fließtext eines Lese-Steps — auf M3,
 *    M8 oder einem Abstecher *ist* er der Screen. Er steht deshalb offen da,
 *    nicht hinter einem Griff. Ihn zuzuklappen hieße, den Inhalt zu verstecken.
 *  - **Jede Aha-Karte** ist eine eigene Frage mit eigener Antwort. Sie bekommt
 *    ihre **eigene** Klappzeile, gleich aussehend wie jede andere, mit eigenem
 *    Zustand. Vorher war die erste Karte an den Master-Schalter gekoppelt (ein
 *    Tipp klappte *alles* zu) und jede weitere sah anders aus — das war die
 *    Verwirrung, gegen die dieser Umbau angetreten ist.
 *  - **Nichts klappt von selbst auf.** Eine Frage, die sich ungefragt öffnet,
 *    steht als Behauptung da, wo eine Einladung stehen sollte.
 */
export function WarumBereich({
  warum,
  children,
}: {
  /** Der Fließtext des Lese-Steps. Steht offen da. */
  warum?: React.ReactNode
  /** Die `AhaKarte`n des Steps. Sie rendern nichts, sie melden sich an. */
  children?: React.ReactNode
}) {
  const [eintraege, setEintraege] = useState<AhaEintrag[]>([])

  const melde = useCallback((eintrag: AhaEintrag) => {
    setEintraege((liste) =>
      liste.some((e) => e.id === eintrag.id) ? liste : [...liste, eintrag],
    )
  }, [])
  const nimmZurueck = useCallback((id: string) => {
    setEintraege((liste) => liste.filter((e) => e.id !== id))
  }, [])
  const kontext = useMemo(() => ({ melde, nimmZurueck }), [melde, nimmZurueck])

  const hatInhalt = warum != null || eintraege.length > 0

  return (
    <AhaKontext.Provider value={kontext}>
      {children}
      {hatInhalt && (
        <div className="flex shrink-0 flex-col gap-2.5" data-testid="warum">
          {warum && <div className="kh-fachtext">{warum}</div>}
          {eintraege.map((e) => (
            <AhaZeile
              key={e.id}
              frage={e.daten.current.frage}
              inhalt={e.daten.current.inhalt}
            />
          ))}
        </div>
      )}
    </AhaKontext.Provider>
  )
}

/**
 * Eine Aha-Karte als eigenständige Klappzeile — dieselbe Form für jede, mit
 * eigenem Zustand. Der orange „?“-Kreis ist auf jeder Zeile dieselbe Einladung;
 * getippt wird eine Zeile, ohne dass eine andere darauf reagiert.
 */
function AhaZeile({ frage, inhalt }: { frage: string; inhalt: React.ReactNode }) {
  const [offen, setOffen] = useState(false)

  return (
    <div className="rounded-kh border border-kh-line bg-white/[0.03]">
      <button
        type="button"
        onClick={() => setOffen((v) => !v)}
        aria-expanded={offen}
        data-testid="aha-schalter"
        className="flex min-h-[44px] w-full items-center gap-2.5 px-3 py-2 text-left transition-transform active:scale-[0.99]"
      >
        <span
          aria-hidden
          className="grid size-7 shrink-0 place-items-center rounded-full bg-kh-orange text-[#0E0D0B]"
        >
          <HelpCircle className="size-[18px]" strokeWidth={2.75} />
        </span>
        <span className="min-w-0 flex-1 text-[1rem] font-medium text-kh-paper">
          {frage}
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
              className="px-3 pb-3 text-[1.0625rem] leading-[1.45] text-kh-paper/90"
            >
              {inhalt}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
