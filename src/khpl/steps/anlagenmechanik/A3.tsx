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
import { Schnitt } from '@/khpl/buehne/anlagenmechanik/Schnitt'
import { Wechsel } from '@/khpl/komponenten/Wechsel'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { merkeAntwort, useFortschritt } from '@/khpl/store/fortschritt'
import { Fachwort } from './Fachwort'

/**
 * A3 — Wie viel Wärme braucht ein Haus? **Der eine Schätzmoment dieses Tages**
 * (khpl-tage.md 1, Mechanismus 3) und der Screen, der `sinn: 1` einlöst.
 *
 * **Die Reihenfolge der Auflösung ist nach den Interviews gedreht** (Spec 1
 * und 6): zuerst steht da, dass es in diesem Haus im Winter warm ist — dasselbe
 * warm wie vorher, für die Familie ändert sich nichts. **Danach** kommt, womit.
 * Die Klimabilanz ist die zweite Zeile, nicht die Überschrift. Der Grund: der
 * eine Azubi, der direkt nach dem Umweltbeitrag gefragt wurde, musste
 * nachdenken und antwortete über Fahrtwege. Nach dem Beitrag überhaupt gefragt,
 * antwortete derselbe Beruf ohne Zögern über warme Wohnungen.
 *
 * **Vorsicht bei der Tonlage:** kein Werbescreen, keine Wertung des
 * Vorbesitzers, keine Politik. Zwei Zahlen nebeneinander und ein Satz. Wer eine
 * Ölheizung zu Hause hat, sitzt vielleicht daneben — deshalb steht auf dem
 * Screen, dass die alte Anlage kein Fehler war, sondern jahrzehntelang
 * Standard.
 *
 * **Was auf diesem Screen steht und was nicht** (Spec 6 und 11):
 *
 *  - **Heizlast 10–14 kW** für das Referenzhaus — `BELEGT` nach DIN EN 12831,
 *    zeitstabil. Als **Fenster**, nicht als Punktwert: eine Faustformel liegt
 *    im Einzelfall um ±20 % daneben, und verbindlich ist nur die raumweise
 *    Berechnung.
 *  - **CO₂ 7,4 t → 2,4 t im Jahr** — `BELEGT` (UBA-Strommix 344 g/kWh, 2025
 *    vorläufig; JAZ 3,4 aus der Feldmessung des Fraunhofer ISE). Mit sichtbarem
 *    **Stand**, weil beide Faktoren jährlich neu kommen.
 *  - **Keine Euro-Beträge.** Öl- und Strompreis sind Tagespreise (Öl streut
 *    1,00–1,39 €/l); die Spec empfiehlt ausdrücklich, sie wegzulassen und die
 *    CO₂-Zeile zu zeigen — sie ist die stabilere und für diesen Beruf die
 *    wichtigere. Ein Kiosk läuft an vielen Tagen über Monate.
 *
 * **`answers.a3`** `{ schaetzung, aufgeloest }` (Spec 6).
 */

// ---------------------------------------------------------------------------
// Text und Zahlen — gebündelt oben (flow 8.4)
// ---------------------------------------------------------------------------

const MIN = 2
const MAX = 30
const SCHRITT = 0.5
/** Bewusst zu hoch: fast jeder schätzt die Heizlast zu groß — das ist der Punkt. */
const START = 22

/** Das belegte Zielfenster für das Referenzhaus, in Kilowatt. */
const ZIEL = { von: 10, bis: 14 } as const

/** Das Referenzhaus aus `belege/anlagenmechanik.md` — dieselben Annahmen überall. */
const HAUS = { flaeche: 140, spezifisch: { von: 70, bis: 100 } } as const

const BILANZ = [
  {
    was: 'Verbrauch',
    vorher: '≈ 2.800 l Heizöl',
    nachher: '≈ 7.000 kWh Strom',
    gross: false,
  },
  // Die eine Zahl, für die dieser Screen gebaut ist: von 7,4 auf 2,4 Tonnen.
  // Groß genug, um zu wirken, klein genug, um vorstellbar zu bleiben.
  { was: 'CO₂ im Jahr', vorher: '7,4 t', nachher: '2,4 t', gross: true },
] as const

const STAND =
  'Angenommen: Jahresarbeitszahl 3,4 aus einer Feldmessung des Fraunhofer ISE an 77 Anlagen im Bestand. CO₂ je Kilowattstunde Strom: 344 Gramm, Umweltbundesamt für 2025, vorläufig. Stand der Rechnung: August 2026.'

const kw = (n: number) => `${n.toLocaleString('de-DE')} kW`

