import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { StepFoto } from '@/khpl/buehne/Foto'
import { mm, STAHL, TEIL } from '@/khpl/buehne/zerspanung/kanon'
import { AhaKarte } from '@/khpl/komponenten/AhaKarte'
import { Rueckmeldung } from '@/khpl/komponenten/Rueckmeldung'
import { Wahlflaeche } from '@/khpl/komponenten/Wahlflaeche'
import { Wechsel } from '@/khpl/komponenten/Wechsel'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { merkeAntwort, useFortschritt } from '@/khpl/store/fortschritt'

/**
 * Z6 — Jetzt macht sie es 200-mal. **Die Belohnung und die Abfrage in
 * einem:** der Zähler läuft, die Kiste füllt sich — und mittendrin wandert
 * das Maß, weil die Schneide sich abnutzt.
 *
 * Das ist die zweite Hälfte des Lernpaars zu Z4 (Teach → Abfrage, wie
 * M5 → M7 beim Dachdecker): dort hat der Besucher gelernt, in Hundertsteln
 * zu korrigieren — hier wendet er es an, ohne dass es ihm noch einmal
 * erklärt wird. Die Stichprobe bei Stück 40 sagt „passt“, die bei Stück 120
 * zeigt den Trend; wer nicht reagiert, bekommt bei Stück 140 die Folge
 * (zwanzig Teile nachdrehen — Zeit, kein Schrott) und darf dann handeln.
 *
 * **Beide Korrekturen sind richtig, auf zwei Arten:** −0,01 stellt die
 * Fenstermitte her, −0,02 legt das Maß mit Absicht ans untere Ende — so
 * hält die Korrektur am längsten, weil der Verschleiß nach oben wandert.
 * Es gibt hier kein Falsch, nur zwei Temperamente.
 *
 * **Fachlich:** Werkzeugverschleiß beim Außendrehen macht das Teil
 * **größer** (die Schneide trägt weniger ab), deshalb wandert das Maß nach
 * oben — und deshalb prüft eine Fertigung Stichproben statt jedes Teil.
 *
 * **`answers.z6`** `{ stueck, nachkorrigiert, stabil }`.
 */

/** Wo der Zähler steht, wenn der Screen anfängt — die Pause ist vorbei. */
const START = 21

/** Erste Stichprobe: alles gut. */
const PROBE_1 = 40

/** Zweite Stichprobe: der Trend. */
const PROBE_2 = 120

/** Wer den Trend laufen lässt, sieht hier die Folge. */
const KIPPT = 140

/** Bis hierhin läuft der Zähler nach der Korrektur — dann ist Feierabend nah. */
const SCHICHT_ENDE = 154

const SERIE = 200

/**
 * Takt des Zählers in Millisekunden — ein Stück pro Tick. Von 110 auf 92
 * gestrafft (~16 % schneller): flott genug, dass die Serie sich als Belohnung
 * anfühlt, langsam genug, dass die Zahl noch lesbar hochzählt.
 */
const TAKT_MS = 92

type Phase =
  'laufen1' | 'probe1' | 'weiter1' | 'laufen2' | 'probe2' | 'trend' | 'kippt' | 'stabil'

