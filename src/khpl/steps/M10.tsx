import { ChevronLeft, RotateCcw } from 'lucide-react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { useStand } from '@/khpl/stand'
import { StepShell } from '@/khpl/shell/StepShell'
import {
  beendeKarriereSkip,
  setzeZurueck,
  useFortschritt,
} from '@/khpl/store/fortschritt'
import { AUFHAENGER_OHNE, karriereweg } from './karrierewege'

/**
 * M10 — CTA. Der Endpunkt.
 *
 * **Ein Abschluss-Screen, zweiteilig** statt zwei getrennter Screens
 * (khpl-flow.md 7 M10):
 *
 *  1. Personalisierter Aufhänger — greift auf, was in M9 angesehen wurde.
 *     Genau die `XYZ`-Logik des Boards.
 *  2. Der eigentliche CTA — „Sprich jetzt mit [Name] am Stand“, groß, in
 *     Markenorange.
 *
 * Der Name kommt aus `public/stand.json` und fällt ohne Konfiguration auf
 * „Sprich jetzt mit uns am Stand“ zurück — nie auf einen Platzhalter im
 * Klartext (siehe `stand.ts`).
 *
 * Wer im Karriere-Skip bis hierher durchgeht, bekommt zusätzlich
 * **[ Zurück zu deinem Tag ]** (ui-shell 6) — der Skip bleibt ein Abstecher,
 * auch wenn er bis ans Ende führt.
 */
export function M10() {
  const fortschritt = useFortschritt()
  const stand = useStand()

  const angesehen = fortschritt.answers.m9?.angesehen ?? []
  const zuletzt = angesehen[angesehen.length - 1]
  const aufhaenger = (zuletzt && karriereweg(zuletzt)?.aufhaenger) || AUFHAENGER_OHNE
  const imSkip = fortschritt.detourReturnTo !== null

  return (
    <StepShell
      id="M10"
      aufteilung="uebung"
      interaktionOffen={false}
      interaktion={
        <div className="flex h-full min-h-0 flex-col justify-start gap-5 overflow-hidden">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            data-testid="m10-aufhaenger"
            className="max-w-[46rem] text-[clamp(1.15rem,1rem+0.8vw,1.6rem)] leading-[1.4] font-light text-kh-grey"
          >
            {aufhaenger}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-2 rounded-kh bg-kh-orange px-7 py-7 text-white"
            data-testid="m10-cta"
          >
            <p className="text-[clamp(1.6rem,1.2rem+2vw,2.8rem)] leading-[1.1] font-bold">
              {stand.name
                ? `Sprich jetzt mit ${stand.name} am Stand.`
                : 'Sprich jetzt mit uns am Stand.'}
            </p>
            {stand.rolle && <p className="text-[17px] font-light">{stand.rolle}</p>}
          </motion.div>

          {/* Die Paderborner Skyline aus dem Markenbestand schließt den Screen
              ab — orange auf Transparenz, sie braucht keine Behandlung. Der
              letzte Screen der Anwendung ist der einzige, auf dem die Marke
              wieder auftauchen darf: hier endet die Rolle und es spricht
              wieder die Kreishandwerkerschaft. */}
          <motion.img
            src="/brand/kh-pb-lippe.png"
            alt=""
            aria-hidden
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mt-auto h-[min(20vh,150px)] w-auto max-w-full self-start object-contain object-left-bottom opacity-90"
          />
        </div>
      }
      fuss={
        <div className="flex flex-wrap items-center justify-between gap-3">
          {imSkip ? (
            <Button
              variant="outline"
              onClick={beendeKarriereSkip}
              data-testid="m10-zurueck-zum-tag"
              className="h-[60px] px-6 text-[16px]"
            >
              <ChevronLeft className="size-5" strokeWidth={1.75} />
              Zurück zu deinem Tag
            </Button>
          ) : (
            <span />
          )}
          <Button
            variant="ghost"
            onClick={setzeZurueck}
            data-testid="m10-neu-starten"
            className="h-[60px] px-6 text-[16px]"
          >
            <RotateCcw className="size-5" strokeWidth={1.5} />
            Von vorn
          </Button>
        </div>
      }
    />
  )
}
