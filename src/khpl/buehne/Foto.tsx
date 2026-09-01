import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { StepId } from '@/khpl/flow/steps'
import type { StepBild } from '@/khpl/berufe/typen'
import { beruf } from '@/khpl/berufe/registry'
import { useAktiverBeruf } from '@/khpl/store/fortschritt'

/**
 * Die Foto-Bühne. Ein Motiv, vollflächig.
 *
 * Seit dem Umbau auf ein einziges Step-Layout trägt fast jeder Screen ein
 * echtes Foto statt einer Zeichnung. Diese Komponente ist die einzige Stelle,
 * an der ein Motiv in den Screen kommt — damit Bildausschnitt, Verlauf und
 * Ladeverhalten überall gleich sind und nicht siebzehnmal einzeln.
 *
 * **`pos` ist kein Stil, sondern Bildinhalt.** `object-fit: cover` schneidet
 * quer und hoch unterschiedlich zu: ein Motiv, dessen Person am rechten Rand
 * steht, verliert sie auf dem Handy hochkant. Deshalb steht der Bildmittelpunkt
 * je Foto in der Motivliste des Berufs (`BerufDef.bilder`) und nicht im Layout.
 *
 * `aria-hidden`, weil das Foto den Screen stimmt und nichts erzählt, was nicht
 * im Fachtext daneben steht — ein Alt-Text wäre hier eine Dopplung, die jeder
 * Screenreader mitlesen muss.
 *
 * **Der Verlauf liegt nicht mehr hier, sondern in `StepShell`.** Er gehört zur
 * Bühne als Ebene, egal ob darunter ein Foto, ein 3D-Modell oder nichts liegt —
 * der Titel steht seit dem Umbau auf dem Bild und braucht ihn in jedem Fall.
 * Zweimal derselbe Verlauf übereinander machte die Motive matschig.
 *
 * Dafür kommt hier eine leichte Anhebung von Sättigung und Kontrast dazu: die
 * Pexels-Motive sind neutral abgestimmt, und neben Anton-Versalien und
 * Warnfarben sieht neutral aus wie ausgewaschen.
 */
export function Foto({
  src,
  pos = 'center',
  className,
}: {
  src: string
  pos?: string
  className?: string
}) {
  const [geladen, setGeladen] = useState(false)

  return (
    <div className={cn('relative size-full overflow-hidden bg-kh-surface', className)}>
      <img
        src={src}
        alt=""
        aria-hidden
        // Die Bühne des aktuellen Steps ist immer das Wichtigste auf dem
        // Screen, deshalb `eager` und `high` — der Ladezustand darunter ist
        // für den Wechsel von Step zu Step gedacht, nicht für den Erststart.
        loading="eager"
        fetchPriority="high"
        decoding="async"
        onLoad={() => setGeladen(true)}
        style={{ objectPosition: pos, filter: 'saturate(1.12) contrast(1.06)' }}
        className={cn(
          'size-full scale-[1.01] object-cover transition-opacity duration-700',
          geladen ? 'opacity-100' : 'opacity-0',
        )}
      />
    </div>
  )
}

/**
 * Das Motiv eines Steps — aus der Liste des **aktiven** Berufs.
 *
 * Die Liste lag bis zum Parallelbau als flacher `SCHRITT_BILDER`-Record hier
 * in der Datei. Das ging genau so lange gut, wie es einen gebauten Beruf gab:
 * vier Berufe haben vier verschiedene `M1`, und ein gemeinsamer Record darüber
 * ist keine Übersicht, sondern eine Kollision. Die Liste hängt deshalb am
 * Beruf (`BerufDef.bilder`), und diese Datei bleibt, was
 * sie war: die eine Stelle, an der ein Motiv in den Screen kommt.
 *
 * Ohne aktiven Beruf oder ohne Eintrag: `undefined`. Beides ist kein Fehler,
 * sondern der Normalfall der 3D-Schritte, deren Bühne die Interaktion ist.
 */
export function useStepBild(id: StepId): StepBild | undefined {
  const berufId = useAktiverBeruf()
  return berufId ? beruf(berufId).bilder[id] : undefined
}

/**
 * Fertige Foto-Bühne für einen Step. Ohne Motiv bleibt die Bühne leer — das
 * ist derselbe Zustand wie ein Step ganz ohne `buehne`.
 */
export function StepFoto({ id }: { id: StepId }) {
  const b = useStepBild(id)
  if (!b) return null
  return <Foto src={b.src} pos={b.pos} />
}
