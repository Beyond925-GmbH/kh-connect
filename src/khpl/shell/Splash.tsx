import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { ArrowRight, ChevronRight, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/ui/logo'
import { STEPS } from '@/khpl/flow/steps'
import {
  machWeiter,
  nimmAuftragAn,
  starteKarriereSkip,
  useWiedereinstieg,
} from '@/khpl/store/fortschritt'
import { useStaffAusgang } from './staffAusgang'

/**
 * S0 — Start (khpl-ui-shell.md 2). Der Ruhezustand des Standes **und** der
 * Framing-Screen in einem.
 *
 * Vorher waren das zwei Screens: ein Attract-Splash auf `hero.mp4` und
 * dahinter die Auftragsannahme auf `szenario.mp4`. Beide randlos, beide
 * dunkles Bewegtbild mit Plakatzeile und einem Ziel unten — wer „Tippen zum
 * Starten“ drückte, bekam als Antwort denselben Screen mit anderem Text. Ein
 * Tap, der nichts sichtbar verändert, ist ein verlorener Tap: der erste
 * Eindruck war, die App hänge.
 *
 * Jetzt trägt ein Screen beide Aufgaben. Er muss aus drei Metern den Kopf
 * drehen (Bild, Plakatzeile, ein orangenes Ziel) und aus einem halben Meter
 * die Rolle setzen (Etikett, drei Sätze in-fiction, **[Auftrag annehmen]**).
 * Das geht, weil beides derselbe Blick ist — von weit nach nah, nicht von
 * Screen zu Screen.
 *
 * Bewegtbild ist dabei `szenario.mp4`: 52 Sekunden Montage aus vier Clips
 * statt der 10-Sekunden-Schleife von `hero.mp4`. Der Stand läuft stundenlang
 * im Ruhezustand — eine Schleife, die sechsmal pro Minute an derselben Stelle
 * neu ansetzt, liest sich aus der Halle als Standbild mit Ruckler.
 *
 * Erststart-Budget: bis zum sichtbaren Ziel ≤ 1,5 MB (flow 8.5). Deshalb trägt
 * der Screen zuerst nur das Poster (32 K); das Video wird erst **nach** dem
 * ersten Frame nachgeladen und blendet sich darüber. Wer sofort tippt, hat
 * schon gestartet, bevor es da ist. In Summe lädt der Stand jetzt weniger:
 * `hero.mp4` (1,4 MB) fällt ersatzlos weg.
 *
 * Er trägt den ersten der periodischen Karriere-Links (ui-shell 6). Wer ihn
 * hier nimmt, hat den Auftrag damit angenommen: die Rückkehr aus dem Skip
 * führt laut Zustandsmaschine auf S2, nicht hierher zurück.
 *
 * TEXT: `GEPRÜFT`. Die Spec gibt für das Framing nur die Haltung vor („Du bist
 * Azubi. Gerade kam eine Anfrage rein — nimmst du den Auftrag an?“), keinen
 * fertigen Wortlaut; der Wortlaut hier ist am 24.08.2026 abgenommen worden.
 */

const POSTER = '/medien/media/zimmerer/szenario-poster.webp'
const FILM = '/medien/media/zimmerer/szenario.mp4'

export function Splash() {
  const wiedereinstieg = useWiedereinstieg()
  const [videoBereit, setVideoBereit] = useState(false)
  const video = useRef<HTMLVideoElement>(null)
  const staffTap = useStaffAusgang()

  // Erst nachladen, wenn der Screen steht — sonst zählt das Video zum Erststart.
  const [ladeVideo, setLadeVideo] = useState(false)
  useEffect(() => {
    const id = window.setTimeout(() => setLadeVideo(true), 400)
    return () => window.clearTimeout(id)
  }, [])

  // Der Startscreen wird an einem Messetag dutzendfach auf- und abgebaut (jeder
  // Idle-Reset, jeder Sitzungsstart). WebKit gibt Decoder eines nur entfernten,
  // noch laufenden <video> nicht sofort frei, und die Zahl gleichzeitiger
  // Decoder ist auf iOS begrenzt — deshalb hier ausdrücklich abräumen.
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
    // Der ganze Screen ist das Startziel. Aus drei Metern zielt niemand auf
    // einen Knopf; der Knopf sagt nur, *was* passiert, wenn man hintippt.
    <div
      data-testid="splash"
      onClick={nimmAuftragAn}
      className="kh-screen flex flex-col overflow-hidden bg-kh-ink"
    >
      <motion.img
        src={POSTER}
        alt=""
        aria-hidden
        initial={{ scale: 1.06 }}
        animate={{ scale: 1.16 }}
        transition={{
          duration: 24,
          ease: 'linear',
          repeat: Infinity,
          repeatType: 'reverse',
        }}
        className="absolute inset-0 size-full object-cover"
      />
      {ladeVideo && (
        <video
          ref={video}
          src={FILM}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden
          onCanPlay={() => setVideoBereit(true)}
          className={`absolute inset-0 size-full object-cover transition-opacity duration-1000 ${
            videoBereit ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
      {/* Zwei Lagen: ein Verlauf, der die Schrift trägt, und ein warmer
          Farbstich in Markenorange, der die neutrale Aufnahme an die Palette
          bindet. */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0E0D0B] via-[#0E0D0B]/55 to-[#0E0D0B]/25" />
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(90%_70%_at_18%_100%,rgba(255,122,26,0.28),transparent_62%)]"
      />

      {/* Das Absperrband am unteren Rand. Ein einziges dekoratives Element im
          ganzen System — hier, weil dieser Screen zwei Sekunden Aufmerksamkeit
          gewinnen muss und ein Warnband aus drei Metern noch als „Baustelle“
          lesbar ist. */}
      <div aria-hidden className="kh-warnband absolute inset-x-0 bottom-0 h-1.5" />

      <div className="relative flex items-center justify-between gap-4 p-4 landscape:p-6">
        <div className="flex min-w-0 flex-wrap items-center gap-2.5">
          {/* Auf dem Logo liegt der Staff-Ausgang — fünf schnelle Taps, wie in
              ui-shell 8 beschrieben. `stopPropagation`, sonst startet der Tap
              zugleich eine neue Sitzung. */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              staffTap()
            }}
            aria-label="Kreishandwerkerschaft Paderborn-Lippe"
            className="w-fit shrink-0"
          >
            <Logo className="h-9 w-auto landscape:h-11" />
          </button>

          {/* Der Wiedereinstieg. Er stand vorher als zweiter Absatz mit eigenem
              Knopf unter dem Titel und stellte damit jedem neuen Besucher als
              erstes eine Frage nach einem Schritt, den er nie gesehen hat.
              Hier oben ist er das, was er ist: eine Ausnahme für den, der
              gerade weggeschaut hat. Grau, klein, neben der Marke — er darf
              „Auftrag annehmen“ nicht ansatzweise Konkurrenz machen. */}
          {wiedereinstieg && (
            <button
              type="button"
              data-testid="weitermachen"
              onClick={(e) => {
                e.stopPropagation()
                machWeiter()
              }}
              className="flex h-11 min-w-0 items-center gap-2 rounded-kh-pill bg-black/35 px-3.5 text-[0.9375rem] font-medium text-kh-paper/55 backdrop-blur-md transition-transform active:scale-95"
            >
              <RotateCcw className="size-4 shrink-0" strokeWidth={2} />
              {/* Unterhalb von 640 px bliebe vom Steptitel neben Marke und
                  Karriere-Link nichts als ein abgeschnittenes Wort übrig —
                  dort steht nur „Weiter“, und die Pille rutscht unter das Logo
                  (`flex-wrap` oben). Das Zielgerät ist ohnehin das iPad; das
                  ist die Notlösung fürs Telefon. */}
              <span className="shrink-0 sm:hidden">Weiter</span>
              <span className="hidden truncate sm:inline">
                Weiter bei „{STEPS[wiedereinstieg.currentStepId].titel}“
              </span>
            </button>
          )}
        </div>

        {/* „klein, textuell, in Grau, nicht als Button“ (ui-shell 6). Auf einem
            dunklen Video heißt Grau gedämpftes Weiß auf einer flachen Pille. */}
        <button
          type="button"
          data-testid="karriere-skip"
          onClick={(e) => {
            e.stopPropagation()
            nimmAuftragAn()
            starteKarriereSkip()
          }}
          className="flex h-11 shrink-0 items-center gap-1 rounded-kh-pill bg-black/35 px-4 text-[1rem] font-medium text-kh-paper/60 backdrop-blur-md transition-transform active:scale-95"
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
              „Dein erster Auftrag“ ist dabei kein Fortschrittszähler, sondern
              der Anfang einer Geschichte — und macht die Zeitangabe
              überflüssig, die ui-shell 1 ausdrücklich verbietet. */}
          <span className="kh-etikett flex items-center gap-2">
            <span aria-hidden className="h-[3px] w-7 rounded-full bg-kh-orange" />
            Dein erster Auftrag
          </span>
          <h1 className="kh-plakat">
            Bau heute
            <br />
            {/* Die zweite Zeile in Markenorange: der Titel bekommt damit einen
                Akzent, ohne dass irgendwo ein zweites Element nötig wäre. */}
            <span className="text-kh-orange">ein Dach.</span>
          </h1>
          <p className="text-[clamp(1.125rem,1.02rem+0.55vw,1.4rem)] leading-[1.45] text-kh-paper/85">
            Du bist Azubi in einer Zimmerei. Der Chef legt das Telefon weg und dreht sich
            zu dir um: altes Haus, das Dach muss neu. Er fragt, ob du mitkommst.
          </p>
        </div>

        {/* Der Knopf atmet. Vorher pulsierte auf dem Splash eine Hand neben
            „Tippen zum Starten“; jetzt gibt es nur noch ein Ziel, und das darf
            die Einladung selbst tragen. Kein Blinken — eine Fläche, die sich
            hebt und senkt, liest sich aus drei Metern als „hier anfassen“, eine
            blinkende als Defekt. Skaliert wird der Rahmen, nicht der Knopf:
            sein `active:translate-y` bliebe sonst gegen die Animation wirkungslos. */}
        <motion.div
          animate={{ scale: [1, 1.035, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          className="flex origin-left justify-start landscape:origin-right landscape:justify-end"
        >
          <Button
            onClick={nimmAuftragAn}
            variant="weiter"
            size="lg"
            data-testid="auftrag-annehmen"
            className="px-10 text-[1.25rem]"
          >
            Auftrag annehmen
            <ArrowRight className="size-5" strokeWidth={2.5} />
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}
