import type { MotionProps } from 'motion/react'

/**
 * Der Auftritt — eine Fläche fährt herauf und blendet ein.
 *
 * Diese Bewegung steht auf jedem Screen des Trichters: Titel, Panel, Karten,
 * Kacheln. Sie stand bisher an jeder Stelle einzeln als
 * `initial={{ opacity: 0, y: 18 }}`, und genau daran hing ein Fehler, den man
 * nicht sieht, wenn man den Code liest, sondern nur, wenn man den Screen
 * ansieht: **das Herauffahren zuckt.**
 *
 * **Warum `transform` und nicht `y`.** Motion kann eine Animation an den
 * Browser abgeben (WAAPI, `Element.animate`) — dann läuft sie im Compositor
 * und ist gegen einen beschäftigten Hauptthread immun. Die Liste der Werte,
 * die dafür in Frage kommen, ist kurz und wörtlich zu nehmen
 * (`motion-dom/animation/waapi/utils/accelerated-values`): `opacity`,
 * `clipPath`, `filter`, `transform`, `backgroundColor`. `y` steht dort
 * nicht — es ist kein CSS-Wert, sondern ein **Bestandteil** von `transform`,
 * den Motion je Frame selbst zu einem Transform-String zusammensetzt. Diese
 * Rechnung kann nur auf dem Hauptthread stattfinden.
 *
 * Die Folge war auf jedem Step-Wechsel messbar: `opacity` wurde abgegeben und
 * lief durch, `y` nicht — und während der Hauptthread den neuen Step baute
 * (gemessen zweimal rund 155 ms am Stück), stand das Panel still, blendete
 * dabei aber ein und sprang danach an seinen Platz. Eingeblendet, eingefroren,
 * gesprungen: das ist das „Flackern“, nach dem es aussieht.
 *
 * Als fertiger `transform`-String heißt der Wert `transform`, Motion gibt ihn
 * ab, und die Bewegung läuft auch dann weiter, wenn React gerade rechnet.
 *
 * **Eine Fläche, eine Bewegung.** Wer diesen Auftritt benutzt, darf auf
 * demselben Element keine zweite Transform-Quelle haben — kein
 * `transition-transform` aus Tailwind, kein `active:scale-*`, kein zweiter
 * `scale`-Wert im selben `animate`. Beides zugleich hieße, dass zwei Stellen
 * dasselbe `transform` schreiben, und das Ergebnis ist kein Kompromiss,
 * sondern ein Gezerre (siehe `Berufsliste`, `Bildwahl`: dort trägt der Rahmen
 * den Auftritt und die Fläche darin den Druckpunkt).
 */
export function auftritt(
  /** Wie weit unten die Fläche startet, in px. */
  hub = 18,
  {
    verzoegerung = 0,
    dauer = 0.45,
  }: {
    /** Versatz in Sekunden — für gestaffelte Listen. */
    verzoegerung?: number
    /** Dauer in Sekunden. */
    dauer?: number
  } = {},
): MotionProps {
  return {
    initial: { opacity: 0, transform: `translateY(${hub}px)` },
    animate: { opacity: 1, transform: 'translateY(0px)' },
    transition: {
      duration: dauer,
      delay: verzoegerung,
      ease: [0.22, 1, 0.36, 1],
    },
  }
}
