import { useEffect, useState } from 'react'
import { Abbundplan } from '@/khpl/buehne/Abbundplan'
import { AhaKarte } from '@/khpl/komponenten/AhaKarte'
import { Begriff } from '@/khpl/komponenten/Begriff'
import { StepFuss, useStepNavigation } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'

/**
 * M3 — Aus dem Angebot wird ein Auftrag.
 *
 * **Reiner Lese-Step, keine Übung** (khpl-flow.md 7 M3). Nach zwei Übungen in
 * Folge braucht der Rhythmus eine ruhige Stelle — das ist eine Entscheidung
 * über den Takt der ganzen Anwendung, nicht eine Lücke.
 *
 * Hier werden die beiden losen Board-Stickies `CAD` und `Abbund` als
 * Begriffs-Popover eingelöst (flow 6.3). Danach die erste Verzweigung.
 */
export function M3() {
  const { weiter } = useStepNavigation('M3')

  // Die Aha-Karte kommt einen Takt später. Sie ist ein Einwurf, keine Ansage —
  // erst liest man, was passiert, dann kommt der Kommentar dazu (flow 6.4).
  const [aha, setAha] = useState(false)
  useEffect(() => {
    const id = window.setTimeout(() => setAha(true), 900)
    return () => window.clearTimeout(id)
  }, [])

  return (
    <StepShell
      id="M3"
      aufteilung="bild"
      onWeiter={weiter}
      buehne={<Abbundplan />}
      fachtext={
        // Wortlaut aus flow 11 (M3), um einen Satz ergänzt: die beiden losen
        // Board-Stickies `CAD` und `Abbund` sind laut 6.3 hier einzulösen,
        // kommen im Entwurfstext aber nicht vor. Dafür ist „Parallel stimmst du
        // Termine ab“ zu „Dann die Termine“ gekürzt — so bleibt der Fachtext
        // trotz der beiden zusätzlichen Begriffe im 250-Zeichen-Budget (6.2).
        <p>
          Unterschrieben. Jetzt entsteht aus der <Begriff id="statik">Statik</Begriff> der{' '}
          <Begriff id="abbundplan">Abbundplan</Begriff>: jedes Holz mit Länge, Winkel und
          eigener Nummer. Gezeichnet wird er im <Begriff id="cad">CAD</Begriff>,
          zugeschnitten wird danach beim <Begriff id="abbund">Abbund</Begriff>. Parallel
          stimmst du Termine ab — Bauherr, Kranfirma, Dachdecker. Alle müssen am selben
          Tag können.
        </p>
      }
      aha={
        <AhaKarte sichtbar={aha} eyebrow="Übrigens">
          Terminplanung ist ein Puzzle. Kran, Wetter, Materiallieferung und Dachdecker
          müssen zusammenpassen — ein verregneter Tag verschiebt die ganze Kette. Im Büro
          nennt man das Projektmanagement.
        </AhaKarte>
      }
      fuss={<StepFuss id="M3" />}
    />
  )
}
