import { motion } from 'motion/react'
import { StepFoto } from '@/khpl/buehne/Foto'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { Begriff } from './Begriff'
import { Klappliste, type Abschnitt } from '@/khpl/komponenten/Klappliste'

/**
 * C5.1 — Warum niemand unter der Last steht. Abstecher von C5, mündet in
 * C6.
 *
 * **Ein Satz trägt diesen Abstecher allein**, und er ist der beste einzelne aus
 * allen 25 Gesprächen: *Routine ist der größte Feind der Sicherheit.* Er ist
 * kurz genug zum Behalten, er widerspricht der Erwartung — Erfahrung *erhöht*
 * das Risiko, nicht umgekehrt —, und er kommt von jemandem, der den Beruf seit
 * Jahrzehnten macht. Er ersetzt jede Aufzählung von Vorschriften.
 *
 * ⚠️ **Deshalb steht er hier als Zitat mit Sprecher und nicht als Merksatz.**
 * Die Recherche findet ihn **nicht** als etabliertes
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
 * Personenzahl fürs Einkranen gibt es nicht; die vier sind die Praxis *eines*
 * Betriebs aus dem Interview und werden auch so benannt.
 *
 * **Kein Übungselement** — ein Lesescreen mit Begriffs-Popovern, wie B5.1 beim
 * Dachdecker.
 *
 * ⚠️ **Die Bühne ist ein Platzhalter.** Für diesen Screen liegt kein eigenes
 * Motiv im Bestand, und ein 3D-Element am Haken nähme C6 seinen Auftritt
 * vorweg — deshalb hatte er
 * zunächst gar keine Bühne. Hochkant ist das ein schwarzes Feld über zwei
 * Dritteln der Höhe, ausgerechnet unter dem stärksten Zitat des Tages. Bis ein
 * eigenes Motiv da ist, steht hier `quiz-abbund.webp`: Maßnehmen am Sparren,
 * mit Helm und Handschuh. Die PSA ist das, wovon der Screen handelt; der Kran
 * bleibt C6. Der Medienbedarf ist gemeldet, nicht erledigt.
 */

/**
 * Der Absatz über die Aufstellung am Kran — hochkant eine Klappzeile.
 *
 * **Warum.** Ausgeschrieben lagen 146 px unter der Scrollkante: der Absatz
 * brach nach drei Zeilen ab, und was fehlte, war ausgerechnet der Schlusssatz
 * — dass keiner unter der Last steht, also der Titel des Screens. Kürzen wäre
 * hier falsch gewesen: die vier Zimmerleute sind als Praxis *eines* Betriebs
 * benannt, und genau diese Einschränkung steht in dem Teil, der wegfiel. Als
 * Zeile steht die Überschrift über der Kante, der Absatz kommt ganz auf Tipp.
 *
 * Das Zitat bleibt unangetastet. Es ist der Inhalt dieses Screens; hätte es
 * geklappt werden müssen, wäre der Screen der falsche Ort dafür gewesen.
 */
const AM_KRAN: Abschnitt[] = [
  {
    frage: 'Wer am Kran wo steht',
    antwort:
      'Einer hängt die Wand an den Haken und behält den Kranführer im Blick. Die anderen nehmen sie oben in Empfang. Vorgeschrieben ist nur eines: keiner steht darunter.',
  },
]
export function C51() {
  return (
    <StepShell
      id="C5.1"
      auftrag={null}
      ansage={null}
      // Quer 52 statt 44 rem: die Zeile „Wer am Kran wo steht“ trägt quer ihre
      // Überschrift mit, und die 22 px, die das kostet, holt die breitere
      // Spalte im Zitat wieder herein.
      karteBreit
      interaktionOffen={false}
      buehne={<StepFoto id="C5.1" />}
      warum={
        <p>
          Wer die <Begriff id="anschlagmittel">Anschlagmittel</Begriff> einhängt, steht
          daneben. Erst kurz vor dem Absetzen schiebt er das Element an seinen Platz.
          Unter der schwebenden Wand steht niemand. Nie — auch nicht kurz, auch nicht,
          wenn es schneller ginge.
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
            initial={{ opacity: 0, transform: 'translateY(12px)' }}
            animate={{ opacity: 1, transform: 'translateY(0px)' }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            data-testid="c51-zitat"
            className="kh-feld px-4 py-4"
          >
            {/* `kh-titel-klein` setzt line-height 1 — Anton überragt bei
                Versalien mit Umlaut seine Zeilenbox, und auf dem Handy bricht
                das Zitat zweizeilig: „ und SICHERHEIT liefen ineinander
                (Sichtbefund C5.1). Der Wert gehört eigentlich in die Utility
                selbst (src/index.css), die ist aber nicht meine Datei. */}
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

          {/* Zugeklappt ankommen: über der Zeile steht das Zitat, der Screen
              fängt also nicht mit einer zugeklappten Zeile an. */}
          <Klappliste kennung="c51" abschnitte={AM_KRAN} ersterOffen={false} />
        </div>
      }
      fuss={<StepFuss id="C5.1" />}
    />
  )
}
