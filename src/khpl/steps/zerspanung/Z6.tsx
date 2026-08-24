import { Werkstueck } from '@/khpl/buehne/zerspanung/Werkstueck'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'

/**
 * Z6 — Deins ist das erste. **Rückblick statt Punkte.**
 *
 * Vier Einträge mit je zwei Fassungen — gelöst und nur gesehen, beides wahr,
 * keines ein Tadel (khpl-tag-zerspanung.md §6 Z6):
 *
 * | Step | gelöst | nur gesehen |
 * | --- | --- | --- |
 * | Z1 | eine Toleranz gelesen | gesehen, wie genau ein Teil sein muss |
 * | Z2 | eine Maschine gerüstet | gesehen, was vor dem ersten Span passiert |
 * | Z3 | einen Programmfehler gefunden | ein CNC-Programm gelesen |
 * | Z5 | ein Teil gemessen und beurteilt | gesehen, wie ein Teil gemessen wird |
 *
 * **Die Pointe steht gegen die des Dachdeckers.** Dort schneidet der Besucher
 * einen von rund 110 Sparren, und die Auflösung heißt *niemand macht das
 * allein*. Hier macht er das erste von 400, und den Rest macht die Maschine.
 *
 * ⚠️ **„Nachts ohne dich“ ist entschärft** (`belege/zerspanung.md` 8):
 * mannlose Fertigung ist belegt, aber nicht der Regelfall in jedem Betrieb.
 * Tragfähig — und immer noch stark — ist: **die Maschine macht weiter, wenn du
 * gehst.**
 *
 * ⚠️ **Ein Firmenname geht nicht ohne Freigabe an den Stand** (§11). Die
 * Gattung geht immer: Mähdrescher, Getriebe, Pumpe. Genau dort soll der Screen
 * enden — nicht bei „Nr. 1 von 400“, sondern bei *wo dein Teil hinfährt*.
 *
 * ⚠️ **Gerüst.** Rückblick und Kiste fehlen. Für die Kiste gibt es **kein
 * Motiv im Bestand** — die wichtigere der beiden Medienlücken dieses Tages,
 * weil sie die Pointe trägt (§10). Und: Hallenlicht, kein Abendlicht. Draußen
 * ist es hell oder dunkel, und in der Halle merkt man es nicht.
 */
export function Z6() {
  return (
    <StepShell
      id="Z6"
      buehne={<Werkstueck zustand="kiste" fuellstand={0.4} />}
      fachtext={
        <p>
          Deins ist das erste. Die Maschine macht weiter, wenn du gehst — und was hier
          entsteht, fährt später in einem Mähdrescher, einem Getriebe, einer Pumpe.
        </p>
      }
      fuss={<StepFuss id="Z6" />}
    />
  )
}
