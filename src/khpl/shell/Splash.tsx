import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/ui/logo'
import { STEPS } from '@/khpl/flow/steps'
import { machWeiter, starteNeu, useWiedereinstieg } from '@/khpl/store/fortschritt'
import { useStaffAusgang } from './staffAusgang'

/**
 * S0 — Splash / Attract (khpl-ui-shell.md 2). Der Ruhezustand des Standes.
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
 * Gewerke und zeigt eine andere Szene; die Überblendung wäre ein harter
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
        animate={{ scale: 1.14 }}
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
      {/* Deckender Verlauf, damit die dünne Barlow 200 über dem Bild trägt. */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/25" />

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
          className="w-fit self-start rounded-kh bg-white/90 px-3 py-2"
        >
          <Logo className="h-8 w-auto landscape:h-10" />
        </button>

        <div className="flex flex-col items-start gap-5">
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-[clamp(2.6rem,1.6rem+4.4vw,5rem)] leading-[0.98] font-bold text-white uppercase"
          >
            Bau heute
            <br />
            ein Dach.
          </motion.h1>

          <motion.p
            animate={{ opacity: [0.55, 1, 0.55] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
            data-testid="tippen-zum-starten"
            className="text-[clamp(1.1rem,1rem+0.6vw,1.5rem)] font-light text-white"
          >
            Tippen zum Starten
          </motion.p>

          {wiedereinstieg && (
            <div
              className="mt-1 flex flex-col items-start gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-[1.0625rem] text-white/60">
                Oder da weiter, wo jemand aufgehört hat:
              </p>
              <Button
                variant="outline"
                onClick={machWeiter}
                data-testid="weitermachen"
                className="h-[60px] border-white/70 px-7 text-[1.125rem] text-white hover:bg-white hover:text-kh-ink"
              >
                Weitermachen bei „{STEPS[wiedereinstieg.currentStepId].titel}“
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
