import { useEffect, useState } from 'react'
import { StepFoto } from '@/khpl/buehne/Foto'
import { AhaKarte } from '@/khpl/komponenten/AhaKarte'
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
 *
 * **Nur die erste Aha-Karte öffnet sich von selbst** (Design-Review, R5): mit
 * beiden Karten plus Warum-Absatz standen ~85 Wörter gleichzeitig auf dem
 * Screen. Die Ausbildungsordnung ist laut Spec der stärkere Aufhänger — sie
 * bleibt automatisch offen, die CO₂-Karte startet als Klappzeile
 * (`zugeklappt`) und kommt auf Tipp.
 *
 * **Kein Glossar-Chip mehr auf „Holz“** (Design-Review, R10): der Chip
 * verlinkte auf `brettschichtholz` — der Satz redet aber von gewachsenem
 * Holz, der Eintrag erklärt verleimte Bretter. Das Wort „Holz“ braucht am
 * Messestand keine Erklärung.
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
      auftrag={null}
      ansage={null}
      titelZusatz="Abstecher"
      buehne={<StepFoto id="B3.1" />}
      warum={
        <p>
          Aus der Zeichnung wird eine Einkaufsliste. Du bestellst, planst die
          Liefertermine und prüfst jeden Balken, wenn er ankommt: Holz wächst, keiner ist
          wie der andere.
        </p>
      }
      aha={
        <>
          <AhaKarte sichtbar={aha} eyebrow="Einkaufen — gehört das wirklich zum Beruf?">
            Ja. „Arbeiten planen“ und „Baustoffe auswählen“ stehen wörtlich im
            Ausbildungsberufsbild — seit dem 1. August 2026 in einer neuen
            Ausbildungsordnung.
          </AhaKarte>
          <AhaKarte
            sichtbar={aha}
            zugeklappt
            eyebrow="Wie viel CO₂ steckt in diesem Dach?"
          >
            In diesem Dachstuhl stecken rund fünf Kubikmeter Holz — und damit etwa fünf
            Tonnen CO₂, die dort hundert Jahre bleiben. Holz wächst nach. Kein anderer
            tragender Baustoff tut das.
          </AhaKarte>
        </>
      }
      fuss={<StepFuss id="B3.1" />}
    />
  )
}
