import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { brauchtAnsage, type Geste } from './gesten'
import { merkeGeste, useSitzung } from '@/khpl/store/fortschritt'

/**
 * Die Ansage — **„das passiert jetzt“**, bevor irgendetwas passiert.
 *
 * Der Befund, aus dem sie entsteht: die App verlangt von einem
 * Fünfzehnjährigen, der noch nie eine Werkstatt von innen gesehen hat,
 * Handgriffe, die sie ihm vorher nicht gezeigt hat. Das ist keine Abfrage,
 * das ist Raten — `M7.tsx` hat denselben Fehler an sich selbst gefunden und
 * ihn dort einzeln repariert. Die Ansage ist die allgemeine Fassung dieser
 * Reparatur.
 *
 * **Drei Teile, in dieser Reihenfolge:**
 *
 *  1. *Was gleich passiert* — ein Satz, in der Welt des Berufs, nicht in der
 *     der Bedienung („Du ziehst die Leitung von der Pumpe zum Verteiler“,
 *     nicht „ziehen Sie mit dem Finger“).
 *  2. *Der Haken*, falls es einen gibt — der Grund, warum die naheliegende
 *     Antwort die falsche ist. Optional; wo es keinen gibt, steht keiner.
 *  3. *Die Geste*, schematisch vorgeführt und in Schleife (`GestenDemo`).
 *     Das ist der Teil, der ohne Lesen funktioniert.
 *
 * **Sie kostet genau einen Tap.** Derselbe Tap, mit dem die Übung anfängt.
 * Wer weiß, was er tut, verliert nichts — und deshalb darf sie überhaupt
 * blockierend sein.
 *
 * **Sie erscheint je Geste, nicht je Screen** (`gesten.ts`). Über einen
 * ganzen Tag sind das zwei bis drei Ansagen, nicht fünfzehn. `tippen` bekommt
 * nie eine: Antippen erklärt sich selbst.
 *
 * ⚠️ **Was sie bewusst noch nicht tut.** Der Plan sieht vor, dass die
 * Geisterhand nach dem Wegtippen blass **auf der Bühne** weiterläuft, bis der
 * Finger sie zum ersten Mal berührt. Das setzt voraus, dass die Ansage die
 * Geometrie jeder einzelnen Bühne kennt — vier Tage, ein Dutzend Bühnen, jede
 * mit eigenem Koordinatensystem. Gebaut ist deshalb erst die schematische
 * Vorführung in der Karte. Gemeldet, nicht heimlich weggelassen.
 */
