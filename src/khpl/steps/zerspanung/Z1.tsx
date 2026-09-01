import { useState } from 'react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { StepFoto } from '@/khpl/buehne/Foto'
import { Massstab } from '@/khpl/buehne/zerspanung/Massstab'
import { Zeichnung } from '@/khpl/buehne/zerspanung/Zeichnung'
import {
  STUFEN,
  type StufeId,
  type ZeichnungZustand,
} from '@/khpl/buehne/zerspanung/kanon'
import { AhaKarte } from '@/khpl/komponenten/AhaKarte'
import { Rueckmeldung } from '@/khpl/komponenten/Rueckmeldung'
import { Wahlflaeche } from '@/khpl/komponenten/Wahlflaeche'
import { Wechsel } from '@/khpl/komponenten/Wechsel'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { merkeAntwort, useFortschritt } from '@/khpl/store/fortschritt'
import { Begriff } from './Begriff'

/**
 * Z1 — Wie viel darf danebenliegen? Der Einstieg: **die Größenordnung, nicht
 * die Schreibweise.**
 *
 * ---
 *
 * **Was hier vorher stand, und warum es weg ist.** Der Screen war die
 * technische Zeichnung: vier Maße, antippbar, Aufgabe „such das Maß, das
 * keinen Spielraum lässt“. Das verlangte als *erste* Handlung des Tages
 * genau die Einsicht, die der Tag erst herstellen soll — dass Maße nicht
 * gleich wichtig sind. Wer „h7“ nicht kennt, konnte die Aufgabe nur lösen,
 * indem er das Maß antippt, das anders aussieht als die anderen. Dazu kam
 * ein Auftrag, der sein eigenes Fachwort voraussetzte („Spielraum“), und
 * eine Auflösung in Tausendsteln — eine Zahl, die niemand fühlt.
 *
 * **Die neue Reihenfolge: erst sortieren, dann schreiben.** Vier Dinge aus
 * vier Welten — ein Regalbrett, die Fuge am Handy, eine Bremsscheibe, der
 * eigene Bolzen — werden auf drei Stufen einsortiert: Millimeter, Zehntel,
 * Hundertstel (`buehne/zerspanung/kanon.ts`, `STUFEN`). Jede Stufe trägt
 * einen Anker, den man in der Hand hatte: zehn Blatt Papier, ein Blatt
 * Papier, dünner als ein Haar. Die Pointe fällt beim Einsortieren von
 * selbst: **dasselbe Werkstück braucht an einer Stelle Hundertstel und
 * daneben nicht.**
 *
 * **Die Zeichnung ist nicht verschwunden — sie ist die Belohnung.** Wer
 * fertig sortiert hat, kann sie sich holen („Und wie steht das auf der
 * Zeichnung?“): dann liegt das Blatt da, mit ⌀ 25 h7 markiert. Sie kommt
 * damit als *Antwort* auf eine Frage, die der Besucher inzwischen hat —
 * nicht als Rätsel, das er noch nicht stellen kann. Der Abstecher bleibt
 * optional, die Übung gilt vorher als gelöst.
 *
 * **Kein Fehler blockiert.** Eine falsche Stufe legt das Ding trotzdem an
 * seinen Platz und erklärt, warum es dort liegt — die Leiter ist ein
 * Faktenbrett, kein Punktestand. `treffer` läuft mit (wie `gut` in A7) und
 * wird nie angezeigt.
 *
 * **Fachlich:** Zuschnitt am Bau bewegt sich in Millimetern; Fugenmaße an
 * Gehäusen liegen im Zehntelbereich; der zulässige Seitenschlag einer
 * Bremsscheibe liegt bei rund 0,05 mm; h7 bei Nennmaß 18–30 mm sind 21 µm
 * (ISO 286) — beides Hundertstel-Welt. Die Allgemeintoleranz der
 * Gesamtlänge ist ISO 2768-m, 30–120 mm: ±0,3 mm.
 *
 * **`answers.z1`** `{ zugeordnet, treffer, fertig }`.
 */

