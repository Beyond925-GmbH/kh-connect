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
import { StepFoto } from '@/khpl/buehne/Foto'
import { AhaKarte } from '@/khpl/komponenten/AhaKarte'
import { Begriff } from '@/khpl/komponenten/Begriff'
import { StepFuss } from '@/khpl/shell/StepFuss'
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
        // `empty:hidden`: solange beide Karten unsichtbar sind, ist die Huelle
        // im DOM leer — ohne das zaehlte sie als Flex-Kind und der `gap` des
        // Scrollbereichs erzeugte in der Schaetzphase einen sichtbaren
        // Leerstreifen unter dem Regler.
        <div className="flex flex-col gap-2 empty:hidden">
          <AhaKarte sichtbar={aufgeloest} eyebrow="Der eigentliche Punkt">
            Mehr als die Hälfte davon ist Arbeitszeit, nicht Holz. Bezahlt wird nicht das
            Material — bezahlt wird, dass jemand weiß, wie es zusammengehört.
          </AhaKarte>
          <AhaKarte sichtbar={aufgeloest} eyebrow="Und trotzdem" verzoegerung={1.6}>
            Und dann kommt der Satz, den jeder Betrieb kennt: Viele Angebote führen nie
            zum Auftrag. Gerechnet hast du trotzdem.
          </AhaKarte>
        </div>
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

  return (
    // Kein `h-full justify-center`: die Übung hinge dadurch in der Mitte einer
    // hohen leeren Spalte, mit einem Loch über und unter sich.
    //
    // Nach der Auflösung wird aus der Spalte quer ein Zweispalter: links
    // bleiben Zahl und Regler stehen (das ist die Schätzung, die gerade
    // korrigiert wurde), rechts fährt die Kostenaufstellung ein wie eine
    // Lösungskarte. Untereinander schob die Aufstellung den Regler aus dem
    // Panel und der Screen musste scrollen — dabei war rechts die halbe
    // Breite frei. Hochkant bleibt alles gestapelt.
    <div
      className={
        aufgeloest
          ? 'flex flex-col gap-3 landscape:grid landscape:grid-cols-[1fr_1.1fr] landscape:items-start landscape:gap-x-7'
          : 'flex flex-col gap-3'
      }
    >
      <div className="flex flex-col gap-3">
        {!aufgeloest && (
          <p className="text-[1.125rem] font-semibold text-kh-paper sm:text-[1.25rem]">
            Zieh, bis du glaubst, es passt.
          </p>
        )}

        {/*
          Der Zahlenwechsel ist die Übung. Erst die eigene Zahl, dann die echte.

          Die Zahl trägt Anton und ist so groß, wie das Panel es zulässt — sie
          ist der Inhalt dieses Screens, nicht seine Beschriftung. Solange
          geschätzt wird, steht sie in Warnwestengelb: sie gehört dem Besucher.
          Nach der Auflösung wechselt sie auf Markenorange — das ist dann die
          Zahl des Betriebs, nicht mehr die eigene.
        */}
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={aufgeloest ? 'echt' : 'schaetzung'}
              initial={{ opacity: 0, y: 18, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ type: 'spring', stiffness: 380, damping: 26 }}
              data-testid="m2-zahl"
              className={`kh-zahl ${aufgeloest ? 'text-kh-orange' : ''}`}
            >
              {euro(aufgeloest ? ECHT : wert)}
            </motion.span>
          </AnimatePresence>
          {aufgeloest && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-[1rem] text-kh-mute"
            >
              deine Schätzung: {euro(wert)}
            </motion.span>
          )}
        </div>

        {/* Regler bleibt nach der Auflösung stehen und bekommt die echte Zahl
            als zweite Marke — der Abstand ist der Aha-Moment, nicht eine Note. */}
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
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 24 }}
              className="pointer-events-none absolute top-1 bottom-2 w-[4px] -translate-x-1/2 rounded-full bg-kh-orange"
              style={{ left: `${anteil(ECHT)}%` }}
              aria-hidden
            />
          )}
          <div className="flex justify-between text-[0.9375rem] text-kh-mute/70 tabular-nums">
            <span>{euro(MIN)}</span>
            <span>{euro(MAX)}</span>
          </div>
        </div>
      </div>

      {aufgeloest && (
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
              <span className="shrink-0 text-kh-mute tabular-nums">{euro(p.betrag)}</span>
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
      )}
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
