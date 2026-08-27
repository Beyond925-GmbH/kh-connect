import { useState } from 'react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  GROESSTMASS,
  KLEINSTMASS,
  NENNMASS,
  RASTER_KURVE,
  TOLERANZ,
} from '@/khpl/buehne/zerspanung/kanon'
import { Werkstueck } from '@/khpl/buehne/zerspanung/Werkstueck'
import { AhaKarte } from '@/khpl/komponenten/AhaKarte'
import { Wechsel } from '@/khpl/komponenten/Wechsel'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { merkeAntwort, useFortschritt } from '@/khpl/store/fortschritt'
import { Begriff } from './Begriff'
import { useSchmal } from '@/khpl/shell/schmal'

/**
 * Z1 — Null Komma null zwei eins.
 *
 * **Der eine Schätzmoment dieses Tages** (khpl-tag-zerspanung.md §6 Z1). Der
 * Besucher rät an einem logarithmischen Regler, wie viel bei `Ø 20 h7`
 * danebengehen darf; aufgelöst wird mit 20,000 / 19,979 mm — 0,021 mm
 * Spielraum, `BELEGT` nach ISO 286.
 *
 * Die Mechanik ist die von M2, das Vorzeichen ist das entgegengesetzte: dort
 * ist die echte Zahl **größer** als erwartet, hier absurd **kleiner**. Ein
 * Vierzehnjähriger, der rät, rät Millimeter.
 *
 * **Fehlerfall: keiner.** Geschätzt wird, nicht gewusst — es gibt keine
 * Rückmeldung „falsch“, nur den Abstand zwischen der eigenen Zahl und der
 * echten.
 */

// ---------------------------------------------------------------------------
// Der Regler — Text und Zahlen gebündelt oben (flow 8.4).
// ---------------------------------------------------------------------------

/**
 * **Der Regler ist logarithmisch, und das ist `ENTSCHIEDEN`** (§6 Z1). Auf
 * einer linearen Skala von 1 mm bis 0,01 mm lägen alle interessanten Antworten
 * in den letzten drei Prozent des Wegs — die Übung wäre nicht schätzbar,
 * sondern eine Zufallsauswahl. Hier kostet jede Raste denselben *Faktor*, nicht
 * denselben Betrag.
 */
const MAX_MM = 1
const MIN_MM = 0.01
/** Rasten über den ganzen Weg. Jede ist rund vier Prozent kleiner als die vorige. */
const STUFEN = 120
/**
 * Der Startwert liegt bei einem halben Millimeter: bewusst dort, wo ein
 * Vierzehnjähriger von selbst anfängt zu raten, und weit genug vom Anschlag
 * entfernt, dass in beide Richtungen Weg bleibt.
 */
const START = 18

/**
 * Zwei geltende Ziffern statt der krummen Potenz — sonst steht am Anfang
 * „0,501 mm“ da, und der Screen sieht aus, als hätte er sich verrechnet.
 */
function wertFuer(stufe: number): number {
  return Number((MAX_MM * (MIN_MM / MAX_MM) ** (stufe / STUFEN)).toPrecision(2))
}

/** Rückweg für den Wiedereinstieg über „Dein Weg“. */
function stufeFuer(wert: number): number {
  const roh = (STUFEN * Math.log(wert / MAX_MM)) / Math.log(MIN_MM / MAX_MM)
  return Math.min(STUFEN, Math.max(0, Math.round(roh)))
}

/** Anteil auf der logarithmischen Skala, 0 % links (1 mm) bis 100 % rechts. */
function anteil(wert: number): number {
  return (stufeFuer(wert) / STUFEN) * 100
}

const mm = (n: number) => `${n.toFixed(3).replace('.', ',')} mm`

/**
 * Die Rasterkurve dieses Tages: Ziffern rasten, nichts federt (§7 — „keine
 * Springs“). `kanon.ts` hält sie `as const`; `motion` verlangt ein
 * beschreibbares Vierertupel.
 */
const RASTER = [...RASTER_KURVE] as [number, number, number, number]

