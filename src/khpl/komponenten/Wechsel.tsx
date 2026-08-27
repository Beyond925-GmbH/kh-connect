import { useCallback, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'

/**
 * Ein Panel-Inhalt, der **ersetzt** wird statt zu wachsen.
 *
 * **Das Problem, das er löst.** Die Übungs-Screens haben ihren Inhalt bisher
 * gestapelt: erst die Aufgabe, dann die Rückmeldung darunter, dann die
 * Auflösung darunter, dann die Aha-Karte darunter. Nach zwei Taps war das
 * Panel doppelt so hoch wie am Anfang, hatte eine Scrollkante, und oben stand
 * weiter das Soll aus dem Plan — obwohl der Balken längst geschnitten war.
 * Ein Screen, der beim Bedienen wächst, liest sich wie ein Formular, das nie
 * fertig wird.
 *
 * Stattdessen hat jeder Step **Takte**: „einstellen“, „geschnitten“,
 * „geladen“. Der Titel bleibt, der Fachtext bleibt, und was darunter steht,
 * wird ausgetauscht. Was der Takt nicht mehr braucht, geht weg.
 *
 * **Warum die Höhe animiert wird.** Ohne das springt das Panel im Moment des
 * Wechsels — und der Sprung ist genau die Bewegung, die den Screen unruhig
 * macht. Gemessen wird der stehende Rahmen um den Inhalt; die Hülle darüber
 * fährt auf den gemessenen Wert. Nullmessungen werden verworfen: zwischen
 * Ausblenden und Einblenden ist der Rahmen für einen Frame leer, und ein
 * Zwischenstopp auf 0 wäre ein Zuklappen.
 *
 * `mode="wait"` ist Absicht — der alte Takt geht **zuerst** weg. Beide
 * gleichzeitig zu zeigen wäre genau das Stapeln, das hier abgeschafft wird.
 */
export function Wechsel({
  takt,
  className,
  children,
}: {
  /** Name des Takts. Ändert er sich, wird der Inhalt ausgetauscht. */
  takt: string
  className?: string
  children: React.ReactNode
}) {
  const [hoehe, setHoehe] = useState<number | 'auto'>('auto')

  /**
   * Gemessen wird **der Takt selbst**, nicht ein stehender Rahmen um ihn.
   *
   * Der Unterschied ist der Fall „Takt ohne Inhalt“: M7 hat ihn, sobald das
   * Dach steht. Ein stehender Rahmen misst zwischen Aus- und Einblenden für
   * einen Frame ebenfalls null — beides wäre dann ununterscheidbar, und die
   * naheliegende Abhilfe („Nullwerte ignorieren“) lässt genau den leeren Takt
   * auf der alten Höhe stehen. Ein leeres Panel mit 300 px Loch darin.
   *
   * Hängt die Messung dagegen am Takt-Element, gibt es die Zwischenmessung gar
   * nicht: während des Wechsels ist kein Element da, der Beobachter schweigt,
   * und die Höhe bleibt einfach stehen, bis der neue Takt sie meldet. Eine
   * echte Null ist dann auch eine.
   */
  const beobachter = useRef<ResizeObserver | null>(null)
  const takthoehe = useCallback((el: HTMLDivElement | null) => {
    beobachter.current?.disconnect()
    if (!el) return
    const messe = () => setHoehe(el.getBoundingClientRect().height)
    messe()
    const ro = new ResizeObserver(messe)
    ro.observe(el)
    beobachter.current = ro
  }, [])

  return (
    <motion.div
      initial={false}
      animate={{ height: hoehe }}
      transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      // `clip` statt `hidden`: `overflow: hidden` erzeugt einen
      // Scroll-Container, und iOS-Safari springt darin beim Fokussieren eines
      // Knopfs an dessen Oberkante — mitten in der Höhenanimation.
      style={{ overflow: 'clip' }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={takt}
          ref={takthoehe}
          initial={{ opacity: 0, transform: 'translateY(10px)' }}
          animate={{ opacity: 1, transform: 'translateY(0px)' }}
          exit={{ opacity: 0, transform: 'translateY(-8px)' }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}
