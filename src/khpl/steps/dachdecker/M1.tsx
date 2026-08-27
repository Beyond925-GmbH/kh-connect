import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { StepFoto } from '@/khpl/buehne/Foto'
import { AhaKarte } from '@/khpl/komponenten/AhaKarte'
import { Begriff } from '@/khpl/komponenten/Begriff'
import { wahlflaeche } from '@/khpl/komponenten/Wahlflaeche'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { merkeAntwort, useFortschritt } from '@/khpl/store/fortschritt'

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

/**
 * Die Etiketten in `PUNKTE.text` sind bewusst kurz — „Zustand der alten
 * Balken“, nicht „Zustand der alten Balken — Feuchte, Schädlinge, Fäulnis“. Im
 * Zweispalter kostet jede zweizeilige Karte eine ganze Reihe, und bei zehn
 * Punkten war die Übung damit höher als das Panel. Was wegfällt, ist keine
 * Information: die vollständige Begründung steht in `grund` und erscheint in
 * der Auswertung.
 */
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
    text: 'Aufmaß: Länge, Breite, Neigung',
    richtig: true,
    grund: 'Ohne Maße kein Angebot.',
  },
  {
    id: 'fotos',
    text: 'Fotos vom Bestand',
    richtig: true,
    grund: 'Im Betrieb erinnert sich niemand an das, was du gesehen hast. Fotos schon.',
  },
  {
    id: 'balken',
    text: 'Zustand der alten Balken',
    richtig: true,
    grund: 'Der Kunde weiß meist nicht, dass sein Dachstuhl feucht ist. Du siehst es.',
  },
  {
    id: 'kran',
    text: 'Zufahrt für den Kran',
    richtig: true,
    grund: 'Kommt der Kran nicht hin, ändert sich das ganze Angebot.',
  },
  {
    id: 'preis',
    text: 'Einen Preis nennen',
    richtig: false,
    grund: 'Aus dem Bauch? Das kostet dich den Auftrag oder die Marge.',
  },
  {
    id: 'termin',
    text: 'Aufrichtetermin zusagen',
    richtig: false,
    grund: 'Ohne Kran, Wetter und Lieferzeiten ist jedes Datum geraten.',
  },
]

/**
 * **Zwei hat der Chef schon gesagt** — sie stehen beim Ankommen angehakt da.
 *
 * Das ist die Vorführung vor der Abfrage (khpl-vereinfachung.md R1). Vorher
 * lagen hier zehn leere Kästchen und die Aufforderung, aus dem Nichts eine
 * Ortstermin-Checkliste zu erinnern — freies Erinnern von etwas, das man nie
 * gelernt hat. Mit zwei gesetzten Beispielen ist dieselbe Übung
 * Wiedererkennen: „ach so eine Sorte Sache ist gemeint."
 *
 * Abwählbar bleiben sie. Ein Kästchen, das sich nicht anfassen lässt, sieht
 * am Stand nach Defekt aus.
 */
const VORGABE = ['aufmass', 'fotos']

const RICHTIGE = PUNKTE.filter((p) => p.richtig).length

/**
 * Anzeigereihenfolge, richtig und falsch verschränkt. In der Reihenfolge der
 * Spec-Tabelle stehen erst alle sechs richtigen, dann alle vier falschen — im
 * Zweispalter wären die Fallen dann die letzten beiden Zeilen, und die Übung
 * ließe sich an der Position lösen statt am Inhalt.
 *
 * Der erste Anlauf verschränkte nur streng abwechselnd — im Zweispalter, der
 * zeilenweise füllt, landeten damit alle richtigen Antworten in der **linken
 * Spalte**. Die Übung war an der Position lösbar statt am Inhalt. Diese
 * Reihenfolge verteilt beide Sorten über beide Spalten.
 *
 * Fest verdrahtet statt zufällig: eine Reihenfolge, die sich bei jedem Rendern
 * ändert, macht das Zurückspringen aus „Dein Weg“ unbrauchbar.
 */
