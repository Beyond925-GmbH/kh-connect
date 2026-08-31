import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { StepFoto } from '@/khpl/buehne/Foto'
import { mm } from '@/khpl/buehne/zerspanung/kanon'
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
    // 75 ms je Teil: die lange zweite Fahrt (40 → 120) dauert damit ~6 s
    // statt ~9 — bei 110 ms wurde am Stand gewartet (Review 31.08.).
    const takt = window.setInterval(() => setStueck((s) => Math.min(ziel, s + 1)), 75)
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
        <>
          <StepFoto id="Z6" />
          <FallendeTeile laeuft={stueck < ziel} />
        </>
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
          <Zaehler stueck={stueck} laeuft={stueck < ziel} />

          <Wechsel takt={phase}>
            {phase === 'probe1' || phase === 'laufen1' ? (
              phase === 'probe1' ? (
                <p className="px-1 text-[1rem] text-kh-paper/70">
                  Stück {PROBE_1} liegt in der Rutsche. Jedes vierzigste wird gemessen —
                  das ist deine Aufgabe an dieser Maschine.
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
                        ? `${mm(25.01)} — drüber. Die letzten Teile müssen nachgedreht werden: Zeit, kein Schrott. Aber jetzt muss die Korrektur rein.`
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

/**
 * Fallende Bolzen über der Kiste, solange der Zähler läuft — der Takt der
 * Serie als Bild, nicht nur als Zahl (Review 31.08.). Drei versetzte
 * Silhouetten, kein Versuch, jeden Zählschritt zu bebildern: die Bühne gibt
 * den Rhythmus, der Zähler die Wahrheit.
 */
function FallendeTeile({ laeuft }: { laeuft: boolean }) {
  const reduziert = useReducedMotion() ?? false
  if (!laeuft || reduziert) return null

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          initial={{ top: '8%', opacity: 0 }}
          animate={{
            top: ['8%', '58%'],
            opacity: [0, 0.85, 0.85, 0],
            rotate: [-16 + i * 10, 12 + i * 7],
          }}
          transition={{
            duration: 1.1,
            delay: i * 0.55,
            repeat: Infinity,
            repeatDelay: 0.55,
            ease: 'easeIn',
          }}
          className="absolute h-7 w-2.5 rounded-full bg-[#c6d2dc]/80 shadow-[0_2px_10px_rgb(0_0_0/0.4)]"
          style={{ left: `${37 + i * 12}%` }}
        />
      ))}
    </div>
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