export function Z1() {
  const schmal = useSchmal()
  const gespeichert = useFortschritt().answers.z1
  const [stufe, setStufe] = useState(() =>
    gespeichert ? stufeFuer(gespeichert.schaetzung) : START,
  )
  const [aufgeloest, setAufgeloest] = useState(() => !!gespeichert?.aufgeloest)

  const wert = wertFuer(stufe)

  const aufloesen = () => {
    setAufgeloest(true)
    merkeAntwort('z1', { schaetzung: wert, aufgeloest: true })
  }

  return (
    <StepShell
      id="Z1"
      interaktionOffen={!aufgeloest}
      // Erst nach der Auflösung: die Schätzphase bleibt schmal, die Auflösung
      // braucht die Breite für Zahl und Maßtabelle nebeneinander.
      karteBreit={aufgeloest}
      // „Hinter jedem Maß steht eine Toleranz“ meint die Zeichnung — sie muss
      // lesbar sein, bevor jemand über sie liest. Hochkant deckelt das den
      // Panelwuchs auf 62 %, und wer die Bemaßung ganz sehen will, klappt ein.
      buehnePlatz
      buehne={
        <Werkstueck zustand="zeichnung" massHervorgehoben toleranzfeld={aufgeloest} />
      }
      fachtext={
        // Auf dem Handy hochkant trägt das Panel nur den Kern des Satzes:
        // mit der vollen Fassung lag der Slider — die Übung — unter der
        // Scrollkante, und geschätzt hätte nur, wer scrollt (s. `schmal.ts`).
        schmal ? (
          <p>
            Eine Zeichnung sagt nicht, <em>wie groß</em> — sie sagt, <em>wie genau</em>:
            Hinter jedem Maß steht eine <Begriff id="toleranz">Toleranz</Begriff>.
          </p>
        ) : (
          <p>
            Eine technische Zeichnung sagt nicht, <em>wie groß</em> — sie sagt,{' '}
            <em>wie genau</em>. Hinter jedem Maß steht eine{' '}
            <Begriff id="toleranz">Toleranz</Begriff>, und die entscheidet über Preis,
            Aufwand und Maschine.
          </p>
        )
      }
      interaktion={
        <Wechsel takt={aufgeloest ? 'aufgeloest' : 'schaetzen'}>
          {aufgeloest ? (
            <Aufloesung schaetzung={wert} />
          ) : (
            <Schaetzung stufe={stufe} wert={wert} onStufe={setStufe} schmal={schmal} />
          )}
        </Wechsel>
      }
      aha={
        <>
          <AhaKarte sichtbar={aufgeloest} eyebrow="Ist enger nicht besser?">
            Die Toleranz ist nicht, wie genau du arbeiten <em>kannst</em>. Sie ist, wie
            genau das Teil hinterher <em>passen muss</em>. Enger heißt nicht besser —
            enger heißt teurer.
          </AhaKarte>
          <AhaKarte sichtbar={aufgeloest} eyebrow="Gilt das für jedes Teil?">
            Nein, der Spielraum hängt am Maß. Die 0,021 Millimeter gehören zu Ø 20; bei Ø
            50 wären es 0,025. Maß und Toleranz gehören immer zusammen — eins ohne das
            andere sagt nichts.
          </AhaKarte>
        </>
      }
      fuss={
        <StepFuss
          id="Z1"
          uebungOffen={!aufgeloest}
          aktion={
            aufgeloest ? null : (
              <Button variant="aktion" onClick={aufloesen} data-testid="z1-aufloesen">
                Und jetzt das echte Maß
              </Button>
            )
          }
          geschafft={aufgeloest ? 'Toleranz gelesen' : null}
        />
      }
    />
  )
}

// ---------------------------------------------------------------------------
// Takt 1 — schätzen
// ---------------------------------------------------------------------------

