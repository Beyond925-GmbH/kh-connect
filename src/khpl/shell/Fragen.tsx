import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { FRAGEN } from '@/khpl/match/fragen'
import { merkeFrage, zeigeVorschlag } from '@/khpl/store/fortschritt'

/**
 * S2 — die vier Fragen. Eine pro Screen, Antwort per Tap, dann weiter.
 *
 * **Kein Weiter-Knopf unter den Antworten.** Ein Tap auf eine Antwort ist die
 * Entscheidung; ein zweiter Tap, um sie zu bestätigen, verdoppelt die Kosten
 * des Trichters und trägt nichts. Stattdessen bleibt die gewählte Antwort
 * einen Moment stehen — lange genug, dass der Tap sichtbar angekommen ist,
 * kurz genug, dass niemand wartet.
 *
 * **Überspringen führt vorwärts, nicht heraus.** Wer eine Frage überspringt,
 * kommt zur nächsten; wer alle überspringt, landet auf der Berufsliste statt
 * auf einem Vorschlag, den nichts trägt (siehe `Vorschlag`).
 */

/** Wie lange die gewählte Antwort stehen bleibt, bevor die nächste Frage kommt. */
const QUITTUNG_MS = 260

export function Fragen() {
  const [index, setIndex] = useState(0)
  const [gewaehlt, setGewaehlt] = useState<string | null>(null)

  const frage = FRAGEN[index]
  const letzte = index === FRAGEN.length - 1

  const weiter = () => {
    setGewaehlt(null)
    if (letzte) zeigeVorschlag()
    else setIndex((i) => i + 1)
  }

  const antworte = (antwortId: string) => {
    if (gewaehlt) return
    setGewaehlt(antwortId)
    merkeFrage(frage.id, antwortId)
    window.setTimeout(weiter, QUITTUNG_MS)
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

      <div className="relative flex min-h-0 flex-1 flex-col gap-5 p-5 landscape:p-8">
        <header className="flex shrink-0 items-center gap-3">
          {/* Vier Kerben statt „Frage 2 von 4“. Der Zählstand hat auf diesem
              Screen keine Aufgabe — niemand muss wissen, wie weit er ist,
              wenn ohnehin nach vier Taps Schluss ist. Er muss nur sehen,
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
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={frage.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="flex min-h-0 flex-1 flex-col justify-center gap-6 landscape:mx-auto landscape:w-full landscape:max-w-[52rem]"
          >
            <h1 className="kh-plakat shrink-0">{frage.frage}</h1>

            <div className="flex shrink-0 flex-col gap-2.5">
              {frage.antworten.map((a) => {
                const ist = gewaehlt === a.id
                return (
                  <button
                    key={a.id}
                    type="button"
                    data-testid={`antwort-${a.id}`}
                    onClick={() => antworte(a.id)}
                    className={`flex min-h-[68px] items-center rounded-kh border-2 px-5 py-3 text-left text-[1.125rem] font-semibold transition-all duration-150 active:scale-[0.98] ${
                      ist
                        ? 'border-kh-signal bg-kh-signal text-[#0E0D0B]'
                        : 'border-kh-line-strong bg-white/6 text-kh-paper'
                    } ${gewaehlt && !ist ? 'opacity-35' : ''}`}
                  >
                    {a.text}
                  </button>
                )
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
