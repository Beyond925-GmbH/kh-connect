import { StepFoto } from '@/khpl/buehne/Foto'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { useFortschritt } from '@/khpl/store/fortschritt'
import { AUFHAENGER_OHNE, karriereweg } from './karrierewege'

/**
 * Z8 — Dein nächster Schritt. Der CTA, unverändert wie bei allen vier Tagen.
 *
 * Zweiteilig auf einem Screen: erst der personalisierte Aufhänger, der
 * aufgreift, was in Z7 angesehen wurde, dann „Sprich jetzt mit … am Stand“.
 * Der Name kommt aus `public/stand.json`. Dazu das Angebot **Noch einen
 * Beruf** — wer einen ganzen Tag durchgespielt hat, ist der Besucher mit der
 * höchsten Wahrscheinlichkeit, einen zweiten anzufangen.
 *
 * ⚠️ **Gerüst.** Die vollflächig orange Fassung samt Logo, Aufhänger und den
 * beiden Ausgängen steht in `steps/dachdecker/M10.tsx` und ist von dort zu
 * übernehmen — inklusive **[ Zurück zu deinem Tag ]** für alle, die im
 * Karriere-Skip bis hierher durchgehen (ui-shell 6).
 */
export function Z8() {
  const angesehen = useFortschritt().answers.z7?.angesehen ?? []
  const zuletzt = angesehen[angesehen.length - 1]
  const aufhaenger = (zuletzt && karriereweg(zuletzt)?.aufhaenger) || AUFHAENGER_OHNE

  return (
    <StepShell
      id="Z8"
      buehne={<StepFoto id="Z8" />}
      fachtext={<p>{aufhaenger}</p>}
      fuss={<StepFuss id="Z8" />}
    />
  )
}
