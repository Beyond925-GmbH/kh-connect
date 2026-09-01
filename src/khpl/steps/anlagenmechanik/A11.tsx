import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { StepFoto } from '@/khpl/buehne/Foto'
import { AhaKarte } from '@/khpl/komponenten/AhaKarte'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'

/**
 * A1.1 — Wer fährt eigentlich nachts? Abstecher von A1, mündet in A2.
 *
 * **Warum der Abstecher da ist:** ein Vierzehnjähriger, der später erfährt,
 * dass zum Beruf Bereitschaft gehört, fühlt sich verkauft. Ein Screen, der es
 * von selbst sagt, ist glaubwürdiger als zehn, die es weglassen. Vgl. den
 * Dachdecker-Umgang mit Absturz: die Zahlen bleiben draußen, die Sache nicht.
 *
 * **Dieser Screen nennt keinen Betrag.** Es gibt **keinen bundesweiten
 * SHK-Tarifvertrag**; nachschlagbar ist ein
 * Beispiel aus Niedersachsen, und dieser Kiosk steht in NRW — die NRW-Sätze
 * ließen sich nicht recherchieren. Gesagt wird deshalb nur die Sache: dass es
 * Bereitschaft gibt, dass sie reihum geht und dass sie zusätzlich vergütet
 * wird. Wer die Zahl will, fragt den Fachverband SHK NRW.
 *
 * Recherchiert und deshalb sagbar: dass die Rotation
 * **betrieblich** und nicht tariflich geregelt ist, dass in kleinen Betrieben
 * oft der Chef selbst fährt, und dass Bereithalten und Einsatz getrennt
 * vergütet werden — der Einsatz als Arbeitszeit mit Zuschlägen.
 *
 * **Bühne: ein Foto.** Der Screen trug lange die Transporter-Zeichnung bei
 * Nacht — nicht als erste Wahl, sondern weil es für ihn kein Motiv gab. Jetzt
 * gibt es eins (`bilder['A1.1']`): der Blick über ein Armaturenbrett durch
 * eine nasse Windschutzscheibe, draußen nur Lichter. Derselbe Standpunkt wie
 * die Zeichnung, nur echt — und auf einem Screen, dessen ganze Frage
 * „fährt da wirklich jemand?" lautet, ist genau das der Unterschied.
 *
 * A5 (Mittag im Transporter) behält seine Zeichnung; die frühere Klammer
 * „eine Welt, zwei Zustände" gilt damit nicht mehr.
 */

export function A11() {
  const [aha, setAha] = useState(false)
  /** Die Klappzeile zu Rotation und Bezahlung — zu, bis jemand fragt. */
  const [dienst, setDienst] = useState(false)

  useEffect(() => {
    const id = window.setTimeout(() => setAha(true), 800)
    return () => window.clearTimeout(id)
  }, [])

  return (
    <StepShell
      id="A1.1"
      auftrag={null}
      ansage={null}
      buehne={<StepFoto id="A1.1" />}
      warum={
        <>
          <p>
            Notdienst, Bereitschaft, Wochenende. Ehrlich: es gehört dazu, es ist nicht
            jeden Tag, und es wird bezahlt.
          </p>
          {/*
            **Wortbudget: offen steht nur der erste Absatz.** Vier
            Absätze gleichzeitig — Warum-Block plus Aha — waren ~106 Wörter
            auf einem Lese-Step. Rotation und Bezahlung kommen auf Tipp;
            gestrichen ist nichts, die Ehrlichkeit des ersten Satzes bleibt
            sichtbar stehen.
          */}
          <button
            type="button"
            onClick={() => setDienst((v) => !v)}
            aria-expanded={dienst}
            data-testid="a11-dienst-schalter"
            className="mt-2 flex min-h-[44px] w-full items-center justify-between gap-2 text-left transition-transform active:scale-[0.99]"
          >
            <span className="kh-etikett">Wer fährt, und wie wird das bezahlt?</span>
            <ChevronDown
              aria-hidden
              className={`size-4 shrink-0 text-kh-paper/45 transition-transform ${
                dienst ? 'rotate-180' : ''
              }`}
              strokeWidth={2.25}
            />
          </button>
          {dienst && (
            <>
              <p>
                Wenn samstags die Heizung ausfällt, ruft niemand eine Zentrale an — es
                fährt jemand aus dem Team. Wer dran ist, wechselt reihum, meist
                wochenweise. Wie das genau läuft, macht jeder Betrieb selbst aus; in
                kleinen Betrieben fährt oft der Chef selbst.
              </p>
              <p className="mt-3">
                Bezahlt wird beides getrennt: dass du erreichbar bist, und der Einsatz
                selbst. Der Einsatz zählt als Arbeitszeit, mit Zuschlag — also mit extra
                Geld obendrauf. Wie viel, ist von Region zu Region verschieden.
              </p>
            </>
          )}
        </>
      }
      aha={
        <AhaKarte sichtbar={aha} eyebrow="Muss das jeder machen?">
          Der Dienst geht reihum — nicht jede Woche und nicht allein. Er ist der Grund,
          warum sonntagabends überhaupt jemand ans Telefon geht.
        </AhaKarte>
      }
      fuss={<StepFuss id="A1.1" />}
    />
  )
}
