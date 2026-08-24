import { useEffect, useState } from 'react'
import { StepFoto } from '@/khpl/buehne/Foto'
import { AhaKarte } from '@/khpl/komponenten/AhaKarte'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { Fachwort } from './Fachwort'

/**
 * A3.1 — Wärmepumpe gegen Ölkessel. Abstecher von A3, mündet in A4.
 *
 * Die Rechnung ausführlicher: Anschaffung, Betrieb, Förderung, Amortisation
 * (Spec 6, A3.1).
 *
 * ⚠️ **Dieser Abstecher nennt keine Fördersätze — das ist eine Entscheidung
 * der Spec, kein Versehen.** Die KfW-Konditionen haben sich am 21.07.2026
 * geändert, die nächste Absenkung ist für den 01.02.2027 angekündigt, und
 * dieses Gerät läuft an vielen Tagen über Monate. Die Spec wählt ausdrücklich
 * Weg 1: der Screen erklärt, *dass* gefördert wird und dass die Sätze sich
 * ändern, und sagt, wo man nachsieht. Ein Vierzehnjähriger trifft keine
 * Förderentscheidung, und ein Kiosk mit veralteten Fördersätzen schadet der
 * Kreishandwerkerschaft mehr, als der Screen nützt.
 *
 * **Belegt und deshalb genannt** (`belege/anlagenmechanik.md` 4, Marktstand
 * 2026): Anschaffung mit Einbau 27.000–40.000 €, Mittel rund 36.300 € aus der
 * Auswertung von 160 realen Angeboten durch die Verbraucherzentrale. Und der
 * Satz, um den es diesem Tag geht: **das Gerät ist nur ein gutes Drittel bis
 * knapp die Hälfte davon, der Rest ist Handwerksleistung** — dieselbe Aussage,
 * die beim Dachdecker M2 trägt, hier in der Währung dieses Gewerks.
 *
 * Die Amortisation steht als **gekennzeichnete Beispielrechnung**, wie es die
 * Spec verlangt, und nicht als Zusage: sie hängt an Öl- und Strompreis und an
 * der Förderquote, die gerade gilt.
 *
 * Bühne: `gallery-1.webp` — Wärmepumpe im Garten. Sie löst nebenbei den
 * schwachen `draussen`-Wert dieses Berufs ein (Spec 8).
 */

export function A31() {
  const [aha, setAha] = useState(false)

  useEffect(() => {
    const id = window.setTimeout(() => setAha(true), 800)
    return () => window.clearTimeout(id)
  }, [])

  return (
    <StepShell
      id="A3.1"
      titelZusatz="Abstecher"
      buehne={<StepFoto id="A3.1" />}
      fachtext={
        <>
          <p>
            Zwei Anlagen, dasselbe Haus, eine Rechnung. Eine{' '}
            <Fachwort id="waermepumpe">Wärmepumpe</Fachwort> in ein bestehendes Haus zu
            bauen kostet meist zwischen 27.000 und 40.000 Euro; die Verbraucherzentrale
            hat 160 echte Angebote ausgewertet und kommt im Mittel auf rund 36.300 Euro.
          </p>
          <p className="mt-3">
            Das Gerät selbst ist davon nur gut ein Drittel bis knapp die Hälfte. Der Rest
            ist Arbeit: Hydraulik, Speicher, Leitungen, oft größere Heizkörper — und
            jemand, der ausrechnet, was zu diesem Haus passt.
          </p>
          <p className="mt-3">
            Gefördert wird der Umbau, und zwar erheblich. Wie viel genau, ändert sich
            mehrmals im Jahr — zuletzt im Juli 2026. Deshalb steht hier keine Prozentzahl:
            sie wäre womöglich nächsten Monat falsch. Wer es genau wissen will, sieht bei
            der KfW nach.
          </p>
        </>
      }
      aha={
        <AhaKarte sichtbar={aha} eyebrow="Wann hat sich das bezahlt gemacht?">
          Eine Beispielrechnung, kein Versprechen: Zieht man die Förderung ab und rechnet
          die jährliche Ersparnis dagegen, ist ein Haus wie dieses nach etwa zwölf bis
          sechzehn Jahren heraus. Steigt der Ölpreis, geht es schneller; fällt er, dauert
          es länger. Genau deshalb rechnet man es für jedes Haus einzeln.
        </AhaKarte>
      }
      fuss={<StepFuss id="A3.1" />}
    />
  )
}
