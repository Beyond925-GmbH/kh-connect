import { Suspense, lazy, useEffect, useState } from 'react'
import { Dachstuhl3DFallback } from '@/khpl/buehne/Dachstuhl3DFallback'
import { AhaKarte } from '@/khpl/komponenten/AhaKarte'
import { Begriff } from '@/khpl/komponenten/Begriff'
import { StepFuss } from '@/khpl/shell/StepFuss'
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
 *
 * **Bühne: der Abbundplan selbst.** Der Fachtext spricht vom Plan, in dem jedes
 * Holz mit Länge, Winkel und Nummer steht — bis hierher lag daneben ein Foto
 * eines Bildschirms. Jetzt liegt dort die Zeichnung: **dasselbe Modell wie in
 * B3.2**, nur als Riss statt als Körper. Damit beginnt die Handwerksstrecke da,
 * wo sie im Betrieb beginnt — beim Plan —, und dieselbe Konstruktion wird über
 * M4 bis M8 durchgereicht (Plan → Körper).
 *
 * Zwei Entscheidungen dazu:
 *
 *  - **Ohne Lattung** (`lattung={0}`). Ein Abbundplan zeigt keine Dachlattung —
 *    und 74 Latten plus Konterlattung würden die Konstruktion, um die es geht,
 *    als Schraffur begraben.
 *  - **Feste Ansicht, kein Attraktor.** M3 ist die ruhige Stelle im Takt; ein
 *    Modell, das sich von selbst dreht, ist eine Aufforderung. Gedreht wird in
 *    B3.2, direkt danach.
 */

const Dachstuhl3D = lazy(() => import('@/khpl/buehne/Dachstuhl3D'))

export function M3() {
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
      buehneInteraktiv
      interaktionOffen={false}
      buehne={
        <Suspense fallback={<Dachstuhl3DFallback text="Der Plan wird gezeichnet" />}>
          <Dachstuhl3D zielT={1} darstellung="riss" ansicht="iso" lattung={0} />
        </Suspense>
      }
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
          stimmst du Termine ab — Bauherr, Kranfirma, Gerüstbauer. Alle müssen am selben
          Tag können.
        </p>
      }
      aha={
        <AhaKarte sichtbar={aha} eyebrow="Was passiert, wenn es regnet?">
          Terminplanung ist ein Puzzle. Kran, Wetter, Materiallieferung und Gerüst müssen
          zusammenpassen — ein verregneter Tag verschiebt die ganze Kette. Im Büro nennt
          man das Projektmanagement.
        </AhaKarte>
      }
      fuss={<StepFuss id="M3" />}
    />
  )
}
