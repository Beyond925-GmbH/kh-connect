import { useState } from 'react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import {
  druckverlust,
  zaehleBoegen,
  type KnotenId,
} from '@/khpl/buehne/anlagenmechanik/kanon'
import { amZiel, rasteAufZiel } from '@/khpl/buehne/anlagenmechanik/zeichnung'
import { Schnitt } from '@/khpl/buehne/anlagenmechanik/Schnitt'
import { AhaKarte } from '@/khpl/komponenten/AhaKarte'
import { Rueckmeldung } from '@/khpl/komponenten/Rueckmeldung'
import { Wechsel } from '@/khpl/komponenten/Wechsel'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { useSchmal } from '@/khpl/shell/schmal'
import { merkeAntwort, useFortschritt } from '@/khpl/store/fortschritt'
import { Fachwort } from './Fachwort'

/**
 * A4 — Der kürzeste Weg ist nicht der richtige. **Der Fehler mit Preis**
 * (khpl-tage.md 1, Mechanismus 5) und der Screen, ab dem der Weg der Rohre dem
 * Besucher gehört.
 *
 * **Die Bühne ist die Interaktion.** Der Besucher zieht die Leitung durch den
 * Kellerschnitt; die Zeichnung führt die Geste und meldet über `onPfad` den
 * Weg — nicht erst beim Loslassen, sondern während des Ziehens, damit der
 * Verlustbalken mitläuft. Bögen und Verlust rechnet dieser Step über
 * `zaehleBoegen` und `druckverlust` aus `kanon.ts`; die Zeichnung kennt nur den
 * Weg. Dieselbe Arbeitsteilung wie bei M4 und `Zuschnitt3D`.
 *
 * **M7 fragt „in welcher Reihenfolge". Dieser Screen fragt „auf welchem Weg"**
 * — zwei Tage dürfen nicht dieselbe Hauptübung haben (khpl-tage.md 4), und
 * Wegsuche ist etwas anderes als Reihenfolge.
 *
 * **Kein Blockieren.** Wer durch die tragende Wand will, bekommt einen Satz und
 * die Leitung geht nicht weiter — **den Satz sagt der Step**, damit die Copy an
 * einer Stelle liegt (`onAbgewiesen`). Wer einen zu verlustreichen Weg
 * fertigbaut, darf ihn behalten: gleich läuft die Wärme dann sichtbar
 * langsamer los. **Eine Folge, keine Note.**
 *
 * ⚠️ **Keine Zahl je Bogen auf den Screen** (Spec 11, `NICHT BELEGBAR`): der
 * Druckverlust rechnet sich über ζ · ρ/2 · v² und hängt an Durchmesser,
 * Strömungsgeschwindigkeit und Bogenform. Der Balken misst einen **relativen**
 * Verlust, kein Bar — und der Screen sagt das auch.
 *
 * Belegt und deshalb nennbar (`belege/anlagenmechanik.md` 6): die
 * Halterungsabstände für Kupfer (Ø 22 mm → 2,0 m) und die Dämmpflicht nach
 * **GEG § 69 mit Anlage 8** (bis Ø 22 mm → 20 mm Dämmung). Beide stehen als
 * Einwurf und nicht im Panel: sie erklären den Beruf, sie sind nicht die
 * Aufgabe.
 *
 * **`answers.a4`** `{ pfad, boegen, fertig }` (Spec 6).
 */

/**
 * Bis hierher ist der Weg sauber geführt; jeder Bogen darüber ist einer zu
 * viel.
 *
 * ⚠️ **Gemeldet, nicht gelöst** (khpl-tage.md, Kopf): Spec 6 beschreibt den
 * Handel als „der kürzeste Weg hat vier Bögen und einen Durchbruch durch eine
 * tragende Wand; der richtige ist zwei Meter länger und hat zwei Bögen".
 * Auf dem gebauten Raster gibt es diesen Handel nicht — die tragende Wand
 * sperrt die oberen Zeilen ganz, es gibt keinen Durchbruch, und der Weg mit
 * zwei Bögen ist zugleich der kürzeste mögliche. Mehr Bögen heißt hier immer
 * gleich lang oder länger, nie kürzer. Ein zweiter, kürzerer Weg mit mehr
 * Richtungswechseln wäre eine Änderung an der Geometrie und damit an der
 * abgenommenen Übung; **die Copy unten richtet sich deshalb nach dem, was auf
 * dem Raster wirklich passiert.**
 */
const BOEGEN_GUT = 2

/**
 * Der Satz an der tragenden Wand. Er steht hier und nicht in der Zeichnung,
 * damit die Copy an einer Stelle liegt — und weil er auf dem Handy an einem
 * anderen Ort im Panel landet als quer (s. `schmal` unten).
 */
