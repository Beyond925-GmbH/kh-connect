import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { Begriff } from './Begriff'

/**
 * C5.1 — Warum niemand unter der Last steht. Abstecher von C5, mündet in C6.
 *
 * ⚠️ **Stub des Fundament-Agenten.** Gebaut wird der Screen vom Steps-Agenten
 * nach `khpl-tag-zimmerer.md` 6, C5.1:
 *
 * - **„Routine ist der größte Feind der Sicherheit“ trägt den Abstecher allein.**
 *   Kurz genug für eine Aha-Karte, widerspricht der Erwartung (Erfahrung
 *   *erhöht* das Risiko), und er kommt von jemandem, der den Beruf seit
 *   Jahrzehnten macht.
 * - ⚠️ **Der Satz muss der Person zugeschrieben bleiben.** Er ist **kein**
 *   etabliertes Sprichwort des Arbeitsschutzes (`belege/zimmerer.md` 7); der
 *   Gedanke dahinter ist belegt, die Formulierung ist die dieses Zimmerers. Auf
 *   dem Screen steht er deshalb als **Zitat mit Sprecher**, nicht als Merksatz.
 * - Die Regel selbst ist belegt (BetrSichV Anhang 1 Nr. 2.5, DGUV Vorschrift 52
 *   § 30 Abs. 9). ⚠️ § 30 Abs. 9 ist eine **„Soll“-Vorschrift** — der Screen
 *   darf sagen, dass niemand unter der Last steht, er darf das nicht als
 *   wörtliches Gesetzeszitat mit Paragrafen verschärfen.
 * - ⚠️ Die vier Zimmerleute aus dem `INTERVIEW` darf der Screen **zeigen**, aber
 *   nicht behaupten: eine feste Personenzahl fürs Einkranen gibt es nicht
 *   (`NICHT BELEGBAR`).
 * - Kein Übungselement.
 */
export function C51() {
  return (
    <StepShell
      id="C5.1"
      titelZusatz="Abstecher"
      interaktionOffen={false}
      fachtext={
        <p>
          Wer die <Begriff id="anschlagmittel">Anschlagmittel</Begriff> einhängt, arbeitet
          seitlich und führt das Element erst kurz vor dem Absetzen an seinen Platz. Unter
          der Last steht niemand. Nie.
        </p>
      }
      fuss={<StepFuss id="C5.1" />}
    />
  )
}
