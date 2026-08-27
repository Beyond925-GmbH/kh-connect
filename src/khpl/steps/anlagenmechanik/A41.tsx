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

/*
  Ohne unerklärte Werkstattwörter (R10): „Lot" heißt hier Lötzinn, „Fitting"
  Verbindungsstück, und „entgraten" bekommt seinen Handgriff mitgeliefert.
  Wer den Screen liest, lernt die Sache — die Fachnamen kommen im Betrieb von
  selbst.
*/
const ARTEN = [
  {
    id: 'loeten',
    label: 'Löten',
    text: 'Zwei Kupferteile ineinander, Flamme drauf, Lötzinn dazu. Das geschmolzene Zinn läuft von selbst in den Spalt und dichtet ihn. Hält, solange das Haus steht — braucht aber Übung und eine offene Flamme.',
  },
  {
    id: 'pressen',
    label: 'Pressen',
    text: 'Verbindungsstück aufs Rohr schieben, Zange ansetzen, ein Druck — und es ist dicht. Schnell, ohne Flamme, auch da möglich, wo Holz neben der Leitung liegt. Der Normalfall.',
  },
  {
    id: 'stecken',
    label: 'Stecken',
    text: 'Rohr auf Länge schneiden, die scharfe Kante abfeilen — entgraten heißt das —, dann ins Verbindungsstück schieben. Es rastet ein und hält. Der schnellste Weg, und je Verbindung der teuerste.',
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
      auftrag={'Tipp an, was dich interessiert.'}
      ansage={null}
      titelZusatz="Abstecher"
      interaktionOffen={false}
      buehne={<StepFoto id="A4.1" />}
      warum={
        <p>
          Drei Arten, zwei Rohre zu verbinden. Dicht müssen alle drei sein. Was genommen
          wird, entscheiden Werkstoff, Ort und Platz.
        </p>
      }
      interaktion={
        <div className="flex flex-col gap-2.5">
          {/* Keine Hinweiszeile über den Chips: sie stand wortgleich schon im
              Auftragsband — genau ein Anweisungssatz pro Screen (R4). */}
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
