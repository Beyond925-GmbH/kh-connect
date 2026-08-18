import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { setTheme } from '@/lib/theme'
import { setzeZurueck, useBildschirm, zumSplash } from '@/khpl/store/fortschritt'

/**
 * Kiosk-Verhalten nach khpl-ui-shell.md 7 + 8.
 *
 * **Idle.** 90 s ohne Berührung → „Bist du noch da?“, weitere 60 s → zurück auf
 * S0, **ohne** zu löschen. Das ist die bewusste Auflösung des Konflikts zwischen
 * Persistenz und geteiltem Gerät: der nächste Besucher sieht einen sauberen
 * Startbildschirm und wählt „Neu starten“, wer nur kurz abgelenkt war
 * „Weitermachen“. (khpl-flow.md 5 nennt noch 60 s / 15 s **mit** hartem Reset;
 * die UI-Shell-Spec ist die spätere und löst den Widerspruch ausdrücklich auf.)
 *
 * **Theme.** Die Kiosk-Instanz ist auf `light` gepinnt — ein Jugendlicher, der
 * das Gerät versehentlich umschaltet, ist kein Feature. `?web=1` gibt den
 * Schalter für den Web- und Schuleinsatz wieder frei.
 */

const IDLE_HINWEIS_MS = 90_000
const IDLE_RESET_MS = 60_000

export function istWebModus(): boolean {
  return new URLSearchParams(window.location.search).get('web') === '1'
}

export function KioskGuard({ children }: { children: React.ReactNode }) {
  const bildschirm = useBildschirm()
  const [hinweis, setHinweis] = useState(false)
  const uhr = useRef(0)

  useEffect(() => {
    if (!istWebModus()) setTheme('light')
  }, [])

  const zuruecksetzen = useCallback(() => {
    setHinweis(false)
    window.clearTimeout(uhr.current)
    uhr.current = window.setTimeout(() => {
      setHinweis(true)
      uhr.current = window.setTimeout(zumSplash, IDLE_RESET_MS)
    }, IDLE_HINWEIS_MS)
  }, [])

  useEffect(() => {
    // Auf dem Splash läuft keine Uhr: dort ist Stillstand der Normalzustand.
    if (bildschirm === 'splash') {
      window.clearTimeout(uhr.current)
      setHinweis(false)
      return
    }

    zuruecksetzen()
    const events = ['pointerdown', 'keydown', 'wheel'] as const
    events.forEach((e) => window.addEventListener(e, zuruecksetzen, { passive: true }))
    return () => {
      window.clearTimeout(uhr.current)
      events.forEach((e) => window.removeEventListener(e, zuruecksetzen))
    }
  }, [bildschirm, zuruecksetzen])

  return (
    <>
      {children}
      {hinweis && (
        <div
          data-testid="idle-hinweis"
          className="fixed inset-0 z-[60] grid animate-fade-up place-items-center bg-kh-page/92 backdrop-blur-[2px]"
        >
          <div className="flex flex-col items-center gap-6 px-6 text-center">
            <p className="kh-step-titel">Bist du noch da?</p>
            <p className="kh-fachtext">Tipp irgendwo hin, dann geht es weiter.</p>
            <Button onClick={zuruecksetzen} size="lg" className="h-[60px]">
              Ja, weiter
            </Button>
          </div>
        </div>
      )}
    </>
  )
}

/**
 * Der Staff-Ausgang (khpl-ui-shell.md 8): fünf schnelle Taps auf das Logo.
 * Für den Fall, dass etwas hängt und der nächste Besucher schon wartet.
 */
export function useStaffAusgang(onOeffnen: () => void) {
  const taps = useRef<number[]>([])

  return useCallback(() => {
    const jetzt = Date.now()
    taps.current = [...taps.current, jetzt].filter((t) => jetzt - t < 2500)
    if (taps.current.length >= 5) {
      taps.current = []
      onOeffnen()
    }
  }, [onOeffnen])
}

/** Das Menü hinter dem Staff-Ausgang. Zwei Ausgänge, mehr braucht es nicht. */
export function StaffDialog({
  offen,
  onSchliessen,
}: {
  offen: boolean
  onSchliessen: () => void
}) {
  if (!offen) return null
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/50 p-6">
      <div className="flex w-[min(28rem,92vw)] flex-col gap-4 rounded-kh bg-kh-surface p-7 shadow-2xl">
        <h2 className="kh-h3 text-kh-ink">Standpersonal</h2>
        <p className="text-kh-grey">Wenn etwas hängt oder der nächste Besucher wartet.</p>
        <div className="flex flex-col gap-2">
          <Button
            onClick={() => {
              setzeZurueck()
              onSchliessen()
            }}
            className="h-[60px] w-full"
          >
            Neu starten
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="h-[60px] w-full"
          >
            App neu laden
          </Button>
          <Button variant="ghost" onClick={onSchliessen} className="h-[60px] w-full">
            Abbrechen
          </Button>
        </div>
      </div>
    </div>
  )
}
