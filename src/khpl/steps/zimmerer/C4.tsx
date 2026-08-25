import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { Dachstuhl3DFallback } from '@/khpl/buehne/Dachstuhl3DFallback'
import { ACHSMASS_CM, ELEMENT_BREITE_M } from '@/khpl/buehne/zimmerer/kanon'
import type {
  Fensterausschnitt,
  Rahmenangebot,
  Rahmenurteil,
} from '@/khpl/buehne/zimmerer/Wandelement3D'
import { AhaKarte } from '@/khpl/komponenten/AhaKarte'
import { Rueckmeldung } from '@/khpl/komponenten/Rueckmeldung'
import { Wechsel } from '@/khpl/komponenten/Wechsel'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { useSchmal } from '@/khpl/shell/schmal'
import { merkeAntwort, useFortschritt } from '@/khpl/store/fortschritt'
import { Begriff } from './Begriff'

/**
 * C4 — Hier kommt das Fenster hin. **Der Fehler mit Preis**
 * (khpl-tage.md 1, Mechanismus 5; khpl-tag-zimmerer.md 6, C4).
 *
 * **Die Übung ist eine Wahl, kein Zug — und das ist eine Korrektur.** Die
 * Spec-Zeile lautet „der Besucher zieht den Ausschnitt auf dem liegenden
 * Element auf“. So gebaut war es der schwächste Screen der vier Tage, und zwar
 * aus vier Gründen, die sich gegenseitig verstärkt haben:
 *
 * 1. **Kein Griff.** Die Ziehfläche lag unsichtbar über der halben Bühne. Man
 *    fasste ins Leere und etwas verstellte sich.
 * 2. **Zwei Achsen, gekoppelt.** Breite und Unterkante hingen an derselben
 *    Geste; ein Finger hat immer beide Komponenten. Wer die Breite justierte,
 *    verstellte die Unterkante mit — und umgekehrt, endlos.
 * 3. **Die größte Zahl war die falsche.** Groß stand „Fuge“ auf dem Screen,
 *    eine abgeleitete Größe, deren Zielbereich nirgends stand. Die beiden
 *    Zahlen, die man wirklich treffen musste, standen klein und grau darunter.
 * 4. **Und sachlich stimmte es nicht.** Kein Zimmerer schätzt einen
 *    Fensterausschnitt mit der Hand. Der Ausschnitt steht im Plan, die
 *    Abbundanlage schneidet ihn, das Wechselholz sitzt.
 *
 * **Die Entscheidung, die in der Werkstatt wirklich fällt, ist eine andere:
 * wie viel Luft bekommt der Rahmen?** Genau die ist jetzt die Übung. Drei
 * Rahmen liegen auf dem Tisch, einer kommt rein.
 *
 * **Der verlockend falsche ist der passgenaue.** 1,25 m Rahmen in 1,25 m
 * Ausschnitt — „passt doch genau“. Das ist dieselbe Bauart von Fehler wie in
 * C6, wo die glatte, fertig aussehende Innenseite nach außen will: die
 * naheliegende Antwort ist die falsche, und **warum** sie falsch ist, ist der
 * Lerninhalt. Die Fuge ist kein Fehler, sondern Absicht — sie wird gedämmt und
 * abgedichtet und fängt die Bewegung des Materials auf.
 *
 * **Der Preis steht auf der Bühne, nicht nur im Text.** Der zu große Rahmen
 * setzt auf der Platte auf, stößt zweimal nach und bleibt oben liegen. Der zu
 * kleine fällt durch und liegt schief in der Öffnung. Deshalb steht der Blick
 * in diesem Zustand schräg statt senkrecht — von genau oben wäre alles
 * derselbe Umriss (`waehleBlickfang` in der Bühne).
 *
 * **Der Preis unterscheidet sich vom Dachdecker.** Dort kostet ein Fehler
 * *Material* (der Balken ist Ausschuss). Hier kostet er **Zeit** — und zwar in
 * einer Halle, in der um elf der Lkw steht. Das ist die Ökonomie der
 * Vorfertigung: nicht das Holz ist teuer, der Takt ist es.
 *
 * **Und hier wird zum ersten Mal nach oben gefragt.** Sobald der Rahmen sitzt,
 * kippt die Ansicht kurz in die Senkrechte (`aufrichtenZeigen`) und zeigt das
 * Element stehend, mit dem Fenster an seinem Platz. Ohne das ist die Frage in
 * C6 ein Ratespiel; mit ihr ist sie eine Erinnerungsleistung — und genau darum
 * geht es beim Vorstellungsvermögen (khpl-tag-zimmerer.md 1).
 *
 * `answers.c4`
 * `{ getroffen: boolean; versuche: number; abweichungMm?: number; ausschnitt?: Fensterausschnitt }`
 *
 * Die Form bleibt, obwohl die Übung eine andere ist: `abweichungMm` ist jetzt
 * der Abstand des gewählten Rahmens zum richtigen, und `ausschnitt` ist das
 * Planmaß — es steht ja fest. C5, C6 und C7 lesen ihn unverändert weiter, und
 * damit zeigen sie dasselbe Fenster wie C4.
 */

