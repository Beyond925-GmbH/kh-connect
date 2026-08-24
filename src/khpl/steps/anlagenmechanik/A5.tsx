import { useState } from 'react'
import { Check } from 'lucide-react'
import { motion } from 'motion/react'
import { Schnitt } from '@/khpl/buehne/anlagenmechanik/Schnitt'
import { Wechsel } from '@/khpl/komponenten/Wechsel'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { merkeAntwort, useFortschritt } from '@/khpl/store/fortschritt'

/**
 * A5 — Halb eins, im Transporter. **Die Zäsur** (khpl-tage.md 1, Mechanismus 4):
 * zwischen A4 (führt vor) und A6/A7 (fragt ab) muss Luft sein, sonst ist A7
 * eine Ablesung und keine Erinnerungsleistung.
 *
 * Vier Pausen, vier Bilder — diese hier ist die einzige, in der man **sitzt und
 * nichts sieht als Armaturenbrett und Straße**. Für einen Beruf, der einen
 * erheblichen Teil des Tages im Auto verbringt, ist das die ehrlichste.
 *
 * **Aufbau nach dem Muster M6** (Spec 6, A5): kein Prüfknopf, keine Aufgabe,
 * aber auch keine Wartezeit — drei Fragen liegen da, jede einen Tap von ihrer
 * Antwort entfernt. Die Antwort **ersetzt** die vorige, sie stapelt sich nicht
 * darunter.
 *
 * **Die ehrliche Kehrseite dieses Tages sitzt hier** (khpl-tage.md 1,
 * Mechanismus 8): ungeduldige Kunden. In drei von vier Gesprächen dieselbe
 * Antwort, und die einzige, die dieser Beruf überhaupt nennt. Sie steht als
 * **ein Satz an der Stelle, wo er hingehört** — nicht als Warnung, nicht als
 * eigener Screen. Direkt daneben steht, was der Beruf dagegensetzt, ebenfalls
 * aus dem Gespräch: ruhig bleiben, weiterarbeiten, den Kunden beruhigen.
 *
 * **Das iPad auf dem Armaturenbrett ist keine Requisite**, sondern
 * Arbeitsalltag (`INTERVIEW`: „Wir ham iPads, wo Aufträge drauf sind, wo man
 * jederzeit Fotos mitmachen kann"). Es steht hier in einem Nebensatz und wird
 * **nicht erklärt** — am Stand läuft diese Anwendung auf demselben Gerät, und
 * das ist der ganze Beleg. `technik: 0.85` wird damit nebenbei mit eingelöst.
 *
 * ⚠️ **Dreifache Idle-Geduld** wie M6 — das ist eine **Änderung an der Hülle**
 * (`KioskGuard`, `GEDULD`) und gehört gemeldet, nicht gebaut (khpl-tage.md
 * 6.2). Bis sie da ist, fragt der Kiosk nach einer Minute auf ausgerechnet dem
 * Screen nach, der niemanden drängen soll.
 *
 * **Die Bühne ist eine Zeichnung** (`buehne/anlagenmechanik/Transporter.tsx`).
 * Spec 10 hält fest, dass das Foto fehlt; Spec 6 erlaubt für genau diesen
 * Screen die Alternative — „Foto **oder eine ruhige Zeichnung**. Warmes Licht
 * durch die Windschutzscheibe … auf dem Armaturenbrett liegt ein iPad". Bis
 * hierher trug allein eine Lichtlage über einem leeren `StepFoto`, und der
 * Screen war zu vier Fünfteln schwarz. Die Zeichnung trägt die **erste Wärme
 * des Tages**, noch bevor die Anlage läuft, und das iPad steht darin, wo es im
 * Interview steht: auf dem Armaturenbrett.
 */

/**
 * Die drei Fragen. Bewusst drei und nicht sechs: mehr Karten heißt hier nicht
 * mehr Inhalt, sondern eine Liste — und eine Liste tippt niemand durch, der
 * gerade Pause machen soll.
 *
 * Herkunft je Frage steht am Eintrag. Zwei davon kommen aus den Gesprächen,
 * die dritte ist die Berufsbezeichnung selbst — laut Spec 9 „die erste Hürde",
 * und deshalb wird `SHK` hier zusätzlich zum Glossareintrag eingelöst.
 */
