import { Dialog as BaseDialog } from '@base-ui/react/dialog'
import { Check, CornerDownRight, X } from 'lucide-react'
import { HAUPTSCHRITTE, STEPS, type StepId } from '@/khpl/flow/steps'
import { wegzustand } from '@/khpl/flow/uebergaenge'
import type { Fortschritt } from '@/khpl/store/fortschritt'

/**
 * S3 „Dein Weg“ (khpl-ui-shell.md 4) — die Antwort auf „Was habe ich bisher
 * gemacht?“.
 *
 * Die ganze Hauptlinie als Liste, Abstecher eingerückt unter ihrem
 * Elternschritt. ✓ ist antippbar (Nachlesen, Interaktion wiederholen), ● ist
 * die aktuelle Stelle, ○ ist sichtbar aber gesperrt — **nach vorne springt
 * niemand**, sonst bricht das Paar `Teach:` (M5) → `Abfrage:` (M7).
 *
 * Nicht genommene Abstecher bleiben sichtbar. Sie zeigen, was es noch zu holen
 * gäbe, ohne dass ein Schritt „unvollständig“ wirkt.
 */
export function DeinWeg({
  offen,
  fortschritt,
  onSchliessen,
  onSpringe,
}: {
  offen: boolean
  fortschritt: Fortschritt
  onSchliessen: () => void
  onSpringe: (ziel: StepId) => void
}) {
  return (
    <BaseDialog.Root open={offen} onOpenChange={(auf) => !auf && onSchliessen()}>
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <BaseDialog.Popup
          data-testid="dein-weg"
          className="fixed inset-y-0 left-0 z-50 flex w-[min(30rem,92vw)] flex-col bg-kh-surface shadow-[0_0_80px_rgba(0,0,0,0.8)] outline-none transition-transform duration-250 data-[ending-style]:-translate-x-full data-[starting-style]:-translate-x-full"
        >
          {/* Das Warnband oben ist die einzige Stelle, an der das Sheet die
              Marke trägt — ein oranger Balken darüber wäre ein zweites
              Orange neben dem, das im Sheet schon die Häkchen macht. */}
          <div aria-hidden className="kh-warnband h-1.5 shrink-0" />
          <header className="flex shrink-0 items-center justify-between border-b border-kh-line px-5 py-3">
            <BaseDialog.Title className="kh-titel-klein">Dein Weg</BaseDialog.Title>
            <BaseDialog.Close
              aria-label="Schließen"
              className="grid size-12 place-items-center rounded-kh-pill bg-white/6 text-kh-paper transition-transform active:scale-90"
            >
              <X className="size-5" strokeWidth={2.25} />
            </BaseDialog.Close>
          </header>

          <ol className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-2">
            {HAUPTSCHRITTE.map((haupt) => (
              <li key={haupt.id}>
                <Zeile
                  id={haupt.id}
                  fortschritt={fortschritt}
                  onSpringe={onSpringe}
                  onSchliessen={onSchliessen}
                />
                {haupt.abstecher.length > 0 && (
                  <ol className="mb-0.5 ml-7 border-l-2 border-kh-line pl-3">
                    {haupt.abstecher.map((id) => (
                      <li key={id}>
                        <Zeile
                          id={id}
                          eingerueckt
                          fortschritt={fortschritt}
                          onSpringe={onSpringe}
                          onSchliessen={onSchliessen}
                        />
                      </li>
                    ))}
                  </ol>
                )}
              </li>
            ))}
          </ol>
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  )
}

function Zeile({
  id,
  eingerueckt = false,
  fortschritt,
  onSpringe,
  onSchliessen,
}: {
  id: StepId
  eingerueckt?: boolean
  fortschritt: Fortschritt
  onSpringe: (ziel: StepId) => void
  onSchliessen: () => void
}) {
  const zustand = wegzustand(id, fortschritt)
  const def = STEPS[id]
  const antippbar = zustand === 'besucht'
  const nichtGenommen = eingerueckt && zustand === 'offen'

  const inhalt = (
    <>
      <span className="grid size-6 shrink-0 place-items-center" aria-hidden>
        {eingerueckt && zustand === 'offen' ? (
          <CornerDownRight className="size-4 text-kh-mute/50" strokeWidth={2} />
        ) : zustand === 'besucht' ? (
          <span className="grid size-6 place-items-center rounded-full bg-kh-orange text-[#0E0D0B]">
            <Check className="size-4" strokeWidth={3.5} />
          </span>
        ) : zustand === 'aktuell' ? (
          <span className="size-3.5 rounded-full bg-kh-signal ring-4 ring-kh-signal/25" />
        ) : (
          <span className="size-2.5 rounded-full border-2 border-white/25" />
        )}
      </span>
      {/*
        Zwei Beschriftungen, je nach Zustand — und das ist der Punkt, an dem sich
        die beiden Abnahmen widersprochen haben.

        Wer den Screen gesehen hat, erinnert sich an seine Überschrift: „Was
        kostet dieses Dach?“. Ihm „Angebots-Kalkulation, Vertrag“ vorzusetzen,
        ist eine zweite Sprache, die er nie gelesen hat. Wer den Screen noch
        nicht gesehen hat, kann mit „Jetzt du“ dagegen nichts anfangen — da ist
        der beschreibende Board-Name richtig.

        Also: besucht und aktuell zeigen `titel`, gesperrt zeigt `kurz`.
      */}
      <span className="min-w-0 flex-1 truncate text-left">
        {zustand === 'offen' ? def.kurz : def.titel}
      </span>
      {zustand === 'aktuell' && (
        <span className="shrink-0 rounded-kh-pill bg-kh-signal px-2.5 py-1 text-[0.8125rem] font-bold whitespace-nowrap text-[#0E0D0B] uppercase">
          du bist hier
        </span>
      )}
      {nichtGenommen && (
        <span className="shrink-0 text-[0.875rem] whitespace-nowrap text-kh-mute/60">
          nicht angeschaut
        </span>
      )}
    </>
  )

  const basis =
    'flex w-full items-center gap-3 rounded-kh px-3 py-1.5 text-[1.0625rem] min-h-[52px] transition-colors'

  if (!antippbar) {
    return (
      <div
        data-testid={`weg-${id}`}
        data-zustand={zustand}
        className={`${basis} ${
          zustand === 'aktuell'
            ? 'bg-white/8 font-semibold text-kh-paper'
            : 'text-kh-mute/50'
        }`}
        aria-current={zustand === 'aktuell' ? 'step' : undefined}
      >
        {inhalt}
      </div>
    )
  }

  return (
    <button
      type="button"
      data-testid={`weg-${id}`}
      data-zustand={zustand}
      onClick={() => {
        onSpringe(id)
        onSchliessen()
      }}
      className={`${basis} cursor-pointer text-kh-paper/85 transition-transform active:scale-[0.98] active:bg-white/8`}
    >
      {inhalt}
    </button>
  )
}
