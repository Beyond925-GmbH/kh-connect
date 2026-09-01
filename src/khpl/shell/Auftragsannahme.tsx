import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, ChevronRight } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { beruf as berufDef } from '@/khpl/berufe/registry'
import {
  nimmAuftragAn,
  starteKarriereSkip,
  useAktiverBeruf,
  zeigeBerufe,
} from '@/khpl/store/fortschritt'

/**
 * Auftragsannahme, seit dem Umbau in **drei Takten**.
 *
 * **Die alte Haltung „in-fiction, ohne Meta-Erklärung“ ist bewusst
 * aufgegeben.** Sie stand hier lange als Prinzip — wer vorbeigeht, steigt in
 * eine Geschichte ein, nicht in ein Produkt. Am Stand zeigte sich der Preis:
 * viele fingen den ersten Step an, ohne zu wissen, was der Beruf überhaupt
 * ist. „Du bist Azubi in der Zerspanung“ setzt voraus, was eine
 * Vierzehnjährige gerade nicht hat — ein Bild von diesem Beruf. Deshalb
 * erklärt der Screen jetzt erst und erzählt dann:
 *
 * 1. **Takt „beruf“** (Meta, die App spricht): „Du hast dir X ausgesucht“ —
 *    was der Beruf ist, plus zwei bis vier typische Aufgaben.
 * 2. **Takt „ort“** (Meta, beschreibend): wo in diesem Beruf gearbeitet wird
 *    und wie es dort ist. Bewusst ohne „du arbeitest“ — die Rollenzuweisung
 *    ist der Auftritt des dritten Takts und wird hier nicht verbraucht.
 * 3. **Takt „auftrag“** (Fiktion, unverändert `beruf.auftrag`): „Du bist
 *    Azubi …“ — der Knopf nimmt den Auftrag an und startet den ersten Step.
 *
 * Für die Zustandsmaschine ist das weiterhin **ein** Screen (`'intro'`); die
 * Takte sind lokaler State. Drei Kerben zeigen, wo man steht (dieselbe Form
 * wie in `Fragen`). „Alle Berufe“ steht auf **jedem** Takt — wer auf Takt 3
 * merkt, dass der Beruf nichts für ihn ist, soll mit einem Tap zur Liste
 * können, nicht mit dreien. Ab Takt 2 kommt daneben ein „Zurück“ zum
 * Blättern.
 *
 * **Zwei Zeiger, ein Grund.** `ziel` ist der Takt, zu dem gewechselt wird;
 * `sichtbar` der, der wirklich steht, nachgezogen erst in `onExitComplete`.
 * Kerben und Kopfzeile lesen `sichtbar`: läsen sie `ziel`, sprängen sie im
 * Tap-Moment um, während der alte Text noch 0,4 s lang hinausläuft. Und die
 * Tap-Ziele rechnen von `sichtbar` aus — zwei schnelle Taps auf „Weiter“
 * während der Exit-Animation sind so **ein** Schritt, kein Sprung über einen
 * Takt (der Doppel-Tap-Klassiker am Messestand).
 *
 * **Das Video liegt hinter allen drei Takten**, nicht nur hinter dem letzten:
 * es ist eine durchlaufende Szene, vor der der Text wechselt. Ein
 * Medienwechsel je Takt würde bei jedem Tap den Ladevorhang neu ziehen — und
 * die Takte sollen sich wie Blättern anfühlen, nicht wie Screenwechsel.
 *
 * **Bewegtbild statt Standbild** (unverändert): Vorher lag hier dasselbe
 * Posterframe wie auf dem Splash — der erste Tap fühlte sich an, als wäre
 * nichts passiert. Jetzt läuft `szenario.mp4` hinter demselben Vorhang wie
 * auf dem Splash: erst das Poster, das Bewegtbild kommt nachgeladen darüber.
 *
 * Der Screen trägt den ersten der periodischen Karriere-Links, auf allen
 * Takten. Wer ihn nimmt, hat den Auftrag damit angenommen: die Rückkehr aus
 * dem Skip führt laut Zustandsmaschine in den ersten Step, nicht zurück auf
 * die Auftragsannahme.
 *
 * **Fallbacks:** Ohne `beruf.vorstellung` gibt es nur den Fiktions-Takt —
 * der Screen verhält sich dann wie vor dem Umbau. Ohne `beruf.auftrag` trägt
 * der Fiktions-Takt einen neutralen Text. Beides aus demselben Grund: ein
 * Beruf soll begehbar sein, sobald sein Graph steht, auch wenn Copy fehlt.
 *
 * Die Etiketten entstehen hier; Titel und Berufsinhalte kommen aus
 * `beruf.vorstellung` und `beruf.auftrag`.
 */

