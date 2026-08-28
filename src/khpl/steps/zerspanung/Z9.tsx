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
 * Z9 — Dein nächster Schritt. Der CTA-Screen, strukturgleich mit M10, C9
 * und A9: personalisierter Aufhänger aus `answers.z8`, dann der eine Satz
 * mit dem Namen aus `public/stand.json`, dann die Markenzone.
 *
 * ⚠️ **`Abschlussfeld` ist dieselbe bewusste Doppelung wie in A9** und dort
 * gemeldet: der CTA ist eine Markenzone und muss an allen vier Tagen gleich
 * aussehen, liegt aber als lokale Funktion in `M10.tsx`. Wer die Naht
 * auflöst, wirft alle Fassungen weg und nimmt eine gemeinsame.
 */
export function Z9() {
  const fortschritt = useFortschritt()
  const stand = useStand()

  const angesehen = fortschritt.answers.z8?.angesehen ?? []
  const zuletzt = angesehen[angesehen.length - 1]
  const aufhaenger = (zuletzt && karriereweg(zuletzt)?.aufhaenger) || AUFHAENGER_OHNE
  const imSkip = fortschritt.detourReturnTo !== null

  return (
    <StepShell
      id="Z9"
      auftrag={null}
      ansage={null}
      interaktionOffen={false}
      buehne={<Abschlussfeld />}
      interaktion={
        <div className="flex flex-col gap-4">
          <motion.p
            initial={{ opacity: 0, transform: 'translateY(12px)' }}
            animate={{ opacity: 1, transform: 'translateY(0px)' }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            data-testid="z9-aufhaenger"
            className="text-[clamp(1.05rem,0.95rem+0.7vw,1.35rem)] leading-[1.4] text-kh-paper/80"
          >
            {aufhaenger}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, transform: 'translateY(16px)' }}
            animate={{ opacity: 1, transform: 'translateY(0px)' }}
            transition={{ duration: 0.55, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            data-testid="z9-cta"
            className="flex flex-col gap-1"
          >
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
              data-testid="z9-zurueck-zum-tag"
            >
              <ChevronLeft className="size-5" strokeWidth={2.25} />
              Zurück zu deinem Tag
            </Button>
          ) : null}
          <Button variant="neben" onClick={setzeZurueck} data-testid="z9-neu-starten">
            <RotateCcw className="size-5" strokeWidth={2.25} />
            Von vorn
          </Button>
          {!imSkip && (
            <Button variant="weiter" onClick={zeigeBerufe} data-testid="z9-noch-einen">
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
 * Die orange Markenzone über dem Motiv des Tages — hier spricht wieder die
 * Kreishandwerkerschaft, deshalb steht auch das Logo auf dem Screen. Das
 * Motiv ist die drehende Welle aus dem Hero: die eine Aufnahme, die diesen
 * Beruf in einer Sekunde erklärt. `mix-blend-multiply` behält ihre
 * Zeichnung, statt sie zuzukleistern.
 */
function Abschlussfeld() {
  const bild = useStepBild('Z9')

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
      <div className="absolute inset-0 bg-kh-orange mix-blend-multiply" aria-hidden />
      <div className="absolute inset-0 bg-kh-orange/15" aria-hidden />
      <div
        className="absolute inset-0 bg-gradient-to-t from-[#0E0D0B]/75 via-transparent to-[#0E0D0B]/25"
        aria-hidden
      />
      <motion.img
        src="/brand/kh-pb-lippe.png"
        alt=""
        aria-hidden
        initial={{ opacity: 0, transform: 'translateY(24px)' }}
        animate={{ opacity: 0.18, transform: 'translateY(0px)' }}
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
