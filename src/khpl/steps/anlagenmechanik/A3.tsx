import { useState } from 'react'
import { motion } from 'motion/react'
import { Schnitt } from '@/khpl/buehne/anlagenmechanik/Schnitt'
import { VERLUSTFLAECHEN } from '@/khpl/buehne/anlagenmechanik/zeichnung'
import { Lage } from '@/khpl/komponenten/Lage'
import { Wahlflaeche } from '@/khpl/komponenten/Wahlflaeche'
import { Wechsel } from '@/khpl/komponenten/Wechsel'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { merkeAntwort, useFortschritt } from '@/khpl/store/fortschritt'

/**
 * A3 — Wie viel Wärme braucht dieses Haus? **Der eine Schätzmoment dieses
 * Tages** und der Screen, der `sinn: 1`
 * einlöst — und seit diesem Umbau wieder wirklich ein Schätzmoment.
 *
 * ---
 *
 * **Was hier umgebaut wurde und warum.**
 *
 * Die Vorfassung ließ vier Verlustflächen auf dem Schnitt suchen (Dach, Wand,
 * Fenster, Kellerdecke, je mit Balken und Satz), nannte DIN EN 12831, öffnete
 * einen Dialog mit der Faustformel und stellte die Jahresbilanz alt gegen neu
 * als Tabelle mit Standvermerk daneben. Jedes Stück für sich begründet —
 * zusammen fünf Ideen auf einem Kiosk-Screen, an dem jemand mit vierzehn im
 * Vorbeigehen steht. Abgenommen wurde: **zu komplex.** Der Screen hat jetzt
 * genau einen Bogen: *rate, sieh die echte Zahl, versteh, was sie heißt.*
 *
 * **Geraten wird in Wasserkochern, nicht in Kilowatt.** Der alte kW-Regler
 * flog seinerzeit zu Recht raus: ein Schätzmoment lebt davon, dass eine
 * Vorstellung widerlegt wird, und „14 Kilowatt" ist für die Zielgruppe keine
 * Vorstellung. Die Flächensuche, die ihn ersetzte, hatte aber gar keinen
 * Schätzmoment mehr — und A3 ist der eine dieses Tages.
 * Der Ausweg: dieselbe Zahl in einer Einheit, zu der jeder eine Vorstellung
 * hat. Ein Wasserkocher aus der Küche zieht rund 2 kW; die Heizlast des
 * Referenzhauses liegt nach DIN EN 12831 bei 10–14 kW — macht ehrlich
 * gerundet **fünf bis sieben
 * Wasserkocher, alle gleichzeitig**. Drei Antippflächen statt eines Reglers:
 * der abgeschaffte dritte Rate-Regler der Anwendung kommt nicht zurück, und
 * `tippen` braucht keine Ansage (`komponenten/gesten.ts`).
 *
 * **Die Reihenfolge der Auflösung kommt aus den Interviews:** zuerst steht
 * da, dass es in diesem Haus im Winter warm bleibt —
 * dasselbe warm wie vorher, für die Familie ändert sich nichts. Danach die
 * Zahl. Die Klimazeile ist die zweite Zeile, nicht die Überschrift, und auf
 * einen Satz mit Gewichts-Anker eingedampft: 7,4 → 2,4 t CO₂ im Jahr
 * (UBA-Strommix 344 g/kWh, 2025 vorläufig; JAZ 3,4 aus der
 * Feldmessung des Fraunhofer ISE) sind rund 5 t gespart — so viel wiegen vier
 * kleine Autos à gut einer Tonne. **Tonlage unverändert:** kein Werbescreen, keine
 * Wertung des Vorbesitzers, keine Politik. Wer eine Ölheizung zu Hause hat,
 * sitzt vielleicht daneben — deshalb steht weiter auf dem Screen, dass die
 * alte Anlage kein Fehler war, sondern jahrzehntelang normal.
 *
 * **Was der Kürzung zum Opfer fiel:** die DIN-Nennung, die Tabelle
 * Verbrauch/CO₂, der Formel-Dialog, die Vier-Flächen-Suche samt Balken. Die
 * Herkunft der Zahlen steht als leiser Schlusssatz direkt in der Auflösung —
 * der Stand bleibt damit auf dem Screen, als ein Satz statt als
 * Fußnotenblock. **Bewusst keine `AhaKarte` und kein tragendes `warum`:** die
 * `StepShell` friert `leseStep` beim Mounten ein (`auftrag !== null` ⇒
 * Übungs-Step), und Übungs-Steps zeigen die Klappzeile mit `warum` und `aha`
 * nicht an — beides erschiene erst beim Wiederbesuch. Was der Screen braucht,
 * steht deshalb inline: die Hausdaten im Rate-Takt, der Stand in der
 * Auflösung; `warum` bleibt nur als Zugabe für den Wiederbesuch deklariert.
 * Wer alt gegen neu ausführlich sehen will, bekommt dafür den Abstecher A3.1
 * „Wärmepumpe gegen Ölkessel" angeboten (`StepFuss` leitet ihn aus dem
 * Graphen ab). **Keine Euro-Beträge**, wie gehabt: Öl- und Strompreis sind
 * Tagespreise, ein Kiosk läuft Monate.
 *
 * **Die Bühne bleibt dieselbe** (`Schnitt`, Szene `haus`), nur passiv: solange
 * geraten wird, verliert das kalte Haus sichtbar Wärme (`Waermebedarf` in
 * `Haus.tsx`); mit der Auflösung färbt es sich zum ersten Mal, und die vier
 * Pfeile aus `VERLUSTFLAECHEN` zeigen, wo die Wärme rausgeht — als das eine
 * einfache Bild des Screens, nicht mehr als Tipp-Aufgabe.
 *
 * **`answers.a3`** `{ tipp }` — die Auflösung folgt dem Tipp sofort, ein
 * eigenes `aufgeloest`-Flag trüge also nichts; der Rückblick in A7 liest
 * direkt `tipp`. Die Form prüft `pruefeAntworten` in `store/fortschritt.ts`.
 */