const FRAGEN = [
  {
    id: 'name',
    frage: 'Warum heißt der Beruf so kompliziert?',
    // Spec 6 (A5) und Spec 9: Sanitär, Heizung, Klima — drei Gewerke, ein
    // Beruf. Wortgleich mit dem Glossareintrag `shk`, damit dieselbe Sache
    // nicht zweimal verschieden erklärt wird.
    antwort:
      'Sanitär, Heizung, Klima. Drei Gewerke in einem Beruf: Wasser und Abwasser im Bad, die Heizung im Keller, Lüftung und Kühlung. Deshalb der lange Name — Anlagenmechaniker/-mechanikerin SHK.',
  },
  {
    id: 'morgen',
    frage: 'Was machst du eigentlich morgen?',
    // `INTERVIEW` — Anlagenmechaniker Alltag, 02.07.2026. Die Antwort ist die
    // Struktur des Betriebs, und sie steht wörtlich in Spec 6 (A5).
    antwort:
      'Kommt drauf an, in welcher Sparte du steckst. Kundendienst: Wartungen, Reparaturen, Kleinigkeiten. Montage: Heizungs- und Klimaanlagen einbauen. Und Sanierung — eine Badsanierung machen wir vom Rohbau bis zur Feinmontage.',
  },
  {
    id: 'adressen',
    frage: 'Wie viele Adressen sind das an einem Tag?',
    // ⚠️ **`NICHT BELEGBAR`** (Spec 11, `belege/anlagenmechanik.md` 9): es gibt
    // dazu keine Statistik, nur Stellenanzeigen. Deshalb steht hier **keine
    // Zahl als Fakt**, sondern die weiche Formulierung, die die Spec
    // ausdrücklich erlaubt — „mal zwei, mal fünf".
    antwort:
      'Mal zwei, mal fünf. Eine Störung ist manchmal in zwanzig Minuten erledigt, manchmal dauert die Suche den halben Tag. Eine Zahl, die für jeden Betrieb stimmt, gibt es nicht.',
  },
] as const

type FrageId = (typeof FRAGEN)[number]['id']

export function A5() {
  const gespeichert = useFortschritt().answers.a5
  const [offen, setOffen] = useState<FrageId | null>(null)
  const [gelesen, setGelesen] = useState<string[]>(() => gespeichert?.gelesen ?? [])

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
      // Keine Übung, kein Prüfknopf: der Karriere-Link darf hier auftauchen,
      // und *Weiter* bleibt der eine laute Knopf.
      interaktionOffen={false}
      /*
        Die Zäsur bekommt die von Spec 6 (A5) ausdrücklich erlaubte
        Alternative: „Foto **oder eine ruhige Zeichnung**. Warmes Licht durch
        die Windschutzscheibe … auf dem Armaturenbrett liegt ein iPad."
        Vorher stand hier `StepFoto` — und weil das Motiv fehlt (Spec 10),
        rendert es nichts: der wichtigste Screen des Tages war zu vier
        Fünfteln schwarz. Die Zeichnung löst zugleich das iPad ein und damit
        `technik: 0.85`.
      */
      buehne={<Schnitt zustand={{ szene: 'transporter', licht: 'mittag' }} />}
      fachtext={
        <>
          <p>
            Halb eins. Der Transporter steht im Schatten, die Brote liegen auf dem Schoß,
            auf dem Armaturenbrett das iPad mit den Aufträgen von heute. Zwischen zwei
            Adressen ist das die Pause.
          </p>
          {/*
            Die Kehrseite. Ein Satz, in Anton, an der Stelle, an der er
            hingehört — und direkt darunter das, was der Beruf dagegensetzt.
            Ohne den zweiten Absatz wäre der erste eine Warnung; mit ihm ist er
            eine Auskunft.
          */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 1.2 }}
            className="kh-titel-klein mt-4 text-kh-orange"
          >
            Nicht jeder Kunde ist geduldig.
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 1.6 }}
            className="mt-2"
          >
            Das ist nicht vermeidbar. Man bleibt trotzdem nett, macht ruhig weiter — und
            am Ende ist auch der Kunde wieder beruhigt.
          </motion.p>
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

          <div className="flex flex-wrap gap-2">
            {FRAGEN.map((f) => {
              const aktiv = offen === f.id
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => waehle(f.id)}
                  aria-pressed={aktiv}
                  data-testid={`a5-frage-${f.id}`}
                  className={`flex min-h-[52px] items-center gap-2 rounded-kh-pill border-2 px-4 text-left text-[1.0625rem] font-semibold transition-transform active:scale-95 ${
                    aktiv
                      ? 'border-kh-orange bg-kh-orange text-[#0E0D0B]'
                      : 'border-kh-line-strong bg-white/5 text-kh-paper'
                  }`}
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
                </button>
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
