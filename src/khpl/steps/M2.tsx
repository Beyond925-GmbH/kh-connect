import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { AhaKarte } from '@/khpl/komponenten/AhaKarte'
import { Begriff } from '@/khpl/komponenten/Begriff'
import { StepFuss, useStepNavigation } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
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
  const { weiter } = useStepNavigation('M2')
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
      aufteilung="uebung"
      interaktionOffen={!aufgeloest}
      onWeiter={weiter}
      buehne={<Vorgaben />}
      fachtext={
        aufgeloest ? undefined : (
          <p>
            Einfamilienhaus, Satteldach, 45 Grad. 120 Quadratmeter Dachfläche. Fichte (
            <Begriff id="kvh">KVH</Begriff>), keine <Begriff id="gaube">Gaube</Begriff>.
          </p>
        )
      }
      interaktion={
        <Schaetzung
          wert={wert}
          onWert={setWert}
          aufgeloest={aufgeloest}
          onAufloesen={aufloesen}
        />
      }
      aha={
        <div className="flex flex-col gap-2">
          <AhaKarte sichtbar={aufgeloest} eyebrow="Der eigentliche Punkt">
            Mehr als die Hälfte davon ist Arbeitszeit, nicht Holz. Bezahlt wird nicht das
            Material — bezahlt wird, dass jemand weiß, wie es zusammengehört.
          </AhaKarte>
          <AhaKarte sichtbar={aufgeloest} eyebrow={null} verzoegerung={1.6}>
            Und dann kommt der Satz, den jeder Betrieb kennt: Viele Angebote führen nie
            zum Auftrag. Gerechnet hast du trotzdem.
          </AhaKarte>
        </div>
      }
      fuss={<StepFuss id="M2" />}
    />
  )
}

/**
 * Die Vorgaben als Zeichnung statt als Aufzählung. Flow 13 hält für M2 fest:
 * „kein eigenes Motiv nötig — der Screen ist Übung“. Ein Foto von irgendeinem
 * Dach würde hier nichts erklären; die Skizze zeigt genau die drei Zahlen, mit
 * denen gleich gerechnet wird.
 */
function Vorgaben() {
  return (
    <div className="grid size-full place-items-center bg-kh-band-soft p-4">
      <svg
        viewBox="0 0 300 210"
        className="h-full max-h-[220px] w-full max-w-[320px] landscape:max-h-none"
        role="img"
        aria-label="Satteldach, 45 Grad, 120 Quadratmeter Dachfläche"
      >
        {/* Haus */}
        <rect x="60" y="120" width="180" height="70" fill="var(--color-kh-band)" />
        {/* Dach */}
        <path
          d="M50 122 L150 42 L250 122 Z"
          fill="var(--color-kh-orange)"
          opacity="0.9"
        />
        <path
          d="M50 122 L150 42 L250 122"
          fill="none"
          stroke="var(--color-kh-ink)"
          strokeWidth="2"
          opacity="0.35"
        />
        {/* Winkelbogen am Traufpunkt */}
        <path
          d="M78 122 A 28 28 0 0 1 90 100"
          fill="none"
          stroke="var(--color-kh-ink)"
          strokeWidth="1.5"
        />
        <text x="92" y="118" fontSize="14" fontWeight="700" fill="var(--color-kh-ink)">
          45°
        </text>
        {/* Maßlinie über der Dachfläche */}
        <path
          d="M156 36 L256 116"
          stroke="var(--color-kh-ink)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
        <text
          x="212"
          y="66"
          fontSize="13"
          fontWeight="700"
          fill="var(--color-kh-ink)"
          transform="rotate(38 212 66)"
        >
          120 m²
        </text>
        <text
          x="150"
          y="207"
          fontSize="13"
          textAnchor="middle"
          fill="var(--color-kh-grey)"
        >
          Satteldach · Fichte · keine Gaube
        </text>
      </svg>
    </div>
  )
}