export function A3() {
  const gespeichert = useFortschritt().answers.a3
  const [wert, setWert] = useState(() => gespeichert?.schaetzung ?? START)
  const [aufgeloest, setAufgeloest] = useState(() => !!gespeichert?.aufgeloest)

  const aufloesen = () => {
    setAufgeloest(true)
    merkeAntwort('a3', { schaetzung: wert, aufgeloest: true })
  }

  return (
    <StepShell
      id="A3"
      interaktionOffen={!aufgeloest}
      // Die Schätzphase bleibt schmal und konzentriert; die Auflösung braucht
      // die Breite für den Zweispalter aus Zahl und Jahresbilanz.
      karteBreit={aufgeloest}
      buehne={
        <Schnitt
          zustand={{
            szene: 'haus',
            schaetzungKw: aufgeloest ? null : wert,
            aufgeloest,
          }}
        />
      }
      fachtext={
        aufgeloest ? undefined : (
          <p>
            Einfamilienhaus, Baujahr in den Siebzigern. {HAUS.flaeche} Quadratmeter
            Wohnfläche, nie gedämmt, Ölheizung im Keller. Wie viel Leistung so ein Haus am
            kältesten Tag braucht, heißt <Fachwort id="heizlast">Heizlast</Fachwort> — und
            sie hängt an Dämmung, Fläche und Fenstern, nicht am Wunschdenken.
          </p>
        )
      }
      interaktion={
        <Wechsel takt={aufgeloest ? 'aufgeloest' : 'schaetzen'}>
          {aufgeloest ? (
            <Aufloesung schaetzung={wert} />
          ) : (
            <Regler wert={wert} onWert={setWert} />
          )}
        </Wechsel>
      }
      fuss={
        <StepFuss
          id="A3"
          uebungOffen={!aufgeloest}
          aktion={
            aufgeloest ? null : (
              <Button variant="aktion" onClick={aufloesen} data-testid="a3-aufloesen">
                Nachrechnen
              </Button>
            )
          }
          geschafft={aufgeloest ? 'Ausgelegt' : null}
        />
      }
    />
  )
}

// ---------------------------------------------------------------------------
// Takt 1 — schätzen
// ---------------------------------------------------------------------------

