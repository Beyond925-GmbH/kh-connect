import { useEffect, useState } from 'react'
import { StepFoto } from '@/khpl/buehne/Foto'
import { TOLERANZ } from '@/khpl/buehne/zerspanung/kanon'
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
 * kurz nach dem Ankommen aufmachen.
 *
 * ⚠️ Die Wärmeaufteilung im zweiten Einwurf ist `BELEGT`
 * (`belege/zerspanung.md` 6): rund 80 % der Wärme gehen in den Span. Eine
 * konkrete Temperatur steht bewusst nicht da — die Spanne reicht von 350 bis
 * über 1.100 °C und hängt an Werkstoff, Schnittgeschwindigkeit und Kühlung.
 */

const zahl = (n: number) => n.toFixed(3).replace('.', ',')

export function Z21() {
  const [aha, setAha] = useState(false)

  useEffect(() => {
    const id = window.setTimeout(() => setAha(true), 800)
    return () => window.clearTimeout(id)
  }, [])

  return (
    <StepShell
      id="Z2.1"
      titelZusatz="Abstecher"
      buehne={<StepFoto id="Z2.1" />}
      fachtext={
        <p>
          <Begriff id="kuehlschmierstoff">Kühlschmierstoff</Begriff>: kühlt, schmiert,
          spült den <Begriff id="span">Span</Begriff> weg. Ohne ihn wird das Werkzeug
          heiß, dehnt sich aus, und das Maß wandert — die {zahl(TOLERANZ)} Millimeter von
          der Zeichnung sterben an Wärme.
        </p>
      }
      aha={
        <>
          <AhaKarte
            sichtbar={aha}
            eyebrow="Warum ist der Span das Heißeste an der Maschine?"
          >
            Rund vier Fünftel der Wärme, die beim Zerspanen entsteht, wandern in den Span
            und verlassen mit ihm die Schnittstelle. Er nimmt die Hitze mit hinaus —
            deshalb bleibt das Werkstück, was es sein soll: kalt und maßhaltig.
          </AhaKarte>
          <AhaKarte sichtbar={aha} eyebrow="Und wenn niemand nachfüllt?">
            Dann wird es teuer, und zwar mitten in der Serie. Kühlmittelstand und
            Späneförderer gehören zu den Sachen, über die sich in einer Halle wirklich
            jemand ärgert — nicht spektakulär, aber jeden Tag.
          </AhaKarte>
        </>
      }
      fuss={<StepFuss id="Z2.1" />}
    />
  )
}
