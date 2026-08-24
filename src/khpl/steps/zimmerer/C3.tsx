import { Suspense, lazy, useState } from 'react'
import { motion } from 'motion/react'
import { Dachstuhl3DFallback } from '@/khpl/buehne/Dachstuhl3DFallback'
import { AhaKarte } from '@/khpl/komponenten/AhaKarte'
import { Wechsel } from '@/khpl/komponenten/Wechsel'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { merkeAntwort, useFortschritt } from '@/khpl/store/fortschritt'
import { Begriff } from './Begriff'

/**
 * C3 — Eine Wand ist ein Sandwich. **Die geführte Hälfte des Lernpaars**
 * (khpl-tag-zimmerer.md 6, C3).
 *
 * Fünf Schichten, eine Karte je Schicht, in fester Reihenfolge, mit je einem
 * Satz. Ein Tap, die Schicht legt sich auf. **Man kann nichts falsch machen** —
 * genau wie M5 beim Dachdecker, und aus demselben Grund: erst mitmachen, dann
 * können.
 *
 * **Hier wird nichts abgefragt.** Die Abfrage kommt in C6, nach der Zäsur, und
 * in anderer Form — nicht „in welcher Reihenfolge“, sondern „welche Seite kommt
 * nach außen“. Das ist das Lernpaar dieses Tages.
 *
 * **Die Karte trägt einen Querschnitt, nicht nur einen Namen.** „Dampfbremse“
 * ist für jemanden mit fünfzehn kein Wort, sondern ein Rätsel; die kleine
 * Zeichnung beantwortet *wo sitzt das*, bevor der Name gelesen ist. Dieselbe
 * Begründung wie bei `DachSchema` in M5 — nur ist die Achse hier der Aufbau
 * und nicht die Zeit (khpl-tage.md 4).
 *
 * Schichtenfolge und Prinzip `BELEGT` (`belege/zimmerer.md` 2, WBA Weimar;
 * Prinzip nach DIN 4108-3).
 *
 * ⚠️ **Vorbehalt, und er steht auf dem Screen:** Es gibt Bauweisen ohne
 * separate Dampfbremsfolie — dann übernimmt die OSB-Beplankung die Funktion —
 * und feuchtevariable Bahnen. Der Screen zeigt den Regelfall und sagt nicht
 * „immer“.
 *
 * `answers.c3` `{ gelegt: string[]; fertig: boolean }`
 */

const Wandelement3D = lazy(() => import('@/khpl/buehne/zimmerer/Wandelement3D'))

// ---------------------------------------------------------------------------
// Text — gebündelt oben (flow 8.4).
// ---------------------------------------------------------------------------

interface Schicht {
  id: string
  name: string
  /** Der eine Satz auf der Karte. */
  was: string
  /**
   * Relative Dicke im Querschnitt-Schema. Schematisch, **kein Maß** — die
   * Zeichnung soll zeigen, dass eine Dämmebene dick und eine Folie dünn ist,
   * nicht wie dick genau.
   */
  dicke: number
}

/**
 * Von innen nach außen. Die belegte Schichtenfolge nennt sechs Ebenen; die
 * Installationsebene steht hier im Satz der Innenbeplankung statt auf einer
 * eigenen Karte — fünf Karten sind die Übung, sechs wären eine Liste.
 */
const SCHICHTEN: Schicht[] = [
  {
    id: 'innen',
    name: 'Innenbeplankung',
    was: 'Die Platte, die im fertigen Zimmer die Wand ist. Davor liegt meist noch eine Installationsebene für Kabel und Dosen — damit später niemand durch die Dichtung bohrt.',
    dicke: 2,
  },
  {
    id: 'dampfbremse',
    name: 'Dampfbremse',
    was: 'Auf die warme Innenseite, direkt vor die Dämmung. Sie hält die Luftfeuchte aus dem Zimmer aus der Wand heraus.',
    dicke: 1,
  },
  {
    id: 'daemmung',
    name: 'Ständerwerk mit Dämmung',
    was: 'Das tragende Skelett — und zwischen den Ständern, im Gefach, die Dämmung. Hier steckt die Wärme des Hauses drin.',
    dicke: 7,
  },
  {
    id: 'holzfaser',
    name: 'Holzfaserplatte',
    was: 'Außen, und diffusionsoffen. Was doch an Feuchte in die Wand gerät, muss hier wieder heraus können.',
    dicke: 3,
  },
  {
    id: 'fassade',
    name: 'Fassade',
    was: 'Was man von der Straße sieht: Putz, Lattung, Schalung. Das entscheidet der Bauherr — die vier Schichten davor entscheidet die Bauphysik.',
    dicke: 2,
  },
]

