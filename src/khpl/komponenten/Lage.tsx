import type { ReactNode } from 'react'

/**
 * **Die Lage — ein Satz, der sagt, wo man steht und warum man das hier tut.**
 *
 * ---
 *
 * **Warum es das gibt.** `StepShell` hat für den Rahmen eigentlich `warum`.
 * Der wird auf **Übungs-Steps aber nicht angezeigt** (siehe dort, `leseStep`):
 * Ein Step mit `auftrag` gilt als Übung, und dann trägt das Panel Auftrag,
 * Interaktion und Fuß — sonst nichts. Das war eine gute Entscheidung gegen
 * volle Panels und hatte eine Nebenwirkung, die beim Bauen nicht auffällt und
 * am Stand sofort: **Der Rahmentext war geschrieben, stand im Code und war
 * nie zu sehen.**
 *
 * Auf A7 hieß das konkret: „Erklär es so, dass sie es versteht" — und wer
 * *sie* ist, stand ausschließlich im unsichtbaren `warum`. Auf A2:
 * „Was schätzt du: fliegt raus oder bleibt?" — ohne ein Wort darüber, dass
 * hier gerade eine Anlage geplant wird und die Entscheidung ins Angebot geht.
 *
 * **Das ist eine Lücke im Ablauf, nicht in der Copy.** Ein Auftrag sagt, *was*
 * zu tun ist; er kann nicht auch noch sagen, *wo man ist* und *für wen*, ohne
 * die Regel zu brechen, dass auf einem Screen genau ein Anweisungssatz
 * steht. Also braucht es eine
 * zweite, leisere Zeile — und die steht hier.
 *
 * **Regeln für diesen Satz:**
 *
 *  - Höchstens zwei Sätze, rund 25 Wörter. Er ist der Rahmen, nicht der
 *    Inhalt.
 *  - Er nennt **Ort, Gegenüber oder Einsatz** — was von den dreien fehlt.
 *  - Er wiederholt den Auftrag nicht. Steht dort „Entscheide", steht hier
 *    nicht „du musst entscheiden", sondern warum es jemanden interessiert.
 *  - Er steht **über** der Interaktion und scrollt mit ihr; der Auftrag
 *    darüber bleibt stehen.
 *
 * Optisch bewusst zurückgenommen: kein Feld, kein Rahmen, kein Orange. Er ist
 * die Stimme, die einem beim Reinkommen erklärt, worum es geht — nicht die
 * Aufgabe und nicht die Pointe.
 */
export function Lage({ children }: { children: ReactNode }) {
  return (
    <p
      data-testid="lage"
      className="text-[1rem] leading-[1.45] text-kh-paper/70 sm:text-[1.0625rem]"
    >
      {children}
    </p>
  )
}
