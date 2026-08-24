import { useEffect, useRef, useState } from 'react'
import { ArrowRight, ChevronRight } from 'lucide-react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { beruf as berufDef } from '@/khpl/berufe/registry'
import {
  nimmAuftragAn,
  starteKarriereSkip,
  useAktiverBeruf,
} from '@/khpl/store/fortschritt'

/**
 * S1 — Auftragsannahme (khpl-ui-shell.md 2 + 1).
 *
 * Der Framing-Screen. **In-fiction, ohne Meta-Erklärung, ohne Zeitangabe.**
 * Keine Zeile „das dauert 4 Minuten“, keine Erklärung, was die App ist —
 * wer am Stand vorbeigeht, steigt in eine Geschichte ein, nicht in ein Produkt.
 *
 * **Bewegtbild statt Standbild.** Vorher lag hier dasselbe Posterframe wie auf
 * dem Splash: wer „Tippen zum Starten“ druckte, sah als Ergebnis exakt
 * denselben Screen mit anderem Text — der erste Tap fühlte sich an, als wäre
 * nichts passiert. Jetzt läuft `szenario.mp4`, eine andere Aufnahme, und der
 * Screen beantwortet den Tap mit einem Schnitt.
 *
 * Das Video hängt hinter demselben Vorhang wie auf dem Splash: erst das
 * Poster, das Bewegtbild kommt nachgeladen darüber. Wer sofort weitertippt,
 * hat den Auftrag angenommen, bevor es da ist.
 *
 * Er trägt den ersten der periodischen Karriere-Links (ui-shell 6). Wer ihn
 * hier nimmt, hat den Auftrag damit angenommen: die Rückkehr aus dem Skip
 * führt laut Zustandsmaschine auf S2, nicht zurück auf S1.
 *
 * TEXT: `ENTWURF – UNGEPRÜFT`. Die Spec gibt für diesen Screen nur die Haltung
 * vor („Du bist Azubi. Gerade kam eine Anfrage rein — nimmst du den Auftrag
 * an?“), keinen fertigen Wortlaut.
 *
 * **Text und Motiv kommen seit den vier Berufen aus `beruf.auftrag`.** Der
 * Screen ist die Stelle, an der die Fiktion gesetzt wird, und die ist je Beruf
 * eine andere: „Du bist Azubi in einer Zimmerei“ gilt nicht für die CNC-Halle.
 * Ohne `auftrag` fällt er auf einen neutralen Wortlaut zurück — ein Beruf soll
 * begehbar sein, sobald sein Graph steht, auch wenn die Copy noch fehlt.
 */

export function Auftragsannahme() {
  const berufId = useAktiverBeruf()
  const beruf = berufId ? berufDef(berufId) : null
  const [videoBereit, setVideoBereit] = useState(false)
  const [ladeVideo, setLadeVideo] = useState(false)
  const video = useRef<HTMLVideoElement>(null)

  const poster = beruf?.medien.szenarioPoster ?? beruf?.medien.heroPoster ?? ''
  const loop = beruf?.medien.szenario ?? beruf?.medien.hero ?? null
  const text = beruf?.auftrag ?? {
    etikett: 'Dein erster Auftrag',
    titel: ['Du bist Azubi', `— ${beruf?.kurz ?? ''}.`] as const,
    text: 'Gerade kam eine Anfrage rein. Kommst du mit?',
    knopf: 'Auftrag annehmen',
  }

  useEffect(() => {
    const id = window.setTimeout(() => setLadeVideo(true), 250)
    return () => window.clearTimeout(id)
  }, [])

  // Wie auf dem Splash: iOS gibt Video-Decoder eines entfernten, noch
  // laufenden Elements nicht sofort frei.
  useEffect(
    () => () => {
      const v = video.current
      if (!v) return
      v.pause()
      v.removeAttribute('src')
      v.load()
    },
    [],
  )

  return (
    <div
      data-testid="auftragsannahme"
      className="kh-screen flex flex-col overflow-hidden bg-kh-ink"
    >
      <img
        src={poster}
        alt=""
        aria-hidden
        className="absolute inset-0 size-full object-cover"
      />
      {ladeVideo && loop && (
        <video
          ref={video}
          src={loop}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden
          onCanPlay={() => setVideoBereit(true)}
          className={`absolute inset-0 size-full object-cover transition-opacity duration-700 ${
            videoBereit ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0E0D0B] via-[#0E0D0B]/60 to-[#0E0D0B]/25" />

      {/* „klein, textuell, in Grau, nicht als Button“ (ui-shell 6). Auf einem
          dunklen Video heißt Grau gedämpftes Weiß auf einer flachen Pille —
          er darf hier auf keinen Fall mit „Auftrag annehmen“ konkurrieren, muss
          aber trotzdem als antippbar zu erkennen sein. */}
      <div className="relative flex justify-end p-3 landscape:p-4">
        <button
          type="button"
          data-testid="karriere-skip"
          onClick={() => {
            nimmAuftragAn()
            starteKarriereSkip()
          }}
          className="flex h-[52px] items-center gap-1 rounded-kh-pill bg-black/35 px-4 text-[1rem] font-medium text-kh-paper/60 backdrop-blur-md transition-transform active:scale-95"
        >
          Karriere-Wege
          <ChevronRight className="size-4" strokeWidth={2} />
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex min-h-0 flex-1 flex-col justify-end gap-6 p-6 landscape:p-10"
      >
        <div className="flex max-w-[44rem] flex-col gap-4">
          {/* Das Etikett setzt die Rolle, bevor der erste Satz sie behauptet.
              „Tag 1“ ist dabei kein Fortschrittszähler, sondern der Anfang
              einer Geschichte — und macht die Zeitangabe überflüssig, die
              ui-shell 1 ausdrücklich verbietet. */}
          <span className="kh-etikett flex items-center gap-2">
            <span aria-hidden className="h-[3px] w-7 rounded-full bg-kh-orange" />
            {text.etikett}
          </span>
          <h1 className="kh-plakat">
            {text.titel[0]}
            <br />
            <span className="text-kh-orange">{text.titel[1]}</span>
          </h1>
          {/* Bindet die Werkstattaufnahme an den Anruf, statt ein Haus zu
              versprechen, das nicht im Bild ist. Der Ortstermin selbst hat
              inzwischen ein eigenes Motiv — es steht in M1, wo er stattfindet. */}
          <p className="text-[clamp(1.125rem,1.02rem+0.55vw,1.4rem)] leading-[1.45] text-kh-paper/85">
            {text.text}
          </p>
        </div>

        <div className="flex justify-start landscape:justify-end">
          <Button
            onClick={nimmAuftragAn}
            variant="weiter"
            size="lg"
            data-testid="auftrag-annehmen"
            className="px-10 text-[1.25rem]"
          >
            {text.knopf}
            <ArrowRight className="size-5" strokeWidth={2.5} />
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