export function C3() {
  const gespeichert = useFortschritt().answers.c3
  const [gelegt, setGelegt] = useState<string[]>(() => gespeichert?.gelegt ?? [])

  // `fertig` als Alias der Undefined-Prüfung, nicht als Längenvergleich: nur so
  // verengt TypeScript `dran` im Else-Zweig auf `Schicht` (aliased discriminant).
  const dran: Schicht | undefined = SCHICHTEN[gelegt.length]
  const danach: Schicht | undefined = SCHICHTEN[gelegt.length + 1]
  const fertig = dran === undefined

  const legen = () => {
    if (!dran) return
    const neu = [...gelegt, dran.id]
    setGelegt(neu)
    merkeAntwort('c3', { gelegt: neu, fertig: neu.length >= SCHICHTEN.length })
  }

  return (
    <StepShell
      id="C3"
      buehneInteraktiv
      interaktionOffen={!fertig}
      buehne={
        <Suspense fallback={<Dachstuhl3DFallback text="Das Element liegt bereit" />}>
          <Wandelement3D zustand="schichten" schichten={gelegt.length} />
        </Suspense>
      }
      fachtext={
        fertig ? undefined : (
          <p>
            Der Aufbau von innen nach außen: <Begriff id="beplankung">Beplankung</Begriff>
            , <Begriff id="dampfbremse">Dampfbremse</Begriff>, Ständer mit Dämmung,{' '}
            <Begriff id="holzfaserplatte">Holzfaserplatte</Begriff>, Fassade. Die
            Reihenfolge entscheidet, ob das Haus trocken bleibt.
          </p>
        )
      }
      interaktion={
        <Wechsel takt={fertig ? 'steht' : dran.id}>
          {fertig ? (
            <Prinzip />
          ) : (
            <div className="flex flex-col items-start gap-2">
              <Schichtkarte
                schicht={dran}
                nummer={gelegt.length + 1}
                gesamt={SCHICHTEN.length}
                gelegt={gelegt.length}
                onLegen={legen}
              />
              {danach && (
                <p
                  data-testid="c3-danach"
                  className="pl-1 text-[0.9375rem] text-kh-paper/45"
                >
                  Danach: {danach.name}
                </p>
              )}
            </div>
          )}
        </Wechsel>
      }
      aha={
        <AhaKarte sichtbar={fertig} eyebrow="Ist die Dampfbremse eine Folie gegen Regen?">
          Nein. Sie hält Luftfeuchte aus dem Zimmer aus der Dämmung heraus. Von außen muss
          die Wand offen sein, sonst trocknet sie nie wieder.
        </AhaKarte>
      }
      fuss={
        <StepFuss
          id="C3"
          uebungOffen={!fertig}
          geschafft={fertig ? 'Wand aufgebaut' : null}
        />
      }
    />
  )
}

/**
 * Die Karte für die nächste Schicht — die ganze Übung von C3. Sie ist **selbst
 * der Knopf**: ein Kasten mit Zeichnung und Text und daneben ein
 * „Auflegen“-Button hätte zwei Ziele für eine Handlung.
 */
