import { motion, useReducedMotion } from 'motion/react'
import { KALT, WARM, type PruefungId } from './kanon'
import {
  ANLAGENPUNKTE,
  RAHMEN_ANLAGE,
  kamera,
  sichtbareWelt,
  sichtfeld,
  viewBoxVon,
  type Rahmen,
} from './zeichnung'

/**
 * **A1 — der Anlagenausschnitt.** Speicher, Zirkulation, Mischer,
 * Umwälzpumpe: Vektor und kein Foto, weil man antippen können muss, was man
 * prüft (Spec 6, A1).
 *
 * Die Zeichnung sagt das Symptom, bevor ein Wort daneben steht: **der
 * Heizkreis unten ist warm, die Warmwasserseite oben ist kalt.** „Heizung wird
 * warm, warmes Wasser nicht" — wer das sieht, hat die Aufgabe verstanden, ohne
 * sie gelesen zu haben. Ist der Fall gelöst, läuft die Wärme auch nach oben.
 *
 * **Was die Zeichnung *nicht* weiß: welche Prüfung die richtige ist.** Die
 * Störung, die Prüfschritte und die Ursache sind laut Spec 11 fachlich
 * abzunehmen — „eine plausible, aber falsche Fehlersuche vor einem
 * interessierten Publikum ist die schlechteste Sorte Fehler". Sie kennt nur
 * Orte: `ANLAGENPUNKTE` in `zeichnung.ts`. Eine `PruefungId`, zu der es keinen
 * Punkt gibt, lässt die Zeichnung ruhig — kein Fehler, sondern der Normalfall,
 * solange die Liste offen ist.
 */
export function Anlage({
  seiten,
  geprueft,
  laeuft,
  ursache,
  geloest,
  onPruefpunkt,
}: {
  /** Das Seitenverhältnis der Bühnenfläche — die `viewBox` richtet sich danach. */
  seiten: number
  geprueft: readonly PruefungId[]
  laeuft: PruefungId | null
  ursache: PruefungId | null
  geloest: boolean
  onPruefpunkt?: (id: PruefungId) => void
}) {
  const ruhig = useReducedMotion() ?? false
  const sicht = sichtfeld(seiten)
  /*
    Hochkant — auf der Stele wie im Streifen neben dem Panel — ist die Fläche
    deutlich höher als dieser Rahmen: `kamera` richtet sich nach der Breite,
    und ober- wie unterhalb der Anlage blieb bis zu einem Viertel der
    Sichthöhe nichts als der auslaufende Grundton — die obere Bildhälfte war
    faktisch leer (Designregel R1). Das Haus hat für diese Zonen seine
    Umgebung; die Umgebung einer Anlage ist Rohr. Steigstrang und
    Kaltwasserzulauf laufen deshalb bis kurz vor die tatsächlich sichtbaren
    Ränder — quer, wo die Sicht dem Rahmen entspricht, ändert sich nichts.
  */
  const welt = sichtbareWelt(RAHMEN_ANLAGE, sicht)
  const obenY = Math.min(22, welt.y + 30)
  const untenY = Math.max(226, welt.y + welt.h - 30)

  return (
    <svg
      viewBox={viewBoxVon(sicht)}
      preserveAspectRatio="xMidYMid meet"
      className="size-full"
      role="img"
      aria-label="Anlagenschema der Warmwasserbereitung: Speicher, Zirkulation, Mischer, Speicherladepumpe, Wärmeerzeuger und Regelung"
    >
      <Grundton sicht={sicht} />
      <g transform={kamera(RAHMEN_ANLAGE, sicht)}>
        {/*
          Warmwasser nach oben zu den Zapfstellen — die kalte Seite des Falls.
          Der Steigstrang läuft bis dicht an den oberen **sichtbaren** Rand
          (`obenY`): hochkant ist die Fläche höher als breit, und ein Schema,
          das mittig als flaches Band darin liegt, war genau die Ursache des
          gemeldeten „Lochs".
        */}
        <Leitung d={`M96 88 L96 58 L258 58 L258 ${obenY + 4}`} warm={geloest} stark />
        <Pfeilspitze x={258} y={obenY} warm={geloest} />
        {/* Zirkulation: was oben nicht abgenommen wird, läuft zurück. */}
        <Leitung d="M230 58 L230 116 L118 116" warm={geloest} />
        {/* Kaltwasser von unten — aus derselben Tiefe, in der die Sicht endet
            (`untenY`). Bleibt kalt, und das ist richtig so. */}
        <Leitung d={`M96 196 L96 ${untenY} L46 ${untenY}`} warm={false} />
        <Pfeilspitze x={68} y={untenY} warm={false} richtung="rechts" />

        {/* Der Heizkreis. Er ist warm — deshalb wird die Heizung warm. */}
        <Leitung d="M118 132 L196 132 L226 132 L226 178" warm stark />
        <Leitung d="M118 168 L238 168 L238 178" warm />
        <Leitung d="M196 168 L196 132" warm />

        <Speicher />
        <Waermeerzeuger />
        <Regelung />
        <MischerSymbol x={196} y={132} />
        <PumpenSymbol x={176} y={168} />

        {ANLAGENPUNKTE.map((punkt) => (
          <Pruefpunkt
            key={punkt.id}
            punkt={punkt}
            geprueft={geprueft.includes(punkt.id)}
            laeuft={laeuft === punkt.id}
            ursache={ursache === punkt.id}
            ruhig={ruhig}
            onTipp={onPruefpunkt}
          />
        ))}
      </g>
    </svg>
  )
}

