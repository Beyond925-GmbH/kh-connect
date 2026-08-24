import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'

/**
 * C6 — Am Haken. **Der Signaturscreen.** Was ein Besucher von diesem Beruf
 * mitnimmt, entsteht hier.
 *
 * ⚠️ **Stub des Fundament-Agenten.** Gebaut wird der Screen vom Steps-Agenten
 * nach `khpl-tag-zimmerer.md` 6, C6. **Zwei Beats auf einem Screen:**
 *
 * **Beat 1 — die Abfrage: Vorstellungsvermögen.** Das Element hängt am Haken und
 * dreht sich langsam. Der Besucher hält es in der Lage an, in der es abgesetzt
 * werden soll. Zwei Achsen, beide aus dem Kopf (`Elementlage`):
 * *Welche Seite kommt nach außen?* — die falsche ist die verlockende, nämlich
 * die glatte Innenseite; die Antwort steckt in C3. *Und wo ist oben?* — wer sich
 * in C4 gemerkt hat, wo das Fenster sitzt, weiß es.
 *
 * **Das ist die Abfrage zu C3 und C4 zugleich, und kein Reihenfolge-Rätsel.**
 * M7 fragt „in welcher Reihenfolge“; hier wird abgefragt, ob man sich das
 * Liegende stehend denken kann — die Kompetenz, die ein Zimmerer selbst als das
 * Schwierigste seines Berufs nennt (`INTERVIEW`).
 *
 * Falsch gewählt: das Element setzt nicht ab, es dreht sich zurück in die Luft,
 * und ein Satz erklärt, was in fünf Jahren in dieser Wand passiert wäre. **Kein
 * Ausschuss, keine Note** — man dreht es einfach richtig herum. Kosten: Zeit am
 * Haken, und die Kolonne unten wartet.
 *
 * **Beat 2 — Einweisen.** Das Element schwebt über die Schwelle, der Besucher
 * führt es seitlich und in der Höhe ein. Die Last **pendelt**: zu schnell
 * gezogen, und sie schwingt über das Ziel hinaus. Bewegungsgefühl **Masse** —
 * Dämpfung über den Frame-Loop, nicht `motion`-Spring
 * (`PENDEL_DAEMPFUNG` in `buehne/zimmerer/kanon.ts`).
 *
 * **Die Kamera dreht.** Bis C5 lag alles flach unter einer Draufsicht; hier steht
 * die Kamera zum ersten Mal am Boden und schaut hinauf. Die visuelle Signatur
 * des ganzen Tages — dasselbe Modell, andere Kamera.
 *
 * Aha: *Unter der Last steht niemand. Nie.* — ⚠️ Die Spec möchte hier zusätzlich
 * C5.1 anbieten, falls es übersprungen wurde. Das ginge nur mit einer Schleife
 * im Graphen; der Widerspruch ist in `berufe/zimmerer.ts` gemeldet. Die
 * Aha-Karte kann den Inhalt nennen, nicht verlinken.
 *
 * `answers.c6` `{ seiteRichtig: boolean; versetzt: boolean; versuche: number }`
 */
export function C6() {
  return (
    <StepShell
      id="C6"
      interaktionOffen={false}
      fachtext={
        <p>
          Das Element hängt am Haken und dreht sich langsam. Welche Seite kommt nach außen
          — und wo ist oben?
        </p>
      }
      fuss={<StepFuss id="C6" />}
    />
  )
}
