import { ArrowRight } from 'lucide-react'
import { motion } from 'motion/react'
import { StepFoto } from '@/khpl/buehne/Foto'
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
      interaktionOffen={false}
      onWeiter={weiter}
      buehne={<StepFoto id="M9" />}
      fachtext={
        <p>
          Drei Jahre Ausbildung, dann Geselle. Danach hört es nicht auf — es fängt an.
          Drei Wege, alle offen. Schau dir an, was dich interessiert.
        </p>
      }
      interaktion={
        // Kein `h-full justify-center` mehr: die Karten hingen dadurch in der
        // Mitte einer weißen Fläche, mit einem Loch darüber und einem darunter.
        // Sie stehen jetzt einfach im Textfluss der Karte, direkt unter dem
        // Fachtext — und die Fläche ringsum trägt ein Foto.
        <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {KARRIEREWEGE.map((weg, i) => (
            <li key={weg.id} className="flex">
              {/*
                Drei Karten, drei Nummern. Der Titel steht in Anton, damit die
                Wahl aussieht wie eine Wahl und nicht wie drei Listeneinträge —
                und die Ziffer oben rechts macht aus drei gleich aussehenden
                Kacheln drei unterscheidbare Ziele. „Studium“ darf sich nicht
                hinter den anderen verstecken (flow 7 M9); gleiche Größe,
                gleiche Farbe, gleiche Nummerngröße ist die Umsetzung davon.
              */}
              <motion.button
                type="button"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                whileTap={{ scale: 0.96 }}
                transition={{
                  duration: 0.42,
                  delay: i * 0.09,
                  ease: [0.22, 1, 0.36, 1],
                }}
                onClick={() => zumAbstecher(weg.id)}
                data-testid={`m9-${weg.id}`}
                className="relative flex min-h-[112px] w-full flex-col justify-between gap-2 overflow-hidden rounded-kh border-2 border-kh-line-strong bg-white/6 p-4 text-left"
              >
                <span
                  aria-hidden
                  className="absolute -top-3 right-2 font-display text-[3.5rem] leading-none text-white/8"
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
        // Kein `gedaempft`: auf M9 ist keine Übung offen, die den gefüllten
        // Knopf für sich beanspruchen könnte. Die drei Karriere-Karten sind
        // Umriss-Angebote — bliebe Weiter auch nur ein Umriss, stünde auf dem
        // Screen gar keine gefüllte Fläche und nichts sagte, wo es weitergeht.
        <Verzweigung
          offen={[]}
          weiterVon="M9"
          onAbstecher={zumAbstecher}
          onWeiter={weiter}
        />
      }
    />
  )
}
