import { useState } from 'react'
import { Phone, BookOpen, Hand } from 'lucide-react'
import { Schnitt } from '@/khpl/buehne/anlagenmechanik/Schnitt'
import { Rueckmeldung } from '@/khpl/komponenten/Rueckmeldung'
import { Wahlflaeche } from '@/khpl/komponenten/Wahlflaeche'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { merkeAntwort, useFortschritt } from '@/khpl/store/fortschritt'

const ANTWORTEN = [
  { id: 'anleitung', icon: BookOpen, text: 'Das steht alles in der Anleitung.' },
  { id: 'anrufen', icon: Phone, text: 'Notieren Sie die Meldung und rufen Sie uns an.' },
  { id: 'abwarten', icon: Hand, text: 'Warten Sie einfach ab.' },
]
export function A7() {
  const f = useFortschritt()
  const [fertig, setFertig] = useState((f.answers.a7?.gut ?? 0) > 0)
  const [fehler, setFehler] = useState(false)
  function antworte(id: string) {
    if (fertig) return
    const ok = id === 'anrufen'
    setFertig(ok)
    setFehler(!ok)
    merkeAntwort('a7', { beantwortet: ['blinkt'], gut: ok ? 1 : 0 })
  }
  return (
    <StepShell
      id="A7"
      auftrag={fertig ? null : 'Hilf der Kundin mit einer verständlichen Antwort.'}
      ansage={null}
      interaktionOffen={!fertig}
      buehne={
        <Schnitt zustand={{ szene: 'uebergabe', pfad: f.answers.a4?.pfad ?? [] }} />
      }
      interaktion={
        <div className="flex flex-col gap-3">
          <p className="text-kh-paper/80">
            Zum Beruf gehört auch, die Anlage zu erklären.
          </p>
          <p className="border-l-4 border-kh-signal pl-3 text-xl leading-snug text-kh-paper">
            „Was mache ich, wenn eine Fehlermeldung erscheint?“
          </p>
          {!fertig &&
            ANTWORTEN.map((a) => (
              <Wahlflaeche
                key={a.id}
                onClick={() => antworte(a.id)}
                data-testid={`a7-antwort-${a.id}`}
                className={`min-h-16 ${fehler && a.id === 'anrufen' ? 'ring-2 ring-kh-signal' : ''}`}
              >
                <a.icon className="size-7 shrink-0" aria-hidden />
                {a.text}
              </Wahlflaeche>
            ))}
          <Rueckmeldung
            ok={fertig ? true : fehler ? false : null}
            text={
              fertig
                ? '„Gut, dann weiß ich, was ich tun kann.“ Die Kundin speichert eure Telefonnummer.'
                : fehler
                  ? 'Gib ihr einen konkreten nächsten Schritt: Meldung notieren und euren Betrieb anrufen.'
                  : null
            }
          />
        </div>
      }
      fuss={
        <StepFuss
          id="A7"
          uebungOffen={!fertig}
          geschafft={fertig ? 'Kundin beraten' : null}
        />
      }
    />
  )
}
