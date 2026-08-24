import { ChevronLeft, LayoutGrid, RotateCcw } from 'lucide-react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/ui/logo'
import { useStepBild } from '@/khpl/buehne/Foto'
import { useStand } from '@/khpl/stand'
import { StepShell } from '@/khpl/shell/StepShell'
import {
  beendeKarriereSkip,
  setzeZurueck,
  useFortschritt,
  zeigeBerufe,
} from '@/khpl/store/fortschritt'
import { AUFHAENGER_OHNE, karriereweg } from './karrierewege'

/**
 * A9 — Dein nächster Schritt. Der CTA-Screen, unverändert wie bei allen vier
 * Tagen (Spec 6, A9 und khpl-tage.md 3): vollflächig orange, „Sprich jetzt mit
 * … am Stand“ und das Angebot „Noch einen Beruf“.
 *
 * Zweiteilig wie M10:
 *
 *  1. **Personalisierter Aufhänger** — greift auf, was in A8 angesehen wurde
 *     (`answers.a8`, geschrieben von `A8Weg`). Ohne Ansicht der
 *     Rückfalltext aus `karrierewege.ts`.
 *  2. **Der eigentliche CTA** — der Name kommt aus `public/stand.json` und
 *     fällt ohne Konfiguration auf „Sprich jetzt mit uns am Stand“ zurück, nie
 *     auf einen Platzhalter im Klartext.
 *
 * Wer im Karriere-Skip bis hierher durchgeht, bekommt zusätzlich **[ Zurück zu
 * deinem Tag ]** (khpl-ui-shell.md 6) — der Skip bleibt ein Abstecher, auch
 * wenn er bis ans Ende führt. „Von vorn“ ist der Knopf des Standpersonals für
 * den nächsten Besucher, nicht der des Besuchers; deshalb steht daneben „Noch
 * einen Beruf“ als der eine Weg nach vorn.
 *
 * ⚠️ **Zwei Meldungen an die Hülle, keine Änderungen in diesem Tag**
 * (khpl-tage.md 0 und 6.2):
 *
 *  - Der meistgegebene Rat an Neulinge ist quer durch alle 25 Gespräche „mach
 *    ein Praktikum“ — konkreter als „Sprich jetzt mit … am Stand“. Das betrifft
 *    alle vier Tage und gehört an die Hülle.
 *  - Für diesen Beruf nennen die Befragten ein zweites Argument: man kann ihn
 *    gut gebrauchen, wenn man später selbst ein Haus hat. Spec 12 führt das
 *    ausdrücklich als **nicht aufgenommen** und als Material für spätere
 *    Ausbaustufen — es steht deshalb nicht auf diesem Screen.
 *
 * ⚠️ **`Abschlussfeld` ist eine bewusste Doppelung von M10** und gemeldet: der
 * CTA ist eine Markenzone und muss an allen vier Tagen gleich aussehen, aber er
 * liegt heute als lokale Funktion in `steps/dachdecker/M10.tsx`. Ihn dorthin
 * zu verallgemeinern hieße, die Datei eines anderen Berufs anzufassen. Wer die
 * Naht auflöst, wirft beide Fassungen weg und nimmt eine gemeinsame.
 */