/**
 * Was einsortiert wird. Reihenfolge = Reihenfolge der Fragen: leicht zuerst.
 *
 * **Die Frage steht im Auftragsband, nicht im Panel.** Erste Fassung hatte es
 * andersherum: das Band trug den immer gleichen Satz („Wie genau muss das
 * sein? Tipp eine Stufe an.“) in der größten Schrift des Screens, und *worum
 * es ging* stand als Fließtext in einem kleinen Kästchen darunter. Damit war
 * das Auffälligste am Screen die Wiederholung und das Eigentliche die
 * Fußnote. Jetzt fragt das Band nach der Sache selbst — es wechselt mit ihr.
 */
interface Sache {
  id: string
  /** Der Name auf der Leiter — kurz genug für eine Pille. */
  kurz: string
  /** Die Frage. Steht im Auftragsband, in der größten Schrift des Screens. */
  frage: string
  /** Die halblaute Zeile darunter: woran man die Sache kennt. */
  detail: string
  stufe: StufeId
  /**
   * Die Auflösung. Beginnt mit dem Namen der richtigen Stufe — dann liest
   * sich derselbe Satz nach einem Fehlgriff von selbst als Korrektur.
   */
  aufloesung: string
}

const SACHEN: readonly Sache[] = [
  {
    id: 'regal',
    kurz: 'Regalbrett',
    frage: 'Wie genau muss ein Regalbrett sein?',
    detail: 'Mit der Säge abgelängt, kommt an die Wand.',
    stufe: 'millimeter',
    aufloesung:
      'Millimeter. Einen Millimeter zu kurz sieht niemand — und das Brett liegt trotzdem auf.',
  },
  {
    id: 'handy',
    kurz: 'Handy-Fuge',
    frage: 'Wie genau muss die Fuge am Handy sein?',
    detail: 'Der schmale Spalt zwischen Display und Rahmen.',
    stufe: 'zehntel',
    aufloesung:
      'Zehntel. Wäre er einen halben Millimeter breit, sähe das Handy billig aus — und zöge Staub.',
  },
  {
    id: 'bremse',
    kurz: 'Bremsscheibe',
    frage: 'Wie genau muss eine Bremsscheibe sein?',
    detail: 'Ist sie krumm, ruckelt beim Bremsen das Pedal.',
    stufe: 'hundertstel',
    aufloesung:
      'Hundertstel. Fünf davon spürst du im Fuß — zusammen dünner als ein Haar, und trotzdem zu viel.',
  },
  {
    id: 'sitz',
    kurz: 'Dein Bolzen',
    frage: 'Wie genau muss dein Bolzen sein?',
    detail: 'Genau die Stelle, auf die gleich ein Kugellager geschoben wird.',
    stufe: 'hundertstel',
    aufloesung:
      'Hundertstel. Zwei, genauer gesagt. Mehr Luft, und das Lager eiert; weniger, und es geht nicht drauf.',
  },
]

/**
 * Wie das Blatt aussieht, wenn es als Auflösung erscheint: der Lagersitz
 * markiert, sonst nichts. Ohne `onMass` ist die Zeichnung nur noch Bild.
 */
const BLATT_ZUSTAND: ZeichnungZustand = {
  angetippt: ['sitz'],
  offen: 'sitz',
  gefunden: true,
}

