import { ArrowRight } from 'lucide-react'
import { motion } from 'motion/react'
import { StepFoto } from '@/khpl/buehne/Foto'
import { Verzweigung } from '@/khpl/komponenten/Verzweigung'
import { wahlflaeche } from '@/khpl/komponenten/Wahlflaeche'
import { useStepNavigation } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { KARRIEREWEGE } from './karrierewege'

/**
 * Z8 — Und danach? Der Karrierebereich, im Aufbau identisch mit M9, C8 und
 * A8 — vier Tage, ein Layout. Drei Karten, alle drei bleiben jederzeit
 * erreichbar (`immerOffen` im Graphen).
 *
 * Der Fuß zeigt kein Abstecher-Angebot: die Karten **sind** das Angebot.
 *
 * **Die Zahlen sind die dieses Berufs** (`karrierewege.ts`): IHK-Weg, keine
 * Handwerks-Prämien, Fachrichtung Maschinenbautechnik — nichts davon ist
 * aus einem anderen Tag geerbt.
 */
export function Z8() {
  const { weiter, zumAbstecher } = useStepNavigation('Z8')

  return (
    <StepShell
      id="Z8"
      auftrag={'Sieh dir an, welcher Weg dich interessiert.'}
      ansage={null}
      interaktionOffen={false}
      buehne={<StepFoto id="Z8" />}
      warum={
        // 3,5 Jahre: Verordnung über die Berufsausbildung in den
        // industriellen Metallberufen (42 Monate), zeitstabil.
        <p>
          Dreieinhalb Jahre Ausbildung, IHK-Prüfung, Facharbeiterbrief. Danach hört es
          nicht auf — es fängt an. Drei Wege, alle offen.
        </p>
      }
      interaktion={
        <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {KARRIEREWEGE.map((weg, i) => (
            <li key={weg.id} className="flex">
              <motion.button
                type="button"
                initial={{ opacity: 0, transform: 'translateY(18px) scale(1)' }}
                animate={{ opacity: 1, transform: 'translateY(0px) scale(1)' }}
                whileTap={{ transform: 'translateY(0px) scale(0.96)' }}
                transition={{ duration: 0.42, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => zumAbstecher(weg.id)}
                data-testid={`z8-${weg.id}`}
                className={`${wahlflaeche({ form: 'karte' })} min-h-[112px] overflow-hidden`}
              >
                <span
                  aria-hidden
                  className="absolute top-1 right-3 font-display text-[3rem] leading-none text-white/8"
                >
                  {i + 1}
                </span>
                <span className="kh-titel-klein relative text-kh-orange">
                  {weg.titel}
                </span>
                <span className="relative flex items-end justify-between gap-2">
                  <span className="text-[1rem] leading-snug text-kh-paper/80">
                    {weg.koeder}
                  </span>
                  <ArrowRight
                    className="size-5 shrink-0 text-kh-orange"
                    strokeWidth={2.5}
                    aria-hidden
                  />
                </span>
              </motion.button>
            </li>
          ))}
        </ul>
      }
      fuss={
        <Verzweigung
          offen={[]}
          weiterVon="Z8"
          onAbstecher={zumAbstecher}
          onWeiter={weiter}
        />
      }
    />
  )
}
