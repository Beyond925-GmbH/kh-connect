import { ArrowRight } from 'lucide-react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import type { StepId } from '@/khpl/flow/steps'
import { einladung, weiterText } from '@/khpl/flow/uebergaenge'

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
  /** M10 hat kein „Weiter“ mehr. */
  ohneWeiter = false,
}: {
  /** Noch nicht genommene Abstecher, in Anzeigereihenfolge. */
  offen: StepId[]
  /** Step, dessen Weiter-Text gilt. */
  weiterVon: StepId
  onAbstecher: (id: StepId) => void
  onWeiter: () => void
  ohneWeiter?: boolean
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
          <p className="text-[15px] font-normal text-kh-grey">
            {/* Eine Einladung klingt anders als eine Auswahl — deshalb zwei
                Überschriften, beide aus der Spec (ui-shell 5 / flow 6.7). */}
            {offen.length === 1 ? 'Noch eine Minute?' : 'Wie tief willst du rein?'}
          </p>
          <div className="flex flex-wrap gap-2">
            {offen.map((id) => (
              <Button
                key={id}
                variant="outline"
                onClick={() => onAbstecher(id)}
                className="h-[60px] max-w-full flex-1 justify-start px-6 text-left text-[16px] whitespace-normal"
              >
                {einladung(id)}
              </Button>
            ))}
          </div>
        </motion.div>
      )}

      {!ohneWeiter && (
        <div className="flex justify-end">
          <Button
            onClick={onWeiter}
            size="lg"
            className="h-[60px] min-w-[9rem] px-8 text-[17px]"
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
