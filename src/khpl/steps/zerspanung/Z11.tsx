import { useState } from 'react'
import { Check } from 'lucide-react'
import { StepFoto } from '@/khpl/buehne/Foto'
import { Wahlflaeche } from '@/khpl/komponenten/Wahlflaeche'
import { Wechsel } from '@/khpl/komponenten/Wechsel'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'

/**
 * Z1.1 — Warum so pingelig? Abstecher von Z1, mündet in Z2.
 *
 * Die drei Arten, wie zwei Teile zusammensitzen können — dieselbe ruhige
 * Form wie „Löten, pressen, stecken“ (A4.1): ein Tap je Art, die Antwort
 * ersetzt die vorige. Kein zweiter Übungsscreen.
 *
 * **Fachlich:** Spiel-, Übergangs- und Übermaßpassung (Presspassung) sind
 * die drei Passungsarten nach ISO 286 — Lehrbuchwissen, zeitstabil. Die
 * Beispiele sind bewusst aus der Alltagswelt gewählt.
 *
 * Die Labels tragen das Alltagsbeispiel, nicht die Kategorie: „Mit Luft /
 * Satt / Fest“ hieß vor dem Tippen gar nichts (Review 31.08.). Das Objekt
 * mit seinem Verhalten lädt ein — der Fachbegriff steht im Text dahinter.
 */

const ARTEN = [
  {
    id: 'spiel',
    label: 'Rad — dreht sich',
    text: 'Spielpassung: die Bohrung ist einen Hauch größer als die Welle. Das Teil gleitet und dreht sich — ein Rad auf seiner Achse, ein Bolzen im Gelenk. Die Luft ist gewollt und genau bemessen.',
  },
  {
    id: 'uebergang',
    label: 'Kugellager — sitzt satt',
    text: 'Übergangspassung: fast keine Luft, mal ein Hauch Spiel, mal ein Hauch Übermaß. Das Teil sitzt fühlbar satt und lässt sich mit Kraft fügen und wieder lösen — so kommt ein Kugellager auf seine Welle.',
  },
  {
    id: 'press',
    label: 'Zahnkranz — hält für immer',
    text: 'Presspassung: die Welle ist minimal dicker als die Bohrung. Zusammengepresst hält das ohne Schraube, ohne Kleber — ein Zahnkranz auf seiner Nabe kommt nie wieder ab.',
  },
] as const

type ArtId = (typeof ARTEN)[number]['id']

export function Z11() {
  const [offen, setOffen] = useState<ArtId | null>(null)
  const [gelesen, setGelesen] = useState<ArtId[]>([])

  const waehle = (id: ArtId) => {
    setOffen((alt) => (alt === id ? null : id))
    setGelesen((g) => (g.includes(id) ? g : [...g, id]))
  }

  const art = ARTEN.find((a) => a.id === offen)

  return (
    <StepShell
      id="Z1.1"
      auftrag={'Tipp an, was dich interessiert.'}
      ansage={null}
      interaktionOffen={false}
      buehne={<StepFoto id="Z1.1" />}
      warum={
        <p>
          Ob ein Teil gleitet, satt sitzt oder für immer hält, entscheiden ein paar
          Tausendstel Millimeter. Drei Arten, wie zwei Teile zusammenkommen — alle drei
          fertigst du auf derselben Maschine.
        </p>
      }
      interaktion={
        <div className="flex flex-col gap-2.5">
          <div className="flex flex-wrap gap-2">
            {ARTEN.map((a) => (
              <Wahlflaeche
                key={a.id}
                onClick={() => waehle(a.id)}
                gewaehlt={offen === a.id}
                data-testid={`z11-${a.id}`}
                className="w-auto flex-1 justify-center rounded-kh-pill font-semibold"
              >
                {gelesen.includes(a.id) && offen !== a.id && (
                  <Check
                    className="size-4 shrink-0 text-kh-signal"
                    strokeWidth={3}
                    aria-hidden
                  />
                )}
                {a.label}
              </Wahlflaeche>
            ))}
          </div>

          <Wechsel takt={offen ?? 'nichts'}>
            {art ? (
              <p
                data-auswaehlbar
                data-testid="z11-text"
                className="kh-feld px-4 py-3 text-[1.0625rem] leading-[1.45] text-kh-paper/90"
              >
                {art.text}
              </p>
            ) : null}
          </Wechsel>
        </div>
      }
      fuss={<StepFuss id="Z1.1" />}
    />
  )
}