export function Z1() {
  const gespeichert = useFortschritt().answers.z1
  const [zugeordnet, setZugeordnet] = useState<string[]>(() =>
    (gespeichert?.zugeordnet ?? []).filter((id) => SACHEN.some((s) => s.id === id)),
  )
  const [treffer, setTreffer] = useState(() => gespeichert?.treffer ?? 0)
  const [letzte, setLetzte] = useState<{ sache: Sache; ok: boolean } | null>(null)
  const [blatt, setBlatt] = useState(false)

  const fertig = zugeordnet.length >= SACHEN.length
  const aktuell = fertig ? null : SACHEN[zugeordnet.length]

  // Was auf der Leiter liegt. Gefiltert statt gemappt: die Reihenfolge der
  // Fragen ist die Reihenfolge von `SACHEN`, und so braucht es kein `find`
  // auf einer Liste, die den Eintrag garantiert enthält.
  const platziert = SACHEN.filter((s) => zugeordnet.includes(s.id)).map((s) => ({
    kurz: s.kurz,
    stufe: s.stufe,
  }))

  const waehle = (stufe: StufeId) => {
    if (!aktuell) return
    const ok = stufe === aktuell.stufe
    const neu = [...zugeordnet, aktuell.id]
    const punkte = treffer + (ok ? 1 : 0)
    setZugeordnet(neu)
    setTreffer(punkte)
    setLetzte({ sache: aktuell, ok })
    merkeAntwort('z1', {
      zugeordnet: neu,
      treffer: punkte,
      fertig: neu.length >= SACHEN.length,
    })
  }

  return (
    <StepShell
      id="Z1"
      auftrag={aktuell?.frage ?? null}
      ansage={null}
      karteBreit={fertig}
      interaktionOffen={!fertig}
      buehne={
        <div className="relative size-full">
          {/* Die Werkbank unter der Zeichnung. Stark abgedunkelt: sie gibt dem
              Screen Tiefe und Textur, ohne mit der Leiter darüber zu
              konkurrieren — das Motiv ist Untergrund, nicht Aussage. */}
          <div className="absolute inset-0 opacity-70">
            <StepFoto id="Z1" />
          </div>
          <div className="absolute inset-0 bg-[#0E0D0B]/55" />
          {blatt ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="size-full"
            >
              <Zeichnung zustand={BLATT_ZUSTAND} />
            </motion.div>
          ) : (
            <Massstab zustand={{ platziert, zuletzt: letzte?.sache.kurz ?? null }} />
          )}
        </div>
      }
      warum={
        <p>
          Zerspanen heißt: wegnehmen, was zu viel ist — Span für Span, bis aus der Stange
          der Bolzen wird. Wie weit ein Maß dabei danebenliegen darf, sagt die{' '}
          <Begriff id="toleranz">Toleranz</Begriff>.
        </p>
      }
      interaktion={
        <Wechsel takt={blatt ? 'blatt' : (aktuell?.id ?? 'fertig')}>
          {blatt ? (
            <Blatt />
          ) : aktuell ? (
            <Frage
              sache={aktuell}
              nummer={zugeordnet.length + 1}
              letzte={letzte}
              onStufe={waehle}
            />
          ) : (
            <Fertig onBlatt={() => setBlatt(true)} />
          )}
        </Wechsel>
      }
      aha={
        <AhaKarte sichtbar={fertig} eyebrow="Warum nicht einfach überall genau?">
          Weil genau teuer ist: bessere Werkzeuge, mehr Messen — und mehr Teile, die
          schiefgehen und im Schrott landen. Deshalb steht die Genauigkeit nur dort, wo
          sie gebraucht wird — und die Zeichnung sagt dir, wo das ist.
        </AhaKarte>
      }
      fuss={
        <StepFuss
          id="Z1"
          uebungOffen={!fertig}
          geschafft={fertig ? 'Einsortiert' : null}
        />
      }
    />
  )
}

/**
 * Ein Ding, drei Stufen — und eine Rangfolge, die man nicht suchen muss:
 * **Frage (im Band) → Zähler → Nebenzeile → drei Stufen → Quittung.**
 *
 * **Die Stufen stehen untereinander, nicht nebeneinander.** Als drei Kacheln
 * quer war für den Anker (`1 mm · zehn Blatt Papier`) kein Platz — er stand
 * nur auf der Bühne, und hochkant ist die klein. Als drei Zeilen trägt jede
 * Stufe ihren Anker mit, und die Zeile im Panel sieht aus wie die Zeile auf
 * der Leiter: dieselbe Sache, zweimal gezeigt.
 *
 * **Die Quittung steht unten, nicht oben.** Sie gehört zur *vorigen* Sache;
 * zwischen Frage und Antwortflächen gestellt, sähe sie aus, als beziehe sie
 * sich auf die aktuelle. Sie nennt deshalb auch ihren Gegenstand beim Namen.
 */
