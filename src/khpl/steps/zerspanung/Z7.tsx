import { ArrowRight } from 'lucide-react'
import { motion } from 'motion/react'
import { StepFoto } from '@/khpl/buehne/Foto'
import { Verzweigung } from '@/khpl/komponenten/Verzweigung'
import { wahlflaeche } from '@/khpl/komponenten/Wahlflaeche'
import { useStepNavigation } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { KARRIEREWEGE } from './karrierewege'

/**
 * Z7 — Und danach? · Der Karrierebereich.
 *
 * Struktur unverändert wie bei allen vier Tagen: drei gleichrangige Karten,
 * im Graphen `immerOffen`, damit sie nicht verschwinden, sobald eine geöffnet
 * wurde. **Die Studium-Karte darf sich nicht hinter den anderen verstecken**
 * (flow 7 M9) — gleiche Größe, gleiche Farbe, gleiche Ziffer ist die Umsetzung
 * davon.
 *
 * **Die Inhalte sind eigene** (`karrierewege.ts` in diesem Verzeichnis): kein
 * Handwerksmeister, sondern Industriemeister Metall, Techniker
 * Maschinenbautechnik statt Holztechnik — und **keine NRW-Meisterprämie und
 * keine Meistergründungsprämie**, weil beides Handwerksförderungen sind und
 * für den IHK-Weg nicht gelten (khpl-tage.md §0c). Ein Karrierescreen, der sie
 * zeigt, verspricht ausgerechnet diesem Beruf Geld, das es für ihn nicht gibt.
 *
 * Der Fuß zeigt hier **kein** Abstecher-Angebot: die Karten sind das Angebot.
 * Beides nebeneinander wären dieselben drei Wege zweimal auf einem Screen.
 *
 * **Das Motiv steht in `berufe/zerspanung.ts`, nicht hier.** §10 führt für
 * diesen Screen keinen Slot; genommen ist deshalb `gallery-1.webp` aus dem
 * ungenutzten Bestand. Ohne Eintrag gäbe `StepFoto` nichts zurück, und dieser
 * Screen hätte als einziger des Tages eine leere Bühne — hochkant ein
 * schwarzes oberes Drittel unter dem Titel.
 */
export function Z7() {
  const { weiter, zumAbstecher } = useStepNavigation('Z7')

  return (
    <StepShell
      id="Z7"
      interaktionOffen={false}
      buehne={<StepFoto id="Z7" />}
      fachtext={
        <p>
          Dreieinhalb Jahre Ausbildung, dann Facharbeiter:in. Danach hört es nicht auf —
          es fängt an. Drei Wege, alle offen. Schau dir an, was dich interessiert.
        </p>
      }
      interaktion={
        <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {KARRIEREWEGE.map((weg, i) => (
            <li key={weg.id} className="flex">
              <motion.button
                type="button"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                whileTap={{ scale: 0.96 }}
                transition={{ duration: 0.42, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => zumAbstecher(weg.id)}
                data-testid={`z7-${weg.id}`}
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
        // `offen={[]}`: kein Abstecher-Angebot und damit auch kein Wege-Dialog
        // — die drei Karten *sind* das Angebot. Weiter bleibt der eine
        // gefüllte Knopf, der sagt, wo es weitergeht.
        <Verzweigung
          offen={[]}
          weiterVon="Z7"
          onAbstecher={zumAbstecher}
          onWeiter={weiter}
        />
      }
    />
  )
}