function Schaetzung({
  stufe,
  wert,
  onStufe,
  schmal = false,
}: {
  stufe: number
  wert: number
  onStufe: (n: number) => void
  /** Handy hochkant: das Feld wird eine Zeile, die Frage kürzer — sonst
      läge der Slider unter der Scrollkante (s. `schmal.ts`). */
  schmal?: boolean
}) {
  return (
    <div className="flex flex-col gap-3">
      {/* Das Maß, um das es geht. Es steht im Panel und nicht nur auf der
          Zeichnung: wer schätzt, soll es lesen können, ohne am Bildrand danach
          zu suchen — und `h7` ist der Begriff, den dieser Screen beibringt.
          Auf dem Handy entfällt das Feld: dort steht Ø 20 h7 groß und orange
          direkt über dem Panel auf der Zeichnung, und jede Zeile im Panel
          kostet den Slider (s. `schmal.ts`). */}
      {!schmal && (
        <div className="kh-feld flex flex-col gap-1 px-3.5 py-2.5">
          <span className="kh-etikett">Auf der Zeichnung</span>
          <span className="font-display text-[1.75rem] leading-none text-kh-paper tabular-nums">
            Ø {NENNMASS} h7
          </span>
          <span className="text-[0.9375rem] text-kh-mute">
            Die <Begriff id="passung">Passung</Begriff> hinter dem Maß sagt, wie genau.
          </span>
        </div>
      )}

      <p className="text-[1.125rem] font-semibold text-kh-paper sm:text-[1.25rem]">
        {schmal
          ? 'Wie viel darf danebengehen?'
          : 'Wie viel darf danebengehen? Zieh, bis du glaubst, das reicht.'}
      </p>

      {/* Die Zahl trägt Anton und gehört solange dem Besucher — deshalb
          Warnwestengelb. Nach der Auflösung wechselt sie auf Orange: dann ist
          es die Zahl der Zeichnung, nicht mehr die eigene. */}
      <span data-testid="z1-zahl" className="kh-zahl">
        {mm(wert)}
      </span>

      <div className="relative" data-wisch="aus">
        <input
          type="range"
          min={0}
          max={STUFEN}
          step={1}
          value={stufe}
          onChange={(e) => onStufe(Number(e.target.value))}
          data-testid="z1-regler"
          aria-label="Wie viel darf danebengehen?"
          aria-valuetext={mm(wert)}
          className="kh-regler w-full"
        />
        <div className="flex justify-between text-[0.9375rem] text-kh-mute/70 tabular-nums">
          <span>{mm(MAX_MM)}</span>
          <span>{mm(MIN_MM)}</span>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Takt 2 — auflösen
// ---------------------------------------------------------------------------

function Aufloesung({ schaetzung }: { schaetzung: number }) {
  return (
    <div className="flex flex-col gap-4 landscape:grid landscape:grid-cols-[1fr_1.05fr] landscape:items-start landscape:gap-x-7">
      <div className="flex flex-col gap-2.5">
        {/* Die Signaturzahl rastet ein — hart, ohne Überschwingen (§7). */}
        <motion.span
          initial={{ opacity: 0, transform: 'translateY(18px) scale(0.9)' }}
          animate={{ opacity: 1, transform: 'translateY(0px) scale(1)' }}
          transition={{ duration: 0.4, ease: RASTER }}
          data-testid="z1-zahl"
          className="kh-zahl text-kh-orange"
        >
          {mm(TOLERANZ)}
        </motion.span>
        <p className="text-[1.0625rem] text-kh-mute">
          Nach oben nichts, nach unten {mm(TOLERANZ)}. Das ist der ganze Spielraum.
        </p>

        <Vergleich schaetzung={schaetzung} />
      </div>

      <motion.div
        initial="aus"
        animate="an"
        variants={{ an: { transition: { staggerChildren: 0.09, delayChildren: 0.3 } } }}
        className="flex flex-col gap-3"
        data-testid="z1-masse"
      >
        <dl className="flex flex-col">
          {[
            { was: 'Größtes erlaubtes Maß', wert: GROESSTMASS },
            { was: 'Kleinstes erlaubtes Maß', wert: KLEINSTMASS },
          ].map((z) => (
            <motion.div
              key={z.was}
              variants={{ aus: { opacity: 0, x: -12 }, an: { opacity: 1, x: 0 } }}
              className="flex items-baseline justify-between gap-3 border-b border-kh-line py-2 text-[1.0625rem] last:border-0"
            >
              <dt className="min-w-0 text-kh-paper">{z.was}</dt>
              <dd className="shrink-0 font-display text-[1.5rem] leading-none text-kh-paper tabular-nums">
                {mm(z.wert)}
              </dd>
            </motion.div>
          ))}
        </dl>

        {/*
          Der Größenvergleich. „So fein wie ein Haar“ wäre falsch — die
          Toleranz ist deutlich feiner (belege/zerspanung.md 2, Haar 50–70 µm).
          Deshalb „ungefähr“ und „ein Drittel“, nie „genau dreimal feiner“:
          Haardicke streut um den Faktor drei.
        */}
        <motion.p
          variants={{ aus: { opacity: 0 }, an: { opacity: 1 } }}
          className="text-[1.0625rem] leading-snug text-kh-paper/85"
        >
          Nimm dir ein Haar vom Kopf. Das ist ungefähr 0,06 Millimeter dick. Der ganze
          Spielraum, den dieses Teil hat, ist ein Drittel davon.
        </motion.p>

        <motion.div variants={{ aus: { opacity: 0 }, an: { opacity: 1 } }}>
          <Papier />
        </motion.div>
      </motion.div>
    </div>
  )
}

/**
 * Der Abstand zwischen der geratenen und der echten Zahl — auf derselben
 * logarithmischen Skala, auf der eben noch gezogen wurde.
 *
 * Er ist die Aussage dieses Screens: M2 löst mit einer Zahl auf, die *größer*
 * ist als erwartet, hier ist sie absurd *kleiner*. Dieselbe Mechanik,
 * entgegengesetztes Vorzeichen.
 */
function Vergleich({ schaetzung }: { schaetzung: number }) {
  const von = Math.min(anteil(schaetzung), anteil(TOLERANZ))
  const bis = Math.max(anteil(schaetzung), anteil(TOLERANZ))
  const verhaeltnis = schaetzung / TOLERANZ

  return (
    <div className="flex flex-col gap-2" data-testid="z1-vergleich">
      <div className="relative h-4 w-full rounded-full border border-kh-line bg-white/10">
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.25, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ left: `${von}%`, width: `${bis - von}%`, transformOrigin: 'left' }}
          className="absolute inset-y-0 bg-kh-orange/30"
          aria-hidden
        />
        <span
          style={{ left: `${anteil(schaetzung)}%` }}
          className="absolute top-[-7px] bottom-[-7px] w-[6px] -translate-x-1/2 rounded-full bg-kh-paper/70"
          aria-hidden
        />
        <motion.span
          initial={{ opacity: 0, scaleY: 0.3 }}
          animate={{ opacity: 1, scaleY: 1 }}
          transition={{ delay: 0.2, duration: 0.4, ease: RASTER }}
          style={{ left: `${anteil(TOLERANZ)}%` }}
          className="absolute top-[-10px] bottom-[-10px] w-[7px] -translate-x-1/2 rounded-full bg-kh-orange shadow-[0_0_12px_rgba(255,159,42,0.6)]"
          aria-hidden
        />
      </div>
      <p className="text-[1rem] tabular-nums">
        <span className="text-kh-mute">Du hast </span>
        <span className="font-semibold text-kh-paper/85">{mm(schaetzung)}</span>
        <span className="text-kh-mute"> geschätzt — </span>
        <span className="font-semibold text-kh-orange">{abstand(verhaeltnis)}</span>
      </p>
    </div>
  )
}

