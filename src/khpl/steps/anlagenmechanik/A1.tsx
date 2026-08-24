import { Schnitt } from '@/khpl/buehne/anlagenmechanik/Schnitt'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'

/**
 * A1 — Kein warmes Wasser. Der Einstieg, und die **Signaturübung** dieses
 * Berufs: *Suchen.* Kein anderer der vier Tage hat eine Übung, in der man
 * nicht baut, sondern herausfindet.
 *
 * ⚠️ **Stub.** Was hier noch entsteht (Spec 6, A1):
 *
 * - Drei Prüfungen aus sechs, jede schließt etwas aus oder bestätigt etwas.
 *   Oben rechts läuft eine Uhr — nicht als Druck, sondern als Anzeige.
 * - Danach tippt der Besucher auf die Ursache. Trifft er nicht, zeigt der
 *   Screen, welche Prüfung die entscheidende gewesen wäre — **ohne Note**.
 * - Der Preis eines Fehlers ist **eine zweite Anfahrt**, nicht Material.
 * - Am Ende steht, was die gelöste Störung für die Person bedeutet, bei der man
 *   war: „Sie ist vorher immer zum Nachbarn gegangen." Ein Satz, kein Foto,
 *   keine Rührung.
 * - Aha danach: das Teil kostet ein paar Euro, die Rechnung wird trotzdem
 *   dreistellig — bezahlt wird, dass jemand weiß, wo er hinschauen muss.
 *
 * ⚠️ **Die Störung, die Prüfschritte und die richtige Ursache sind fachlich
 * abzunehmen** (Spec 11). Eine plausible, aber falsche Fehlersuche vor einem
 * interessierten Publikum ist die schlechteste Sorte Fehler.
 */
export function A1() {
  return (
    <StepShell
      id="A1"
      buehne={
        <Schnitt
          zustand={{
            szene: 'anlage',
            geprueft: [],
            laeuft: null,
            ursache: null,
            geloest: false,
          }}
        />
      }
      fachtext={
        <p>Ein Symptom, viele mögliche Ursachen. Man tauscht nicht, man grenzt ein.</p>
      }
      fuss={<StepFuss id="A1" />}
    />
  )
}
