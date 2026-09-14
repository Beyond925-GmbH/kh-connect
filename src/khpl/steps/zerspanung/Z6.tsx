import { useState } from 'react'
import { Play, Wrench } from 'lucide-react'
import { StepFoto } from '@/khpl/buehne/Foto'
import { Rueckmeldung } from '@/khpl/komponenten/Rueckmeldung'
import { Wahlflaeche } from '@/khpl/komponenten/Wahlflaeche'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { merkeAntwort, useFortschritt } from '@/khpl/store/fortschritt'
import { Massbereich } from './Massbereich'

const PROBEN = [
  { stueck: 40, wert: 24.99 },
  { stueck: 120, wert: 25.02 },
  { stueck: 160, wert: 24.99 },
]
export function Z6() {
  const alt = useFortschritt().answers.z6
  const [index, setIndex] = useState(alt?.stabil ? 3 : 0)
  const [fehler, setFehler] = useState<string | null>(null)
  const [echo, setEcho] = useState<string | null>(null)
  const fertig = index === PROBEN.length
  const probe = PROBEN[Math.min(index, PROBEN.length - 1)]
  const brauchtKorrektur = index === 1
  function entscheide(korrigieren: boolean) {
    if (fertig) return
    if (korrigieren !== brauchtKorrektur) {
      setFehler(
        brauchtKorrektur
          ? 'Das Teil ist zu dick. Wähle „Nachstellen“, damit die nächsten Teile wieder passen.'
          : 'Der Strich steht im grünen Bereich. Das Teil passt. Du kannst weiterlaufen lassen.',
      )
      return
    }
    setFehler(null)
    setEcho(
      korrigieren
        ? 'Nachgestellt. Die nächste Probe zeigt, ob es wieder passt.'
        : 'Passt. Du kontrollierst die nächste Probe.',
    )
    const neu = index + 1
    setIndex(neu)
    merkeAntwort('z6', {
      stueck: probe.stueck,
      nachkorrigiert: neu >= 2,
      stabil: neu === PROBEN.length,
    })
  }
  return (
    <StepShell
      id="Z6"
      auftrag={fertig ? null : 'Prüfe das Maß: weiterlaufen oder nachstellen?'}
      ansage={null}
      interaktionOffen={!fertig}
      buehne={<StepFoto id="Z6" />}
      interaktion={
        <div className="flex flex-col gap-3">
          <p className="text-base leading-relaxed text-kh-paper/80">
            Grün: passt. Rechts daneben: zu dick. Dann stellst du die Maschine nach.
          </p>
          <p className="kh-etikett" aria-live="polite">
            {fertig
              ? 'Alle drei Proben kontrolliert'
              : `Probe ${index + 1} von 3 · Teil ${probe.stueck}`}
          </p>
          <Massbereich wert={probe.wert} />
          {!fertig && (
            <div className="grid grid-cols-2 gap-2">
              <Wahlflaeche
                onClick={() => entscheide(false)}
                className="min-h-24 flex-col justify-center"
                data-testid="z6-laufen-lassen"
              >
                <Play aria-hidden />
                Weiterlaufen lassen
              </Wahlflaeche>
              <Wahlflaeche
                onClick={() => entscheide(true)}
                className="min-h-24 flex-col justify-center"
                data-testid="z6-nachstellen"
              >
                <Wrench aria-hidden />
                Nachstellen
              </Wahlflaeche>
            </div>
          )}
          <Rueckmeldung
            ok={fehler ? false : fertig ? true : null}
            text={
              fehler ??
              (fertig ? 'Die Maße stimmen wieder. Du hältst die Serie auf Kurs.' : null)
            }
          />
          {!fehler && !fertig && echo && (
            <p role="status" className="text-sm text-kh-paper/75">
              {echo}
            </p>
          )}
        </div>
      }
      fuss={
        <StepFuss
          id="Z6"
          uebungOffen={!fertig}
          geschafft={fertig ? 'Serie kontrolliert' : null}
        />
      }
    />
  )
}
