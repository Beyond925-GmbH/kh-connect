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
 *
 * **Mit vier Berufen ist das Ende kein Ende mehr.** Der Weg nach vorn heißt
 * hier „Noch einen Beruf“ und führt auf die Liste — wer einen ganzen Tag
 * durchgespielt hat, ist der Besucher mit der höchsten Wahrscheinlichkeit,
 * einen zweiten anzufangen, und ihn stattdessen auf den Splash zu werfen wäre
 * das Gegenteil eines Angebots. „Von vorn“ bleibt daneben stehen: es ist der
 * Knopf des Standpersonals für den nächsten Besucher, nicht der des
 * Besuchers.
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
      interaktionOffen={false}
      buehne={<Abschlussfeld />}
      interaktion={
        <div className="flex flex-col gap-4">
          <motion.p
            initial={{ opacity: 0, transform: 'translateY(12px)' }}
            animate={{ opacity: 1, transform: 'translateY(0px)' }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            data-testid="m10-aufhaenger"
            className="text-[clamp(1.05rem,0.95rem+0.7vw,1.35rem)] leading-[1.4] text-kh-paper/80"
          >
            {aufhaenger}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, transform: 'translateY(16px)' }}
            animate={{ opacity: 1, transform: 'translateY(0px)' }}
            transition={{ duration: 0.55, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            data-testid="m10-cta"
            className="flex flex-col gap-1"
          >
            {/* Der eine Satz, um den es auf diesem Screen geht — in Anton, so
                groß wie der Titel darüber. Vorher stand er in Barlow 700 und
                war damit die drittgrößte Schrift auf seinem eigenen Screen. */}
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
          {/* Das Logo steht im **angehefteten** Fuß und nicht mehr unten im
              Inhalt: dort lag es unter dem Auslauf-Verlauf des Panels und war
              zur Hälfte weggeblendet — ausgerechnet auf dem einen Screen, auf
              dem wieder die Kreishandwerkerschaft spricht und nicht die Rolle. */}
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
              data-testid="m10-zurueck-zum-tag"
            >
              <ChevronLeft className="size-5" strokeWidth={2.25} />
              Zurück zu deinem Tag
            </Button>
          ) : null}
          {/* Ein Orange pro Screen, und das ist der Weg nach vorn. „Von vorn“
              räumt die Sitzung ab und gehört damit nicht dem, der gerade
              fertig geworden ist. */}
          <Button variant="neben" onClick={setzeZurueck} data-testid="m10-neu-starten">
            <RotateCcw className="size-5" strokeWidth={2.25} />
            Von vorn
          </Button>
          {!imSkip && (
            <Button variant="weiter" onClick={zeigeBerufe} data-testid="m10-noch-einen">
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
 * Vorher war dieses Feld eine leere orange Fläche mit der Paderborner
 * Silhouette. Der Gedanke dahinter bleibt richtig — die Website schließt jede
 * Seite mit einer vollflächigen orangen Zone ab, und hier endet die Rolle und
 * spricht wieder die Kreishandwerkerschaft. Nur trug der Screen damit als
 * einziger im ganzen Ablauf **kein Motiv**, ausgerechnet der, der jemanden vom
 * iPad weg und an den Stand bringen soll. Eine leere Farbfläche fordert
 * niemanden auf, mit einem Menschen zu sprechen.
 *
 * Jetzt liegt das Orange als Farbschicht über zwei lachenden Zimmerleuten:
 * dieselbe Markenzone, aber mit Gesichtern darin. `mix-blend-multiply` behält
 * die Zeichnung des Fotos, statt es zuzukleistern.
 */
function Abschlussfeld() {
  const bild = useStepBild('M10')

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
      {/* Drei Schichten: `multiply` färbt ein, die halbdeckende darüber nimmt
          dem Foto Detail, und der Verlauf nach unten legt den Grund fest, auf
          dem das dunkle Panel steht. Ohne ihn schwimmt es auf einer Fläche, die
          genauso hell ist wie sein eigener Rand. */}
      {/* **Eine Lage Orange, nicht zwei.** Hier lagen `mix-blend-multiply`
          und darüber noch einmal `bg-kh-orange/40`. Das Multiply allein trägt
          die Markenzone schon; die zweite Lage legte sich als Deckfarbe
          darüber und machte aus dem Foto einen orangen Fleck, in dem kein
          Gesicht mehr zu erkennen war — auf dem Screen, der von Menschen am
          Stand handelt. Der Rest ist jetzt Tiefe statt Deckung. */}
      <div className="absolute inset-0 bg-kh-orange mix-blend-multiply" aria-hidden />
      <div className="absolute inset-0 bg-kh-orange/15" aria-hidden />
      <div
        className="absolute inset-0 bg-gradient-to-t from-[#0E0D0B]/75 via-transparent to-[#0E0D0B]/25"
        aria-hidden
      />
      {/* Die Paderborner Silhouette. Sie endet an ihrer eigenen Unterkante
          mit einer waagerechten Kante — die Grafik trägt dort eine
          Standlinie, und in `brightness-0` bei 22 % zog die quer durch den
          halben Screen. Die Maske lässt sie in den Grund auslaufen, statt
          abzubrechen. */}
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
