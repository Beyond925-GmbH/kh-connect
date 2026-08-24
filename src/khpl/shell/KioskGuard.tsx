import { useCallback, useEffect, useRef, useState } from 'react'
import { MotionConfig } from 'motion/react'
import { Button } from '@/components/ui/button'
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
 * **Theme.** Es gibt keins mehr. Das Designsystem „Baustelle“ ist einfarbig
 * dunkel (siehe `index.css`), und damit entfallen Schalter, Pinnen und der
 * Sonderfall `?web=1` gleich mit.
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
 *
 * C5, Z4 und A5 sind die Zäsuren der drei anderen Tage (die Fahrt mit dem
 * Element, der Messraum, der Mittag im Transporter) — alle drei mit demselben
 * Argument wie M6, von den Tagen gemeldet statt gebaut (khpl-tage.md 6.2).
 */
const GEDULD: Partial<Record<string, number>> = {
  M6: 3,
  M5: 3,
  M8: 3,
  'B9.1': 3,
  'B9.2': 3,
  'B9.3': 3,
  C5: 3,
  Z4: 3,
  A5: 3,
}

/** Wie oft der Splash prüft, ob der gespeicherte Stand abgelaufen ist. */
const VERFALL_TAKT_MS = 20_000

export function KioskGuard({ children }: { children: React.ReactNode }) {
  const bildschirm = useBildschirm()
  const { currentStepId } = useFortschritt()
  const [hinweis, setHinweis] = useState(false)
  const [staff, setStaff] = useState(false)
  const uhr = useRef(0)
  /** Sekunden bis zum Rücksprung — läuft nur, solange der Hinweis steht. */
  const [rest, setRest] = useState(IDLE_RESET_MS / 1000)

  // Die Geste selbst hängt an den Screens (leere Dehnfuge in der Leiste, Logo
  // auf dem Splash) — hier liegt nur das Fenster, das sie öffnet.
  const oeffnen = useCallback(() => setStaff(true), [])
  useStaffDialogAnmeldung(oeffnen)

  const geduld = (bildschirm === 'step' && GEDULD[currentStepId]) || 1

  const zuruecksetzen = useCallback(() => {
    setHinweis(false)
    window.clearTimeout(uhr.current)
    uhr.current = window.setTimeout(() => {
      setRest(IDLE_RESET_MS / 1000)
      setHinweis(true)
      uhr.current = window.setTimeout(zumSplash, IDLE_RESET_MS)
    }, IDLE_HINWEIS_MS * geduld)
  }, [geduld])

  // Der Zählstand hängt am Hinweis, nicht an der Uhr oben: die entscheidet,
  // wann zurückgesprungen wird, diese hier sagt es nur an.
  useEffect(() => {
    if (!hinweis) return
    const takt = window.setInterval(() => setRest((s) => Math.max(0, s - 1)), 1000)
    return () => window.clearInterval(takt)
  }, [hinweis])

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
          className="fixed inset-0 z-[60] grid animate-fade-up place-items-center bg-kh-ink/80 backdrop-blur-md"
        >
          <div className="flex flex-col items-center gap-6 px-6 text-center">
            <p className="kh-titel">Bist du noch da?</p>
            {/*
              Was passiert, wenn man nichts tut, stand nicht da. „Tipp irgendwo
              hin, dann geht es weiter“ beschreibt nur den einen Ausgang; der
              andere — in wenigen Sekunden ist der Screen weg — war eine
              Überraschung. Der Zählstand ist eine Zahl und keine Animation:
              die CSS-Regel für „Bewegung reduzieren“ setzt jede Laufzeit auf
              0,01 ms, ein laufender Ring wäre dort sofort leer und würde
              lügen.
            */}
            <p className="kh-fachtext">
              Tipp irgendwo hin, dann geht es weiter.
              <br />
              <span className="text-kh-paper/55">
                Sonst fängt der Stand in{' '}
                <span className="tabular-nums text-kh-orange">{rest}</span> Sekunden von
                vorn an.
              </span>
            </p>
            <Button onClick={zuruecksetzen} variant="weiter" size="lg">
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
      className="fixed inset-0 z-[70] grid place-items-center bg-black/70 p-6 backdrop-blur-sm"
    >
      <div className="flex w-[min(28rem,92vw)] flex-col gap-4 rounded-kh-lg border-t-4 border-kh-orange bg-kh-raised p-7 shadow-[0_28px_80px_rgba(0,0,0,0.7)]">
        <h2 className="kh-titel-klein">Standpersonal</h2>
        <p className="text-[1.0625rem] text-kh-mute">
          Wenn etwas hängt oder der nächste Besucher wartet.
        </p>
        <div className="flex flex-col gap-2">
          <Button
            onClick={() => {
              setzeZurueck()
              onSchliessen()
            }}
            data-testid="staff-neu"
            variant="weiter"
            className="w-full"
          >
            Neu starten
          </Button>
          <Button
            variant="neben"
            onClick={() => window.location.reload()}
            className="w-full"
          >
            App neu laden
          </Button>
          <Button variant="leise" onClick={onSchliessen} className="w-full">
            Abbrechen
          </Button>
        </div>
      </div>
    </div>
  )
}
