import { useEffect, useRef } from 'react'
import type { StepId } from '@/khpl/flow/steps'
import { StepFoto } from '@/khpl/buehne/Foto'
import { Klappliste } from '@/khpl/komponenten/Klappliste'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { merkeAntwort, useFortschritt } from '@/khpl/store/fortschritt'
import { karriereweg } from './karrierewege'

/**
 * Z8.1 / Z8.2 / Z8.3 — Industriemeister · Techniker · Studium. Abstecher
 * von Z8, münden in Z9. Dieselbe Form wie `B9`, `C8x` und `A8Weg`: eine
 * Klappliste mit den Abschnitten des Weges, keine Übung.
 *
 * **Beim Öffnen wird der Weg in `answers.z8` vermerkt** — daraus speist
 * sich der personalisierte Aufhänger auf Z9. Geschrieben wird über
 * `merkeAntwort`, nicht über `merkeKarriereweg`: die Hüllenfunktion
 * schreibt fest verdrahtet nach `m9`, einem Dachdecker-Schlüssel (gemeldet,
 * siehe `A8Weg`).
 */
export function Z8Weg({ id }: { id: StepId }) {
  const weg = karriereweg(id)
  const angesehen = useFortschritt().answers.z8?.angesehen ?? []

  const bisher = useRef(angesehen)
  bisher.current = angesehen

  useEffect(() => {
    const liste = bisher.current
    if (liste[liste.length - 1] === id) return
    merkeAntwort('z8', { angesehen: [...liste.filter((x) => x !== id), id] })
  }, [id])

  if (!weg) return null

  return (
    <StepShell
      id={id}
      auftrag={null}
      ansage={null}
      titelZusatz="Karriere-Weg"
      karteBreit
      interaktionOffen={false}
      buehne={<StepFoto id={id} />}
      interaktion={
        <Klappliste abschnitte={weg.abschnitte} kennung="z8weg" spaltenQuer={2} />
      }
      fuss={<StepFuss id={id} />}
    />
  )
}
