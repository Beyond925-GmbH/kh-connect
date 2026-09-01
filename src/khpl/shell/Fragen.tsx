import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { NeustartKnopf } from './Neustart'
import { FRAGEN } from '@/khpl/match/fragen'
import { merkeFrage, zeigeBerufe } from '@/khpl/store/fortschritt'
import { Bildwahl } from './fragen/Bildwahl'
import { Hoehenwahl } from './fragen/Hoehenwahl'
import { Radio } from './fragen/Radio'

/**
 * Die Fragen — die vier Stationen. Eine pro Screen; dieser Rahmen trägt nur
 * noch Kerben und „Überspringen“ und reicht den Rest an die Bauform der
 * Station weiter (`fragen.ts`: `bilder`, `hoehe`, `radio`).
 *
 * **Zwei Quittungsarten, ein Grundsatz.** Bei der Bildfrage ist der Tap die
 * Entscheidung — kein zweiter Tap zum Bestätigen, die gewählte Kachel bleibt
 * einen Moment stehen (wie vorher bei den Textantworten). Bei Griff-Stationen
 * (Höhe, Radio) ist es umgekehrt: dort ist das Anfassen das Spiel und der
 * Knopf die Entscheidung — ein Auto-Weiter beim Loslassen würde das Drehen
 * über das Band bestrafen, das die Station gerade einladen will.
 *
 * **Überspringen führt vorwärts, nicht heraus.** Wer eine Station überspringt,
 * kommt zur nächsten; wer alle überspringt, landet auf der Berufsliste statt
 * auf einem Vorschlag, den nichts trägt.
 */

/** Wie lange die gewählte Bildkachel stehen bleibt, bevor es weitergeht. */
const QUITTUNG_MS = 420

export function Fragen() {
  const [index, setIndex] = useState(0)
  const [gewaehlt, setGewaehlt] = useState<string | null>(null)

  const frage = FRAGEN[index]
  const letzte = index === FRAGEN.length - 1

  const weiter = () => {
    setGewaehlt(null)
    if (letzte) zeigeBerufe()
    else setIndex((i) => i + 1)
  }

  /** Bildfrage: Tap = Antwort, kurze Quittung, dann weiter. */
  const antworte = (antwortId: string) => {
    if (gewaehlt) return
    setGewaehlt(antwortId)
    merkeFrage(frage.id, antwortId)
    window.setTimeout(weiter, QUITTUNG_MS)
  }

  /** Griff-Station: der Weiter-Knopf der Station liefert die Antwort. */
  const bestaetige = (antwortId: string) => {
    if (gewaehlt) return
    setGewaehlt(antwortId)
    merkeFrage(frage.id, antwortId)
    weiter()
  }

  return (
    <div
      data-testid="fragen"
      className="kh-screen flex flex-col overflow-hidden bg-kh-ink"
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(90%_70%_at_85%_0%,rgba(255,122,26,0.18),transparent_62%)]"
      />

      <div className="relative flex min-h-0 flex-1 flex-col gap-3 p-4 landscape:gap-4 landscape:p-6">
        <header className="flex shrink-0 items-center gap-3">
          {/* Vier Kerben statt „Frage 2 von 4“. Der Zählstand hat auf diesem
              Screen keine Aufgabe — niemand muss wissen, wie weit er ist,
              wenn ohnehin nach vier Stationen Schluss ist. Er muss nur sehen,
              dass es kurz bleibt. */}
          <span className="flex items-center gap-1.5" aria-hidden>
            {FRAGEN.map((f, i) => (
              <span
                key={f.id}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === index
                    ? 'w-7 bg-kh-orange'
                    : i < index
                      ? 'w-2 bg-kh-orange/50'
                      : 'w-2 bg-white/18'
                }`}
              />
            ))}
          </span>
          <span className="sr-only">
            Frage {index + 1} von {FRAGEN.length}
          </span>
          <Button
            variant="leise"
            size="sm"
            onClick={weiter}
            data-testid="frage-ueberspringen"
            className="ml-auto"
          >
            Überspringen
          </Button>
          <NeustartKnopf />
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={frage.id}
            initial={{ opacity: 0, transform: 'translateY(20px)' }}
            animate={{ opacity: 1, transform: 'translateY(0px)' }}
            exit={{ opacity: 0, transform: 'translateY(-14px)' }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="min-h-0 flex-1"
          >
            {frage.art === 'bilder' && (
              <Bildwahl frage={frage} gewaehlt={gewaehlt} onWahl={antworte} />
            )}
            {frage.art === 'hoehe' && <Hoehenwahl frage={frage} onFertig={bestaetige} />}
            {frage.art === 'radio' && <Radio frage={frage} onFertig={bestaetige} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
