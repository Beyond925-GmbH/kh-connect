import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'

/**
 * C7 — Heute früh war da eine Betonplatte. **Rückblick statt Punkte.**
 *
 * ⚠️ **Stub des Fundament-Agenten.** Gebaut wird der Screen vom Steps-Agenten
 * nach `khpl-tag-zimmerer.md` 6, C7 — wörtlich nach dem Muster von M8: kein
 * Score, kein Prozentwert, sondern die Aufzählung dessen, was der Besucher
 * getan hat, mit **zwei Fassungen je Eintrag**. Beides wahr, keines ein Tadel.
 *
 * Die Einträge (`VALIDIERT`), gelöst / nur gesehen:
 *
 * | Step | gelöst | nur gesehen |
 * | --- | --- | --- |
 * | C1 | dein Holz aus dem Stapel gesucht | nach Stückliste gearbeitet |
 * | C2 | ein Ständerwerk ins Raster gesetzt | gesehen, woher das Raster kommt |
 * | C3 | eine Wand richtig aufgebaut | gesehen, woraus eine Wand besteht |
 * | C4 | ein Fenster eingeschnitten | an einem Element Maß genommen |
 * | C6 | ein Wandelement versetzt | beim Versetzen zugesehen |
 *
 * **Bühne.** Das fertige Haus im Nachmittagslicht — und zwar **das Element, das
 * der Besucher gebaut hat**, als Westwand darin, mit seinem Fenster. Derselbe
 * Kameraort wie C6, aber die Baustelle ist ein Haus.
 *
 * **Nicht abends.** Der Dachdecker endet im Abendlicht; dieser Tag endet um
 * vier, weil vorgefertigt gebaut wird, damit ein Haus in einem Tag dicht ist.
 * Zwei Feierabende dürfen nicht dasselbe Licht haben.
 */
export function C7() {
  return (
    <StepShell
      id="C7"
      interaktionOffen={false}
      fachtext={<p>Heute früh war da eine Betonplatte.</p>}
      fuss={<StepFuss id="C7" />}
    />
  )
}