function Regler({ wert, onWert }: { wert: number; onWert: (n: number) => void }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[1.125rem] font-semibold text-kh-paper sm:text-[1.25rem]">
        Zieh, bis du glaubst, es passt.
      </p>

      <span data-testid="a3-zahl" className="kh-zahl">
        {kw(wert)}
      </span>

      <div className="relative" data-wisch="aus">
        <input
          type="range"
          min={MIN}
          max={MAX}
          step={SCHRITT}
          value={wert}
          onChange={(e) => onWert(Number(e.target.value))}
          data-testid="a3-regler"
          aria-label="Wie viel Leistung braucht dieses Haus?"
          className="kh-regler w-full"
        />
        <div className="flex justify-between text-[0.9375rem] text-kh-mute/70 tabular-nums">
          <span>{kw(MIN)}</span>
          <span>{kw(MAX)}</span>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Takt 2 — auflösen. Zuerst das warme Haus, dann die Zahl, dann die Bilanz.
// ---------------------------------------------------------------------------

function Aufloesung({ schaetzung }: { schaetzung: number }) {
  const drin = schaetzung >= ZIEL.von && schaetzung <= ZIEL.bis

  return (
    <motion.div
      initial="aus"
      animate="an"
      variants={{ an: { transition: { staggerChildren: 0.55 } } }}
      className="flex flex-col gap-4 landscape:grid landscape:grid-cols-[1fr_1.05fr] landscape:items-start landscape:gap-x-7"
    >
      <div className="flex flex-col gap-3">
        {/* Zuerst der Mensch, dann die Bilanz (Spec 1). */}
        <Takt>
          <p className="kh-titel-klein text-kh-paper" data-testid="a3-warm">
            Warm bleibt es.
          </p>
          <p className="mt-1.5 text-[1.0625rem] leading-[1.45] text-kh-paper/80">
            Genauso warm wie vorher. Für die Familie, die hier wohnt, ändert sich im
            Winter nichts — außer, dass niemand mehr Öl bestellt.
          </p>
        </Takt>

        <Takt>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span data-testid="a3-ziel" className="kh-zahl text-kh-orange">
              {ZIEL.von}–{ZIEL.bis}
            </span>
            <span className="font-display text-[1.5rem] leading-none text-kh-orange">
              kW
            </span>
          </div>
          <Vergleich schaetzung={schaetzung} drin={drin} />
          <div className="pt-2.5">
            <Rechnung />
          </div>
        </Takt>
      </div>

      <Takt>
        <div className="flex flex-col" data-testid="a3-bilanz">
          <div className="flex items-baseline justify-between gap-3 pb-1.5">
            <span className="kh-etikett">Vorher · Ölkessel</span>
            <span className="kh-etikett">Nachher · Wärmepumpe</span>
          </div>
          {BILANZ.map((z) => (
            <div key={z.was} className="border-b border-kh-line py-2 last:border-0">
              <p className="text-[0.9375rem] text-kh-mute">{z.was}</p>
              <div className="flex items-baseline justify-between gap-3">
                <span
                  className={`text-kh-paper tabular-nums ${
                    z.gross
                      ? 'font-display text-[clamp(1.6rem,1.2rem+1.1vw,2.1rem)] leading-none'
                      : 'text-[1.0625rem]'
                  }`}
                >
                  {z.vorher}
                </span>
                <span
                  className={`tabular-nums ${
                    z.gross
                      ? 'font-display text-[clamp(1.6rem,1.2rem+1.1vw,2.1rem)] leading-none text-kh-orange'
                      : 'text-[1.0625rem] text-kh-paper'
                  }`}
                >
                  {z.nachher}
                </span>
              </div>
            </div>
          ))}
          <p className="mt-2.5 text-[1.0625rem] leading-[1.45] text-kh-paper/80">
            Dieselbe Wärme, ein Bruchteil der Energie. Die alte Ölheizung war kein Fehler
            — sie war jahrzehntelang Standard. Sie zu ersetzen ist der Job.
          </p>
          {/* Der Stand gehört auf den Screen und nicht in eine Fußnote: die
              beiden Faktoren dahinter kommen jedes Jahr neu (Spec 11). */}
          <p className="mt-2 text-[0.875rem] leading-[1.4] text-kh-mute/80">{STAND}</p>
        </div>
      </Takt>
    </motion.div>
  )
}

/** Ein Beat der Auflösung. Sie kommen nacheinander, nicht auf einmal. */
function Takt({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={{ aus: { opacity: 0, y: 14 }, an: { opacity: 1, y: 0 } }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

/**
 * Der Abstand zwischen der eigenen Zahl und dem belegten Fenster. Kein Regler
 * mehr — eine Skala mit einer Marke und einem Band, und das Band ist die
 * Aussage: die richtige Antwort ist hier ein Bereich, kein Punkt.
 */
function Vergleich({ schaetzung, drin }: { schaetzung: number; drin: boolean }) {
  const anteil = (n: number) => ((n - MIN) / (MAX - MIN)) * 100
  const zuHoch = schaetzung > ZIEL.bis

  return (
    <div className="mt-2.5 flex flex-col gap-2" data-testid="a3-vergleich">
      <div className="relative h-4 w-full rounded-full border border-kh-line bg-white/10">
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.25, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{
            left: `${anteil(ZIEL.von)}%`,
            width: `${anteil(ZIEL.bis) - anteil(ZIEL.von)}%`,
            transformOrigin: 'left',
          }}
          // Kein gefülltes Orange: die eine gefüllte orange Fläche pro Screen
          // ist *Weiter* (khpl-tage.md 3). Das Band ist eine Markierung auf
          // einer Skala, kein Bedienelement.
          className="absolute inset-y-0 rounded-full bg-kh-orange/35 ring-1 ring-kh-orange"
          aria-hidden
        />
        <span
          style={{ left: `${anteil(schaetzung)}%` }}
          className="absolute top-[-7px] bottom-[-7px] w-[6px] -translate-x-1/2 rounded-full bg-kh-paper/70"
          aria-hidden
        />
      </div>
      <p className="text-[1rem] tabular-nums">
        <span className="text-kh-mute">Deine Schätzung </span>
        <span className="font-semibold text-kh-paper/85">{kw(schaetzung)}</span>
        <span className="text-kh-mute"> — </span>
        <span className="font-semibold text-kh-orange">
          {drin ? 'genau im Fenster' : zuHoch ? 'zu groß ausgelegt' : 'knapp bemessen'}
        </span>
      </p>
    </div>
  )
}

/** Antippbar, nicht aufgedrängt — dasselbe Prinzip wie die Mathe-Karte in M2. */
function Rechnung() {
  return (
    <Dialog>
      <DialogTrigger className="rounded-kh-pill border-2 border-kh-line-strong bg-white/5 px-4 py-2.5 text-[1rem] font-medium text-kh-paper/85 transition-transform active:scale-95">
        Woher kommt diese Zahl?
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Fläche mal Wärmeverlust</DialogTitle>
        <DialogDescription>
          Ein ungedämmtes Haus aus den Siebzigern verliert im Winter grob{' '}
          {HAUS.spezifisch.von} bis {HAUS.spezifisch.bis} Watt je Quadratmeter. Mal{' '}
          {HAUS.flaeche} Quadratmeter sind das {ZIEL.von} bis {ZIEL.bis} Kilowatt. Das ist
          die Faustformel — sie liegt im Einzelfall um ein Fünftel daneben. Im Betrieb
          wird deshalb Raum für Raum gerechnet, nach der Norm DIN EN 12831: jedes Fenster,
          jede Außenwand, jede Tür einzeln. Erst diese Rechnung sagt, wie groß die
          Wärmepumpe wird.
        </DialogDescription>
      </DialogContent>
    </Dialog>
  )
}
