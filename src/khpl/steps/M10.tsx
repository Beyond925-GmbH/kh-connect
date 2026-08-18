import { ChevronLeft, RotateCcw } from 'lucide-react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/ui/logo'
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
 *  2. Der eigentliche CTA — „Sprich jetzt mit [Name] am Stand“, groß.
 *
 * Der Name kommt aus `public/stand.json` und fällt ohne Konfiguration auf
 * „Sprich jetzt mit uns am Stand“ zurück — nie auf einen Platzhalter im
 * Klartext (siehe `stand.ts`).
 *
 * **Der ganze Screen ist orange.** Der erste Entwurf setzte eine orange Leiste
 * in ein weißes Feld; das Ergebnis war zur Hälfte leer, und die Abnahme nannte
 * ihn den schwächsten Screen der Anwendung — „ein nicht klickbarer oranger
 * Balken und ein verirrtes Logo in der Ecke“. Die Website schließt jede Seite
 * mit einer vollflächigen orangen Zone ab; dieses Gerät gehört der Marke und
 * gehört hierher, weil an dieser Stelle die Rolle endet und wieder die
 * Kreishandwerkerschaft spricht. Deshalb steht hier auch das Logo, das die App
 * sonst nur auf dem Splash zeigt.
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
      aufteilung="bild"
      interaktionOffen={false}
      buehne={<Abschlussfeld />}
      interaktion={
        <div className="flex flex-col gap-4">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            data-testid="m10-aufhaenger"
            className="text-[clamp(1.05rem,0.95rem+0.7vw,1.35rem)] leading-[1.4] font-light text-kh-grey"
          >
            {aufhaenger}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            data-testid="m10-cta"
            className="flex flex-col gap-1"
          >
            <p className="text-[clamp(1.6rem,1.15rem+2vw,2.8rem)] leading-[1.05] font-bold text-kh-ink">
              {stand.name
                ? `Sprich jetzt mit ${stand.name} am Stand.`
                : 'Sprich jetzt mit uns am Stand.'}
            </p>
            {stand.rolle && (
              <p className="text-[clamp(1rem,0.95rem+0.3vw,1.2rem)] font-light text-kh-grey">
                {stand.rolle}
              </p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <Logo className="h-8 w-auto" />
          </motion.div>
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
          {/* Vorher `ghost` — und damit das leiseste Element auf dem Screen,
              obwohl es die einzige Handlung darauf ist. */}
          <Button
            variant="outline"
            onClick={setzeZurueck}
            data-testid="m10-neu-starten"
            className="h-[60px] px-7 text-[16px]"
          >
            <RotateCcw className="size-5" strokeWidth={1.5} />
            Von vorn
          </Button>
        </div>
      }
    />
  )
}

/**
 * Das orange Abschlussfeld mit der Paderborner Silhouette.
 *
 * Die Grafik aus dem Markenbestand ist orange auf Transparenz — auf orangem
 * Grund wäre sie unsichtbar, deshalb `brightness-0` und niedrige Deckkraft:
 * sie liegt als Schattenriss im Feld statt als aufgeklebtes Asset in der Ecke.
 */
function Abschlussfeld() {
  return (
    <div className="relative size-full overflow-hidden bg-kh-orange">
      <motion.img
        src="/brand/kh-pb-lippe.png"
        alt=""
        aria-hidden
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 0.22, y: 0 }}
        transition={{ duration: 1.1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-x-0 top-[8%] mx-auto h-[46%] w-auto max-w-none object-contain brightness-0"
      />
    </div>
  )
}
