import { Suspense, lazy, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { RotateCw, X } from 'lucide-react'
import { BAUTEIL_TEXTE } from '@/dachstuhl/bauteil-texte'
import type { Auswahl } from '@/dachstuhl/debug'
import { Dachstuhl3DFallback } from '@/khpl/buehne/Dachstuhl3DFallback'
import { AhaKarte } from '@/khpl/komponenten/AhaKarte'
import { Begriff } from '@/khpl/komponenten/Begriff'
import { StepFuss, useStepNavigation } from '@/khpl/shell/StepFuss'
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
  const { weiter } = useStepNavigation('B3.2')
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
      aufteilung="buehne"
      titelZusatz="Abstecher"
      // Das Modell will jede Geste selbst: Drehen darf nie den Step wechseln
      // (flow 6.1 — Drag-Gesten haben Vorrang vor Swipe-Navigation).
      wischen={false}
      interaktionOffen={!genug}
      onWeiter={weiter}
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
      fachtext={
        <p>
          Auf dem Papier liegen Grundriss, Schnitt und Ansicht nebeneinander — flach. Im
          Kopf müssen sie ein Gebäude ergeben. <Begriff id="sparren">Sparren</Begriff>,{' '}
          <Begriff id="kehlbalken">Kehlbalken</Begriff>,{' '}
          <Begriff id="pfette">Pfetten</Begriff>: Wer sie im Plan findet, findet sie auch
          auf dem Dach.
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
        <AhaKarte sichtbar={genug} eyebrow="Nicht auf dem Schirm">
          Räumliches Vorstellungsvermögen ist kein Talent. Es ist Training — und es steht
          im Lehrplan der Berufsschule. Kehlbalken-Geometrie ist echte 3D-Mathematik, und
          die lernt man dort systematisch.
        </AhaKarte>
      }
      fuss={<StepFuss id="B3.2" />}
    />
  )
}

function Aufforderung({ gefunden }: { gefunden: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="flex items-center gap-3 rounded-kh bg-kh-page px-5 py-4 shadow-[0_2px_24px_rgba(0,0,0,0.12)]"
    >
      <RotateCw
        className="size-5 shrink-0 text-kh-orange-text"
        strokeWidth={1.75}
        aria-hidden
      />
      <p className="text-[16px] text-kh-ink">
        Dreh das Dach. Tipp an, was du wissen willst.
        {gefunden > 0 && (
          <span className="text-kh-grey/70">
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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      data-testid="b32-bauteil"
      className="relative rounded-kh bg-kh-page p-5 shadow-[0_2px_24px_rgba(0,0,0,0.14)]"
    >
      <button
        type="button"
        onClick={onSchliessen}
        aria-label="Erklärung schließen"
        className="absolute top-2 right-2 grid size-11 place-items-center rounded-kh text-kh-grey transition-colors hover:text-kh-orange"
      >
        <X className="size-5" strokeWidth={1.5} />
      </button>
      <h2 className="kh-h3 pr-12 text-kh-orange-text">{text.label}</h2>
      <p className="mt-1.5 text-[16px] leading-[1.5] text-kh-grey">{text.text}</p>
    </motion.div>
  )
}
