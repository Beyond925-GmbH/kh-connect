import { StepFoto } from '@/khpl/buehne/Foto'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { Begriff } from './Begriff'

/**
 * C1.1 — Die Maschine hat heute Nacht gearbeitet. Abstecher von C1, mündet in C2.
 *
 * ⚠️ **Stub des Fundament-Agenten.** Gebaut wird der Screen vom Steps-Agenten
 * nach `khpl-tag-zimmerer.md` 6, C1.1:
 *
 * - **Der Screen, der `technik: 0.5` belegt.** Ohne ihn wirbt der Trichter mit
 *   etwas, das im Tag nicht vorkommt.
 * - Kein Übungselement — Lesescreen mit zwei Begriffs-Popovern.
 * - Material aus `INTERVIEW`: 3D-Aufmaße mit Laserscanner, CAD/CAM,
 *   Abbundzentren, **Nagelbrücken** (die Maschine *dieses* Tages: sie nagelt
 *   die Beplankung auf das Ständerwerk, also genau das, was in C3 passiert),
 *   dazu SEMA und AutoCAD beim Namen.
 * - Der Schlusssatz steht fest: „Das Aufschlagen eines Daches, das wird
 *   wahrscheinlich nie irgendwo die KI oder ’n 3D-Drucker übernehmen. Das wird
 *   immer Handarbeit bleiben.“ — mit Sprecher-Zuschreibung.
 */
export function C11() {
  return (
    <StepShell
      id="C1.1"
      titelZusatz="Abstecher"
      interaktionOffen={false}
      buehne={<StepFoto id="C1.1" />}
      fachtext={
        <p>
          Das Klischee vom Zimmermann mit dem Beil gegen die Realität: digitales Aufmaß,{' '}
          <Begriff id="cad">CAD</Begriff>-Modell, Abbundliste, CNC. Die{' '}
          <Begriff id="abbundanlage">Abbundanlage</Begriff> macht daraus über Nacht einen
          Stapel fertiger Hölzer.
        </p>
      }
      fuss={<StepFuss id="C1.1" />}
    />
  )
}
