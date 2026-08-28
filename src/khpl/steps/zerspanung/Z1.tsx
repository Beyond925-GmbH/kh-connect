import { useState } from 'react'
import { motion } from 'motion/react'
import { Zeichnung } from '@/khpl/buehne/zerspanung/Zeichnung'
import type { MassId } from '@/khpl/buehne/zerspanung/kanon'
import { AhaKarte } from '@/khpl/komponenten/AhaKarte'
import { Lage } from '@/khpl/komponenten/Lage'
import { Wechsel } from '@/khpl/komponenten/Wechsel'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { merkeAntwort, useFortschritt } from '@/khpl/store/fortschritt'
import { Begriff } from './Begriff'

/**
 * Z1 — Das Teil gibt es noch nicht. Der Einstieg: **die Zeichnung lesen.**
 *
 * Jeder Auftrag in dieser Halle beginnt mit einem Blatt, und das Blatt hat
 * eine Pointe, die kein anderer der vier Tage hat: die Maße sind nicht
 * gleich wichtig. Drei tragen Allgemeintoleranz — da ist Luft. Eines trägt
 * **h7**, und an dem entscheidet sich das Teil.
 *
 * Die Übung ist deshalb kein Quiz, sondern eine Sortierung: jedes Maß ist
 * antippbar und erzählt, wie viel Spielraum es lässt. Ein Tap auf ein
 * „lockeres“ Maß ist kein Fehler — er ist der Weg zur Antwort. Gefunden ist
 * der Screen, wenn der Lagersitz angetippt wurde.
 *
 * **Fachlich:** h7 bei Nennmaß 18–30 mm = 0/−21 µm (ISO 286); die
 * Allgemeintoleranzen der übrigen Maße sind ISO 2768-m (30–120 mm: ±0,3;
 * 6–30 mm: ±0,2). Beides Normwissen, zeitstabil.
 *
 * **`answers.z1`** `{ angetippt, gefunden }`.
 */

/** Das entscheidende Maß. */
const KRITISCH: MassId = 'sitz'

const MASSE: Record<MassId, { titel: string; text: string }> = {
  laenge: {
    titel: '38 — die Gesamtlänge',
    text: 'Keine eigene Angabe, also gilt die Allgemeintoleranz: drei Zehntel nach oben oder unten sind in Ordnung. Da ist Luft — entscheidend ist ein anderes Maß.',
  },
  schaft: {
    titel: '⌀ 20 — der Absatz',
    text: 'Auch ohne eigene Angabe: zwei Zehntel Spielraum. Für diese Stelle reicht das — entscheidend ist ein anderes Maß.',
  },
  fase: {
    titel: '1 × 45° — die Fase',
    text: 'Die schräge Kante an der Stirn. Sie nimmt der Kante die Schärfe und führt das Lager beim Aufschieben. Genau sein muss sie nicht — nur da sein.',
  },
  sitz: {
    titel: '⌀ 25 h7 — der Lagersitz',
    text: 'h7 heißt: 21 Tausendstel Millimeter nach unten, nach oben gar nichts. Hier wird ein Kugellager aufgeschoben — zu dick geht es nicht drauf, zu dünn sitzt es locker.',
  },
}

