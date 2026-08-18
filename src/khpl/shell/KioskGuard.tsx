import { useCallback, useEffect, useRef, useState } from 'react'
import { MotionConfig } from 'motion/react'
import { Button } from '@/components/ui/button'
import { setTheme } from '@/lib/theme'
import {
  pruefeVerfall,
  setzeZurueck,
  useBildschirm,
  useFortschritt,
  zumSplash,
} from '@/khpl/store/fortschritt'
import { useStaffDialogAnmeldung } from './staffAusgang'

/**
 * Kiosk-Verhalten nach khpl-flow.md 5 und khpl-ui-shell.md 7 + 8.
 *
 * **Idle.** 60 s ohne Berührung → „Bist du noch da?“, weitere 15 s → zurück auf
 * den Attract-Loop. Die Zahlen stehen so in flow 5 *und* flow 11; ui-shell 7
 * nennt 90/60, bezeichnet sie aber selbst als gesetzte Annahme (ui-shell 9.3).
 * Für einen Stand mit Laufkundschaft zählt, wie schnell der Attract-Loop wieder
 * jemanden anzieht — zweieinhalb Minuten totes Bild sind zweieinhalb Minuten
 * ohne Gespräch.
 *
 * **Was der Reset tut, kommt dagegen aus ui-shell 7: er löscht nichts.** Er
 * bringt die App nur auf S0; der nächste Besucher wählt dort „Neu starten“, wer
 * kurz abgelenkt war „Weitermachen“. Den Rest erledigt die 30-Minuten-Frist.
 *
 * **Theme.** Die Kiosk-Instanz ist auf `light` gepinnt — ein Jugendlicher, der
 * das Gerät versehentlich umschaltet, ist kein Feature. `?web=1` gibt den
 * Schalter für den Web- und Schuleinsatz wieder frei.
 */

const IDLE_HINWEIS_MS = 60_000
const IDLE_RESET_MS = 15_000

/**
 * Screens, auf denen eine Minute Stillstand normal ist — dort wäre die Frage
 * „Bist du noch da?“ eine Unterbrechung, keine Hilfe.
 *
 * M6 ist die Mittagspause: der Regiehinweis vom Board lautet „Schau einmal vom
 * iPad hoch“, und die Umsetzung verlangt ausdrücklich kein Drängen (flow 7 M6).
 * M5 ist eine halbe Minute Zuschauen plus eine Karte, die gelesen werden will.
 * M8 ist der Rückblick, und B9.1–B9.3 sind vier Faktenblöcke am Stück — genau
 * die Stellen, an denen jemand liest, statt zu tippen.
 */
const GEDULD: Partial<Record<string, number>> = {
  M6: 3,
  M5: 3,
  M8: 3,
  'B9.1': 3,
  'B9.2': 3,
  'B9.3': 3,
}

/** Wie oft der Splash prüft, ob der gespeicherte Stand abgelaufen ist. */
const VERFALL_TAKT_MS = 20_000

export function istWebModus(): boolean {
  return new URLSearchParams(window.location.search).get('web') === '1'
}

export function KioskGuard({ children }: { children: React.ReactNode }) {
  const bildschirm = useBildschirm()
  const { currentStepId } = useFortschritt()
  const [hinweis, setHinweis] = useState(false)
  const [staff, setStaff] = useState(false)
  const uhr = useRef(0)

  // Die Geste selbst haengt an den Screens (leere Dehnfuge in der Leiste, Logo
  // auf dem Splash) — hier liegt nur das Fenster, das sie oeffnet.
  const oeffnen = useCallback(() => setStaff(true), [])
  useStaffDialogAnmeldung(oeffnen)

  useEffect(() => {
    if (!istWebModus()) setTheme('light')
  }, [])

  const geduld = (bildschirm === 'step' && GEDULD[currentStepId]) || 1

  const zuruecksetzen = useCallback(() => {
    setHinweis(false)
    window.clearTimeout(uhr.current)
    uhr.current = window.setTimeout(() => {
      setHinweis(true)
      uhr.current = window.setTimeout(zumSplash, IDLE_RESET_MS)
    }, IDLE_HINWEIS_MS * geduld)
  }, [geduld])

  useEffect(() => {
    // Auf dem Splash läuft keine Idle-Uhr: dort ist Stillstand der Normalzustand.
    // Stattdessen läuft dort die Verfallsprüfung — sonst böte der Splash
    // stundenlang an, die Sitzung eines Fremden fortzusetzen.
    if (bildschirm === 'splash') {
      window.clearTimeout(uhr.current)
      setHinweis(false)
      pruefeVerfall()
      const takt = window.setInterval(pruefeVerfall, VERFALL_TAKT_MS)
      return () => window.clearInterval(takt)
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
    // Endlosanimationen (motion/react) laufen sonst auch bei „Bewegung
    // reduzieren“ weiter — die CSS-Regel in index.css erreicht sie nicht, weil
    // motion aus JavaScript animiert.
    <MotionConfig reducedMotion="user">
      {children}

      {hinweis && (
        <div
          data-testid="idle-hinweis"
          className="fixed inset-0 z-[60] grid animate-fade-up place-items-center bg-kh-ink/70 backdrop-blur-[3px]"
        >
          <div className="flex flex-col items-center gap-6 px-6 text-center">
            <p className="kh-step-titel text-white">Bist du noch da?</p>
            <p className="kh-fachtext text-white/85">
              Tipp irgendwo hin, dann geht es weiter.
            </p>
            <Button onClick={zuruecksetzen} size="lg" className="h-[60px]">
              Ja, weiter
            </Button>
          </div>
        </div>
      )}

      <StaffDialog offen={staff} onSchliessen={() => setStaff(false)} />
    </MotionConfig>
  )
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
    // `stopPropagation`, weil dieser Dialog auch über dem Splash liegt, und der
    // Splash startet bei jedem Klick eine neue Sitzung. Ohne das würde
    // „Abbrechen“ das Gerät genau in den Zustand versetzen, den das
    // Standpersonal gerade verlassen wollte.
    <div
      onClick={(e) => e.stopPropagation()}
      data-testid="staff-dialog"
      className="fixed inset-0 z-[70] grid place-items-center bg-black/50 p-6"
    >
      <div className="flex w-[min(28rem,92vw)] flex-col gap-4 rounded-kh bg-kh-surface p-7 shadow-2xl">
        <h2 className="kh-h3 text-kh-ink">Standpersonal</h2>
        <p className="text-kh-grey">Wenn etwas hängt oder der nächste Besucher wartet.</p>
        <div className="flex flex-col gap-2">
          <Button
            onClick={() => {
              setzeZurueck()
              onSchliessen()
            }}
            data-testid="staff-neu"
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
