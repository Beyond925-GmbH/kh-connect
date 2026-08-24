import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { Hand, RotateCcw } from 'lucide-react'
import { Logo } from '@/components/ui/logo'
import { step } from '@/khpl/flow/steps'
import { beruf as berufDef } from '@/khpl/berufe/registry'
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
 * Marke, Titel, „Tippen zum Starten“ — und bei vorhandenem Fortschritt oben
 * links eine leise Pille *Weiter bei …*.
 *
 * **Er ist wieder vom Auftragsscreen getrennt, und diesmal zu Recht.** Beide
 * waren kurzzeitig ein Screen, weil zwei randlose Videoscreens mit Plakatzeile
 * direkt hintereinander aus Besuchersicht derselbe Screen zweimal sind. Mit
 * den vier Berufen liegen sie nicht mehr hintereinander: dazwischen stehen
 * Helm, Fragen, Vorschlag und Berufsliste. Und das Framing („Du bist Azubi in
 * einer Zimmerei“) ist je Beruf ein anderes — es kann nicht auf einem Screen
 * stehen, der für alle vier wirbt.
 *
 * Erststart-Budget: bis „Tippen zum Starten“ ≤ 1,5 MB (flow 8.5). Deshalb trägt
 * der Screen zuerst nur das Poster; der Loop wird erst **nach** dem ersten Frame
 * nachgeladen und blendet sich darüber. Wer sofort tippt, hat schon gestartet,
 * bevor das Video da ist.
 */

/**
 * Der Attract-Loop über **alle** Berufe. Poster und Loop gehören zusammen:
 * `start-poster.webp` ist ausweislich `MEDIEN-INVENTAR.md` das Standbild zu
 * `start-loop.mp4`. Ein Poster aus einer anderen Aufnahme macht aus der
 * Überblendung einen harten Schnitt zwischen zwei fremden Bildern.
 *
 * ⚠️ **Der Loop deckt drei Gewerke ab, nicht vier**, und er ist mit 13 s kurz
 * für das, was er leisten soll. Was er braucht:
 *
 *  - **Dachdecker fehlt** — im ganzen Repo liegt dazu kein Bewegtbild.
 *  - **30–60 s statt 13.** Der Erststart trägt das: der Loop lädt erst 400 ms
 *    nach dem ersten Frame, bis dahin steht das Poster (flow 8.5).
 *  - **Die ersten acht Sekunden entscheiden.** Nur so lange schaut jemand hin,
 *    der vorbeigeht; alle vier Gewerke müssen darin vorkommen. Was danach
 *    kommt, darf ruhiger werden. Dazu: jeder Idle-Rückfall startet das Video
 *    neu, die zweite Hälfte eines langen Loops sieht an einem vollen Standtag
 *    also kaum jemand.
 *  - **Ein unsichtbarer Umbruch.** Erstes und letztes Bild aneinander
 *    angleichen oder beide auf Schwarz enden lassen, sonst liest sich der
 *    Rücksprung als GIF.
 *
 * Und: **`mp4` ist im Service Worker nirgends gecacht** (`vite.config.ts`,
 * `globPatterns`, keine Runtime-Regel). Bei 13 s verkraftbar, bei 60 s nicht —
 * ohne WLAN bleibt der Splash dann auf dem Poster stehen.
 */
const POSTER = '/medien/media/shared/start-poster.webp'
const LOOP = '/medien/media/shared/start-loop.mp4'

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

  const weitermachen = (() => {
    if (!wiedereinstieg) return null
    const b = berufDef(wiedereinstieg.beruf)
    if (!b.graph) return null
    return {
      beruf: b.kurz,
      titel: step(b.graph, wiedereinstieg.fortschritt.currentStepId).titel,
    }
  })()

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
              dem Einstieg nicht ansatzweise Konkurrenz machen.

              Mit vier Berufen steht der Beruf mit drin: „Halb zwölf“ allein
              sagt nicht, wessen Mittagspause gemeint ist. */}
          {weitermachen && (
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
              {/* Unterhalb von 640 px bliebe vom Steptitel neben der Marke
                  nichts als ein abgeschnittenes Wort übrig — dort steht nur
                  „Weiter“, und die Pille rutscht unter das Logo
                  (`flex-wrap` oben). Das Zielgerät ist ohnehin das iPad; das
                  ist die Notlösung fürs Telefon. */}
              <span className="shrink-0 sm:hidden">Weiter</span>
              <span className="hidden truncate sm:inline">
                Weiter: {weitermachen.beruf} — „{weitermachen.titel}“
              </span>
            </button>
          )}
        </div>

        <div className="flex flex-col items-start gap-6">
          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="kh-plakat"
          >
            Vier Berufe.
            <br />
            {/* Die zweite Zeile in Markenorange: der Titel bekommt damit einen
                Akzent, ohne dass irgendwo ein zweites Element nötig wäre.

                „Ein Tag“ und nicht „vier Tage“: versprochen wird, was ein
                Besucher am Stand tatsächlich tut — einer davon, ganz. Der
                Rest steht daneben und wartet. */}
            <span className="text-kh-orange">Ein Tag. Deiner.</span>
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
        </div>
      </div>
    </div>
  )
}