export function A9() {
  const fortschritt = useFortschritt()
  const stand = useStand()

  const angesehen = fortschritt.answers.a8?.angesehen ?? []
  const zuletzt = angesehen[angesehen.length - 1]
  const aufhaenger = (zuletzt && karriereweg(zuletzt)?.aufhaenger) || AUFHAENGER_OHNE
  const imSkip = fortschritt.detourReturnTo !== null

  return (
    <StepShell
      id="A9"
      interaktionOffen={false}
      buehne={<Abschlussfeld />}
      interaktion={
        <div className="flex flex-col gap-4">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            data-testid="a9-aufhaenger"
            className="text-[clamp(1.05rem,0.95rem+0.7vw,1.35rem)] leading-[1.4] text-kh-paper/80"
          >
            {aufhaenger}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            data-testid="a9-cta"
            className="flex flex-col gap-1"
          >
            {/* Der eine Satz, um den es auf diesem Screen geht — in Anton, so
                groß wie der Titel darüber. */}
            <p className="kh-titel text-kh-orange">
              {stand.name
                ? `Sprich jetzt mit ${stand.name} am Stand.`
                : 'Sprich jetzt mit uns am Stand.'}
            </p>
            {stand.rolle && (
              <p className="mt-1 text-[clamp(1rem,0.95rem+0.3vw,1.2rem)] text-kh-paper/65">
                {stand.rolle}
              </p>
            )}
          </motion.div>
        </div>
      }
      fuss={
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Das Logo steht im angehefteten Fuß und nicht unten im Inhalt:
              dort läge es unter dem Auslauf-Verlauf des Panels — ausgerechnet
              auf dem einen Screen, auf dem wieder die Kreishandwerkerschaft
              spricht und nicht die Rolle. */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mr-auto"
          >
            <Logo className="h-9 w-auto" />
          </motion.div>
          {imSkip ? (
            <Button
              variant="neben"
              onClick={beendeKarriereSkip}
              data-testid="a9-zurueck-zum-tag"
            >
              <ChevronLeft className="size-5" strokeWidth={2.25} />
              Zurück zu deinem Tag
            </Button>
          ) : null}
          <Button variant="neben" onClick={setzeZurueck} data-testid="a9-neu-starten">
            <RotateCcw className="size-5" strokeWidth={2.25} />
            Von vorn
          </Button>
          {!imSkip && (
            <Button variant="weiter" onClick={zeigeBerufe} data-testid="a9-noch-einen">
              <LayoutGrid className="size-5" strokeWidth={2.25} />
              Noch einen Beruf
            </Button>
          )}
        </div>
      }
    />
  )
}

/**
 * Das Abschlussfeld: die orange Markenzone, über ein Foto gelegt.
 *
 * Die Website schließt jede Seite mit einer vollflächigen orangen Zone ab, und
 * hier endet die Rolle und spricht wieder die Kreishandwerkerschaft — deshalb
 * steht auf diesem Screen auch das Logo, das die App sonst nur auf dem Splash
 * zeigt. `mix-blend-multiply` behält die Zeichnung des Fotos, statt es
 * zuzukleistern.
 *
 * ⚠️ **Für A9 ist kein Motiv vergeben** (Spec 10 nennt für den CTA dieses
 * Tages keins). Ohne Eintrag trägt die Farbfläche mit der Paderborner
 * Silhouette allein — bespielbar, aber schwächer: eine leere Farbfläche
 * fordert niemanden auf, mit einem Menschen zu sprechen. Sobald ein Motiv in
 * der Motivliste steht, liegt es hier ohne weitere Änderung darunter.
 */
function Abschlussfeld() {
  const bild = useStepBild('A9')

  return (
    <div className="relative size-full overflow-hidden bg-kh-orange">
      {bild && (
        <img
          src={bild.src}
          alt=""
          aria-hidden
          style={{ objectPosition: bild.pos }}
          className="size-full object-cover"
        />
      )}
      {/* Eine Lage Orange, nicht zwei: das Multiply trägt die Markenzone
          schon, der Rest ist Tiefe statt Deckung. Der Verlauf nach unten legt
          den Grund fest, auf dem das dunkle Panel steht. */}
      <div className="absolute inset-0 bg-kh-orange mix-blend-multiply" aria-hidden />
      <div className="absolute inset-0 bg-kh-orange/15" aria-hidden />
      <div
        className="absolute inset-0 bg-gradient-to-t from-[#0E0D0B]/75 via-transparent to-[#0E0D0B]/25"
        aria-hidden
      />
      {/* Die Paderborner Silhouette. Sie endet an ihrer Unterkante mit einer
          Standlinie; die Maske lässt sie in den Grund auslaufen, statt
          abzubrechen. */}
      <motion.img
        src="/brand/kh-pb-lippe.png"
        alt=""
        aria-hidden
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 0.18, y: 0 }}
        transition={{ duration: 1.1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{
          maskImage: 'linear-gradient(to bottom, #000 0%, #000 62%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, #000 0%, #000 62%, transparent 100%)',
        }}
        className="absolute inset-x-0 top-[5%] mx-auto h-[38%] w-auto max-w-none object-contain brightness-0"
      />
    </div>
  )
}