const REIHENFOLGE = ['aufmass', 'preis', 'fotos', 'balken', 'termin', 'kran']

const ANGEZEIGT = REIHENFOLGE.map((id) => PUNKTE.find((p) => p.id === id)!).filter(
  Boolean,
)

export function M1() {
  // Aus dem Store vorbelegt: wer über „Dein Weg“ zurückspringt, soll seine
  // Auswertung wiederfinden und nicht von vorn anfangen müssen.
  const gespeichert = useFortschritt().answers.m1
  // `??`, nicht `||`: wer alles abgewählt hat und zurückkommt, findet seine
  // leere Liste wieder statt der Vorgabe.
  const [gewaehlt, setGewaehlt] = useState<string[]>(
    () => gespeichert?.gewaehlt ?? VORGABE,
  )
  const [ausgewertet, setAusgewertet] = useState(() => !!gespeichert?.ausgewertet)

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
      auftrag={ausgewertet ? null : 'Tipp an, was du sonst noch mitnimmst.'}
      // Antippen erklärt sich selbst (`komponenten/gesten.ts`).
      ansage={null}
      // Das breite Panel: zehn Chips plus Auswertung brauchen die Fläche in
      // der Breite, sonst holen sie sie sich in der Höhe — und dann scrollt
      // der Screen, was flow 5 ausschließt.
      karteBreit
      interaktionOffen={!ausgewertet}
      // Endlich der Ortstermin selbst: zwei Leute im Gespräch auf der
      // Baustelle, Klemmbrett in der Hand. Vorher lief hier das Aufmaß am
      // Sparren als Notbehelf (flow 13, Priorität 2 der Fotoliste).
      buehne={<StepFoto id="M1" />}
      // Nach der Auswertung fällt der Einstiegstext weg — er ist dann gelesen,
      // und die drei Zeilen fehlen sonst genau der Auswertung, die ohne
      // Scrollen auf den Screen passen muss. M2 macht es genauso.
      warum={
        <p>
          Ein Anruf, eine Adresse, ein altes Dach. Du misst, fotografierst und hörst zu.
          Was du hier übersiehst, fehlt dir später im{' '}
          <Begriff id="aufmass">Angebot</Begriff>.
        </p>
      }
      interaktion={
        ausgewertet ? (
          <Auswertung treffer={treffer} verpasst={verpasst} daneben={daneben} />
        ) : (
          <Liste gewaehlt={gewaehlt} onUmschalten={umschalten} />
        )
      }
      aha={
        <AhaKarte sichtbar={ausgewertet} eyebrow="Was kauft der Kunde eigentlich?">
          Kein Holz. Er kauft Sicherheit über seinem Kopf. Deshalb ist der Ortstermin
          halbe Detektivarbeit — und deshalb fährst du als Azubi mit.
        </AhaKarte>
      }
      fuss={
        <StepFuss
          id="M1"
          uebungOffen={!ausgewertet}
          aktion={
            <Button
              variant="aktion"
              onClick={auswerten}
              disabled={gewaehlt.length === 0}
              data-testid="m1-auswerten"
            >
              Zurück in den Betrieb
              {gewaehlt.length > 0 && (
                <span className="font-display text-[1.375rem] leading-none tabular-nums">
                  {gewaehlt.length}
                </span>
              )}
            </Button>
          }
          geschafft={
            ausgewertet
              ? verpasst.length === 0 && daneben.length === 0
                ? 'Ortstermin sitzt'
                : 'Ausgewertet'
              : null
          }
        />
      }
    />
  )
}