/**
 * Der Grund, auf dem die Zeichnung liegt. Kein eigener Ton, nur ein Hauch
 * Kaltfläche in der Mitte — die Bühne steht auf `bg-kh-ink` der `StepShell`,
 * und ein zweiter deckender Grund darüber macht sie flach.
 *
 * Er liegt auf der **ganzen Fläche** und läuft an allen vier Rändern auf null
 * aus (`r="50%"` um die Mitte: die Ellipse berührt jede Kante). Vorher endete
 * er mit rund einem Drittel Deckung mitten im Bild — das war die „getönte
 * Platte mit harter Kante", die die Abnahme auf jedem A-Screen gefunden hat.
 */
function Grundton({ sicht }: { sicht: Rahmen }) {
  return (
    <>
      <defs>
        <radialGradient id="am-grund-anlage" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={KALT.flaeche} stopOpacity={0.85} />
          <stop offset="70%" stopColor={KALT.flaeche} stopOpacity={0.32} />
          <stop offset="100%" stopColor={KALT.flaeche} stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect
        x={sicht.x}
        y={sicht.y}
        width={sicht.b}
        height={sicht.h}
        fill="url(#am-grund-anlage)"
      />
    </>
  )
}

function Leitung({ d, warm, stark }: { d: string; warm: boolean; stark?: boolean }) {
  return (
    <>
      {warm && (
        <path
          d={d}
          fill="none"
          stroke={WARM.schimmer}
          strokeWidth={stark ? 9 : 7}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.45}
        />
      )}
      <motion.path
        d={d}
        fill="none"
        strokeWidth={stark ? 3.4 : 2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={false}
        animate={{ stroke: warm ? WARM.linie : KALT.linie }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      />
    </>
  )
}

function Pfeilspitze({
  x,
  y,
  warm,
  richtung = 'oben',
}: {
  x: number
  y: number
  warm: boolean
  richtung?: 'oben' | 'rechts'
}) {
  const d =
    richtung === 'oben'
      ? `M${x - 5} ${y + 6} L${x} ${y} L${x + 5} ${y + 6}`
      : `M${x - 6} ${y - 5} L${x} ${y} L${x - 6} ${y + 5}`
  return (
    <path
      d={d}
      fill="none"
      stroke={warm ? WARM.linie : KALT.linie}
      strokeWidth={2.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  )
}

/** Der Warmwasserspeicher: stehender Zylinder mit der Heizschlange darin. */
function Speicher() {
  return (
    <g>
      <rect
        x={74}
        y={88}
        width={44}
        height={108}
        rx={20}
        fill={KALT.flaeche}
        stroke={KALT.linie}
        strokeWidth={2.4}
      />
      {/* Die Heizschlange — sie ist warm, der Speicherinhalt oben ist es nicht. */}
      <path
        d="M118 132 H96 C87 132 87 144 96 144 H118 M118 144 H96 C87 144 87 156 96 156 H118 M118 156 H96 C87 156 87 168 96 168 H118"
        fill="none"
        stroke={WARM.linie}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.85}
      />
      {/* Schichtung: kalt unten, weniger kalt oben. Ein Speicher ist nie einfarbig. */}
      <path
        d="M80 104 H112 M80 116 H112"
        stroke={KALT.linieMatt}
        strokeWidth={1.6}
        strokeLinecap="round"
      />
    </g>
  )
}

/** Der Wärmeerzeuger. Er läuft — das ist der Teil, der nicht kaputt ist. */
function Waermeerzeuger() {
  return (
    <g>
      <rect
        x={214}
        y={178}
        width={48}
        height={44}
        rx={5}
        fill={KALT.flaeche}
        stroke={KALT.linie}
        strokeWidth={2.4}
      />
      <path
        d="M226 208 q6 -8 0 -16 q10 6 6 16"
        fill="none"
        stroke={WARM.linie}
        strokeWidth={2.2}
        strokeLinecap="round"
      />
      <path
        d="M242 208 q6 -8 0 -16 q10 6 6 16"
        fill="none"
        stroke={WARM.linie}
        strokeWidth={2.2}
        strokeLinecap="round"
      />
    </g>
  )
}

/**
 * Die Regelung. Sie hängt an einer gestrichelten Fühlerleitung am Speicher —
 * gestrichelt, weil dort keine Wärme fließt, sondern eine Behauptung.
 */
function Regelung() {
  return (
    <g>
      <path
        d="M118 142 C160 142 190 150 246 146"
        fill="none"
        stroke={KALT.linieMatt}
        strokeWidth={1.6}
        strokeDasharray="4 5"
      />
      <rect
        x={244}
        y={132}
        width={24}
        height={28}
        rx={3}
        fill={KALT.flaeche}
        stroke={KALT.linie}
        strokeWidth={2.2}
      />
      <rect
        x={248}
        y={137}
        width={16}
        height={9}
        rx={1.5}
        fill={KALT.linieMatt}
        opacity={0.6}
      />
      <circle cx={252} cy={154} r={2.2} fill={KALT.linie} />
      <circle cx={260} cy={154} r={2.2} fill={KALT.linie} />
      <path
        d="M256 160 V178"
        stroke={KALT.linieMatt}
        strokeWidth={1.6}
        strokeDasharray="4 5"
      />
    </g>
  )
}

/** Dreiwegemischer — das Normsymbol: zwei Dreiecke an einem Punkt. */
function MischerSymbol({ x, y }: { x: number; y: number }) {
  return (
    <g stroke={KALT.linie} strokeWidth={2.2} fill={KALT.flaeche} strokeLinejoin="round">
      <path d={`M${x - 10} ${y - 7} L${x - 10} ${y + 7} L${x} ${y} Z`} />
      <path d={`M${x + 10} ${y - 7} L${x + 10} ${y + 7} L${x} ${y} Z`} />
      <path d={`M${x} ${y} L${x} ${y + 10}`} fill="none" />
    </g>
  )
}

/** Umwälzpumpe — Kreis mit Rechteck, wie im Anlagenschema. */
function PumpenSymbol({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <circle
        cx={x}
        cy={y}
        r={9}
        fill={KALT.flaeche}
        stroke={KALT.linie}
        strokeWidth={2.2}
      />
      <rect x={x - 4} y={y - 4} width={8} height={8} fill={KALT.linie} opacity={0.7} />
    </g>
  )
}

/**
 * Ein antippbarer Punkt. Die unsichtbare Trefferfläche ist deutlich größer als
 * der Ring: hier tippt jemand im Stehen auf ein festgeschraubtes iPad
 * (khpl-tage.md 3, 60 × 60 pt).
 */
function Pruefpunkt({
  punkt,
  geprueft,
  laeuft,
  ursache,
  ruhig,
  onTipp,
}: {
  punkt: { id: string; label: string; x: number; y: number }
  geprueft: boolean
  laeuft: boolean
  ursache: boolean
  ruhig: boolean
  onTipp?: (id: PruefungId) => void
}) {
  const farbe = ursache || laeuft ? WARM.linie : geprueft ? KALT.linie : KALT.linieMatt

  return (
    <g>
      {laeuft && !ruhig && (
        <motion.circle
          cx={punkt.x}
          cy={punkt.y}
          r={13}
          fill="none"
          stroke={WARM.linie}
          strokeWidth={2}
          initial={{ scale: 0.7, opacity: 0.9 }}
          animate={{ scale: 1.9, opacity: 0 }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
          style={{ transformOrigin: `${punkt.x}px ${punkt.y}px` }}
        />
      )}
      <circle cx={punkt.x} cy={punkt.y} r={14} fill={KALT.flaeche} opacity={0.55} />
      <circle
        cx={punkt.x}
        cy={punkt.y}
        r={14}
        fill="none"
        stroke={farbe}
        strokeWidth={ursache || laeuft ? 2.8 : 2.2}
        strokeDasharray={geprueft || ursache ? undefined : '3.5 4'}
      />
      {geprueft && !ursache && (
        <circle cx={punkt.x + 10} cy={punkt.y - 10} r={3.2} fill={KALT.linie} />
      )}
      <circle
        cx={punkt.x}
        cy={punkt.y}
        r={18}
        fill="transparent"
        className={onTipp ? 'cursor-pointer' : undefined}
        onPointerDown={onTipp ? () => onTipp(punkt.id) : undefined}
      >
        <title>{punkt.label}</title>
      </circle>
    </g>
  )
}
