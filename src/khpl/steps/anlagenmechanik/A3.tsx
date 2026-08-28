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
import { VERLUSTFLAECHEN } from '@/khpl/buehne/anlagenmechanik/zeichnung'
import { Lage } from '@/khpl/komponenten/Lage'
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
 * ---
 *
 * **Was hier umgebaut wurde und warum.**
 *
 * Der Screen war ein Regler von 2 bis 30 Kilowatt: „Schätz, wie viel Wärme
 * dieses Haus braucht." Zwei Dinge sprachen dagegen.
 *
 *  1. **Kilowatt ist für die Zielgruppe kein Anker.** Ein Schätzmoment lebt
 *     davon, dass eine Vorstellung widerlegt wird (M2: der Dachpreis). Wer
 *     nie mit Kilowatt umgegangen ist, hat keine Vorstellung,
 *     die widerlegt werden könnte — er zieht irgendwohin, und die Auflösung
 *     korrigiert nichts.
 *  2. **Es war der dritte Rate-Regler der Anwendung** (M2, C2, A3) und der
 *     zweite in diesem Tag (A6 ist der andere).
 *
 * Statt zu raten, **sucht** der Besucher jetzt: Er tippt die vier Flächen an,
 * über die dieses Haus seine Wärme verliert — Dach, Außenwand, Fenster,
 * Kellerdecke. Jede meldet ihren Anteil als Pfeil auf der Zeichnung. Erst
 * wenn alle vier gefunden sind, steht die Heizlast da, und dann steht sie als
 * **Ergebnis des Hinsehens** und nicht als Auflösung eines Ratespiels.
 *
 * ⚠️ **Damit hat dieser Tag keinen Schätzmoment mehr**, und khpl-tage.md 1
 * führt A3 als „den einen Schätzmoment dieses Tages" (Mechanismus 3). Das ist
 * **gemeldet und nicht heimlich geändert**: Der Mechanismus bleibt der
 * Anwendung erhalten (M2 beim Dachdecker, C2 beim Zimmerer), und der Grund für
 * die Abweichung — Kilowatt taugt nicht als Schätzgröße für Sechzehnjährige —
 * gehört mit der Copy abgenommen.
 *
 * **Ein Balken, keine Zahl je Fläche.** Wie viel ein Dach wirklich verliert,
 * hängt an Dämmstärke, Fläche und Baujahr; eine Zahl je Fläche wäre erfunden.
 * Der Anteil ist deshalb relativ, wie der Druckverlust in A4 — die eine
 * belegte Zahl des Screens ist die Heizlast, und sie steht in der Auflösung.
 *
 * **`answers.a3`** `{ verluste, aufgeloest }`.
 */

// ---------------------------------------------------------------------------
// Text und Zahlen — gebündelt oben (flow 8.4)
// ---------------------------------------------------------------------------

/**
 * Was jede Verlustfläche über sich erzählt, wenn man sie antippt.
 *
 * **Je ein Satz, kein Fachtext.** Die Fläche ist schon markiert, der Pfeil
 * zeigt schon die Richtung; der Satz sagt nur, warum ausgerechnet dort so viel
 * hinausgeht. Reihenfolge und Ids kommen aus `VERLUSTFLAECHEN`.
 */
const VERLUST_TEXT: Record<string, string> = {
  dach: 'Wärme steigt nach oben, und über dem Obergeschoss liegt nichts als alte Dachpfannen. Die größte Fläche und die dünnste Stelle zugleich.',
  wand: 'Fünfunddreißig Zentimeter Mauerwerk, außen nichts davor. Das war 1972 normal — heute ist es die Fläche, an der am meisten zu holen ist.',
  fenster:
    'Zweifach verglast, Rahmen aus Holz. Ein Quadratmeter Fenster verliert ein Vielfaches von einem Quadratmeter gedämmter Wand.',
  keller:
    'Der Keller wird nicht beheizt und ist trotzdem nur eine Betondecke vom Wohnzimmer entfernt. Kalte Füße kommen von hier.',
}

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

