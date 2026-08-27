import { ArrowRight } from 'lucide-react'
import { motion } from 'motion/react'
import { StepFoto } from '@/khpl/buehne/Foto'
import { Verzweigung } from '@/khpl/komponenten/Verzweigung'
import { wahlflaeche } from '@/khpl/komponenten/Wahlflaeche'
import { useStepNavigation } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { KARRIEREWEGE } from './karrierewege'

/**
 * C8 — Und danach? Der Karrierebereich (khpl-tag-zimmerer.md 6, C8).
 *
 * **Struktur unverändert vom gebauten Tag übernommen**, wie die Spec es
 * verlangt: drei antippbare Karten nebeneinander, alle drei `immerOffen` im
 * Graphen — sie verschwinden nicht, sobald eine davon geöffnet wurde. „Der
 * eigentliche Überraschungsinhalt: dass Handwerk auch Studium heißen kann.
 * Diese Karte darf sich nicht hinter den anderen verstecken.“ Gleiche Größe,
 * gleiche Farbe, gleiche Nummerngröße ist die Umsetzung davon.
 *
 * **Neu sind die Inhalte, und zwar bis auf die letzte Zahl.**
 * `steps/zimmerer/karrierewege.ts` ist eine eigene Datei (khpl-tage.md §6.1
 * V2), weil sich die vier Berufe in *jeder* untersuchten Dimension
 * unterscheiden: zwischen 937 € und 1.243 € im ersten Lehrjahr liegt ein
 * Drittel, zwischen 5.600 € und 13.500 € Meisterkosten mehr als das Doppelte.
 * Dieselbe Zahl für alle vier zu zeigen wäre nicht ungenau, sondern falsch.
 *
 * **Der Fuß zeigt hier kein Abstecher-Angebot** (`offen={[]}`): die Karten
 * *sind* das Angebot. Beides nebeneinander wären dieselben drei Wege zweimal
 * auf einem Screen.
 *
 * ⚠️ **Für die Übersicht selbst liegt kein eigenes Motiv im Repo.** Die
 * Medienliste (khpl-tag-zimmerer.md 10) führt unter „vorhanden“ nur `b91`–`b93`
 * für C8.**x**. Der Screen trägt deshalb einen **Platzhalter** aus demselben
 * gemeinsamen `schritte/`-Bestand: `m9-karriere.webp`, Blick von unten ins
 * Sparrenwerk. Ohne Eintrag rendert `StepFoto` nichts, und der Einstieg in den
 * Karrierebereich fing hochkant mit einem schwarzen Feld an — auf der Stele
 * sieht das nach Ladefehler aus. Der Medienbedarf bleibt gemeldet.
 */
export function C8() {
  const { weiter, zumAbstecher } = useStepNavigation('C8')

  return (
    <StepShell
      id="C8"
      interaktionOffen={false}
      buehne={<StepFoto id="C8" />}
      fachtext={
        <p>
          Drei Jahre Ausbildung, dann Geselle. Danach hört es nicht auf — es fängt an.
          Drei Wege, alle drei offen. Schau dir an, was dich interessiert.
        </p>
      }
      interaktion={
        <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {KARRIEREWEGE.map((weg, i) => (
            <li key={weg.id} className="flex">
              <motion.button
                type="button"
                initial={{ opacity: 0, transform: 'translateY(18px) scale(1)' }}
                animate={{ opacity: 1, transform: 'translateY(0px) scale(1)' }}
                whileTap={{ transform: 'translateY(0px) scale(0.96)' }}
                transition={{ duration: 0.42, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => zumAbstecher(weg.id)}
                data-testid={`c8-${weg.id}`}
                className={`${wahlflaeche({ form: 'karte' })} min-h-[112px] overflow-hidden`}
              >
                {/* Die Ziffer macht aus drei gleich aussehenden Kacheln drei
                    unterscheidbare Ziele — und sie steht ganz in der Karte,
                    nicht halb über ihrer Kante. */}
                <span
                  aria-hidden
                  className="absolute top-1 right-3 font-display text-[3rem] leading-none text-white/8"
                >
                  {i + 1}
                </span>
                <span className="kh-titel-klein relative text-kh-orange">
                  {weg.titel}
                </span>
                <span className="relative flex items-end justify-between gap-2">
                  <span className="text-[1rem] leading-snug text-kh-paper/80">
                    {weg.koeder}
                  </span>
                  <ArrowRight
                    className="size-5 shrink-0 text-kh-orange"
                    strokeWidth={2.5}
                    aria-hidden
                  />
                </span>
              </motion.button>
            </li>
          ))}
        </ul>
      }
      fuss={
        <Verzweigung
          offen={[]}
          weiterVon="C8"
          onAbstecher={zumAbstecher}
          onWeiter={weiter}
        />
      }
    />
  )
}
