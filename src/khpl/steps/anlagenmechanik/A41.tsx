import { StepFoto } from '@/khpl/buehne/Foto'
import { Themenkarten } from '@/khpl/komponenten/Themenkarten'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'

/**
 * A4.1 — Löten, pressen, stecken. Abstecher von A4, mündet in A5.
 *
 * Drei Arten, zwei Rohre zu verbinden — und wann was.
 *
 * **Geführte Abstecher-Form** (`Themenkarten`, Muster: Z1.1): offenes Warum
 * mit Alltagsanker (die undichte Verbindung hinter der Badezimmerwand),
 * Brückenzeile, Karten mit Teaser. Die Vorfassung zeigte drei nackte Wörter
 * unter „Tipp an, was dich interessiert“ — und blendete als Übungs-Step den
 * Kontext-Absatz aus. Deshalb jetzt `auftrag={null}`: ein Lese-Step.
 *
 * **Die drei Beschreibungen gehören fachlich gegengelesen.** Sie sind
 * bewusst **zahlenfrei und normfrei** formuliert: kein Durchmesser, kein
 * Temperaturbereich, kein Regelwerk. Was hier steht, ist die Sache in der
 * Sprache eines Vierzehnjährigen — alles Genauere gehört in ein Gegenlesen,
 * nicht auf diesen Screen.
 *
 * Belegt ist eine Kleinigkeit, und sie kommt aus den Gesprächen: **das
 * Werkzeug läuft mit Akku** — im Interview ausdrücklich als akkubetriebene
 * Geräte benannt.
 *
 * ⚠️ Bühne: `gallery-2.webp` (Rohrverteiler). **Passt nur halb** — das Motiv
 * zeigt das Ergebnis, nicht den Handgriff. Bis ein besseres Motiv vorliegt,
 * trägt es den Screen.
 */

/*
  Ohne unerklärte Werkstattwörter: „Lot" heißt hier Lötzinn, „Fitting"
  Verbindungsstück, und „entgraten" bekommt seinen Handgriff mitgeliefert.
  Wer den Screen liest, lernt die Sache — die Fachnamen kommen im Betrieb von
  selbst.
*/
const ARTEN = [
  {
    id: 'loeten',
    wort: 'Löten',
    teaser: 'mit Flamme und flüssigem Zinn — hält, solange das Haus steht',
    text: 'Zwei Kupferteile ineinander, Flamme drauf, Lötzinn dazu. Das geschmolzene Zinn läuft von selbst in den Spalt und dichtet ihn. Hält, solange das Haus steht — braucht aber Übung und eine offene Flamme.',
  },
  {
    id: 'pressen',
    wort: 'Pressen',
    teaser: 'ein Druck mit der Zange, und es ist dicht — der Normalfall',
    text: 'Verbindungsstück aufs Rohr schieben, Zange ansetzen, ein Druck — und es ist dicht. Schnell, ohne Flamme, auch da möglich, wo Holz neben der Leitung liegt. Der Normalfall.',
  },
  {
    id: 'stecken',
    wort: 'Stecken',
    teaser: 'einfach reinschieben, es rastet ein — schnell, aber teuer',
    text: 'Rohr auf Länge schneiden, die scharfe Kante abfeilen — entgraten heißt das —, dann ins Verbindungsstück schieben. Es rastet ein und hält. Der schnellste Weg, und je Verbindung der teuerste.',
  },
] as const

export function A41() {
  return (
    <StepShell
      id="A4.1"
      auftrag={null}
      ansage={null}
      titelZusatz="Abstecher"
      interaktionOffen={false}
      buehne={<StepFoto id="A4.1" />}
      warum={
        <p>
          Hinter deiner Badezimmerwand laufen Rohre, Verbindung an Verbindung. Jede
          einzelne muss dicht sein — tropft eine, hat der Nachbar unter dir einen nassen
          Fleck an der Decke. Was genommen wird, entscheiden Werkstoff, Ort und Platz.
        </p>
      }
      interaktion={
        <Themenkarten
          kennung="a41"
          bruecke="Drei Arten gibt es, zwei Rohre zu verbinden:"
          themen={ARTEN}
        />
      }
      fuss={<StepFuss id="A4.1" />}
    />
  )
}
