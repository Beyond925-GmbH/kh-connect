import { Schnitt } from '@/khpl/buehne/anlagenmechanik/Schnitt'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'

/**
 * A4 — Der kürzeste Weg ist nicht der richtige. **Der Fehler mit Preis**
 * (khpl-tage.md 1, Mechanismus 5) und der Screen, ab dem der Weg der Rohre dem
 * Besucher gehört.
 *
 * ⚠️ **Stub.** Was hier noch entsteht (Spec 6, A4):
 *
 * - Der Besucher zieht die Leitung durch den Kellerschnitt. Ein Budget läuft
 *   mit — nicht als Punktestand, sondern als **Druckverlust**, sichtbar als
 *   Balken. Der kürzeste Weg hat vier Bögen und einen Durchbruch durch eine
 *   tragende Wand; der richtige ist zwei Meter länger und hat zwei Bögen.
 * - **Kein Blockieren.** Wer durch die tragende Wand will, bekommt einen Satz
 *   („Da geht nichts durch — das ist tragend") und die Leitung geht nicht
 *   weiter. Wer einen zu verlustreichen Weg fertigbaut, darf ihn behalten: in
 *   A6 läuft die Wärme dann sichtbar langsamer los. **Eine Folge, keine Note.**
 * - M7 fragt „in welcher Reihenfolge". Dieser Screen fragt „auf welchem Weg" —
 *   zwei Tage dürfen nicht dieselbe Hauptübung haben.
 *
 * ⚠️ **Keine Zahl je Bogen auf den Screen** (Spec 11, `NICHT BELEGBAR`): der
 * Druckverlust rechnet sich über ζ · ρ/2 · v². Der Balken misst einen relativen
 * Verlust, kein Bar — siehe `druckverlust` in `buehne/anlagenmechanik/kanon.ts`.
 * Belegt und nennbar sind dagegen die Halterungsabstände (Kupfer Ø 22 mm →
 * 2,0 m) und die Dämmpflicht nach GEG § 69 mit Anlage 8.
 */
export function A4() {
  return (
    <StepShell
      id="A4"
      buehne={
        <Schnitt
          zustand={{
            szene: 'raster',
            pfad: [],
            verlust: 0,
            fertig: false,
            abgewiesen: null,
          }}
        />
      }
      fachtext={
        <p>
          Die Leitung muss von der Wärmepumpe zum Verteiler. Dabei gelten Regeln, die man
          nicht sieht, wenn man nur auf die Länge schaut: jeder Bogen kostet Druck,
          Halterungen brauchen Abstand, durch manche Wände darf man nicht, und Warmwasser
          will gedämmt sein.
        </p>
      }
      fuss={<StepFuss id="A4" />}
    />
  )
}
