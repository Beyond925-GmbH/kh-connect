import { useState } from 'react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Maschine } from '@/khpl/buehne/zerspanung/Maschine'
import { NULL_RICHTIG, type NullWahl } from '@/khpl/buehne/zerspanung/kanon'
import { AhaKarte } from '@/khpl/komponenten/AhaKarte'
import { Lage } from '@/khpl/komponenten/Lage'
import { Rueckmeldung } from '@/khpl/komponenten/Rueckmeldung'
import { Wechsel } from '@/khpl/komponenten/Wechsel'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { merkeAntwort, useFortschritt } from '@/khpl/store/fortschritt'
import { Begriff } from './Begriff'

/**
 * Z2 — Alles muss sitzen, bevor irgendwas läuft.
 *
 * ---
 *
 * **Was hier umgebaut wurde und warum.**
 *
 * Die Foto-Fassung ließ ein Fadenkreuz frei über ein **Fräsmaschinen**-Motiv
 * ziehen — in einem Tag, dessen Fadenobjekt eine gedrehte Welle ist. Der Bruch
 * saß mitten im Bogen: Z1 zeigt die Zeichnung der Welle, Z3 fährt ihre Kontur,
 * Z5 misst sie — und Z2 fräste eine Tasche in einen Block, den es davor und
 * danach nie gab. Dazu zwei verschiedene Treffer-Schwellen (Bühne: 1,5 mm,
 * Panel: 6 mm), ein hart positioniertes Status-Panel, das auf der Stele mit
 * der Karte kollidieren konnte, und ein Wiederbesuch, der jeden Versatz als
 * perfekten Treffer zeigte.
 *
 * Jetzt spielt Z2 auf **derselben gezeichneten Maschine wie Z3**
 * (`buehne/zerspanung/Maschine`): Futter, Rohling, Revolver. Drei Handgriffe,
 * je ein Tap, und jeder zeichnet sich sichtbar ein — die Backen fahren zu, der
 * Revolver schwenkt, die Werkzeuglänge wird bemaßt. Der vierte Handgriff ist
 * die Übung: **Wo ist Null?** Drei benannte Orte, und jeder zeigt als
 * gestrichelte Vorschau, was das Programm ab dort täte — am Futter verschwindet
 * die Kontur in der Spannung, am Werkzeug hängt sie in der Luft, am Werkstück
 * passt sie. Wer speichert, sieht das erste Teil entstehen.
 *
 * **Die Vorschau ist die Lektion**: Das Programm kennt keine Orte, es kennt
 * nur Maße ab null. Und sie ist zugleich der leise Vorgriff auf Z3 — an einer
 * CNC wird simuliert, bevor gestartet wird.
 *
 * **Kein Blockieren, keine Note** (R11): Ein falscher Ort wird nicht rot,
 * sondern vorgeführt. Die Simulation hält an, der Besucher setzt um —
 * Überspringen bleibt jederzeit möglich.
 *
 * Der Auftakt bleibt: die Maschine läuft erst einmal warm. `INTERVIEW` —
 * „Warmlaufen macht man jeden Morgen."
 *
 * ⚠️ **Die Rüstzeit erscheint ohne Zahlen.** `belege/zerspanung.md` 3 belegt
 * das **Prinzip** nach REFA (in der Kleinserie dominiert die Rüstzeit), nicht
 * ein Verhältnis wie „zwei Stunden zu drei". Der Screen sagt, *dass* die erste
 * Stunde die teuerste ist, und nennt keine Zahl (§0b).
 *
 * **`answers.z2`** `{ griffe, wahl, fertig }`.
 */

// ---------------------------------------------------------------------------
// Text und Takt — gebündelt oben (flow 8.4).
// ---------------------------------------------------------------------------

interface Handgriff {
  id: string
  name: string
  was: string
}

/** Die drei Handgriffe vor dem Nullpunkt. Reihenfolge fest — sie ist nicht
 *  die Aufgabe, sondern der Kontext: wie viel passiert, bevor etwas passiert. */
