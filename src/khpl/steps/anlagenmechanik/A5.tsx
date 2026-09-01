import { useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { motion } from 'motion/react'
import { StepFoto } from '@/khpl/buehne/Foto'
import { Wahlflaeche } from '@/khpl/komponenten/Wahlflaeche'
import { Wechsel } from '@/khpl/komponenten/Wechsel'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { merkeAntwort, useFortschritt } from '@/khpl/store/fortschritt'

/**
 * A5 — Halb eins, im Transporter. **Die Zäsur:** zwischen A4 (führt vor) und
 * A6/A7 (fragt ab) muss Luft sein, sonst ist A7 eine Ablesung und keine
 * Erinnerungsleistung.
 *
 * Vier Pausen, vier Bilder — diese hier ist die einzige, in der man **sitzt und
 * nichts sieht als Armaturenbrett und Straße**. Für einen Beruf, der einen
 * erheblichen Teil des Tages im Auto verbringt, ist das die ehrlichste.
 *
 * **Aufbau nach dem Muster M6:** kein Prüfknopf, keine Aufgabe, aber auch
 * keine Wartezeit — drei Fragen liegen da, jede einen Tap von ihrer Antwort
 * entfernt. Die Antwort **ersetzt** die vorige, sie stapelt sich nicht
 * darunter.
 *
 * **Die ehrliche Kehrseite dieses Tages sitzt hier:** ungeduldige Kunden. In
 * drei von vier Gesprächen dieselbe Antwort, und die einzige, die dieser Beruf
 * überhaupt nennt. Sie steht als
 * **ein Satz an der Stelle, wo er hingehört** — nicht als Warnung, nicht als
 * eigener Screen. Direkt daneben steht, was der Beruf dagegensetzt, ebenfalls
 * aus dem Gespräch: ruhig bleiben, weiterarbeiten, den Kunden beruhigen.
 *
 * **Das iPad auf dem Armaturenbrett ist keine Requisite**, sondern
 * Arbeitsalltag. Aus dem Interview: „Wir ham iPads, wo Aufträge drauf sind, wo
 * man jederzeit Fotos mitmachen kann". Es steht hier in einem Nebensatz und
 * wird **nicht erklärt** — am Stand läuft diese Anwendung auf demselben Gerät,
 * und das ist der ganze Beleg. `technik: 0.85` wird damit nebenbei mit
 * eingelöst.
 *
 * ⚠️ **Dreifache Idle-Geduld** wie M6 — das ist eine **Änderung an der Hülle**
 * (`KioskGuard`, `GEDULD`) und gehört gemeldet, nicht im Vorbeigehen gebaut.
 * Bis sie da ist, fragt der Kiosk nach einer Minute auf ausgerechnet dem
 * Screen nach, der niemanden drängen soll.
 *
 * **Bühne: ein Foto** (`bilder.A5`). Der Screen trug lange die
 * Transporter-Zeichnung bei Mittag — nicht als erste Wahl, sondern weil es
 * für ihn kein Motiv gab. Jetzt gibt es eins: zwei Männer in Arbeitsjacken im
 * offenen Laderaum, Brote in der Hand, einer zeigt dem anderen etwas auf dem
 * Handy. Auf einem Screen, dessen ganzer Zweck die Pause ist, ist eine
 * fotografierte Pause der Unterschied.
 *
 * Das iPad ist darauf **nicht zu sehen** — das Foto ist der Laderaum, nicht
 * die Kabine. Der Nebensatz oben bleibt trotzdem stehen: er kommt aus dem
 * Interview und löst `technik: 0.85` ein, und ein Detail, das das Bild nicht
 * bebildert, ist etwas anderes als ein Bild, das dem Text widerspricht.
 */

/**
 * Die drei Fragen. Bewusst drei und nicht sechs: mehr Karten heißt hier nicht
 * mehr Inhalt, sondern eine Liste — und eine Liste tippt niemand durch, der
 * gerade Pause machen soll.
 *
 * Herkunft je Frage steht am Eintrag. Zwei davon kommen aus den Gesprächen,
 * die dritte ist die Berufsbezeichnung selbst — die erste Hürde dieses
 * Berufs, und deshalb wird `SHK` hier zusätzlich zum Glossareintrag eingelöst.
 */
const FRAGEN = [
  {
    id: 'name',
    frage: 'Warum heißt der Beruf so kompliziert?',
    // Sanitär, Heizung, Klima — drei Bereiche, ein Beruf. Wortgleich mit dem
    // Glossareintrag `shk`, damit dieselbe Sache nicht zweimal verschieden
    // erklärt wird. („Bereiche" statt „Gewerke": das Fachwort fiele in diesem
    // String unerklärt.)
    antwort:
      'Sanitär, Heizung, Klima. Drei Bereiche in einem Beruf: Wasser und Abwasser im Bad, die Heizung im Keller, Lüftung und Kühlung. Deshalb der lange Name — Anlagenmechaniker/-mechanikerin SHK.',
  },
  {
    id: 'morgen',
    frage: 'Was machst du eigentlich morgen?',
    // Aus dem Interview — Anlagenmechaniker Alltag, 02.07.2026. Die Antwort
    // ist die Struktur des Betriebs, in Alltagswörter übersetzt: „Sparte" und
    // „vom Rohbau bis zur Feinmontage" sagen einem Vierzehnjährigen nichts.
    antwort:
      'Kommt drauf an, wo du eingeteilt bist. Kundendienst: Wartungen, Reparaturen, Kleinigkeiten. Montage: Heizungen und Klimaanlagen einbauen. Und Badsanierung: ein altes Bad komplett neu machen — von den nackten Wänden bis zum letzten Handgriff.',
  },
  {
    id: 'adressen',
    frage: 'Wie viele Adressen sind das an einem Tag?',
    // ⚠️ **Dazu gibt es nichts Belastbares**: keine Statistik, nur
    // Stellenanzeigen. Deshalb steht hier **keine Zahl als Fakt**, sondern
    // die weiche Formulierung „mal zwei, mal fünf".
    antwort:
      'Mal zwei, mal fünf. Eine Störung ist manchmal in zwanzig Minuten erledigt, manchmal dauert die Suche den halben Tag. Eine Zahl, die für jeden Betrieb stimmt, gibt es nicht.',
  },
] as const

type FrageId = (typeof FRAGEN)[number]['id']

export function A5() {
  const gespeichert = useFortschritt().answers.a5
  const [offen, setOffen] = useState<FrageId | null>(null)
  const [gelesen, setGelesen] = useState<string[]>(() => gespeichert?.gelesen ?? [])
  /** Die Klappzeile zur Kehrseite — zu, bis jemand fragt. */
  const [kunde, setKunde] = useState(false)

  const waehle = (id: FrageId) => {
    setOffen((vorher) => (vorher === id ? null : id))
    if (!gelesen.includes(id)) {
      const naechste = [...gelesen, id]
      setGelesen(naechste)
      merkeAntwort('a5', { gelesen: naechste })
    }
  }

  const antwort = FRAGEN.find((f) => f.id === offen)

  return (
    <StepShell
      id="A5"
      auftrag={null}
      ansage={null}
      // Keine Übung, kein Prüfknopf: der Karriere-Link darf hier auftauchen,
      // und *Weiter* bleibt der eine laute Knopf.
      interaktionOffen={false}
      buehne={<StepFoto id="A5" />}
      warum={
        <>
          <p>
            Halb eins. Der Transporter steht im Schatten, die Brote liegen auf dem Schoß,
            auf dem Armaturenbrett das iPad mit den Aufträgen von heute. Zwischen zwei
            Adressen ist das die Pause.
          </p>
          {/*
            Die Kehrseite. Sie stand hier offen und trieb den Screen beim
            Ankommen auf ~68 Wörter — jetzt liegt sie hinter einer
            Klappzeile, deren Frage sie nicht versteckt: wer sie antippt,
            bekommt den Anton-Satz und direkt darunter das, was der Beruf
            dagegensetzt. Ohne den zweiten Absatz wäre der erste eine Warnung;
            mit ihm ist er eine Auskunft.
          */}
          <button
            type="button"
            onClick={() => setKunde((v) => !v)}
            aria-expanded={kunde}
            data-testid="a5-kunde-schalter"
            className="mt-3 flex min-h-[44px] w-full items-center justify-between gap-2 text-left transition-transform active:scale-[0.99]"
          >
            <span className="kh-etikett">Und wenn der Kunde ungeduldig wird?</span>
            <ChevronDown
              aria-hidden
              className={`size-4 shrink-0 text-kh-paper/45 transition-transform ${
                kunde ? 'rotate-180' : ''
              }`}
              strokeWidth={2.25}
            />
          </button>
          {kunde && (
            <>
              <p className="kh-titel-klein mt-1 text-kh-orange">
                Nicht jeder Kunde ist geduldig.
              </p>
              <p className="mt-2">
                Das ist nicht vermeidbar. Man bleibt trotzdem nett, macht ruhig weiter —
                und am Ende ist auch der Kunde wieder beruhigt.
              </p>
            </>
          )}
        </>
      }
      interaktion={
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 2 }}
          className="flex flex-col gap-2.5"
        >
          {!antwort && (
            <p className="px-1 text-[1rem] text-kh-paper/55">
              Drei Sachen, die kaum jemand über diesen Beruf weiß. Tipp an, was dich
              interessiert.
            </p>
          )}

          {/*
            Dieselbe Geste, dieselbe Fläche: „tipp an, um aufzuklappen" heißt
            in A2 und A4.1 `Wahlflaeche` mit Signal-Ton, und hier ist nichts
            vorläufig — die Wahl gilt, sobald sie fällt. Die alte Fassung
            baute die Chips von Hand und färbte sie orange, die Farbe der
            Welt: derselbe Griff sah damit auf drei Screens verschieden
            aus.
          */}
          <div className="flex flex-wrap gap-2">
            {FRAGEN.map((f) => {
              const aktiv = offen === f.id
              return (
                <Wahlflaeche
                  key={f.id}
                  onClick={() => waehle(f.id)}
                  gewaehlt={aktiv}
                  data-testid={`a5-frage-${f.id}`}
                  className="w-auto rounded-kh-pill font-semibold"
                >
                  {/* Der Haken markiert Gelesenes, ohne es wegzunehmen. */}
                  {gelesen.includes(f.id) && !aktiv && (
                    <Check
                      className="size-4 shrink-0 text-kh-signal"
                      strokeWidth={3}
                      aria-hidden
                    />
                  )}
                  {f.frage}
                </Wahlflaeche>
              )
            })}
          </div>

          {/* Eine Antwortfläche, nicht drei aufgeklappte Kästen: das Panel
              bleibt so hoch, wie es war. */}
          <Wechsel takt={offen ?? 'nichts'}>
            {antwort ? (
              <p
                data-auswaehlbar
                data-testid="a5-antwort"
                className="kh-feld px-4 py-3 text-[1.0625rem] leading-[1.45] text-kh-paper/90"
              >
                {antwort.antwort}
              </p>
            ) : null}
          </Wechsel>
        </motion.div>
      }
      fuss={<StepFuss id="A5" />}
    />
  )
}
