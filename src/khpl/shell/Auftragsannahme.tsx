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
      className="kh-screen flex flex-col overflow-hidden bg-kh-ink"
    >
      <img
        src={BILD}
        alt=""
        aria-hidden
        className="absolute inset-0 size-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/55 to-black/30" />

      {/* „klein, textuell, in Grau, nicht als Button“ (ui-shell 6). Auf einem
          dunklen Foto heißt Grau nicht `text-kh-grey`, sondern gedämpftes Weiß —
          er darf hier auf keinen Fall mit „Auftrag annehmen“ konkurrieren. */}
      <div className="relative flex justify-end p-3 landscape:p-4">
        <button
          type="button"
          data-testid="karriere-skip"
          onClick={() => {
            nimmAuftragAn()
            starteKarriereSkip()
          }}
          className="flex h-[60px] items-center gap-0.5 rounded-kh px-3 text-[15px] font-light text-white/45 transition-colors hover:text-white/80"
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
          {/* Bindet die Werkstattaufnahme an den Anruf, statt ein Haus zu
              versprechen, das nicht im Bild ist: im Bestand gibt es kein
              einziges Ortstermin-Motiv (flow 13). */}
          <p className="text-[clamp(1.05rem,0.98rem+0.5vw,1.35rem)] leading-[1.5] font-light text-white/90">
            Der Chef legt das Telefon weg und dreht sich zu dir um. Altes Haus, das Dach
            muss neu. Er fragt, ob du mitkommst.
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
