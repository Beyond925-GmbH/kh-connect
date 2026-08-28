import { AnimatePresence, motion } from 'motion/react'
import { Foto } from '@/khpl/buehne/Foto'
import { RASTER_KURVE } from './kanon'

/**
 * Der Haufen fertiger Drehteile — die Bühne von Z6.
 *
 * **Sie war eine Strichzeichnung und ist jetzt ein Foto.** Der Review vom
 * 26.08. hielt Z6 für den auffälligsten Bruch des ganzen Tages fest: Der Text
 * trägt den stärksten Satz („Getriebe, Pumpen, Mähdrescher. Irgendwo fährt
 * deins mit.“) und darunter stand ein Trapez mit sechs leeren Kästchen. Sechs.
 * Für vierhundert Teile. R13 verlangt an genau dieser Stelle ein echtes
 * Ergebnis mit Bühnen-Prominenz — Artefakte beantworten „Was machen die?“, nur
 * Menschen und Ergebnisse beantworten „Will ich das sein?“.
 *
 * **Das Motiv beantwortet die Frage von selbst.** Ein Haufen gedrehter Hülsen,
 * alle gleich, bis in die Unschärfe hinein. Man muss nichts dazu erklären: die
 * Menge *ist* die Aussage, und dass keine von der anderen zu unterscheiden ist,
 * ist genau die Pointe, die Z1 mit 0,021 mm vorbereitet hat.
 *
 * Die Marken darauf sind das Einzige, was gezeichnet bleibt — sie gehören
 * nicht dem Foto, sondern dem Besucher.
 */

/** Wo eine Marke sitzt, in Prozent der Bildfläche. */
export interface Marke {
  x: number
  y: number
  /** Die Beschriftung. Ohne Text nur der Punkt. */
  text?: string
  /** Die eine Marke, die am Ende stehen bleibt — limette statt weiß. */
  deins?: boolean
}

export function Teilehaufen({
  marken,
  onTippen,
  pos = '50% 45%',
}: {
  marken: readonly Marke[]
  /**
   * Wohin getippt wurde, in Prozent der Bildfläche. Ohne Handler ist die
   * Fläche tot — dann trägt sie nur das Motiv.
   */
  onTippen?: (x: number, y: number) => void
  pos?: string
}) {
  return (
    <div className="relative size-full">
      <Foto src="/medien/media/zerspanungsmechaniker/z6-kiste.webp" pos={pos} />

      {/*
        Die Trefferfläche liegt über dem ganzen Bild und nicht auf einzelnen
        Teilen. Das ist keine Bequemlichkeit, sondern der Inhalt der Übung: Es
        gibt kein richtiges Teil. Egal wohin man tippt — es könnte deins sein.
      */}
      <button
        type="button"
        onClick={
          onTippen
            ? (e) => {
                const r = e.currentTarget.getBoundingClientRect()
                onTippen(
                  ((e.clientX - r.left) / r.width) * 100,
                  ((e.clientY - r.top) / r.height) * 100,
                )
              }
            : undefined
        }
        disabled={!onTippen}
        aria-label="Ein Teil aus dem Haufen antippen"
        data-testid="z6-haufen"
        className="absolute inset-0 disabled:pointer-events-none"
      />

      <AnimatePresence>
        {marken.map((m, i) => (
          <motion.div
            key={`${m.x}-${m.y}-${i}`}
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.4 }}
            transition={{ duration: 0.28, ease: [...RASTER_KURVE] }}
            style={{ left: `${m.x}%`, top: `${m.y}%` }}
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
          >
            {/*
              Ein Ring, kein gefüllter Punkt: Er markiert ein Teil, das schon
              da ist, statt eines dazuzulegen. Die deine trägt Limette — die
              Farbe, die app-weit „du“ heißt (R3).
            */}
            <span
              aria-hidden
              className={`block rounded-full ring-2 ring-inset ${
                m.deins
                  ? 'size-11 bg-kh-signal/15 ring-kh-signal'
                  : 'size-9 bg-kh-paper/10 ring-kh-paper/70'
              }`}
            />
            {m.text && (
              <span
                className={`absolute top-1/2 left-[calc(100%+0.5rem)] -translate-y-1/2 rounded-kh-pill px-2.5 py-1 text-[0.9375rem] font-semibold whitespace-nowrap ${
                  m.deins
                    ? 'bg-kh-signal text-[#0E0D0B]'
                    : 'bg-black/70 text-kh-paper backdrop-blur-sm'
                }`}
              >
                {m.text}
              </span>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
