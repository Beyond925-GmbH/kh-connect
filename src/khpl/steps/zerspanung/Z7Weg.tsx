import { useEffect } from 'react'
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
 * Je eine Info-Karte mit gleichem Aufbau, ohne Interaktion und ohne Aha-Karte
 * (`Info only`, ui-shell 5). Beim Öffnen wird der Weg vermerkt; daraus speist
 * sich der personalisierte Aufhänger auf dem CTA-Screen Z8.
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
      fuss={<StepFuss id={id} />}
    />
  )
}
