import { ArrowRight } from 'lucide-react'
import { motion } from 'motion/react'
import { Verzweigung } from '@/khpl/komponenten/Verzweigung'
import { useStepNavigation } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { KARRIEREWEGE } from './karrierewege'

/**
 * M9 — Und danach?
 *
 * Drei antippbare Karten nebeneinander (khpl-flow.md 7 M9). Jede öffnet kurze
 * Infos; **alle drei bleiben jederzeit erreichbar** — deshalb sind B9.1–B9.3
 * im Graphen als `immerOffen` markiert und verschwinden nicht, sobald sie
 * einmal geöffnet wurden.
 *
 * „Der eigentliche Überraschungsinhalt: dass Handwerk auch Studium heißen
 * kann. Diese Karte darf sich nicht hinter den anderen verstecken.“ Sie steht
 * deshalb gleichrangig neben den anderen und trägt den Köder, der die Frage
 * direkt beantwortet: *Ja, das geht — auch ohne Abitur.*
 *
 * Der Fuß zeigt hier **kein** Abstecher-Angebot: die Karten sind das Angebot.
 * Beides nebeneinander wären dieselben drei Wege zweimal auf einem Screen.
 */
export function M9() {
  const { weiter, zumAbstecher } = useStepNavigation('M9')

  return (
    <StepShell
      id="M9"
      aufteilung="uebung"
      interaktionOffen={false}
      onWeiter={weiter}
      fachtext={
        <p>
          Drei Jahre Ausbildung, dann Geselle. Danach hört es nicht auf — es fängt an.
          Drei Wege, alle offen. Schau dir an, was dich interessiert.
        </p>
      }
      interaktion={
        <div className="flex h-full min-h-0 flex-col justify-center">
          <ul className="grid auto-rows-fr grid-cols-1 gap-3 landscape:grid-cols-3">
            {KARRIEREWEGE.map((weg, i) => (
              <li key={weg.id}>
                <motion.button
                  type="button"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: i * 0.09,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  onClick={() => zumAbstecher(weg.id)}
                  data-testid={`m9-${weg.id}`}
                  className="flex size-full min-h-[104px] flex-col justify-between gap-2 rounded-kh border border-kh-rule bg-kh-surface p-5 text-left transition-colors hover:border-kh-orange hover:bg-kh-orange/5"
                >
                  <span className="kh-h3 text-kh-orange-text">{weg.titel}</span>
                  <span className="text-[15px] leading-snug text-kh-grey">
                    {weg.koeder}
                  </span>
                  <ArrowRight
                    className="size-5 text-kh-orange-text"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                </motion.button>
              </li>
            ))}
          </ul>
        </div>
      }
      fuss={
        <Verzweigung
          offen={[]}
          weiterVon="M9"
          onAbstecher={zumAbstecher}
          onWeiter={weiter}
          gedaempft
        />
      }
    />
  )
}