const HANDGRIFFE: readonly Handgriff[] = [
  {
    id: 'spannen',
    name: 'Rohling spannen',
    was: 'Das Stück Metall kommt ins Futter, die Backen fahren zu. Es darf sich nicht bewegen — sonst stimmt hinterher kein einziges Maß.',
  },
  {
    id: 'einwechseln',
    name: 'Werkzeug einwechseln',
    was: 'Der Drehmeißel bekommt seinen Platz im Revolver. Die Steuerung ruft ihn später nur über seine Nummer auf — T01.',
  },
  {
    id: 'vermessen',
    name: 'Werkzeug vermessen',
    was: 'Die Maschine muss wissen, wie weit die Schneide vorsteht. Was sie nicht weiß, rechnet sie falsch.',
  },
]

/**
 * Was die Vorschau zu jedem Ort sagt — beschreibend, kein Urteil (R11). Der
 * Text zum richtigen Ort bestätigt; wer vorher die falschen antippt, liest
 * dort schon, warum sie nicht taugen. Probieren ist ausdrücklich erlaubt.
 */
const ORT_FOLGE: Record<NullWahl, string> = {
  futter:
    'Ab hier gezählt läge das ganze Teil in der Spannung — die Vorschau verschwindet im Futter. Die Maschine kennt ihr Futter; dein Werkstück fängt woanders an.',
  werkzeug:
    'Das Werkzeug fährt — ein Nullpunkt, der mitfährt, ist keiner. Die Kontur hinge in der Luft, und kein Maß wüsste, wovon es gemessen ist.',
  stirn:
    'Vorn am Werkstück, auf der Achse. Ab hier weiß die Maschine, wo dein Teil anfängt — Z −35 heißt dann: 35 Millimeter in genau dieses Material.',
}

/**
 * Wenn trotz Vorschau ein falscher Ort gespeichert wird, hält die Simulation
 * an — derselbe Mechanismus, den Z3 gleich zur Hauptsache macht. Kein Rot,
 * kein „falsch": die Steuerung meldet, was sie vorgefunden hat.
 */
const SIMULATION: Record<Exclude<NullWahl, typeof NULL_RICHTIG>, string> = {
  futter:
    'Die Simulation hält an: Ab diesem Nullpunkt führe das Programm mitten ins Futter. Setz den Punkt dorthin, wo dein Werkstück anfängt.',
  werkzeug:
    'Die Simulation hält an: Dieser Nullpunkt fährt mit dem Werkzeug mit. Setz den Punkt dorthin, wo dein Werkstück anfängt.',
}

