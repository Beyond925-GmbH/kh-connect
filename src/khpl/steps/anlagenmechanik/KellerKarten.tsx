import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from 'motion/react'

/** Ein Foto wird nach links oder rechts sortiert. Knöpfe bieten dieselbe
 * Handlung ohne Ziehgeste. A2 zeigt die Rückmeldung und wechselt die Karte. */

/** Die zwei Richtungen. `raus` ist links, `bleibt` ist rechts. */
export type Los = 'raus' | 'bleibt'

export interface KellerKarte {
  id: string
  /** Der Name des Bauteils. Steht auf der Karte, nicht daneben. */
  label: string
  /** Foto, WebP unter `public/medien/media/anlagenmechaniker/`. */
  bild: string
}

/**
 * Wie weit die Karte gezogen sein muss, damit der Wisch zählt. Großzügig
 * genug, dass ein Wackeln beim Scrollen keine Entscheidung ist.
 */
const SCHWELLE = 88

/** Ein Schnipser zählt auch kurz — ab dieser Geschwindigkeit (px/s). */
const TEMPO = 420

export function KellerStapel({
  karten,
  index,
  wahl,
  onWaehle,
}: {
  /** Alle sechs, in ihrer Reihenfolge. */
  karten: readonly KellerKarte[]
  /** Welche gerade oben liegt. */
  index: number
  /** Der eigene Tipp zu dieser Karte — `null`, solange keiner da ist. */
  wahl: Los | null
  onWaehle: (los: Los) => void
}) {
  const karte = karten[index]
  /** Zwei angedeutete Karten darunter. Sie sagen: da kommt noch was. */
  const dahinter = karten.slice(index + 1, index + 3)

  if (!karte) return null

  return (
    // Das `pb-3` ist der Platz, in den die angedeuteten Karten ragen. Ohne
    // ihn schöbe der Stapel den Text darunter an. Ist entschieden, ragt nichts
    // mehr — dann fällt auch der Platz weg.
    <div className={wahl ? '' : 'pb-3'}>
      <div
        className="relative mx-auto h-[10rem] w-full max-w-[20rem] landscape:h-[10rem] landscape:max-w-[23rem]"
        data-testid="a2-stapel"
      >
        {/* Nur solange noch entschieden wird: unter einem Streifen wäre der
            angedeutete Stapel bloß ein Rand. */}
        {!wahl &&
          dahinter.map((k, i) => (
            <div
              key={k.id}
              aria-hidden
              className="absolute inset-0 z-0 rounded-kh border-2 border-kh-line-strong bg-white/6"
              style={{
                transform: `translateY(${(i + 1) * 9}px) scale(${1 - (i + 1) * 0.035})`,
              }}
            />
          ))}

        {/*
          `mode="popLayout"` und nicht `wait`: die abfliegende Karte soll
          neben der neuen zu sehen sein — sie *ist* die Bewegung. Bei `wait`
          käme die nächste erst, wenn die alte weg ist, und der Stapel wäre
          für einen Moment leer.
        */}
        <AnimatePresence mode="popLayout" initial={false}>
          <Karte key={karte.id} karte={karte} wahl={wahl} onWaehle={onWaehle} />
        </AnimatePresence>
      </div>
    </div>
  )
}

