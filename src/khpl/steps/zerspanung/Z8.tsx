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
 * Z8 — Dein nächster Schritt. Der CTA, unverändert wie bei allen vier Tagen
 * (khpl-tage.md §3, „Ende“).
 *
 * Zweiteilig auf einem Screen:
 *
 *  1. Der personalisierte Aufhänger — greift auf, was in Z7 angesehen wurde.
 *  2. Der eigentliche CTA: „Sprich jetzt mit [Name] am Stand“, groß.
 *
 * Der Name kommt aus `public/stand.json` und fällt ohne Konfiguration auf
 * „Sprich jetzt mit uns am Stand“ zurück — nie auf einen Platzhalter im
 * Klartext (siehe `stand.ts`).
 *
 * **Der ganze Screen ist orange.** Die Website schließt jede Seite mit einer
 * vollflächigen orangen Zone ab; dieses Gerät gehört der Marke und gehört
 * hierher, weil an dieser Stelle die Rolle endet und wieder die
 * Kreishandwerkerschaft spricht. Deshalb steht hier auch das Logo, das die App
 * sonst nur auf dem Splash zeigt.
 *
 * Wer im Karriere-Skip bis hierher durchgeht, bekommt zusätzlich
 * **[ Zurück zu deinem Tag ]** (ui-shell 6) — der Skip bleibt ein Abstecher,
 * auch wenn er bis ans Ende führt.
 *
 * ⚠️ **Gemeldete Doppelung, keine gewählte.** Der Aufbau steht wortgleich in
 * `steps/dachdecker/M10.tsx`, samt `Abschlussfeld`. Das ist dieselbe Naht wie
 * bei `Begriff.tsx`: die Fassung dort ist nicht exportiert und liegt in der
 * Dateihoheit des gebauten Tages, und ein gemeinsamer `CtaScreen` in der Hülle
 * wäre eine Änderung für alle vier Tage — die parallel dreimal gleichzeitig
 * passieren würde (khpl-tage.md §6.2). Die Zusammenführung gehört an die
 * Stelle, die alle vier Berufe im Blick hat. Bis dahin gilt: **dieser Screen
 * darf sich nicht anders anfühlen als der des Dachdeckers**, deshalb ist er
 * bis auf die Ids und den Fotoslot identisch.
 */
export function Z8() {
  const fortschritt = useFortschritt()
  const stand = useStand()

  const angesehen = fortschritt.answers.z7?.angesehen ?? []
  const zuletzt = angesehen[angesehen.length - 1]
  const aufhaenger = (zuletzt && karriereweg(zuletzt)?.aufhaenger) || AUFHAENGER_OHNE
  const imSkip = fortschritt.detourReturnTo !== null

  return (
    <StepShell
      id="Z8"
      interaktionOffen={false}
      buehne={<Abschlussfeld />}
      interaktion={
        <div className="flex flex-col gap-4">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            data-testid="z8-aufhaenger"
            className="text-[clamp(1.05rem,0.95rem+0.7vw,1.35rem)] leading-[1.4] text-kh-paper/80"
          >
            {aufhaenger}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            data-testid="z8-cta"
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
              data-testid="z8-zurueck-zum-tag"
            >
              <ChevronLeft className="size-5" strokeWidth={2.25} />
              Zurück zu deinem Tag
            </Button>
          ) : null}
          {/* Ein Orange pro Screen, und das ist der Weg nach vorn. „Von vorn“
              räumt die Sitzung ab und gehört damit nicht dem, der gerade
              fertig geworden ist, sondern dem Standpersonal. */}
          <Button variant="neben" onClick={setzeZurueck} data-testid="z8-neu-starten">
            <RotateCcw className="size-5" strokeWidth={2.25} />
            Von vorn
          </Button>
          {!imSkip && (
            <Button variant="weiter" onClick={zeigeBerufe} data-testid="z8-noch-einen">
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
 * Das Abschlussfeld: ein Foto, über das die Marke gelegt ist.
 *
 * Eine leere Farbfläche fordert niemanden auf, mit einem Menschen zu sprechen —
 * deshalb liegt das Orange als Farbschicht über einem Motiv statt für sich
 * allein. Für diesen Tag ist das „Team am Maschinenbildschirm“ (`card.webp`):
 * das einzige Bild im Bestand, auf dem in diesem Beruf jemand mit jemandem
 * redet. Der Slot steht in `berufe/zerspanung.ts`.
 *
 * `mix-blend-multiply` behält die Zeichnung des Fotos, statt es zuzukleistern —
 * eine Lage Orange, nicht zwei.
 */
function Abschlussfeld() {
  const bild = useStepBild('Z8')

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
      {/* Die Paderborner Silhouette. Die Maske lässt ihre Standlinie in den
          Grund auslaufen, statt sie als waagerechte Kante quer durch den
          halben Screen zu ziehen. */}
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
