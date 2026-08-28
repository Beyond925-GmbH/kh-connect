import { useState } from 'react'
import { Check } from 'lucide-react'
import { motion } from 'motion/react'
import { Teilehaufen, type Marke } from '@/khpl/buehne/zerspanung/Teilehaufen'
import { TOLERANZ } from '@/khpl/buehne/zerspanung/kanon'
import { Lage } from '@/khpl/komponenten/Lage'
import { Wechsel } from '@/khpl/komponenten/Wechsel'
import { StepFuss, useStepNavigation } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import type { StepId } from '@/khpl/flow/steps'
import { merkeAntwort, type Fortschritt } from '@/khpl/store/fortschritt'

/**
 * Z6 — Deins ist das erste. **Rückblick statt Punkte**, und seit dem Umbau
 * eine Bühne, die den stärksten Satz des Tages auch trägt.
 *
 * ---
 *
 * **Was hier umgebaut wurde und warum.**
 *
 * Der Screen war der auffälligste Bruch des ganzen Tages (Review 26.08., R13):
 * Der Text lieferte den einzigen echten Weltbezug des Berufs — „Getriebe,
 * Pumpen, Mähdrescher. Irgendwo fährt deins mit.“ — und darunter stand eine
 * Strichzeichnung mit **sechs** leeren Kästchen für vierhundert Teile. Dazu
 * war Z6 der einzige Hauptschritt des Tages ohne jede Handlung: eine Kiste,
 * die sich von selbst füllte, während man zusah.
 *
 * Beides ist jetzt eins:
 *
 *  - **Die Bühne ist ein Foto** eines Haufens fertiger Drehteile
 *    (`buehne/zerspanung/Teilehaufen.tsx`). Die Menge muss nicht mehr
 *    behauptet werden, sie ist zu sehen.
 *  - **Die Handlung ist „such deins“** — und sie geht nicht auf. Wohin man
 *    auch tippt: es könnte deins sein. Nach drei Versuchen löst der Screen
 *    auf, und die Auflösung ist ausgerechnet die Zahl aus Z1: Alle
 *    vierhundert liegen innerhalb von 0,021 mm beieinander. **Man kann sie
 *    nicht unterscheiden, weil sie gut sind.**
 *
 * Das ist die Pointe, die der Tag die ganze Zeit vorbereitet hat, und sie
 * kostet keinen einzigen neuen Fachbegriff. R11 bleibt gewahrt: Es gibt kein
 * Danebenliegen, weil es kein richtiges Teil gibt — das Scheitern ist die
 * Lektion, nicht der Fehler.
 *
 * **Die entschärfte Fassung der Feierabend-Pointe bleibt** (`belege/
 * zerspanung.md` 8): nicht „nachts ohne dich“, sondern *die Maschine macht
 * weiter, wenn du gehst*. Sie steht jetzt im Warum statt in einer Animation.
 *
 * ⚠️ **Ein Firmenname geht nicht ohne Freigabe an den Stand** (§11). Auf dem
 * Screen steht deshalb nur die Gattung — Mähdrescher, Getriebe, Pumpe.
 *
 * **Hallenlicht, kein Abendlicht.** M8 legt über sein fertiges Dach einen
 * warmen Verlauf; hier liegt bewusst keiner. Draußen ist es hell oder dunkel,
 * und in der Halle merkt man es nicht — vier Feierabende, vier verschiedene
 * Lichter (khpl-tage.md §2).
 *
 * **`answers.z6`** `{ tipps }` — die Punkte, damit sie beim Wiederbesuch
 * wieder dort liegen, wo der Besucher hingetippt hat.
 */

// ---------------------------------------------------------------------------
// Text und Takt — gebündelt oben (flow 8.4).
// ---------------------------------------------------------------------------

/**
 * Was neben der Marke steht, in der Reihenfolge der Versuche.
 *
 * **Der Ton wird von Versuch zu Versuch trockener**, nicht lauter — R14, und
 * die Pointe lebt davon, dass der Screen den Besucher nicht auslacht, sondern
 * mit ihm zusammen ratlos ist. Der dritte Satz gibt schon zu, dass die Suche
 * nicht aufgeht; das ist die Brücke zur Auflösung.
 */
const VERSUCHE = ['Könnte deins sein.', 'Das auch.', 'Und das.'] as const

