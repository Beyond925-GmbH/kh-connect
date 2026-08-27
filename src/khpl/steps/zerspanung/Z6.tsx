import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import { motion } from 'motion/react'
import { Werkstueck } from '@/khpl/buehne/zerspanung/Werkstueck'
import { StepFuss, useStepNavigation } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import type { StepId } from '@/khpl/flow/steps'
import type { Fortschritt } from '@/khpl/store/fortschritt'

/**
 * Z6 — Deins ist das erste. **Rückblick statt Punkte.**
 *
 * Keine Note, kein Score, keine Prozentangabe, sondern eine Aufzählung dessen,
 * was der Besucher tatsächlich getan hat. Jeder Eintrag hat **zwei Fassungen**
 * — gelöst und nur gesehen. Beides ist wahr, keines ist ein Tadel: am
 * Messestand steht vielleicht jemand daneben, und sich vor Publikum dumm zu
 * fühlen ist das Gegenteil vom Ziel (flow 6.6).
 *
 * Die vier Einträge stehen `VALIDIERT` in khpl-tag-zerspanung.md §6 Z6 und
 * werden hier wörtlich übernommen.
 *
 * **Die Pointe steht gegen die des Dachdeckers.** Dort schneidet der Besucher
 * einen von rund 110 Sparren, und die Auflösung heißt *niemand macht das
 * allein*. Hier macht er das erste von 400, und den Rest macht die Maschine.
 *
 * ⚠️ **„Nachts ohne dich“ ist entschärft** (`belege/zerspanung.md` 8):
 * mannlose Fertigung ist belegt, aber nicht der Regelfall in jedem Betrieb.
 * Tragfähig — und immer noch stark — ist: **die Maschine macht weiter, wenn du
 * gehst.** Genau deshalb füllt sich die Kiste, während man hinsieht, statt
 * dass ein Satz es behauptet.
 *
 * ⚠️ **Ein Firmenname geht nicht ohne Freigabe an den Stand** (§11). Auf dem
 * Screen steht deshalb nur die Gattung — Mähdrescher, Getriebe, Pumpe —, und
 * genau dort endet er: nicht bei „Nr. 1 von 400“, sondern bei *wo dein Teil
 * hinfährt*. Für ein Publikum in Paderborn-Lippe ist ein Mähdrescher nichts
 * Abstraktes, sondern etwas, das auf dem Feld neben der Schule fährt.
 *
 * **Hallenlicht, kein Abendlicht.** M8 legt über sein fertiges Dach einen
 * warmen Verlauf; hier liegt bewusst keiner. Draußen ist es hell oder dunkel,
 * und in der Halle merkt man es nicht — vier Feierabende, vier verschiedene
 * Lichter (khpl-tage.md §2).
 *
 * ⚠️ **Medienlücke.** Für die Sichtkiste gibt es **kein Motiv im Bestand**
 * (§10). Sie ist die wichtigere der beiden Lücken dieses Tages, weil sie die
 * Pointe trägt; bis dahin zeichnet `buehne/zerspanung/` sie.
 */

// ---------------------------------------------------------------------------
// Text und Takt — gebündelt oben (flow 8.4).
// ---------------------------------------------------------------------------

interface Tat {
  /** Wenn die Übung dieses Steps gelöst wurde. */
  erledigt: string
  /** Wenn der Step gesehen, aber nicht gelöst wurde. */
  gesehen: string
  geloest: (f: Fortschritt) => boolean
}

/**
 * Reihenfolge = Tagesablauf. Vier Einträge, nicht sechs: die Abstecher Z1.1
 * und Z2.1 stehen bewusst nicht darin — die Tabelle in §6 Z6 ist abgenommen,
 * und eine Liste, die jeden Screen quittiert, ist eine Quittung und kein
 * Rückblick.
 */
const TATEN: { id: StepId; tat: Tat }[] = [
  {
    id: 'Z1',
    tat: {
      erledigt: 'eine Toleranz gelesen',
      gesehen: 'gesehen, wie genau ein Teil sein muss',
      geloest: (f) => !!f.answers.z1?.aufgeloest,
    },
  },
  {
    id: 'Z2',
    tat: {
      erledigt: 'eine Maschine gerüstet',
      gesehen: 'gesehen, was vor dem ersten Span passiert',
      geloest: (f) => !!f.answers.z2?.fertig,
    },
  },
  {
    id: 'Z3',
    tat: {
      erledigt: 'einen Programmfehler gefunden',
      gesehen: 'ein CNC-Programm gelesen',
      geloest: (f) => !!f.answers.z3?.gefunden,
    },
  },
  {
    id: 'Z5',
    tat: {
      erledigt: 'ein Teil gemessen und beurteilt',
      gesehen: 'gesehen, wie ein Teil gemessen wird',
      // „Beurteilt“ heißt beurteilt — ob das Urteil stimmte, steht hier
      // ausdrücklich nicht zur Debatte. Der Rückblick bewertet nicht.
      geloest: (f) => !!f.answers.z5?.urteil,
    },
  },
]

