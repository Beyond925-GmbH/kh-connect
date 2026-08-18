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
 * auch bei ungelöster Interaktion — wer an M4 hängen bleibt, darf nicht am Stand
 * festsitzen.
 *
 * **Eine Regel für Orange.** Vorher konkurrierten auf einem Screen bis zu drei
 * Knöpfe: die orange Aktion der Übung (oft ausgegraut, weil noch nichts
 * angetippt war), das orange Abstecher-Angebot und ein grauer Weiter-Knopf, der
 * dadurch aussah wie der deaktivierte. Wer nicht wusste, was er tun soll, sah
 * genau das: drei Knöpfe, keinen Hinweis.
 *
 * Jetzt gilt: **eine gefüllte orange Fläche pro Screen, und die führt nach
 * vorn.** Abstecher stehen als Umriss daneben, die Aktion einer Übung ist
 * dunkel (`variant="dark"`). Weiter tritt nicht mehr grau zurück, solange die
 * Übung offen ist — es wird zum Umriss. Damit bleibt es sichtbar ein Knopf und
 * niemand hält es für gesperrt.
 */
export function Verzweigung({
  offen,
  weiterVon,
  onAbstecher,
  onWeiter,
  ohneWeiter = false,
  gedaempft = false,
  geschafft = null,
}: {
  /** Noch nicht genommene Abstecher, in Anzeigereihenfolge. */
  offen: StepId[]
  /** Step, dessen Weiter-Text gilt. */
  weiterVon: StepId
  onAbstecher: (id: StepId) => void
  onWeiter: () => void
  ohneWeiter?: boolean
  /**
   * Solange eine Übung offen ist, tritt *Weiter* auf den Umriss zurück — die
   * gefüllte Fläche gehört dann der Übung. Freigeschaltet bleibt es trotzdem;
   * niemand wird blockiert (flow 6.6).
   */
  gedaempft?: boolean
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
          {/* Als Kleinzeile, nicht als Absatz: der Fuss ist angeheftet und
              kostet auf jedem Screen Hoehe. Auf M4 drueckte die alte Fassung
              die Winkelwahl der Uebung unter die Kante. */}
          <p className="kh-eyebrow text-kh-grey/80">
            {/* Eine Einladung klingt anders als eine Auswahl — deshalb zwei
                Überschriften, beide aus der Spec (ui-shell 5 / flow 6.7). */}
            {offen.length === 1 ? 'Noch eine Minute?' : 'Wie tief willst du rein?'}
          </p>
          <div className="flex flex-col gap-2.5 landscape:flex-row">
            {offen.map((id) => {
              const zeile = beschreibung(id)
              return (
                <Button
                  key={id}
                  variant="outline"
                  onClick={() => onAbstecher(id)}
                  data-testid={`abstecher-${id}`}
                  className="h-auto min-h-[56px] flex-1 flex-col items-start justify-center gap-0 px-4 py-2 text-left whitespace-normal"
                >
                  <span className="text-[1.0625rem] leading-tight font-normal">
                    {einladung(id)}
                  </span>
                  {zeile && (
                    <span className="text-[0.9375rem] leading-snug font-light text-kh-grey">
                      {zeile}
                    </span>
                  )}
                </Button>
              )
            })}
          </div>
        </motion.div>
      )}

      {(geschafft || !ohneWeiter) && (
        <div className="flex flex-wrap items-center justify-end gap-3">
          {geschafft && (
            <motion.p
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 420, damping: 22 }}
              data-testid="geschafft"
              className="mr-auto flex items-center gap-2 text-[1.0625rem] font-normal text-kh-orange-text sm:text-[1.125rem]"
            >
              <span
                aria-hidden
                className="grid size-7 shrink-0 place-items-center rounded-full bg-kh-orange text-white"
              >
                <Check className="size-4" strokeWidth={3} />
              </span>
              {geschafft}
            </motion.p>
          )}

          {!ohneWeiter && (
            <Button
              onClick={onWeiter}
              size="lg"
              variant={gedaempft ? 'outline' : 'default'}
              className="h-[64px] min-w-[10rem] px-8 text-[1.125rem]"
              data-testid="weiter"
            >
              {weiterText(weiterVon)}
              <ArrowRight className="size-5" strokeWidth={1.75} />
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
