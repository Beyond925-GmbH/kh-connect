import { motion } from 'motion/react'
import { StepFoto } from '@/khpl/buehne/Foto'
import { AhaKarte } from '@/khpl/komponenten/AhaKarte'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'

/**
 * C3.1 — Holz ist der einzige Baustoff, der… Abstecher von C3, mündet in C4
 * (khpl-tag-zimmerer.md 6, C3.1).
 *
 * **Eine Korrektur, keine Werbung.** Das Miro-Board behauptet, Holz sei „der
 * einzige Baustoff, der nachwächst“; `khpl-flow.md` weist das als falsch zurück.
 * Der Screen macht genau daraus seine Pointe: er sagt zuerst die Halbwahrheit,
 * streicht sie **sichtbar** durch und nennt die anderen nachwachsenden
 * Baustoffe. **Kein Fehler des Besuchers** — eine Korrektur an der App, vor
 * seinen Augen. Ein Vierzehnjähriger, der die Halbwahrheit schon kennt, wird
 * damit ernst genommen.
 *
 * Was danach übrig bleibt, ist stark genug: Holz bindet CO₂, solange es verbaut
 * ist, und ein Haus aus Holz ist auf Jahrzehnte ein Lager.
 *
 * ⚠️ **Die Korrektur darf ihre eigene Figur nicht wiederholen.** Was den
 * durchgestrichenen Satz ersetzt, steht wörtlich so im Beleg: „einer der besten“
 * CO₂-Speicher und „der mit Abstand wichtigste nachwachsende
 * Konstruktionsbaustoff“ (`belege/zimmerer.md` 3). Ein zweites „der einzige …“
 * wäre auf genau diesem Screen unbelegt **und** angreifbar — lasttragenden
 * Strohballenbau gibt es hierzulande.
 *
 * ⚠️ **Die Zahlen stehen als Spanne da und werden nie ausmultipliziert**
 * (`TEILWEISE BELEGT`, `belege/zimmerer.md` 3): rund 1 t CO₂ je m³ verbautem
 * Holz, real 0,6–1,7 t; 30 bis 70 m³ in einem Einfamilienhaus. „Ein Holzhaus
 * speichert 50 Tonnen“ wäre eine Zahl aus zwei Spannen und täuschte eine
 * Genauigkeit vor, die es nicht gibt. Der Screen sagt das auch — auf einem
 * Screen, der gerade eine Behauptung durchgestrichen hat, ist das der
 * glaubwürdigste Satz darauf.
 *
 * **Kein Übungselement.** Lesescreen.
 *
 * ⚠️ **Für diesen Screen liegt kein eigenes Motiv im Repo**
 * (khpl-tag-zimmerer.md 10). Er trägt deshalb einen **Platzhalter** —
 * `gallery-3.webp`, ein Mann auf einem Balken beim Verschrauben: verbautes
 * Holz, und genau davon handelt der Screen. Die leere Bühne der ersten Fassung
 * war der ehrlichere, aber schlechtere Zustand: hochkant ist sie ein schwarzes
 * Feld über zwei Dritteln der Höhe und liest sich als Ladefehler, nicht als
 * Absicht. Der Medienbedarf bleibt gemeldet.
 */

// ---------------------------------------------------------------------------
// Text — gebündelt oben (flow 8.4). Die Liste wörtlich aus khpl-flow.md,
// wo die Board-Behauptung zurückgewiesen wird.
// ---------------------------------------------------------------------------

const NACHWACHSEND = ['Stroh', 'Hanf', 'Flachs', 'Schilf', 'Kork', 'Bambus']

export function C31() {
  return (
    <StepShell
      id="C3.1"
      titelZusatz="Abstecher"
      interaktionOffen={false}
      buehne={<StepFoto id="C3.1" />}
      fachtext={
        <>
          {/* Kein Rot. Der Strich ist orange, weil Rot im ganzen System nicht
              vorkommt — und weil hier niemand bewertet wird, sondern die App
              sich selbst korrigiert. */}
          <p className="text-kh-mute line-through decoration-kh-orange decoration-[3px]">
            Holz ist der einzige Baustoff, der nachwächst.
          </p>
          <p className="mt-2">
            Stimmt so nicht. Nachwachsen tut auch eine ganze Reihe anderer. Richtig ist:
            Holz ist{' '}
            <strong className="font-semibold text-kh-paper">einer der besten</strong>{' '}
            CO₂-Speicher, die ein Haus haben kann — und der mit Abstand wichtigste
            nachwachsende Baustoff, aus dem man ein ganzes Tragwerk baut.
          </p>
        </>
      }
      interaktion={
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <p className="kh-etikett text-kh-mute">Wächst ebenfalls nach</p>
            <motion.ul
              initial="aus"
              animate="an"
              variants={{
                an: { transition: { staggerChildren: 0.07, delayChildren: 0.3 } },
              }}
              className="flex flex-wrap gap-1.5"
            >
              {NACHWACHSEND.map((b) => (
                <motion.li
                  key={b}
                  variants={{ aus: { opacity: 0, y: 8 }, an: { opacity: 1, y: 0 } }}
                  className="rounded-kh-pill border-2 border-kh-line-strong bg-white/5 px-3 py-1.5 text-[1rem] text-kh-paper/80"
                >
                  {b}
                </motion.li>
              ))}
            </motion.ul>
          </div>

          <div className="kh-feld flex flex-col gap-1.5 px-3.5 py-3">
            <p className="kh-etikett">Was das Holz speichert</p>
            <p className="text-[1.0625rem] leading-[1.45] text-kh-paper/90">
              In einem Kubikmeter verbautem Holz steckt ungefähr eine Tonne CO₂ — je nach
              Rechenweg zwischen 0,6 und 1,7 Tonnen. In einem Einfamilienhaus aus Holz
              sind 30 bis 70 Kubikmeter verbaut. Solange das Haus steht, bleibt der
              Kohlenstoff drin.
            </p>
            <p className="text-[1rem] leading-snug text-kh-mute">
              Beides miteinander multipliziert ergäbe eine schöne, runde Tonnenzahl. Sie
              stünde auf zwei Spannen und wäre geraten — deshalb steht sie hier nicht.
            </p>
          </div>
        </div>
      }
      aha={
        <AhaKarte sichtbar eyebrow="Sagen das auch die, die damit arbeiten?">
          „Einer der besten CO₂-Speicher ist immer das verbaute Holz in den Häusern“ — ein
          erfahrener Zimmerer im Gespräch. Er formuliert von sich aus richtig, wo der
          Werbespruch danebenliegt.
        </AhaKarte>
      }
      fuss={<StepFuss id="C3.1" />}
    />
  )
}
