import { StepFoto } from '@/khpl/buehne/Foto'
import { AhaKarte } from '@/khpl/komponenten/AhaKarte'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { Begriff } from './Begriff'
import { Themenkarten } from '@/khpl/komponenten/Themenkarten'

/**
 * C1.1 — Die Maschine hat heute Nacht gearbeitet. Abstecher von C1, mündet in
 * C2.
 *
 * **Der Screen, der `technik: 0.5` belegt.** Ohne ihn wirbt der Trichter mit
 * etwas, das im Tag nicht vorkommt.
 *
 * **Kein Übungselement** — Lesescreen mit zwei Begriffs-Popovern (`CAD` und
 * `Abbundanlage`; beide stehen schon im gemeinsamen Bestand und werden hier
 * eingelöst).
 *
 * Das Material stammt aus den Interviews, nicht aus der Fantasie: 3D-Aufmaße mit Laserscanner,
 * CAD/CAM, Abbundzentren, **Nagelbrücken**, dazu SEMA und AutoCAD beim Namen.
 * Die Nagelbrücke gehört zwingend hierher, weil sie die Maschine *dieses*
 * Tages ist: sie nagelt die Beplankung auf das Ständerwerk, also genau das,
 * was in C3 passiert. Die Abbundanlage kennt jeder Zimmerei-Text; die
 * Nagelbrücke ist der Beleg dafür, dass der Screen von Holzrahmenbau handelt
 * und nicht von einem Dachstuhl.
 *
 * **Die Maschinen stehen als `Themenkarten`, nicht mehr als `Klappliste`**
 * (geführte Abstecher-Form, Muster: Z1.1): „Nagelbrücke“ oder „SEMA und
 * AutoCAD“ waren als nackte Zeilen genau die rätselhaften Tap-Ziele, gegen
 * die die Form angetreten ist — jetzt sagt ein Teaser je Karte, warum sich
 * das Antippen lohnt. Die Platzgründe der Klappliste (Sichtbefund C1.1:
 * hochkant lagen 267 px unter der Scrollkante, das Zitat fehlte ganz) gelten
 * weiter und sind mitgenommen: Namen und Teaser bleiben sichtbar, der Text
 * kommt auf Tipp, quer liegen die drei Karten in drei Spalten.
 *
 * **Der Schlusssatz steht mit Sprecher da, nicht als Merksatz.** Er ist die
 * Antwort eines Menschen auf die Frage, die ein Vierzehnjähriger 2026 stellt —
 * ohne Zuschreibung wäre er eine Prognose der App über die KI, mit
 * Zuschreibung ist er stärker, weil ihn jemand sagt, der den Beruf macht.
 */

// ---------------------------------------------------------------------------
// Text — gebündelt oben in der Datei. Alle drei Einträge stammen aus den
// Interviews: der befragte Zimmerer zählt Abbundzentrum und Nagelbrücke von
// sich aus auf, der Zimmerermeister nennt die Programme beim Namen.
// ---------------------------------------------------------------------------

const MASCHINEN = [
  {
    id: 'abbund',
    wort: 'Abbundzentrum',
    teaser: 'sägt, fräst und beschriftet über Nacht jedes Holz',
    text: 'Sägt jedes Holz auf die richtige Länge, fräst die Kerben, bohrt die Löcher und schreibt die Nummer drauf. Was morgens auf dem Tisch liegt, kommt von hier.',
  },
  {
    id: 'nagelbruecke',
    wort: 'Nagelbrücke',
    teaser: 'nagelt die Platten auf die Wand — gleich siehst du das',
    text: 'Der Holzrahmen liegt flach am Boden. Die Maschine fährt darüber und nagelt die Platten drauf. Genau das passiert gleich mit deiner Wand.',
  },
  {
    id: 'programme',
    wort: 'SEMA und AutoCAD',
    teaser: 'die Zeichenprogramme — hier entsteht jede Wand zuerst',
    text: 'So heißen die Programme, in denen gezeichnet wird. Ein Zimmerermeister nennt sie beim Namen, wenn man ihn fragt, was er den Tag über macht.',
  },
] as const

export function C11() {
  return (
    <StepShell
      id="C1.1"
      auftrag={null}
      ansage={null}
      titelZusatz="Abstecher"
      // Quer 52 statt 44 rem: in der schmalen Spalte begann das Zitat unter
      // der Scrollkante, während rechts eine halbe Fotowand leer stand
      // (Sichtbefund C1.1 quer, 69 px Rest).
      karteBreit
      interaktionOffen={false}
      buehne={<StepFoto id="C1.1" />}
      warum={
        <p>
          Viele denken beim Zimmermann an ein Beil. In Wirklichkeit wird die Baustelle mit
          einem Laser ausgemessen und die Wand am Computer gezeichnet. Aus dieser
          Zeichnung sägt die <Begriff id="abbundanlage">Abbundanlage</Begriff> über Nacht
          einen Stapel fertiger Hölzer.
        </p>
      }
      interaktion={
        <div className="flex flex-col gap-2.5">
          {/* Quer drei Spalten, eine je Maschine: untereinander schoben die
              drei ausgeschriebenen Felder das Zitat unter die Kante, während
              rechts eine halbe Fotowand leer stand. Nebeneinander ist es
              ohnehin die richtige Figur — drei Maschinen, keine Rangfolge. */}
          <Themenkarten
            kennung="c11"
            bruecke="Drei Maschinen solltest du mit Namen kennen:"
            themen={MASCHINEN}
            spaltenQuer={3}
          />

          {/* Zitat, nicht Merksatz: der Satz gehört der Person, die ihn gesagt
              hat. Deshalb Anführungszeichen, Sprecherzeile und die orange
              Kante links statt einer Aussage im Fließtext.

              Dialekt behutsam geglättet („’n“ → „einen“) — dieselbe Linie wie in
              C5 und C5.1, wo der Sicherheitssatz aus dem Transkript („is“) als
              „ist“ zitiert wird. Nichts hinzugefügt, nichts weggelassen. */}
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
          Ein Mensch. Erst wird auf der Baustelle gemessen, dann wird am Computer
          gezeichnet, dann bekommt die Maschine ihre Liste. Bevor sie anfängt, hat jemand
          die ganze Wand einmal im Kopf gebaut.
        </AhaKarte>
      }
      fuss={<StepFuss id="C1.1" />}
    />
  )
}
