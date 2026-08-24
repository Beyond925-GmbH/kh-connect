import { Werkstueck } from '@/khpl/buehne/zerspanung/Werkstueck'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { Begriff } from './Begriff'

/**
 * Z1 — Null Komma null zwei eins.
 *
 * **Der eine Schätzmoment dieses Tages** (khpl-tag-zerspanung.md §6 Z1). Der
 * Besucher rät an einem logarithmischen Regler, wie viel bei `Ø 20 h7`
 * danebengehen darf; aufgelöst wird mit 20,000 / 19,979 mm — 0,021 mm
 * Spielraum, `BELEGT` nach ISO 286.
 *
 * Die Mechanik ist die von M2, das Vorzeichen ist das entgegengesetzte: dort
 * ist die echte Zahl **größer** als erwartet, hier absurd **kleiner**. Ein
 * Vierzehnjähriger, der rät, rät Millimeter.
 *
 * ⚠️ **Gerüst.** Regler, Auflösung und der Zoom aufs Toleranzfeld fehlen noch;
 * `answers.z1` ist im Store bereits angelegt.
 */
export function Z1() {
  return (
    <StepShell
      id="Z1"
      buehne={<Werkstueck zustand="zeichnung" massHervorgehoben />}
      fachtext={
        <p>
          Eine technische Zeichnung sagt nicht, <em>wie groß</em> — sie sagt,{' '}
          <em>wie genau</em>. Hinter jedem Maß steht eine{' '}
          <Begriff id="toleranz">Toleranz</Begriff>, und die entscheidet über Preis,
          Aufwand und Maschine.
        </p>
      }
      fuss={<StepFuss id="Z1" />}
    />
  )
}
