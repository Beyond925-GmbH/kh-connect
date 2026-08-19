import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { Hand } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/ui/logo'
import { STEPS } from '@/khpl/flow/steps'
import { machWeiter, starteNeu, useWiedereinstieg } from '@/khpl/store/fortschritt'
import { useStaffAusgang } from './staffAusgang'

/**
 * S0 — Splash / Attract (khpl-ui-shell.md 2). Der Ruhezustand des Standes.
 *
 * Der Screen hat genau eine Aufgabe: jemanden, der drei Meter entfernt
 * vorbeigeht, dazu bringen, den Kopf zu drehen. Deshalb ist er der einzige im
 * ganzen Ablauf, der **randlos** ist — kein Panel, keine Leiste, nur Bewegtbild
 * und drei Zeilen darauf.
 *
 * Marke, Titel, „Tippen zum Starten“ — und bei vorhandenem Fortschritt
 * **zusätzlich** Weitermachen / Neu starten. Zusätzlich, nicht anstelle: sonst
 * bekäme ein neuer Besucher als erstes eine Frage nach einem Schritt gestellt,
 * den er nie gesehen hat, und keinen offensichtlichen Weg hinein.
 *
 * Erststart-Budget: bis „Tippen zum Starten“ ≤ 1,5 MB (flow 8.5). Deshalb trägt
 * der Screen zuerst nur das Poster; der Loop wird erst **nach** dem ersten Frame
 * nachgeladen und blendet sich darüber. Wer sofort tippt, hat schon gestartet,
 * bevor das Video da ist.
 */

/**
 * Poster und Loop gehören zusammen — `hero-poster.webp` ist ausweislich
 * `INVENTAR.md` das Standbild genau zu `hero.mp4`. (Das naheliegendere
 * `shared/start-poster.webp` ist das Poster zum *Start-Loop* über alle drei
 * Gewerke und zeigt eine andere Szene; die Ueberblendung wäre ein harter
 * Schnitt zwischen zwei fremden Aufnahmen.)
 */
const POSTER = '/medien/media/zimmerer/hero-poster.webp'
const LOOP = '/medien/media/zimmerer/hero.mp4'

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

  // Der Splash wird an einem Messetag dutzendfach auf- und abgebaut (jeder
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
    <div
      data-testid="splash"
      onClick={starteNeu}
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
          src={LOOP}
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
          Farbstich in Markenorange, der die neutrale Werkstattaufnahme an die
          Palette bindet. */}
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

      <div className="relative flex min-h-0 flex-1 flex-col justify-between p-6 landscape:p-10">
        {/* `self-start`, sonst zieht die Flex-Spalte das Bild auf volle Breite.
            Auf dem Logo liegt der Staff-Ausgang — fünf schnelle Taps, wie in
            ui-shell 8 beschrieben. `stopPropagation`, sonst startet der Tap
            zugleich eine neue Sitzung. */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            staffTap()
          }}
          aria-label="Kreishandwerkerschaft Paderborn-Lippe"
          className="w-fit self-start"
        >
          <Logo className="h-9 w-auto landscape:h-11" />
        </button>

        <div className="flex flex-col items-start gap-6">
          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="kh-plakat"
          >
            Bau heute
            <br />
            {/* Die zweite Zeile in Markenorange: der Titel bekommt damit einen
                Akzent, ohne dass irgendwo ein zweites Element nötig wäre. */}
            <span className="text-kh-orange">ein Dach.</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            data-testid="tippen-zum-starten"
            className="flex items-center gap-3.5"
          >
            {/* Die pulsierende Hand ist die Einladung. Vorher pulsierte die
                Textzeile selbst zwischen 55 % und 100 % Deckkraft — aus drei
                Metern ist eine blinkende Zeile nicht von einer flackernden zu
                unterscheiden. Ein Ziel, das atmet, liest sich als „hier
                anfassen“. */}
            <motion.span
              aria-hidden
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="grid size-14 shrink-0 place-items-center rounded-full bg-kh-orange text-[#0E0D0B] animate-puls"
            >
              <Hand className="size-7" strokeWidth={2.25} />
            </motion.span>
            <span className="text-[clamp(1.25rem,1.05rem+0.8vw,1.75rem)] font-semibold text-kh-paper">
              Tippen zum Starten
            </span>
          </motion.div>

          {wiedereinstieg && (
            <div
              className="flex flex-col items-start gap-2.5"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-[1rem] text-kh-paper/50">
                Oder da weiter, wo jemand aufgehört hat:
              </p>
              <Button
                variant="neben"
                onClick={machWeiter}
                data-testid="weitermachen"
                className="max-w-[min(34rem,86vw)] justify-start"
              >
                <span className="truncate">
                  Weitermachen bei „{STEPS[wiedereinstieg.currentStepId].titel}“
                </span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