export function Ansage({
  geste,
  text,
  haken,
}: {
  geste: Geste
  /** Was gleich passiert. Höchstens 20 Wörter. */
  text: string
  /** Der Haken daran. Höchstens 15 Wörter. Für die Rate-Regler: `RATEN_HAKEN`. */
  haken?: string
}) {
  const gelernt = useSitzung().gelernteGesten
  /**
   * Einmal beim Mounten entschieden, nicht bei jedem Rendern.
   *
   * `merkeGeste` schreibt in dieselbe Sitzung, die hier gelesen wird. Hinge
   * die Sichtbarkeit direkt an `gelernt`, verschwände die Karte im selben
   * Render, in dem sie sich merkt — ohne Ausblende, und `AnimatePresence`
   * bekäme nie einen Abgang zu sehen.
   */
  const [offen, setOffen] = useState(
    () => brauchtAnsage(geste) && !gelernt.includes(geste),
  )

  const wegtippen = () => {
    setOffen(false)
    merkeGeste(geste)
  }

  return (
    <AnimatePresence>
      {offen && (
        <motion.div
          key="ansage"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          data-testid="ansage"
          role="dialog"
          aria-modal="true"
          aria-label="Das passiert jetzt"
          // Über allem, auch über der Leiste: solange die Ansage steht, ist
          // sie der Screen. Ein Zurück-Button daneben wäre ein zweiter Weg
          // aus einer Karte, die ohnehin nur einen Tap kostet.
          className="absolute inset-0 z-50 flex items-end justify-center bg-[#0E0D0B]/72 p-4 backdrop-blur-[3px] sm:p-6 landscape:items-center landscape:p-8"
          onClick={wegtippen}
        >
          <motion.div
            initial={{ opacity: 0, y: 26, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.99 }}
            transition={{ duration: 0.42, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
            className="kh-panel flex w-full max-w-[34rem] flex-col gap-4 p-5 sm:p-6"
          >
            <GestenDemo geste={geste} />

            <p className="text-[clamp(1.25rem,1.05rem+0.8vw,1.6rem)] leading-[1.3] font-semibold text-kh-paper text-balance">
              {text}
            </p>

            {haken && (
              <p className="text-[1.0625rem] leading-[1.45] text-kh-paper/70 sm:text-[1.125rem]">
                {haken}
              </p>
            )}

            {/* Der Knopf ist die ganze Fläche — der Tap auf den Hintergrund
                tut dasselbe. Er steht trotzdem da, weil eine Karte ohne
                sichtbaren Ausgang am Stand jemanden warten lässt. */}
            <div className="flex justify-end">
              <Button
                variant="weiter"
                onClick={wegtippen}
                data-testid="ansage-verstanden"
                className="min-w-[9rem]"
              >
                Alles klar
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ---------------------------------------------------------------------------
// Die Vorführung
// ---------------------------------------------------------------------------

/** Ein Durchlauf der Schleife, in Sekunden. Langsam genug zum Nachmachen. */
const TAKT = 2.2

/**
 * Die Geste, schematisch. Kein Foto einer Hand, kein Video: ein Weg und ein
 * Punkt, der ihn abfährt.
 *
 * **Warum abstrakt und nicht gegenständlich.** Eine gezeichnete Hand über
 * einem konkreten Bauteil verspricht, dass es *dort* gezogen wird — und wäre
 * damit auf jedem der zwölf Bühnenbilder eine andere Lüge. Ein Punkt auf einer
 * Bahn sagt nur, was der Finger tut, und das ist genau die Aussage.
 */
function GestenDemo({ geste }: { geste: Geste }) {
  return (
    <div
      aria-hidden
      data-testid={`gesten-demo-${geste}`}
      className="kh-feld relative h-[104px] overflow-hidden px-4 py-3"
    >
      <svg viewBox="0 0 260 72" className="size-full" fill="none">
        {geste === 'ziehen-regler' && <Regler />}
        {geste === 'ziehen-frei' && <Frei />}
        {geste === 'ziehen-karte' && <Karte />}
        {geste === 'drehen' && <Drehen />}
      </svg>
    </div>
  )
}

/** Der Finger als Ring mit weichem Kern — dieselbe Form in allen vier Demos. */
function Finger({ cx = 0, cy = 0 }: { cx?: number; cy?: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r="15" fill="var(--color-kh-orange)" opacity="0.22" />
      <circle cx={cx} cy={cy} r="9" fill="var(--color-kh-orange)" />
    </g>
  )
}

const BAHN = {
  stroke: 'rgb(251 247 240 / 0.28)',
  strokeWidth: 3,
  strokeLinecap: 'round',
} as const

function Regler() {
  return (
    <>
      <line x1="30" y1="36" x2="230" y2="36" {...BAHN} />
      <motion.g
        animate={{ x: [30, 230, 30] }}
        transition={{ duration: TAKT * 1.6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Finger cy={36} />
      </motion.g>
    </>
  )
}

function Frei() {
  return (
    <>
      {/* Ein Knick, kein Bogen: die freien Zieh-Übungen (A4 Leitung, M4
          Schnittlinie) laufen über Ecken, nicht über Kurven. */}
      <path d="M30 56 L130 56 L130 18 L230 18" {...BAHN} />
      <motion.g
        animate={{
          x: [30, 130, 130, 230, 30],
          y: [56, 56, 18, 18, 56],
        }}
        transition={{
          duration: TAKT * 1.9,
          repeat: Infinity,
          ease: 'easeInOut',
          times: [0, 0.34, 0.5, 0.84, 1],
        }}
      >
        <Finger />
      </motion.g>
    </>
  )
}

function Karte() {
  return (
    <>
      <rect
        x="176"
        y="14"
        width="62"
        height="44"
        rx="8"
        stroke="rgb(251 247 240 / 0.3)"
        strokeWidth="2.5"
        strokeDasharray="7 6"
      />
      <motion.g
        animate={{ x: [0, 154, 154, 0], opacity: [1, 1, 0, 0] }}
        transition={{
          duration: TAKT * 1.7,
          repeat: Infinity,
          ease: 'easeInOut',
          times: [0, 0.62, 0.82, 1],
        }}
      >
        <rect
          x="22"
          y="14"
          width="62"
          height="44"
          rx="8"
          fill="rgb(251 247 240 / 0.14)"
          stroke="var(--color-kh-orange)"
          strokeWidth="2.5"
        />
        <Finger cx={53} cy={36} />
      </motion.g>
    </>
  )
}

function Drehen() {
  return (
    <>
      <path d="M78 52 A 52 52 0 0 1 182 52" {...BAHN} />
      <motion.g
        animate={{ rotate: [-38, 38, -38] }}
        style={{ originX: '130px', originY: '52px' }}
        transition={{ duration: TAKT * 1.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Finger cx={130} cy={4} />
      </motion.g>
    </>
  )
}
