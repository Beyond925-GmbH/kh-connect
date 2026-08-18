import { useState } from 'react'
import { cn } from '@/lib/utils'

/**
 * Die Foto-Bühne. Ein Motiv, vollflächig, mit Verlauf darüber.
 *
 * Seit dem Umbau auf ein einziges Step-Layout trägt fast jeder Screen ein
 * echtes Foto statt einer Zeichnung. Diese Komponente ist die einzige Stelle,
 * an der ein Motiv in den Screen kommt — damit Bildausschnitt, Verlauf und
 * Ladeverhalten überall gleich sind und nicht siebzehnmal einzeln.
 *
 * **`pos` ist kein Stil, sondern Bildinhalt.** `object-fit: cover` schneidet
 * quer und hoch unterschiedlich zu: ein Motiv, dessen Person am rechten Rand
 * steht, verliert sie auf dem Handy hochkant. Deshalb steht der Bildmittelpunkt
 * je Foto in `SCHRITT_BILDER` und nicht im Layout.
 *
 * `aria-hidden`, weil das Foto den Screen stimmt und nichts erzählt, was nicht
 * im Fachtext daneben steht — ein Alt-Text wäre hier eine Dopplung, die jeder
 * Screenreader mitlesen muss.
 */
export function Foto({
  src,
  pos = 'center',
  className,
  /** Ohne Verlauf — für Motive, über denen keine Karte klebt. */
  ohneScrim = false,
}: {
  src: string
  pos?: string
  className?: string
  ohneScrim?: boolean
}) {
  const [geladen, setGeladen] = useState(false)

  return (
    <div className={cn('relative size-full overflow-hidden bg-kh-band', className)}>
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
        style={{ objectPosition: pos }}
        className={cn(
          'size-full object-cover transition-opacity duration-500',
          geladen ? 'opacity-100' : 'opacity-0',
        )}
      />
      {!ohneScrim && <div className="kh-scrim pointer-events-none absolute inset-0" />}
    </div>
  )
}

/**
 * Welches Motiv welcher Step trägt, mit Bildmittelpunkt.
 *
 * Steht hier gebündelt und nicht je Step-Datei: die Motivliste ist eine
 * Redaktionsentscheidung, die man am Stück überblicken können muss — welcher
 * Screen hat noch kein eigenes Bild, wo doppelt sich ein Motiv. Herkunft und
 * Urheber:innen jeder Datei stehen in `MEDIEN.md`.
 *
 * Steps ohne Eintrag tragen keine Foto-Bühne, sondern das 3D-Modell: B3.2, M5,
 * M7. Dort *ist* die Bühne die Interaktion.
 */
export const SCHRITT_BILDER = {
  // Der Einstieg bleibt beim Werkstatt-Standbild: der Text dort handelt vom
  // Chef, der das Telefon weglegt, und das ist eine Werkstattszene.
  intro: { src: '/medien/media/zimmerer/hero-poster.webp', pos: '50% 40%' },
  M1: { src: '/medien/schritte/m1-ortstermin.webp', pos: '50% 40%' },
  M2: { src: '/medien/schritte/m2-kalkulation.webp', pos: '50% 55%' },
  M3: { src: '/medien/schritte/m3-cad.webp', pos: '60% 50%' },
  'B3.1': { src: '/medien/schritte/b31-lager.webp', pos: '50% 45%' },
  M4: { src: '/medien/schritte/m4-zuschnitt.webp', pos: '55% 45%' },
  // Regal voller Konstruktionsvollholz in der Halle — genau das, wovon der
  // Fachtext spricht („In der Halle liegt mehr, als du brauchst“).
  //
  // Nicht das naheliegende `schaetzen-balken.webp`, obwohl es Material zeigt,
  // das von Hand bewegt wird: darauf ist ein Firmenlogo auf dem Polohemd
  // lesbar. MEDIEN-INVENTAR führt genau das als Ausschlusskriterium und hat
  // aus demselben Grund schon zwei andere Motive aussortiert.
  'B4.1': { src: '/medien/schritte/b41-lagerhalle.webp', pos: '50% 50%' },
  'B5.1': { src: '/medien/schritte/b51-team.webp', pos: '50% 45%' },
  M6: { src: '/medien/schritte/m6-pause.webp', pos: '50% 45%' },
  M8: { src: '/medien/schritte/m8-feierabend.webp', pos: '50% 55%' },
  M9: { src: '/medien/schritte/m9-karriere.webp', pos: '50% 45%' },
  'B9.1': { src: '/medien/schritte/b91-meister.webp', pos: '50% 40%' },
  'B9.2': { src: '/medien/schritte/b92-techniker.webp', pos: '50% 40%' },
  'B9.3': { src: '/medien/schritte/b93-studium.webp', pos: '50% 40%' },
  // Der Abschluss zeigt einen Menschen und ein fertiges Sparrenwerk, keine
  // Skyline: hier soll jemand aufstehen und an den Stand gehen. Bewusst nicht
  // dasselbe Motiv wie der Einstieg — Anfang und Ende sollen sich nicht
  // spiegeln, sondern auseinanderliegen.
  M10: { src: '/medien/schritte/intro-aufrichten.webp', pos: '50% 45%' },
} as const

/** Fertige Foto-Bühne für einen Step aus `SCHRITT_BILDER`. */
export function StepFoto({ id }: { id: keyof typeof SCHRITT_BILDER }) {
  const b = SCHRITT_BILDER[id]
  return <Foto src={b.src} pos={b.pos} />
}