export function Z1() {
  const gespeichert = useFortschritt().answers.z1
  const [angetippt, setAngetippt] = useState<MassId[]>(
    () => (gespeichert?.angetippt as MassId[] | undefined) ?? [],
  )
  const [offen, setOffen] = useState<MassId | null>(null)
  const [gefunden, setGefunden] = useState(() => !!gespeichert?.gefunden)

  const tippe = (id: MassId) => {
    setOffen(id)
    const neu = angetippt.includes(id) ? angetippt : [...angetippt, id]
    const treffer = gefunden || id === KRITISCH
    setAngetippt(neu)
    setGefunden(treffer)
    merkeAntwort('z1', { angetippt: neu, gefunden: treffer })
  }

  return (
    <StepShell
      id="Z1"
      auftrag={gefunden ? null : 'Such das Maß, das keinen Spielraum lässt.'}
      ansage={null}
      buehneInteraktiv={!gefunden}
      interaktionOffen={!gefunden}
      karteBreit={gefunden}
      buehne={<Zeichnung zustand={{ angetippt, offen, gefunden }} onMass={tippe} />}
      warum={
        <p>
          Zerspanen heißt: wegnehmen, was zu viel ist — Span für Span, bis aus der Stange
          dieses Blatt geworden ist. Was bleiben muss, sagt die{' '}
          <Begriff id="toleranz">Toleranz</Begriff> an jedem Maß.
        </p>
      }
      interaktion={
        <Wechsel takt={gefunden ? 'gefunden' : (offen ?? 'lesen')}>
          {gefunden ? <Gefunden zuletzt={offen} /> : <Lesen offen={offen} />}
        </Wechsel>
      }
      aha={
        <AhaKarte sichtbar={gefunden} eyebrow="Warum nicht einfach überall genau?">
          Weil genau teuer ist: bessere Werkzeuge, mehr Messen, mehr Ausschussrisiko.
          Deshalb steht die Genauigkeit nur dort, wo sie gebraucht wird — und die
          Zeichnung sagt dir, wo das ist.
        </AhaKarte>
      }
      fuss={
        <StepFuss
          id="Z1"
          uebungOffen={!gefunden}
          geschafft={gefunden ? 'Maß gefunden' : null}
        />
      }
    />
  )
}

/** Solange gesucht wird: die Lage und das zuletzt angetippte Maß. */
function Lesen({ offen }: { offen: MassId | null }) {
  const mass = offen ? MASSE[offen] : null

  return (
    <div className="flex flex-col gap-3">
      <Lage>
        200-mal soll aus Stangenmaterial dieser Bolzen werden. Bevor sich irgendetwas
        dreht, musst du wissen, wo er genau sein muss — und wo nicht.
      </Lage>

      {mass ? (
        <div className="kh-feld px-4 py-3" data-testid="z1-mass">
          <p className="kh-etikett">{mass.titel}</p>
          <p className="mt-1 text-[1.0625rem] leading-[1.45] text-kh-paper/90">
            {mass.text}
          </p>
        </div>
      ) : (
        <p className="px-1 text-[1rem] text-kh-paper/70">
          Vier Maße stehen auf dem Blatt. Drei lassen Spielraum — eines nicht.
        </p>
      )}
    </div>
  )
}

/** Die Auflösung: warum ein Buchstabe und eine Zahl ein Versprechen sind. */
function Gefunden({ zuletzt }: { zuletzt: MassId | null }) {
  return (
    <div className="flex flex-col gap-3">
      {/* Wer nach dem Fund noch andere Maße antippt, liest sie hier weiter —
          die Zeichnung bleibt antippbar, nur die Aufgabe ist vorbei. */}
      {zuletzt && zuletzt !== 'sitz' ? (
        <div className="kh-feld px-4 py-3" data-testid="z1-mass">
          <p className="kh-etikett">{MASSE[zuletzt].titel}</p>
          <p className="mt-1 text-[1.0625rem] leading-[1.45] text-kh-paper/90">
            {MASSE[zuletzt].text}
          </p>
        </div>
      ) : (
        <>
          <motion.p
            initial={{ opacity: 0, transform: 'translateY(10px)' }}
            animate={{ opacity: 1, transform: 'translateY(0px)' }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            data-testid="z1-pointe"
            className="kh-titel-klein text-kh-orange"
          >
            ⌀ 25 h7. Nichts nach oben, 21 Tausendstel nach unten.
          </motion.p>
          <p className="text-[1.0625rem] leading-[1.45] text-kh-paper/90">
            Auf diesen Sitz kommt ein Kugellager aus einem anderen Werk — von Leuten, die
            dieses Blatt nie sehen. Dass es trotzdem passt, ist der Deal hinter{' '}
            <Begriff id="passung">h7</Begriff>: beide Seiten halten dieselbe Norm.
          </p>
        </>
      )}
    </div>
  )
}
