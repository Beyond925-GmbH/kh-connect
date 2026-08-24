import { useEffect } from 'react'
import { motion } from 'motion/react'
import type { StepId } from '@/khpl/flow/steps'
import { StepFoto } from '@/khpl/buehne/Foto'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { merkeAntwort, useFortschritt } from '@/khpl/store/fortschritt'
import { karriereweg } from './karrierewege'

/**
 * Z7.1 / Z7.2 / Z7.3 — Meister · Techniker · Studium.
 * Abstecher von Z7, münden in Z8.
 *
 * Je eine Info-Karte mit gleichem Aufbau: Was ist das · Wie lange · Was es
 * kostet · Was du verdienst. `Info only` (ui-shell 5) — deshalb keine
 * Interaktion und keine Aha-Karte. Vier Antworten auf vier Fragen, je in einem
 * eigenen Feld: als durchlaufende Definitionsliste läse sich das wie ein
 * Merkblatt.
 *
 * **Die Inhalte sind eigene, und der Unterschied trägt bis hierher:**
 * Zerspanung ist ein IHK-Beruf. Industriemeister Metall statt
 * Handwerksmeister, Techniker Maschinenbautechnik statt Holz- oder
 * Bautechnik, und **keine NRW-Meisterprämie** (khpl-tage.md §0c,
 * `belege/ausbildung-karriere.md`). Die Texte stehen in `karrierewege.ts`
 * daneben; dieser Screen ist nur ihre Bühne.
 *
 * Beim Öffnen wird der Weg vermerkt. Daraus speist sich der personalisierte
 * Aufhänger auf dem CTA-Screen Z8 — genau die `XYZ`-Logik des Boards.
 *
 * ⚠️ **Gemeldete Naht zum Store.** Der Bestand hat dafür `merkeKarriereweg`,
 * aber die Funktion schreibt fest nach `answers.m9` — sie ist trotz V5 ein
 * Dachdecker-Stück in gemeinsamem Code. Dieser Tag schreibt deshalb über das
 * allgemeine `merkeAntwort` in seinen eigenen Schlüssel `answers.z7`, mit
 * derselben Regel: Reihenfolge des Öffnens, der zuletzt geöffnete Weg zählt.
 * Die Verallgemeinerung von `merkeKarriereweg` betrifft alle vier Tage und
 * gehört nicht in einen (khpl-tage.md §6.2).
 */
export function Z7Weg({ id }: { id: StepId }) {
  const fortschritt = useFortschritt()
  const weg = karriereweg(id)

  useEffect(() => {
    const bisher = fortschritt.answers.z7?.angesehen ?? []
    if (bisher[bisher.length - 1] === id) return
    merkeAntwort('z7', { angesehen: [...bisher.filter((x) => x !== id), id] })
  }, [id, fortschritt])

  if (!weg) return null

  return (
    <StepShell
      id={id}
      titelZusatz="Karriere-Weg"
      interaktionOffen={false}
      buehne={<StepFoto id={id} />}
      fachtext={<p>{weg.koeder}</p>}
      interaktion={
        <dl className="flex flex-col gap-2.5">
          {weg.abschnitte.map((a, i) => (
            <motion.div
              key={a.frage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="kh-feld px-4 py-3"
            >
              <dt className="kh-etikett">{a.frage}</dt>
              <dd className="mt-1.5 text-[1.0625rem] leading-[1.45] text-kh-paper/90 sm:text-[1.1875rem]">
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
