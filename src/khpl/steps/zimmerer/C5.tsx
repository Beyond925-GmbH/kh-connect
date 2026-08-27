import { Suspense, lazy, useState } from 'react'
import { motion } from 'motion/react'
import { Check } from 'lucide-react'
import { Dachstuhl3DFallback } from '@/khpl/buehne/Dachstuhl3DFallback'
import { AhaKarte } from '@/khpl/komponenten/AhaKarte'
import { Wechsel } from '@/khpl/komponenten/Wechsel'
import { railIndex } from '@/khpl/flow/steps'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { merkeAntwort, useFortschritt, useGraph } from '@/khpl/store/fortschritt'
import { Begriff } from './Begriff'

/**
 * C5 — Elf Uhr, das Element geht raus. **Die Zäsur**
 * (khpl-tag-zimmerer.md 6, C5).
 *
 * **Warum das die Zäsur ist und nicht eine Mittagspause.** Der Dachdecker-Tag
 * hat um halb zwölf eine Brotzeit auf dem Rohbau — der Screen sagt „schau
 * einmal vom iPad hoch“. Dieselbe Funktion, andere Wahrheit: in der
 * Vorfertigung ist die Pause der Transport. Man sitzt, es passiert etwas, man
 * tut nichts.
 *
 * **Deshalb dieselbe Form wie M6 und trotzdem ein anderer Screen.** Drei
 * Fragen, jede einen Tap von ihrer Antwort entfernt, jede Antwort ersetzt die
 * vorige — das Muster ist übernommen, weil es genau das leistet, was ein Screen
 * ohne Aufgabe braucht: etwas zu entdecken, ohne etwas zu müssen. Der
 * Unterschied liegt in der Bühne. M6 zeigt ein Foto von Menschen, hier fährt
 * das Gespann **weg** und der Blick bleibt in der leeren Halle zurück.
 *
 * **Die ehrliche Kehrseite dieses Tages sitzt hier** (khpl-tage.md 1,
 * Mechanismus 8) — als die dritte der drei Fragen, und mit **beiden Hälften**
 * des Zitats in dieser Reihenfolge. Der zweite Satz ohne den ersten ist
 * Werbung, der erste ohne den zweiten Abschreckung.
 *
 * **Und die Gegenrechnung steht in der Aha-Karte**: der halbe Beruf findet im
 * Trockenen statt, gerade in den Wintermonaten. Sie ist die
 * unwahrscheinlichste Aussage dieses Tages über einen Beruf mit
 * `draussen: 0.9`, und deshalb gehört sie in den Einwurf und nicht in den
 * Fließtext.
 *
 * ⚠️ **Die vierte Frage ist gestrichen.** „Wie viele Elemente sind ein Haus?“
 * ist `NICHT BELEGBAR` (khpl-tag-zimmerer.md 11) — die Zahl hängt an Grundriss
 * und Betrieb, und ein Platzhalter ist kein Beleg. Sie kommt hier nicht vor,
 * auch nicht entschärft.
 *
 * ⚠️ **Gemeldet, nicht gebaut** (khpl-tage.md §6.2): Dieser Screen bräuchte wie
 * M6 die dreifache Geduld im `KioskGuard` — ein Overlay, das nach einer Minute
 * fragt, ob noch jemand da ist, wäre genau der Druck, den die Zäsur nicht
 * ausüben soll. Der Timer kennt heute genau einen Ausnahme-Step, und `shell/`
 * ist eingefroren.
 *
 * `answers.c5` `{ gelesen: string[] }`
 */

const Wandelement3D = lazy(() => import('@/khpl/buehne/zimmerer/Wandelement3D'))

/**
 * Die drei Fragen der Fahrt.
 *
 * Bewusst drei und nicht sechs — dasselbe Argument wie in M6: mehr Karten heißt
 * hier nicht mehr Inhalt, sondern eine Liste, und eine Liste tippt niemand
 * durch, der gerade Pause machen soll.
 *
 * Die Reihenfolge ist die des Blicks aus dem Fenster: erst die Ladung, dann der
 * Anhänger, dann das Wetter.
 */
const FRAGEN = [
  {
    id: 'gewicht',
    frage: 'Wie viel wiegt so ein Element?',
    // `BELEGT` **als Spanne** (belege/zimmerer.md 4): 70–125 kg je m²
    // Wandfläche. Nie ein Punktwert — das Gewicht hängt am Aufbau. Der
    // Kleinwagen ist der Körper-Anker (Designregel R12): Tonnen fühlt niemand,
    // Autos hat jeder gesehen.
    antwort:
      '70 bis 125 Kilo je Quadratmeter. Deine Wand ist acht Meter breit und drei hoch — grob eineinhalb bis drei Tonnen am Haken. So viel wie ein bis zwei Kleinwagen.',
  },
  {
    id: 'hochkant',
    frage: 'Warum steht es hochkant?',
    // `BELEGT` (belege/zimmerer.md 4): zulässige Transportmaße, und der Kran
    // hebt direkt vom Anhänger.
    antwort:
      'Flach liegend wäre die Ladung zu breit für die Straße. Hochkant passt sie — und der Kran hebt sie direkt vom Anhänger an ihren Platz.',
  },
  {
    id: 'regen',
    frage: 'Und wenn es regnet?',
    // Die ehrliche Kehrseite. `INTERVIEW` — Zimmerer Ausbildungsalltag,
    // 10.07.2026. **Beide Hälften, in dieser Reihenfolge**, und mit Sprecher:
    // ohne Zuschreibung wäre der Satz eine Behauptung über den Beruf, mit ihr
    // ist er die Auskunft eines Menschen.
    antwort:
      'Ein Zimmerer, den wir gefragt haben: „Der Kran steht da. Man kann nicht sagen, wir fahren heim, weil’s regnet. Aber abends sieht man, was man geschafft hat.“',
  },
] as const