const Wandelement3D = lazy(() => import('@/khpl/buehne/zimmerer/Wandelement3D'))

// ---------------------------------------------------------------------------
// Maße — abgeleitet, nicht notiert (flow 8.4).
// ---------------------------------------------------------------------------

/**
 * **Die einzige belegte Zahl dieses Screens** (`belege/zimmerer.md` 5,
 * RAL-Montageleitfaden / ift Rosenheim): Holzfenster brauchen mit spritzbarem
 * Dichtstoff **mindestens 10 mm Fuge umlaufend**.
 *
 * ⚠️ Der Screen sagt **Holzfenster**. Kunststofffenster brauchen deutlich
 * breitere Fugen (10–30 mm je nach Farbe und Länge), weil sie sich thermisch
 * stärker ausdehnen — in einer Zimmerei ist Holz ohnehin der Regelfall.
 */
const FUGE_MIN_MM = 10

/**
 * Ab hier ist die Fuge zu weit fürs Dichtband. **Spielgrenze, keine
 * Vorschrift** — deshalb steht die Zahl nirgends als Regel auf dem Screen: sie
 * taucht nur als Folge auf, wenn jemand sie überzieht. Der Beleg gibt für
 * Holzfenster eine Untergrenze her, keine Obergrenze; eine erfundene Obergrenze
 * als Regel hinzuschreiben wäre genau das, was khpl-tage.md verbietet.
 */
const FUGE_MAX_MM = 30

/**
 * Planmaß des Ausschnitts: zwei Felder im Raster, von Ständermitte zu
 * Ständermitte. Damit hängt die Zahl an C2 und ist keine zweite erfundene
 * Größe — 2 × 62,5 cm.
 */
const AUSSCHNITT_BREITE_MM = ACHSMASS_CM * 2 * 10

/**
 * Unterkante über Rohboden, laut Plan dieses Elements. Szenariomaß — so wie
 * „Satteldach, 45 Grad“ in M2 das Szenario ist und keine Vorschrift.
 */
const AUSSCHNITT_Y_MM = 1000

/** Die Öffnung ist so hoch wie breit — das gibt das Wechselholz vor. */
const AUSSCHNITT_HOEHE_MM = AUSSCHNITT_BREITE_MM

/** Ungefähr mittig auf dem acht Meter langen Element. */
const AUSSCHNITT_X_MM = Math.round((ELEMENT_BREITE_M * 1000 - AUSSCHNITT_BREITE_MM) / 2)

/**
 * Der Ausschnitt steht fest. Er kommt aus dem Plan, die Abbundanlage hat ihn
 * geschnitten, das Wechselholz sitzt — daran gibt es nichts zu ziehen.
 */
const AUSSCHNITT: Fensterausschnitt = {
  xMm: AUSSCHNITT_X_MM,
  yMm: AUSSCHNITT_Y_MM,
  breiteMm: AUSSCHNITT_BREITE_MM,
  hoeheMm: AUSSCHNITT_HOEHE_MM,
}

/**
 * Die drei Rahmen auf dem Tisch, von breit nach schmal — so, wie sie an der
 * Wand lehnen würden.
 *
 * **Zwei Zentimeter Unterschied sind aus zwölf Metern Kameradistanz nicht zu
 * sehen, und das ist Absicht.** Man muss die Etiketten lesen und rechnen; wer
 * hinschaut und rät, hat keine Chance — und genau darum geht es: der teure
 * Fehler auf dem Bau ist nie der, den man sieht.
 *
 * Der erste ist der verlockende: „passgenau“ klingt nach richtig gemessen.
 */
