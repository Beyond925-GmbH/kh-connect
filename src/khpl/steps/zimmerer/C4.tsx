import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { Begriff } from './Begriff'

/**
 * C4 — Hier kommt das Fenster hin. **Der Fehler mit Preis.**
 *
 * ⚠️ **Stub des Fundament-Agenten.** Gebaut wird der Screen vom Steps-Agenten
 * nach `khpl-tag-zimmerer.md` 6, C4:
 *
 * - Der Besucher zieht den Ausschnitt auf dem liegenden Element auf. Zwei Maße
 *   stehen im Plan (Breite, Höhe ab Rohboden).
 * - **Zu klein** → der Rahmen geht nicht rein, nachschneiden geht.
 *   **Zu groß** → die Fuge ist zu breit für das Dichtband, das Element muss
 *   aufgetrennt und ein neues Wechselholz gesetzt werden. **Eine Stunde weg.**
 * - **Der Preis ist Zeit, nicht Material** — das ist der Unterschied zum
 *   Dachdecker. In einer Halle, in der um elf der Lkw steht, ist nicht das Holz
 *   teuer, sondern der Takt.
 * - Zielfenster `BELEGT` (RAL-Montageleitfaden, ift Rosenheim;
 *   `belege/zimmerer.md` 5): Fugenbreite Holzfenster **mindestens 10 mm
 *   umlaufend**, Einbautoleranz **höchstens 1,5 mm pro Meter**, maximal 3 mm
 *   bei Elementen bis 3 m.
 * - ⚠️ Der Screen sagt **Holzfenster**: Kunststofffenster brauchen deutlich
 *   breitere Fugen.
 * - **Und hier wird zum ersten Mal nach oben gefragt.** Sobald der Rahmen sitzt,
 *   kippt die Ansicht eine Sekunde in die Senkrechte (`aufrichtenZeigen`), mit
 *   einem Satz: *So sieht das aus, wenn es steht. Merk dir, wo das Fenster ist.*
 *   Ohne das ist die Frage in C6 ein Ratespiel.
 * - Ab dem Treffer gehört das Element dem Besucher (`deinElement`).
 * - `answers.c4` `{ getroffen: boolean; versuche: number; abweichungMm?: number }`
 */
export function C4() {
  return (
    <StepShell
      id="C4"
      interaktionOffen={false}
      fachtext={
        <p>
          Der Ausschnitt wird gesetzt, das <Begriff id="wechselholz">Wechselholz</Begriff>{' '}
          kommt rein, der Rahmen sitzt. Ein Fenster hängt nicht in der Dämmung, es hängt
          im Holz.
        </p>
      }
      fuss={<StepFuss id="C4" />}
    />
  )
}
