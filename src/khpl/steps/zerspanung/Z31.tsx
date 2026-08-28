import { useState } from 'react'
import { Check } from 'lucide-react'
import { StepFoto } from '@/khpl/buehne/Foto'
import { Wahlflaeche } from '@/khpl/komponenten/Wahlflaeche'
import { Wechsel } from '@/khpl/komponenten/Wechsel'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'

/**
 * Z3.1 — Ein Tippfehler in Stahl. Abstecher von Z3, mündet in Z4.
 *
 * Der Preis eines Fehlers in diesem Beruf: kein nasser Kunde, kein zweiter
 * Anfahrtsweg — ein Crash in der Maschine. Und die Antwort des Berufs
 * darauf ist keine Angst, sondern ein Verfahren: simulieren, einfahren,
 * erst dann Tempo. Drei Taps, dieselbe ruhige Form wie die anderen
 * Info-Abstecher.
 *
 * ⚠️ Die Schadenshöhe steht bewusst weich da („schnell in die Tausende“) —
 * ein konkreter Betrag wäre erfunden und hinge ohnehin an Maschine und
 * Treffer.
 */

const SCHRITTE = [
  {
    id: 'simulieren',
    label: 'Simulieren',
    text: 'Bevor die Maschine echtes Material sieht, läuft das Programm auf dem Bildschirm: die Steuerung zeichnet jeden Weg vor. Ein Satz, der ins Futter zeigt, fällt hier auf — und kostet nichts.',
  },
  {
    id: 'einfahren',
    label: 'Einfahren',
    text: 'Das erste Teil fährt man langsam: Satz für Satz, mit heruntergedrehtem Vorschub, die Hand am Stopp. Erst wenn jeder Weg stimmt, darf das Programm in echtem Tempo laufen.',
  },
  {
    id: 'krachen',
    label: 'Wenn es kracht',
    text: 'Treffen sich Werkzeug und Futter, ist in einer Zehntelsekunde Schluss: Schneide ab, im schlimmsten Fall die Spindel beschädigt. Der Schaden geht schnell in die Tausende — genau deshalb gibt es die ersten beiden Schritte.',
  },
] as const

type SchrittId = (typeof SCHRITTE)[number]['id']

export function Z31() {
  const [offen, setOffen] = useState<SchrittId | null>(null)
  const [gelesen, setGelesen] = useState<SchrittId[]>([])

  const waehle = (id: SchrittId) => {
    setOffen((alt) => (alt === id ? null : id))
    setGelesen((g) => (g.includes(id) ? g : [...g, id]))
  }

  const schritt = SCHRITTE.find((s) => s.id === offen)

  return (
    <StepShell
      id="Z3.1"
      auftrag={'Tipp an, was dich interessiert.'}
      ansage={null}
      titelZusatz="Abstecher"
      interaktionOffen={false}
      buehne={<StepFoto id="Z3.1" />}
      warum={
        <p>
          Ein Buchstabe falsch — G0 statt G1 —, und das Werkzeug fährt mit vollem Tempo
          dorthin, wo es schneiden sollte. Deshalb hat dieser Beruf ein festes Verfahren
          gegen den eigenen Tippfehler.
        </p>
      }
      interaktion={
        <div className="flex flex-col gap-2.5">
          <div className="flex flex-wrap gap-2">
            {SCHRITTE.map((s) => (
              <Wahlflaeche
                key={s.id}
                onClick={() => waehle(s.id)}
                gewaehlt={offen === s.id}
                data-testid={`z31-${s.id}`}
                className="w-auto flex-1 justify-center rounded-kh-pill font-semibold"
              >
                {gelesen.includes(s.id) && offen !== s.id && (
                  <Check
                    className="size-4 shrink-0 text-kh-signal"
                    strokeWidth={3}
                    aria-hidden
                  />
                )}
                {s.label}
              </Wahlflaeche>
            ))}
          </div>

          <Wechsel takt={offen ?? 'nichts'}>
            {schritt ? (
              <p
                data-auswaehlbar
                data-testid="z31-text"
                className="kh-feld px-4 py-3 text-[1.0625rem] leading-[1.45] text-kh-paper/90"
              >
                {schritt.text}
              </p>
            ) : null}
          </Wechsel>
        </div>
      }
      fuss={<StepFuss id="Z3.1" />}
    />
  )
}
