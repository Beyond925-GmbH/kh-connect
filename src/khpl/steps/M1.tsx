import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AhaKarte } from '@/khpl/komponenten/AhaKarte'
import { Begriff } from '@/khpl/komponenten/Begriff'
import { StepFuss, useStepNavigation } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { merkeAntwort } from '@/khpl/store/fortschritt'

/**
 * M1 — Der erste Termin.
 *
 * Übung: Checkliste zum Abhaken (khpl-flow.md 7 M1). Zehn Punkte, sechs
 * gehören dazu. Ankreuzen, nicht ziehen — schnell und eindeutig.
 *
 * Der grüne Board-Sticky trägt den Step: „Ortstermin ist halbe Detektivarbeit.“
 * Das ist die Haltung, die die Liste braucht — es geht nicht ums Abhaken,
 * sondern ums Suchen. Und der Satz „Der Kunde kauft kein Holz, sondern
 * Sicherheit über seinem Kopf“ geht als Aha-Karte so aufs Deck, wie er
 * dasteht.
 *
 * Bewusst weggelassen (flow 7 M1, `ENTSCHEIDUNG – kann die KHPL kippen`):
 * „Anfahrt und Beratung sind meist unbezahlte Zeit.“ Für Betriebsinhaber
 * interessant, für eine 15-Jährige am Messestand ein Grund abzuschalten.
 */

// ---------------------------------------------------------------------------
// Text — gebündelt oben in der Datei (flow 8.4). Tabelle wörtlich aus flow 11.
// ---------------------------------------------------------------------------

const FRAGE = 'Was nimmst du vom Ortstermin mit zurück in den Betrieb?'

interface Punkt {
  id: string
  text: string
  richtig: boolean
  /** Begründung im Feedback — je Punkt einer, wörtlich aus flow 11 (M1). */
  grund: string
}

const PUNKTE: Punkt[] = [
  {
    id: 'aufmass',
    text: 'Aufmaß des Dachs — Länge, Breite, Neigung',
    richtig: true,
    grund:
      'Ohne Maße kein Angebot. Für die Kante reicht der Zollstock, für den First nimmst du den Laser.',
  },
  {
    id: 'fotos',
    text: 'Fotos vom Bestand',
    richtig: true,
    grund: 'Im Betrieb erinnert sich niemand an das, was du gesehen hast. Fotos schon.',
  },
  {
    id: 'balken',
    text: 'Zustand der alten Balken — Feuchte, Schädlinge, Fäulnis',
    richtig: true,
    grund: 'Der Kunde weiß meist nicht, dass sein Dachstuhl feucht ist. Du siehst es.',
  },
  {
    id: 'kran',
    text: 'Zufahrt und Stellfläche für den Kran',
    richtig: true,
    grund:
      'Kommt der Kran nicht hin, ändert sich das ganze Angebot. Besser jetzt gemerkt als am Aufrichtetag.',
  },
  {
    id: 'budget',
    text: 'Wunsch und Budget des Kunden',
    richtig: true,
    grund:
      'Was er will und was er ausgeben kann, sind zwei Fragen. Beide musst du stellen.',
  },
  {
    id: 'anschluesse',
    text: 'Anschlüsse: Schornstein, Gauben, Nachbargebäude',
    richtig: true,
    grund: 'Alles, was durchs Dach geht oder daran stößt, ist Mehrarbeit.',
  },
  {
    id: 'material',
    text: 'Das Material gleich bestellen',
    richtig: false,
    grund:
      'Noch nicht. Es gibt weder Auftrag noch Abbundplan — und ohne den weißt du nicht, was du brauchst.',
  },
  {
    id: 'preis',
    text: 'Dem Kunden einen Preis nennen',
    richtig: false,
    grund:
      'Aus dem Bauch? Das kostet dich entweder den Auftrag oder die Marge. Der Preis kommt aus der Kalkulation.',
  },
  {
    id: 'statik',
    text: 'Die Statik berechnen',
    richtig: false,
    grund: 'Die kommt vom Statiker. Ihr baut nach ihr — ihr erfindet sie nicht.',
  },
  {
    id: 'termin',
    text: 'Den Aufrichtetermin fest zusagen',
    richtig: false,
    grund:
      'Verlockend. Aber ohne Kran, Wetter und Lieferzeiten ist jedes Datum geraten. Termine kommen in Schritt 3.',
  },
]

const RICHTIGE = PUNKTE.filter((p) => p.richtig).length

