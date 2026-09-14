import { useEffect, useRef, useState } from 'react'
import { FRAGEN } from '@/khpl/match/fragen'
import { merkeFrage, useSitzung, zeigeBerufe } from '@/khpl/store/fortschritt'
import { Bildwahl } from './fragen/Bildwahl'
import { Radio } from './fragen/Radio'
import { NeustartKnopf } from './Neustart'
import { blendeMusik } from './musik-store'

/** Beim Reload nur offene Stationen zeigen. Radio und Bildantworten gehören der Sitzung. */
export function Fragen() {
  const gefragt = useSitzung().gefragt
  const [index, setIndex] = useState(() => FRAGEN.findIndex((f) => !gefragt[f.id]))
  const [gewaehlt, setGewaehlt] = useState<string | null>(null)
  const sperre = useRef(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const titel = useRef<HTMLHeadingElement>(null)

  useEffect(
    () => () => {
      if (timer.current !== null) clearTimeout(timer.current)
    },
    [],
  )
  useEffect(() => {
    if (index < 0) zeigeBerufe()
    else {
      titel.current?.focus()
      if (FRAGEN[index].art === 'bilder') {
        const bildfragen = FRAGEN.filter((f) => f.art === 'bilder')
        const position = bildfragen.indexOf(FRAGEN[index])
        blendeMusik(1 - (0.8 * (position + 1)) / bildfragen.length)
      }
    }
  }, [index])

  const frage = FRAGEN[index]
  if (!frage) return null

  const antworte = (antwortId: string) => {
    if (sperre.current) return
    sperre.current = true
    setGewaehlt(antwortId)
    merkeFrage(frage.id, antwortId)
    if (!FRAGEN.some((f, i) => i > index && !gefragt[f.id])) blendeMusik(0, 0.25)
    timer.current = setTimeout(() => {
      const naechste = FRAGEN.findIndex((f, i) => i > index && !gefragt[f.id])
      setGewaehlt(null)
      sperre.current = false
      setIndex(naechste)
    }, 300)
  }

  return (
    <div
      data-testid="fragen"
      className="kh-screen flex flex-col bg-kh-ink p-4 landscape:p-6"
    >
      <header className="mb-3 flex shrink-0 items-center justify-between gap-3">
        <span className="kh-etikett">
          Dein Einstieg · {index + 1} / {FRAGEN.length}
        </span>
        <NeustartKnopf />
      </header>
      <div className="min-h-0 flex-1">
        {frage.art === 'radio' ? (
          <Radio key={frage.id} frage={frage} onFertig={antworte} />
        ) : (
          <Bildwahl
            key={frage.id}
            frage={frage}
            gewaehlt={gewaehlt}
            onWahl={antworte}
            titelRef={titel}
          />
        )}
      </div>
    </div>
  )
}