/**
 * Der Abstand in Worten. Ein Faktor sagt hier mehr als eine Differenz: 0,479 mm
 * daneben klingt nach wenig, „dreiundzwanzigmal so viel“ nicht.
 */
function abstand(verhaeltnis: number): string {
  if (verhaeltnis >= 1.6) return `${Math.round(verhaeltnis)}-mal so viel`
  if (verhaeltnis <= 0.65) return 'enger, als nötig wäre'
  return 'ziemlich nah dran'
}

/**
 * Der Zweitvergleich, antippbar statt aufgedrängt (Muster: die
 * Mathe-Einblendung in M2). Er steht bereit, falls das Haar nicht trägt —
 * Papier hat jeder schon einmal in der Hand gehabt.
 */
function Papier() {
  return (
    <Dialog>
      {/* `min-h-[52px]`: dieselbe Untergrenze, die `button.tsx` für jede
          Trefferfläche im Bestand setzt (khpl-tage.md §3). */}
      <DialogTrigger className="min-h-[52px] rounded-kh-pill border-2 border-kh-line-strong bg-white/5 px-4 py-2.5 text-[1rem] font-medium text-kh-paper/85 transition-transform active:scale-95">
        Und wenn ich mir nichts darunter vorstellen kann?
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Ein Blatt Papier</DialogTitle>
        <DialogDescription>
          Ein Blatt Kopierpapier ist rund ein Zehntelmillimeter dick. Die ganze
          Toleranzzone dieses Teils ist etwa ein Fünftel davon. Wenn du ein Blatt Papier
          in fünf Schichten spalten könntest, wäre eine davon dein gesamter Spielraum.
        </DialogDescription>
      </DialogContent>
    </Dialog>
  )
}