export function A3() {
  const gespeichert = useFortschritt().answers.a3
  const [verluste, setVerluste] = useState<string[]>(() => gespeichert?.verluste ?? [])
  const [aufgeloest, setAufgeloest] = useState(() => !!gespeichert?.aufgeloest)
  /** Welche Fläche gerade erklärt wird — nur Anzeige, nicht Fortschritt. */
  const [offen, setOffen] = useState<string | null>(() => null)

  const alle = verluste.length >= VERLUSTFLAECHEN.length

  const tippe = (id: string) => {
    setOffen(id)
    if (verluste.includes(id)) return
    const neu = [...verluste, id]
    setVerluste(neu)
    merkeAntwort('a3', { verluste: neu, aufgeloest: false })
  }

  const aufloesen = () => {
    setAufgeloest(true)
    merkeAntwort('a3', { verluste, aufgeloest: true })
  }

  return (
    <StepShell
      id="A3"
      auftrag={
        aufgeloest
          ? null
          : alle
            ? 'Rechne die Heizlast nach.'
            : 'Tipp an, wo dieses Haus seine Wärme verliert.'
      }
      // Antippen erklärt sich selbst; die vier Flächen tragen einen limetten
      // Ring, solange sie nicht gefunden sind (`komponenten/gesten.ts`).
      ansage={null}
      buehneInteraktiv={!aufgeloest}
      interaktionOffen={!aufgeloest}
      // Die Schätzphase bleibt schmal und konzentriert; die Auflösung braucht
      // die Breite für den Zweispalter aus Zahl und Jahresbilanz.
      karteBreit={aufgeloest}
      buehne={
        <Schnitt
          zustand={{ szene: 'haus', verluste, offen, aufgeloest }}
          onVerlust={aufgeloest ? undefined : tippe}
        />
      }
      warum={
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
        <Wechsel takt={aufgeloest ? 'aufgeloest' : (offen ?? 'suchen')}>
          {aufgeloest ? <Aufloesung /> : <Suche verluste={verluste} offen={offen} />}
        </Wechsel>
      }
      fuss={
        <StepFuss
          id="A3"
          uebungOffen={!aufgeloest}
          aktion={
            aufgeloest ? null : (
              <Button
                variant="aktion"
                onClick={aufloesen}
                disabled={!alle}
                data-testid="a3-aufloesen"
                // `grayscale` zusätzlich zur Deckkraft: Ob der Knopf „noch
                // nicht" oder „jetzt" sagt, muss man am Kiosk im Vorbeigehen
                // sehen (R8, wie in A4).
                className="disabled:grayscale"
              >
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
// Takt 1 — suchen
// ---------------------------------------------------------------------------

/**
 * Was im Panel steht, während die vier Flächen gesucht werden.
 *
 * **Eine Ergebnisfläche, kein Stapel** — dieselbe Lösung wie in A1: Die zweite
 * Fläche schreibt ihren Satz dorthin, wo die erste stand. Was schon gefunden
 * ist, steht als Pfeil auf der Zeichnung und muss im Panel nicht noch einmal
 * aufgezählt werden.
 */
function Suche({ verluste, offen }: { verluste: string[]; offen: string | null }) {
  const flaeche = VERLUSTFLAECHEN.find((f) => f.id === offen)
  const fehlen = VERLUSTFLAECHEN.length - verluste.length

  return (
    <div className="flex flex-col gap-3">
      {/*
        **Der Einsatz, sichtbar.** Auf Übungs-Steps zeigt die Hülle den
        Warum-Bereich nicht an (`komponenten/Lage.tsx`); ohne diese Zeile tippt
        man auf ein Haus, ohne zu wissen, wofür. Der Einsatz ist konkret und
        teuer: Danach wird eine Anlage bestellt.
      */}
      <Lage>
        Bevor eine Wärmepumpe bestellt wird, muss feststehen, wie viel Wärme dieses Haus
        überhaupt braucht. Zu klein gekauft friert die Familie, zu groß gekauft zahlt sie
        jahrelang drauf.
      </Lage>

      {flaeche ? (
        <div className="kh-feld px-4 py-3" data-testid="a3-verlust">
          <div className="flex items-baseline justify-between gap-3">
            <p className="kh-etikett">{flaeche.label}</p>
            <span className="text-[0.9375rem] text-kh-mute">
              {flaeche.staerke >= 0.9
                ? 'größter Anteil'
                : flaeche.staerke >= 0.6
                  ? 'großer Anteil'
                  : 'kleinerer Anteil'}
            </span>
          </div>
          {/* Ein Balken, keine Zahl — dieselbe Währung wie der Druckverlust in
              A4, und aus demselben Grund (`VERLUSTFLAECHEN`). */}
          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full border border-kh-line bg-white/10">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: flaeche.staerke }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: 'left' }}
              className="h-full rounded-full bg-kh-orange/45 ring-1 ring-kh-orange ring-inset"
              aria-hidden
            />
          </div>
          <p className="mt-2 text-[1.0625rem] leading-[1.45] text-kh-paper/90">
            {VERLUST_TEXT[flaeche.id]}
          </p>
        </div>
      ) : (
        <p className="px-1 text-[1rem] text-kh-paper/70">
          Vier Flächen, über die es warm nach draußen geht. Wie viel jede davon kostet,
          hängt an Dämmung und Fläche — deshalb steht hier ein Balken und keine Zahl.
        </p>
      )}

      <p className="text-[0.9375rem] text-kh-mute" data-testid="a3-fehlen">
        {fehlen > 0
          ? `Noch ${fehlen} von ${VERLUSTFLAECHEN.length} Flächen.`
          : 'Alle vier gefunden. Jetzt lässt sich die Heizlast rechnen.'}
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Takt 2 — auflösen. Zuerst das warme Haus, dann die Zahl, dann die Bilanz.
// ---------------------------------------------------------------------------

function Aufloesung() {
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
          {/* Der Körper-Anker zur Zahl (R12): ein Wasserkocher zieht rund
              zwei Kilowatt — das kennt jeder aus der Küche. */}
          <p className="mt-2 text-[1rem] leading-[1.4] text-kh-mute">
            {ZIEL.von} bis {ZIEL.bis} Kilowatt — so viel ziehen fünf bis sieben
            Wasserkocher gleichzeitig.
          </p>
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
          {/* 7,4 t brauchen einen Körper-Anker (R12): ein Kleinwagen wiegt
              rund anderthalb Tonnen. */}
          <p className="mt-2.5 text-[1.0625rem] leading-[1.45] text-kh-paper/80">
            7,4 Tonnen — das wiegt so viel wie fünf Kleinwagen.
          </p>
          <p className="mt-1.5 text-[1.0625rem] leading-[1.45] text-kh-paper/80">
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
      variants={{
        aus: { opacity: 0, transform: 'translateY(14px)' },
        an: { opacity: 1, transform: 'translateY(0px)' },
      }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
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
          {HAUS.flaeche} Quadratmeter sind das {ZIEL.von} bis {ZIEL.bis} Kilowatt — fünf
          bis sieben Wasserkocher gleichzeitig. Das ist die Faustformel; im Einzelfall
          liegt sie um ein Fünftel daneben. Verbindlich wird erst die Rechnung Raum für
          Raum: jedes Fenster, jede Außenwand.
        </DialogDescription>
      </DialogContent>
    </Dialog>
  )
}
