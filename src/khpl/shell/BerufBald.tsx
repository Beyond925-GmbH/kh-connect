import { motion } from 'motion/react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BerufBild } from '@/khpl/komponenten/BerufBild'
import { beruf as berufDef } from '@/khpl/berufe/registry'
import { gebauteBerufe } from '@/khpl/berufe/registry'
import type { BerufId } from '@/khpl/berufe/typen'
import { betreteBeruf, zeigeBerufe } from '@/khpl/store/fortschritt'

/**
 * Der Ausgang für einen Beruf, den es im Angebot schon gibt und als Tag noch
 * nicht.
 *
 * **Warum ein eigener Screen und keine graue Karte.** Eine nicht antippbare
 * Karte beantwortet die Frage nicht, die der Tap gestellt hat — sie sagt nur
 * „nicht hier“. Dieser Screen sagt, worum es geht, wann es kommt, und schickt
 * weiter zu etwas, das jetzt begehbar ist. Der Tap war damit nicht umsonst,
 * und das ist an einem Stand der ganze Unterschied: der nächste Tap kommt nur,
 * wenn der letzte etwas gebracht hat.
 *
 * Er verschwindet ohne Codeänderung, sobald der Beruf einen `graph` bekommt.
 */
export function BerufBald({ id }: { id: BerufId }) {
  const b = berufDef(id)
  // Der nächstbeste Weg nach vorn: irgendetwas, das heute wirklich geht.
  const offen = gebauteBerufe().filter((x) => x.id !== id)[0] ?? null

  return (
    <div
      data-testid="beruf-bald"
      className="kh-screen flex flex-col overflow-hidden bg-kh-ink"
    >
      <div className="absolute inset-0">
        <BerufBild beruf={b} className="opacity-45" />
      </div>
      <div aria-hidden className="kh-scrim pointer-events-none absolute inset-0" />

      <header className="relative flex shrink-0 items-center px-4 pt-4 landscape:px-8 landscape:pt-6">
        <button
          type="button"
          onClick={zeigeBerufe}
          data-testid="bald-zurueck"
          aria-label="Zurück zu den Berufen"
          className="grid size-[52px] place-items-center rounded-kh-pill bg-black/35 text-kh-paper backdrop-blur-md transition-transform active:scale-90"
        >
          <ArrowLeft className="size-6" strokeWidth={2.25} />
        </button>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex min-h-0 flex-1 flex-col justify-end gap-4 p-5 landscape:p-8"
      >
        <div className="flex max-w-[44rem] flex-col gap-3">
          <span className="kh-etikett flex items-center gap-2">
            <span aria-hidden className="h-[3px] w-7 rounded-full bg-kh-orange" />
            In Arbeit
          </span>
          <h1 className="kh-plakat">{b.kurz}</h1>
          <p className="text-[clamp(1.125rem,1.02rem+0.55vw,1.4rem)] leading-[1.45] text-kh-paper/85">
            {b.zeile}
          </p>
          {/* Kein Datum. Ein Versprechen, das der Screen nicht halten kann,
              ist schlechter als keins — und am Stand steht jemand daneben,
              der die richtige Antwort geben kann. */}
          <p className="text-[1rem] text-kh-mute">
            Diesen Tag bauen wir gerade. Frag am Stand — dort kann dir jemand schon heute
            alles dazu erzählen.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 landscape:justify-end">
          <Button variant="neben" onClick={zeigeBerufe} data-testid="bald-alle">
            Alle Berufe
          </Button>
          {offen && (
            <Button
              variant="weiter"
              size="lg"
              onClick={() => betreteBeruf(offen.id)}
              data-testid="bald-stattdessen"
              className="px-8"
            >
              Stattdessen {offen.kurz}
              <ArrowRight className="size-5" strokeWidth={2.5} />
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  )
}
