import { motion } from 'motion/react'
import { StepFoto } from '@/khpl/buehne/Foto'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { Begriff } from './Begriff'

/**
 * C5.1 — Warum niemand unter der Last steht. Abstecher von C5, mündet in C6
 * (khpl-tag-zimmerer.md 6, C6 und 11).
 *
 * **Ein Satz trägt diesen Abstecher allein**, und er ist der beste einzelne aus
 * allen 25 Gesprächen: *Routine ist der größte Feind der Sicherheit.* Er ist
 * kurz genug zum Behalten, er widerspricht der Erwartung — Erfahrung *erhöht*
 * das Risiko, nicht umgekehrt —, und er kommt von jemandem, der den Beruf seit
 * Jahrzehnten macht. Er ersetzt jede Aufzählung von Vorschriften.
 *
 * ⚠️ **Deshalb steht er hier als Zitat mit Sprecher und nicht als Merksatz.**
 * Die Recherche (`belege/zimmerer.md` 7) findet ihn **nicht** als etabliertes
 * Sprichwort des Arbeitsschutzes: der *Gedanke* dahinter ist gut belegt
 * (Routine senkt die Aufmerksamkeit), die *Formulierung* ist die dieses
 * Zimmerers. Ohne Zuschreibung wäre er eine Behauptung über den Arbeitsschutz,
 * die sich nicht halten lässt — mit Zuschreibung ist er stärker, weil ihn ein
 * Mensch sagt.
 *
 * ⚠️ **Die Regel wird nicht verschärft.** Dass niemand unter der schwebenden
 * Last steht, ist belegt (BetrSichV Anhang 1 Nr. 2.5, DGUV Vorschrift 52 § 30
 * Abs. 9) — § 30 Abs. 9 ist aber als **„Soll“-Vorschrift** formuliert. Der
 * Screen darf den Satz sagen; er darf ihn nicht als wörtliches Gesetzeszitat
 * mit Paragrafen ausgeben. Deshalb steht hier keine Fundstelle, sondern die
 * Praxis.
 *
 * ⚠️ **Die vier Zimmerleute werden gezeigt, nicht behauptet.** Eine festgelegte
 * Personenzahl fürs Einkranen gibt es nicht (`NICHT BELEGBAR`,
 * `belege/zimmerer.md` 6); die vier sind die Praxis *eines* Betriebs aus dem
 * `INTERVIEW` und werden auch so benannt.
 *
 * **Kein Übungselement** — ein Lesescreen mit Begriffs-Popovern, wie B5.1 beim
 * Dachdecker.
 *
 * ⚠️ **Die Bühne ist ein Platzhalter.** Die Medienliste
 * (khpl-tag-zimmerer.md 10) führt für diesen Screen kein Motiv, und ein
 * 3D-Element am Haken nähme C6 seinen Auftritt vorweg — deshalb hatte er
 * zunächst gar keine Bühne. Hochkant ist das ein schwarzes Feld über zwei
 * Dritteln der Höhe, ausgerechnet unter dem stärksten Zitat des Tages. Bis ein
 * eigenes Motiv da ist, steht hier `quiz-abbund.webp`: Maßnehmen am Sparren,
 * mit Helm und Handschuh. Die PSA ist das, wovon der Screen handelt; der Kran
 * bleibt C6. Der Medienbedarf ist gemeldet, nicht erledigt.
 */
export function C51() {
  return (
    <StepShell
      id="C5.1"
      titelZusatz="Abstecher"
      interaktionOffen={false}
      buehne={<StepFoto id="C5.1" />}
      fachtext={
        <p>
          Wer die <Begriff id="anschlagmittel">Anschlagmittel</Begriff> einhängt, arbeitet
          seitlich und führt das Element erst kurz vor dem Absetzen an seinen Platz. Unter
          der Last steht niemand. Nie — auch nicht kurz, auch nicht, wenn es schneller
          ginge.
        </p>
      }
      interaktion={
        <div className="flex flex-col gap-2.5">
          {/*
            Das Zitat ist der Inhalt dieses Screens, nicht seine Verzierung.
            Deshalb steht es oben, in Anton, und trägt seinen Sprecher darunter
            statt in einer Fußnote: die Zuschreibung ist hier kein Beiwerk,
            sondern die Bedingung, unter der der Satz überhaupt stehen darf.
          */}
          <motion.blockquote
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            data-testid="c51-zitat"
            className="kh-feld px-4 py-4"
          >
            <p className="kh-titel-klein text-kh-orange">
              „Routine ist der größte Feind der Sicherheit.“
            </p>
            <p className="mt-2.5 text-[1.0625rem] leading-[1.45] text-kh-paper/90">
              „Man muss da wirklich aufpassen, auch wenn man schon jahrelang dabei ist,
              dass man trotzdem immer wieder jeden Schritt so setzt, dass nichts
              passiert.“
            </p>
            <footer className="mt-2.5 text-[1rem] leading-snug text-kh-paper/60">
              Ein Zimmerer, den wir gefragt haben. Seit Jahrzehnten im Beruf.
            </footer>
          </motion.blockquote>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="kh-feld px-4 py-3 text-[1.0625rem] leading-[1.45] text-kh-paper/90"
          >
            Am Kran hat jeder seinen Platz: einer hängt die Last an und hat den Kranführer
            im Blick, die anderen nehmen das Element oben in Empfang. In dem Betrieb, den
            wir gefragt haben, sind es beim Aufstellen vier — vorgeschrieben ist diese
            Zahl nicht. Vorgeschrieben ist, dass keiner von ihnen darunter steht.
          </motion.p>
        </div>
      }
      fuss={<StepFuss id="C5.1" />}
    />
  )
}
