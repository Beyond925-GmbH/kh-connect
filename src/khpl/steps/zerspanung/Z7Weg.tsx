import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { motion } from 'motion/react'
import type { StepId } from '@/khpl/flow/steps'
import { StepFoto } from '@/khpl/buehne/Foto'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { merkeAntwort, useFortschritt } from '@/khpl/store/fortschritt'
import { karriereweg } from './karrierewege'
import { useSchmal } from '@/khpl/shell/schmal'

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
 * **Auf dem Handy hochkant klappen die Felder** (`Antwortliste`). Vier volle
 * Antworten sind dort höher als das Panel, und was unter der Scrollkante lag,
 * war ausgerechnet „Was du verdienst“ — die Angabe, wegen der der Abstecher
 * geöffnet wird. Am Messestand wird in einem Panel nicht gescrollt; also
 * stehen auf schmalen Screens alle vier **Fragen** über der Kante, und die
 * Antwort kommt auf Tipp. Quer liegen die Felder stattdessen zweispaltig im
 * breiten Panel (`karteBreit`), dann passt alles ohne Griffe.
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
      // Quer: vier Felder zweispaltig statt untereinander — mit der schmalen
      // Spalte war das vierte Feld angeschnitten, während rechts eine halbe
      // Fotowand leer stand.
      karteBreit
      buehne={<StepFoto id={id} />}
      fachtext={<p>{weg.koeder}</p>}
      interaktion={<Antwortliste abschnitte={weg.abschnitte} />}
      fuss={<StepFuss id={id} />}
    />
  )
}

/**
 * Die vier Felder — Was ist das · Wie lange · Was es kostet · Was du
 * verdienst. Sie sind gleichrangig, und genau deshalb dürfen sie nicht
 * scrollen: das letzte ist das, wegen dem man hier ist.
 *
 * Auf schmalen Screens steht deshalb je Feld die Frage, die Antwort kommt auf
 * Tipp; das erste Feld kommt offen an, damit der Screen nicht mit vier
 * zugeklappten Zeilen anfängt. Überall sonst stehen alle Antworten da —
 * quer zweispaltig im breiten Panel.
 */
function Antwortliste({
  abschnitte,
}: {
  abschnitte: readonly { frage: string; antwort: string }[]
}) {
  const schmal = useSchmal()
  const [offen, setOffen] = useState(0)

  if (!schmal) {
    return (
      <dl className="flex flex-col gap-2.5 landscape:grid landscape:grid-cols-2">
        {abschnitte.map((a, i) => (
          <motion.div
            key={a.frage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            // Bei ungerader Feldzahl (Studium trägt drei) nimmt das letzte
            // Feld die volle Breite: halbbreit wickelte sein Text auf fünf
            // Zeilen und lief unter die Scrollkante.
            className={`kh-feld px-4 py-3 ${
              i === abschnitte.length - 1 && abschnitte.length % 2 === 1
                ? 'landscape:col-span-2'
                : ''
            }`}
          >
            <dt className="kh-etikett">{a.frage}</dt>
            <dd className="mt-1.5 text-[1.0625rem] leading-[1.45] text-kh-paper/90 sm:text-[1.1875rem]">
              {a.antwort}
            </dd>
          </motion.div>
        ))}
      </dl>
    )
  }

  return (
    <div className="flex flex-col gap-2" data-testid="z7-antworten">
      {abschnitte.map((a, i) => {
        const auf = offen === i
        return (
          <motion.div
            key={a.frage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="kh-feld overflow-hidden"
          >
            <button
              type="button"
              onClick={() => setOffen(auf ? -1 : i)}
              aria-expanded={auf}
              data-testid={`z7-frage-${i}`}
              className="flex min-h-[48px] w-full items-center justify-between gap-3 px-4 py-2.5 text-left"
            >
              <span className="kh-etikett">{a.frage}</span>
              <ChevronDown
                aria-hidden
                className={`size-5 shrink-0 text-kh-paper/50 transition-transform ${
                  auf ? 'rotate-180' : ''
                }`}
                strokeWidth={2.25}
              />
            </button>
            {auf && (
              <p className="px-4 pb-3 text-[1.0625rem] leading-[1.45] text-kh-paper/90">
                {a.antwort}
              </p>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}