function Liste({
  gewaehlt,
  onUmschalten,
}: {
  gewaehlt: string[]
  onUmschalten: (id: string) => void
}) {
  return (
    <div className="flex flex-col gap-2.5">
      {/* Die Frage stand hier fett und die Aufforderung gleich daneben —
          beides ist jetzt das Auftragsband, auf jedem Screen an derselben
          Stelle. Geblieben ist der Hinweis auf die zwei gesetzten Haken: ohne
          ihn sähen sie aus, als hätte der Screen sich etwas gemerkt. */}
      <p className="text-[1rem] text-kh-mute">Zwei hat dein Chef dir schon gesagt.</p>

      {/* Zwei Spalten in **allen drei** Formaten — auch auf dem Handy. Zehn
          Punkte untereinander sind dort ~950 px Liste in einem 635-px-Panel:
          372 px lagen unter der Scrollkante, und eine Mehrfachauswahl, deren
          Optionen man nicht nebeneinander sieht, ist kein Vergleich mehr.
          Damit die halbe Panelbreite reicht, werden die Chips unterhalb `sm`
          eine Stufe kompakter (Text, Kreis, Polster).

          Die Punkte sind keine Checkbox-Zeilen mehr, sondern Chips: angetippt
          füllt sich der ganze Chip orange und zieht sich einmal zusammen. Eine
          6-px-Checkbox links neben grauem Text ist auf einem Touchscreen die
          leiseste Rückmeldung, die man bauen kann — und diese Übung besteht
          aus nichts anderem als zehnmal antippen. */}
      <ul className="grid auto-rows-min grid-cols-2 content-start gap-1.5 max-sm:gap-1">
        {ANGEZEIGT.map((p) => {
          const an = gewaehlt.includes(p.id)
          return (
            <li key={p.id}>
              <motion.button
                type="button"
                onClick={() => onUmschalten(p.id)}
                aria-pressed={an}
                data-testid={`m1-${p.id}`}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 600, damping: 26 }}
                // `ton="vorlaeufig"`: hier ist das Antippen **vorläufig** —
                // limetter Rand, kaum Füllung: „du hast getippt, geprüft ist
                // noch nichts“ (siehe `Wahlflaeche`). Die satte Signal-Füllung
                // bleibt der Auswertung vorbehalten, die danach die echten
                // Treffer färbt. Orange gehört nach R3 der Welt, nicht der
                // Wahl.
                className={`${wahlflaeche({ ton: 'vorlaeufig', gewaehlt: an })} max-sm:min-h-[44px] max-sm:gap-2 max-sm:px-2.5 max-sm:py-1 max-sm:text-[0.9375rem] max-sm:leading-tight`}
              >
                <span
                  aria-hidden
                  className={`grid size-6 shrink-0 place-items-center rounded-full border-2 transition-colors max-sm:size-5 ${
                    an ? 'border-kh-signal bg-kh-signal' : 'border-white/35'
                  }`}
                >
                  {an && <Check className="size-4 text-[#0E0D0B]" strokeWidth={3.5} />}
                </span>
                <span className="min-w-0">{p.text}</span>
              </motion.button>
            </li>
          )
        })}
      </ul>
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
    // Der Screen baut sich auf, statt alles auf einmal hinzustellen: erst die
    // Zeile, dann die Karten nacheinander, dann die Treffer-Chips. Bewusst
    // dezent (kleiner Versatz, kein Überschwingen) — der Stagger ordnet das
    // Lesen, er soll nicht selbst die Show sein.
    <motion.div
      initial="aus"
      animate="an"
      variants={{ an: { transition: { staggerChildren: 0.09 } } }}
      className="flex flex-col gap-2.5"
    >
      <motion.p
        variants={{
          aus: { opacity: 0, transform: 'translateY(10px)' },
          an: { opacity: 1, transform: 'translateY(0px)' },
        }}
        className="text-[1.125rem] leading-snug font-semibold text-kh-paper sm:text-[1.25rem]"
      >
        {alleGefunden
          ? `Alle ${RICHTIGE}. Der Ortstermin sitzt.`
          : `${treffer.length} von ${RICHTIGE} hast du. Das hier ist noch offen:`}
      </motion.p>

      {/* Zwei Spalten wie die Frage selbst. Untereinander passten schon vier
          Karten weder ins Hoch- noch ins Querformat — und ein `overflow-y-auto`
          macht daraus eine Scrollfläche, also genau das, was flow 5
          ausschließt, statt es zu lösen.

          Die Farbe sagt hier, welche Sorte Fehler es war: was gefehlt hat,
          trägt einen orangen Rand („das hättest du mitnehmen sollen“), was zu
          viel war, bleibt neutral („das gehört hier nicht hin“). */}
      <ul className="grid shrink-0 auto-rows-min grid-cols-1 content-start gap-2 sm:grid-cols-2">
        {zuKlaeren.slice(0, 4).map((p) => {
          const gefehlt = !daneben.includes(p)
          return (
            <motion.li
              key={p.id}
              variants={{
                aus: { opacity: 0, transform: 'translateY(10px)' },
                an: { opacity: 1, transform: 'translateY(0px)' },
              }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className={`rounded-kh border-2 px-3.5 py-2.5 ${
                gefehlt
                  ? 'border-kh-orange/45 bg-kh-orange/10'
                  : 'border-kh-line bg-white/4'
              }`}
              data-testid={`m1-klaerung-${p.id}`}
            >
              <div className="flex items-start gap-3">
                <span
                  aria-hidden
                  className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full ${
                    gefehlt
                      ? 'bg-kh-orange text-[#0E0D0B]'
                      : 'bg-white/12 text-kh-paper/70'
                  }`}
                >
                  {gefehlt ? (
                    <Check className="size-4" strokeWidth={3.5} />
                  ) : (
                    <X className="size-4" strokeWidth={3.5} />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="text-[1.0625rem] leading-tight font-semibold text-kh-paper">
                    {p.text}
                  </p>
                  <p className="mt-1 text-[0.9375rem] leading-[1.4] text-kh-mute">
                    {p.grund}
                  </p>
                </div>
              </div>
            </motion.li>
          )
        })}
      </ul>

      {/* Die Treffer als Zeile aus Marken, nicht als zweite Kartenliste: sie
          brauchen keine Begründung mehr, sie waren richtig. Wer sie trotzdem
          lesen will, tippt eine an — dann steht sie in dem Feld darunter, das
          immer dieselbe Höhe hat, damit nichts springt. So bleibt „mit kurzer
          Begründung je Punkt“ (flow 7 M1) für alle zehn erreichbar, ohne dass
          zehn Begründungen gleichzeitig auf dem Screen stehen. */}
      {treffer.length > 0 && (
        <motion.div
          variants={{
            aus: { opacity: 0, transform: 'translateY(10px)' },
            an: { opacity: 1, transform: 'translateY(0px)' },
          }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col gap-1.5"
        >
          {/* Führt statt zu etikettieren: die Zeile sagt, was der Tap bringt —
              „Hattest du“ allein hat niemand als Einladung gelesen. */}
          <p className="kh-etikett text-kh-mute">
            Richtig erkannt — tipp an für die Begründung
          </p>
          <div className="flex flex-wrap gap-1.5">
            {treffer.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setOffen((o) => (o === p.id ? null : p.id))}
                aria-pressed={offen === p.id}
                className={`flex items-center gap-1.5 rounded-kh-pill border-2 px-3 py-2 text-left text-[0.9375rem] transition-transform active:scale-95 ${
                  offen === p.id
                    ? 'border-kh-signal bg-kh-signal font-semibold text-[#0E0D0B]'
                    : 'border-kh-line-strong bg-white/5 text-kh-paper/80'
                }`}
              >
                <Check className="size-3.5 shrink-0" strokeWidth={3.5} aria-hidden />
                {p.text}
              </button>
            ))}
          </div>
          <p className="min-h-[1.4em] text-[1rem] leading-[1.4] text-kh-mute">
            {offen ? treffer.find((p) => p.id === offen)?.grund : ''}
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}
