import { StepFoto } from '@/khpl/buehne/Foto'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'

/**
 * Z4 — Der stillste Raum der Firma. **Die Zäsur.**
 *
 * Was hier ursprünglich stand — „vier Minuten nichts tun“, die Maschine läuft
 * — ist weg: **kein einziges der vier Gespräche beschreibt dieses Warten**
 * (khpl-tag-zerspanung.md §6 Z4). Sie beschreiben einen durchgehenden
 * Kreislauf. Wer wartet, macht in Wahrheit schon das nächste Teil.
 *
 * Der Messraum ist der echte Ortswechsel in einem Tag, der sonst keinen hat.
 * Er tut, was die Brotzeit für den Dachdecker tut — er nimmt das Tempo raus —
 * und er tut es, ohne etwas zu erfinden. Nebenbei setzt er Z5 auf.
 *
 * **Es gibt etwas zu entdecken**, nach dem Muster von M6: drei Fragen, je
 * einen Tap von der Antwort entfernt, alle drei belegt — die 20 Grad nach
 * DIN EN ISO 1, die Tausendstel-Anzeige des Voreinstellgeräts (Anzeige, nicht
 * Genauigkeit) und die verriegelte Maschinentür.
 *
 * **Die ehrliche Kehrseite des Tages sitzt hier** (khpl-tage.md §1,
 * Mechanismus 8): den ganzen Tag stehen. Aus dem Mund von jemandem, der es
 * hinter sich hat, samt dem Teil, der ihm die Schärfe nimmt.
 *
 * ⚠️ **Gerüst.** Die drei Entdeckungen fehlen, `answers.z4` ist im Store
 * angelegt. Die **dreifache Idle-Geduld** dieses Screens (wie M6) ist eine
 * Änderung an der Hülle und wird gemeldet, nicht gebaut (khpl-tage.md §6.2).
 */
export function Z4() {
  return (
    <StepShell
      id="Z4"
      buehne={<StepFoto id="Z4" />}
      fachtext={
        <p>
          Der Messraum ist leise, sauber und immer gleich warm — und hier wird auf
          Tausendstel gemessen. Der Rest der Halle bleibt draußen.
        </p>
      }
      fuss={<StepFuss id="Z4" />}
    />
  )
}