const ABWEISUNG = 'Da geht nichts durch — das ist tragend. Such einen anderen Weg.'

export function A4() {
  const schmal = useSchmal()
  const gespeichert = useFortschritt().answers.a4
  const [pfad, setPfad] = useState<KnotenId[]>(() => gespeichert?.pfad ?? [])
  const [fertig, setFertig] = useState(() => !!gespeichert?.fertig)
  const [abgewiesen, setAbgewiesen] = useState<KnotenId | null>(null)

  const boegen = zaehleBoegen(pfad)
  const verlust = druckverlust(pfad)
  const gezogen = pfad.length >= 2
  /*
    „Leitung liegt" gibt es erst, wenn die Leitung wirklich am Verteiler
    ankommt — sonst ließe sich ein Stummel als fertig erklären, und in A6/A7
    liefe die Wärme eine Leitung entlang, die im Nichts endet. *Weiter* bleibt
    davon unberührt; nur die Übungsaktion wartet (Hüllenvertrag: kein Blockieren).

    **Aber nicht auf den Knoten genau.** Die Vorfassung prüfte
    `pfad.at(-1) === ZIEL`; in der Abnahme ist der Finger zweimal eine
    Rasterzeile daneben gelandet, und dann lag da ein fertig aussehender Strang
    neben einem toten Knopf, ohne ein Wort dazu. `amZiel` lässt den
    Nachbarknoten gelten, `rasteAufZiel` setzt den letzten Schritt beim Legen —
    gespeichert wird immer ein Weg, der am Verteiler endet.
  */
  const angekommen = amZiel(pfad)

  const ziehen = (neu: readonly KnotenId[]) => {
    setPfad([...neu])
    setAbgewiesen(null)
  }

  /**
   * **Neu ziehen.** `zieheNach` kennt nur „einen weiter" und „einen zurück" —
   * wer sich verzogen hat, müsste den Weg Knoten für Knoten rückwärts
   * nachfahren, und wer sich mit dem Kopf der Leitung einmauert (belegte
   * Knoten plus Treppe), käme gar nicht mehr weiter, weil *Leitung liegt* bis
   * zur Ankunft am Verteiler deaktiviert bleibt. Am Stand, mit
   * Vierzehnjährigen, ist das ein realistischer Fall.
   *
   * Leise und neben dem Balken, nicht im Fuß: die Primärhandlung dort bleibt
   * *Leitung liegt* beziehungsweise *Weiter* (Hüllenvertrag).
   */
  const neu = () => {
    setPfad([])
    setAbgewiesen(null)
  }

  const legen = () => {
    // Einrasten, bevor gespeichert wird: wer einen Knoten vor dem Verteiler
    // aufgehört hat, bekommt den letzten Schritt geschenkt. In A6 läuft die
    // Wärme dann bis zum Verteiler und nicht bis kurz davor.
    const weg = [...rasteAufZiel(pfad)]
    setPfad(weg)
    setFertig(true)
    merkeAntwort('a4', { pfad: weg, boegen: zaehleBoegen(weg), fertig: true })
  }

  return (
    <StepShell
      id="A4"
      /*
        Sieben Wörter. „Zieh" statt „ziehen Sie", und die beiden Fachwörter
        stehen hier **nicht**: die Leitung geht sichtbar von einem Kasten zum
        anderen, und wer die Namen wissen will, findet sie im Warum darunter.
        Die alte Fassung trug „Wärmepumpe" und „Verteiler" in der Aufforderung
        selbst — zwei Chips in dem einen Satz, den jeder lesen muss.
      */
      auftrag={fertig ? null : 'Zieh die Leitung von der Pumpe zum Verteiler.'}
      /*
        **Die Referenz-Ansage der Anwendung** (`komponenten/Ansage.tsx`).

        Freies Ziehen über eine Bühne ist die am wenigsten selbsterklärende
        Geste der vier Tage: es gibt keinen Griff, den man sieht, und die
        Fläche sieht aus wie ein Bild. Ohne Ansage fasst man ins Leere und
        hält den Screen für kaputt.

        Der Haken sagt vorweg, was die Übung sonst als Strafe nachreicht — der
        kürzeste Weg ist nicht der beste. Das ist kein Verrat der Pointe: die
        Zahl der Bögen und ihr Preis stehen weiterhin nur auf dem Balken.

        Sie erscheint **je Geste**: wer `ziehen-frei` an diesem Tag schon
        einmal gesehen hat, bekommt sie hier nicht noch einmal.
      */
      ansage={{
        geste: 'ziehen-frei',
        text: 'Du verlegst die Leitung selbst — mit dem Finger, quer durch den Keller.',
        haken: 'Der kürzeste Weg ist nicht immer der beste.',
      }}
      buehneInteraktiv
      interaktionOffen={!fertig}
      buehne={
        <Schnitt
          zustand={{ szene: 'raster', pfad, verlust, fertig, abgewiesen }}
          onPfad={fertig ? undefined : ziehen}
          onAbgewiesen={fertig ? undefined : setAbgewiesen}
        />
      }
      warum={
        /*
          Handy hochkant trägt das Panel keinen Fachtext mehr — die fünf Zeilen
          kosteten 95 px Scrollfenster, und darunter lagen ausgerechnet die
          beiden Dinge, die beim Ziehen gebraucht werden: der Verlustbalken
          samt *Neu ziehen* und die Abweisung an der tragenden Wand
          (Sichtprüfung: Balken nur halb im Fenster, Abweisung gar nicht).

          **Die beiden Fachwörter gehen dabei nicht verloren**, sie ziehen um —
          „Wärmepumpe" und „Verteiler" stehen schmal in der Aufforderung, und
          dort benennen sie genau das, was die Geste verbindet. Von den drei
          Regeln, die hier wegfallen, sagt jede sich anderswo selbst: der Bogen
          im Balken, die tragende Wand in der Abweisung, Halterung und Dämmung
          in den beiden Einwürfen.
        */
        <p>
          Das Wasser läuft von der <Fachwort id="waermepumpe">Wärmepumpe</Fachwort> zu dem
          Kasten, der es auf die Räume verteilt. Jeder Bogen kostet Druck — und durch
          manche Wände darf man nicht.
        </p>
      }
      interaktion={
        <Wechsel takt={fertig ? 'liegt' : 'ziehen'}>
          {fertig ? (
            <Bewertung boegen={boegen} />
          ) : (
            <div className="flex flex-col gap-3">
              {/* Die Aufforderung stand hier doppelt — einmal fett im Panel und
                  einmal als Fachtext darüber. Sie steht jetzt einmal, im
                  Auftragsband, auf jedem Screen an derselben Stelle. */}
              <Verlustbalken
                verlust={verlust}
                boegen={boegen}
                onNeu={gezogen ? neu : null}
                schmal={schmal}
              />

              {/* Schmal steht die Abweisung im Fuß — s. dort. */}
              {!schmal && (
                <Rueckmeldung
                  ok={abgewiesen ? false : null}
                  text={abgewiesen ? ABWEISUNG : null}
                  testid="a4-rueckmeldung"
                />
              )}
            </div>
          )}
        </Wechsel>
      }
      aha={
        <>
          <AhaKarte
            sichtbar={gezogen}
            eyebrow="Wie oft muss so ein Rohr befestigt werden?"
          >
            Ein 22-Millimeter-Kupferrohr bekommt alle zwei Meter eine Schelle. Kunststoff
            braucht mehr davon — es ist weicher und hängt sonst durch.
          </AhaKarte>
          <AhaKarte sichtbar={fertig} eyebrow="Warum kriegen die Rohre einen Mantel?">
            Weil ein warmes Rohr im kalten Keller Wärme abgibt, die niemand bestellt hat.
            Bis 22 Millimeter Rohr schreibt das Gesetz 20 Millimeter Dämmung vor.
          </AhaKarte>
        </>
      }
      fuss={
        <div className="flex flex-col gap-2.5">
          {/*
            **Die Abweisung sitzt auf dem Handy im Fuß, und der Fuß scrollt
            nie.** Sie ist die einzige Erklärung für das Einzige, was auf
            diesem Screen schiefgehen kann. Im Scrollbereich lag sie bei
            390 × 844 vollständig unter der Kante (y 750–828 bei einem Fenster
            bis 739): man fährt gegen die tragende Wand, die Leitung bleibt
            stehen, und kein Wort sagt warum. Der Auto-Scroll der
            `Rueckmeldung` half nicht — er hält bei `nearest`, und darunter
            steht nichts mehr, das ihn weiterzieht.

            Quer bleibt sie, wo sie hingehört: dort ist das Panel breit, das
            Fenster reicht, und der Fuß trägt nur die Knöpfe.
          */}
          {schmal && !fertig && (
            <Rueckmeldung
              ok={abgewiesen ? false : null}
              text={abgewiesen ? ABWEISUNG : null}
              testid="a4-rueckmeldung"
            />
          )}
          <StepFuss
            id="A4"
            uebungOffen={!fertig}
            aktion={
              fertig ? null : (
                /*
                  `grayscale` zusätzlich zur 40-%-Deckkraft der Hülle: der
                  Knopf wird während der ganzen Übung angesehen, und ob er
                  gerade „noch nicht" oder „jetzt" sagt, muss man am Kiosk im
                  Vorbeigehen sehen (R8). Nur Alpha reichte dafür nicht — in
                  der Abnahme sahen alle drei Zieh-Zustände gleich aus.
                */
                <Button
                  variant="aktion"
                  onClick={legen}
                  disabled={!angekommen}
                  data-testid="a4-legen"
                  className="disabled:grayscale"
                >
                  Leitung liegt
                </Button>
              )
            }
            geschafft={fertig ? 'Leitung geführt' : null}
          />
        </div>
      }
    />
  )
}

