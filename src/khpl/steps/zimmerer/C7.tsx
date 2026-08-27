import { Suspense, lazy } from 'react'
import { Check } from 'lucide-react'
import { motion } from 'motion/react'
import { Dachstuhl3DFallback } from '@/khpl/buehne/Dachstuhl3DFallback'
import type { StepId } from '@/khpl/flow/steps'
import { StepFuss, useStepNavigation } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import type { Fortschritt } from '@/khpl/store/fortschritt'

/**
 * C7 — Heute früh war da eine Betonplatte. **Rückblick statt Punkte**
 * (khpl-tag-zimmerer.md 6, C7; khpl-tage.md 1, Mechanismus 6).
 *
 * Kein Score, kein Prozentwert, keine Note — die Aufzählung dessen, was der
 * Besucher getan hat, mit **zwei Fassungen je Eintrag**. Wer die Übung gelöst
 * hat, liest „ein Fenster eingeschnitten“; wer weitergegangen ist, „an einem
 * Element Maß genommen“. Beides ist wahr, keines ist ein Tadel. Am Messestand
 * steht vielleicht jemand daneben, und sich vor Publikum dumm zu fühlen ist das
 * Gegenteil des Ziels.
 *
 * **Die fünf Einträge stehen so in der Spec und werden nicht ergänzt.** M8
 * führt beim Dachdecker auch besuchte Abstecher auf; die Tabelle in
 * khpl-tag-zimmerer.md 6 ist `VALIDIERT` und nennt C1, C2, C3, C4 und C6.
 * Zeilen dazuzuerfinden wäre eine Gestaltungsentscheidung an einer Stelle, die
 * abgenommen ist.
 *
 * **Bühne.** Das fertige Haus im Nachmittagslicht — und zwar **das Element, das
 * der Besucher gebaut hat**, als Westwand darin, mit seinem Fenster
 * (`deinElement`). Derselbe Kameraort wie C6, aber die Baustelle ist ein Haus:
 * der Bogen schließt sich.
 *
 * **Nicht abends.** Der Dachdecker endet im Abendlicht und legt dafür in M8
 * eigens zwei Verläufe über die Szene. Hier passiert das ausdrücklich **nicht**:
 * der Zustand `haus` bringt sein Nachmittagslicht selbst mit
 * (khpl-tag-zimmerer.md 7), dieser Tag endet um vier, weil vorgefertigt gebaut
 * wird, damit ein Haus an einem Tag dicht ist. Zwei Feierabende dürfen nicht
 * dasselbe Licht haben.
 */

const Wandelement3D = lazy(() => import('@/khpl/buehne/zimmerer/Wandelement3D'))

interface Tat {
  /** Wenn die Übung dieses Steps gelöst wurde. */
  erledigt: string
  /** Wenn der Step gesehen, aber nicht gelöst wurde. */
  gesehen: string
  /** Ob die Übung als gelöst gilt. Ohne Übung: immer `true`. */
  geloest: (f: Fortschritt) => boolean
}

/** Reihenfolge = Tagesablauf. Formulierungen wörtlich aus der Spec-Tabelle. */
const TATEN: { id: StepId; tat: Tat }[] = [
  {
    id: 'C1',
    tat: {
      erledigt: 'dein Holz aus dem Stapel gesucht',
      gesehen: 'nach Stückliste gearbeitet',
      geloest: (f) => !!f.answers.c1?.gefunden,
    },
  },
  {
    id: 'C2',
    tat: {
      erledigt: 'ein Ständerwerk ins Raster gesetzt',
      gesehen: 'gesehen, woher das Raster kommt',
      geloest: (f) => !!f.answers.c2?.aufgeloest,
    },
  },
  {
    id: 'C3',
    tat: {
      erledigt: 'eine Wand richtig aufgebaut',
      gesehen: 'gesehen, woraus eine Wand besteht',
      geloest: (f) => !!f.answers.c3?.fertig,
    },
  },
  {
    id: 'C4',
    tat: {
      erledigt: 'ein Fenster eingeschnitten',
      gesehen: 'an einem Element Maß genommen',
      geloest: (f) => !!f.answers.c4?.getroffen,
    },
  },
  {
    id: 'C6',
    tat: {
      erledigt: 'ein Wandelement versetzt',
      gesehen: 'beim Versetzen zugesehen',
      geloest: (f) => !!f.answers.c6?.versetzt,
    },
  },
]

function rueckblick(f: Fortschritt): string[] {
  const gesehen = new Set(f.visited)
  return TATEN.filter((t) => gesehen.has(t.id)).map((t) =>
    t.tat.geloest(f) ? t.tat.erledigt : t.tat.gesehen,
  )
}

export function C7() {
  const { fortschritt } = useStepNavigation('C7')
  const liste = rueckblick(fortschritt)

  return (
    <StepShell
      id="C7"
      auftrag={null}
      ansage={null}
      buehneInteraktiv
      interaktionOffen={false}
      buehne={
        <Suspense fallback={<Dachstuhl3DFallback text="Das Haus steht" />}>
          {/*
            Der Ausschnitt aus C4: „In C7 ist die Wand mit dem Fenster
            identifizierbar“ (khpl-tag-zimmerer.md 2) — mit einem fremden
            Fenster wäre sie das nicht.
          */}
          <Wandelement3D
            zustand="haus"
            deinElement
            ausschnitt={fortschritt.answers.c4?.ausschnitt}
          />
        </Suspense>
      }
      warum={
        <p>
          Vier Uhr. Vorgefertigt wird gebaut, damit ein Haus an einem Tag dicht ist — und
          heute ist es das.
        </p>
      }
      interaktion={
        <motion.div
          initial="aus"
          animate="an"
          variants={{ an: { transition: { staggerChildren: 0.12, delayChildren: 0.4 } } }}
          data-testid="c7-rueckblick"
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
          {/* Der Bogen schließt sich nicht mit einer Bilanz, sondern mit einem
              Zeigefinger auf die Bühne: dort steht die Wand, und sie ist
              wiederzuerkennen. Den Satz, der diesem Screen den Titel gibt,
              trägt die Überschrift auf dem Bild — er gehört nicht zweimal auf
              denselben Screen. */}
          <motion.p
            variants={{ aus: { opacity: 0 }, an: { opacity: 1 } }}
            transition={{ duration: 0.8 }}
            className="kh-titel-klein mt-4 border-t border-kh-line pt-4 text-kh-orange"
          >
            Die Wand mit dem Fenster ist deine.
          </motion.p>
        </motion.div>
      }
      fuss={<StepFuss id="C7" />}
    />
  )
}