function rueckblick(f: Fortschritt): string[] {
  const gesehen = new Set(f.visited)
  return TATEN.filter((t) => gesehen.has(t.id)).map((t) =>
    t.tat.geloest(f) ? t.tat.erledigt : t.tat.gesehen,
  )
}

/**
 * Wie voll die Kiste steht, wenn der Screen aufgeht.
 *
 * **Knapp halb voll, nicht fast leer.** Die erste Fassung fing mit zwei Teilen
 * an und legte alle paar Sekunden eines nach; auf dem Screen stand damit eine
 * fast leere Kiste, und die Pointe des Tages — *das erste von vierhundert, die
 * Maschine macht weiter, wenn du gehst* — hatte kein Bild. Der Zählstand ist
 * hier ohnehin nicht die Aussage: eine Schicht liegt hinter dem Besucher, und
 * was zählt, ist, dass es **weitergeht**, während er hinsieht.
 */
const KISTE_START = 0.45
/** Sekunden je weiterem Teil. Schnell genug, dass man es beim Lesen merkt. */
const TAKT = 1.6
/** Weiter füllt sie sich auf diesem Screen nicht. */
const KISTE_MAX = 0.95
/**
 * Ein Platz je Takt. Die Kiste hat drei mal vier davon (`buehne/Kiste.tsx`) —
 * ein kleinerer Schritt ließe zwei von drei Takten ohne sichtbares Teil
 * verstreichen, und das Füllen wäre wieder ein Zählstand.
 */
const SCHRITT = 1 / 12

export function Z6() {
  const { fortschritt } = useStepNavigation('Z6')
  const liste = rueckblick(fortschritt)

  /**
   * Die Kiste füllt sich, während man hinsieht. Das ist die entschärfte und
   * immer noch starke Fassung der Pointe: **die Maschine macht weiter, wenn du
   * gehst** — gezeigt statt behauptet.
   */
  const [fuellstand, setFuellstand] = useState(KISTE_START)
  useEffect(() => {
    const uhr = setInterval(
      () => setFuellstand((f) => Math.min(KISTE_MAX, f + SCHRITT)),
      TAKT * 1000,
    )
    return () => clearInterval(uhr)
  }, [])

  return (
    <StepShell
      id="Z6"
      auftrag={null}
      ansage={null}
      interaktionOffen={false}
      buehne={<Werkstueck zustand="kiste" fuellstand={fuellstand} />}
      warum={
        <p>
          Feierabend. Die Kiste steht neben der Maschine, und ganz vorn liegt deins — das
          erste von vierhundert. Die Maschine macht weiter, wenn du gehst.
        </p>
      }
      interaktion={
        <motion.div
          initial="aus"
          animate="an"
          variants={{ an: { transition: { staggerChildren: 0.12, delayChildren: 0.4 } } }}
          data-testid="z6-rueckblick"
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
          {/*
            Der Screen endet nicht bei „Nr. 1 von 400“, sondern bei dem, was
            die Befragten selbst antworten, wenn man sie fragt, wofür ihre
            Arbeit gut ist: „Zum Beispiel für verschiedene Getriebe oder
            Mähdrescher, alle verschiedenen Pumpen. Das macht schon Sinn.“
            INTERVIEW — Zerspanungsmechaniker Ausbildung, 30.06.2026. Ohne
            Firmennamen; die Gattung geht immer.
          */}
          <motion.p
            variants={{ aus: { opacity: 0 }, an: { opacity: 1 } }}
            transition={{ duration: 0.8 }}
            data-testid="z6-schluss"
            className="kh-titel-klein mt-4 border-t border-kh-line pt-4 text-kh-orange"
          >
            Getriebe, Pumpen, Mähdrescher. Irgendwo fährt deins mit.
          </motion.p>
        </motion.div>
      }
      fuss={<StepFuss id="Z6" />}
    />
  )
}
