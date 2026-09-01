import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Hand, RotateCcw } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { Logo } from '@/components/ui/logo'
import { cn } from '@/lib/utils'
import { step } from '@/khpl/flow/steps'
import { beruf as berufDef } from '@/khpl/berufe/registry'
import { machWeiter, starteNeu, useWiedereinstieg } from '@/khpl/store/fortschritt'
import { useStaffAusgang } from './staffAusgang'

/**
 * Splash / Attract — der Ruhezustand des Standes.
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
 * Erststart-Budget: bis „Tippen zum Starten“ ≤ 1,5 MB. Deshalb trägt
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
 * **Der Loop deckt drei Gewerke ab, nicht vier**, und er ist mit 13 s kurz
 * für das, was er leisten soll. Was er braucht:
 *
 *  - **Dachdecker fehlt** — im ganzen Repo liegt dazu kein Bewegtbild.
 *  - **30–60 s statt 13.** Der Erststart trägt das: der Loop lädt erst 400 ms
 *    nach dem ersten Frame, bis dahin steht das Poster.
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
  const reduziert = useReducedMotion() ?? false
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
      {/* Der Ken-Burns-Zug über das Poster. Bei `prefers-reduced-motion`
          bleibt das Bild auf dem Startwert stehen — eine endlos zoomende
          Vollbildfläche ist genau die Bewegung, die diese Einstellung
          abschalten soll. */}
      <motion.img
        src={POSTER}
        alt=""
        aria-hidden
        initial={{ scale: 1.06 }}
        animate={reduziert ? { scale: 1.06 } : { scale: 1.16 }}
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
          {/* Auf dem Logo liegt der Staff-Ausgang — fünf schnelle Taps.
              `stopPropagation`, sonst startet der Tap zugleich eine neue
              Sitzung. */}
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
            initial={{ opacity: 0, transform: 'translateY(22px)' }}
            animate={{ opacity: 1, transform: 'translateY(0px)' }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="kh-plakat"
          >
            Vier Berufe
            <br />
            {/* Die zweite Zeile in Markenorange: der Titel bekommt damit einen
                Akzent, ohne dass irgendwo ein zweites Element nötig wäre.

                „Ein Tag“ und nicht „vier Tage“: versprochen wird, was ein
                Besucher am Stand tatsächlich tut — einer davon, ganz. Der
                Rest steht daneben und wartet. */}
            <span className="text-kh-orange">auf ganz neue Weise</span>
            <br />
            entdecken
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, transform: 'translateY(14px)' }}
            animate={{ opacity: 1, transform: 'translateY(0px)' }}
            transition={{ duration: 0.5, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            data-testid="tippen-zum-starten"
            className="relative"
          >
            {/* Der Einstieg als gefüllte Limette-Pille — die eine pro Screen,
                die „hier geht's weiter“ heißt (die Farbregel steht in
                `button.tsx`). Vorher: eine kleine orange Hand neben einer
                Textzeile in Fließtextgröße. Orange gehört aber der Welt, und
                auf diesem Screen ist alles orange — Verlauf, Titelakzent,
                Warnband. Die Einladung ging in ihrer eigenen Umgebung unter.
                Limette kommt sonst nirgends auf dem Splash vor; die Pille ist
                damit aus drei Metern das einzige, was „drück mich“ sagt.

                Gestylt über `buttonVariants({ variant: 'weiter' })`, nicht
                nachgebaut: Tastenschatten, Einsinken beim Drücken und die
                Farben kommen aus einer Quelle. Ein `<Button>` ist sie
                trotzdem nicht — der ganze Screen ist das Tippziel (`onClick`
                auf dem Wurzelelement), ein eigener Handler würde die Sitzung
                doppelt starten. Das `:active`-Einsinken greift dennoch, weil
                der Finger beim Tippen auf der Pille selbst landet.

                Sie atmet ruhig (Skalierung, kein Blinken — ein Ziel, das
                atmet, liest sich als „hier anfassen“); dahinter läuft ein
                leiser Lichtring nach außen. Skaliert wird der Rahmen, nicht
                die Pille — sonst bliebe ihr `active:translate-y` gegen die
                Animation wirkungslos (wie in `Auftragsannahme`). Beides steht
                bei `prefers-reduced-motion` still — Größe und Kontrast tragen
                die Botschaft dann allein. */}
            {!reduziert && (
              <motion.span
                aria-hidden
                animate={{ scale: [1, 1.16], opacity: [0.4, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut' }}
                className="absolute inset-0 rounded-kh-pill bg-kh-signal"
              />
            )}
            <motion.div
              animate={reduziert ? { scale: 1 } : { scale: [1, 1.035, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              className="relative"
            >
              <div
                className={cn(
                  buttonVariants({ variant: 'weiter' }),
                  'h-auto gap-4 px-8 py-4 text-[clamp(1.25rem,1.05rem+1.4vw,2.25rem)] landscape:px-10 landscape:py-5',
                )}
              >
                <Hand className="size-9 shrink-0 landscape:size-10" strokeWidth={2.25} />
                <span>Tippen zum Starten</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
