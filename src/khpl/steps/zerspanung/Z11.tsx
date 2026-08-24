import { StepFoto } from '@/khpl/buehne/Foto'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { Begriff } from './Begriff'

/**
 * Z1.1 — Wer zeichnet das? · Abstecher von Z1, mündet in Z2.
 *
 * Lesescreen ohne Übung, mit Begriffs-Popovern (`CAD`, `CAM`) — und der
 * Screen, der `technik: 1` mit trägt (khpl-tag-zerspanung.md §6 Z1.1).
 */
export function Z11() {
  return (
    <StepShell
      id="Z1.1"
      titelZusatz="Abstecher"
      buehne={<StepFoto id="Z1.1" />}
      fachtext={
        <p>
          Jemand hat das konstruiert — <Begriff id="cad">CAD</Begriff>, und daraus wird{' '}
          <Begriff id="cam">CAM</Begriff>, und daraus das Programm. Der Zerspaner steht am
          Ende einer Kette, die am Rechner anfängt, und ein Teil davon ist sein Job.
        </p>
      }
      fuss={<StepFuss id="Z1.1" />}
    />
  )
}
