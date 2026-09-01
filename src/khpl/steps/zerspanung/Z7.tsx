import { Check } from 'lucide-react'
import { motion } from 'motion/react'
import { StepFoto } from '@/khpl/buehne/Foto'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import type { StepId } from '@/khpl/flow/steps'
import type { Fortschritt } from '@/khpl/store/fortschritt'
import { useFortschritt } from '@/khpl/store/fortschritt'

/**
 * Z7 — Halb drei, Übergabe. **Rückblick statt Punkte** (Mechanismus 6) —
 * und die Pointe, die nur dieser Tag hat: **die Arbeit endet nicht, wenn du
 * gehst.** Der Dachdecker sieht sein fertiges Dach, der Zimmerer sein
 * versetztes Element; hier läuft die Maschine weiter, und die Spätschicht
 * übernimmt sie mitsamt deiner Korrektur. Feierabend ist bei Frühschicht
 * wörtlich im Hellen: halb drei.
 *
 * Kein Prüfknopf, keine Aufgabe — ein Lese-Screen mit dreifacher
 * Idle-Geduld (`KioskGuard.GEDULD`), wie M8 und die Zäsuren.
 *
 * Der Rückblick zählt auf, was wirklich getan wurde, mit zwei Fassungen je
 * Eintrag (gelöst / gesehen) — keine Note, keine Quote.
 */

interface Tat {
  erledigt: string
  gesehen: string
  geloest: (f: Fortschritt) => boolean
}

/** Reihenfolge = Tagesablauf. Z5 und die Abstecher kommen nicht vor. */
const TATEN: { id: StepId; tat: Tat }[] = [
  {
    id: 'Z1',
    tat: {
      erledigt: 'einsortiert, wie genau verschiedene Teile sein müssen',
      gesehen: 'gesehen, wie genau ein Metallteil sein muss',
      geloest: (f) => !!f.answers.z1?.fertig,
    },
  },
  {
    id: 'Z2',
    tat: {
      erledigt: 'eine CNC-Maschine eingerichtet',
      gesehen: 'zugesehen, wie eine CNC-Maschine eingerichtet wird',
      geloest: (f) => !!f.answers.z2?.gespannt,
    },
  },
  {
    id: 'Z3',
    tat: {
      erledigt: 'ein CNC-Programm gelesen',
      gesehen: 'gesehen, wie die Maschine ihren Weg kennt',
      geloest: (f) => !!f.answers.z3?.gefunden,
    },
  },
  {
    id: 'Z4',
    tat: {
      erledigt: 'das erste Teil gemessen und die Serie freigegeben',
      gesehen: 'das erste Teil gemessen',
      geloest: (f) => !!f.answers.z4?.freigegeben,
    },
  },
  {
    id: 'Z6',
    tat: {
      erledigt: 'dafür gesorgt, dass die Teile gleich bleiben, während die Serie läuft',
      gesehen: 'eine Serie laufen sehen',
      geloest: (f) => !!f.answers.z6?.stabil,
    },
  },
]

function rueckblick(f: Fortschritt): string[] {
  const gesehen = new Set(f.visited)
  return TATEN.filter((t) => gesehen.has(t.id)).map((t) =>
    t.tat.geloest(f) ? t.tat.erledigt : t.tat.gesehen,
  )
}

export function Z7() {
  const fortschritt = useFortschritt()

  return (
    <StepShell
      id="Z7"
      auftrag={null}
      ansage={null}
      interaktionOffen={false}
      buehne={<StepFoto id="Z7" />}
      warum={
        <p>
          Halb drei. Deine Maschine läuft weiter — die Spätschicht übernimmt sie, mit
          deiner Korrektur und deinem Stichprobenplan: wann sie nachmessen muss. Das alles
          passt in zwei Sätze.
        </p>
      }
      interaktion={
        <motion.div
          initial="aus"
          animate="an"
          variants={{ an: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } } }}
          className="flex flex-col gap-4"
        >
          <motion.p
            variants={ZEILE}
            data-testid="z7-uebergabe"
            className="kh-titel-klein text-kh-orange"
          >
            „Läuft sauber. Korrektur ist drin, Stichprobe alle vierzig.“
          </motion.p>

          <motion.div
            variants={ZEILE}
            data-testid="z7-rueckblick"
            className="kh-feld p-4 landscape:p-5"
          >
            <p className="kh-etikett">Du hast heute</p>
            <ul className="mt-3 flex flex-col gap-2">
              {rueckblick(fortschritt).map((zeile) => (
                <motion.li
                  key={zeile}
                  variants={ZEILE}
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
            {/* Der Bogen zum Anfang: das Fadenobjekt dieses Tages ist das
                Teil, das es morgens nur auf Papier gab. */}
            <motion.p
              variants={ZEILE}
              transition={{ duration: 0.8 }}
              className="kh-titel-klein mt-4 border-t border-kh-line pt-4 text-kh-orange"
            >
              Heute früh war das eine Stange Stahl.
            </motion.p>
          </motion.div>
        </motion.div>
      }
      fuss={<StepFuss id="Z7" />}
    />
  )
}

const ZEILE = {
  aus: { opacity: 0, x: -8 },
  an: { opacity: 1, x: 0 },
}
