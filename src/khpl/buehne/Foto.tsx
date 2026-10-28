import { useState, type CSSProperties } from 'react'
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
  portraitPos,
  portraitFit = 'cover',
  className,
}: {
  src: string
  pos?: string
  portraitPos?: string
  portraitFit?: 'cover' | 'contain'
  className?: string
}) {
  const [geladen, setGeladen] = useState(false)
  const bildStil = {
    '--foto-position': pos,
    '--foto-position-portrait': portraitPos ?? pos,
    filter: 'saturate(1.12) contrast(1.06)',
  } as CSSProperties

  return (
    <div className={cn('relative size-full overflow-hidden bg-kh-surface', className)}>
      {portraitFit === 'contain' && (
        <img
          src={src}
          alt=""
          aria-hidden
          style={bildStil}
          className={cn(
            'absolute inset-0 hidden size-full scale-110 object-cover blur-xl portrait:block',
            geladen ? 'opacity-35' : 'opacity-0',
          )}
        />
      )}
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
        style={bildStil}
        className={cn(
          'relative z-[1] size-full scale-[1.01] object-cover [object-position:var(--foto-position)] transition-opacity duration-700 portrait:[object-position:var(--foto-position-portrait)]',
          portraitFit === 'contain' && 'portrait:scale-100 portrait:object-contain',
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
  return (
    <Foto
      src={b.src}
      pos={b.pos}
      portraitPos={b.portraitPos}
      portraitFit={b.portraitFit}
    />
  )
}
