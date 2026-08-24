import { useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import type { StepId } from '@/khpl/flow/steps'
import { StepFoto } from '@/khpl/buehne/Foto'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { merkeAntwort, useFortschritt } from '@/khpl/store/fortschritt'
import { karriereweg } from './karrierewege'

/**
 * C8.1 / C8.2 / C8.3 — Meister · Techniker · Studium.
 * Abstecher von C8, münden in C9 (khpl-tag-zimmerer.md 6, C8).
 *
 * Je eine Info-Karte mit gleichem Aufbau, `Info only` auf dem Board: keine
 * Interaktion, keine Aha-Karte. Die Inhalte stehen vollständig in
 * `karrierewege.ts` und sind belegt (`belege/ausbildung-karriere.md`, Spalte
 * Zimmerer, Stand 24.08.2026).
 *
 * **Warum die Abschnitte nicht überall vier sind.** Der Dachdecker-Bestand
 * fragt viermal dasselbe ab — Was ist das · Wie lange · Was es kostet · Was du
 * verdienst. khpl-tage.md 0 hält fest, dass in 25 Gesprächen **niemand** von
 * sich aus über Geld gesprochen hat, und die Karrierekarten des Bestands tragen
 * fast nur Zahlen. Deshalb steht auf jeder Karte dieses Tages zuerst, was man in
 * diesem Weg **tut**, und erst danach, was er kostet und bringt; die Meisterkarte
 * hat dafür einen Abschnitt mehr. Die Reihenfolge ist die Aussage — sie kommt
 * aus den Daten, nicht aus dieser Datei.
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
      // Kein Fachtext. Der Köder der Karte steht schon in C8, und ausgerechnet
      // der der Meisterkarte („Eigener Betrieb, eigene Azubis“) ist der Satz,
      // den khpl-tag-zimmerer.md 6 als Besitzstand-Sprache benennt — ihn hier
      // zu wiederholen verdoppelte genau das, was die Abschnitte korrigieren.
      interaktion={
        <dl className="flex flex-col gap-2.5">
          {weg.abschnitte.map((a, i) => (
            <motion.div
              key={a.frage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              // Je Frage ein eigenes Feld statt einer durchlaufenden
              // Definitionsliste: die Abschnitte sind Antworten auf Fragen und
              // lesen sich sonst wie ein Merkblatt.
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
