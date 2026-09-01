import { Suspense, lazy, useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { RotateCw } from 'lucide-react'
import { Dachstuhl3DFallback } from '@/khpl/buehne/Dachstuhl3DFallback'
import { M5_ENDE, M5_SCHRITTE, type Lehrschritt } from '@/khpl/buehne/aufbauabschnitte'
import { railIndex } from '@/khpl/flow/steps'
import { AhaKarte } from '@/khpl/komponenten/AhaKarte'
import { Begriff } from '@/khpl/komponenten/Begriff'
import { DachSchema } from '@/khpl/komponenten/DachSchema'
import { Wechsel } from '@/khpl/komponenten/Wechsel'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { useFortschritt, useGraph } from '@/khpl/store/fortschritt'

/**
 * M5 — Aufrichten.
 *
 * **Erste Hälfte des einzigen Lernpaars.** Der Unterbau
 * entsteht Bauteil für Bauteil, jedes wird beim Einfliegen benannt — aber
 * **der Besucher setzt es selbst**.
 *
 * **Was sich geändert hat, und warum.** Vorher lief hier eine Vorführung:
 * 26 Sekunden Animation, daneben eine Pille, die mitschrieb, was gerade
 * einflog („Kommt aufs Dach: Stuhlschwelle“). Am Stand ist das die schwächste
 * Stelle des ganzen Durchlaufs — wer wartet, liest nicht, und die Pille
 * kommentierte etwas, das schon vorbei war, bevor der Name zu Ende gelesen
 * war. Jetzt steht vor jedem Teil eine Karte: eine Zeichnung, die zeigt **wo
 * es sitzt**, sein Name, ein Satz dazu. Ein Tap, und es fliegt ein.
 *
 * **Das Paar M5/M7 bleibt intakt — es wird sogar schärfer.** M5 ist geführt:
 * die Reihenfolge steht fest, es gibt nur eine Karte, man kann nichts falsch
 * machen. M7 fragt dieselbe Reihenfolge ohne Ansage ab. Erst mitmachen, dann
 * aus dem Kopf. Vorher war es zuschauen, dann aus dem Kopf.
 *
 * Die Strecke endet, bevor der erste Sparren fliegt. Genau dort sitzt
 * der Aha-Moment („bevor der erste Sparren fliegt“) — beim Anhalten ist
 * der Satz also wörtlich wahr. Was danach kommt, macht der Besucher in M7
 * selbst; das ist das Versprechen, mit dem der Fachtext hier endet.
 *
 * Zur Tonlage ist entschieden: **nur diese eine Zahl.** Die ebenfalls
 * belegten Todeszahlen bleiben aus dem UI heraus — der Punkt ist „deshalb wird
 * gesichert“, nicht „das ist ein gefährlicher Beruf“.
 *
 * **Die Fahrt** bleibt: der Step beginnt mit der Anfahrt aus M4 — Transporter
 * und Anhänger (mit deinem Sparren) fahren vor und parken neben der Rohdecke.
 * Erst dann ist die erste Karte antippbar. Die Fahrt ist Wrapper-Vertrag
 * (`Dachstuhl3D`, `anfahrt`): solange sie läuft, feuert weder `onPhase` noch
 * `onAngekommen`, ein Tipp auf die Bühne überspringt sie,
 * `prefers-reduced-motion` lässt das Gespann sofort geparkt stehen.
 */

const Dachstuhl3D = lazy(() => import('@/khpl/buehne/Dachstuhl3D'))

export function M5() {
  const graph = useGraph()
  const { hoechsterStep } = useFortschritt()
  // Wiedereinstieg über „Dein Weg“: wer schon weiter war, hat die Fahrt
  // gesehen und den Unterbau gebaut — kein zweites Mal. (M5 hinterlässt keinen
  // `answers`-Eintrag, die Hochwassermarke ist der Store-Beleg fürs
  // Dagewesensein.)
  const fertigLautStore = railIndex(graph, hoechsterStep) > railIndex(graph, 'M5')
  const reduziert = useMemo(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )
  const [angekommen, setAngekommen] = useState(fertigLautStore || reduziert)
  const [gesetzt, setGesetzt] = useState(() => (fertigLautStore ? M5_SCHRITTE.length : 0))

  const dran: Lehrschritt | undefined = M5_SCHRITTE[gesetzt]
  const danach: Lehrschritt | undefined = M5_SCHRITTE[gesetzt + 1]
  const steht = dran === undefined
  const zielT = steht ? M5_ENDE : gesetzt === 0 ? 0 : M5_SCHRITTE[gesetzt - 1].zielT

  return (
    <StepShell
      id="M5"
      /*
        Das Worked Example zu M7: hier wird vorgeführt, dort abgefragt. Der
        Auftrag sagt deshalb „setz", nicht „such dir aus" — es gibt nichts
        falsch zu machen, und genau das ist der Punkt.
      */
      auftrag={steht ? null : 'Tipp das Teil an, das als Nächstes drankommt.'}
      // Antippen und Umschauen. Das Drehen erklärt `DrehHinweis` auf der
      // Bühne selbst, wo es gilt.
      ansage={null}
      buehneInteraktiv
      interaktionOffen={!steht}
      buehne={
        <Suspense fallback={<Dachstuhl3DFallback />}>
          <Dachstuhl3D
            zielT={zielT}
            startT={0}
            // Kurz genug, dass die Karte nicht auf sich warten lässt: eine
            // Phase ist rund ein Zwanzigstel der Strecke, das sind gut zwei
            // Sekunden pro Tap.
            dauer={40}
            anfahrt={!fertigLautStore}
            onAnfahrtEnde={() => setAngekommen(true)}
            kulisse
            deinSparren
          />
        </Suspense>
      }
      warum={
        <p>
          Erst wird gesichert — Gurt, Helm, Geländer. Das nennt sich{' '}
          <Begriff id="absturzsicherung">Absturzsicherung</Begriff>. Dann wächst der
          Unterbau — das Holzgerippe, auf dem später die Sparren liegen. Von unten nach
          oben, ein Holz nach dem anderen.
        </p>
      }
      interaktion={
        <Wechsel takt={!angekommen ? 'fahrt' : steht ? 'steht' : dran.label}>
          {!angekommen ? (
            <Fahrtanzeige />
          ) : steht ? (
            <div className="flex flex-col items-start gap-2">
              <p className="kh-titel-klein text-kh-signal">Der Unterbau steht.</p>
              <p className="text-[1.0625rem] text-kh-mute">
                Was jetzt fehlt, sind die Sparren — die legst du gleich selbst.
              </p>
              <DrehHinweis />
            </div>
          ) : (
            <div className="flex flex-col items-start gap-2">
              <Bauteilkarte
                schritt={dran}
                nummer={gesetzt + 1}
                gesamt={M5_SCHRITTE.length}
                onSetzen={() => setGesetzt((n) => n + 1)}
              />
              {danach && (
                <p
                  data-testid="m5-danach"
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
        <AhaKarte
          sichtbar={steht}
          eyebrow="Warum steht die Sicherung vor dem ersten Sparren?"
        >
          Nicht, weil es Vorschrift ist, sondern weil die Hälfte der tödlichen Abstürze am
          Bau aus weniger als fünf Metern Höhe passiert. Hoch genug ist tiefer, als man
          denkt.
        </AhaKarte>
      }
      fuss={
        <StepFuss
          id="M5"
          uebungOffen={!steht}
          geschafft={steht ? 'Unterbau steht' : null}
        />
      }
    />
  )
}

/**
 * Die Karte für das nächste Bauteil — die ganze Übung von M5.
 *
 * Sie ist **selbst der Knopf**. Ein Kasten mit Vorschau und Text und daneben
 * ein „Setzen“-Button hätte zwei Ziele für eine Handlung; hier ist die Karte
 * das Ziel, groß genug für einen ausgestreckten Arm und ein festgeschraubtes
 * iPad.
 *
 * Links die Zeichnung: sie beantwortet **wo sitzt das**, bevor der Name
 * gelesen ist. Das ist der eigentliche Grund, warum die Karte funktioniert —
 * „Stuhlschwelle“ ist für jemanden mit fünfzehn kein Wort, sondern ein Rätsel.
 */
function Bauteilkarte({
  schritt,
  nummer,
  gesamt,
  onSetzen,
}: {
  schritt: Lehrschritt
  nummer: number
  gesamt: number
  onSetzen: () => void
}) {
  return (
    <motion.button
      type="button"
      onClick={onSetzen}
      data-testid="m5-setzen"
      whileTap={{ scale: 0.975 }}
      className="flex w-full items-center gap-3.5 rounded-kh border-2 border-kh-orange/50 bg-kh-orange/10 p-3 text-left"
    >
      <span className="grid size-[76px] shrink-0 place-items-center rounded-kh bg-black/35 p-1.5 sm:size-[86px]">
        <DachSchema hervor={schritt.label} className="size-full" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="kh-etikett block text-kh-paper/45">
          Teil {nummer} von {gesamt} · Tippen zum Setzen
        </span>
        <span className="kh-titel-klein mt-0.5 block text-kh-orange">{schritt.name}</span>
        <span className="mt-1 block text-[1rem] leading-snug text-kh-paper/80">
          {schritt.was}
        </span>
      </span>
    </motion.button>
  )
}

/**
 * Die Pille während der Anfahrt. Sie kommentiert die Fahrt und trägt den
 * Skip-Hinweis (Beschluss 5: die Fahrt ist per Tipp überspringbar, und das
 * muss jemand auch erfahren).
 */
function Fahrtanzeige() {
  return (
    <div
      data-testid="m5-fahrt"
      className="flex w-fit items-center gap-3 rounded-kh-pill border-2 border-kh-orange/40 bg-kh-orange/12 py-2.5 pr-5 pl-3"
    >
      <span
        aria-hidden
        className="size-3 shrink-0 animate-puls rounded-full bg-kh-orange"
      />
      <span className="min-w-0">
        <span className="kh-etikett block text-kh-paper/50">Unterwegs zur Baustelle</span>
        <p className="text-[1.0625rem] text-kh-paper/80">
          Tipp aufs Bild, wenn du gleich ankommen willst.
        </p>
      </span>
    </div>
  )
}

/**
 * Freies Drehen läuft in M5 die ganze Zeit mit (Kamerasteuerung, `ansicht`
 * default `null`) — anders als in B3.2 gibt es dafür aber keine Aufforderung.
 * Ohne einen Hinweis findet das kaum jemand von allein. Er steht am Ende, wenn
 * der Unterbau steht: währenddessen soll die Karte das Ziel sein, nicht die
 * Kamera.
 */
function DrehHinweis() {
  return (
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 1 }}
      className="flex items-center gap-1.5 text-[0.9rem] text-kh-paper/50"
    >
      <RotateCw className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
      Zieh, um dich umzuschauen
    </motion.p>
  )
}
