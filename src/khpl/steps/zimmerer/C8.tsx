import { ArrowRight } from 'lucide-react'
import { motion } from 'motion/react'
import { StepFoto } from '@/khpl/buehne/Foto'
import { auftritt } from '@/khpl/komponenten/auftritt'
import { Verzweigung } from '@/khpl/komponenten/Verzweigung'
import { wahlflaeche } from '@/khpl/komponenten/Wahlflaeche'
import { useStepNavigation } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { KARRIEREWEGE } from './karrierewege'

/**
 * C8 — Und danach? Der Karrierebereich.
 *
 * **Struktur unverändert vom gebauten Tag übernommen:** drei antippbare
 * Karten nebeneinander, alle drei `immerOffen` im
 * Graphen — sie verschwinden nicht, sobald eine davon geöffnet wurde. „Der
 * eigentliche Überraschungsinhalt: dass Handwerk auch Studium heißen kann.
 * Diese Karte darf sich nicht hinter den anderen verstecken.“ Gleiche Größe,
 * gleiche Farbe, gleiche Nummerngröße ist die Umsetzung davon.
 *
 * **Neu sind die Inhalte, und zwar bis auf die letzte Zahl.**
 * `steps/zimmerer/karrierewege.ts` ist eine eigene Datei, weil sich die vier
 * Berufe in *jeder* untersuchten Dimension
 * unterscheiden: zwischen 937 € und 1.243 € im ersten Lehrjahr liegt ein
 * Drittel, zwischen 5.600 € und 13.500 € Meisterkosten mehr als das Doppelte.
 * Dieselbe Zahl für alle vier zu zeigen wäre nicht ungenau, sondern falsch.
 *
 * **Der Fuß zeigt hier kein Abstecher-Angebot** (`offen={[]}`): die Karten
 * *sind* das Angebot. Beides nebeneinander wären dieselben drei Wege zweimal
 * auf einem Screen.
 *
 * ⚠️ **Für die Übersicht selbst liegt kein eigenes Motiv im Repo.** Der
 * Bildbestand führt nur `b91`–`b93` für C8.**x**. Der Screen trägt deshalb
 * einen **Platzhalter** aus demselben
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
      auftrag={'Sieh dir an, welcher Weg dich interessiert.'}
      ansage={null}
      interaktionOffen={false}
      buehne={<StepFoto id="C8" />}
      warum={
        <p>
          Drei Jahre Ausbildung, dann bist du Geselle — fertig ausgebildet. Danach drei
          Wege, alle drei offen.
        </p>
      }
      interaktion={
        <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {KARRIEREWEGE.map((weg, i) => (
            <motion.li
              key={weg.id}
              className="flex"
              {...auftritt(18, { verzoegerung: i * 0.09, dauer: 0.42 })}
            >
              {/*
                Der Auftritt sitzt auf der Zeile, nicht auf der Karte: die
                Karte trägt aus `wahlflaeche` ein `transition-transform` und
                `active:scale-*`. Beides auf einem Element hieß, dass CSS auf
                jeden Frame, den Motion schreibt, noch 150 ms überblendet —
                die Karte kriecht herauf und fällt am Ende den Rest. Ein
                Element, ein Herr.
              */}
              <button
                type="button"
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
              </button>
            </motion.li>
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
