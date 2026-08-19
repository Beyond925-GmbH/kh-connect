import { useState } from 'react'
import { Dialog as BaseDialog } from '@base-ui/react/dialog'
import { ArrowRight, Check } from 'lucide-react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import type { StepId } from '@/khpl/flow/steps'
import { beschreibung, einladung, weiterText } from '@/khpl/flow/uebergaenge'

/**
 * Der Fuß eines Step-Screens (khpl-ui-shell.md 5).
 *
 * **Der wichtigste Knopf ist der, der die Aufgabe löst — nicht der, der sie
 * verlässt.** Solange eine Übung offen ist, sitzt die `aktion` unten rechts
 * als einzige laute Fläche, und *Weiter* schrumpft auf ein leises
 * „Überspringen“. Vorher stand auf jedem Screen ein oranger Weiter-Knopf an
 * der Primärposition — auf einem Übungs-Screen war damit ausgerechnet der Weg
 * *aus* der Aufgabe die lauteste Handlung darauf. Freigeschaltet bleibt der
 * Ausweg trotzdem; niemand sitzt am Stand fest (flow 6.6).
 *
 * **Abstecher werden nicht mehr im Fuß beworben, sondern beim Weitergehen
 * angeboten.** Die Inline-Karten unter „Wie tief willst du rein?“ hat kein
 * Besucher als Wahl gelesen — sie waren zwei weitere graue Kästen zwischen
 * Übung und Knopf, und die Kopfzeile darüber las niemand. Jetzt öffnet der Weg
 * nach vorn ein Fenster mit genau einer Frage: „Wohin als Nächstes?“ — die
 * Abstecher als Karten, der Hauptweg als gefüllter Knopf darunter. Eine
 * Entscheidung, ein Moment. Flow 6.7 („echte Wahl, sichtbar als Baum“) wird
 * damit wörtlicher erfüllt als vorher: die Wahl hat ihren eigenen Augenblick,
 * statt als Dauerwerbung am Fußrand mitzulaufen.
 *
 * Farbregeln unverändert:
 *   Orange (`weiter`)   — der Weg nach vorn. Genau einer pro Screen.
 *   Gelbgrün (`aktion`) — die Handlung *in* der Übung: prüfen, auflösen.
 */
export function Verzweigung({
  offen,
  weiterVon,
  onAbstecher,
  onWeiter,
  ohneWeiter = false,
  geschafft = null,
  aktion = null,
  uebungOffen = false,
}: {
  /** Noch nicht genommene Abstecher, in Anzeigereihenfolge. */
  offen: StepId[]
  /** Step, dessen Weiter-Text gilt. */
  weiterVon: StepId
  onAbstecher: (id: StepId) => void
  onWeiter: () => void
  ohneWeiter?: boolean
  /**
   * Kurze Bestätigung, sobald die Übung dieses Steps gelöst ist — „Zuschnitt
   * sitzt“, „Alles geladen“. Steht direkt neben dem Weiter-Knopf und sagt
   * „das hier ist fertig, du kannst gehen“.
   */
  geschafft?: string | null
  /**
   * Die Handlung, die die Übung dieses Steps abschließt — „Schnitt setzen“,
   * „Und jetzt die echte Zahl“. Sitzt im angehefteten Fuß, damit sie nie
   * unterhalb der Scrollkante liegt — und solange die Übung offen ist an der
   * Primärposition unten rechts.
   */
  aktion?: React.ReactNode
  /**
   * Solange `true`, ist die Übung dieses Steps ungelöst: die `aktion` (falls
   * vorhanden) ist der Hauptknopf, und *Weiter* tritt auf „Überspringen“
   * zurück. Auch für Übungen ohne eigenen Prüfknopf (Ziehen, Antippen)
   * setzen — dort ist die Bühne die Handlung, und ein lauter Weiter-Knopf
   * daneben sagt „lass es einfach“.
   */
  uebungOffen?: boolean
}) {
  const [wahlOffen, setWahlOffen] = useState(false)
  const hatAngebot = offen.length > 0

  /** Jeder Weg nach vorn läuft hier durch — mit Angebot erst durch die Wahl. */
  const nachVorn = () => {
    if (hatAngebot) setWahlOffen(true)
    else onWeiter()
  }

  const ueberspringen = !ohneWeiter && (
    // Der leise Ausweg. Bewusst links der Aktion: wer ihn sucht, findet ihn —
    // wer die Aufgabe löst, sieht an der Primärposition nur die Lösung.
    <Button variant="leise" size="sm" onClick={nachVorn} data-testid="weiter">
      Überspringen
      <ArrowRight className="size-4" strokeWidth={2} />
    </Button>
  )

  return (
    <div className="flex flex-wrap items-center justify-end gap-2.5">
      {geschafft && (
        <motion.p
          initial={{ opacity: 0, scale: 0.8, rotate: -6 }}
          animate={{ opacity: 1, scale: 1, rotate: -2 }}
          transition={{ type: 'spring', stiffness: 460, damping: 18 }}
          data-testid="geschafft"
          // Der Stempel. Leicht gedreht, in Warnwestengelb, mit schwarzer
          // Schrift darauf — die einzige Stelle im System, an der die
          // Signalfarbe Fläche wird, ohne Knopf zu sein.
          className="mr-auto flex items-center gap-2 rounded-kh-pill bg-kh-signal px-3.5 py-1.5 text-[0.9375rem] font-bold text-[#0E0D0B] uppercase"
        >
          <Check className="size-4 shrink-0" strokeWidth={3.5} aria-hidden />
          {geschafft}
        </motion.p>
      )}

      {uebungOffen ? (
        <>
          {ueberspringen}
          {aktion}
        </>
      ) : (
        !ohneWeiter && (
          <Button
            onClick={nachVorn}
            variant="weiter"
            className="min-w-[9rem]"
            data-testid="weiter"
          >
            {weiterText(weiterVon)}
            <ArrowRight className="size-5" strokeWidth={2.5} />
          </Button>
        )
      )}

      {hatAngebot && (
        <WegeDialog
          offen={wahlOffen}
          angebote={offen}
          weiterVon={weiterVon}
          onSchliessen={() => setWahlOffen(false)}
          onAbstecher={(id) => {
            setWahlOffen(false)
            onAbstecher(id)
          }}
          onWeiter={() => {
            setWahlOffen(false)
            onWeiter()
          }}
        />
      )}
    </div>
  )
}

