import { useEffect, useRef } from 'react'
import type { StepId } from '@/khpl/flow/steps'
import { StepFoto } from '@/khpl/buehne/Foto'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { merkeAntwort, useFortschritt } from '@/khpl/store/fortschritt'
import { karriereweg } from './karrierewege'
import { Klappliste } from '@/khpl/komponenten/Klappliste'

/**
 * C8.1 / C8.2 / C8.3 — Meister · Techniker · Studium.
 * Abstecher von C8, münden in C9.
 *
 * Je eine Info-Karte mit gleichem Aufbau, `Info only` auf dem Board: keine
 * Interaktion, keine Aha-Karte. Die Inhalte stehen vollständig in
 * `karrierewege.ts` und sind für den Zimmerer recherchiert (Stand
 * 24.08.2026).
 *
 * **Warum die Abschnitte nicht überall vier sind.** Der Dachdecker-Bestand
 * fragt viermal dasselbe ab — Was ist das · Wie lange · Was es kostet · Was du
 * verdienst. In 25 Gesprächen hat **niemand** von sich aus über Geld
 * gesprochen, und die Karrierekarten des Bestands tragen
 * fast nur Zahlen. Deshalb steht auf jeder Karte dieses Tages zuerst, was man in
 * diesem Weg **tut**, und erst danach, was er kostet und bringt; die Meisterkarte
 * hat dafür einen Abschnitt mehr. Die Reihenfolge ist die Aussage — sie kommt
 * aus den Daten, nicht aus dieser Datei.
 *
 * **Warum das Vermerken hier steht und nicht in `merkeKarriereweg`.** Der Store
 * hat für den angesehenen Karriereweg eine fertige Funktion — sie schreibt aber
 * fest nach `answers.m9`, und `m9` gehört dem Dachdecker. Der Schlüssel dieses
 * Tages ist `c8`. Die Funktion gehört keinem der drei Agenten, also wird sie
 * nicht umgebaut, sondern umgangen: `merkeAntwort('c8', …)` tut dasselbe im
 * eigenen Abschnitt. **Gemeldet** — `merkeKarriereweg` ist berufsspezifisch,
 * obwohl es in der gemeinsamen Hälfte des Stores steht, und alle vier Tage
 * brauchen es.
 */
export function C8x({ id }: { id: StepId }) {
  const weg = karriereweg(id)
  const bisher = useFortschritt().answers.c8?.angesehen ?? []
  // Über ein Ref, nicht als Abhängigkeit: der Effekt schreibt in denselben
  // Zustand, den er läse — als Abhängigkeit liefe er nach seinem eigenen
  // Schreiben ein zweites Mal.
  const stand = useRef(bisher)
  stand.current = bisher

  useEffect(() => {
    // Reihenfolge des Öffnens; der zuletzt geöffnete Weg speist den
    // personalisierten Aufhänger in C9.
    const alt = stand.current
    if (alt[alt.length - 1] === id) return
    merkeAntwort('c8', { angesehen: [...alt.filter((x) => x !== id), id] })
  }, [id])

  if (!weg) return null

  return (
    <StepShell
      id={id}
      auftrag={null}
      ansage={null}
      titelZusatz="Karriere-Weg"
      // Quer 52 statt 44 rem: die fünf Abschnitte sind die längsten Karten
      // des Tages, und die schmale Spalte ließ auf C8.1 zwei von ihnen unter
      // der Scrollkante beginnen, während rechts 440 px Foto standen
      // (Sichtbefund C8.1–C8.3).
      karteBreit
      interaktionOffen={false}
      buehne={<StepFoto id={id} />}
      // Kein Fachtext. Der Köder der Karte steht schon in C8, und ausgerechnet
      // der der Meisterkarte („Eigener Betrieb, eigene Azubis“) ist reine
      // Besitzstand-Sprache — ihn hier zu wiederholen verdoppelte genau das,
      // was die Abschnitte korrigieren.
      // Hochkant klappen die Abschnitte, quer liegen sie zweispaltig: fünf
      // ausgeschriebene Abschnitte sind auf dem Handy rund 380 px höher als das
      // Panel, und was darunter lag, war „Was es kostet“ und „Was du verdienst“
      // — die beiden Angaben, wegen derer ein Karriere-Weg geöffnet wird
      // (Sichtbefund C8.1–C8.3).
      interaktion={
        <Klappliste kennung="c8" abschnitte={weg.abschnitte} spaltenQuer={2} />
      }
      fuss={<StepFuss id={id} />}
    />
  )
}
