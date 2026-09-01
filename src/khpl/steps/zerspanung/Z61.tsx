import { StepFoto } from '@/khpl/buehne/Foto'
import { Themenkarten } from '@/khpl/komponenten/Themenkarten'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'

/**
 * Z6.1 — Wo landen deine Teile? Abstecher von Z6, mündet in Z7.
 *
 * Der Sinn-Beat dieses Tages: das unsichtbare Teil, ohne das sich nichts
 * dreht — und der Kreislauf dahinter. Dass Stahlspäne kein Müll sind,
 * sondern sortenrein eingeschmolzen werden, ist Standard der Branche und
 * für die meisten Besucher eine echte Neuigkeit.
 *
 * **Geführte Abstecher-Form** (`Themenkarten`, Muster: Z1.1): Titel als
 * Leitfrage, offenes Warum mit Alltagsanker (Pfandflasche), Brückenzeile,
 * Karten mit Teaser statt dreier nackter Wörter.
 */

const ZIELE = [
  {
    id: 'teile',
    wort: 'Die Teile',
    teaser: 'dein Bolzen steckt am Ende in fast allem, was fährt oder hebt',
    text: 'Dein Bolzen verschwindet in einem Getriebe, das Getriebe in einer Maschine. Niemand wird ihn je sehen — aber ohne ihn dreht sich nichts. Fast alles, was fährt, hebt oder Strom erzeugt, ist innen voll mit solchen Teilen.',
  },
  {
    id: 'spaene',
    wort: 'Die Späne',
    teaser: 'werden eingeschmolzen und sind bald wieder Stahl',
    text: 'Kein Müll: Stahlspäne werden sortenrein gesammelt, ausgeschleudert und eingeschmolzen — daraus wird wieder Stahl, beliebig oft. Ein Teil deiner heutigen Späne ist irgendwann wieder Stangenmaterial.',
  },
  {
    id: 'kss',
    wort: 'Der Kühlschmierstoff',
    teaser: 'das Milchige läuft wochenlang im Kreis',
    text: 'Das Milchige läuft im Kreis: auffangen, filtern, zurück auf die Schneide — wochenlang dieselbe Füllung. Beim Ausschleudern der Späne wird er zurückgewonnen; erst wenn er verbraucht ist, wird er fachgerecht entsorgt.',
  },
] as const

export function Z61() {
  return (
    <StepShell
      id="Z6.1"
      auftrag={null}
      ansage={null}
      titelZusatz="Abstecher"
      interaktionOffen={false}
      buehne={<StepFoto id="Z6.1" />}
      warum={
        <p>
          Aus einer Stange werden 200 Teile, ein Berg Späne und eine Wanne voll
          Kühlschmierstoff. Nichts davon endet im Müll — Stahl läuft im Kreis wie eine
          Pfandflasche, nur dass er es beliebig oft kann.
        </p>
      }
      interaktion={
        <Themenkarten
          kennung="z61"
          bruecke="Drei Dinge verlassen heute die Halle:"
          themen={ZIELE}
        />
      }
      fuss={<StepFuss id="Z6.1" />}
    />
  )
}