/** Die Reihenfolge der Takte. Ohne `vorstellung`-Daten bleibt nur die Fiktion. */
type Takt = 'beruf' | 'ort' | 'auftrag'

export function Auftragsannahme() {
  const berufId = useAktiverBeruf()
  const beruf = berufId ? berufDef(berufId) : null
  const reduziert = useReducedMotion() ?? false
  const [videoBereit, setVideoBereit] = useState(false)
  const [ladeVideo, setLadeVideo] = useState(false)
  const video = useRef<HTMLVideoElement>(null)

  const vorstellung = beruf?.vorstellung ?? null
  const takte: readonly Takt[] = vorstellung ? ['beruf', 'ort', 'auftrag'] : ['auftrag']
  /** Wohin gewechselt wird — bestimmt den Inhalt, der als Nächstes einfährt. */
  const [ziel, setZiel] = useState(0)
  /** Was wirklich steht — trägt Kerben und Kopfzeile (Begründung oben). */
  const [sichtbar, setSichtbar] = useState(0)
  const takt = takte[Math.min(ziel, takte.length - 1)]
  const letzter = takt === 'auftrag'

  const poster = beruf?.medien.szenarioPoster ?? beruf?.medien.heroPoster ?? ''
  const loop = beruf?.medien.szenario ?? beruf?.medien.hero ?? null
  const auftrag = beruf?.auftrag ?? {
    etikett: 'Dein erster Auftrag',
    titel: ['Du bist Azubi', `— ${beruf?.kurz ?? ''}.`] as const,
    text: 'Gerade kam eine Anfrage rein. Kommst du mit?',
    knopf: 'Auftrag annehmen',
  }

  /**
   * Tap-Ziele rechnen von `sichtbar` aus und klemmen an den Rändern: solange
   * der alte Takt hinausläuft, ergibt jeder weitere Tap dasselbe Ziel —
   * idempotent statt kumulativ, und nie außerhalb von `takte`.
   */
  const einenWeiter = () => setZiel(Math.min(sichtbar + 1, takte.length - 1))
  const einenZurueck = () => setZiel(Math.max(sichtbar - 1, 0))

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

  /** Der Inhalt des Ziel-Takts — Etikett, zwei Zeilen, Fließtext. */
  const inhalt =
    takt === 'beruf' && vorstellung
      ? {
          etikett: 'Deine Wahl',
          titel: vorstellung.titel,
          text: vorstellung.was,
        }
      : takt === 'ort' && vorstellung
        ? {
            // „Der“, nicht „Dein“: Takt 2 beschreibt, er besetzt noch keine
            // Rolle (siehe Kopfkommentar, Takt „ort“).
            etikett: 'Der Arbeitsplatz',
            titel: vorstellung.umgebung.titel,
            text: vorstellung.umgebung.text,
          }
        : {
            etikett: auftrag.etikett,
            titel: auftrag.titel,
            text: auftrag.text,
          }

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

      {/* Klein, textuell, in Grau, nicht als Button. Auf einem
          dunklen Video heißt Grau gedämpftes Weiß auf einer flachen Pille —
          er darf hier auf keinen Fall mit „Auftrag annehmen“ konkurrieren, muss
          aber trotzdem als antippbar zu erkennen sein. */}
      <div className="relative flex justify-between gap-2 p-3 landscape:p-4">
        <div className="flex gap-2">
          {/* Der Rückweg zur Liste, **auf jedem Takt**: wer hier steht, hat
              den Beruf noch nicht angefangen, und die Tür zurück zu den
              anderen dreien darf weder ein Umweg über den Splash noch ein
              dreifaches „Zurück“ sein. */}
          <button
            type="button"
            data-testid="zurueck-zur-liste"
            onClick={zeigeBerufe}
            className="flex h-[52px] items-center gap-1.5 rounded-kh-pill bg-black/35 px-4 text-[1rem] font-medium text-kh-paper/60 backdrop-blur-md transition-transform active:scale-95"
          >
            <ArrowLeft className="size-4" strokeWidth={2} />
            Alle Berufe
          </button>
          {/* Ab Takt 2: einen Takt zurückblättern. Sichtbarkeit hängt an
              `sichtbar`, nicht an `ziel` — sonst erschiene die Pille schon,
              während der erste Takt noch hinausläuft. */}
          {sichtbar > 0 && (
            <button
              type="button"
              data-testid="takt-zurueck"
              onClick={einenZurueck}
              className="flex h-[52px] items-center gap-1.5 rounded-kh-pill bg-black/35 px-4 text-[1rem] font-medium text-kh-paper/60 backdrop-blur-md transition-transform active:scale-95"
            >
              <ArrowLeft className="size-4" strokeWidth={2} />
              Zurück
            </button>
          )}
        </div>
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

      <div className="relative flex min-h-0 flex-1 flex-col justify-end gap-6 p-6 landscape:p-10">
        {/* Die Kerben — dieselbe Form wie in `Fragen`: der aktuelle Takt als
            langer oranger Strich, Erledigtes halb, Kommendes blass. Bei nur
            einem Takt (Beruf ohne `vorstellung`) entfallen sie: eine einzelne
            Kerbe wäre ein Fortschritt, den es nicht gibt. */}
        {takte.length > 1 && (
          <span data-testid="intro-takte" className="flex items-center gap-1.5">
            {takte.map((t, i) => (
              <span
                key={t}
                aria-hidden
                className={`h-2 rounded-full ${
                  reduziert ? '' : 'transition-all duration-300'
                } ${
                  i === sichtbar
                    ? 'w-7 bg-kh-orange'
                    : i < sichtbar
                      ? 'w-2 bg-kh-orange/50'
                      : 'w-2 bg-white/18'
                }`}
              />
            ))}
            <span className="sr-only">
              Teil {sichtbar + 1} von {takte.length}
            </span>
          </span>
        )}

        <AnimatePresence mode="wait" onExitComplete={() => setSichtbar(ziel)}>
          <motion.div
            key={takt}
            data-testid={`intro-takt-${takt}`}
            initial={
              reduziert ? { opacity: 0 } : { opacity: 0, transform: 'translateY(22px)' }
            }
            animate={
              reduziert ? { opacity: 1 } : { opacity: 1, transform: 'translateY(0px)' }
            }
            exit={
              reduziert ? { opacity: 0 } : { opacity: 0, transform: 'translateY(-14px)' }
            }
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-6"
          >
            <div className="flex max-w-[44rem] flex-col gap-4">
              {/* Auf Takt 3 setzt das Etikett die Rolle, bevor der erste Satz
                  sie behauptet. „Tag 1“ wäre dabei kein Fortschrittszähler,
                  sondern der Anfang einer Geschichte. Eine Zeitangabe, die
                  den Tag als Pensum ausweist, bleibt draußen. */}
              <h1 className="kh-plakat">
                {inhalt.titel[0] ? inhalt.titel[0] : ''}
                {inhalt.titel[0] ? <br /> : null}
                <span className="text-kh-orange">{inhalt.titel[1]}</span>
              </h1>
              <p className="text-[clamp(1.125rem,1.02rem+0.55vw,1.4rem)] leading-[1.45] text-kh-paper/85">
                {inhalt.text}
              </p>
              {/* Die Aufgabenliste des ersten Takts. Kein Bullet-Zoo: derselbe
                  kurze orange Strich wie am Etikett, damit die Liste als Teil
                  des Screens liest und nicht als Broschürenkasten. */}
              {takt === 'beruf' && vorstellung && (
                <ul
                  data-testid="intro-aufgaben"
                  className="flex flex-col gap-2 text-[clamp(1.05rem,0.98rem+0.4vw,1.25rem)] leading-[1.4] text-kh-paper/85"
                >
                  {vorstellung.aufgaben.map((aufgabe) => (
                    <li key={aufgabe} className="flex items-baseline gap-2.5">
                      <span
                        aria-hidden
                        className="h-[3px] w-4 shrink-0 translate-y-[-0.2em] rounded-full bg-kh-orange"
                      />
                      {aufgabe}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Nur der letzte Knopf atmet: er ist die Entscheidung, die beiden
                Weiter-Knöpfe davor sind Blättern. Kein Blinken — eine Fläche,
                die sich hebt und senkt, liest sich aus drei Metern als „hier
                anfassen“, eine blinkende als Defekt. Skaliert wird der Rahmen,
                nicht der Knopf: sein `active:translate-y` bliebe sonst gegen
                die Animation wirkungslos. */}
            <motion.div
              animate={letzter && !reduziert ? { scale: [1, 1.035, 1] } : { scale: 1 }}
              transition={
                letzter && !reduziert
                  ? { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }
                  : { duration: 0 }
              }
              className="flex origin-left justify-start landscape:origin-right landscape:justify-end"
            >
              {letzter ? (
                <Button
                  onClick={nimmAuftragAn}
                  variant="weiter"
                  size="lg"
                  data-testid="auftrag-annehmen"
                  className="px-10 text-[1.25rem]"
                >
                  {auftrag.knopf}
                  <ArrowRight className="size-5" strokeWidth={2.5} />
                </Button>
              ) : (
                <Button
                  onClick={einenWeiter}
                  variant="weiter"
                  size="lg"
                  data-testid="takt-weiter"
                  className="px-10 text-[1.25rem]"
                >
                  Weiter
                  <ArrowRight className="size-5" strokeWidth={2.5} />
                </Button>
              )}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