export function Z6() {
  const gespeichert = useFortschritt().answers.z6
  const fertig = !!gespeichert?.stabil
  const reduziert = useReducedMotion() ?? false

  const [phase, setPhase] = useState<Phase>(() => (fertig ? 'stabil' : 'laufen1'))
  const [stueck, setStueck] = useState(() =>
    fertig ? Math.max(gespeichert?.stueck ?? SCHICHT_ENDE, PROBE_2) : START,
  )
  /** Die letzte Korrektur-Entscheidung — sie färbt den Text im Stabil-Takt. */
  const [wahl, setWahl] = useState<'mitte' | 'unten' | null>(null)

  /** Wohin der Zähler in der aktuellen Phase läuft. */
  const ziel =
    phase === 'laufen1'
      ? PROBE_1
      : phase === 'laufen2'
        ? PROBE_2
        : phase === 'kippt'
          ? KIPPT
          : phase === 'stabil'
            ? SCHICHT_ENDE
            : stueck

  useEffect(() => {
    if (stueck >= ziel) return
    if (reduziert) {
      setStueck(ziel)
      return
    }
    const takt = window.setInterval(
      () => setStueck((s) => Math.min(ziel, s + 1)),
      TAKT_MS,
    )
    return () => window.clearInterval(takt)
  }, [stueck, ziel, reduziert])

  // Erreicht der Zähler sein Ziel, wechselt die Phase — aber nur dort, wo
  // das Laufen selbst die Handlung war. Die Proben wechselt ein Tap.
  useEffect(() => {
    if (stueck < ziel) return
    if (phase === 'laufen1') setPhase('probe1')
    if (phase === 'laufen2') setPhase('probe2')
  }, [stueck, ziel, phase])

  const misstProbe1 = () => {
    setPhase('weiter1')
    merkeAntwort('z6', { stueck: PROBE_1, nachkorrigiert: false, stabil: false })
  }

  const korrigiere = (art: 'mitte' | 'unten') => {
    setWahl(art)
    setPhase('stabil')
    merkeAntwort('z6', { stueck, nachkorrigiert: true, stabil: true })
  }

  const laesstLaufen = () => setPhase('kippt')

  const stabil = phase === 'stabil'
  const laeuft = stueck < ziel

  return (
    <StepShell
      id="Z6"
      auftrag={
        stabil
          ? null
          : phase === 'probe1' || phase === 'probe2'
            ? 'Miss die Stichprobe.'
            : phase === 'trend'
              ? 'Entscheide, wie viel du nachkorrigierst.'
              : phase === 'kippt'
                ? 'Korrigier jetzt nach.'
                : 'Wart auf die nächste Stichprobe.'
      }
      ansage={null}
      interaktionOffen={!stabil}
      buehne={
        <div className="relative size-full">
          <StepFoto id="Z6" />
          {/* Solange die Maschine läuft, fallen fertige Bolzen über das Motiv
              in die Kiste — unter Reduced Motion springt der Zähler sofort auf
              sein Ziel, aber die Bedingung sagt es trotzdem ausdrücklich. */}
          <AnimatePresence>{laeuft && !reduziert && <Teileregen />}</AnimatePresence>
        </div>
      }
      warum={
        <p>
          Serienfertigung heißt: die Maschine macht die Wiederholung, du machst die
          Kontrolle. Alle vierzig Teile eine Stichprobe — weil das Maß nicht springt,
          sondern wandert.
        </p>
      }
      interaktion={
        <div className="flex flex-col gap-3">
          <Zaehler stueck={stueck} laeuft={laeuft} />

          <Wechsel takt={phase}>
            {phase === 'probe1' || phase === 'laufen1' ? (
              phase === 'probe1' ? (
                <p className="px-1 text-[1rem] text-kh-paper/70">
                  Stück {PROBE_1} liegt in der Rutsche. Alle vierzig Teile wird eines
                  gemessen — das ist deine Aufgabe an dieser Maschine.
                </p>
              ) : (
                <p className="px-1 text-[1rem] text-kh-paper/70">
                  Jeder Zyklus dasselbe Spiel: Tür zu, Späne, Tür auf — und ein Bolzen
                  mehr in der Kiste. Jeder exakt wie dein erstes Teil.
                </p>
              )
            ) : phase === 'weiter1' ? (
              <Rueckmeldung
                ok
                text={`Stück ${PROBE_1}: ${mm(24.99)} — mitten im Fenster. Weiterlaufen.`}
                testid="z6-probe1"
              />
            ) : phase === 'laufen2' ? (
              <p className="px-1 text-[1rem] text-kh-paper/70">
                Zwei Stunden im Zeitraffer. Nebenbei entgratest du Teile, prüfst die
                Späne, füllst Kühlschmierstoff nach.
              </p>
            ) : phase === 'probe2' || phase === 'trend' || phase === 'kippt' ? (
              <div className="flex flex-col gap-3">
                {phase === 'probe2' && (
                  <p className="px-1 text-[1rem] text-kh-paper/70">
                    Stück {PROBE_2} liegt in der Rutsche — Zeit für die nächste
                    Stichprobe.
                  </p>
                )}
                {phase !== 'probe2' && (
                  <div className="kh-feld px-4 py-3" data-testid="z6-trend">
                    <p className="kh-etikett">
                      Stück {phase === 'kippt' && stueck >= KIPPT ? KIPPT : PROBE_2}
                    </p>
                    <p className="mt-1 text-[1.0625rem] leading-[1.45] text-kh-paper/90">
                      {phase === 'kippt' && stueck >= KIPPT
                        ? `${mm(25.01)} — drüber. Die letzten Teile müssen nachgedreht werden: Zeit, kein Schrott, zu dick lässt sich retten. Aber jetzt muss die Korrektur rein.`
                        : `${mm(25.0)} — gerade noch drin. Bei Stück 40 waren es ${mm(24.99)}: die Schneide nutzt sich ab, das Maß wandert nach oben.`}
                    </p>
                  </div>
                )}

                {phase !== 'probe2' && (
                  <div className="grid gap-2 landscape:grid-cols-3">
                    <Wahlflaeche
                      onClick={() => korrigiere('mitte')}
                      data-testid="z6-korrektur-mitte"
                      className="justify-center font-semibold"
                    >
                      −0,01 — zurück zur Mitte
                    </Wahlflaeche>
                    <Wahlflaeche
                      onClick={() => korrigiere('unten')}
                      data-testid="z6-korrektur-unten"
                      className="justify-center font-semibold"
                    >
                      −0,02 — ganz nach unten
                    </Wahlflaeche>
                    {phase === 'trend' && (
                      <Wahlflaeche
                        onClick={laesstLaufen}
                        data-testid="z6-laufen-lassen"
                        className="justify-center font-semibold"
                      >
                        Nichts — läuft doch
                      </Wahlflaeche>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <Stabil wahl={wahl} restauriert={fertig && wahl === null} />
            )}
          </Wechsel>
        </div>
      }
      aha={
        <AhaKarte sichtbar={stabil} eyebrow="Warum nicht einfach jedes Teil messen?">
          Weil das Maß nicht springt, sondern wandert. Eine Stichprobe alle vierzig Teile
          zeigt den Trend früh genug — und die Zeit dazwischen gehört dem Entgraten, dem
          Rüsten der nächsten Maschine, dem nächsten Auftrag.
        </AhaKarte>
      }
      fuss={
        <StepFuss
          id="Z6"
          uebungOffen={!stabil}
          aktion={
            phase === 'probe1' || phase === 'probe2' ? (
              <Button
                variant="aktion"
                onClick={phase === 'probe1' ? misstProbe1 : () => setPhase('trend')}
                data-testid="z6-stichprobe"
              >
                Stichprobe messen
              </Button>
            ) : phase === 'weiter1' ? (
              <Button
                variant="aktion"
                onClick={() => setPhase('laufen2')}
                data-testid="z6-weiterlaufen"
              >
                Weiterlaufen lassen
              </Button>
            ) : null
          }
          geschafft={stabil ? 'Serie läuft' : null}
        />
      }
    />
  )
}

// ---------------------------------------------------------------------------
// Der Teileregen — die Bühne zeigt, was der Zähler zählt
// ---------------------------------------------------------------------------

/**
 * Ein fallender Bolzen: wo er fällt, wie groß er ist, wie er taumelt.
 * Feste Werte statt `Math.random`, damit der Regen bei jedem Rendern gleich
 * aussieht und nichts neu gewürfelt wird — die ungleichen Dauern sorgen von
 * selbst dafür, dass sich das Muster nie sichtbar wiederholt.
 */
interface RegenTeil {
  /** Horizontale Position der Fallspur, in Prozent der Bühnenbreite. */
  links: number
  /** Breite der Silhouette in Pixeln — Tiefe durch Größenstreuung. */
  breite: number
  /**
   * Ein voller Fall von oben nach unten, in Sekunden. Kurz gehalten, weil die
   * Produktionsfenster kurz sind: das kürzeste (laufen1) dauert bei
   * `TAKT_MS = 92` nur knapp zwei Sekunden, und ein Teil, das darin nicht
   * unten ankommt, sieht nie jemand fallen.
   */
  dauer: number
  /**
   * Startversatz in Sekunden — er staffelt die Teile und hält den Versatz
   * über alle Umläufe (Motions `delay` gilt einmalig vor dem ersten, ein
   * Takt *zwischen* den Umläufen wäre `repeatDelay`). Klein gehalten, weil
   * der Regen bei jedem Phasenwechsel neu montiert wird und die Verzögerung
   * dann von vorn zählt.
   */
  verzoegerung: number
  /** Drehung beim Eintritt bzw. Austritt, in Grad — das Taumeln. */
  drehStart: number
  drehEnde: number
  /** Wie präsent das Teil wird — die Silhouetten bleiben Hintergrund. */
  deckkraft: number
}

const REGEN_TEILE: readonly RegenTeil[] = [
  {
    links: 8,
    breite: 34,
    dauer: 2.4,
    verzoegerung: 0,
    drehStart: -20,
    drehEnde: 50,
    deckkraft: 0.55,
  },
  {
    links: 24,
    breite: 26,
    dauer: 3.0,
    verzoegerung: 0.5,
    drehStart: 40,
    drehEnde: -30,
    deckkraft: 0.4,
  },
  {
    links: 38,
    breite: 40,
    dauer: 2.1,
    verzoegerung: 1.0,
    drehStart: 10,
    drehEnde: 80,
    deckkraft: 0.6,
  },
  {
    links: 52,
    breite: 30,
    dauer: 2.8,
    verzoegerung: 0.3,
    drehStart: -60,
    drehEnde: 10,
    deckkraft: 0.45,
  },
  {
    links: 66,
    breite: 36,
    dauer: 2.3,
    verzoegerung: 0.8,
    drehStart: 25,
    drehEnde: -45,
    deckkraft: 0.55,
  },
  {
    links: 79,
    breite: 28,
    dauer: 3.2,
    verzoegerung: 0.15,
    drehStart: -10,
    drehEnde: 60,
    deckkraft: 0.4,
  },
  {
    links: 90,
    breite: 32,
    dauer: 2.6,
    verzoegerung: 1.2,
    drehStart: 55,
    drehEnde: -15,
    deckkraft: 0.5,
  },
  {
    links: 16,
    breite: 30,
    dauer: 2.9,
    verzoegerung: 0.65,
    drehStart: -35,
    drehEnde: 35,
    deckkraft: 0.45,
  },
]

/**
 * Die Seitenansicht des Bolzens aus `TEIL` — dieselbe Geometrie wie Zeichnung,
 * Werkzeugweg und Messschraube, nur als kleine Fallfigur: vorn der Lagersitz
 * Ø 25 mit Fase 1 × 45°, dahinter der Absatz Ø 20. Nicht irgendein Klotz,
 * sondern erkennbar das Teil, das die Maschine gerade macht.
 */
const BOLZEN_PFAD = (() => {
  const R = TEIL.sitzDurchmesser / 2
  const r = TEIL.schaftDurchmesser / 2
  const s = TEIL.sitzLaenge
  const L = TEIL.gesamt
  const f = TEIL.fase
  return (
    `M ${f} 0 H ${s} V ${R - r} H ${L} V ${R + r} H ${s} ` +
    `V ${2 * R} H ${f} L 0 ${2 * R - f} V ${f} Z`
  )
})()

/**
 * Fertige Bolzen fallen über das Motiv, solange der Zähler läuft — die Bühne
 * zeigt, was die Zahl behauptet. **Reine Ausschmückung, keine Information:**
 * `aria-hidden`, keine Treffer für Taps, und unter Reduced Motion wird die
 * Ebene gar nicht erst gerendert (der Aufrufer prüft das).
 *
 * Performance: jede Fallspur ist ein bühnenhoher Streifen, der sich per
 * Transform von −8 % auf 104 % seiner eigenen Höhe schiebt — so sind Fallweg
 * und Bühnenhöhe ohne Messung identisch, und es animieren ausschließlich
 * `transform` und `opacity`. Die Ebene liegt unter dem Scrim der `StepShell`,
 * damit Titel und Verlauf ungestört bleiben.
 */
function Teileregen() {
  return (
    <motion.div
      aria-hidden
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {REGEN_TEILE.map((t, i) => (
        <motion.div
          key={i}
          className="absolute inset-y-0"
          style={{ left: `${t.links}%`, width: t.breite }}
          initial={{ y: '-8%', opacity: 0 }}
          animate={{
            // `easeIn` auf dem Fall: das Teil beschleunigt wie unter
            // Schwerkraft, statt gleichmäßig zu schweben.
            y: ['-8%', '104%'],
            // Oben weich einblenden, unten ausblenden — die Teile „landen“
            // im Verlauf am unteren Rand statt hart abzuschneiden.
            opacity: [0, t.deckkraft, t.deckkraft, 0],
          }}
          transition={{
            duration: t.dauer,
            delay: t.verzoegerung,
            repeat: Infinity,
            ease: 'easeIn',
            opacity: {
              duration: t.dauer,
              delay: t.verzoegerung,
              repeat: Infinity,
              ease: 'linear',
              times: [0, 0.06, 0.88, 1],
            },
          }}
        >
          <motion.svg
            viewBox={`0 0 ${TEIL.gesamt} ${TEIL.sitzDurchmesser}`}
            // Explizite Höhe aus Breite × Seitenverhältnis des Teils: ohne
            // sie fiele der Browser auf das intrinsische 300 × 150 zurück
            // und zentrierte den Bolzen in einer viel zu hohen Box — der
            // Fallweg säße dann sichtbar neben der Spur.
            style={{ height: t.breite * (TEIL.sitzDurchmesser / TEIL.gesamt) }}
            preserveAspectRatio="xMidYMid meet"
            className="block w-full"
            initial={{ rotate: t.drehStart }}
            animate={{ rotate: [t.drehStart, t.drehEnde] }}
            transition={{
              duration: t.dauer,
              delay: t.verzoegerung,
              repeat: Infinity,
              // Das Taumeln bleibt linear — nur der Fall beschleunigt.
              ease: 'linear',
            }}
          >
            <path d={BOLZEN_PFAD} fill={STAHL.blank} />
            {/* Das Glanzlicht auf dem Lagersitz — die Kante, an der frisch
                gedrehtes Metall blank wird. */}
            <path
              d={`M ${TEIL.fase} 1 H ${TEIL.sitzLaenge}`}
              stroke={STAHL.glanz}
              strokeWidth={1.4}
              strokeLinecap="round"
              fill="none"
            />
          </motion.svg>
        </motion.div>
      ))}
    </motion.div>
  )
}

/** Der Zähler — die Belohnung dieses Screens ist eine wachsende Zahl. */
function Zaehler({ stueck, laeuft }: { stueck: number; laeuft: boolean }) {
  return (
    <div className="flex flex-col gap-1.5" data-testid="z6-zaehler">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="kh-zahl">{stueck}</span>
        <span className="text-[1.0625rem] text-kh-mute">von {SERIE} Teilen</span>
        {laeuft && (
          <motion.span
            aria-hidden
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="kh-etikett"
          >
            läuft
          </motion.span>
        )}
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full border border-kh-line bg-white/10">
        <div
          className="h-full rounded-full bg-kh-orange/45 ring-1 ring-kh-orange ring-inset transition-[width] duration-300"
          style={{ width: `${(stueck / SERIE) * 100}%` }}
          aria-hidden
        />
      </div>
    </div>
  )
}

function Stabil({
  wahl,
  restauriert,
}: {
  wahl: 'mitte' | 'unten' | null
  restauriert: boolean
}) {
  return (
    <div className="flex flex-col gap-3">
      <Rueckmeldung
        ok
        text={
          wahl === 'unten'
            ? `Nächste Stichprobe: ${mm(24.98)} — ganz unten im Fenster, mit Absicht: der Verschleiß wandert nach oben, so hält deine Korrektur am längsten.`
            : wahl === 'mitte'
              ? `Nächste Stichprobe: ${mm(24.99)} — zurück in der Mitte. Sauber.`
              : 'Die Korrektur ist drin, die Stichproben sitzen wieder im Fenster.'
        }
        testid="z6-stabil"
      />
      <motion.p
        initial={{ opacity: 0, transform: 'translateY(8px)' }}
        animate={{ opacity: 1, transform: 'translateY(0px)' }}
        transition={{ duration: 0.5, delay: restauriert ? 0 : 0.4 }}
        data-testid="z6-pointe"
        className="kh-titel-klein text-kh-orange"
      >
        Die Maschine wiederholt. Du hältst das Maß.
      </motion.p>
    </div>
  )
}