export function Z2() {
  const gespeichert = useFortschritt().answers.z2

  /** Wie viele der drei Kontext-Handgriffe abgehakt sind. */
  const [griffe, setGriffe] = useState(() =>
    gespeichert?.fertig
      ? HANDGRIFFE.length
      : Math.min(gespeichert?.griffe ?? 0, HANDGRIFFE.length),
  )
  const [wahl, setWahl] = useState<NullWahl | null>(() => gespeichert?.wahl ?? null)
  const [fertig, setFertig] = useState(() => !!gespeichert?.fertig)
  /** Die Meldung der Simulation nach einem falsch gespeicherten Nullpunkt. */
  const [meldung, setMeldung] = useState<string | null>(null)

  const dran: Handgriff | undefined = HANDGRIFFE[griffe]
  /** Die drei Kontext-Handgriffe sind durch; jetzt kommt der Nullpunkt. */
  const beimNullpunkt = dran === undefined && !fertig

  const erledige = () => {
    const n = griffe + 1
    setGriffe(n)
    merkeAntwort('z2', { griffe: n, wahl: null, fertig: false })
  }

  const waehle = (ort: NullWahl) => {
    setWahl(ort)
    setMeldung(null)
    merkeAntwort('z2', { griffe, wahl: ort, fertig: false })
  }

  const speichern = () => {
    if (!wahl) return
    if (wahl === NULL_RICHTIG) {
      setFertig(true)
      setMeldung(null)
      merkeAntwort('z2', { griffe, wahl, fertig: true })
      return
    }
    setMeldung(SIMULATION[wahl])
  }

  return (
    <StepShell
      id="Z2"
      auftrag={
        fertig
          ? null
          : beimNullpunkt
            ? 'Sag der Maschine, wo dein Werkstück anfängt.'
            : 'Tipp dich durch die drei Handgriffe.'
      }
      // Alles auf diesem Screen ist Tippen — Tippen erklärt sich selbst
      // (`komponenten/gesten.ts`); die Zieh-Ansage der Foto-Fassung entfällt.
      ansage={null}
      buehneInteraktiv={beimNullpunkt}
      interaktionOffen={!fertig}
      buehne={
        <Maschine
          ruestschritte={griffe}
          wahl={wahl}
          onWahl={beimNullpunkt ? waehle : undefined}
          gefertigt={fertig}
        />
      }
      warum={
        <p>
          Bevor der erste Span fällt, ist die Maschine eine Stunde lang blind.{' '}
          <Begriff id="ruesten">Rüsten</Begriff> heißt: ihr alles sagen, was sie nicht von
          selbst weiß.
        </p>
      }
      interaktion={
        <Wechsel takt={fertig ? 'fertig' : beimNullpunkt ? 'nullpunkt' : 'griffe'}>
          {fertig ? (
            <Auswertung />
          ) : beimNullpunkt ? (
            <NullpunktWahl wahl={wahl} meldung={meldung} />
          ) : (
            <Griffkarte
              griff={dran as Handgriff}
              nummer={griffe + 1}
              gesamt={HANDGRIFFE.length}
              danach={HANDGRIFFE[griffe + 1]?.name ?? 'Werkstücknullpunkt setzen'}
              onWeiter={erledige}
            />
          )}
        </Wechsel>
      }
      aha={
        <>
          <AhaKarte sichtbar={fertig} eyebrow="Warum dauert das erste Teil so lange?">
            Weil das Rüsten nur einmal anfällt und für alle vierhundert gilt. Die erste
            Stunde ist die teuerste des Auftrags — und die einzige, in der jemand am
            Werkstück steht statt daneben.
          </AhaKarte>
          <AhaKarte sichtbar={fertig} zugeklappt eyebrow="Läuft die Maschine sofort?">
            Nein. Sie läuft erst einmal warm. Metall dehnt sich in der Wärme, auch das der
            Maschine — eine kalte Spindel dreht andere Maße als eine betriebswarme.
          </AhaKarte>
        </>
      }
      fuss={
        <StepFuss
          id="Z2"
          uebungOffen={!fertig}
          aktion={
            fertig ? null : beimNullpunkt ? (
              <Button
                variant="aktion"
                onClick={speichern}
                disabled={!wahl}
                data-testid="z2-starten"
                // `grayscale` zusätzlich zur Deckkraft: „noch nicht" oder
                // „jetzt" muss man am Kiosk im Vorbeigehen sehen (R8).
                className="disabled:grayscale"
              >
                Nullpunkt speichern und starten
              </Button>
            ) : null
          }
          geschafft={fertig ? 'Nullpunkt gesetzt' : null}
        />
      }
    />
  )
}

// ---------------------------------------------------------------------------
// Takt 1 — die drei Handgriffe
// ---------------------------------------------------------------------------