type FrageId = (typeof FRAGEN)[number]['id']

export function C5() {
  const graph = useGraph()
  const { hoechsterStep, answers } = useFortschritt()
  // Wer über „Dein Weg“ zurückkommt, hat die Abfahrt gesehen. Ein zweites Mal
  // wegzufahren wäre keine Zäsur mehr, sondern eine Wartezeit — dieselbe
  // Überlegung, mit der M5 seine Anfahrt überspringt.
  const schonDagewesen = railIndex(graph, hoechsterStep) > railIndex(graph, 'C5')

  const [offen, setOffen] = useState<FrageId | null>(null)
  const [gelesen, setGelesen] = useState<string[]>(() => answers.c5?.gelesen ?? [])

  const waehle = (id: FrageId) => {
    setOffen((vorher) => (vorher === id ? null : id))
    if (gelesen.includes(id)) return
    const neu = [...gelesen, id]
    setGelesen(neu)
    merkeAntwort('c5', { gelesen: neu })
  }

  const antwort = FRAGEN.find((f) => f.id === offen)

  return (
    <StepShell
      id="C5"
      auftrag={null}
      ansage={null}
      interaktionOffen={false}
      buehne={
        <Suspense fallback={<Dachstuhl3DFallback text="Der Innenlader wird beladen" />}>
          {/*
            Der Zustand ist `verladen` — das Element steht aufgerichtet auf dem
            Anhänger, der fünfte seiner sieben Zustände. `abfahrt` ist
            Wrapper-Vertrag wie die Anfahrt beim Dachdecker: solange sie läuft,
            passiert nichts anderes, und `prefers-reduced-motion` heißt, das
            Gespann ist sofort fort.
          */}
          <Wandelement3D
            zustand="verladen"
            abfahrt={!schonDagewesen}
            deinElement
            // Der Ausschnitt aus C4 — auf dem Anhänger steht *dein* Element,
            // nicht irgendeins (khpl-tag-zimmerer.md 2).
            ausschnitt={answers.c4?.ausschnitt}
          />
        </Suspense>
      }
      warum={
        <>
          <p>
            Das Element wird aufgestellt, auf den{' '}
            <Begriff id="innenlader">Innenlader</Begriff> gefahren, gesichert. Elf Uhr,
            das Gespann rollt vom Hof. Bis zur Baustelle sitzt du und tust nichts — in der
            Vorfertigung ist die Fahrt die Pause.
          </p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 1.2 }}
            // Der eine Satz, um den dieser Screen gebaut ist. In Anton, weil
            // die halbe Halle gerade leer geworden ist und niemand ihn
            // überlesen soll.
            className="kh-titel-klein mt-4 text-kh-orange"
          >
            Der halbe Tag ist damit vorbei.
          </motion.p>
        </>
      }
      interaktion={
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 2 }}
          className="flex flex-col gap-2.5"
        >
          {/* Die Anleitung steht vor dem, was sie erklärt, und macht Platz,
              sobald eine Antwort offen ist. */}
          {!antwort && (
            <p className="px-1 text-[1rem] text-kh-paper/55">
              Drei Fragen, die auf so einer Fahrt aufkommen. Tipp an, was dich
              interessiert.
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            {FRAGEN.map((f) => {
              const aktiv = offen === f.id
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => waehle(f.id)}
                  aria-pressed={aktiv}
                  data-testid={`c5-frage-${f.id}`}
                  className={`flex min-h-[52px] items-center gap-2 rounded-kh-pill border-2 px-4 text-left text-[1.0625rem] font-semibold transition-transform active:scale-95 ${
                    aktiv
                      ? 'border-kh-orange bg-kh-orange text-[#0E0D0B]'
                      : 'border-kh-line-strong bg-white/5 text-kh-paper'
                  }`}
                >
                  {/* Der Haken markiert Gelesenes, ohne es wegzunehmen. */}
                  {gelesen.includes(f.id) && !aktiv && (
                    <Check
                      className="size-4 shrink-0 text-kh-signal"
                      strokeWidth={3}
                      aria-hidden
                    />
                  )}
                  {f.frage}
                </button>
              )
            })}
          </div>

          {/* Eine Antwortfläche, nicht drei aufgeklappte Kästen: das Panel
              bleibt so hoch, wie es war. */}
          <Wechsel takt={offen ?? 'nichts'}>
            {antwort ? (
              <p
                data-auswaehlbar
                data-testid="c5-antwort"
                className="kh-feld px-4 py-3 text-[1.0625rem] leading-[1.45] text-kh-paper/90"
              >
                {antwort.antwort}
              </p>
            ) : null}
          </Wechsel>
        </motion.div>
      }
      aha={
        <AhaKarte sichtbar eyebrow="Und der halbe Beruf ist gar nicht draußen.">
          Vorgefertigt heißt: die Wände entstehen in der Halle, im Trockenen, im Warmen.
          Gerade in den kalten Wintermonaten ist das der Teil dieses Berufs, den kaum
          jemand auf dem Schirm hat.
        </AhaKarte>
      }
      fuss={<StepFuss id="C5" />}
    />
  )
}
