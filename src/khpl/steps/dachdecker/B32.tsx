import { Suspense, lazy, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { RotateCw, X } from 'lucide-react'
import { BAUTEIL_TEXTE } from '@/dachstuhl/bauteil-texte'
import type { Auswahl } from '@/dachstuhl/debug'
import { Dachstuhl3DFallback } from '@/khpl/buehne/Dachstuhl3DFallback'
import { AhaKarte } from '@/khpl/komponenten/AhaKarte'
import { Begriff } from '@/khpl/komponenten/Begriff'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { merkeAntwort, useFortschritt } from '@/khpl/store/fortschritt'

/**
 * B3.2 — Vom Plan in den Kopf. Abstecher von M3, mündet in M4.
 *
 * Das echte, drehbare 3D-Modell (khpl-flow.md 7 B3.2). Auf dem Board selbst als
 * **(difficult)** markiert; technisch das teuerste Element der App und zugleich
 * das, weswegen jemand am Stand stehen bleibt.
 *
 * Die Aha-Karte steht **hinter** der Interaktion, nicht davor: erst selbst
 * drehen und merken, dass man den Kehlbalken findet, dann die Auflösung. Sie
 * erscheint deshalb erst, wenn zwei Bauteile angetippt wurden — nicht nach
 * einer Uhr, sondern nach dem Erlebnis, das sie kommentiert.
 *
 * `three` hängt hinter `lazy` (flow 8.5): es darf nie im Erststart landen.
 */

const Dachstuhl3D = lazy(() => import('@/khpl/buehne/Dachstuhl3D'))

/** Ab so vielen angetippten Bauteilen hat der Besucher die Erfahrung gemacht. */
const AHA_AB = 2

export function B32() {
  const gespeichert = useFortschritt().answers.b32
  const [auswahl, setAuswahl] = useState<Auswahl | null>(null)
  const [angetippt, setAngetippt] = useState<string[]>(() => gespeichert?.angetippt ?? [])

  const tippen = (typ: string, index: number | null) => {
    setAuswahl({ typ: typ as Auswahl['typ'], index })
    if (angetippt.includes(typ)) return
    // Außerhalb des Updaters: React darf einen Updater beim Rendern ausführen,
    // und `merkeAntwort` schreibt in den Store.
    const neu = [...angetippt, typ]
    setAngetippt(neu)
    merkeAntwort('b32', { angetippt: neu })
  }

  const genug = angetippt.length >= AHA_AB

  return (
    <StepShell
      id="B3.2"
      auftrag={genug ? null : 'Tipp die Teile an, die du im Plan wiedererkennst.'}
      ansage={null}
      buehneInteraktiv
      titelZusatz="Abstecher"
      // Das Modell will jede Geste selbst: Drehen darf nie den Step wechseln
      // (flow 6.1 — Drag-Gesten haben Vorrang vor Swipe-Navigation).
      interaktionOffen={!genug}
      buehne={
        <Suspense fallback={<Dachstuhl3DFallback />}>
          <Dachstuhl3D
            zielT={1}
            // Nur solange nichts ausgewählt ist: sonst dreht das hervorgehobene
            // Bauteil aus dem Bild, während man den Text dazu liest.
            attraktor={auswahl === null}
            // Nur angedeutet gelattet. Voll gelattet ist zwar der bauliche
            // Endzustand, begräbt aber genau das, was dieser Step erklären
            // soll: Pfetten, Stuhlsäulen und Kopfbänder liegen dann unter
            // einem geschlossenen Lattenteppich und sind weder zu sehen noch
            // anzutippen.
            lattung={0.35}
            auswahl={auswahl}
            onBauteil={(teil) => tippen(teil.typ, teil.auswahlIndex)}
            onDaneben={() => setAuswahl(null)}
          />
        </Suspense>
      }
      warum={
        <p>
          Auf dem Papier liegt alles flach nebeneinander. Im Kopf muss daraus ein Gebäude
          werden. Die schrägen Balken heißen <Begriff id="sparren">Sparren</Begriff> — wer
          sie im Plan findet, findet sie auch auf dem Dach.
        </p>
      }
      interaktion={
        <>
          <AnimatePresence mode="wait" initial={false}>
            {auswahl ? (
              <BauteilKarte
                key={auswahl.typ}
                auswahl={auswahl}
                onSchliessen={() => setAuswahl(null)}
              />
            ) : (
              <Aufforderung key="hinweis" gefunden={angetippt.length} />
            )}
          </AnimatePresence>
        </>
      }
      aha={
        <AhaKarte sichtbar={genug} eyebrow="Muss man dafür räumlich denken können?">
          Räumliches Vorstellungsvermögen ist kein Talent. Es ist Training — und es steht
          im Lehrplan der Berufsschule. Kehlbalken-Geometrie ist echte 3D-Mathematik, und
          die lernt man dort systematisch.
        </AhaKarte>
      }
      fuss={
        <StepFuss
          id="B3.2"
          uebungOffen={!genug}
          geschafft={genug ? 'Bauteile erkundet' : null}
        />
      }
    />
  )
}

function Aufforderung({ gefunden }: { gefunden: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, transform: 'translateY(8px)' }}
      animate={{ opacity: 1, transform: 'translateY(0px)' }}
      exit={{ opacity: 0, transform: 'translateY(-8px)' }}
      transition={{ duration: 0.25 }}
      className="flex items-center gap-3 rounded-kh border-2 border-kh-orange/40 bg-kh-orange/12 px-4 py-3.5"
    >
      {/* Das Icon dreht sich langsam mit: die Aufforderung lautet „dreh das
          Dach“, und ein stehendes Drehsymbol sagt das Gegenteil. */}
      <motion.span
        aria-hidden
        animate={{ rotate: 360 }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
        className="shrink-0 text-kh-orange"
      >
        <RotateCw className="size-6" strokeWidth={2.25} />
      </motion.span>
      <p className="text-[1.125rem] font-medium text-kh-paper">
        Dreh das Dach. Tipp an, was du wissen willst.
        {gefunden > 0 && (
          <span className="font-normal text-kh-paper/55">
            {' '}
            — {gefunden} {gefunden === 1 ? 'Bauteil' : 'Bauteile'} hast du schon.
          </span>
        )}
      </p>
    </motion.div>
  )
}

function BauteilKarte({
  auswahl,
  onSchliessen,
}: {
  auswahl: Auswahl
  onSchliessen: () => void
}) {
  const text = BAUTEIL_TEXTE[auswahl.typ]
  return (
    <motion.div
      initial={{ opacity: 0, transform: 'translateY(12px)' }}
      animate={{ opacity: 1, transform: 'translateY(0px)' }}
      exit={{ opacity: 0, transform: 'translateY(-8px)' }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      data-testid="b32-bauteil"
      className="kh-feld relative p-4"
    >
      <button
        type="button"
        onClick={onSchliessen}
        aria-label="Erklärung schließen"
        className="absolute top-2 right-2 grid size-11 place-items-center rounded-kh-pill bg-white/8 text-kh-paper transition-transform active:scale-90"
      >
        <X className="size-5" strokeWidth={2.25} />
      </button>
      <h2 className="kh-titel-klein pr-12 text-kh-orange">{text.label}</h2>
      <p className="mt-2 text-[1.125rem] leading-[1.45] text-kh-paper/85">{text.text}</p>
    </motion.div>
  )
}