/**
 * Die Wahl beim Weitergehen. Ein eigener Moment statt Kästen am Fußrand: eine
 * Frage, die Abstecher als antippbare Karten, der Hauptweg als der eine
 * gefüllte Knopf zuunterst — an der Stelle, an der eben noch *Weiter* saß.
 * Wer einfach durch will, ist mit einem zweiten Tap durch.
 *
 * Kein X und kein Abbrechen-Knopf: jede Option führt vorwärts. Der
 * Backdrop-Tap schließt für den seltenen Fall, dass jemand doch noch einmal
 * auf den Screen zurück will.
 */
function WegeDialog({
  offen,
  angebote,
  weiterVon,
  onSchliessen,
  onAbstecher,
  onWeiter,
}: {
  offen: boolean
  angebote: StepId[]
  weiterVon: StepId
  onSchliessen: () => void
  onAbstecher: (id: StepId) => void
  onWeiter: () => void
}) {
  return (
    <BaseDialog.Root open={offen} onOpenChange={(auf) => !auf && onSchliessen()}>
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <BaseDialog.Popup
          data-testid="wege-dialog"
          className="fixed top-1/2 left-1/2 z-50 w-[min(34rem,92vw)] -translate-x-1/2 -translate-y-1/2 rounded-kh-lg border-t-4 border-kh-orange bg-kh-raised p-6 shadow-[0_28px_80px_rgba(0,0,0,0.7)] ring-1 ring-white/10 outline-none transition-all duration-200 data-[ending-style]:scale-[0.97] data-[ending-style]:opacity-0 data-[starting-style]:scale-[0.97] data-[starting-style]:opacity-0 sm:p-7"
        >
          <BaseDialog.Title className="kh-titel-klein">
            Wohin als Nächstes?
          </BaseDialog.Title>
          <BaseDialog.Description className="mt-1.5 text-[1rem] text-kh-mute">
            Du entscheidest — jeder Weg bringt dich ans Ziel.
          </BaseDialog.Description>

          <div className="mt-4 flex flex-col gap-2">
            {angebote.map((id) => {
              const zeile = beschreibung(id)
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onAbstecher(id)}
                  data-testid={`abstecher-${id}`}
                  className="flex min-h-[60px] items-center gap-3 rounded-kh border-2 border-kh-line-strong bg-white/6 px-4 py-2.5 text-left transition-transform active:scale-[0.97]"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-[1.0625rem] leading-tight font-semibold text-kh-paper">
                      {einladung(id)}
                    </span>
                    {zeile && (
                      <span className="mt-0.5 block text-[0.9375rem] leading-snug text-kh-mute">
                        {zeile}
                      </span>
                    )}
                  </span>
                  <ArrowRight
                    className="size-5 shrink-0 text-kh-orange"
                    strokeWidth={2.5}
                    aria-hidden
                  />
                </button>
              )
            })}
          </div>

          <div className="mt-4 flex justify-end border-t border-kh-line pt-4">
            <Button onClick={onWeiter} variant="weiter" data-testid="wege-weiter">
              {weiterText(weiterVon)}
              <ArrowRight className="size-5" strokeWidth={2.5} />
            </Button>
          </div>
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  )
}
