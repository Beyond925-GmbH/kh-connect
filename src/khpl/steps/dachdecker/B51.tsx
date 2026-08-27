import { StepFoto } from '@/khpl/buehne/Foto'
import { Begriff } from '@/khpl/komponenten/Begriff'
import { StepFuss } from '@/khpl/shell/StepFuss'
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
 * Im Design-Review (R13) geprüft: das einzige echte Zitat im Projekt —
 * „Routine ist der größte Feind der Sicherheit“ (C5.1, Zimmerer) — handelt
 * von Routine und Sicherheit, nicht von Teamarbeit, und trägt bereits den
 * Zimmerer-Abstecher. Die Lücke ist deshalb in
 * `ui-review/medien-luecken-dachdecker.md` dokumentiert; der Fachtext zeigt
 * bis dahin wenigstens auf die zwei echten Menschen im Foto, statt Teamgeist
 * nur zu behaupten.
 *
 * Bewusst **keine** Aha-Karte über Absturzsicherung mehr: das einzige Foto, das
 * hier inhaltlich passt, zeigt Arbeit ohne Helm (siehe unten). Ein Satz über
 * Seitenschutz und Auffanggurt daneben ist genau der Widerspruch, der einem
 * Zimmerermeister am Stand sofort auffällt.
 */

export function B51() {
  return (
    <StepShell
      id="B5.1"
      auftrag={null}
      ansage={null}
      titelZusatz="Abstecher"
      // Zwei, die zusammen an einem Sparrenwerk arbeiten — inhaltlich genau
      // dieser Step. ⚠️ Auch dieses Motiv zeigt Arbeit **ohne Helm** und steht
      // damit weiter auf der Austauschliste (flow 13). Für M5 und M7 ist es
      // deshalb gesperrt: dort baut der Aha-Moment auf PSA und Absturz-
      // sicherung auf. Hier geht es um Zusammenarbeit, nicht um Sicherheit.
      buehne={<StepFoto id="B5.1" />}
      warum={
        <p>
          Zwei zusammengesetzte Dachbalken — ein{' '}
          <Begriff id="sparrenpaar">Sparrenpaar</Begriff> — wiegen mehr, als zwei Arme
          tragen. Einer führt am Kran, einer richtet aus, einer sichert. Deshalb wird oben
          so viel geredet. Die zwei auf dem Foto machen gerade genau das.
        </p>
      }
      fuss={<StepFuss id="B5.1" />}
    />
  )
}
