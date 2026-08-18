import { useEffect, useState } from 'react'
import { AhaKarte } from '@/khpl/komponenten/AhaKarte'
import { Begriff } from '@/khpl/komponenten/Begriff'
import { StepFuss, useStepNavigation } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'

/**
 * B5.1 — Niemand macht das allein. Abstecher von M5, mündet in M6.
 *
 * Kurzer Info-Abstecher ohne Übung (khpl-flow.md 7 B5.1).
 *
 * ⚠️ **Hier fehlt noch das Wichtigste.** Die Spec verlangt an dieser Stelle
 * ausdrücklich „ein Zitat aus dem echten Team statt einer allgemeinen Aussage
 * über Teamgeist“, zu beschaffen über die beiden Zimmerer-Innungen, am besten
 * im selben Termin wie die Fotos. Bis es da ist, trägt der Fachtext den Step
 * allein — der Platzhalter darunter bleibt sichtbar leer statt mit einem
 * erfundenen Satz gefüllt. Erfundene Zitate sind genau das, was der
 * „NICHT ERFINDEN“-Abschnitt des Dokuments verbietet.
 */

/**
 * `gallery-2` zeigt ein Team im Sparrenwerk — inhaltlich der beste Treffer im
 * Bestand für diesen Step. Es ist eines der drei Motive **ohne Helm**
 * (flow 13): in M5 und M7 darf es deshalb nicht vorkommen, weil dort der
 * Aha-Moment auf PSA und Absturzsicherung aufbaut. Hier geht es um Zusammen-
 * arbeit, nicht um Sicherheit — trotzdem gehört es auf die Austauschliste.
 */
const BILD = '/medien/media/zimmerer/gallery-2.webp'

export function B51() {
  const { weiter } = useStepNavigation('B5.1')
  const [aha, setAha] = useState(false)

  useEffect(() => {
    const id = window.setTimeout(() => setAha(true), 800)
    return () => window.clearTimeout(id)
  }, [])

  return (
    <StepShell
      id="B5.1"
      aufteilung="bild"
      titelZusatz="Abstecher"
      onWeiter={weiter}
      buehne={<img src={BILD} alt="" aria-hidden className="size-full object-cover" />}
      fachtext={
        <p>
          Ein <Begriff id="sparrenpaar">Sparrenpaar</Begriff> wiegt mehr, als zwei Arme
          tragen. Einer führt am Kranhaken, einer richtet aus, einer sichert. Auf dem Dach
          wird viel geredet — nicht aus Geselligkeit, sondern weil jeder wissen muss, was
          der andere gerade tut.
        </p>
      }
      aha={
        <AhaKarte sichtbar={aha} eyebrow="Warum das keine Frage der Höflichkeit ist">
          Kollektive Sicherung hat immer Vorrang vor der persönlichen: erst Seitenschutz
          und Gerüst, dann <Begriff id="psaga">Auffanggurt</Begriff>. Beides funktioniert
          nur, wenn jemand dabei ist.
        </AhaKarte>
      }
      fuss={<StepFuss id="B5.1" />}
    />
  )
}