/**
 * Der Balken. **Kein Bar, kein Pascal, keine Zahl** — er misst einen relativen
 * Verlust, und der Screen sagt auch, warum das so ist (Spec 11).
 */
function Verlustbalken({
  verlust,
  boegen,
  onNeu,
  schmal = false,
}: {
  verlust: number
  boegen: number
  onNeu: (() => void) | null
  /** Handy hochkant: die Begründung in einem Satz statt in dreien. */
  schmal?: boolean
}) {
  return (
    <div className="kh-feld flex flex-col gap-2 px-3.5 py-2.5" data-testid="a4-verlust">
      <div className="flex items-baseline justify-between gap-3">
        <span className="kh-etikett">Druckverlust</span>
        <span className="text-[1rem] text-kh-mute tabular-nums">
          {boegen} {boegen === 1 ? 'Bogen' : 'Bögen'}
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full border border-kh-line bg-white/10">
        <motion.div
          animate={{ scaleX: Math.max(0, Math.min(1, verlust)) }}
          initial={false}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformOrigin: 'left' }}
          // Ungefüllt im Sinn der Farbregel: eine Markierung auf einer Skala,
          // kein Bedienelement. Die eine gefüllte orange Fläche ist *Weiter*.
          className="h-full rounded-full bg-kh-orange/45 ring-1 ring-kh-orange ring-inset"
          aria-hidden
        />
      </div>
      <div className="flex items-end justify-between gap-3">
        <p className="min-w-0 flex-1 text-[0.9375rem] leading-[1.4] text-kh-mute">
          {schmal
            ? 'Wie viel ein Bogen kostet, hängt am Rohr. Deshalb ein Balken und keine Zahl.'
            : 'Jeder Bogen kostet Druck — wie viel genau, hängt an Rohrdurchmesser und Fließgeschwindigkeit. Deshalb steht hier ein Balken und keine Zahl.'}
        </p>
        {/*
          **Steht immer da, auch wenn noch nichts gezogen ist.** Vorher tauchte
          der Knopf erst mit dem ersten Rasterschritt auf — und weil das Panel
          hochkant nur so hoch ist wie sein Inhalt, wuchs es in dem Moment um
          40 px nach oben. Die Zeichnung sitzt an der Panelkante, also rutschte
          das Raster **mitten in der Ziehgeste** unter dem Finger weg
          (nachgemessen: zwei von drei Zügen in die tragende Wand kamen nicht
          mehr an). Ein reservierter Platz ist der Preis dafür, dass der Screen
          während der Geste still steht — und der Notausgang ist von Anfang an
          zu sehen, statt genau dann aufzutauchen, wenn man ihn braucht.
        */}
        <Button
          variant="leise"
          onClick={onNeu ?? undefined}
          disabled={!onNeu}
          data-testid="a4-neu"
          className="-mr-2 shrink-0"
        >
          Neu ziehen
        </Button>
      </div>
    </div>
  )
}

/**
 * Was der gewählte Weg bedeutet. **Keine Note** — beide Fassungen sind wahr,
 * und der schlechtere Weg wird nicht zurückgenommen, sondern eingelöst: gleich
 * läuft die Wärme sichtbar langsamer los.
 */
function Bewertung({ boegen }: { boegen: number }) {
  const gut = boegen <= BOEGEN_GUT
  return (
    <div className="flex flex-col gap-2">
      <p className="kh-titel-klein text-kh-paper" data-testid="a4-bewertung">
        {gut ? 'Der Weg ist deiner.' : 'Der Weg ist deiner — und er hat Ecken.'}
      </p>
      <p className="text-[1.0625rem] leading-[1.45] text-kh-paper/85">
        {gut
          ? 'Zwei Bögen — weniger lässt dieser Keller nicht zu. Genau so baut man es: lieber ein Stück Rohr mehr als einen Bogen mehr.'
          : 'Er passt, er ist dicht, und er bleibt so. Jeder Bogen darin kostet die Pumpe Kraft — gleich, wenn die Anlage anläuft, siehst du es.'}
      </p>
    </div>
  )
}
