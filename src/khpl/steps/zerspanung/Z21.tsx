import { StepFoto } from '@/khpl/buehne/Foto'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { Begriff } from './Begriff'

/**
 * Z2.1 — Warum es überall spritzt · Abstecher von Z2, mündet in Z3.
 *
 * Der Abstecher hängt an Z1 und nicht an einer Kuriosität: ohne
 * Kühlschmierstoff wird das Werkzeug heiß, dehnt sich, und das Maß wandert —
 * **die Toleranz aus Z1 stirbt an Wärme** (khpl-tag-zerspanung.md §6 Z2.1).
 */
export function Z21() {
  return (
    <StepShell
      id="Z2.1"
      titelZusatz="Abstecher"
      buehne={<StepFoto id="Z2.1" />}
      fachtext={
        <p>
          <Begriff id="kuehlschmierstoff">Kühlschmierstoff</Begriff>: kühlt, schmiert,
          spült den <Begriff id="span">Span</Begriff> weg. Ohne ihn wird das Werkzeug
          heiß, dehnt sich, und das Maß wandert.
        </p>
      }
      fuss={<StepFuss id="Z2.1" />}
    />
  )
}