function Karte({
  karte,
  wahl,
  onWaehle,
}: {
  karte: KellerKarte
  wahl: Los | null
  onWaehle: (los: Los) => void
}) {
  const reduziert = useReducedMotion() ?? false
  const x = useMotionValue(0)
  const drehung = useTransform(x, [-260, 260], [-8, 8])
  /*
    Die Stempel blenden mit dem Finger auf und sind bei `SCHWELLE` voll da —
    die Karte sagt damit selbst, ab wann der Wisch zählt. Ein Ladebalken wäre
    das nicht, es ist dieselbe Strecke, die die Entscheidung auslöst.
  */
  const rausAn = useTransform(x, [-SCHWELLE, -18], [1, 0])
  const bleibtAn = useTransform(x, [18, SCHWELLE], [0, 1])

  return (
    <motion.div
      role="group"
      aria-label={karte.label}
      data-testid={`a2-karte-${karte.id}`}
      // Ist der Tipp abgegeben, ist die Karte nur noch Bild: Ziehen würde
      // eine Entscheidung anbieten, die schon gefallen ist.
      drag={wahl ? false : 'x'}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.55}
      dragMomentum={false}
      onDragEnd={(_, info) => {
        const weit = info.offset.x
        const schnell = info.velocity.x
        if (weit < -SCHWELLE || (weit < -24 && schnell < -TEMPO)) onWaehle('raus')
        else if (weit > SCHWELLE || (weit > 24 && schnell > TEMPO)) onWaehle('bleibt')
      }}
      style={{ x, rotate: reduziert ? 0 : drehung }}
      initial={{ opacity: 0, y: reduziert ? 0 : 8, scale: 1 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      // Sie fliegt in die Richtung, in die getippt wurde — auch wenn der Tipp
      // über die Knöpfe kam. Die Bewegung ist die Quittung.
      exit={{
        x: reduziert ? 0 : wahl === 'raus' ? -260 : 260,
        rotate: reduziert ? 0 : wahl === 'raus' ? -8 : 8,
        opacity: 0,
        transition: { duration: 0.18, ease: 'easeIn' },
      }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="absolute inset-0 z-10 overflow-hidden rounded-kh border-2 border-kh-line-strong bg-white/6 select-none"
    >
      {/*
        `alt=""` mit Absicht — wie in `PruefKacheln`: der Name steht sichtbar
        auf der Karte und ist ihr zugänglicher Name. Ein Alt-Text wäre ein
        zweiter.
      */}
      <img src={karte.bild} alt="" draggable={false} className="size-full object-cover" />

      {/* Der Name liegt auf dem Foto, nicht darunter: die Karte bleibt ein
          Gegenstand und wird kein Formularfeld mit Beschriftung. */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0E0D0B] via-[#0E0D0B]/75 to-transparent px-4 pt-8 pb-3">
        <h2 className="kh-titel-klein text-kh-paper">{karte.label}</h2>
      </div>

      {wahl ? (
        <Stempel los={wahl} fest />
      ) : (
        <>
          <Stempel los="raus" deckkraft={rausAn} />
          <Stempel los="bleibt" deckkraft={bleibtAn} />
        </>
      )}
    </motion.div>
  )
}

const WORTE: Record<Los, string> = {
  raus: 'Kommt raus',
  bleibt: 'Bleibt',
}

/**
 * Der Stempel. Während des Ziehens blendet er mit auf, nach der Entscheidung
 * steht er fest — in beiden Fällen dieselbe Gestalt und dieselbe Farbe für
 * beide Richtungen.
 *
 * **Der feste sitzt immer rechts oben, auch bei „fliegt raus".** Er steht nur
 * auf der geschrumpften Karte, und dort ist links unten der Name — auf 88 px
 * Höhe berührten sich Stempel und Name. Die Seite trägt hier ohnehin keine
 * Bedeutung mehr: Was gewählt wurde, steht im Wort.
 */
function Stempel({
  los,
  deckkraft,
  fest = false,
}: {
  los: Los
  deckkraft?: MotionValue<number>
  /** Der abgegebene Tipp: er steht, statt am Finger zu hängen. */
  fest?: boolean
}) {
  return (
    <motion.span
      aria-hidden
      style={fest ? undefined : { opacity: deckkraft }}
      initial={fest ? { opacity: 0 } : false}
      animate={fest ? { opacity: 1 } : undefined}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      data-testid={fest ? `a2-stempel-${los}` : undefined}
      className={`kh-etikett absolute top-3 rounded-full border-2 border-kh-paper/70 bg-[#0E0D0B]/70 px-3 py-1.5 text-kh-paper backdrop-blur-[2px] ${
        fest ? 'right-3' : los === 'raus' ? 'left-3 -rotate-6' : 'right-3 rotate-6'
      }`}
    >
      {WORTE[los]}
    </motion.span>
  )
}
