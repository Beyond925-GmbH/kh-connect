import { useState } from 'react'
import { Check } from 'lucide-react'
import { StepFoto } from '@/khpl/buehne/Foto'
import { Wahlflaeche } from '@/khpl/komponenten/Wahlflaeche'
import { Wechsel } from '@/khpl/komponenten/Wechsel'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'

/**
 * Z6.1 — Wo landen deine Teile? Abstecher von Z6, mündet in Z7.
 *
 * Der Sinn-Beat dieses Tages: das unsichtbare Teil, ohne das sich nichts
 * dreht — und der Kreislauf dahinter. Dass Stahlspäne kein Müll sind,
 * sondern sortenrein eingeschmolzen werden, ist Standard der Branche und
 * für die meisten Besucher eine echte Neuigkeit.
 */

const ZIELE = [
  {
    id: 'teile',
    label: 'Die Teile',
    text: 'Dein Bolzen verschwindet in einem Getriebe, das Getriebe in einer Maschine. Niemand wird ihn je sehen — aber ohne ihn dreht sich nichts. Fast alles, was fährt, hebt oder Strom erzeugt, ist innen voll mit solchen Teilen.',
  },
  {
    id: 'spaene',
    label: 'Die Späne',
    text: 'Kein Müll: Stahlspäne werden sortenrein gesammelt, ausgeschleudert und eingeschmolzen — daraus wird wieder Stahl, beliebig oft. Ein Teil deiner heutigen Späne ist irgendwann wieder Stangenmaterial.',
  },
  {
    id: 'kss',
    label: 'Der Kühlschmierstoff',
    text: 'Das Milchige läuft im Kreis: auffangen, filtern, zurück auf die Schneide — wochenlang dieselbe Füllung. Beim Ausschleudern der Späne wird er zurückgewonnen; erst wenn er verbraucht ist, wird er fachgerecht entsorgt.',
  },
] as const

type ZielId = (typeof ZIELE)[number]['id']

export function Z61() {
  const [offen, setOffen] = useState<ZielId | null>(null)
  const [gelesen, setGelesen] = useState<ZielId[]>([])

  const waehle = (id: ZielId) => {
    setOffen((alt) => (alt === id ? null : id))
    setGelesen((g) => (g.includes(id) ? g : [...g, id]))
  }

  const ziel = ZIELE.find((z) => z.id === offen)

  return (
    <StepShell
      id="Z6.1"
      auftrag={'Tipp an, was dich interessiert.'}
      ansage={null}
      titelZusatz="Abstecher"
      interaktionOffen={false}
      buehne={<StepFoto id="Z6.1" />}
      warum={
        <p>
          Aus einer Stange werden 200 Teile, ein Berg Späne und eine Wanne voll
          Kühlschmierstoff. Alles drei hat einen Weg — und keiner endet im Müll.
        </p>
      }
      interaktion={
        <div className="flex flex-col gap-2.5">
          <div className="flex flex-wrap gap-2">
            {ZIELE.map((z) => (
              <Wahlflaeche
                key={z.id}
                onClick={() => waehle(z.id)}
                gewaehlt={offen === z.id}
                data-testid={`z61-${z.id}`}
                className="w-auto flex-1 justify-center rounded-kh-pill font-semibold"
              >
                {gelesen.includes(z.id) && offen !== z.id && (
                  <Check
                    className="size-4 shrink-0 text-kh-signal"
                    strokeWidth={3}
                    aria-hidden
                  />
                )}
                {z.label}
              </Wahlflaeche>
            ))}
          </div>

          <Wechsel takt={offen ?? 'nichts'}>
            {ziel ? (
              <p
                data-auswaehlbar
                data-testid="z61-text"
                className="kh-feld px-4 py-3 text-[1.0625rem] leading-[1.45] text-kh-paper/90"
              >
                {ziel.text}
              </p>
            ) : null}
          </Wechsel>
        </div>
      }
      fuss={<StepFuss id="Z6.1" />}
    />
  )
}
