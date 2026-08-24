import { Schnitt } from '@/khpl/buehne/anlagenmechanik/Schnitt'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'

/**
 * A3 — Wie viel Wärme braucht ein Haus? **Der eine Schätzmoment dieses Tages**
 * (khpl-tage.md 1, Mechanismus 3) und der Screen, der `sinn: 1` einlöst.
 *
 * ⚠️ **Stub.** Was hier noch entsteht (Spec 6, A3):
 *
 * 1. Das Haus steht da: Baujahr, Fläche, gedämmt oder nicht.
 * 2. Frage: *Wie viel Leistung braucht das?* Ein Regler.
 * 3. Auflösung: eine überraschend **kleine** Zahl — und daneben, was das im
 *    Jahr bedeutet.
 *
 * **Die Reihenfolge der Auflösung ist nach den Interviews gedreht** (Spec 1):
 * zuerst steht da, dass es in diesem Haus im Winter warm ist — dasselbe warm
 * wie vorher, für die Familie ändert sich nichts. **Danach** kommt, womit. Die
 * Klimabilanz ist die zweite Zeile, nicht die Überschrift.
 *
 * **Vorsicht bei der Tonlage:** kein Werbescreen, keine Wertung des
 * Vorbesitzers, keine Politik. Zwei Zahlen nebeneinander und ein Satz. Wer eine
 * Ölheizung zu Hause hat, sitzt vielleicht daneben.
 *
 * ⚠️ **Zahlen** (Spec 6 und 11, `belege/anlagenmechanik.md` 1–2): Heizlast für
 * 140 m² unsaniert 10–14 kW — zeitstabil. CO₂ 7,4 t → 2,4 t im Jahr, mit
 * sichtbarem **Stand**. Öl- und Strompreise sind Tagespreise; die Spec
 * empfiehlt, sie wegzulassen und nur die CO₂-Zeile zu zeigen.
 */
export function A3() {
  return (
    <StepShell
      id="A3"
      buehne={
        <Schnitt zustand={{ szene: 'haus', schaetzungKw: null, aufgeloest: false }} />
      }
      fachtext={
        <p>
          Wie viel Leistung ein Gebäude bei Auslegungstemperatur braucht, hängt an
          Dämmung, Fläche und Fenstern — nicht am Wunschdenken.
        </p>
      }
      fuss={<StepFuss id="A3" />}
    />
  )
}
