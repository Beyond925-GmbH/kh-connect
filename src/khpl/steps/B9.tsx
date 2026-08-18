import { useEffect } from 'react'
import { motion } from 'motion/react'
import type { StepId } from '@/khpl/flow/steps'
import { StepFuss, useStepNavigation } from '@/khpl/shell/StepFuss'
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
  const { weiter } = useStepNavigation(id)
  const weg = karriereweg(id)

  useEffect(() => {
    merkeKarriereweg(id)
  }, [id])

  if (!weg) return null

  return (
    <StepShell
      id={id}
      aufteilung="uebung"
      titelZusatz="Karriere-Weg"
      interaktionOffen={false}
      onWeiter={weiter}
      interaktion={
        <div className="flex h-full min-h-0 flex-col justify-center">
          <dl className="flex flex-col gap-3">
            {weg.abschnitte.map((a, i) => (
              <motion.div
                key={a.frage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="border-l-2 border-kh-orange/40 pl-4"
              >
                <dt className="text-[13px] tracking-[0.12em] text-kh-orange uppercase">
                  {a.frage}
                </dt>
                <dd className="mt-0.5 text-[16px] leading-[1.5] text-kh-ink">
                  {a.antwort}
                </dd>
              </motion.div>
            ))}
          </dl>
        </div>
      }
      fuss={<StepFuss id={id} />}
    />
  )
}
