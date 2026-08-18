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
 * allein. Ein erfundenes Zitat ist genau das, was der „NICHT ERFINDEN“-
 * Abschnitt verbietet, und ein leerer Anführungsstrich auf dem Screen wäre nur
 * die sichtbare Variante derselben Lücke.
 *
 * Bewusst **keine** Aha-Karte über Absturzsicherung mehr: das einzige Foto, das
 * hier inhaltlich passt, zeigt Arbeit ohne Helm (siehe unten). Ein Satz über
 * Seitenschutz und Auffanggurt daneben ist genau der Widerspruch, der einem
 * Zimmerermeister am Stand sofort auffällt.
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
      fuss={<StepFuss id="B5.1" />}
    />
  )
}
