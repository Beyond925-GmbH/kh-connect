import { useEffect } from 'react'
import { motion } from 'motion/react'
import type { StepId } from '@/khpl/flow/steps'
import { StepFoto } from '@/khpl/buehne/Foto'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { merkeKarriereweg } from '@/khpl/store/fortschritt'
import { karriereweg } from './karrierewege'

/**
 * B9.1 / B9.2 / B9.3 — Meister · Techniker · Studium.
 * Abstecher von M9, münden in M10.
 *
 * Je eine Info-Karte mit gleichem Aufbau (khpl-flow.md 7 B9.x): Was ist das ·
 * Wie lange · Was es kostet · Was du verdienst. `Info only` auf dem Board —
 * deshalb keine Interaktion und keine Aha-Karte (ui-shell 5).
 *
 * Beim Öffnen wird der Weg vermerkt. Daraus speist sich der personalisierte
 * Aufhänger in M10 — genau die `XYZ`-Logik des Boards.
 */
export function B9({ id }: { id: StepId }) {
  const weg = karriereweg(id)

  useEffect(() => {
    merkeKarriereweg(id)
  }, [id])

  if (!weg) return null

  return (
    <StepShell
      id={id}
      titelZusatz="Karriere-Weg"
      interaktionOffen={false}
      // Die drei Karriere-Screens hatten vorher überhaupt kein Bild: weiße
      // Fläche, eine Definitionsliste, ein Knopf. Genau die drei Screens, die
      // den Ausschlag geben sollen, ob jemand am Stand stehen bleibt.
      // Ohne Motiv für diese Id rendert `StepFoto` nichts — dasselbe Ergebnis
      // wie vorher die Abfrage gegen die Motivliste.
      buehne={<StepFoto id={id} />}
      interaktion={
        /*
          Unterhalb `sm` eine Stufe kompakter: das Panel steht auf dem Handy
          hochkant am 84-%-Anschlag, und in der vollen Setzung lag die vierte
          Karte — ausgerechnet die Verdienstangabe, wegen der jemand den
          Abstecher öffnet — komplett unter der Scrollkante (95 px Rest).
        */
        <dl className="flex flex-col gap-2.5 max-sm:gap-2">
          {weg.abschnitte.map((a, i) => (
            <motion.div
              key={a.frage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              // Je Frage ein eigenes Feld statt vier Absätze an einer
              // gemeinsamen Linie: „Was ist das · Wie lange · Was es kostet ·
              // Was du verdienst“ sind vier Antworten auf vier Fragen, und als
              // durchlaufende Definitionsliste liest sich das wie ein Merkblatt.
              className="kh-feld px-4 py-3 max-sm:px-3.5 max-sm:py-2"
            >
              <dt className="kh-etikett">{a.frage}</dt>
              <dd className="mt-1.5 text-[1.0625rem] leading-[1.45] text-kh-paper/90 max-sm:mt-1 max-sm:text-[1rem] max-sm:leading-[1.4] sm:text-[1.1875rem]">
                {a.antwort}
              </dd>
            </motion.div>
          ))}
        </dl>
      }
      fuss={<StepFuss id={id} />}
    />
  )
}
