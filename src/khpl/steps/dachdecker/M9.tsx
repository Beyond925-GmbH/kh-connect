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
 * M9 — Und danach?
 *
 * Drei antippbare Karten nebeneinander. Jede öffnet kurze
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
      auftrag={'Sieh dir an, welcher Weg dich interessiert.'}
      ansage={null}
      interaktionOffen={false}
      buehne={<StepFoto id="M9" />}
      warum={
        <p>Drei Jahre Ausbildung, dann Geselle. Danach drei Wege — alle drei offen.</p>
      }
      interaktion={
        // Kein `h-full justify-center` mehr: die Karten hingen dadurch in der
        // Mitte einer weißen Fläche, mit einem Loch darüber und einem darunter.
        // Sie stehen jetzt einfach im Textfluss der Karte, direkt unter dem
        // Fachtext — und die Fläche ringsum trägt ein Foto.
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
              {/*
                Drei Karten, drei Nummern. Der Titel steht in Anton, damit die
                Wahl aussieht wie eine Wahl und nicht wie drei Listeneinträge —
                und die Ziffer oben rechts macht aus drei gleich aussehenden
                Kacheln drei unterscheidbare Ziele. „Studium“ darf sich nicht
                hinter den anderen verstecken; gleiche Größe,
                gleiche Farbe, gleiche Nummerngröße ist die Umsetzung davon.
              */}
              <button
                type="button"
                onClick={() => zumAbstecher(weg.id)}
                data-testid={`m9-${weg.id}`}
                className={`${wahlflaeche({ form: 'karte' })} min-h-[112px] overflow-hidden`}
              >
                {/* Die Schattenziffer stand halb außerhalb der Karte und wurde
                    an der Kante abgeschnitten — bei `overflow-hidden` sieht
                    das nach Fehler aus, nicht nach Absicht. Jetzt steht sie
                    ganz drin, oben rechts, und der Titel läuft nicht mehr
                    hinein. */}
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
        // `offen={[]}`: der Fuß zeigt hier bewusst kein Abstecher-Angebot und
        // damit auch keinen Wege-Dialog — die drei Karten *sind* das Angebot.
        // Weiter bleibt der eine gefüllte Knopf, der sagt, wo es weitergeht.
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
