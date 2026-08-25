import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { motion } from 'motion/react'
import type { StepId } from '@/khpl/flow/steps'
import { StepFoto } from '@/khpl/buehne/Foto'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { useSchmal } from '@/khpl/shell/schmal'
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
      // Fünf Faktenblöcke gegen `max-h-[84%]`: quer lagen „Was du verdienst"
      // und „Was NRW dazugibt" unter der Scrollkante (Sichtprüfung, A8.1,
      // `scrollRest` 153 px). Die Bühne ist hier ein Foto und trägt nichts —
      // das breitere Panel spart je Block eine Umbruchzeile, und die fünf
      // Punkte stehen quer wieder ohne Scrollen da.
      karteBreit
      interaktionOffen={false}
      buehne={<StepFoto id={id} />}
      interaktion={<Faktenliste abschnitte={weg.abschnitte} />}
      fuss={<StepFuss id={id} />}
    />
  )
}

/**
 * Die Faktenblöcke des Weges — Was ist das · Wie lange · Was es kostet · Was
 * du verdienst · Was NRW dazugibt.
 *
 * Je Frage ein eigenes Feld statt einer durchlaufenden Definitionsliste: das
 * sind Antworten auf Fragen, und am Stück lesen sie sich wie ein Merkblatt.
 *
 * **Der Aufbau richtet sich nach dem Platz, den es tatsächlich gibt** — und
 * der reicht auf dem Handy für keine Fassung, in der alle Antworten
 * ausgeschrieben stehen. Gemessen auf 390 × 844 (A8.1, `mess.json`): 240 px
 * unter der Scrollkante, „Was du verdienst" mitten im Satz angeschnitten und
 * „Was NRW dazugibt" gar nicht mehr da. Das ist der Block mit der
 * Meisterprämie — genau der, wegen dem jemand diesen Abstecher aufmacht.
 *
 * Gekürzt wird trotzdem nichts: die Zahlen hier sind belegt
 * (`belege/ausbildung-karriere.md`), und ein Beleg, den man weglässt, ist
 * keiner mehr. Stattdessen zwei Fassungen:
 *
 * - **Schmal hochkant klappen die Felder.** Alle Fragen stehen über der Kante,
 *   die Antwort kommt auf Tipp. Das erste Feld kommt offen an, damit der
 *   Screen nicht als Reihe zugeklappter Zeilen beginnt. Dieselbe Antwort wie
 *   in Z7 der Zerspanung, aus demselben Grund: am Messestand wird in einem
 *   Panel nicht gescrollt, und was unter der Kante liegt, ist nicht da.
 * - **Quer zweispaltig im breiten Panel.** Dort ist Breite übrig und Höhe
 *   knapp (A8.1 ipad-quer: 33 px Rest, der letzte Block angeschnitten). Bei
 *   ungerader Feldzahl nimmt das letzte die volle Breite — halbbreit wickelt
 *   sein Text sonst auf so viele Zeilen, dass die Spalte wieder überläuft.
 *
 * iPad hochkant bleibt einspaltig und ausgeschrieben: dort ist der Rest 0.
 */
function Faktenliste({
  abschnitte,
}: {
  abschnitte: readonly { frage: string; antwort: string }[]
}) {
  const schmal = useSchmal()
  const [offen, setOffen] = useState(0)

  const einblenden = (i: number) => ({
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.35, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as const },
  })

  if (!schmal) {
    return (
      <dl className="flex flex-col gap-2 landscape:grid landscape:grid-cols-2">
        {abschnitte.map((a, i) => (
          <motion.div
            key={a.frage}
            {...einblenden(i)}
            className={`kh-feld px-4 py-2.5 ${
              i === abschnitte.length - 1 && abschnitte.length % 2 === 1
                ? 'landscape:col-span-2'
                : ''
            }`}
            data-testid={`a8weg-${a.frage}`}
          >
            <dt className="kh-etikett">{a.frage}</dt>
            <dd className="mt-1 text-[1.0625rem] leading-[1.45] text-kh-paper/90 sm:text-[1.1875rem]">
              {a.antwort}
            </dd>
          </motion.div>
        ))}
      </dl>
    )
  }

  return (
    <div className="flex flex-col gap-2" data-testid="a8weg-klappliste">
      {abschnitte.map((a, i) => {
        const auf = offen === i
        return (
          <motion.div
            key={a.frage}
            {...einblenden(i)}
            className="kh-feld overflow-hidden"
            data-testid={`a8weg-${a.frage}`}
          >
            <button
              type="button"
              onClick={() => setOffen(auf ? -1 : i)}
              aria-expanded={auf}
              data-testid={`a8weg-frage-${i}`}
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
