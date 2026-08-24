import { ArrowRight } from 'lucide-react'
import { motion } from 'motion/react'
import { StepFoto } from '@/khpl/buehne/Foto'
import { Verzweigung } from '@/khpl/komponenten/Verzweigung'
import { wahlflaeche } from '@/khpl/komponenten/Wahlflaeche'
import { useStepNavigation } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { KARRIEREWEGE } from './karrierewege'

/**
 * A8 — Und danach? Der Karrierebereich, Struktur unverändert wie bei allen vier
 * Tagen (Spec 6, A8) und im Aufbau identisch mit M9.
 *
 * Drei antippbare Karten nebeneinander. **Alle drei bleiben jederzeit
 * erreichbar** — A8.1–A8.3 sind im Graphen als `immerOffen` markiert und
 * verschwinden nicht, sobald sie einmal geöffnet wurden.
 *
 * Der Fuß zeigt hier **kein** Abstecher-Angebot: die Karten *sind* das
 * Angebot. Beides nebeneinander wären dieselben drei Wege zweimal auf einem
 * Screen.
 *
 * ⚠️ **Die Zahlen sind die dieses Berufs und keine geerbten.** Der Bestand in
 * `steps/dachdecker/karrierewege.ts` führt Zimmerer-Zahlen; für SHK gelten
 * andere Kosten, eine andere Technikerfachrichtung und ein anderer
 * Studien-Anker (khpl-tage.md 0c, `belege/ausbildung-karriere.md`). Sie stehen
 * deshalb in `steps/anlagenmechanik/karrierewege.ts`.
 *
 * ⚠️ **Kein Motiv vergeben** (Spec 10): die Medienliste dieses Tages nennt für
 * A8 selbst kein Foto, nur für die drei Karten. `StepFoto` rendert dann
 * nichts, und die Bühne bleibt leer — dasselbe Ergebnis wie ein Step ganz ohne
 * `buehne`. Sobald ein Motiv in der Motivliste steht, trägt es den Screen ohne
 * weitere Änderung hier.
 */
export function A8() {
  const { weiter, zumAbstecher } = useStepNavigation('A8')

  return (
    <StepShell
      id="A8"
      interaktionOffen={false}
      buehne={<StepFoto id="A8" />}
      fachtext={
        // Dreieinhalb Jahre, `BELEGT` (`belege/ausbildung-karriere.md` 2:
        // SHKAMAusbV, 42 Monate). Nicht drei wie beim Dachdecker.
        <p>
          Dreieinhalb Jahre Ausbildung, dann Geselle. Danach hört es nicht auf — es fängt
          an. Drei Wege, alle offen. Schau dir an, was dich interessiert.
        </p>
      }
      interaktion={
        <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {KARRIEREWEGE.map((weg, i) => (
            <li key={weg.id} className="flex">
              {/*
                Drei Karten, drei Nummern. Der Titel steht in Anton, damit die
                Wahl aussieht wie eine Wahl und nicht wie drei Listeneinträge —
                und die Ziffer oben rechts macht aus drei gleich aussehenden
                Kacheln drei unterscheidbare Ziele. „Studium“ darf sich nicht
                hinter den anderen verstecken; gleiche Größe, gleiche Farbe,
                gleiche Nummerngröße ist die Umsetzung davon.
              */}
              <motion.button
                type="button"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                whileTap={{ scale: 0.96 }}
                transition={{ duration: 0.42, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => zumAbstecher(weg.id)}
                data-testid={`a8-${weg.id}`}
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
        // — die drei Karten sind das Angebot. Weiter bleibt der eine gefüllte
        // Knopf, der sagt, wo es weitergeht.
        <Verzweigung
          offen={[]}
          weiterVon="A8"
          onAbstecher={zumAbstecher}
          onWeiter={weiter}
        />
      }
    />
  )
}