function Schichtkarte({
  schicht,
  nummer,
  gesamt,
  gelegt,
  onLegen,
}: {
  schicht: Schicht
  nummer: number
  gesamt: number
  gelegt: number
  onLegen: () => void
}) {
  return (
    <motion.button
      type="button"
      onClick={onLegen}
      data-testid="c3-legen"
      whileTap={{ scale: 0.975 }}
      className="flex w-full items-center gap-3.5 rounded-kh border-2 border-kh-orange/50 bg-kh-orange/10 p-3 text-left"
    >
      <span className="grid size-[76px] shrink-0 place-items-center rounded-kh bg-black/35 p-2 sm:size-[86px]">
        <Wandschnitt bis={gelegt} hervor={nummer - 1} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="kh-etikett block text-kh-paper/45">
          Schicht {nummer} von {gesamt} · Tippen zum Auflegen
        </span>
        <span className="kh-titel-klein mt-0.5 block text-kh-orange">{schicht.name}</span>
        <span className="mt-1 block text-[1rem] leading-snug text-kh-paper/80">
          {schicht.was}
        </span>
      </span>
    </motion.button>
  )
}

/**
 * Der Querschnitt als Schema: innen links, außen rechts. Was schon liegt, ist
 * gefüllt; was gerade drankommt, leuchtet; was noch fehlt, ist ein Umriss.
 *
 * Die Breiten sind schematisch (`Schicht.dicke`) und tragen bewusst keine
 * Beschriftung — die Zeichnung beantwortet *wo sitzt das*, die Zahlen dazu
 * hat niemand belegt.
 */
function Wandschnitt({ bis, hervor }: { bis: number; hervor: number }) {
  const LUFT = 0.7
  const gesamt =
    SCHICHTEN.reduce((s, x) => s + x.dicke, 0) + LUFT * (SCHICHTEN.length - 1)
  let x = 0

  return (
    <svg
      viewBox={`0 0 ${gesamt} 12`}
      className="size-full"
      preserveAspectRatio="none"
      aria-hidden
    >
      {SCHICHTEN.map((s, i) => {
        const links = x
        x += s.dicke + LUFT
        const liegt = i < bis
        const aktiv = i === hervor
        return (
          <rect
            key={s.id}
            x={links}
            y={0}
            width={s.dicke}
            height={12}
            rx={0.4}
            fill={
              aktiv
                ? 'var(--color-kh-orange)'
                : liegt
                  ? 'var(--color-kh-paper)'
                  : 'transparent'
            }
            fillOpacity={aktiv ? 1 : liegt ? 0.6 : 0}
            stroke={aktiv ? 'var(--color-kh-orange)' : 'var(--color-kh-paper)'}
            strokeOpacity={aktiv || liegt ? 1 : 0.25}
            strokeWidth={0.25}
          />
        )
      })}
    </svg>
  )
}

/**
 * Der Schlusstakt. Der eine Satz, um den der Screen gebaut ist, steht in Anton
 * und nicht als sechste Zeile Fließtext — und darunter, was er kostet, wenn man
 * ihn umdreht.
 *
 * Der letzte Satz zeigt nach vorn: die Abfrage kommt in C6, und wer das hier
 * behält, hat sie halb gelöst.
 */
function Prinzip() {
  return (
    <div className="flex flex-col gap-2.5">
      <span className="grid h-[54px] w-full max-w-[22rem] place-items-center rounded-kh bg-black/35 p-2">
        <Wandschnitt bis={SCHICHTEN.length} hervor={-1} />
      </span>

      <p className="kh-titel-klein text-kh-signal">Innen dichter als außen.</p>

      <p className="text-[1.0625rem] leading-[1.45] text-kh-paper/90">
        Von innen nach außen muss jede Schicht offener sein als die davor. Andersherum
        wandert die Raumfeuchte in die Wand, kondensiert an der kalten dichten Schicht —
        und dann steht Wasser in der Dämmung, wo niemand hinsieht.
      </p>

      <p className="text-[1rem] leading-snug text-kh-mute">
        So ist der Regelfall. Es gibt Wände ohne eigene Folie; dort übernimmt die
        Beplankung ihre Aufgabe.
      </p>

      <p className="text-[1.0625rem] leading-snug text-kh-paper/70">
        Merk dir die Reihenfolge. Am Kran brauchst du sie wieder.
      </p>
    </div>
  )
}
