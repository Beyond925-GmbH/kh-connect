import { useEffect } from 'react'
import { motion } from 'motion/react'
import { ArrowRight, LayoutGrid } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BerufBild } from '@/khpl/komponenten/BerufBild'
import { MERKMAL_TEXTE } from '@/khpl/match/merkmale'
import { useMatch } from '@/khpl/match/useMatch'
import { betreteBeruf, zeigeBerufe } from '@/khpl/store/fortschritt'

/**
 * S3 — der Vorschlag.
 *
 * **Beim Kaltstart gibt es ihn nicht.** Wer Helm und alle vier Fragen
 * übersprungen hat, bekommt die Liste — nicht diesen Screen mit einem
 * beliebigen Beruf darauf. „Das passt zu dir“ über nichts ist eine Behauptung,
 * für die die App keine Grundlage hat, und sie fällt genau dem Publikum auf,
 * das ohnehin darauf wartet, verkauft zu werden.
 *
 * **Der Zweite steht mit im Text.** Zimmerer und Dachdecker liegen dicht
 * beieinander; vier Fragen trennen sie nicht sicher. Sie beide zu nennen macht
 * aus einem knappen Ergebnis eine ehrliche Auskunft — und gibt dem zweiten
 * Knopf einen Grund, der nicht „nein danke“ heißt.
 *
 * **Ist der Vorschlag noch nicht gebaut**, führt der Hauptknopf trotzdem
 * dorthin — auf den Screen, der sagt, dass es ihn bald gibt. Die Alternative
 * wäre, den besten Treffer zu verschweigen und den besten *gebauten* zu
 * zeigen; das wäre eine stille Lüge und würde sich beim Freischalten des
 * Berufs von selbst auflösen, ohne dass jemand es je bemerkt hätte.
 */
export function Vorschlag() {
  const { bester, zweiter, merkmale, kaltstart } = useMatch()

  // Kein Vorschlag ohne Grundlage: dann ist die Liste der richtige Screen.
  useEffect(() => {
    if (kaltstart || !bester) zeigeBerufe()
  }, [kaltstart, bester])

  if (kaltstart || !bester) return null

  const beruf = bester.beruf
  const gruende = bester.merkmale.length > 0 ? bester.merkmale : merkmale.slice(0, 2)

  return (
    <div
      data-testid="vorschlag"
      className="kh-screen flex flex-col overflow-hidden bg-kh-ink"
    >
      <div className="absolute inset-0">
        <BerufBild beruf={beruf} />
      </div>
      {/* Zwei Lagen wie auf Splash und Auftragsannahme. `kh-scrim` allein ist
          für das Panel gebaut, das auf den Step-Screens darunterliegt — hier
          steht die Schrift direkt auf dem Foto, und die Motive der Berufe sind
          unten nicht verlässlich dunkel (das Zimmerer-Motiv trägt dort Himmel). */}
      <div aria-hidden className="kh-scrim pointer-events-none absolute inset-0" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0E0D0B] via-[#0E0D0B]/55 to-transparent"
      />

      <motion.div
        initial={{ opacity: 0, transform: 'translateY(22px)' }}
        animate={{ opacity: 1, transform: 'translateY(0px)' }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex min-h-0 flex-1 flex-col justify-end gap-4 p-5 landscape:p-8"
      >
        <div className="flex max-w-[46rem] flex-col gap-3">
          <span className="kh-etikett flex items-center gap-2">
            <span aria-hidden className="h-[3px] w-7 rounded-full bg-kh-orange" />
            {/*
              Ohne zitierbares Merkmal ist es ein Einstieg, kein Treffer. Der
              Unterschied kostet ein Wort und ist der ganze Unterschied
              zwischen einer Auskunft und einer Verkaufszeile.
            */}
            {gruende.length > 0 ? 'Das passt zu dir' : 'Ein Vorschlag zum Einsteigen'}
          </span>
          <h1 className="kh-plakat">{beruf.kurz}</h1>

          <p className="text-[clamp(1.125rem,1.02rem+0.55vw,1.4rem)] leading-[1.45] text-kh-paper/85">
            {gruende.length > 0 ? (
              <>
                Du magst{' '}
                <strong className="text-kh-paper">
                  {gruende.map((m) => MERKMAL_TEXTE[m]).join(' — und ')}
                </strong>
                . Genau davon lebt dieser Beruf.
              </>
            ) : (
              beruf.zeile
            )}
          </p>

          {zweiter && (
            <p className="text-[1rem] text-kh-mute">
              Dicht dahinter:{' '}
              <strong className="text-kh-paper/80">{zweiter.beruf.kurz}</strong>. Du
              kannst dir beide ansehen.
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5 landscape:justify-end">
          <Button variant="neben" onClick={zeigeBerufe} data-testid="vorschlag-alle">
            <LayoutGrid className="size-5" strokeWidth={2} />
            Alle vier ansehen
          </Button>
          <Button
            variant="weiter"
            size="lg"
            onClick={() => betreteBeruf(beruf.id)}
            data-testid="vorschlag-starten"
            className="px-8"
          >
            {beruf.graph ? 'Los geht’s' : 'Ansehen'}
            <ArrowRight className="size-5" strokeWidth={2.5} />
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
