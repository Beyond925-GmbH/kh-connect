import { useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import type { StepId } from '@/khpl/flow/steps'
import { StepFoto } from '@/khpl/buehne/Foto'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { merkeAntwort, useFortschritt } from '@/khpl/store/fortschritt'
import { karriereweg } from './karrierewege'

/**
 * A8.1 / A8.2 / A8.3 — Meister · Techniker · Studium. Abstecher von A8,
 * münden in A9.
 *
 * Je eine Info-Karte mit gleichem Aufbau (Spec 6, A8): die Abschnitte des
 * Weges als Frage und Antwort. Keine Übung und keine Aha-Karte — dieselbe Form
 * wie `B9` beim Dachdecker, anderer Inhalt.
 *
 * **Beim Öffnen wird der Weg vermerkt.** Daraus speist sich der
 * personalisierte Aufhänger auf A9: wer sich das Studium angesehen hat, liest
 * dort den Satz über das Studium.
 *
 * ⚠️ **Vermerkt wird über `merkeAntwort('a8', …)` und nicht über
 * `merkeKarriereweg`** — und der Grund ist eine Naht in der Hülle, die
 * gemeldet und nicht repariert wird (khpl-tage.md 6.2):
 * `store/fortschritt.ts` schreibt in `merkeKarriereweg` **fest verdrahtet**
 * nach `answers.m9`, einem Dachdecker-Schlüssel. Zur Laufzeit kollidiert
 * nichts (der Fortschritt liegt je Beruf), aber V5 verlangt disjunkte
 * Schlüssel je Beruf, und `a8` ist der dieses Tages. Bis die Funktion einen
 * Schlüssel entgegennimmt, schreibt dieser Screen ihn selbst — dieselbe Logik,
 * nur in den eigenen Abschnitt.
 */
export function A8Weg({ id }: { id: StepId }) {
  const weg = karriereweg(id)
  const angesehen = useFortschritt().answers.a8?.angesehen ?? []

  // Der Stand vor diesem Effekt, ohne ihn in die Abhängigkeiten zu ziehen:
  // sonst schriebe der Effekt, löste ein Rendern aus und liefe erneut.
  const bisher = useRef(angesehen)
  bisher.current = angesehen

  useEffect(() => {
    const liste = bisher.current
    if (liste[liste.length - 1] === id) return
    // Reihenfolge des Öffnens; der zuletzt geöffnete Weg speist den
    // personalisierten Aufhänger auf A9.
    merkeAntwort('a8', { angesehen: [...liste.filter((x) => x !== id), id] })
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
          {weg.abschnitte.map((a, i) => (
            <motion.div
              key={a.frage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              // Je Frage ein eigenes Feld statt einer durchlaufenden
              // Definitionsliste: „Was ist das · Wie lange · Was es kostet“
              // sind Antworten auf Fragen und lesen sich am Stück wie ein
              // Merkblatt.
              className="kh-feld px-4 py-3"
              data-testid={`a8weg-${a.frage}`}
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