/**
 * Anzeigereihenfolge, richtig und falsch verschränkt. In der Reihenfolge der
 * Spec-Tabelle stehen erst alle sechs richtigen, dann alle vier falschen — im
 * Zweispalter wären die Fallen dann die letzten beiden Zeilen, und die Übung
 * ließe sich an der Position lösen statt am Inhalt.
 *
 * Fest verdrahtet statt zufällig: eine Reihenfolge, die sich bei jedem Rendern
 * ändert, macht das Zurückspringen aus „Dein Weg“ unbrauchbar.
 */
const REIHENFOLGE = [
  'aufmass',
  'material',
  'fotos',
  'preis',
  'balken',
  'statik',
  'kran',
  'termin',
  'budget',
  'anschluesse',
]

const ANGEZEIGT = REIHENFOLGE.map((id) => PUNKTE.find((p) => p.id === id)!).filter(
  Boolean,
)

/**
 * Notbehelf: für den Ortstermin gibt es im Bestand kein Motiv (flow 13 —
 * „fehlt vollständig“, Priorität 2 auf der Fotoliste). `quiz-abbund.webp` zeigt
 * das Aufmaß am Sparren, mit Helm und Handschuh — es trägt das Messen, nicht
 * das Gespräch. Beim Fototermin gegen ein echtes Ortstermin-Motiv tauschen.
 */
const BILD = '/medien/media/zimmerer/quiz-abbund.webp'

export function M1() {
  const { weiter } = useStepNavigation('M1')
  const [gewaehlt, setGewaehlt] = useState<string[]>([])
  const [ausgewertet, setAusgewertet] = useState(false)

  const umschalten = (id: string) =>
    setGewaehlt((alt) => (alt.includes(id) ? alt.filter((x) => x !== id) : [...alt, id]))

  const auswerten = () => {
    setAusgewertet(true)
    merkeAntwort('m1', { gewaehlt, ausgewertet: true })
  }

  const treffer = PUNKTE.filter((p) => p.richtig && gewaehlt.includes(p.id))
  const verpasst = PUNKTE.filter((p) => p.richtig && !gewaehlt.includes(p.id))
  const daneben = PUNKTE.filter((p) => !p.richtig && gewaehlt.includes(p.id))

  return (
    <StepShell
      id="M1"
      aufteilung="uebung"
      interaktionOffen={!ausgewertet}
      onWeiter={weiter}
      buehne={<img src={BILD} alt="" aria-hidden className="size-full object-cover" />}
      fachtext={
        <p>
          Ein Anruf, eine Adresse, ein altes Dach. Du fährst hin, misst auf —{' '}
          <Begriff id="aufmass">vom Zollstock bis zum Laser</Begriff> —, machst Fotos und
          hörst zu: Was will der Kunde, was ist möglich. Was du hier übersiehst, fehlt dir
          später im Angebot.
        </p>
      }
      interaktion={
        ausgewertet ? (
          <Auswertung treffer={treffer} verpasst={verpasst} daneben={daneben} />
        ) : (
          <Liste gewaehlt={gewaehlt} onUmschalten={umschalten} onAuswerten={auswerten} />
        )
      }
      aha={
        <AhaKarte sichtbar={ausgewertet} eyebrow="Der eigentliche Punkt">
          Der Kunde kauft kein Holz. Er kauft Sicherheit über seinem Kopf. Deshalb ist der
          Ortstermin halbe Detektivarbeit — und deshalb fährst du als Azubi oft mit.
        </AhaKarte>
      }
      fuss={<StepFuss id="M1" gedaempft={!ausgewertet} />}
    />
  )
}

