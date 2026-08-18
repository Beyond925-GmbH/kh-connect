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
        <BaseDialog.Backdrop className="fixed inset-0 z-40 bg-black/45 transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <BaseDialog.Popup
          data-testid="dein-weg"
          className="fixed inset-y-0 left-0 z-50 flex w-[min(30rem,92vw)] flex-col bg-kh-surface shadow-2xl outline-none transition-transform duration-250 data-[ending-style]:-translate-x-full data-[starting-style]:-translate-x-full"
        >
          <header className="flex shrink-0 items-center justify-between border-b border-kh-rule px-6 py-4">
            <BaseDialog.Title className="kh-h3 text-kh-ink">Dein Weg</BaseDialog.Title>
            <BaseDialog.Close
              aria-label="Schließen"
              className="grid size-11 place-items-center rounded-kh text-kh-grey transition-colors hover:bg-kh-band"
            >
              <X className="size-5" strokeWidth={1.5} />
            </BaseDialog.Close>
          </header>

          <ol className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3">
            {HAUPTSCHRITTE.map((haupt) => (
              <li key={haupt.id}>
                <Zeile
                  id={haupt.id}
                  fortschritt={fortschritt}
                  onSpringe={onSpringe}
                  onSchliessen={onSchliessen}
                />
                {haupt.abstecher.length > 0 && (
                  <ol className="mb-1 ml-7 border-l border-kh-rule pl-3">
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
          <CornerDownRight className="size-4 text-kh-grey/40" strokeWidth={1.5} />
        ) : zustand === 'besucht' ? (
          <Check className="size-5 text-kh-orange" strokeWidth={2.5} />
        ) : zustand === 'aktuell' ? (
          <span className="size-3 rounded-full bg-kh-orange ring-4 ring-kh-orange/25" />
        ) : (
          <span className="size-2.5 rounded-full border border-kh-rule" />
        )}
      </span>
      {/* `kurz`, nicht `titel`: das Sheet ist eine Liste von Stationen, keine
          Sammlung von Überschriften. „Jetzt du“ sagt als gesperrte Zukunftszeile
          nichts, „Dach aufrichten II“ sagt alles. */}
      <span className="min-w-0 flex-1 truncate text-left">{def.kurz}</span>
      {zustand === 'aktuell' && (
        <span className="shrink-0 text-[13px] whitespace-nowrap text-kh-orange">
          du bist hier
        </span>
      )}
      {nichtGenommen && (
        <span className="shrink-0 text-[13px] whitespace-nowrap text-kh-grey/50">
          nicht angeschaut
        </span>
      )}
    </>
  )

  const basis =
    'flex w-full items-center gap-3 rounded-kh px-3 py-3 text-[16px] min-h-[52px] transition-colors'

  if (!antippbar) {
    return (
      <div
        data-testid={`weg-${id}`}
        data-zustand={zustand}
        className={`${basis} ${
          zustand === 'aktuell'
            ? 'bg-kh-band-soft font-normal text-kh-ink'
            : 'text-kh-grey/45'
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
      className={`${basis} cursor-pointer text-kh-grey hover:bg-kh-band-soft hover:text-kh-ink`}
    >
      {inhalt}
    </button>
  )
}
