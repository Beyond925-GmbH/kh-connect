import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { StepFoto } from '@/khpl/buehne/Foto'
import { AhaKarte } from '@/khpl/komponenten/AhaKarte'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { Fachwort } from './Fachwort'

/**
 * A3.1 — Wärmepumpe gegen Ölkessel. Abstecher von A3, mündet in A4.
 *
 * Die Rechnung ausführlicher: Anschaffung, Betrieb, Förderung, Amortisation.
 *
 * **Dieser Abstecher nennt keine Fördersätze — bewusst, nicht aus
 * Versehen.** Die KfW-Konditionen haben sich am 21.07.2026
 * geändert, die nächste Absenkung ist für den 01.02.2027 angekündigt, und
 * dieses Gerät läuft an vielen Tagen über Monate. Deshalb erklärt der Screen,
 * *dass* gefördert wird und dass die Sätze sich ändern, und sagt, wo man
 * nachsieht. Ein Vierzehnjähriger trifft keine
 * Förderentscheidung, und ein Kiosk mit veralteten Fördersätzen schadet der
 * Kreishandwerkerschaft mehr, als der Screen nützt.
 *
 * **Recherchiert und deshalb nennbar** (Marktstand
 * 2026): Anschaffung mit Einbau 27.000–40.000 €, Mittel rund 36.300 € aus der
 * Auswertung von 160 realen Angeboten durch die Verbraucherzentrale. Und der
 * Satz, um den es diesem Tag geht: **das Gerät ist nur ein gutes Drittel bis
 * knapp die Hälfte davon, der Rest ist Handwerksleistung** — dieselbe Aussage,
 * die beim Dachdecker M2 trägt, hier in der Währung dieses Gewerks.
 *
 * Die Amortisation steht als **gekennzeichnete Beispielrechnung** und nicht
 * als Zusage: sie hängt an Öl- und Strompreis und an
 * der Förderquote, die gerade gilt.
 *
 * Bühne: `gallery-1.webp` — Wärmepumpe im Garten. Sie löst nebenbei den
 * schwachen `draussen`-Wert dieses Berufs ein.
 */

export function A31() {
  const [aha, setAha] = useState(false)
  /** Die Klappzeile zu Geräteanteil und Förderung — zu, bis jemand fragt. */
  const [geld, setGeld] = useState(false)

  useEffect(() => {
    const id = window.setTimeout(() => setAha(true), 800)
    return () => window.clearTimeout(id)
  }, [])

  return (
    <StepShell
      id="A3.1"
      auftrag={null}
      ansage={null}
      buehne={<StepFoto id="A3.1" />}
      warum={
        <>
          <p>
            Zwei Anlagen, dasselbe Haus, eine Rechnung. Eine{' '}
            <Fachwort id="waermepumpe">Wärmepumpe</Fachwort> in ein bestehendes Haus zu
            bauen kostet meist zwischen 27.000 und 40.000 Euro; die Verbraucherzentrale
            hat 160 echte Angebote ausgewertet und kommt im Mittel auf rund 36.300 Euro.
          </p>
          {/*
            **Wortbudget: sichtbar bleibt nur der erste Absatz.** Offen
            standen hier drei Absätze plus Aha-Karte — rund 140 Wörter auf
            einem Lese-Step. Geräteanteil und Förderung liegen jetzt hinter
            dieser Klappzeile; die Frage macht neugierig, gestrichen ist
            nichts. **Keine Zahl fehlt** — die belegten stehen im ersten
            Absatz, und „zuletzt im Juli 2026" bleibt.
          */}
          <button
            type="button"
            onClick={() => setGeld((v) => !v)}
            aria-expanded={geld}
            data-testid="a31-geld-schalter"
            className="mt-2 flex min-h-[44px] w-full items-center justify-between gap-2 text-left transition-transform active:scale-[0.99]"
          >
            <span className="kh-etikett">Was zahlt der Staat dazu?</span>
            <ChevronDown
              aria-hidden
              className={`size-4 shrink-0 text-kh-paper/45 transition-transform ${
                geld ? 'rotate-180' : ''
              }`}
              strokeWidth={2.25}
            />
          </button>
          {geld && (
            <>
              <p>
                Das Gerät ist davon nur gut ein Drittel. Der Rest ist Arbeit: Speicher,
                Leitungen, oft größere Heizkörper — und jemand, der es ausrechnet.
              </p>
              {/* „KfW" fällt nicht mehr unerklärt: der Halbsatz sagt,
                  was das ist — ein Chip wäre für eine Behörde zu viel. */}
              <p className="mt-3">
                Der Staat zahlt beim Umbau kräftig mit. Wie viel genau, ändert sich
                mehrmals im Jahr — zuletzt im Juli 2026. Deshalb steht hier keine
                Prozentzahl. Wer es genau wissen will, sieht bei der KfW nach — der
                staatlichen Förderbank.
              </p>
            </>
          )}
        </>
      }
      aha={
        <AhaKarte sichtbar={aha} eyebrow="Wann hat sich das bezahlt gemacht?">
          Eine Beispielrechnung, kein Versprechen: Zieht man das Geld vom Staat ab und
          rechnet dagegen, was das Haus jedes Jahr an Heizkosten spart, hat sich der Umbau
          nach etwa zwölf bis sechzehn Jahren bezahlt gemacht. Steigt der Ölpreis, geht es
          schneller; fällt er, dauert es länger. Genau deshalb rechnet man es für jedes
          Haus einzeln.
        </AhaKarte>
      }
      fuss={<StepFuss id="A3.1" />}
    />
  )
}