function Liste({
  gewaehlt,
  onUmschalten,
  onAuswerten,
}: {
  gewaehlt: string[]
  onUmschalten: (id: string) => void
  onAuswerten: () => void
}) {
  return (
    <div className="flex h-full flex-col gap-3">
      <p className="text-[15px] font-normal text-kh-ink">
        {FRAGE} <span className="text-kh-grey/70">Tipp alles an, was dazugehört.</span>
      </p>

      {/* Zwei Spalten in **beiden** Ausrichtungen. Zehn Punkte untereinander
          passen im Hochformat nicht auf einen Screen, und Scrollen ist
          ausgeschlossen (flow 5). */}
      <ul className="grid min-h-0 flex-1 auto-rows-min grid-cols-2 content-start gap-2">
        {ANGEZEIGT.map((p) => {
          const an = gewaehlt.includes(p.id)
          return (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => onUmschalten(p.id)}
                aria-pressed={an}
                data-testid={`m1-${p.id}`}
                className={`flex min-h-[60px] w-full items-center gap-3 rounded-kh border px-4 py-2 text-left text-[15px] transition-colors ${
                  an
                    ? 'border-kh-orange bg-kh-orange/10 text-kh-ink'
                    : 'border-kh-rule bg-kh-surface text-kh-grey hover:border-kh-orange/50'
                }`}
              >
                <span
                  aria-hidden
                  className={`grid size-6 shrink-0 place-items-center rounded-[3px] border transition-colors ${
                    an ? 'border-kh-orange bg-kh-orange' : 'border-kh-rule'
                  }`}
                >
                  {an && <Check className="size-4 text-white" strokeWidth={3} />}
                </span>
                <span className="min-w-0">{p.text}</span>
              </button>
            </li>
          )
        })}
      </ul>

      <div className="flex items-center justify-between gap-3">
        <span className="text-[14px] text-kh-grey/70 tabular-nums">
          {gewaehlt.length} angetippt
        </span>
        <Button
          onClick={onAuswerten}
          disabled={gewaehlt.length === 0}
          data-testid="m1-auswerten"
          className="h-[60px] px-7 text-[16px]"
        >
          Zurück in den Betrieb
        </Button>
      </div>
    </div>
  )
}

/**
 * Auswertung am Ende der Liste (flow 6.5 — hier lehrt nicht die Einzelaktion,
 * sondern das Gesamtbild).
 *
 * Ausgeschrieben wird nur, was danebenging: was gefehlt hat und was zu viel
 * war. Die Treffer stehen als Zeile darunter, ihre Begründung liegt einen Tap
 * entfernt. Zehn Begründungen gleichzeitig passen weder auf den Screen (flow 5,
 * „kein Scrollen“) noch in die Aufmerksamkeit von jemandem, der im Stehen liest.
 *
 * Kein Punktestand, keine Prozentzahl, keine Note (flow 6.6).
 */
function Auswertung({
  treffer,
  verpasst,
  daneben,
}: {
  treffer: Punkt[]
  verpasst: Punkt[]
  daneben: Punkt[]
}) {
  const [offen, setOffen] = useState<string | null>(null)
  const alleGefunden = verpasst.length === 0 && daneben.length === 0
  const zuKlaeren = [...verpasst, ...daneben]

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <p className="text-[16px] font-normal text-kh-ink">
        {alleGefunden
          ? `Alle ${RICHTIGE}. Der Ortstermin sitzt.`
          : `${treffer.length} von ${RICHTIGE} hast du. Das hier ist noch offen:`}
      </p>

      <ul className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overscroll-contain">
        {zuKlaeren.slice(0, 4).map((p) => {
          const gefehlt = !daneben.includes(p)
          return (
            <li
              key={p.id}
              className="rounded-kh border border-kh-rule bg-kh-surface px-4 py-3"
              data-testid={`m1-klaerung-${p.id}`}
            >
              <div className="flex items-start gap-3">
                <span
                  aria-hidden
                  className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full ${
                    gefehlt ? 'bg-kh-orange/15 text-kh-orange' : 'bg-kh-band text-kh-grey'
                  }`}
                >
                  {gefehlt ? (
                    <Check className="size-4" strokeWidth={2.5} />
                  ) : (
                    <X className="size-4" strokeWidth={2.5} />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="text-[15px] font-normal text-kh-ink">{p.text}</p>
                  <p className="mt-0.5 text-[14px] leading-[1.45] text-kh-grey">
                    {p.grund}
                  </p>
                </div>
              </div>
            </li>
          )
        })}

        {treffer.length > 0 && (
          <li className="mt-1">
            <p className="mb-1.5 text-[13px] tracking-[0.12em] text-kh-grey/60 uppercase">
              Hattest du
            </p>
            <ul className="flex flex-col gap-1">
              {treffer.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => setOffen((o) => (o === p.id ? null : p.id))}
                    className="flex w-full items-start gap-2 rounded-kh px-2 py-2 text-left text-[14px] text-kh-grey transition-colors hover:bg-kh-band-soft"
                  >
                    <Check
                      className="mt-0.5 size-4 shrink-0 text-kh-orange"
                      strokeWidth={2.5}
                      aria-hidden
                    />
                    <span className="min-w-0">
                      {p.text}
                      <AnimatePresence initial={false}>
                        {offen === p.id && (
                          <motion.span
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="block overflow-hidden text-kh-grey/80"
                          >
                            {p.grund}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </li>
        )}
      </ul>
    </div>
  )
}