function Griffkarte({
  griff,
  nummer,
  gesamt,
  danach,
  onWeiter,
}: {
  griff: Handgriff
  nummer: number
  gesamt: number
  danach: string
  onWeiter: () => void
}) {
  return (
    <div className="flex flex-col gap-3">
      {/* Der Auftakt, den niemand rät — und der Einsatz des Screens. Steht
          hier, weil `warum` auf Übungs-Steps nicht rendert (`Lage.tsx`). */}
      {nummer === 1 && (
        <Lage>
          Die Maschine läuft schon warm — das macht man jeden Morgen. Jetzt wird gerüstet:
          Erst wenn alles sitzt, dreht sie deine vierhundert.
        </Lage>
      )}

      <motion.button
        key={griff.id}
        type="button"
        onClick={onWeiter}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        data-testid="z2-griff"
        className="kh-feld flex items-start gap-4 p-4 text-left transition-transform active:scale-[0.99]"
      >
        <span
          aria-hidden
          className="grid size-11 shrink-0 place-items-center rounded-kh-lg bg-white/8 font-display text-[1.5rem] leading-none text-kh-paper"
        >
          {nummer}
        </span>
        <span className="flex min-w-0 flex-col gap-1">
          <span className="kh-etikett">
            Handgriff {nummer} von {gesamt} · Tippen
          </span>
          <span className="kh-titel-klein text-kh-orange">{griff.name}</span>
          <span className="text-[1rem] leading-[1.4] text-kh-paper/85">{griff.was}</span>
        </span>
      </motion.button>
      <p className="text-[0.9375rem] text-kh-mute">Danach: {danach}</p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Takt 2 — der Nullpunkt
// ---------------------------------------------------------------------------

/**
 * Das Panel zur Ortswahl. Die Erklärung des Fachbegriffs ist das
 * Interview-Zitat in Nebensatzform — es löst ihn vollständig auf, und der
 * Screen versucht nicht, das zu verbessern (§6 Z2).
 */
function NullpunktWahl({
  wahl,
  meldung,
}: {
  wahl: NullWahl | null
  meldung: string | null
}) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="kh-titel-klein text-kh-paper">Wo ist Null?</p>
        <p className="mt-1 text-[1.0625rem] leading-[1.45] text-kh-paper/85">
          Den Nullpunkt holen — vom Werkstück, damit die Maschine weiß, wo es sich gerade
          befindet. Alles im Programm zählt ab dieser Stelle.
        </p>
      </div>

      {/* Eine Ergebnisfläche, kein Stapel: Der zweite angetippte Ort schreibt
          seinen Satz dorthin, wo der erste stand. */}
      <Wechsel takt={wahl ?? 'keiner'}>
        {wahl ? (
          <p
            data-testid="z2-folge"
            className="kh-feld px-4 py-3 text-[1.0625rem] leading-[1.45] text-kh-paper/90"
          >
            {ORT_FOLGE[wahl]}
          </p>
        ) : (
          <p className="px-1 text-[0.9375rem] text-kh-mute">
            Drei Stellen leuchten auf der Maschine. Jede zeigt dir, was das Programm ab
            dort täte.
          </p>
        )}
      </Wechsel>

      <Rueckmeldung ok={meldung ? false : null} text={meldung} testid="z2-simulation" />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Takt 3 — das erste Teil steht
// ---------------------------------------------------------------------------

function Auswertung() {
  return (
    <div className="flex flex-col gap-3">
      <span data-testid="z2-zahl" className="kh-zahl text-kh-signal">
        sitzt
      </span>
      <p
        data-testid="z2-bewertung"
        className="text-[1.0625rem] leading-[1.45] text-kh-paper/85"
      >
        Die Maschine weiß jetzt, wo dein Werkstück anfängt. Alles im Programm zählt ab
        dieser Stelle — bei jedem der vierhundert Teile gleich.
      </p>
      {/* Das REFA-Prinzip ohne erfundene Zahlen (§0b): *dass* die erste
          Stunde die teuerste ist, nicht ein Verhältnis. */}
      <p className="text-[1rem] leading-[1.4] text-kh-mute">
        Das Rüsten fällt nur einmal an, für den ganzen Auftrag. Deshalb ist die erste
        Stunde die teuerste — und deshalb redet die Halle über Rüstzeit.
      </p>
    </div>
  )
}