const ANGEBOTE: readonly Rahmenangebot[] = [
  { id: 'passgenau', breiteMm: AUSSCHNITT_BREITE_MM },
  { id: 'richtig', breiteMm: AUSSCHNITT_BREITE_MM - 2 * FUGE_MIN_MM },
  { id: 'zu-schmal', breiteMm: AUSSCHNITT_BREITE_MM - 2 * 50 },
]

const RICHTIG = ANGEBOTE[1]

/** Wie lange ein abgelehnter Rahmen in der Öffnung liegen bleibt, bevor er zurückgeht. */
const HEIMWEG_NACH_MS = 2400

const TREFFER_TEXT =
  'Passt. Zehn Millimeter rundum — Platz für Dämmung und Dichtstoff. Das ist jetzt dein Element.'

const m = (mm: number) => `${(mm / 1000).toFixed(2).replace('.', ',')} m`

/** Die Fuge je Seite, wenn dieser Rahmen in den Ausschnitt kommt. */
const fuge = (breiteMm: number) => Math.round((AUSSCHNITT_BREITE_MM - breiteMm) / 2)

function beurteile(breiteMm: number): Rahmenurteil {
  const f = fuge(breiteMm)
  if (f < FUGE_MIN_MM) return 'zu-gross'
  if (f > FUGE_MAX_MM) return 'zu-klein'
  return 'passt'
}

type Phase = 'wahl' | 'probe' | 'aufrichten' | 'fertig'

