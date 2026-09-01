import { StepFoto } from '@/khpl/buehne/Foto'
import { Themenkarten } from '@/khpl/komponenten/Themenkarten'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'

/**
 * Z3.1 — Ein Tippfehler in Stahl. Abstecher von Z3, mündet in Z4.
 *
 * Der Preis eines Fehlers in diesem Beruf: kein nasser Kunde, kein zweiter
 * Anfahrtsweg — ein Crash in der Maschine. Und die Antwort des Berufs
 * darauf ist keine Angst, sondern ein Verfahren: simulieren, einfahren,
 * erst dann Tempo.
 *
 * **Geführte Abstecher-Form** (`Themenkarten`, Muster: Z1.1): Titel als
 * Leitfrage, offenes Warum mit dem Haken, Brückenzeile, Karten mit Teaser.
 * Das Warum knüpft an die Pointe des neuen Z3 an („Die Maschine macht nur,
 * was da steht“) und an G0/G1 von dort — der Tippfehler ist die Kehrseite
 * genau dieser Einsicht. Bewusst **ohne** „du hast es gerade gesehen“: über
 * Überspringen kommt man auch ohne die Programmfahrt hierher.
 *
 * ⚠️ Die Schadenshöhe steht bewusst weich da („schnell in die Tausende“) —
 * ein konkreter Betrag wäre erfunden und hinge ohnehin an Maschine und
 * Treffer.
 */

const SCHRITTE = [
  {
    id: 'simulieren',
    wort: 'Simulieren',
    teaser: 'erst läuft alles am Bildschirm — da kostet ein Fehler nichts',
    text: 'Bevor die Maschine echtes Material sieht, läuft das Programm auf dem Bildschirm: die Steuerung zeichnet jeden Weg vor. Ein Satz, der ins Futter zeigt, fällt hier auf — und kostet nichts.',
  },
  {
    id: 'einfahren',
    wort: 'Einfahren',
    teaser: 'das erste Teil ganz langsam, die Hand am Stopp',
    text: 'Das erste Teil fährt man langsam: Satz für Satz, mit heruntergedrehtem Vorschub, die Hand am Stopp. Erst wenn jeder Weg stimmt, darf das Programm in echtem Tempo laufen.',
  },
  {
    id: 'krachen',
    wort: 'Wenn es kracht',
    teaser: 'was ein Crash kostet — und warum er so selten ist',
    text: 'Treffen sich Werkzeug und Futter, ist in einer Zehntelsekunde Schluss: Schneide ab, im schlimmsten Fall die Spindel beschädigt. Der Schaden geht schnell in die Tausende — genau deshalb gibt es die ersten beiden Schritte.',
  },
] as const

export function Z31() {
  return (
    <StepShell
      id="Z3.1"
      auftrag={null}
      ansage={null}
      titelZusatz="Abstecher"
      interaktionOffen={false}
      buehne={<StepFoto id="Z3.1" />}
      warum={
        <p>
          Die Maschine macht nur, was im Programm steht. Ein Buchstabe falsch — G0 statt
          G1 — und das Werkzeug rast mit vollem Tempo dorthin, wo es langsam schneiden
          sollte. Dagegen hat dieser Beruf ein festes Verfahren.
        </p>
      }
      interaktion={
        <Themenkarten
          kennung="z31"
          bruecke="So läuft es — und so teuer wird es ohne:"
          themen={SCHRITTE}
        />
      }
      fuss={<StepFuss id="Z3.1" />}
    />
  )
}
