import { useEffect, useRef } from 'react'
import type { StepId } from '@/khpl/flow/steps'
import { StepFoto } from '@/khpl/buehne/Foto'
import { Klappliste } from '@/khpl/komponenten/Klappliste'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { merkeAntwort, useFortschritt } from '@/khpl/store/fortschritt'
import { karriereweg } from './karrierewege'

/**
 * A8.1 / A8.2 / A8.3 — Meister · Techniker · Studium. Abstecher von A8,
 * münden in A9.
 *
 * Je eine Info-Karte mit gleichem Aufbau: die Abschnitte des
 * Weges als Frage und Antwort. Keine Übung und keine Aha-Karte — dieselbe Form
 * wie `B9` beim Dachdecker, anderer Inhalt.
 *
 * **Beim Öffnen wird der Weg vermerkt.** Daraus speist sich der
 * personalisierte Aufhänger auf A9: wer sich das Studium angesehen hat, liest
 * dort den Satz über das Studium.
 *
 * ⚠️ **Vermerkt wird über `merkeAntwort('a8', …)` und nicht über
 * `merkeKarriereweg`** — und der Grund ist eine Naht in der Hülle, die
 * gemeldet und nicht im Vorbeigehen repariert wird:
 * `store/fortschritt.ts` schreibt in `merkeKarriereweg` **fest verdrahtet**
 * nach `answers.m9`, einem Dachdecker-Schlüssel. Zur Laufzeit kollidiert
 * nichts (der Fortschritt liegt je Beruf), aber die Antwortschlüssel sollen
 * je Beruf disjunkt bleiben, und `a8` ist der dieses Tages. Bis die Funktion einen
 * Schlüssel entgegennimmt, schreibt dieser Screen ihn selbst — dieselbe Logik,
 * nur in den eigenen Abschnitt.
 */
export function A8Weg({ id }: { id: StepId }) {
  const weg = karriereweg(id)
  const angesehen = useFortschritt().answers.a8?.angesehen ?? []

  // Der Stand vor diesem Effekt, ohne ihn in die Abhängigkeiten zu ziehen:
  // sonst schriebe der Effekt, löste ein Rendern aus und liefe erneut.
  const bisher = useRef(angesehen)
  bisher.current = angesehen

  useEffect(() => {
    const liste = bisher.current
    if (liste[liste.length - 1] === id) return
    // Reihenfolge des Öffnens; der zuletzt geöffnete Weg speist den
    // personalisierten Aufhänger auf A9.
    merkeAntwort('a8', { angesehen: [...liste.filter((x) => x !== id), id] })
  }, [id])

  if (!weg) return null

  return (
    <StepShell
      id={id}
      auftrag={null}
      ansage={null}
      titelZusatz="Karriere-Weg"
      // Fünf Faktenblöcke gegen `max-h-[84%]`: quer lagen „Was du verdienst"
      // und „Was NRW dazugibt" unter der Scrollkante (Sichtprüfung, A8.1,
      // `scrollRest` 153 px). Die Bühne ist hier ein Foto und trägt nichts —
      // im breiten Panel legen sich die Klappfelder in zwei Spalten.
      karteBreit
      interaktionOffen={false}
      buehne={<StepFoto id={id} />}
      /*
        **Die geteilte `Klappliste` statt einer eigenen Faktenliste.** Diese
        Datei trug dieselbe Antwort auf dieselbe Klemme in einer dritten
        Fassung — genau die Doppelung, die der Kopf der `Klappliste` als zur
        Migration gemeldet führt. Und die eigene Fassung schrieb quer alle
        fünf Antworten gleichzeitig aus: ~90–110 Wörter ohne einen
        hervorgehobenen Kernfakt. Die Klappliste hält das Wortbudget
        in beiden Formaten — der erste Block kommt offen an, die übrigen
        Fragen bleiben als Verzeichnis stehen, gekürzt ist nichts.
      */
      interaktion={
        <Klappliste abschnitte={weg.abschnitte} kennung="a8weg" spaltenQuer={2} />
      }
      fuss={<StepFuss id={id} />}
    />
  )
}