/** Mehr Versuche braucht niemand, um zu merken, dass sie alle gleich aussehen. */
const GENUG = VERSUCHE.length

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
      erledigt: 'eine Passung in der Hand gehabt',
      gesehen: 'gesehen, wie genau ein Teil sein muss',
      geloest: (f) => !!f.answers.z1?.aufgeloest,
    },
  },
  {
    id: 'Z2',
    tat: {
      erledigt: 'einen Nullpunkt gesetzt',
      gesehen: 'gesehen, was vor dem ersten Span passiert',
      geloest: (f) => !!f.answers.z2?.fertig,
    },
  },
  {
    id: 'Z3',
    tat: {
      erledigt: 'ein CNC-Programm geschrieben',
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

const mm = (n: number) => n.toFixed(3).replace('.', ',')

export function Z6() {
  const { fortschritt } = useStepNavigation('Z6')
  const liste = rueckblick(fortschritt)

  const [tipps, setTipps] = useState<{ x: number; y: number }[]>(
    () => fortschritt.answers.z6?.tipps ?? [],
  )
  const fertig = tipps.length >= GENUG

  const tippen = (x: number, y: number) => {
    const neu = [...tipps, { x, y }].slice(0, GENUG)
    setTipps(neu)
    merkeAntwort('z6', { tipps: neu })
  }

  /*
    **Am Ende wird keine Marke zu „deins“.** Die erste Fassung setzte auf den
    letzten Tipp einen limetten Ring mit „Nr. 1 — deins“, und das war gleich
    zweimal falsch: Es widerspricht der Pointe (wenn eins davon deins wäre,
    hätte die Suche ja doch ein Ziel gehabt), und der Ring lag auf der Stele
    regelmäßig hinter dem gewachsenen Panel — die Konsole deckt nach dem
    Auflösen rund die Hälfte der Fläche, die vorher antippbar war (R2).

    Beides löst dieselbe Änderung: Nach dem Auflösen bleiben die drei Ringe
    liegen, wo getippt wurde, und verlieren ihre Beschriftung. Der Satz steht
    im Panel, wo er nie verdeckt wird. Was hinter die Karte rutscht, ist dann
    nur noch Dekor.
  */
  const marken: Marke[] = tipps.map((p, i) => ({
    x: p.x,
    y: p.y,
    text: fertig ? undefined : VERSUCHE[i],
  }))

  return (
    <StepShell
      id="Z6"
      auftrag={fertig ? null : 'Such dein Teil im Haufen.'}
      // Antippen erklärt sich selbst (`komponenten/gesten.ts`).
      ansage={null}
      interaktionOffen={!fertig}
      buehne={<Teilehaufen marken={marken} onTippen={fertig ? undefined : tippen} />}
      warum={
        <p>
          Feierabend. Die Kiste steht neben der Maschine, und irgendwo darin liegt deins —
          das erste von vierhundert. Die Maschine macht weiter, wenn du gehst.
        </p>
      }
      interaktion={
        <Wechsel takt={fertig ? 'aufgeloest' : 'suchen'}>
          {fertig ? (
            <Auswertung liste={liste} />
          ) : (
            /*
              Der Feierabend-Rahmen steht hier und nicht nur im `warum` — das
              rendert auf Übungs-Steps nicht (`komponenten/Lage.tsx`), und
              ohne ihn ist die Kiste nur ein Suchbild statt das Ende einer
              Schicht.
            */
            <Lage>
              Feierabend. Die Kiste steht neben der Maschine — vierhundert Stück, eins
              davon hast du gemacht. Die Maschine macht weiter, wenn du gehst.
            </Lage>
          )}
        </Wechsel>
      }
      fuss={
        <StepFuss
          id="Z6"
          uebungOffen={!fertig}
          geschafft={fertig ? 'Haufen durchgesehen' : null}
        />
      }
    />
  )
}

/**
 * Die Auflösung — **erst die Pointe, dann der Rückblick.**
 *
 * Die Reihenfolge ist nicht beliebig. Wer gerade dreimal danebengetippt hat,
 * bekommt zuerst den Grund dafür; die Liste dessen, was er heute getan hat,
 * liest sich danach als Bilanz und nicht als Trostpreis.
 */
function Auswertung({ liste }: { liste: string[] }) {
  return (
    <motion.div
      initial="aus"
      animate="an"
      variants={{ an: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } } }}
      className="flex flex-col gap-4"
    >
      <motion.div
        variants={{ aus: { opacity: 0, y: 6 }, an: { opacity: 1, y: 0 } }}
        data-testid="z6-pointe"
        className="kh-feld p-4 landscape:p-5"
      >
        <p className="kh-etikett">Du findest es nicht</p>
        <p className="mt-2 text-[1.0625rem] leading-[1.45] text-kh-paper/85">
          Alle vierhundert liegen innerhalb von {mm(TOLERANZ)} Millimetern beieinander.
          Mit bloßem Auge ist das kein Unterschied.{' '}
          <span className="text-kh-paper">
            Du erkennst deins nicht wieder, weil es gut ist.
          </span>
        </p>
      </motion.div>

      <motion.div
        variants={{ aus: { opacity: 0, y: 6 }, an: { opacity: 1, y: 0 } }}
        data-testid="z6-rueckblick"
        className="kh-feld p-4 landscape:p-5"
      >
        <p className="kh-etikett">Du hast heute</p>
        <ul className="mt-3 flex flex-col gap-2">
          {liste.map((zeile) => (
            <li
              key={zeile}
              className="flex items-start gap-2.5 text-[1.125rem] leading-snug text-kh-paper"
            >
              <span
                aria-hidden
                className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-kh-signal text-[#0E0D0B]"
              >
                <Check className="size-3.5" strokeWidth={3.5} />
              </span>
              {zeile}
            </li>
          ))}
        </ul>
        {/*
          Der Screen endet nicht bei „Nr. 1 von 400“, sondern bei dem, was die
          Befragten selbst antworten, wenn man sie fragt, wofür ihre Arbeit gut
          ist: „Zum Beispiel für verschiedene Getriebe oder Mähdrescher, alle
          verschiedenen Pumpen. Das macht schon Sinn.“ INTERVIEW —
          Zerspanungsmechaniker Ausbildung, 30.06.2026. Ohne Firmennamen; die
          Gattung geht immer.
        */}
        <p
          data-testid="z6-schluss"
          className="kh-titel-klein mt-4 border-t border-kh-line pt-4 text-kh-orange"
        >
          Getriebe, Pumpen, Mähdrescher. Irgendwo fährt deins mit.
        </p>
      </motion.div>
    </motion.div>
  )
}
