import { ArrowRight, ChevronRight } from 'lucide-react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { nimmAuftragAn, starteKarriereSkip } from '@/khpl/store/fortschritt'

/**
 * S1 — Auftragsannahme (khpl-ui-shell.md 2 + 1).
 *
 * Der Framing-Screen. **In-fiction, ohne Meta-Erklärung, ohne Zeitangabe.**
 * Keine Zeile „das dauert 4 Minuten“, keine Erklärung, was die App ist —
 * wer am Stand vorbeigeht, steigt in eine Geschichte ein, nicht in ein Produkt.
 *
 * Er trägt den ersten der periodischen Karriere-Links (ui-shell 6). Wer ihn
 * hier nimmt, hat den Auftrag damit angenommen: die Rückkehr aus dem Skip
 * führt laut Zustandsmaschine auf S2, nicht zurück auf S1.
 *
 * TEXT: `ENTWURF – UNGEPRÜFT`. Die Spec gibt für diesen Screen nur die Haltung
 * vor („Du bist Azubi. Gerade kam eine Anfrage rein — nimmst du den Auftrag
 * an?“), keinen fertigen Wortlaut.
 */

const BILD = '/medien/media/zimmerer/hero-poster.webp'

export function Auftragsannahme() {
  return (
    <div
      data-testid="auftragsannahme"
      className="fixed inset-0 flex flex-col overflow-hidden bg-kh-ink"
    >
      <img
        src={BILD}
        alt=""
        aria-hidden
        className="absolute inset-0 size-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/55 to-black/30" />

      <div className="relative flex justify-end p-3 landscape:p-4">
        <button
          type="button"
          data-testid="karriere-skip"
          onClick={() => {
            nimmAuftragAn()
            starteKarriereSkip()
          }}
          className="flex h-11 items-center gap-0.5 rounded-kh px-3 text-[15px] text-white/70 transition-colors hover:text-white"
        >
          Karriere-Wege
          <ChevronRight className="size-4" strokeWidth={1.5} />
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex min-h-0 flex-1 flex-col justify-end gap-6 p-6 landscape:p-10"
      >
        <div className="flex max-w-[46rem] flex-col gap-4">
          <p className="text-[clamp(1.6rem,1.2rem+1.9vw,2.6rem)] leading-[1.1] font-bold text-white">
            Du bist Azubi in einer Zimmerei.
          </p>
          <p className="text-[clamp(1.05rem,0.98rem+0.5vw,1.35rem)] leading-[1.5] font-light text-white/90">
            Gerade kam eine Anfrage rein. Ein altes Dach, eine Familie, die noch nicht
            weiß, was auf sie zukommt. Vom ersten Anruf bis zu dem Moment, in dem der
            Dachstuhl steht — ab jetzt ist das dein Auftrag.
          </p>
        </div>

        <div className="flex justify-start landscape:justify-end">
          <Button
            onClick={nimmAuftragAn}
            data-testid="auftrag-annehmen"
            className="h-[64px] px-9 text-[18px]"
          >
            Auftrag annehmen
            <ArrowRight className="size-5" strokeWidth={1.75} />
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