function Frage({
  sache,
  nummer,
  letzte,
  onStufe,
}: {
  sache: Sache
  nummer: number
  letzte: { sache: Sache; ok: boolean } | null
  onStufe: (stufe: StufeId) => void
}) {
  return (
    <div className="flex flex-col gap-3" data-testid="z1-frage">
      <div>
        <p className="kh-etikett">{`${nummer} von ${SACHEN.length}`}</p>
        <p className="mt-1 text-[1.0625rem] leading-[1.45] text-kh-paper/65">
          {sache.detail}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {STUFEN.map((stufe) => (
          <Wahlflaeche
            key={stufe.id}
            form="zeile"
            data-testid={`z1-stufe-${stufe.id}`}
            onClick={() => onStufe(stufe.id)}
            className="flex-col items-start justify-center gap-0 py-2"
          >
            <span className="text-[1.125rem] leading-tight font-semibold">
              {stufe.name}
            </span>
            <span className="text-[0.875rem] leading-tight text-kh-paper/55">
              {`${stufe.zahl} · ${stufe.anker}`}
            </span>
          </Wahlflaeche>
        ))}
      </div>

      {letzte ? (
        <Rueckmeldung
          ok={letzte.ok}
          text={`${letzte.sache.kurz}: ${letzte.sache.aufloesung}`}
          testid="z1-aufloesung"
        />
      ) : null}
    </div>
  )
}

/** Alles einsortiert — die Pointe, und das Angebot, das Blatt zu sehen. */
function Fertig({ onBlatt }: { onBlatt: () => void }) {
  return (
    <div className="flex flex-col gap-3">
      <motion.p
        initial={{ opacity: 0, transform: 'translateY(10px)' }}
        animate={{ opacity: 1, transform: 'translateY(0px)' }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        data-testid="z1-pointe"
        className="kh-titel-klein text-kh-orange"
      >
        Genau ist nicht überall gleich genau.
      </motion.p>
      <p className="text-[1.0625rem] leading-[1.45] text-kh-paper/90">
        Dein Bolzen spielt in derselben Liga wie eine Bremsscheibe — aber nur an einer
        einzigen Stelle. Die Länge daneben darf drei Zehntel danebenliegen, und das stört
        niemanden.
      </p>
      <Button variant="neben" size="sm" onClick={onBlatt} data-testid="z1-blatt">
        Und wie steht das auf der Zeichnung?
      </Button>
    </div>
  )
}

/** Die Zeichnung als Auflösung: dieselbe Aussage, in vier Zeichen. */
function Blatt() {
  return (
    <div className="flex flex-col gap-3">
      <p className="kh-titel-klein text-kh-orange">⌀ 25 h7</p>
      <p className="text-[1.0625rem] leading-[1.45] text-kh-paper/90">
        Vier Zeichen, und sie sagen genau das, was du gerade einsortiert hast: null nach
        oben, zwei Hundertstel nach unten. Die anderen Maße auf dem Blatt haben keinen
        solchen Zusatz — dort reichen Zehntel.
      </p>
      <p className="text-[1.0625rem] leading-[1.45] text-kh-paper/90">
        Auf diesen Sitz kommt ein Kugellager aus einer anderen Fabrik — von Leuten, die
        dieses Blatt nie sehen. Dass es trotzdem passt, liegt an{' '}
        <Begriff id="passung">h7</Begriff>: beide Seiten halten sich an dieselbe Regel.
      </p>
    </div>
  )
}
