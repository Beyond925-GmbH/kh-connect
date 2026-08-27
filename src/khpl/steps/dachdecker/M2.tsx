import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { StepFoto } from '@/khpl/buehne/Foto'
import { AhaKarte } from '@/khpl/komponenten/AhaKarte'
import { Begriff } from '@/khpl/komponenten/Begriff'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { Wechsel } from '@/khpl/komponenten/Wechsel'
import { merkeAntwort, useFortschritt } from '@/khpl/store/fortschritt'

/**
 * M2 — Was kostet dieses Dach?
 *
 * Übung in drei Phasen (khpl-flow.md 7 M2): Vorgaben zeigen → schätzen →
 * auflösen. Die Übung steht bewusst **vor** der Erklärung; die Überraschung
 * ist der Lerneffekt.
 *
 * Der Aha-Moment ist nicht der Preis, sondern der Arbeitsanteil: 6.800 von
 * 12.000 € sind Arbeitszeit, nicht Holz. Genau das raten Besucher falsch, und
 * genau das ist die Botschaft eines Ausbildungsberufs — bezahlt wird das Können.
 *
 * Alle Zahlen `FREIGEGEBEN` (flow 7 M2, Quellen in flow 10). Die 12.000 € sind
 * die einzige Zahl im Produkt, die als exakter Wert erscheinen darf — dort ist
 * die runde Zahl der Punkt der Übung, und die Herleitung steht direkt darunter.
 */

// ---------------------------------------------------------------------------
// Text und Zahlen — gebündelt oben (flow 8.4).
// ---------------------------------------------------------------------------

const MIN = 2000
const MAX = 40000
const SCHRITT = 500
const START = 12000 - 2500 // bewusst nicht auf der Lösung, aber auch nicht am Rand
const ECHT = 12000

const POSTEN = [
  { was: 'Holz', detail: 'ca. 5 m³ Fichte', betrag: 3600 },
  { was: 'Schrauben, Beschläge, Folien', detail: '', betrag: 600 },
  { was: 'Abbund und Aufrichten', detail: 'ca. 105 Stunden', betrag: 6800 },
  { was: 'Kran', detail: 'ein Tag', betrag: 1000 },
]

const euro = (n: number) => n.toLocaleString('de-DE') + ' €'

export function M2() {
  // Der naechste Step (M3) ist der erste mit dem `three`-Buendel. Wer hier
  // schaetzt, laedt es nebenbei schon — sonst steht er auf M3 sekundenlang
  // vor dem Suspense-Fallback statt vor dem Abbundplan. Das Ergebnis wird
  // verworfen; an der Lazy-Grenze (flow 8.5) aendert ein dynamic import
  // nichts, der Chunk bleibt derselbe.
  useEffect(() => {
    void import('@/khpl/buehne/Dachstuhl3D')
  }, [])

  const gespeichert = useFortschritt().answers.m2
  const [wert, setWert] = useState(() => gespeichert?.schaetzung ?? START)
  const [aufgeloest, setAufgeloest] = useState(() => !!gespeichert?.aufgeloest)

  const aufloesen = () => {
    setAufgeloest(true)
    merkeAntwort('m2', { schaetzung: wert, aufgeloest: true })
  }

  return (
    <StepShell
      id="M2"
      interaktionOffen={!aufgeloest}
      // Erst nach der Aufloesung: die Schaetzphase bleibt schmal und
      // konzentriert, die Aufloesung braucht die Breite fuer den Zweispalter
      // (Zahl und Regler links, Kostenaufstellung rechts).
      karteBreit={aufgeloest}
      // Statt der Skizze jetzt der Schreibtisch, an dem so ein Angebot
      // entsteht: Grundriss, Maßstab, Taschenrechner. Die drei Zahlen, die
      // die Skizze getragen hat — 45 Grad, 120 m², Satteldach —, stehen ohnehin
      // wörtlich im Fachtext daneben; die Zeichnung hat sie nur wiederholt.
      buehne={<StepFoto id="M2" />}
      fachtext={
        aufgeloest ? undefined : (
          <p>
            Einfamilienhaus, Satteldach, 45 Grad. 120 Quadratmeter Dachfläche. Fichte (
            <Begriff id="kvh">KVH</Begriff>), keine <Begriff id="gaube">Gaube</Begriff>.
          </p>
        )
      }
      interaktion={<Schaetzung wert={wert} onWert={setWert} aufgeloest={aufgeloest} />}
      aha={
        <>
          <AhaKarte
            sichtbar={aufgeloest}
            eyebrow="Warum ist Holz nicht der teuerste Posten?"
          >
            Mehr als die Hälfte davon ist Arbeitszeit, nicht Holz. Bezahlt wird nicht das
            Material — bezahlt wird, dass jemand weiß, wie es zusammengehört.
          </AhaKarte>
          <AhaKarte sichtbar={aufgeloest} eyebrow="Und wenn der Bauherr nein sagt?">
            Dann kommt der Satz, den jeder Betrieb kennt: Viele Angebote führen nie zum
            Auftrag. Gerechnet hast du trotzdem.
          </AhaKarte>
        </>
      }
      fuss={
        <StepFuss
          id="M2"
          uebungOffen={!aufgeloest}
          aktion={
            aufgeloest ? null : (
              <Button variant="aktion" onClick={aufloesen} data-testid="m2-aufloesen">
                Und jetzt die echte Zahl
              </Button>
            )
          }
          geschafft={aufgeloest ? 'Kalkuliert' : null}
        />
      }
    />
  )
}

