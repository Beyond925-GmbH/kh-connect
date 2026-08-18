import { ArrowRight } from 'lucide-react'
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
 */
export function Verzweigung({
  offen,
  weiterVon,
  onAbstecher,
  onWeiter,
  ohneWeiter = false,
  gedaempft = false,
}: {
  /** Noch nicht genommene Abstecher, in Anzeigereihenfolge. */
  offen: StepId[]
  /** Step, dessen Weiter-Text gilt. */
  weiterVon: StepId
  onAbstecher: (id: StepId) => void
  onWeiter: () => void
  ohneWeiter?: boolean
  /**
   * Solange eine Übung offen ist, tritt *Weiter* optisch zurück: sonst stehen
   * zwei orange Flächen nebeneinander und konkurrieren um denselben Daumen.
   * Freigeschaltet bleibt es trotzdem — niemand wird blockiert (flow 6.6).
   */
  gedaempft?: boolean
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
          <p className="text-[16px] font-normal text-kh-ink">
            {/* Eine Einladung klingt anders als eine Auswahl — deshalb zwei
                Überschriften, beide aus der Spec (ui-shell 5 / flow 6.7). */}
            {offen.length === 1 ? 'Noch eine Minute?' : 'Wie tief willst du rein?'}
          </p>
          <div className="flex flex-col gap-2 landscape:flex-row">
            {offen.map((id) => {
              const zeile = beschreibung(id)
              return (
                <Button
                  key={id}
                  variant="outline"
                  onClick={() => onAbstecher(id)}
                  data-testid={`abstecher-${id}`}
                  className="h-auto min-h-[60px] flex-1 flex-col items-start justify-center gap-0.5 px-5 py-3 text-left whitespace-normal"
                >
                  <span className="text-[16px] leading-tight font-normal">
                    {einladung(id)}
                  </span>
                  {zeile && (
                    <span className="text-[14px] leading-snug font-light text-kh-grey">
                      {zeile}
                    </span>
                  )}
                </Button>
              )
            })}
          </div>
        </motion.div>
      )}

      {!ohneWeiter && (
        <div className="flex justify-end">
          <Button
            onClick={onWeiter}
            size="lg"
            variant={gedaempft ? 'ghost' : 'default'}
            className={
              gedaempft
                ? 'h-[60px] min-w-[9rem] px-6 text-[16px]'
                : 'h-[60px] min-w-[9rem] px-8 text-[17px]'
            }
            data-testid="weiter"
          >
            {weiterText(weiterVon)}
            <ArrowRight className="size-5" strokeWidth={1.75} />
          </Button>
        </div>
      )}
    </div>
  )
}
