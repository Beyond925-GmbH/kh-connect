import { useEffect, useState } from 'react'
import { StepFoto } from '@/khpl/buehne/Foto'
import { AhaKarte } from '@/khpl/komponenten/AhaKarte'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { Begriff } from './Begriff'

/**
 * Z2.1 — Warum es überall spritzt · Abstecher von Z2, mündet in Z3.
 *
 * Der Abstecher hängt an Z1 und nicht an einer Kuriosität: ohne
 * Kühlschmierstoff wird das Werkzeug heiß, dehnt sich, und das Maß wandert —
 * **die Toleranz aus Z1 stirbt an Wärme** (khpl-tag-zerspanung.md §6 Z2.1).
 * Genau diese Verbindung macht ihn zu mehr als einer Kuriosität, und deshalb
 * steht die Zahl aus Z1 wörtlich im Fachtext.
 *
 * Lesescreen ohne Übung, Muster B3.1: Foto, ein Absatz, zwei Einwürfe, die
 * kurz nach dem Ankommen erscheinen. Der zweite startet zugeklappt (R5):
 * zwei zugleich ausgeschriebene Karten plus Warum-Absatz lagen bei rund 90
 * Wörtern ohne einen einzigen Tap — das Budget sind ~50.
 *
 * ⚠️ Die Wärmeaufteilung im zweiten Einwurf ist `BELEGT`
 * (`belege/zerspanung.md` 6): rund 80 % der Wärme gehen in den Span. Eine
 * konkrete Temperatur steht bewusst nicht da — die Spanne reicht von 350 bis
 * über 1.100 °C und hängt an Werkstoff, Schnittgeschwindigkeit und Kühlung.
 */

export function Z21() {
  const [aha, setAha] = useState(false)

  useEffect(() => {
    const id = window.setTimeout(() => setAha(true), 800)
    return () => window.clearTimeout(id)
  }, [])

  return (
    <StepShell
      id="Z2.1"
      auftrag={null}
      ansage={null}
      buehne={<StepFoto id="Z2.1" />}
      warum={
        <p>
          Die Flüssigkeit kühlt, schmiert und spült die Späne weg. Ohne sie wird das
          Werkzeug heiß und dehnt sich aus — dann wandert das Maß. Sie heißt{' '}
          <Begriff id="kuehlschmierstoff">Kühlschmierstoff</Begriff>.
        </p>
      }
      aha={
        <>
          <AhaKarte
            sichtbar={aha}
            eyebrow="Warum ist der Span das Heißeste an der Maschine?"
          >
            Rund vier Fünftel der Wärme wandern in den Span und gehen mit ihm hinaus.
            Deshalb bleibt das Werkstück kalt — und nur ein kaltes Teil hat sein Maß.
          </AhaKarte>
          <AhaKarte sichtbar={aha} zugeklappt eyebrow="Und wenn niemand nachfüllt?">
            Dann wird es teuer, mitten in der Serie. Kühlmittel und Späneförderer sind der
            Ärger, über den in einer Halle wirklich geredet wird.
          </AhaKarte>
        </>
      }
      fuss={<StepFuss id="Z2.1" />}
    />
  )
}