function Schaetzung({
  wert,
  onWert,
  aufgeloest,
}: {
  wert: number
  onWert: (n: number) => void
  aufgeloest: boolean
}) {
  const anteil = (n: number) => ((n - MIN) / (MAX - MIN)) * 100

  /*
    Zwei Takte, kein Stapel.

    Vorher blieb nach der Auflösung alles stehen — Anweisung, Regler,
    Reglerbeschriftung — und darunter kamen Kostenaufstellung, Mathe-Knopf und
    zwei Aha-Karten dazu. Das Panel war am Ende doppelt so hoch wie am Anfang
    und hatte eine Scrollkante, obwohl der Screen fertig war.

    Jetzt wird die Schätzung durch ihre Auflösung **ersetzt**. Der Regler geht
    mit: gezogen wird nichts mehr, und aus dem 52-px-Griff wird ein flacher
    Vergleichsbalken, der genau das zeigt, worum es geht — den Abstand
    zwischen deiner Zahl und der echten.
  */
  return (
    <Wechsel takt={aufgeloest ? 'aufgeloest' : 'schaetzen'}>
      {aufgeloest ? (
        <div className="flex flex-col gap-3 landscape:grid landscape:grid-cols-[1fr_1.1fr] landscape:items-start landscape:gap-x-7">
          <div className="flex flex-col gap-2.5">
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <motion.span
                initial={{ opacity: 0, transform: 'translateY(18px) scale(0.9)' }}
                animate={{ opacity: 1, transform: 'translateY(0px) scale(1)' }}
                transition={{ type: 'spring', stiffness: 380, damping: 26 }}
                data-testid="m2-zahl"
                className="kh-zahl text-kh-orange"
              >
                {euro(ECHT)}
              </motion.span>
            </div>

            <Vergleich schaetzung={wert} anteil={anteil} />
          </div>

          <motion.div
            initial="aus"
            animate="an"
            variants={{
              an: { transition: { staggerChildren: 0.09, delayChildren: 0.35 } },
            }}
            className="flex flex-col"
            data-testid="m2-posten"
          >
            {POSTEN.map((p) => (
              <motion.div
                key={p.was}
                variants={{ aus: { opacity: 0, x: -12 }, an: { opacity: 1, x: 0 } }}
                className="flex items-baseline justify-between gap-3 border-b border-kh-line py-2 text-[1.0625rem] last:border-0"
              >
                <span className="min-w-0 text-kh-paper">
                  {p.was}
                  {p.detail && <span className="text-kh-mute"> · {p.detail}</span>}
                </span>
                <span className="shrink-0 text-kh-mute tabular-nums">
                  {euro(p.betrag)}
                </span>
              </motion.div>
            ))}
            {/* Die Summenzeile stand vorher nirgends — die vier Posten mussten im
                Kopf addiert werden, um auf die Zahl darüber zu kommen. */}
            <motion.div
              variants={{ aus: { opacity: 0 }, an: { opacity: 1 } }}
              className="mt-1 flex items-baseline justify-between gap-3 border-t-2 border-kh-line-strong pt-2 text-[1.125rem]"
            >
              <span className="font-semibold text-kh-paper">Dachstuhl gesamt</span>
              <span className="font-display text-[1.5rem] text-kh-orange tabular-nums">
                {euro(ECHT)}
              </span>
            </motion.div>
            <motion.div
              variants={{ aus: { opacity: 0 }, an: { opacity: 1 } }}
              className="pt-2.5"
            >
              <Mathe />
            </motion.div>
          </motion.div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-[1.125rem] font-semibold text-kh-paper sm:text-[1.25rem]">
            Zieh, bis du glaubst, es passt.
          </p>

          {/*
            Die Zahl trägt Anton und ist so groß, wie das Panel es zulässt — sie
            ist der Inhalt dieses Screens, nicht seine Beschriftung. Solange
            geschätzt wird, steht sie in Warnwestengelb: sie gehört dem Besucher.
            Nach der Auflösung wechselt sie auf Markenorange — das ist dann die
            Zahl des Betriebs, nicht mehr die eigene.
          */}
          <span data-testid="m2-zahl" className="kh-zahl">
            {euro(wert)}
          </span>

          <div className="relative" data-wisch="aus">
            <input
              type="range"
              min={MIN}
              max={MAX}
              step={SCHRITT}
              value={wert}
              onChange={(e) => onWert(Number(e.target.value))}
              data-testid="m2-regler"
              aria-label="Was kostet dieses Dach?"
              className="kh-regler w-full"
            />
            <div className="flex justify-between text-[0.9375rem] text-kh-mute/70 tabular-nums">
              <span>{euro(MIN)}</span>
              <span>{euro(MAX)}</span>
            </div>
          </div>
        </div>
      )}
    </Wechsel>
  )
}

