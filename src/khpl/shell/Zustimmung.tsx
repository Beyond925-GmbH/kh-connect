import { Button } from '@/components/ui/button'
import { istAnalytikBereit } from '@/lib/analytik'
import { merkeAnalytik, useAnalytikWahl, useBildschirm } from '@/khpl/store/fortschritt'

/**
 * Der Zustimmungsdialog für Stufe 2 der Analytik (`lib/analytik.ts`).
 *
 * Er erscheint genau einmal je Besucher: auf der Helmwahl — dem ersten Screen
 * nach dem Splash — und nur, solange die Sitzung keine Entscheidung trägt. Mit
 * Verfall oder Reset erlischt die Entscheidung, der nächste Besucher wird
 * selbst gefragt (DSGVO: Zustimmung gilt der Person, nicht dem Gerät).
 *
 * Wer den Screen ohne Entscheidung verlässt, bleibt anonym — die Frage kommt
 * nicht wieder. Beide Knöpfe sind gleich groß und gleich gebaut: eine
 * Zustimmung, die leichter zu treffen ist als die Ablehnung, ist keine
 * (Art. 7 Abs. 3 DSGVO, „freiwillig“).
 *
 * Die anonyme Zählung aus Stufe 1 steht hier bewusst mit im Text: sie braucht
 * keine Einwilligung (nichts liegt auf dem Gerät), aber sie gehört gesagt —
 * Transparenz nach Art. 13 leistet daneben der Aushang am Stand.
 */
export function Zustimmung() {
  const bildschirm = useBildschirm()
  const wahl = useAnalytikWahl()

  if (!istAnalytikBereit() || wahl !== null || bildschirm !== 'helm') return null

  return (
    <div
      data-testid="zustimmung"
      className="fixed inset-0 z-[55] grid animate-fade-up place-items-center bg-black/70 p-6 backdrop-blur-sm"
    >
      <div className="flex w-[min(30rem,92vw)] flex-col gap-4 rounded-kh-lg border-t-4 border-kh-orange bg-kh-raised p-7 shadow-[0_28px_80px_rgba(0,0,0,0.7)]">
        <h2 className="kh-titel-klein">Kurz vorweg</h2>
        <p className="text-[1.0625rem] text-kh-mute">
          Wir zählen anonym und ohne Cookies mit, wie dieser Stand genutzt wird. Dürfen
          wir zusätzlich für deine Sitzung die Bedienung aufzeichnen — nur Taps und
          Screens, ohne Namen — damit wir die App besser machen können?
        </p>
        <div className="flex flex-col items-stretch gap-2 sm:flex-row">
          <Button
            onClick={() => merkeAnalytik('voll')}
            data-testid="zustimmung-voll"
            variant="weiter"
            className="sm:flex-1"
          >
            Ja, einverstanden
          </Button>
          <Button
            onClick={() => merkeAnalytik('anonym')}
            data-testid="zustimmung-anonym"
            variant="neben"
            className="sm:flex-1"
          >
            Nein, nur anonym
          </Button>
        </div>
      </div>
    </div>
  )
}
