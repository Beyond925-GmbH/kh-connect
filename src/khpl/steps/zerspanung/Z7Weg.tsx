import { useEffect } from 'react'
import type { StepId } from '@/khpl/flow/steps'
import { StepFoto } from '@/khpl/buehne/Foto'
import { Klappliste } from '@/khpl/komponenten/Klappliste'
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
 * **Die Felder klappen — überall** (geteilte `Klappliste`). Vier volle
 * Antworten sind hochkant höher als das Panel, und was unter der Scrollkante
 * lag, war ausgerechnet „Was du verdienst“ — die Angabe, wegen der der
 * Abstecher geöffnet wird. Und das Wortbudget (R5, ~50 Wörter sichtbar) gilt
 * quer genauso: die frühere eigene `Antwortliste` schrieb im breiten Panel
 * alle vier Antworten gleichzeitig aus, rund das Doppelte bis Dreifache des
 * Budgets. Jetzt gilt in beiden Lagen dasselbe Akkordeon — erstes Feld offen,
 * Rest auf Tipp, quer zweispaltig (`spaltenQuer`).
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
      auftrag={null}
      ansage={null}
      titelZusatz="Karriere-Weg"
      interaktionOffen={false}
      // Quer: vier Felder zweispaltig statt untereinander — mit der schmalen
      // Spalte war das vierte Feld angeschnitten, während rechts eine halbe
      // Fotowand leer stand.
      karteBreit
      buehne={<StepFoto id={id} />}
      warum={<p>{weg.koeder}</p>}
      // Die vier Felder — Was ist das · Wie lange · Was es kostet · Was du
      // verdienst. Gleichrangig, und genau deshalb scrollt hier nichts: jede
      // Überschrift bleibt sichtbar, der Text kommt auf Tipp (s. Klappliste).
      interaktion={
        <Klappliste abschnitte={weg.abschnitte} kennung="z7" spaltenQuer={2} />
      }
      fuss={<StepFuss id={id} />}
    />
  )
}