/**
 * Der Abstand zwischen der eigenen Zahl und der echten — flach statt als
 * Regler.
 *
 * Nach der Auflösung ist nichts mehr zu ziehen. Ein deaktivierter 52-px-Griff
 * sähe trotzdem aus wie ein Bedienelement und kostete den Platz von einem: das
 * hier ist eine Skala mit zwei Marken und einer Strecke dazwischen. Die
 * Strecke ist die Aussage des Screens.
 */
function Vergleich({
  schaetzung,
  anteil,
}: {
  schaetzung: number
  anteil: (n: number) => number
}) {
  const von = Math.min(anteil(schaetzung), anteil(ECHT))
  const bis = Math.max(anteil(schaetzung), anteil(ECHT))
  const abstand = Math.abs(ECHT - schaetzung)

  return (
    <div className="flex flex-col gap-2" data-testid="m2-vergleich">
      {/* Die Skala trug den Abstand vorher als 12-px-Streifen mit zwei
          4-px-Strichen und darunter eine 15-px-Zeile in `kh-mute`. Der
          Abstand zwischen der geratenen und der echten Zahl **ist** die
          Aussage dieses Screens, und er war das Leiseste darauf. Jetzt:
          höhere Skala, dickere Marken — und der Abstand steht als Zahl da,
          statt aus zwei Positionen abgelesen werden zu müssen. */}
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
          transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 24 }}
          style={{ left: `${anteil(ECHT)}%` }}
          className="absolute top-[-10px] bottom-[-10px] w-[7px] -translate-x-1/2 rounded-full bg-kh-orange shadow-[0_0_12px_rgba(255,159,42,0.6)]"
          aria-hidden
        />
      </div>
      <p className="text-[1rem] tabular-nums">
        <span className="text-kh-mute">Deine Schätzung </span>
        <span className="font-semibold text-kh-paper/85">{euro(schaetzung)}</span>
        {abstand > 0 && (
          <>
            <span className="text-kh-mute"> — </span>
            <span className="font-semibold text-kh-orange">{euro(abstand)} daneben</span>
          </>
        )}
      </p>
    </div>
  )
}

/** Antippbar, nicht aufgedrängt (flow 11, M2 „Mathe-Einblendung“). */
function Mathe() {
  return (
    <Dialog>
      <DialogTrigger className="rounded-kh-pill border-2 border-kh-line-strong bg-white/5 px-4 py-2.5 text-[1rem] font-medium text-kh-paper/85 transition-transform active:scale-95">
        Woher kommen die 120 Quadratmeter?
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Achte Klasse</DialogTitle>
        <DialogDescription>
          Die 120 Quadratmeter hat niemand gemessen. Das Haus ist 85 Quadratmeter groß,
          das Dach steht 45 Grad schräg — Grundfläche geteilt durch den Kosinus, und du
          hast die Dachfläche. Dreisatz und Pythagoras, achte Klasse. Hier zum ersten Mal
          an etwas, das gebaut wird.
        </DialogDescription>
      </DialogContent>
    </Dialog>
  )
}
