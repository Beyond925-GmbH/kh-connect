import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/ui/logo'
import { STEPS } from '@/khpl/flow/steps'
import { machWeiter, starteNeu, useWiedereinstieg } from '@/khpl/store/fortschritt'
import { StaffDialog, useStaffAusgang } from './KioskGuard'

/**
 * S0 — Splash / Attract (khpl-ui-shell.md 2). Der Ruhezustand des Standes.
 *
 * Erststart-Budget: bis „Tippen zum Starten“ ≤ 1,5 MB (flow 8.5). Deshalb
 * trägt der Screen zuerst nur das 44-KB-Poster; der 1,4-MB-Loop wird erst
 * **nach** dem ersten Frame nachgeladen und blendet sich dann darüber. Wer in
 * der ersten Sekunde tippt, hat schon gestartet, bevor das Video da ist.
 */

const POSTER = '/medien/media/shared/start-poster.webp'
const LOOP = '/medien/media/zimmerer/hero.mp4'

export function Splash() {
  const wiedereinstieg = useWiedereinstieg()
  const [videoBereit, setVideoBereit] = useState(false)
  const [staff, setStaff] = useState(false)
  const staffTap = useStaffAusgang(() => setStaff(true))

  // Erst nachladen, wenn der Screen steht — sonst zählt das Video zum Erststart.
  const [ladeVideo, setLadeVideo] = useState(false)
  useEffect(() => {
    const id = window.setTimeout(() => setLadeVideo(true), 400)
    return () => window.clearTimeout(id)
  }, [])

  const start = () => {
    if (wiedereinstieg) return
    starteNeu()
  }

  return (
    <div
      data-testid="splash"
      onClick={start}
      className="fixed inset-0 flex flex-col overflow-hidden bg-kh-ink"
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
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            staffTap()
          }}
          aria-label="Kreishandwerkerschaft Paderborn-Lippe"
          className="w-fit rounded-kh bg-white/90 px-3 py-2"
        >
          <Logo className="h-8 w-auto landscape:h-10" />
        </button>

        <div className="flex flex-col items-start gap-6">
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

          {wiedereinstieg ? (
            <div
              className="flex w-full flex-col gap-3 sm:flex-row"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                onClick={machWeiter}
                data-testid="weitermachen"
                className="h-[64px] px-8 text-[17px]"
              >
                Weitermachen bei „{STEPS[wiedereinstieg.currentStepId].titel}“
              </Button>
              <Button
                variant="outline"
                onClick={starteNeu}
                data-testid="neu-starten"
                className="h-[64px] border-white px-8 text-[17px] text-white hover:bg-white hover:text-kh-ink"
              >
                Neu starten
              </Button>
            </div>
          ) : (
            <motion.p
              animate={{ opacity: [0.55, 1, 0.55] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
              data-testid="tippen-zum-starten"
              className="text-[clamp(1.1rem,1rem+0.6vw,1.5rem)] font-light text-white"
            >
              Tippen zum Starten
            </motion.p>
          )}
        </div>
      </div>

      <StaffDialog offen={staff} onSchliessen={() => setStaff(false)} />
    </div>
  )
}
