import { useEffect, useRef } from 'react'
import type { StepId } from '@/khpl/flow/steps'
import { StepFoto } from '@/khpl/buehne/Foto'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { merkeAntwort, useFortschritt } from '@/khpl/store/fortschritt'
import { karriereweg } from './karrierewege'

/**
 * C8.1 / C8.2 / C8.3 — Meister · Techniker · Studium.
 * Abstecher von C8, münden in C9.
 *
 * ⚠️ **Stub des Fundament-Agenten**, aber ein tragender: die Inhalte stehen
 * vollständig in `karrierewege.ts` und sind belegt. Was der Steps-Agent hier
 * noch macht, ist Gestaltung, nicht Recherche.
 *
 * **Warum das Vermerken hier steht und nicht in `merkeKarriereweg`.** Der Store
 * hat für den angesehenen Karriereweg eine fertige Funktion — sie schreibt aber
 * fest nach `answers.m9`, und `m9` gehört dem Dachdecker. Der Schlüssel dieses
 * Tages ist `c8`. Die Funktion gehört keinem der drei Agenten, also wird sie
 * nicht umgebaut, sondern umgangen: `merkeAntwort('c8', …)` tut dasselbe im
 * eigenen Abschnitt. **Gemeldet** — `merkeKarriereweg` ist berufsspezifisch,
 * obwohl es in der gemeinsamen Hälfte des Stores steht, und alle vier Tage
 * brauchen es (khpl-tage.md §6.2).
 */
export function C8x({ id }: { id: StepId }) {
  const weg = karriereweg(id)
  const bisher = useFortschritt().answers.c8?.angesehen ?? []
  // Über ein Ref, nicht als Abhängigkeit: der Effekt schreibt in denselben
  // Zustand, den er läse — als Abhängigkeit liefe er nach seinem eigenen
  // Schreiben ein zweites Mal.
  const stand = useRef(bisher)
  stand.current = bisher

  useEffect(() => {
    // Reihenfolge des Öffnens; der zuletzt geöffnete Weg speist den
    // personalisierten Aufhänger in C9.
    const alt = stand.current
    if (alt[alt.length - 1] === id) return
    merkeAntwort('c8', { angesehen: [...alt.filter((x) => x !== id), id] })
  }, [id])

  if (!weg) return null

  return (
    <StepShell
      id={id}
      titelZusatz="Karriere-Weg"
      interaktionOffen={false}
      buehne={<StepFoto id={id} />}
      interaktion={
        <dl className="flex flex-col gap-2.5">
          {weg.abschnitte.map((a) => (
            <div key={a.frage} className="kh-feld px-4 py-3">
              <dt className="kh-etikett">{a.frage}</dt>
              <dd className="mt-1.5 text-[1.0625rem] leading-[1.45] text-kh-paper/90 sm:text-[1.1875rem]">
                {a.antwort}
              </dd>
            </div>
          ))}
        </dl>
      }
      fuss={<StepFuss id={id} />}
    />
  )
}
