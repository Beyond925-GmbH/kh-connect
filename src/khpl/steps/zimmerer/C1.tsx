import { lazy, Suspense } from 'react'
import { Check } from 'lucide-react'
import { Dachstuhl3DFallback } from '@/khpl/buehne/Dachstuhl3DFallback'
import { StepShell } from '@/khpl/shell/StepShell'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { merkeAntwort, useFortschritt } from '@/khpl/store/fortschritt'
const Wandelement3D = lazy(() => import('@/khpl/buehne/zimmerer/Wandelement3D'))
const HOELZER = [
  { id: 'hell', name: 'Ein Strich', farbe: '#DDC192', striche: 1 },
  { id: 'warm', name: 'Zwei Striche', farbe: '#BC8F59', striche: 2 },
  { id: 'dunkel', name: 'Drei Striche', farbe: '#A47746', striche: 3 },
]
export function C1() {
  const antwort = useFortschritt().answers.c1
  const holzId = antwort?.holzId
  const waehle = (id: string) =>
    merkeAntwort('c1', { gefunden: true, versuche: 0, holzId: id })
  return (
    <StepShell
      id="C1"
      auftrag="Wähle dein Holz. Alle drei passen."
      ansage={null}
      buehneInteraktiv
      interaktionOffen={!holzId}
      buehne={
        <Suspense fallback={<Dachstuhl3DFallback text="Dein Holz liegt bereit" />}>
          <Wandelement3D zustand="stapel" holzWahl onHolzWahl={waehle} />
        </Suspense>
      }
      warum={
        <p>
          Das ist dein Einstieg. Deine Markierung begleitet dich bis zur fertigen Wand.
        </p>
      }
      interaktion={
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-3 gap-2">
            {HOELZER.map((holz) => (
              <button
                type="button"
                key={holz.id}
                aria-pressed={holzId === holz.id}
                onClick={() => waehle(holz.id)}
                data-testid={`c1-holz-${holz.id}`}
                className={`min-h-[80px] rounded-kh border-2 px-3 py-3 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-kh-signal ${holzId === holz.id ? 'border-kh-signal bg-kh-signal/10' : 'border-kh-line bg-white/5'}`}
              >
                <span
                  aria-hidden
                  className="mb-2 flex h-6 items-center justify-center gap-1 rounded"
                  style={{ backgroundColor: holz.farbe }}
                >
                  {Array.from({ length: holz.striche }, (_, i) => (
                    <span key={i} className="h-4 w-1 bg-[#312516]" />
                  ))}
                </span>
                <span className="text-[1rem] font-semibold">{holz.name}</span>
              </button>
            ))}
          </div>
          <p role="status" className="flex items-center gap-2 text-kh-signal">
            {holzId ? (
              <>
                <Check className="size-5" />
                Markiert. Damit baust du weiter.
              </>
            ) : (
              'Welche Markierung möchtest du?'
            )}
          </p>
        </div>
      }
      fuss={
        <StepFuss
          id="C1"
          uebungOffen={!holzId}
          geschafft={holzId ? 'Dein Holz ist markiert' : null}
        />
      }
    />
  )
}