export function C4() {
  // Handy hochkant teilen sich Panel und Element dieselben 844 px, und der
  // Klappgriff deckelt das Panel dort auf 62 %. Was hier nicht in die
  // Scrollfläche passt, ist unsichtbar — also trägt der Screen dort weniger
  // Text, nie weniger Übung (s. `shell/schmal.ts`).
  const schmal = useSchmal()
  const gespeichert = useFortschritt().answers.c4
  const fertigLautStore = !!gespeichert?.getroffen

  const [gewaehlt, setGewaehlt] = useState<string | null>(() =>
    fertigLautStore ? RICHTIG.id : null,
  )
  const [versuche, setVersuche] = useState(() => gespeichert?.versuche ?? 0)
  const [text, setText] = useState<string | null>(() =>
    fertigLautStore ? TREFFER_TEXT : null,
  )
  // Wiedereinstieg über „Dein Weg“: das Endbild ohne Animation.
  const [phase, setPhase] = useState<Phase>(() => (fertigLautStore ? 'fertig' : 'wahl'))
  const [geloest, setGeloest] = useState(fertigLautStore)

  const heimweg = useRef<number | null>(null)
  useEffect(
    () => () => {
      if (heimweg.current !== null) window.clearTimeout(heimweg.current)
    },
    [],
  )

  const angebot = ANGEBOTE.find((a) => a.id === gewaehlt) ?? null
  const urteil = angebot && !geloest ? beurteile(angebot.breiteMm) : null

  const probieren = (id: string) => {
    if (phase !== 'wahl') return
    setGewaehlt(id)
    setText(null)
    setPhase('probe')
  }

  /** Der Rahmen ist unten angekommen — jetzt, und keinen Moment früher, spricht der Screen. */
  const probeEnde = () => {
    if (phase !== 'probe' || !angebot) return
    const n = versuche + 1
    setVersuche(n)
    if (urteil === 'passt') {
      merkeAntwort('c4', {
        getroffen: true,
        versuche: n,
        abweichungMm: angebot.breiteMm - RICHTIG.breiteMm,
        // Der Ausschnitt kommt aus dem Plan und steht fest — mitgespeichert
        // wird er trotzdem: C5, C6 und C7 zeichnen ihr Fenster daraus, und
        // C6 fragt an genau diesem Fenster ab, wo oben ist.
        ausschnitt: AUSSCHNITT,
      })
      setText(TREFFER_TEXT)
      setGeloest(true)
      setPhase('aufrichten')
      return
    }
    merkeAntwort('c4', { getroffen: false, versuche: n })
    setText(fehlertext(angebot.breiteMm, schmal))
    // Der Rahmen bleibt kurz liegen, wo er gelandet ist — das Bild ist die
    // halbe Aussage —, dann geht er zurück auf den Tisch und man ist wieder
    // dran. Ohne Knopf: der nächste Tap auf einen Rahmen ist der nächste Versuch.
    heimweg.current = window.setTimeout(() => {
      setGewaehlt(null)
      setPhase('wahl')
    }, HEIMWEG_NACH_MS)
  }

  return (
    <StepShell
      id="C4"
      buehneInteraktiv
      interaktionOffen={!geloest}
      buehne={
        <Suspense
          fallback={<Dachstuhl3DFallback text="Das Element liegt auf dem Tisch" />}
        >
          <Wandelement3D
            zustand="fenster"
            ausschnitt={AUSSCHNITT}
            rahmenangebote={ANGEBOTE}
            gewaehlterRahmen={gewaehlt}
            rahmenurteil={urteil}
            rahmenSitzt={geloest}
            onRahmen={probieren}
            onProbeEnde={probeEnde}
            aufrichtenZeigen={phase === 'aufrichten'}
            onAufrichtenEnde={() => setPhase('fertig')}
            deinElement={geloest}
          />
        </Suspense>
      }
      fachtext={
        // Auf dem Handy entfällt der Fachtext, solange gewählt wird: mit ihm
        // lagen Aufforderung und Rückmeldung unter der Scrollkante, und ein
        // Screen, der nicht mehr sagt, was zu tun ist, ist kein Screen mehr.
        // Der Begriff kommt in der Aha-Karte wieder.
        !geloest && !schmal ? (
          <p>
            Der Ausschnitt ist geschnitten, das{' '}
            <Begriff id="wechselholz">Wechselholz</Begriff> sitzt. Jetzt kommt der Rahmen
            — denn ein Fenster hängt nicht in der Dämmung, es hängt im Holz.
          </p>
        ) : undefined
      }
      interaktion={
        <Wechsel takt={geloest ? 'gesetzt' : 'wahl'}>
          {!geloest ? (
            <div className="flex flex-col gap-3">
              <Auftrag schmal={schmal} />
              <Rueckmeldung
                ok={text ? false : null}
                text={text}
                testid="c4-rueckmeldung"
              />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Rueckmeldung ok={true} text={text} testid="c4-rueckmeldung" />

              <dl
                className="kh-feld flex gap-6 px-3.5 py-2.5"
                data-testid="c4-dein-element"
              >
                <div>
                  <dt className="kh-etikett">Dein Rahmen</dt>
                  <dd className="font-display text-[clamp(1.6rem,1.2rem+1.1vw,2.1rem)] leading-none text-kh-paper tabular-nums">
                    {m(RICHTIG.breiteMm)}
                  </dd>
                </div>
                <div>
                  <dt className="kh-etikett">Fuge rundum</dt>
                  <dd className="font-display text-[clamp(1.6rem,1.2rem+1.1vw,2.1rem)] leading-none text-kh-paper tabular-nums">
                    {fuge(RICHTIG.breiteMm)} mm
                  </dd>
                </div>
              </dl>

              {/* Die Vorbereitung auf C6 — der eine Satz, der diesen Screen mit
                  dem Kran verbindet. Deshalb Anton und nicht Fließtext. */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                data-testid="c4-aufrichten-zeile"
                className="kh-titel-klein text-kh-orange"
              >
                So sieht das aus, wenn es steht. Merk dir, wo das Fenster ist.
              </motion.p>
            </div>
          )}
        </Wechsel>
      }
      aha={
        <>
          {/* Der eigentliche Fachinhalt des Screens — die Fuge ist Absicht.
              Als Frage formuliert steht er hier besser als im Auftragsfeld:
              gefragt wird er ohnehin erst, wenn der passgenaue Rahmen
              aufgesetzt hat und liegen geblieben ist. */}
          <AhaKarte sichtbar={geloest} eyebrow="Wozu überhaupt eine Fuge?">
            Der Rahmen ist {m(RICHTIG.breiteMm)} breit, der Ausschnitt{' '}
            {m(AUSSCHNITT_BREITE_MM)}. Die {FUGE_MIN_MM} Millimeter dazwischen werden
            gedämmt und abgedichtet und fangen die Bewegung des Materials auf. Ein
            Fenster, das passgenau in die Öffnung geklemmt wird, ist falsch eingebaut —
            und das <Begriff id="wechselholz">Wechselholz</Begriff> rundum hält es.
          </AhaKarte>
          {/* Zwei Regeln, kein Rechenweg: 1,5 mm/m und die Deckelung auf 3 mm
              stehen im Beleg nebeneinander (belege/zimmerer.md 5). „1,5 × 3 = 3“
              wäre ein Rechenfehler — auf einem Präzisionsscreen der teuerste. */}
          <AhaKarte sichtbar={geloest} eyebrow="Wie genau muss so ein Ausschnitt sitzen?">
            Wasserwaagengenauigkeit: höchstens anderthalb Millimeter Abweichung je Meter —
            und bei Elementen bis drei Meter nie mehr als drei Millimeter insgesamt.
          </AhaKarte>
          <AhaKarte
            sichtbar={geloest}
            eyebrow="Warum kostet ein Fehler hier eine Stunde?"
          >
            Weil nicht das Holz teuer ist, sondern der Takt. Um elf kommt der Lkw. Was
            jetzt liegen bleibt, steht am Nachmittag nicht auf der Baustelle.
          </AhaKarte>
        </>
      }
      fuss={
        // Kein Aktionsknopf: **die Bühne ist die Übung** (Vorbild C1). Getippt
        // wird der Rahmen, nicht ein Knopf im Panel — ein „Rahmen einsetzen“
        // daneben wäre ein zweiter Weg zu derselben Handlung und die Frage
        // „was von beidem jetzt“.
        <StepFuss
          id="C4"
          uebungOffen={!geloest}
          geschafft={geloest ? 'Rahmen sitzt' : null}
        />
      }
    />
  )
}

// ---------------------------------------------------------------------------
// Der Auftrag und die Folgen
// ---------------------------------------------------------------------------

/**
 * Was zu tun ist. **Die Zahlen der drei Rahmen stehen nicht hier, sondern auf
 * der Bühne** — an den Rahmen selbst, als Etikett. Sie doppelt im Panel zu
 * führen hieße, den Blick zwischen zwei Listen zu schicken, und die Übung ist
 * ein Vergleich zwischen dem Plan und dem, was auf dem Tisch liegt.
 */
function Auftrag({ schmal }: { schmal: boolean }) {
  return (
    <div className="flex flex-col gap-2">
      <p
        data-testid="c4-plan"
        className="text-[1rem] leading-snug text-kh-mute tabular-nums"
      >
        <span className="text-kh-paper/55">Ausschnitt laut Plan:</span>{' '}
        <span className="text-kh-paper">{m(AUSSCHNITT_BREITE_MM)}</span> breit ·
        Unterkante <span className="text-kh-paper">{m(AUSSCHNITT_Y_MM)}</span> — so ist er
        geschnitten.
      </p>
      <p
        data-testid="c4-frage"
        className="font-display text-[clamp(1.9rem,1.3rem+1.6vw,2.75rem)] leading-none text-kh-signal"
      >
        Welchen Rahmen nimmst du?
      </p>
      <p className="text-[1.0625rem] text-kh-mute">
        {schmal
          ? 'Drei liegen auf dem Tisch. Tipp einen an.'
          : 'Drei liegen auf dem Tisch, jeder mit seinem Maß. Tipp einen an.'}
      </p>
    </div>
  )
}

/**
 * Reihenfolge mit Absicht: erst was man gerade gesehen hat, dann warum, dann
 * was es kostet. Wer den Rahmen gar nicht reinbekommt, will nicht zuerst über
 * Dichtbänder belehrt werden.
 *
 * Der Zu-klein-Fall nennt keine Grenzzahl — nur die Folge. Die Untergrenze ist
 * belegt und steht in der Aha-Karte, die Obergrenze ist es nicht (siehe
 * `FUGE_MAX_MM`).
 */
function fehlertext(breiteMm: number, schmal: boolean): string {
  if (beurteile(breiteMm) === 'zu-gross') {
    return schmal
      ? 'Passgenau heißt: geht nicht rein. Er setzt auf und bleibt liegen. Nachschneiden kostet Zeit — um elf steht der Lkw.'
      : 'Passgenau — und genau deshalb geht er nicht rein. Er setzt auf und bleibt oben liegen. Kein Ausschnitt ist auf den Millimeter genau, kein Rahmen auch. Nachschneiden geht, das dauert, und um elf steht der Lkw.'
  }
  const f = fuge(breiteMm)
  return schmal
    ? `${f} mm Luft je Seite — er fällt durch. Zu breit fürs Dichtband: Element auf, neues Wechselholz, eine Stunde weg.`
    : `${f} Millimeter Luft auf jeder Seite — der Rahmen fällt durch. So breit fasst das Dichtband die Fuge nicht mehr: Das Element muss auf, ein neues Wechselholz rein. Eine Stunde weg, und um elf steht der Lkw.`
}
