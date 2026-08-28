import { useState } from 'react'
import { Check } from 'lucide-react'
import { motion } from 'motion/react'
import { StepFoto } from '@/khpl/buehne/Foto'
import { Wahlflaeche } from '@/khpl/komponenten/Wahlflaeche'
import { Wechsel } from '@/khpl/komponenten/Wechsel'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { merkeAntwort, useFortschritt } from '@/khpl/store/fortschritt'
import { Begriff } from './Begriff'

/**
 * Z5 — Halb zehn, Pausenraum. **Die Zäsur** (Mechanismus 4): zwischen dem
 * Probeteil (Z4) und der Serie mit ihrer Abfrage (Z6) muss Luft sein.
 *
 * Vier Tage, vier Pausen — diese ist die einzige, in der die Arbeit
 * **weiterläuft, während man sitzt**: nebenan fällt alle paar Minuten ein
 * fertiges Teil in die Kiste. Das ist die leise Pointe dieses Berufs, und
 * sie steht im Rahmentext, nicht in einer Übung.
 *
 * Aufbau nach dem Muster M6/A5: drei Fragen, je einen Tap von ihrer Antwort
 * entfernt; die Antwort ersetzt die vorige. **Die ehrliche Kehrseite dieses
 * Tages ist die dritte Frage** — Schichtarbeit. Sie steht als Auskunft mit
 * beiden Seiten da (früh aufstehen / früh Feierabend, Zuschläge), nicht als
 * Warnung. Dass Nachtschicht „meist erst nach der Ausbildung“ kommt, ist
 * Jugendarbeitsschutz und damit belastbar.
 *
 * Dreifache Idle-Geduld wie M6/C5/A5 — eingetragen in `KioskGuard.GEDULD`.
 *
 * **`answers.z5`** `{ gelesen }`.
 */

const FRAGEN = [
  {
    id: 'immergleich',
    frage: 'Ist das nicht jeden Tag dasselbe?',
    antwort:
      'Ehrlich: eine laufende Serie ist Routine. Deshalb betreust du meist mehrere Maschinen gleichzeitig — und jedes neue Teil heißt neu rüsten, neu programmieren, neu denken. Das Gegenteil von gestern ist nicht morgen, sondern der nächste Auftrag.',
  },
  {
    id: 'mathe',
    frage: 'Muss ich gut in Mathe sein?',
    antwort:
      'Rechnen ja, höhere Mathematik nein: Dreisatz, Winkel, Drehzahlen — und die Steuerung rechnet mit. Wichtiger ist der Blick fürs Genaue: zu merken, wenn eine Zahl nicht sein kann.',
  },
  {
    id: 'schichten',
    frage: 'Und die Schichten?',
    antwort:
      'Viele Betriebe fahren zwei oder drei Schichten — die Maschinen sollen nicht stillstehen. Früh heißt um fünf aufstehen, dafür ist um halb drei Feierabend. Nachtschicht gibt es meist erst nach der Ausbildung, und sie wird mit Zuschlägen bezahlt.',
  },
] as const

type FrageId = (typeof FRAGEN)[number]['id']

export function Z5() {
  const gespeichert = useFortschritt().answers.z5
  const [offen, setOffen] = useState<FrageId | null>(null)
  const [gelesen, setGelesen] = useState<string[]>(() => gespeichert?.gelesen ?? [])

  const waehle = (id: FrageId) => {
    setOffen((vorher) => (vorher === id ? null : id))
    if (!gelesen.includes(id)) {
      const naechste = [...gelesen, id]
      setGelesen(naechste)
      merkeAntwort('z5', { gelesen: naechste })
    }
  }

  const antwort = FRAGEN.find((f) => f.id === offen)

  return (
    <StepShell
      id="Z5"
      auftrag={null}
      ansage={null}
      interaktionOffen={false}
      buehne={<StepFoto id="Z5" />}
      warum={
        <p>
          Halb zehn, Kaffee, das Fenster zur Halle. Deine Maschine läuft weiter — alle
          paar Minuten schiebt sie ein fertiges Teil in die Kiste, der{' '}
          <Begriff id="kuehlschmierstoff">Kühlschmierstoff</Begriff> läuft im Kreis. Du
          hast Pause, sie nicht.
        </p>
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
                <Wahlflaeche
                  key={f.id}
                  onClick={() => waehle(f.id)}
                  gewaehlt={aktiv}
                  data-testid={`z5-frage-${f.id}`}
                  className="w-auto rounded-kh-pill font-semibold"
                >
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

          <Wechsel takt={offen ?? 'nichts'}>
            {antwort ? (
              <p
                data-auswaehlbar
                data-testid="z5-antwort"
                className="kh-feld px-4 py-3 text-[1.0625rem] leading-[1.45] text-kh-paper/90"
              >
                {antwort.antwort}
              </p>
            ) : null}
          </Wechsel>
        </motion.div>
      }
      fuss={<StepFuss id="Z5" />}
    />
  )
}
