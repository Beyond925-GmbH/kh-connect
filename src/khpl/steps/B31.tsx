import { useEffect, useState } from 'react'
import { AhaKarte } from '@/khpl/komponenten/AhaKarte'
import { Begriff } from '@/khpl/komponenten/Begriff'
import { StepFuss, useStepNavigation } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'

/**
 * B3.1 — Bestellt wird nach Plan. Abstecher von M3, mündet in M4.
 *
 * Kurzer Info-Abstecher ohne Übung (khpl-flow.md 7 B3.1).
 *
 * ⚠️ Die zweite Aha-Karte trägt eine **Korrektur am Board**. Der grüne Sticky
 * sagt, Holz sei „der einzige Baustoff, der nachwächst“ — das ist falsch:
 * Stroh, Hanf, Flachs, Schilf, Kork und Bambus wachsen ebenfalls nach. Der
 * Satz darf so nicht an den Stand. Hier steht die Neuformulierung aus flow 11.
 *
 * Die Formulierung „etwa fünf Tonnen“ ist Pflicht, nicht Stil: das
 * Öko-Institut beziffert den tatsächlichen Speichersaldo auf 600–1.700 kg CO₂
 * je geerntetem Kubikmeter, „rund fünf Tonnen“ bleibt damit im belegten
 * Rahmen, „genau fünf Tonnen“ wäre zu viel behauptet (flow 7 B3.1).
 */

/**
 * Notbehelf: für Lager und Transport gibt es kein Motiv (flow 13). `gallery-1`
 * zeigt den maschinellen Abbund — Holz, das bearbeitet wird, nicht Holz, das
 * geliefert wird. Trägt den Step, ist aber auf der Fotoliste.
 */
const BILD = '/medien/media/zimmerer/gallery-1.webp'

export function B31() {
  const { weiter } = useStepNavigation('B3.1')
  const [aha, setAha] = useState(false)

  useEffect(() => {
    const id = window.setTimeout(() => setAha(true), 800)
    return () => window.clearTimeout(id)
  }, [])

  return (
    <StepShell
      id="B3.1"
      aufteilung="bild"
      titelZusatz="Abstecher"
      onWeiter={weiter}
      buehne={<img src={BILD} alt="" aria-hidden className="size-full object-cover" />}
      fachtext={
        <p>
          Aus dem <Begriff id="abbundplan">Abbundplan</Begriff> wird eine Materialliste.
          Fichte für die <Begriff id="sparren">Sparren</Begriff>,{' '}
          <Begriff id="brettschichtholz">Brettschichtholz</Begriff> für die weiten
          Spannweiten. Du bestellst, koordinierst die Liefertermine und prüfst jeden
          Balken, wenn er ankommt.
        </p>
      }
      aha={
        <div className="flex flex-col gap-2">
          <AhaKarte sichtbar={aha} eyebrow="Nicht auf dem Schirm">
            Holz ist ein Naturprodukt. Kein Balken ist wie der andere — jeder wird auf
            Verwerfung, Äste und Feuchte geprüft. Falsch gelagert wird aus teurem Bauholz
            Brennholz.
          </AhaKarte>
          <AhaKarte sichtbar={aha} eyebrow={null} verzoegerung={1.8}>
            In dem Dachstuhl von eben stecken rund fünf Kubikmeter Holz — und damit etwa
            fünf Tonnen CO₂, die dort die nächsten hundert Jahre bleiben. Holz ist einer
            der wenigen Baustoffe, die nachwachsen, und der einzige, aus dem man
            hierzulande ein Dach tragen lässt.
          </AhaKarte>
        </div>
      }
      fuss={<StepFuss id="B3.1" />}
    />
  )
}
