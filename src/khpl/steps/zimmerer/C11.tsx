import { StepFoto } from '@/khpl/buehne/Foto'
import { AhaKarte } from '@/khpl/komponenten/AhaKarte'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { Begriff } from './Begriff'
import { Klappliste, type Abschnitt } from '@/khpl/komponenten/Klappliste'

/**
 * C1.1 — Die Maschine hat heute Nacht gearbeitet. Abstecher von C1, mündet in C2
 * (khpl-tag-zimmerer.md 6, C1.1).
 *
 * **Der Screen, der `technik: 0.5` belegt.** Ohne ihn wirbt der Trichter mit
 * etwas, das im Tag nicht vorkommt (khpl-tag-zimmerer.md 8).
 *
 * **Kein Übungselement** — Lesescreen mit zwei Begriffs-Popovern (`CAD` und
 * `Abbundanlage`; beide stehen schon im gemeinsamen Bestand und werden hier
 * eingelöst).
 *
 * Das Material ist `INTERVIEW`, nicht ausgedacht: 3D-Aufmaße mit Laserscanner,
 * CAD/CAM, Abbundzentren, **Nagelbrücken**, dazu SEMA und AutoCAD beim Namen.
 * Die Nagelbrücke gehört zwingend hierher, weil sie die Maschine *dieses*
 * Tages ist: sie nagelt die Beplankung auf das Ständerwerk, also genau das,
 * was in C3 passiert. Die Abbundanlage kennt jeder Zimmerei-Text; die
 * Nagelbrücke ist der Beleg dafür, dass der Screen von Holzrahmenbau handelt
 * und nicht von einem Dachstuhl.
 *
 * **Der Schlusssatz steht mit Sprecher da, nicht als Merksatz.** Er ist die
 * Antwort eines Menschen auf die Frage, die ein Vierzehnjähriger 2026 stellt —
 * ohne Zuschreibung wäre er eine Prognose der App über die KI, mit
 * Zuschreibung ist er stärker, weil ihn jemand sagt, der den Beruf macht.
 */

// ---------------------------------------------------------------------------
// Text — gebündelt oben (flow 8.4). Alle drei Einträge `INTERVIEW`
// (khpl-tag-zimmerer.md 6, C1.1): der befragte Zimmerer zählt Abbundzentrum
// und Nagelbrücke von sich aus auf, der Zimmerermeister nennt die Programme
// beim Namen.
// ---------------------------------------------------------------------------

const MASCHINEN = [
  {
    name: 'Abbundzentrum',
    was: 'Macht den ganzen Zuschnitt: ablängen, Kerben fräsen, bohren, jedes Teil beschriften. Was morgens auf dem Tisch liegt, kommt von hier.',
  },
  {
    name: 'Nagelbrücke',
    was: 'Fährt über das liegende Ständerwerk und nagelt die Beplankung darauf. Genau das, was gleich mit deinem Element passiert.',
  },
  {
    name: 'SEMA und AutoCAD',
    was: 'So heißen die Programme, in denen gezeichnet wird. Ein Zimmerermeister nennt sie beim Namen, wenn man ihn fragt, was er den Tag über macht.',
  },
]

/**
 * Für die `Klappliste`: die Überschrift ist hier der Maschinenname, der Text
 * das, was sie tut. Hochkant stand nur die Hälfte davon über der Scrollkante
 * und das Schlusszitat gar nicht mehr (Sichtbefund C1.1, 267 px Rest) — jetzt
 * stehen alle drei Namen, und was eine Maschine tut, kommt auf Tipp.
 */
const MASCHINEN_FELDER: Abschnitt[] = MASCHINEN.map((m) => ({
  frage: m.name,
  antwort: m.was,
}))

export function C11() {
  return (
    <StepShell
      id="C1.1"
      titelZusatz="Abstecher"
      // Quer 52 statt 44 rem: in der schmalen Spalte begann das Zitat unter
      // der Scrollkante, während rechts eine halbe Fotowand leer stand
      // (Sichtbefund C1.1 quer, 69 px Rest).
      karteBreit
      interaktionOffen={false}
      buehne={<StepFoto id="C1.1" />}
      fachtext={
        <p>
          Das Klischee vom Zimmermann mit dem Beil gegen die Realität: digitales Aufmaß —
          auf der Baustelle mit dem Laserscanner —, daraus ein{' '}
          <Begriff id="cad">CAD</Begriff>-Modell, daraus die Abbundliste. Die{' '}
          <Begriff id="abbundanlage">Abbundanlage</Begriff> macht daraus über Nacht einen
          Stapel fertiger Hölzer.
        </p>
      }
      interaktion={
        <div className="flex flex-col gap-2.5">
          {/* Ohne offenen ersten Eintrag: über der Liste steht schon der
              Absatz mit den beiden Begriffen, der Screen fängt also nicht mit
              zugeklappten Zeilen an — und die drei gewonnenen Zeilen sind
              genau die, die das Zitat über die Scrollkante holen.

              Quer drei Spalten, eine je Maschine: untereinander waren die drei
              Felder 285 px hoch und schoben das Zitat unter die Kante, während
              rechts eine halbe Fotowand leer stand. Nebeneinander ist es
              ohnehin die richtige Figur — drei Maschinen, keine Rangfolge. */}
          <Klappliste
            kennung="c11"
            abschnitte={MASCHINEN_FELDER}
            spaltenQuer={3}
            ersterOffen={false}
          />

          {/* Zitat, nicht Merksatz: der Satz gehört der Person, die ihn gesagt
              hat. Deshalb Anführungszeichen, Sprecherzeile und die orange
              Kante links statt einer Aussage im Fließtext.

              Dialekt behutsam geglättet („’n“ → „einen“) — dieselbe Linie wie in
              C5 und C5.1, und die, die die Spec selbst fährt, wenn sie den
              Sicherheitssatz aus dem Transkript („is“) als „ist“ zitiert. Nichts
              hinzugefügt, nichts weggelassen. */}
          <figure
            data-testid="c11-zitat"
            className="border-l-4 border-kh-orange/60 pt-1 pb-1 pl-4"
          >
            <blockquote className="text-[1.125rem] leading-[1.45] text-kh-paper sm:text-[1.1875rem]">
              „Das Aufschlagen eines Daches, das wird wahrscheinlich nie irgendwo die KI
              oder ein 3D-Drucker übernehmen. Das wird immer Handarbeit bleiben.“
            </blockquote>
            <figcaption className="mt-1.5 text-[0.9375rem] text-kh-mute">
              Ein erfahrener Zimmerer, im Gespräch
            </figcaption>
          </figure>
        </div>
      }
      aha={
        <AhaKarte sichtbar eyebrow="Und wer sagt der Maschine, was sie tun soll?">
          Ein Mensch. Das Aufmaß auf der Baustelle, das Modell am Rechner, die Abbundliste
          — bevor die Anlage anfängt, hat jemand die ganze Wand einmal im Kopf gebaut.
        </AhaKarte>
      }
      fuss={<StepFuss id="C1.1" />}
    />
  )
}
