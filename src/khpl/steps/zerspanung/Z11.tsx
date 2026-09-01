import { StepFoto } from '@/khpl/buehne/Foto'
import { Themenkarten } from '@/khpl/komponenten/Themenkarten'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'

/**
 * Z1.1 — Warum so pingelig? Abstecher von Z1, mündet in Z2.
 *
 * **Der Muster-Screen für die geführte Abstecher-Form** (`Themenkarten`):
 * Die Leitfrage steht als Titel auf der Bühne, das `warum` beantwortet sie in
 * zwei Sätzen mit Alltagsanker, eine Brückenzeile führt zur Wahl, und jede
 * Karte trägt ihr Wort **plus** einen Teaser. Die Vorfassung zeigte nur „Tipp
 * an, was dich interessiert“ über drei nackten Wörtern („Mit Luft“, „Satt“,
 * „Fest“) — ohne jeden Grund, eines davon anzutippen; der Kontext-Absatz war
 * als Übungs-Step sogar ausgeblendet. Deshalb jetzt `auftrag={null}`: ein
 * Lese-Step, das Warum steht offen da.
 *
 * **Fachlich:** Spiel-, Übergangs- und Übermaßpassung (Presspassung) sind
 * die drei Passungsarten nach ISO 286 — Lehrbuchwissen, zeitstabil. Die
 * Beispiele sind bewusst aus der Alltagswelt gewählt.
 */

const ARTEN = [
  {
    id: 'spiel',
    wort: 'Mit Luft',
    teaser: 'das Teil kann sich drehen, wie ein Rad auf der Achse',
    text: 'Spielpassung: die Bohrung ist einen Hauch größer als die Welle. Das Teil kann gleiten und sich drehen — ein Rad auf seiner Achse, ein Bolzen im Gelenk. Die Luft ist gewollt und genau bemessen.',
  },
  {
    id: 'uebergang',
    wort: 'Satt',
    teaser: 'sitzt stramm, geht mit Kraft aber wieder ab',
    text: 'Übergangspassung: fast keine Luft, mal ein Hauch Spiel, mal ein Hauch Übermaß. Das Teil sitzt fühlbar satt und lässt sich mit Kraft fügen und wieder lösen — so sitzt ein Kugellager auf seinem Sitz.',
  },
  {
    id: 'press',
    wort: 'Fest',
    teaser: 'hält für immer — ohne Schraube, ohne Kleber',
    text: 'Presspassung: die Welle ist minimal dicker als die Bohrung. Zusammengepresst hält das für immer — ohne Schraube, ohne Kleber. Ein Zahnkranz auf seiner Nabe kommt so nie wieder ab.',
  },
] as const

export function Z11() {
  return (
    <StepShell
      id="Z1.1"
      auftrag={null}
      ansage={null}
      titelZusatz="Abstecher"
      interaktionOffen={false}
      buehne={<StepFoto id="Z1.1" />}
      warum={
        <p>
          Ein paar Tausendstel Millimeter — viel dünner als ein Haar. Trotzdem entscheiden
          sie, ob sich ein Rad frei dreht oder ein Zahnrad für immer festsitzt. Genau das
          stellst du an der Maschine ein.
        </p>
      }
      interaktion={
        <Themenkarten
          kennung="z11"
          bruecke="Dafür gibt es drei Arten, wie zwei Teile zusammensitzen:"
          themen={ARTEN}
        />
      }
      fuss={<StepFuss id="Z1.1" />}
    />
  )
}
