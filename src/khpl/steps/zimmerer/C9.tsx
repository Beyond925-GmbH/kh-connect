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
 * C9 — Dein nächster Schritt. Der CTA und der Endpunkt dieses Tages
 * (khpl-tag-zimmerer.md 6, C9).
 *
 * **Unverändert nach dem Muster des gebauten Tages**, wie die Spec es verlangt.
 * Zweiteilig: erst der personalisierte Aufhänger, der aufgreift, was in C8
 * angesehen wurde — genau die `XYZ`-Logik des Boards —, dann der eigentliche
 * Aufruf, groß. Der Name kommt aus `public/stand.json` und fällt ohne
 * Konfiguration auf „Sprich jetzt mit uns am Stand“ zurück, nie auf einen
 * Platzhalter im Klartext.
 *
 * **Der ganze Screen ist orange.** Die Website schließt jede Seite mit einer
 * vollflächigen orangen Zone ab; an dieser Stelle endet die Rolle und spricht
 * wieder die Kreishandwerkerschaft. Deshalb steht hier auch das Logo, das die
 * App sonst nur auf dem Splash zeigt. **Genau ein orange gefülltes Feld pro
 * Screen** — hier ist es die ganze Fläche, und `text-[#0E0D0B]` darauf ist die
 * einzige erlaubte Ausnahme von der Farbregel (khpl-tage.md 3).
 *
 * **Der Aufhänger liest `answers.c8`, nicht `answers.m9`.** `m9` gehört dem
 * Dachdecker; die Trennung ist in `store/fortschritt.ts` im Zimmerer-Abschnitt
 * dokumentiert und in `C8x.tsx` begründet.
 *
 * Wer im Karriere-Skip bis hierher durchgeht, bekommt zusätzlich **[ Zurück zu
 * deinem Tag ]** — der Skip bleibt ein Abstecher, auch wenn er bis ans Ende
 * führt. „Noch einen Beruf“ ist der Weg nach vorn: wer einen ganzen Tag
 * durchgespielt hat, ist der Besucher mit der höchsten Wahrscheinlichkeit,
 * einen zweiten anzufangen. „Von vorn“ daneben ist der Knopf des Standpersonals
 * für den nächsten Besucher, nicht der des Besuchers.
 */
export function C9() {
  const fortschritt = useFortschritt()
  const stand = useStand()

  const angesehen = fortschritt.answers.c8?.angesehen ?? []
  const zuletzt = angesehen[angesehen.length - 1]
  const aufhaenger = (zuletzt && karriereweg(zuletzt)?.aufhaenger) || AUFHAENGER_OHNE
  const imSkip = fortschritt.detourReturnTo !== null

  return (
    <StepShell
      id="C9"
      interaktionOffen={false}
      buehne={<Abschlussfeld />}
      interaktion={
        <div className="flex flex-col gap-4">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            data-testid="c9-aufhaenger"
            className="text-[clamp(1.05rem,0.95rem+0.7vw,1.35rem)] leading-[1.4] text-kh-paper/80"
          >
            {aufhaenger}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            data-testid="c9-cta"
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
          {/* Das Logo steht im angehefteten Fuß und nicht unten im Inhalt: dort
              läge es unter dem Auslauf-Verlauf des Panels — ausgerechnet auf
              dem einen Screen, auf dem wieder die Kreishandwerkerschaft
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
              data-testid="c9-zurueck-zum-tag"
            >
              <ChevronLeft className="size-5" strokeWidth={2.25} />
              Zurück zu deinem Tag
            </Button>
          ) : null}
          <Button variant="neben" onClick={setzeZurueck} data-testid="c9-neu-starten">
            <RotateCcw className="size-5" strokeWidth={2.25} />
            Von vorn
          </Button>
          {!imSkip && (
            <Button variant="weiter" onClick={zeigeBerufe} data-testid="c9-noch-einen">
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
 * Das Abschlussfeld: die Markenzone, und darin ein Motiv, sobald es eines gibt.
 *
 * ⚠️ **Für C9 liegt heute keines im Repo.** Die Motive unter `media/zimmerer/`
 * gehören der Sache nach hierher und sind an den gebauten Dachdecker-Tag
 * vergeben, weil es kein einziges Dachdecker-Motiv gibt (khpl-tage.md 7). Der
 * Zimmerer-Agent nimmt sie ihm nicht weg; die Fläche trägt bis zur
 * Redaktionsentscheidung Orange und die Paderborner Silhouette, und
 * `useStepBild` blendet ein Foto ein, sobald `berufe/zimmerer.ts` eines für
 * `C9` führt. Gemeldeter Medienbedarf.
 *
 * Das Argument des gebauten Tages gilt unverändert: eine leere Farbfläche
 * fordert niemanden auf, mit einem Menschen zu sprechen. Deshalb ist das hier
 * eine Lücke und keine Gestaltung.
 */
function Abschlussfeld() {
  const bild = useStepBild('C9')

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
      {/* Eine Lage Orange, nicht zwei: `multiply` trägt die Markenzone und
          behält die Zeichnung des Fotos. Der Verlauf nach unten legt den Grund
          fest, auf dem das dunkle Panel steht. */}
      <div className="absolute inset-0 bg-kh-orange mix-blend-multiply" aria-hidden />
      <div className="absolute inset-0 bg-kh-orange/15" aria-hidden />
      <div
        className="absolute inset-0 bg-gradient-to-t from-[#0E0D0B]/75 via-transparent to-[#0E0D0B]/25"
        aria-hidden
      />
      {/* Die Paderborner Silhouette trägt an ihrer Unterkante eine Standlinie;
          die Maske lässt sie in den Grund auslaufen, statt sie als waagerechte
          Kante quer durch den halben Screen zu ziehen. */}
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
