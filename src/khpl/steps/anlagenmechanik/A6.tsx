import { Schnitt } from '@/khpl/buehne/anlagenmechanik/Schnitt'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { FUELLDRUCK } from '@/khpl/buehne/anlagenmechanik/kanon'

/**
 * A6 — Es läuft. **Der Signaturmoment.** Kein Rätsel, kein Test: die
 * Belohnung.
 *
 * ⚠️ **Stub.** Was hier noch entsteht (Spec 6, A6):
 *
 * - Eine kleine, physische Übung: der Druck steigt, der Besucher hält im
 *   Zielfenster an. Ein Regler, ein Fenster, sofortiges Feedback. Klein genug,
 *   um nicht mit A4 zu konkurrieren, groß genug, um kein Lesescreen zu sein.
 * - Die Faustformel gehört mit auf den Screen, weil sie erklärt, warum es kein
 *   fester Wert ist: **Gebäudehöhe in Metern geteilt durch 10, plus 0,3 bar.**
 *   Zu wenig: die Anlage zieht Luft, es gluckert, oben wird es nicht warm. Zu
 *   viel: das Sicherheitsventil öffnet und lässt ab.
 * - **Dann läuft es** — und die Wärme läuft **den Weg entlang, den der Besucher
 *   in A4 gezogen hat**, in den Verteiler, in die Steigleitungen, in die Räume.
 *   Das Haus färbt sich von unten nach oben. Kein anderer der vier Tage hat
 *   eine Belohnung, die sich über den ganzen Bildschirm ausbreitet.
 * - Aha: Die Wärmepumpe macht keine Wärme. Sie **holt** sie. ⚠️ Beides sagen —
 *   dass sie bis etwa minus 20 Grad arbeitet **und** dass die Effizienz dabei
 *   sinkt. „Funktioniert auch bei Minusgraden" allein lädt zum Widerspruch ein,
 *   und irgendwer am Stand weiß es besser.
 *
 * Zahlen `BELEGT` (`belege/anlagenmechanik.md` 5, zeitstabil): Fenster und
 * Ansprechdruck stehen als `FUELLDRUCK` und `SICHERHEITSVENTIL_BAR` in
 * `buehne/anlagenmechanik/kanon.ts`.
 *
 * **Bewegungsgefühl: Fluss.** Lange, durchgehende Kurven, Verläufe, die an
 * einer Linie entlangwandern — die bewusste Gegenbewegung zu den
 * Rastersprüngen der Zerspanung und zur Pendelmasse des Zimmerers.
 */
export function A6() {
  return (
    <StepShell
      id="A6"
      buehne={
        <Schnitt
          zustand={{
            szene: 'inbetriebnahme',
            druckBar: FUELLDRUCK.min,
            imFenster: false,
            pfad: [],
            waerme: 0,
          }}
        />
      }
      fachtext={
        <p>Anlage füllen, entlüften, Druck aufbauen, Regelung parametrieren, starten.</p>
      }
      fuss={<StepFuss id="A6" />}
    />
  )
}
