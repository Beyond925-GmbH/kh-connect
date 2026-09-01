import { Suspense, lazy } from 'react'
import { Check } from 'lucide-react'
import { motion } from 'motion/react'
import { Dachstuhl3DFallback } from '@/khpl/buehne/Dachstuhl3DFallback'
import { StepFuss, useStepNavigation } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import type { StepId } from '@/khpl/flow/steps'
import type { Fortschritt } from '@/khpl/store/fortschritt'

/**
 * M8 — Feierabend.
 *
 * **Rückblick statt Punkte:** keine Note, kein Score, keine
 * Prozentangabe, sondern eine Aufzählung dessen, was der Besucher tatsächlich
 * getan hat — inklusive der besuchten Abstecher. Wer durchgeklickt hat, bekommt
 * eine kürzere Liste, aber nie eine Bewertung.
 *
 * Deshalb hat jeder Eintrag zwei Fassungen. Wer die Übung gelöst hat, liest
 * „einen Balken zugeschnitten“; wer weitergegangen ist, „an einem Balken Maß
 * genommen“. Beides ist wahr, keins ist ein Tadel. Am Messestand steht
 * vielleicht jemand daneben — sich vor Publikum dumm zu fühlen ist das
 * Gegenteil vom Ziel.
 *
 * Visual: das fertige Dach im Abendlicht — und zwar **das Dach, das der
 * Besucher in M7 selbst aufgerichtet hat**, nicht ein Foto von irgendeinem.
 * Für den Feierabend gibt es im Bestand ohnehin gar kein Motiv; das Modell
 * ist hier nicht Ersatz,
 * sondern die stärkere Antwort. Der Bogen zum Anfang schließt sich: heute
 * Morgen war da nur ein Grundriss.
 */

const Dachstuhl3D = lazy(() => import('@/khpl/buehne/Dachstuhl3D'))

interface Tat {
  /** Wenn die Übung dieses Steps gelöst wurde. */
  erledigt: string
  /** Wenn der Step gesehen, aber nicht gelöst wurde. */
  gesehen: string
  /** Ob die Übung als gelöst gilt. Ohne Übung: immer `true`. */
  geloest: (f: Fortschritt) => boolean
}

/**
 * Reihenfolge = Tagesablauf. Die Formulierungen sind sprachlich vereinfacht
 * („kalkuliert“ → „durchgerechnet“): „ein Dach aufgemessen · ein
 * Angebot durchgerechnet · Material bestellt · einen Plan in 3D gelesen ·
 * einen Balken zugeschnitten · einen Transporter beladen · einen Dachstuhl
 * aufgerichtet“.
 */
const TATEN: { id: StepId; tat: Tat }[] = [
  {
    id: 'M1',
    tat: {
      erledigt: 'ein Dach aufgemessen',
      gesehen: 'einen Ortstermin mitgemacht',
      geloest: (f) => !!f.answers.m1?.ausgewertet,
    },
  },
  {
    id: 'M2',
    tat: {
      erledigt: 'ein Angebot durchgerechnet',
      gesehen: 'gesehen, was ein Dachstuhl kostet',
      geloest: (f) => !!f.answers.m2?.aufgeloest,
    },
  },
  {
    id: 'B3.1',
    tat: {
      erledigt: 'Material bestellt',
      gesehen: 'Material bestellt',
      geloest: () => true,
    },
  },
  {
    id: 'B3.2',
    tat: {
      erledigt: 'einen Plan in 3D gelesen',
      gesehen: 'einen Dachstuhl in 3D gedreht',
      geloest: (f) => (f.answers.b32?.angetippt.length ?? 0) > 0,
    },
  },
  {
    id: 'M4',
    tat: {
      erledigt: 'einen Balken zugeschnitten',
      gesehen: 'an einem Balken Maß genommen',
      geloest: (f) => !!f.answers.m4?.getroffen,
    },
  },
  {
    id: 'B4.1',
    tat: {
      erledigt: 'einen Transporter beladen',
      gesehen: 'einen Transporter gepackt',
      geloest: (f) => !!f.answers.b41?.fertig,
    },
  },
  {
    id: 'B5.1',
    tat: {
      erledigt: 'gesehen, warum auf dem Dach keiner allein arbeitet',
      gesehen: 'gesehen, warum auf dem Dach keiner allein arbeitet',
      geloest: () => true,
    },
  },
  {
    id: 'M7',
    tat: {
      erledigt: 'einen Dachstuhl aufgerichtet',
      gesehen: 'beim Aufrichten zugeschaut',
      geloest: (f) => !!f.answers.m7?.fertig,
    },
  },
]

function rueckblick(f: Fortschritt): string[] {
  const gesehen = new Set(f.visited)
  return TATEN.filter((t) => gesehen.has(t.id)).map((t) =>
    t.tat.geloest(f) ? t.tat.erledigt : t.tat.gesehen,
  )
}

export function M8() {
  const { fortschritt } = useStepNavigation('M8')
  const liste = rueckblick(fortschritt)

  return (
    <StepShell
      id="M8"
      // Rückblick. Man liest, was man getan hat.
      auftrag={null}
      ansage={null}
      buehneInteraktiv
      interaktionOffen={false}
      buehne={
        <div className="relative size-full">
          <Suspense fallback={<Dachstuhl3DFallback />}>
            {/* Der leere Anhänger gehört zum Feierabend: alles, was heute
                Morgen auf ihm lag, ist verbaut. Und dein Sparren trägt sein
                Band weiterhin — an der äußersten Achse, im lattenfreien
                Traufstreifen, also auch am fertig gelatteten Dach sichtbar. */}
            <Dachstuhl3D zielT={1} attraktor kulisse deinSparren />
          </Suspense>
          {/* Abendlicht als Lage darüber statt als zweite Lichtstimmung in der
              Szene: die Szene kennt nur hell und dunkel, und „dunkel“ ist ein
              blaugrauer Nachthimmel, kein warmer Feierabend. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#C2571E]/35 to-[#2E3A55]/20 mix-blend-multiply"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-[#FFB25A]/25 to-transparent"
          />
        </div>
      }
      interaktion={
        <motion.div
          initial="aus"
          animate="an"
          variants={{ an: { transition: { staggerChildren: 0.12, delayChildren: 0.4 } } }}
          data-testid="m8-rueckblick"
          className="kh-feld p-4 landscape:p-5"
        >
          <p className="kh-etikett">Du hast heute</p>
          <ul className="mt-3 flex flex-col gap-2">
            {liste.map((zeile) => (
              <motion.li
                key={zeile}
                variants={{ aus: { opacity: 0, x: -8 }, an: { opacity: 1, x: 0 } }}
                className="flex items-start gap-2.5 text-[1.125rem] leading-snug text-kh-paper"
              >
                <span
                  aria-hidden
                  className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-kh-signal text-[#0E0D0B]"
                >
                  <Check className="size-3.5" strokeWidth={3.5} />
                </span>
                {zeile}
              </motion.li>
            ))}
          </ul>
          <motion.p
            variants={{ aus: { opacity: 0 }, an: { opacity: 1 } }}
            transition={{ duration: 0.8 }}
            className="kh-titel-klein mt-4 border-t border-kh-line pt-4 text-kh-orange"
          >
            Heute Morgen war da nur ein Grundriss.
          </motion.p>
        </motion.div>
      }
      fuss={<StepFuss id="M8" />}
    />
  )
}