// ---------------------------------------------------------------------------
// Text und Zahlen — gebündelt oben
// ---------------------------------------------------------------------------

/** Das Zielfenster für das Referenzhaus, in Kilowatt (DIN EN 12831). */
const ZIEL = { von: 10, bis: 14 } as const

/** Dieselbe Zahl in Wasserkochern à ~2 kW — der Anker, in dem geraten wird. */
const KOCHER = { von: 5, bis: 7 } as const

/**
 * Die drei Antworten, die man antippen kann.
 *
 * Deutlich auseinander, damit die eigene Vorstellung wirklich widerlegt oder
 * bestätigt wird — 2 ist „ein Zimmer", 20 ist „ein halbes Schwimmbad". Die Ids
 * sind Wörter statt Zahlen, weil sie als `answers.a3.tipp` in den Store gehen.
 */
const TIPPS = [
  { id: 'zwei', label: '2 Wasserkocher' },
  { id: 'sechs', label: '6 Wasserkocher' },
  { id: 'zwanzig', label: '20 Wasserkocher' },
] as const

/**
 * Die Reaktion auf den eigenen Tipp: Danebenliegen ist Inhalt, nie
 * Versagen. Der Fallback fängt einen manipulierten oder uralten Store ab.
 */
function einordnung(tipp: string): string {
  switch (tipp) {
    case 'zwei':
      return 'Du hast auf 2 getippt — es ist mehr. So ein altes Haus verliert viel Wärme. Mehr, als man denkt.'
    case 'sechs':
      return 'Du hast auf 6 getippt — Volltreffer. Genau in dem Bereich liegt es.'
    case 'zwanzig':
      return 'Du hast auf 20 getippt — ganz so viel ist es nicht. Aber die Richtung stimmt: Ein Haus braucht richtig viel.'
    default:
      return 'Genau in diesem Bereich liegt es.'
  }
}

