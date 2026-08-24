import { useState } from 'react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import {
  druckverlust,
  zaehleBoegen,
  type KnotenId,
} from '@/khpl/buehne/anlagenmechanik/kanon'
import { Schnitt } from '@/khpl/buehne/anlagenmechanik/Schnitt'
import { AhaKarte } from '@/khpl/komponenten/AhaKarte'
import { Rueckmeldung } from '@/khpl/komponenten/Rueckmeldung'
import { Wechsel } from '@/khpl/komponenten/Wechsel'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
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

/** Ab so vielen Bögen ist der Weg der kurze und nicht der gute (Spec 6, A4). */
const BOEGEN_GUT = 2

export function A4() {
  const gespeichert = useFortschritt().answers.a4
  const [pfad, setPfad] = useState<KnotenId[]>(() => gespeichert?.pfad ?? [])
  const [fertig, setFertig] = useState(() => !!gespeichert?.fertig)
  const [abgewiesen, setAbgewiesen] = useState<KnotenId | null>(null)

  const boegen = zaehleBoegen(pfad)
  const verlust = druckverlust(pfad)
  const gezogen = pfad.length >= 2

  const ziehen = (neu: readonly KnotenId[]) => {
    setPfad([...neu])
    setAbgewiesen(null)
  }

  const legen = () => {
    setFertig(true)
    merkeAntwort('a4', { pfad, boegen, fertig: true })
  }

  return (
    <StepShell
      id="A4"
      buehneInteraktiv
      interaktionOffen={!fertig}
      buehne={
        <Schnitt
          zustand={{ szene: 'raster', pfad, verlust, fertig, abgewiesen }}
          onPfad={fertig ? undefined : ziehen}
          onAbgewiesen={fertig ? undefined : setAbgewiesen}
        />
      }
      fachtext={
        fertig ? undefined : (
          <p>
            Die Leitung muss von der <Fachwort id="waermepumpe">Wärmepumpe</Fachwort> zum{' '}
            <Fachwort id="verteiler">Verteiler</Fachwort>. Dabei gelten Regeln, die man
            nicht sieht, wenn man nur auf die Länge schaut: jeder Bogen kostet Druck,
            Halterungen brauchen Abstand, durch manche Wände darf man nicht, und
            Warmwasser will gedämmt sein.
          </p>
        )
      }
      interaktion={
        <Wechsel takt={fertig ? 'liegt' : 'ziehen'}>
          {fertig ? (
            <Bewertung boegen={boegen} />
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-[1.125rem] font-semibold text-kh-paper sm:text-[1.25rem]">
                Zieh die Leitung. Von der Wärmepumpe zum Verteiler.
              </p>

              <Verlustbalken verlust={verlust} boegen={boegen} />

              <Rueckmeldung
                ok={abgewiesen ? false : null}
                text={
                  abgewiesen
                    ? 'Da geht nichts durch — das ist tragend. Such einen anderen Weg.'
                    : null
                }
                testid="a4-rueckmeldung"
              />
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
            Ein Kupferrohr mit 22 Millimetern Durchmesser bekommt alle zwei Meter eine
            Schelle, ein dünneres alle anderthalb, ein dickes erst nach dreieinhalb. Ein
            Verbundrohr aus Kunststoff braucht deutlich mehr davon — es ist weicher und
            hängt sonst durch. Wer die Abstände nicht kennt, sieht es ein Jahr später an
            der Leitung.
          </AhaKarte>
          <AhaKarte sichtbar={fertig} eyebrow="Warum kriegen die Rohre einen Mantel?">
            Weil ein warmes Rohr im kalten Keller Wärme abgibt, die niemand bestellt hat —
            und weil es im Gesetz steht: Gebäudeenergiegesetz, Paragraf 69 mit Anlage 8.
            Bis 22 Millimeter Rohr sind 20 Millimeter Dämmung vorgeschrieben. Bei dicken
            Leitungen ist der Mantel so dick wie das Rohr selbst.
          </AhaKarte>
        </>
      }
      fuss={
        <StepFuss
          id="A4"
          uebungOffen={!fertig}
          aktion={
            fertig ? null : (
              <Button
                variant="aktion"
                onClick={legen}
                disabled={!gezogen}
                data-testid="a4-legen"
              >
                Leitung liegt
              </Button>
            )
          }
          geschafft={fertig ? 'Leitung geführt' : null}
        />
      }
    />
  )
}

/**
 * Der Balken. **Kein Bar, kein Pascal, keine Zahl** — er misst einen relativen
 * Verlust, und der Screen sagt auch, warum das so ist (Spec 11).
 */
function Verlustbalken({ verlust, boegen }: { verlust: number; boegen: number }) {
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
      <p className="text-[0.9375rem] leading-[1.4] text-kh-mute">
        Jeder Bogen kostet Druck — wie viel genau, hängt an Rohrdurchmesser und
        Fließgeschwindigkeit. Deshalb steht hier ein Balken und keine Zahl.
      </p>
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
        {gut ? 'Der Weg ist deiner.' : 'Der Weg ist deiner — und er ist kurz.'}
      </p>
      <p className="text-[1.0625rem] leading-[1.45] text-kh-paper/85">
        {gut
          ? 'Zwei Bögen, ein paar Meter mehr Rohr. Genau so baut man es: Material ist billiger als eine Pumpe, die den Rest ihres Lebens dagegen anarbeitet.'
          : 'Er passt, er ist dicht, und er bleibt so. Jeder Bogen darin kostet die Pumpe Kraft — gleich, wenn die Anlage anläuft, wirst du sehen, dass die Wärme etwas länger braucht.'}
      </p>
    </div>
  )
}
