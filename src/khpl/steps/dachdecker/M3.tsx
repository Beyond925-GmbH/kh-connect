import { Suspense, lazy, useEffect, useState } from 'react'
import { Dachstuhl3DFallback } from '@/khpl/buehne/Dachstuhl3DFallback'
import { AhaKarte } from '@/khpl/komponenten/AhaKarte'
import { Begriff } from '@/khpl/komponenten/Begriff'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'

/**
 * M3 — Aus dem Angebot wird ein Auftrag.
 *
 * **Reiner Lese-Step, keine Übung.** Nach zwei Übungen in
 * Folge braucht der Rhythmus eine ruhige Stelle — das ist eine Entscheidung
 * über den Takt der ganzen Anwendung, nicht eine Lücke.
 *
 * Hier werden die beiden losen Board-Stickies `CAD` und `Abbund` als
 * Begriffs-Popover eingelöst. Danach die erste Verzweigung.
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
  // erst liest man, was passiert, dann kommt der Kommentar dazu.
  const [aha, setAha] = useState(false)
  useEffect(() => {
    const id = window.setTimeout(() => setAha(true), 900)
    return () => window.clearTimeout(id)
  }, [])

  return (
    <StepShell
      id="M3"
      // Reine Lese-Bühne: der Plan zeichnet sich, man schaut zu. Bewusst
      // ohne Auftragszeile — dieser Screen wird gelesen, nicht bedient.
      auftrag={null}
      ansage={null}
      buehneInteraktiv
      interaktionOffen={false}
      buehne={
        <Suspense fallback={<Dachstuhl3DFallback text="Der Plan wird gezeichnet" />}>
          <Dachstuhl3D zielT={1} darstellung="riss" ansicht="iso" lattung={0} />
        </Suspense>
      }
      warum={
        // Zweimal ergänzt gegenüber dem Entwurfstext: die beiden losen
        // Board-Stickies `CAD` und `Abbund` werden hier eingelöst, kommen
        // dort aber nicht vor. Und der Halbsatz „du musst noch keins davon
        // lesen können“ lizenziert das Nichtwissen:
        // die Zeichnung zeigt ~15 Sparren auf einmal, und ohne diesen Satz
        // liest ein Anfänger sie als Prüfung statt als Ausblick. Dafür ist
        // „Parallel stimmst du Termine ab“ zu „Danach müssen …“ gekürzt.
        <p>
          Unterschrieben. Jetzt wird gezeichnet: jedes Holz mit Länge, Winkel und eigener
          Nummer — du musst noch keins davon lesen können. Diese Zeichnung heißt{' '}
          <Begriff id="abbundplan">Abbundplan</Begriff>. Danach müssen Kunde, Kran und
          Gerüst alle am selben Tag Zeit haben.
        </p>
      }
      aha={
        <AhaKarte sichtbar={aha} eyebrow="Was passiert, wenn es regnet?">
          Kran, Wetter, Lieferung und Gerüst müssen zusammenpassen. Ein einziger Regentag
          verschiebt alles Weitere mit.
        </AhaKarte>
      }
      fuss={<StepFuss id="M3" />}
    />
  )
}
