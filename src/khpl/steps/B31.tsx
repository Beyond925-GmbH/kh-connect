import { useEffect, useState } from 'react'
import { StepFoto } from '@/khpl/buehne/Foto'
import { AhaKarte } from '@/khpl/komponenten/AhaKarte'
import { Begriff } from '@/khpl/komponenten/Begriff'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'

/**
 * B3.1 — Bestellt wird nach Plan. Abstecher von M3, mündet in M4.
 *
 * Kurzer Info-Abstecher ohne Übung (khpl-flow.md 7 B3.1).
 *
 * Der stärkste Inhalt steht nach flow 7 B3.1 nicht im Einkauf selbst, sondern
 * daneben: **Planen und Materialauswahl sind offiziell Teil des
 * Ausbildungsberufs** — „das überrascht, weil kaum jemand Zimmerei mit Einkauf
 * verbindet“. Die Spec nennt die Neuordnung ausdrücklich „ein besserer
 * Aufhänger als der Einkauf“. Deshalb trägt die erste Aha-Karte genau das.
 *
 * Wortwahl `GEPRÜFT`: „Bedarfsplanung“ ist **kein** Begriff der
 * Ausbildungsordnung — belastbar ist der Wortlaut des amtlichen Berufsprofils
 * („Arbeiten planen“, „Baustoffe auswählen“). Und seit dem 1. August 2026 gilt
 * die AusbauBAusbV, nicht mehr die BauWiAusbV von 1999.
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

export function B31() {
  const [aha, setAha] = useState(false)

  useEffect(() => {
    const id = window.setTimeout(() => setAha(true), 800)
    return () => window.clearTimeout(id)
  }, [])

  return (
    <StepShell
      id="B3.1"
      titelZusatz="Abstecher"
      buehne={<StepFoto id="B3.1" />}
      fachtext={
        <p>
          Aus dem <Begriff id="abbundplan">Abbundplan</Begriff> wird eine Materialliste.
          Fichte für die <Begriff id="sparren">Sparren</Begriff>,{' '}
          <Begriff id="brettschichtholz">Brettschichtholz</Begriff> für die weiten
          Spannweiten. Du bestellst, koordinierst die Liefertermine und prüfst jeden
          Balken, wenn er ankommt — Holz ist ein Naturprodukt, keiner ist wie der andere.
        </p>
      }
      aha={
        <>
          <AhaKarte sichtbar={aha} eyebrow="Einkaufen — gehört das wirklich zum Beruf?">
            Einkaufen gehört zum Beruf. „Arbeiten planen“ und „Baustoffe auswählen“ stehen
            wörtlich im Ausbildungsberufsbild — und seit dem 1. August 2026 gilt dafür
            eine neue Ausbildungsordnung. Wer diesen Sommer anfängt, ist der erste
            Jahrgang danach.
          </AhaKarte>
          {/* Eigene Beschriftung statt `null`: die Karte klappt jetzt auf, und
              ein Streifen braucht etwas, worauf man tippt. */}
          <AhaKarte
            sichtbar={aha}
            eyebrow="Wie viel CO₂ steckt in diesem Dach?"
            verzoegerung={1.8}
          >
            In dem Dachstuhl von eben stecken rund fünf Kubikmeter Holz — und damit etwa
            fünf Tonnen CO₂, die dort die nächsten hundert Jahre bleiben. Holz ist einer
            der wenigen Baustoffe, die nachwachsen, und der einzige, aus dem man
            hierzulande ein Dach tragen lässt.
          </AhaKarte>
        </>
      }
      fuss={<StepFuss id="B3.1" />}
    />
  )
}
