import { ArrowRight } from 'lucide-react'
import { motion } from 'motion/react'
import { StepFoto } from '@/khpl/buehne/Foto'
import { auftritt } from '@/khpl/komponenten/auftritt'
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
          Dreieinhalb Jahre Ausbildung, dann die Prüfung bei der IHK, der Industrie- und
          Handelskammer. Danach bist du Facharbeiter:in — und danach fängt es erst an.
          Drei Wege, alle drei offen.
        </p>
      }
      interaktion={
        <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {KARRIEREWEGE.map((weg, i) => (
            <motion.li
              key={weg.id}
              className="flex"
              {...auftritt(18, { verzoegerung: i * 0.09, dauer: 0.42 })}
            >
              {/*
                Der Auftritt sitzt auf der Zeile, nicht auf der Karte: die
                Karte trägt aus `wahlflaeche` ein `transition-transform` und
                `active:scale-*`. Beides auf einem Element hieß, dass CSS auf
                jeden Frame, den Motion schreibt, noch 150 ms überblendet —
                die Karte kriecht herauf und fällt am Ende den Rest. Ein
                Element, ein Herr.
              */}
              <button
                type="button"
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
              </button>
            </motion.li>
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