/** Nach der Auflösung zeigt die Zeichnung alle vier Verlustpfeile — als Bild. */
const ALLE_VERLUSTE = VERLUSTFLAECHEN.map((f) => f.id)

export function A3() {
  const gespeichert = useFortschritt().answers.a3
  const [tipp, setTipp] = useState<string | null>(() => gespeichert?.tipp ?? null)
  // Ein Tipp löst sofort auf — der eine Bogen dieses Screens.
  const aufgeloest = tipp !== null

  const rate = (id: string) => {
    setTipp(id)
    merkeAntwort('a3', { tipp: id })
  }

  return (
    <StepShell
      id="A3"
      auftrag={
        aufgeloest
          ? null
          : // „Am kältesten Wintertag": die 10–14 kW sind die Heizlast des
            // Auslegungstags, nicht ein Winter-Dauerwert — die Frage muss
            // dieselbe Zahl meinen wie die Auflösung.
            'Rate: Wie viele Wasserkocher bräuchte es, um dieses Haus am kältesten Wintertag warm zu halten?'
      }
      // Drei Antippflächen erklären sich selbst; `tippen` bekommt nie eine
      // Ansage (`komponenten/gesten.ts`).
      ansage={null}
      interaktionOffen={!aufgeloest}
      buehne={
        // Passiv: kein `onVerlust`. Vor der Auflösung verliert das kalte Haus
        // sichtbar Wärme, danach färbt es sich und die vier Pfeile stehen da.
        <Schnitt
          zustand={{
            szene: 'haus',
            verluste: aufgeloest ? ALLE_VERLUSTE : [],
            offen: null,
            aufgeloest,
          }}
        />
      }
      // Nur eine Zugabe für den Wiederbesuch: beim ersten Besuch ist A3 ein
      // Übungs-Step und zeigt die Klappzeile nicht (siehe Kopfkommentar) —
      // die Hausdaten stehen deshalb zusätzlich inline im Rate-Takt.
      warum={
        <p>
          Einfamilienhaus aus den Siebzigern, 140 Quadratmeter, nie gedämmt. Im Keller
          steht eine alte Ölheizung. Durch Dach, Wände und Fenster geht viel Wärme
          verloren — dafür wird gerade eine neue Heizung geplant.
        </p>
      }
      interaktion={
        <Wechsel takt={aufgeloest ? 'aufgeloest' : 'raten'}>
          {aufgeloest ? <Aufloesung tipp={tipp} /> : <Frage onTipp={rate} />}
        </Wechsel>
      }
      fuss={
        <StepFuss
          id="A3"
          uebungOffen={!aufgeloest}
          aktion={null}
          geschafft={aufgeloest ? 'Geschätzt' : null}
        />
      }
    />
  )
}

// ---------------------------------------------------------------------------
// Takt 1 — raten
// ---------------------------------------------------------------------------

