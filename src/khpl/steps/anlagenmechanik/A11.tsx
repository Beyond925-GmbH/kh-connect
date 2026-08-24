import { useEffect, useState } from 'react'
import { Schnitt } from '@/khpl/buehne/anlagenmechanik/Schnitt'
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
 * ⚠️ **Dieser Screen nennt keinen Betrag** (Spec 6 und 11, `TEILWEISE
 * BELEGT`). Es gibt **keinen bundesweiten SHK-Tarifvertrag**; belegt ist ein
 * Beispiel aus Niedersachsen, und dieser Kiosk steht in NRW — die NRW-Sätze
 * konnten nicht belegt werden. Gesagt wird deshalb nur die Sache: dass es
 * Bereitschaft gibt, dass sie reihum geht und dass sie zusätzlich vergütet
 * wird. Wer die Zahl will, fragt den Fachverband SHK NRW.
 *
 * Belegt und deshalb sagbar (`belege/anlagenmechanik.md` 7): dass die Rotation
 * **betrieblich** und nicht tariflich geregelt ist, dass in kleinen Betrieben
 * oft der Chef selbst fährt, und dass Bereithalten und Einsatz getrennt
 * vergütet werden — der Einsatz als Arbeitszeit mit Zuschlägen.
 *
 * **Bühne: dieselbe Zeichnung wie A5, nur nachts.** Spec 7 vergibt diesen
 * Screen an ein Foto, Spec 10 hält fest, dass es fehlt — und `StepFoto`
 * rendert ohne Eintrag in der Motivliste nichts, der Screen war leer. Der
 * Transporter bei Nacht sagt dasselbe wie der Text: eine Straße, eine
 * Laterne, ein Fenster, in dem noch Licht brennt. **Eine Welt, zwei
 * Zustände** — mittags in A5, nachts hier. Kein fremdes Motiv geliehen und
 * nichts dazuerfunden.
 */

export function A11() {
  const [aha, setAha] = useState(false)

  useEffect(() => {
    const id = window.setTimeout(() => setAha(true), 800)
    return () => window.clearTimeout(id)
  }, [])

  return (
    <StepShell
      id="A1.1"
      titelZusatz="Abstecher"
      buehne={<Schnitt zustand={{ szene: 'transporter', licht: 'nacht' }} />}
      fachtext={
        <>
          <p>
            Notdienst, Bereitschaft, Wochenende. Ehrlich: es gehört dazu, es ist nicht
            jeden Tag, und es wird bezahlt.
          </p>
          <p className="mt-3">
            Wenn samstags die Heizung ausfällt, ruft niemand eine Zentrale an — es fährt
            jemand aus dem Team. Wer dran ist, wechselt reihum, meist wochenweise. Wie die
            Rotation läuft, legt der Betrieb fest und kein Tarifvertrag; in kleinen
            Betrieben fährt oft der Chef selbst.
          </p>
          <p className="mt-3">
            Bezahlt wird beides getrennt: das Erreichbarsein und der Einsatz. Der Einsatz
            zählt als Arbeitszeit, mit Zuschlägen. Was das je Stunde ist, steht in keinem
            bundesweiten Tarif — das regelt jedes Bundesland für sich.
          </p>
        </>
      }
      aha={
        <AhaKarte sichtbar={aha} eyebrow="Muss das jeder machen?">
          Bereitschaft ist ein Dienst im Team, der reihum geht — nicht jede Woche und
          nicht allein. Sie ist der Grund, warum am Sonntagabend überhaupt jemand ans
          Telefon geht, wenn ein Haus kalt wird.
        </AhaKarte>
      }
      fuss={<StepFuss id="A1.1" />}
    />
  )
}
