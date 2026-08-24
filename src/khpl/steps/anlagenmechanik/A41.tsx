import { useState } from 'react'
import { Check } from 'lucide-react'
import { StepFoto } from '@/khpl/buehne/Foto'
import { Wahlflaeche } from '@/khpl/komponenten/Wahlflaeche'
import { Wechsel } from '@/khpl/komponenten/Wechsel'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'

/**
 * A4.1 — Löten, pressen, stecken. Abstecher von A4, mündet in A5.
 *
 * Drei Arten, zwei Rohre zu verbinden — und wann was (Spec 4). Ein Tap je Art,
 * die Antwort ersetzt die vorige; dieselbe ruhige Form wie die Pausenfragen in
 * M6, weil ein Abstecher kein zweiter Übungsscreen sein soll.
 *
 * ⚠️ **Die drei Beschreibungen sind `ENTWURF – UNGEPRÜFT` und fachlich
 * abzunehmen.** Sie stehen weder in Spec 6 noch in `belege/` und sind deshalb
 * bewusst **zahlenfrei und normfrei** formuliert: kein Durchmesser, kein
 * Temperaturbereich, kein Regelwerk. Was hier steht, ist die Sache in der
 * Sprache eines Vierzehnjährigen — alles Genauere gehört in die Abnahme, nicht
 * auf diesen Screen.
 *
 * Belegt ist eine Kleinigkeit, und sie kommt aus den Gesprächen: **das Werkzeug
 * läuft mit Akku** (`INTERVIEW` — akkubetriebene Geräte, khpl-tag-
 * anlagenmechanik.md 11).
 *
 * ⚠️ Bühne: `gallery-2.webp` (Rohrverteiler). **Passt nur halb** (Spec 10) —
 * das Motiv zeigt das Ergebnis, nicht den Handgriff. Bis ein besseres Motiv
 * vorliegt, trägt es den Screen.
 */

const ARTEN = [
  {
    id: 'loeten',
    label: 'Löten',
    text: 'Zwei Kupferteile ineinander, Flamme drauf, Lot dazu. Das Lot läuft von selbst in den schmalen Spalt und dichtet ihn. Hält, solange das Haus steht — aber es braucht Übung, eine ruhige Hand und eine offene Flamme in der Wohnung von jemandem. Deshalb wird vorher abgedeckt und hinterher noch eine Weile hingeschaut.',
  },
  {
    id: 'pressen',
    label: 'Pressen',
    text: 'Fitting aufschieben, Zange ansetzen, ein Druck — der Ring im Fitting wird auf das Rohr gequetscht und ist dicht. Schnell, ohne Flamme, und auch dort möglich, wo neben der Leitung Holz liegt. Der Normalfall auf den meisten Baustellen. Die Zange läuft mit Akku, wie fast alles im Transporter.',
  },
  {
    id: 'stecken',
    label: 'Stecken',
    text: 'Rohr ablängen, entgraten, in den Fitting schieben. Es rastet ein und hält. Von den dreien der schnellste Weg und je Verbindung der teuerste — deshalb nimmt man ihn dort, wo es schnell gehen muss oder wo für eine Zange kein Platz mehr ist.',
  },
] as const

type ArtId = (typeof ARTEN)[number]['id']

export function A41() {
  const [offen, setOffen] = useState<ArtId | null>(null)
  const [gelesen, setGelesen] = useState<ArtId[]>([])

  const waehle = (id: ArtId) => {
    setOffen((alt) => (alt === id ? null : id))
    setGelesen((g) => (g.includes(id) ? g : [...g, id]))
  }

  const art = ARTEN.find((a) => a.id === offen)

  return (
    <StepShell
      id="A4.1"
      titelZusatz="Abstecher"
      interaktionOffen={false}
      buehne={<StepFoto id="A4.1" />}
      fachtext={
        <p>
          Drei Arten, zwei Rohre zu verbinden — und wann was. Dicht müssen alle drei sein.
          Was genommen wird, entscheiden der Werkstoff, der Ort und wie viel Platz die
          Hand da hinten noch hat.
        </p>
      }
      interaktion={
        <div className="flex flex-col gap-2.5">
          {!art && (
            <p className="px-1 text-[1rem] text-kh-paper/55">
              Tipp an, was dich interessiert.
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            {ARTEN.map((a) => (
              <Wahlflaeche
                key={a.id}
                onClick={() => waehle(a.id)}
                gewaehlt={offen === a.id}
                data-testid={`a41-${a.id}`}
                className="w-auto flex-1 justify-center rounded-kh-pill font-semibold"
              >
                {gelesen.includes(a.id) && offen !== a.id && (
                  <Check
                    className="size-4 shrink-0 text-kh-signal"
                    strokeWidth={3}
                    aria-hidden
                  />
                )}
                {a.label}
              </Wahlflaeche>
            ))}
          </div>

          <Wechsel takt={offen ?? 'nichts'}>
            {art ? (
              <p
                data-auswaehlbar
                data-testid="a41-text"
                className="kh-feld px-4 py-3 text-[1.0625rem] leading-[1.45] text-kh-paper/90"
              >
                {art.text}
              </p>
            ) : null}
          </Wechsel>
        </div>
      }
      fuss={<StepFuss id="A4.1" />}
    />
  )
}