function Frage({ onTipp }: { onTipp: (id: string) => void }) {
  return (
    <div className="flex flex-col gap-3">
      {/* Die Hausdaten inline: das `warum` der Hülle erscheint auf
          Übungs-Steps nicht (siehe Kopfkommentar), und ohne diese Zeile rät
          man über ein Haus, von dem man nichts weiß. */}
      <p className="px-1 text-[1rem] text-kh-paper/70">
        Das Haus: gebaut in den Siebzigern, 140 Quadratmeter, nie gedämmt. Im Keller steht
        eine alte Ölheizung.
      </p>

      {/*
        Der Einsatz, sichtbar (`komponenten/Lage.tsx`): ohne diese Zeile tippt
        man auf Wasserkocher, ohne zu wissen, wofür. Er ist konkret und teuer —
        danach wird eine Anlage bestellt.
      */}
      <Lage>
        Bevor die neue Heizung bestellt wird, muss klar sein, wie viel Wärme dieses Haus
        braucht. Zu klein: Die Familie friert. Zu groß: Sie zahlt drauf.
      </Lage>

      {/* Der Raten-Haken, in Panel-Form statt als Ansage: Wortlaut und Grund
          wie `RATEN_HAKEN` (gesten.ts), aber `tippen` bekommt keine Ansage. */}
      <p className="px-1 text-[1rem] text-kh-paper/70">
        Wissen kann das niemand — tipp einfach. Gleich siehst du die echte Zahl.
      </p>

      <div className="flex flex-col gap-2">
        {TIPPS.map((t) => (
          <Wahlflaeche
            key={t.id}
            form="zeile"
            onClick={() => onTipp(t.id)}
            data-testid={`a3-tipp-${t.id}`}
          >
            {t.label}
          </Wahlflaeche>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Takt 2 — auflösen. Zuerst das warme Haus, dann die Zahl, dann das Klima.
// ---------------------------------------------------------------------------

function Aufloesung({ tipp }: { tipp: string }) {
  return (
    <motion.div
      initial="aus"
      animate="an"
      variants={{ an: { transition: { staggerChildren: 0.55 } } }}
      className="flex flex-col gap-4"
    >
      {/* Zuerst der Mensch, dann die Zahl — die Reihenfolge aus den Interviews. */}
      <Takt>
        <p className="kh-titel-klein text-kh-paper" data-testid="a3-warm">
          Warm bleibt es.
        </p>
        <p className="mt-1.5 text-[1.0625rem] leading-[1.45] text-kh-paper/80">
          In den Keller kommt eine Wärmepumpe statt der alten Ölheizung. Genauso warm wie
          vorher — für die Familie ändert sich im Winter nichts. Nur Öl bestellt niemand
          mehr.
        </p>
      </Takt>

      <Takt>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span data-testid="a3-ziel" className="kh-zahl text-kh-orange">
            {KOCHER.von}–{KOCHER.bis}
          </span>
          <span className="font-display text-[1.5rem] leading-none text-kh-orange">
            Wasserkocher
          </span>
        </div>
        <p className="mt-2 text-[1.0625rem] leading-[1.45] text-kh-paper/80">
          {einordnung(tipp)}
        </p>
        {/* Kilowatt kommt vor — aber übersetzt an Ort und Stelle. Und
            „am kältesten Tag", weil die 10–14 kW die Heizlast des
            Auslegungstags sind, kein Winter-Dauerwert. */}
        <p className="mt-1.5 text-[1rem] leading-[1.4] text-kh-mute">
          Fachleute messen das in Kilowatt: {ZIEL.von} bis {ZIEL.bis} sind es hier am
          kältesten Tag. Ein Wasserkocher hat ungefähr 2. Die Pfeile am Haus zeigen, wo
          die Wärme rausgeht.
        </p>
      </Takt>

      {/* Das Klima als zweite Zeile, nicht als Überschrift — und ohne Wertung
          des Vorbesitzers. */}
      <Takt>
        <p
          className="text-[1.0625rem] leading-[1.45] text-kh-paper/80"
          data-testid="a3-klima"
        >
          Und das Klima? Die Wärmepumpe spart hier jedes Jahr rund 5 Tonnen CO₂ — so viel
          wiegen vier kleine Autos. Die alte Ölheizung war trotzdem kein Fehler. Sie war
          jahrzehntelang ganz normal.
        </p>
        {/* Der Stand gehört auf den Screen und nicht in eine Fußnote — die
            Faktoren dahinter kommen jedes Jahr neu. Nur eben als
            ein leiser Satz statt als Block. */}
        <p className="mt-2 text-[0.875rem] leading-[1.4] text-kh-mute/80">
          Die Wärme rechnen Fachleute für jedes Haus einzeln aus, Raum für Raum. Die
          Klima-Zahlen kommen vom Umweltbundesamt und aus einer Messung des
          Fraunhofer-Instituts. Stand: August 2026.
        </p>
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