function Schaetzung({
  wert,
  onWert,
  aufgeloest,
  onAufloesen,
}: {
  wert: number
  onWert: (n: number) => void
  aufgeloest: boolean
  onAufloesen: () => void
}) {
  const anteil = (n: number) => ((n - MIN) / (MAX - MIN)) * 100

  return (
    <div className="flex h-full min-h-0 flex-col justify-center gap-4">
      {!aufgeloest && (
        <p className="text-[15px] font-normal text-kh-ink">
          Zieh, bis du glaubst, es passt.
        </p>
      )}

      {/* Der Zahlenwechsel ist die Übung. Erst die eigene Zahl, dann die echte. */}
      <div className="flex items-baseline gap-4">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={aufgeloest ? 'echt' : 'schaetzung'}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            data-testid="m2-zahl"
            className="text-[clamp(2.2rem,1.5rem+2.6vw,3.6rem)] leading-none font-bold text-kh-orange-text tabular-nums"
          >
            {euro(aufgeloest ? ECHT : wert)}
          </motion.span>
        </AnimatePresence>
        {aufgeloest && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-[15px] text-kh-grey"
          >
            deine Schätzung: {euro(wert)}
          </motion.span>
        )}
      </div>

      {/* Regler bleibt nach der Auflösung stehen und bekommt die echte Zahl als
          zweite Marke — der Abstand ist der Aha-Moment, nicht eine Note. */}
      <div className="relative" data-wisch="aus">
        <input
          type="range"
          min={MIN}
          max={MAX}
          step={SCHRITT}
          value={wert}
          disabled={aufgeloest}
          onChange={(e) => onWert(Number(e.target.value))}
          data-testid="m2-regler"
          aria-label="Was kostet dieses Dach?"
          className="kh-regler w-full"
        />
        {aufgeloest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="pointer-events-none absolute -top-1 bottom-0 w-[3px] -translate-x-1/2 rounded-full bg-kh-ink"
            style={{ left: `${anteil(ECHT)}%` }}
            aria-hidden
          />
        )}
        <div className="mt-1 flex justify-between text-[13px] text-kh-grey/60 tabular-nums">
          <span>{euro(MIN)}</span>
          <span>{euro(MAX)}</span>
        </div>
      </div>

      {aufgeloest ? (
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
              variants={{ aus: { opacity: 0, x: -10 }, an: { opacity: 1, x: 0 } }}
              className="flex items-baseline justify-between gap-3 border-b border-kh-rule py-2 text-[15px] last:border-0"
            >
              <span className="min-w-0 text-kh-ink">
                {p.was}
                {p.detail && <span className="text-kh-grey/70"> · {p.detail}</span>}
              </span>
              <span className="shrink-0 text-kh-grey tabular-nums">{euro(p.betrag)}</span>
            </motion.div>
          ))}
          {/* Die Summenzeile stand vorher nirgends — die vier Posten mussten im
              Kopf addiert werden, um auf die Zahl darüber zu kommen. */}
          <motion.div
            variants={{ aus: { opacity: 0 }, an: { opacity: 1 } }}
            className="mt-1 flex items-baseline justify-between gap-3 border-t-2 border-kh-ink/15 pt-2 text-[16px]"
          >
            <span className="font-normal text-kh-ink">Dachstuhl gesamt</span>
            <span className="font-bold text-kh-orange-text tabular-nums">
              {euro(ECHT)}
            </span>
          </motion.div>
          <div className="pt-2">
            <Mathe />
          </div>
        </motion.div>
      ) : (
        <div className="flex justify-start">
          <Button
            onClick={onAufloesen}
            data-testid="m2-aufloesen"
            className="h-[60px] px-7 text-[16px]"
          >
            Und jetzt die echte Zahl
          </Button>
        </div>
      )}
    </div>
  )
}

/** Antippbar, nicht aufgedrängt (flow 11, M2 „Mathe-Einblendung“). */
function Mathe() {
  return (
    <Dialog>
      <DialogTrigger className="text-[15px] text-kh-orange-text underline decoration-kh-orange-text/40 underline-offset-4">
        Woher kommen die 120 Quadratmeter?
      </DialogTrigger>
      <DialogContent>
        <DialogTitle className="kh-step-titel mb-3 normal-case">Achte Klasse</DialogTitle>
        <DialogDescription className="kh-fachtext">
          Die 120 Quadratmeter hat niemand gemessen. Das Haus ist 85 Quadratmeter groß,
          das Dach steht 45 Grad schräg — Grundfläche geteilt durch den Kosinus, und du
          hast die Dachfläche. Dreisatz und Pythagoras, achte Klasse. Hier zum ersten Mal
          an etwas, das gebaut wird.
        </DialogDescription>
      </DialogContent>
    </Dialog>
  )
}
