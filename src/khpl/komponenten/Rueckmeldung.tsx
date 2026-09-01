import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Check, X } from 'lucide-react'

/**
 * Die Antwort der App auf eine Aktion — in M4, B4.1 und M7 dieselbe.
 *
 * Für jemanden, der im Vorbeigehen dreißig Sekunden investiert, ist die
 * Rückmeldung der ganze Ertrag. Deshalb sind die beiden Fälle hier nicht zwei
 * Graustufen, sondern zwei verschiedene Ereignisse:
 *
 * **Richtig** springt einmal über, und das Häkchen dreht sich dabei ein.
 * Gefeiert wird mit Rand, Schrift und Bewegung — nicht mit einer gefüllten
 * Fläche: die einzige satte Gelbgrün-Fläche eines Screens ist der
 * Weiter-Knopf, und genau in dem Moment, in dem
 * diese Meldung erscheint, steht er darunter. Zwei gefüllte Signalflächen
 * zugleich hießen zweimal „hier geht's weiter“.
 *
 * **Falsch** bleibt ruhig: dunkler Grund, oranger Rand, ein einzelnes
 * Kopfschütteln. Kein Rot. Rot bewertet, und bewertet wird hier nicht — es
 * gibt keinen Punktestand und keine Note. Ein falscher Zuschnitt ist kein Fehler
 * des Besuchers, sondern die Lektion des Screens.
 *
 * Kein Ton: die App bleibt stumm. Bei „Bewegung reduzieren“ nimmt `MotionConfig` im
 * KioskGuard beiden Varianten die Bewegung; die Farbe trägt dann allein.
 *
 * **Sie holt sich selbst ins Bild.** Seit die auslösende Handlung im
 * angehefteten Fuß sitzt („Schnitt setzen“), kann die Antwort darauf weiter oben
 * im scrollenden Teil des Panels liegen — auf M4 lag sie unterhalb der Kante.
 * Ein Knopf, dessen Wirkung man nicht sieht, ist schlimmer als keiner. `nearest`
 * scrollt dabei nur so weit wie nötig und reißt den Rest der Übung nicht weg.
 */
export function Rueckmeldung({
  ok,
  text,
  testid,
}: {
  /** `null` = noch keine Rückmeldung. */
  ok: boolean | null
  text: string | null
  testid?: string
}) {
  const anker = useRef<HTMLDivElement>(null)

  /**
   * Ins Bild holen — **einen Frame später**.
   *
   * Der Effekt läuft, während die Meldung noch gar nicht steht: `motion.p`
   * fährt sie mit `AnimatePresence` ein, und im selben Durchlauf ist der Anker
   * ein leeres `div` von null Pixel Höhe. `scrollIntoView` rechnet dann gegen
   * die Scrollhöhe **vor** dem Einfügen, findet nichts zu tun und scrollt
   * nicht — die Meldung wächst danach unter die Kante und bleibt dort.
   *
   * Gemessen: auf C6 hochkant war der Fehlertext nach einem falschen „So
   * absetzen" **0 von 336 px** sichtbar, auf A4 die Abweisung „Da geht nichts
   * durch — das ist tragend" 0 von 78. Beide Screens sind auf genau diese
   * Meldung gebaut: der Fehler mit Preis ist der Inhalt, nicht die Zugabe.
   *
   * `requestAnimationFrame` wartet auf das Layout nach dem Commit. Ein zweiter
   * Frame wäre nötig, wenn auf die *fertige* Einfahrt gewartet werden sollte —
   * das ist hier falsch: gescrollt wird auf die Endposition, und die steht
   * nach dem ersten Layout.
   */
  useEffect(() => {
    if (text === null || ok === null) return
    const id = requestAnimationFrame(() => {
      anker.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    })
    return () => cancelAnimationFrame(id)
  }, [text, ok])

  return (
    <div ref={anker}>
      <AnimatePresence mode="wait" initial={false}>
        {text !== null && ok !== null && (
          <motion.p
            key={text}
            initial={ok ? { opacity: 0, y: 14, scale: 0.94 } : { opacity: 0, x: 0 }}
            animate={
              ok ? { opacity: 1, y: 0, scale: 1 } : { opacity: 1, x: [0, -9, 8, -5, 0] }
            }
            exit={{ opacity: 0, scale: 0.97 }}
            transition={
              ok
                ? { type: 'spring', stiffness: 440, damping: 20 }
                : { duration: 0.38, ease: 'easeOut' }
            }
            data-testid={testid}
            data-ok={ok}
            className={`flex items-start gap-3 rounded-kh px-4 py-3.5 text-[1.0625rem] leading-snug ${
              ok
                ? 'border-2 border-kh-signal bg-kh-signal/12 font-semibold text-kh-signal'
                : 'border-2 border-kh-orange/45 bg-kh-orange/10 text-kh-paper/90'
            }`}
          >
            <motion.span
              aria-hidden
              initial={ok ? { rotate: -120, scale: 0.4 } : false}
              animate={ok ? { rotate: 0, scale: 1 } : {}}
              transition={{ type: 'spring', stiffness: 400, damping: 16, delay: 0.06 }}
              className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full ${
                ok ? 'bg-kh-signal text-[#0E0D0B]' : 'bg-kh-orange text-[#0E0D0B]'
              }`}
            >
              {ok ? (
                <Check className="size-4" strokeWidth={3.5} />
              ) : (
                <X className="size-4" strokeWidth={3.5} />
              )}
            </motion.span>
            <span>{text}</span>
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
