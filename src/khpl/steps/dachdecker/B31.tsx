import { useEffect, useState } from 'react'
import { StepFoto } from '@/khpl/buehne/Foto'
import { AhaKarte } from '@/khpl/komponenten/AhaKarte'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'

/**
 * B3.1 — Bestellt wird nach Plan. Abstecher von M3, mündet in M4.
 *
 * Kurzer Info-Abstecher ohne Übung.
 *
 * Der stärkste Inhalt steht nicht im Einkauf selbst, sondern daneben:
 * **Planen und Materialauswahl sind offiziell Teil des Ausbildungsberufs** —
 * „das überrascht, weil kaum jemand Zimmerei mit Einkauf verbindet“. Das ist
 * der bessere Aufhänger als der Einkauf selbst, und deshalb trägt die erste
 * Aha-Karte genau das.
 *
 * Zur Wortwahl: „Bedarfsplanung“ ist **kein** Begriff der
 * Ausbildungsordnung — belastbar ist der Wortlaut des amtlichen Berufsprofils
 * („Arbeiten planen“, „Baustoffe auswählen“). Und seit dem 1. August 2026 gilt
 * die AusbauBAusbV, nicht mehr die BauWiAusbV von 1999.
 *
 * ⚠️ Die zweite Aha-Karte trägt eine **Korrektur am Board**. Der grüne Sticky
 * sagt, Holz sei „der einzige Baustoff, der nachwächst“ — das ist falsch:
 * Stroh, Hanf, Flachs, Schilf, Kork und Bambus wachsen ebenfalls nach. Der
 * Satz darf so nicht an den Stand. Hier steht die korrigierte Fassung.
 *
 * Die Formulierung „etwa fünf Tonnen“ ist Pflicht, nicht Stil: das
 * Öko-Institut beziffert den tatsächlichen Speichersaldo auf 600–1.700 kg CO₂
 * je geerntetem Kubikmeter, „rund fünf Tonnen“ bleibt damit im belegten
 * Rahmen, „genau fünf Tonnen“ wäre zu viel behauptet.
 *
 * **Nur die erste Aha-Karte öffnet sich von selbst** (Design-Review): mit
 * beiden Karten plus Warum-Absatz standen ~85 Wörter gleichzeitig auf dem
 * Screen. Die Ausbildungsordnung ist der stärkere Aufhänger — sie
 * bleibt automatisch offen, die CO₂-Karte startet als Klappzeile
 * (`zugeklappt`) und kommt auf Tipp.
 *
 * **Kein Glossar-Chip mehr auf „Holz“** (Design-Review): der Chip
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
      buehne={<StepFoto id="B3.1" />}
      warum={
        <p>
          Aus dem Plan wird eine Bestellliste. Holz kauft der Betrieb meist einmal die
          Woche — du bestellst, planst die Liefertermine und prüfst jeden Balken, wenn er
          ankommt.
        </p>
      }
      aha={
        <>
          <AhaKarte sichtbar={aha} eyebrow="Einkaufen — gehört das wirklich zum Beruf?">
            Ja. Seit dem 1. August 2026 gibt es neue Ausbildungsregeln. Darin steht
            wörtlich: „Arbeiten planen“ und „Baustoffe auswählen“.
          </AhaKarte>
          <AhaKarte
            sichtbar={aha}
            zugeklappt
            eyebrow="Wie viel CO₂ steckt in diesem Dach?"
          >
            In diesem Dachstuhl stecken rund fünf Kubikmeter Holz — fünf Würfel mit je
            einem Meter Kantenlänge. Darin sind etwa fünf Tonnen CO₂ gebunden, und die
            bleiben dort hundert Jahre. Holz wächst nach. Kein anderer tragender Baustoff
            tut das.
          </AhaKarte>
        </>
      }
      fuss={<StepFuss id="B3.1" />}
    />
  )
}
