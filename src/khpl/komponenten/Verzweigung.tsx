import { ArrowRight, Check } from 'lucide-react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import type { StepId } from '@/khpl/flow/steps'
import { beschreibung, einladung, weiterText } from '@/khpl/flow/uebergaenge'

/**
 * Der Fuß eines Step-Screens (khpl-ui-shell.md 5): Abstecher-Angebot **und**
 * Weiter — nie nur das eine.
 *
 * khpl-flow.md 6.7: An Verzweigungspunkten sieht der Besucher eine echte Wahl,
 * sichtbar als Baum, nicht versteckt. Und 6.6: *Weiter* ist immer freigeschaltet,
 * auch bei ungelöster Interaktion — wer an M4 hängen bleibt, darf nicht am
 * Stand festsitzen.
 *
 * **Eine Farbe, eine Bedeutung.** Das war schon vorher die Regel, aber sie war
 * nur über Füllung und Umriss codiert, und beides in derselben Farbe. Jetzt
 * trägt jede Sorte Handlung eine eigene:
 *
 *   Orange (`weiter`)   — der Weg nach vorn. Genau einer pro Screen.
 *   Gelbgrün (`aktion`) — die Handlung *in* der Übung: prüfen, auflösen.
 *   Grau (`neben`)      — Abstecher. Gleichrangig untereinander, nachrangig
 *                         gegenüber dem Weg nach vorn.
 *
 * Damit fällt `gedaempft` weg. Der Vorgänger ließ *Weiter* während einer
 * offenen Übung auf den Umriss zurücktreten, weil es sonst mit der Aktion um
 * dieselbe Farbe konkurrierte — und damit sah der einzige garantierte Ausweg
 * aus wie ein gesperrter Knopf. Zwei Farben lösen dasselbe Problem, ohne den
 * Ausweg zu verstecken.
 */
export function Verzweigung({
  offen,
  weiterVon,
  onAbstecher,
  onWeiter,
  ohneWeiter = false,
  geschafft = null,
  aktion = null,
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
   * sitzt“, „Alles geladen“.
   *
   * Die Abnahme hat als Kernproblem benannt, dass nichts feiert und nichts
   * reagiert. `Rueckmeldung` beantwortet den einzelnen Versuch, dieser Streifen
   * beantwortet den ganzen Schritt: er steht direkt neben dem Weiter-Knopf und
   * sagt „das hier ist fertig, du kannst gehen“.
   */
  geschafft?: string | null
  /**
   * Die Handlung, die die Übung dieses Steps abschließt — „Schnitt setzen“,
   * „Und jetzt die echte Zahl“.
   *
   * Sie steht hier im **angehefteten** Fuß und nicht mehr unten in der
   * Übung. Der Grund ist gemessen, nicht stilistisch: das Panel scrollt, und
   * auf M1 (zehn Checklistenpunkte) und M4 (Zeichnung, Regler, Winkelwahl) lag
   * der Knopf, der die Übung überhaupt auflöst, unterhalb der Kante. Wer
   * nicht auf die Idee kam zu scrollen, sah eine Aufgabe ohne Antwortknopf.
   *
   * Sobald `geschafft` steht, ist die Übung vorbei und der Streifen nimmt den
   * Platz ein — beides zugleich wäre ein erledigter Knopf neben seiner eigenen
   * Erfolgsmeldung.
   */
  aktion?: React.ReactNode
}) {
  const hatAngebot = offen.length > 0

  return (
    <div className="flex flex-col gap-3">
      {hatAngebot && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col gap-2"
        >
          <p className="kh-etikett text-kh-paper/45">
            {/* Eine Einladung klingt anders als eine Auswahl — deshalb zwei
                Überschriften, beide aus der Spec (ui-shell 5 / flow 6.7). */}
            {offen.length === 1 ? 'Noch eine Minute?' : 'Wie tief willst du rein?'}
          </p>
          <div className="flex flex-col gap-2 landscape:flex-row">
            {offen.map((id) => {
              const zeile = beschreibung(id)
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onAbstecher(id)}
                  data-testid={`abstecher-${id}`}
                  className="group flex min-h-[64px] flex-1 items-center gap-3 rounded-kh border-2 border-kh-line-strong bg-white/6 px-4 py-2.5 text-left transition-transform active:scale-[0.97]"
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
        </motion.div>
      )}

      {(geschafft || aktion || !ohneWeiter) && (
        <div className="flex flex-wrap items-center justify-end gap-3">
          {!geschafft && aktion && <div className="mr-auto">{aktion}</div>}
          {geschafft && (
            <motion.p
              initial={{ opacity: 0, scale: 0.8, rotate: -6 }}
              animate={{ opacity: 1, scale: 1, rotate: -2 }}
              transition={{ type: 'spring', stiffness: 460, damping: 18 }}
              data-testid="geschafft"
              // Der Stempel. Leicht gedreht, in Warnwestengelb, mit schwarzer
              // Schrift darauf — die einzige Stelle im System, an der die
              // Signalfarbe Fläche wird.
              className="mr-auto flex items-center gap-2 rounded-kh-pill bg-kh-signal px-4 py-2 text-[1rem] font-bold text-[#0E0D0B] uppercase"
            >
              <Check className="size-4 shrink-0" strokeWidth={3.5} aria-hidden />
              {geschafft}
            </motion.p>
          )}

          {!ohneWeiter && (
            <Button
              onClick={onWeiter}
              variant="weiter"
              size="lg"
              className="min-w-[9rem]"
              data-testid="weiter"
            >
              {weiterText(weiterVon)}
              <ArrowRight className="size-5" strokeWidth={2.5} />
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
