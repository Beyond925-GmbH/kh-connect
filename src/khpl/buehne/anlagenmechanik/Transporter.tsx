import { KALT, WARM } from './kanon'
import { WELT, sichtfeldFuellend, viewBoxVon } from './zeichnung'

/**
 * **Der Transporter** — der Blick über das Armaturenbrett, von innen.
 *
 * Die dritte Zeichnung dieses Tages, und die einzige, die nicht im Haus
 * spielt. Sie trägt zwei Screens:
 *
 * - **A5, die Zäsur.** „Halb eins, im Transporter." Warmes Licht durch die
 *   Windschutzscheibe — **die erste Wärme des Tages**, noch bevor die Anlage
 *   läuft, als leise Vorbereitung auf A6.
 * - **A1.1, der Notdienst.** Derselbe Blick, dieselbe Scheibe, nur dass
 *   draußen nichts ist als Straße, eine Laterne und ein einziges Fenster, in
 *   dem noch Licht brennt. „Wer fährt eigentlich nachts?" — das ist die
 *   Antwort als Bild.
 *
 * **Warum gezeichnet und nicht fotografiert.** Beide Screens waren als Fotos
 * geplant, und für beide *fehlt das Motiv*. Ohne Eintrag in der
 * Motivliste rendert `StepFoto` nichts — die Zäsur des Tages stand auf
 * schwarzem Grund. Eine ruhige Zeichnung ist für A5 gleichwertig, und
 * welches Medium eine Bühne benutzt, entscheidet ohnehin jeder Tag selbst.
 * A1.1 bekommt dieselbe Zeichnung bei Nacht: eine Welt, zwei Zustände.
 *
 * **Das iPad auf dem Armaturenbrett ist keine Requisite**, sondern
 * Arbeitsalltag: Aufträge liegen auf dem iPad, Fotos macht man jederzeit
 * damit. Am Stand läuft diese Anwendung auf demselben Gerät. Es steht hier ohne
 * Erklärung da, und genau das ist der Beleg; `technik: 0.85` wird damit
 * nebenbei mit eingelöst.
 *
 * **Farbe:** ausschließlich `KALT` und `WARM` aus `kanon.ts`, kein Token, kein
 * Eingriff in `src/index.css`. Warm erscheint als Verlauf und als Schein, nie
 * als Fläche unter einem Knopf — die eine gefüllte orange Fläche pro Screen
 * ist *Weiter*.
 *
 * **Sie bewegt sich nicht.** Eine Pause, die animiert ist, ist keine.
 */

/** Die Windschutzscheibe — alles, was draußen liegt, liegt in dieser Form. */
const SCHEIBE = 'M34 18 L286 18 L302 132 L18 132 Z'

/**
 * **Diese Zeichnung füllt, statt sich einzupassen** (`sichtfeldFuellend`).
 *
 * Sie ist kein Schema mit Bauteilen am Rand, sondern ein Blick durch eine
 * Scheibe — und ein Blick füllt sein Fenster. Hochkant wird links und rechts
 * angeschnitten, was in einer Kabine ohnehin der A-Säule gehört; dafür steht
 * kein Schwarz mehr über und unter dem Bild. Lenkrad, Kombiinstrument und iPad
 * liegen weit genug innen, dass sie in jedem Format vollständig im Bild sind.
 */
export function Transporter({
  seiten,
  licht,
}: {
  /** Das Seitenverhältnis der Bühnenfläche — die `viewBox` richtet sich danach. */
  seiten: number
  licht: 'mittag' | 'nacht'
}) {
  const nacht = licht === 'nacht'
  const sicht = sichtfeldFuellend(seiten)
  return (
    <svg
      viewBox={viewBoxVon(sicht)}
      preserveAspectRatio="xMidYMid meet"
      className="size-full"
      role="img"
      aria-label={
        nacht
          ? 'Blick über das Armaturenbrett eines Transporters bei Nacht'
          : 'Blick über das Armaturenbrett eines Transporters, Mittagslicht durch die Windschutzscheibe'
      }
    >
      <defs>
        <clipPath id="am-scheibe" clipPathUnits="userSpaceOnUse">
          <path d={SCHEIBE} />
        </clipPath>
        <linearGradient id="am-himmel" x1="0" y1="0" x2="0.35" y2="1">
          {nacht ? (
            <>
              <stop offset="0%" stopColor="#111820" />
              <stop offset="100%" stopColor="#1b232c" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="#4a566250" />
              <stop offset="55%" stopColor={WARM.schimmer} stopOpacity={0.55} />
              <stop offset="100%" stopColor={WARM.linie} stopOpacity={0.35} />
            </>
          )}
        </linearGradient>
        {/* Das Licht, das durch die Scheibe fällt und auf dem Armaturenbrett
            liegen bleibt. Ein Verlauf, keine Fläche. */}
        <radialGradient id="am-sonne" cx="76%" cy="14%" r="62%">
          <stop offset="0%" stopColor={WARM.linie} stopOpacity={nacht ? 0 : 0.62} />
          <stop offset="45%" stopColor={WARM.linie} stopOpacity={nacht ? 0 : 0.2} />
          <stop offset="100%" stopColor={WARM.linie} stopOpacity={0} />
        </radialGradient>
        <linearGradient id="am-brett" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={KALT.flaeche} stopOpacity={0.96} />
          <stop offset="100%" stopColor="#161c22" />
        </linearGradient>
        <linearGradient id="am-ipad" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor={KALT.linie} stopOpacity={0.36} />
          <stop offset="100%" stopColor={KALT.linie} stopOpacity={0.12} />
        </linearGradient>
      </defs>

      {/* Draußen */}
      <g clipPath="url(#am-scheibe)">
        <rect width={WELT.breite} height={WELT.hoehe} fill="url(#am-himmel)" />
        <Draussen nacht={nacht} />
        <rect width={WELT.breite} height={WELT.hoehe} fill="url(#am-sonne)" />
      </g>

      {/* Die Kabine liegt über allem: A-Säulen, Dachkante, Armaturenbrett.
          Sie reicht bis an die Ränder der Fläche, in jedem Format. */}
      <path
        d={`M${sicht.x} ${sicht.y} H${sicht.x + sicht.b} V${sicht.y + sicht.h} H${sicht.x} Z ${SCHEIBE}`}
        fillRule="evenodd"
        fill="url(#am-brett)"
      />
      <path
        d={SCHEIBE}
        fill="none"
        stroke={KALT.linie}
        strokeWidth={2.4}
        strokeLinejoin="round"
      />

      <Innenspiegel />
      <Armaturenbrett nacht={nacht} />
      <Lenkrad />
      <IPad nacht={nacht} />

      {/* Der Streifen Licht, der über das Brett läuft. Nur mittags. */}
      {!nacht && (
        <path
          d="M196 132 L302 132 L302 176 L168 152 Z"
          fill={WARM.linie}
          opacity={0.13}
          style={{ mixBlendMode: 'screen' }}
        />
      )}
    </svg>
  )
}

/**
 * Was durch die Scheibe zu sehen ist: eine Straße, ein paar Häuser, sonst
 * nichts. Mittags ein Wohnviertel im Gegenlicht, nachts dasselbe Viertel mit
 * einem einzigen Fenster, in dem noch Licht brennt — der Grund, warum jemand
 * losfährt.
 */
function Draussen({ nacht }: { nacht: boolean }) {
  const horizont = 104
  const haeuser = [
    { x: 30, b: 46, h: 34, dach: 12 },
    { x: 84, b: 34, h: 24, dach: 9 },
    { x: 196, b: 40, h: 30, dach: 11 },
    { x: 244, b: 52, h: 40, dach: 14 },
  ]
  return (
    <g>
      {haeuser.map((h) => {
        const oben = horizont - h.h
        return (
          <path
            key={h.x}
            d={`M${h.x} ${horizont} V${oben} L${h.x + h.b / 2} ${oben - h.dach} L${h.x + h.b} ${oben} V${horizont} Z`}
            fill={nacht ? '#0d1319' : KALT.linieMatt}
            fillOpacity={nacht ? 0.95 : 0.55}
            stroke={KALT.linieMatt}
            strokeWidth={1.4}
          />
        )
      })}

      {/* Das eine Fenster, in dem nachts noch Licht ist. */}
      {nacht && (
        <>
          <rect
            x={258}
            y={horizont - 26}
            width={9}
            height={11}
            fill={WARM.linie}
            opacity={0.75}
          />
          <rect
            x={252}
            y={horizont - 32}
            width={21}
            height={23}
            fill={WARM.linie}
            opacity={0.09}
          />
          {/* Eine Laterne. Der Kegel ist ein Verlauf, keine Fläche. */}
          <path
            d={`M150 ${horizont} V${horizont - 44} H160`}
            fill="none"
            stroke={KALT.linieMatt}
            strokeWidth={2}
          />
          <path
            d={`M160 ${horizont - 44} L176 ${horizont + 14} L144 ${horizont + 14} Z`}
            fill={WARM.linie}
            opacity={0.12}
            style={{ mixBlendMode: 'screen' }}
          />
        </>
      )}

      {/* Die Straße. */}
      <rect
        x={0}
        y={horizont}
        width={WELT.breite}
        height={WELT.hoehe - horizont}
        fill={nacht ? '#0a0f14' : KALT.flaeche}
        fillOpacity={nacht ? 0.9 : 0.7}
      />
      <line
        x1={0}
        y1={horizont}
        x2={WELT.breite}
        y2={horizont}
        stroke={KALT.linie}
        strokeWidth={1.6}
        opacity={0.8}
      />
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          x={104 + i * 46}
          y={horizont + 12 + i * 6}
          width={22 + i * 6}
          height={2.6}
          rx={1.3}
          fill={KALT.linie}
          opacity={nacht ? 0.35 : 0.5}
        />
      ))}
    </g>
  )
}

/** Der Innenspiegel. Drei Striche, und die Kabine ist eine Kabine. */
function Innenspiegel() {
  return (
    <g fill="none" stroke={KALT.linie} strokeWidth={2}>
      <path d="M160 18 V26" />
      <rect
        x={138}
        y={26}
        width={44}
        height={13}
        rx={5}
        fill={KALT.flaeche}
        fillOpacity={0.95}
      />
    </g>
  )
}

/** Das Armaturenbrett: die Kante, zwei Düsen, das Kombiinstrument. */
function Armaturenbrett({ nacht }: { nacht: boolean }) {
  return (
    <g>
      {/* Die Kante, an der das Brett anfängt. */}
      <path
        d="M18 132 Q160 150 302 132"
        fill="none"
        stroke={KALT.linie}
        strokeWidth={2.2}
        opacity={0.9}
      />
      <path
        d="M18 148 Q160 168 302 148"
        fill="none"
        stroke={KALT.linieMatt}
        strokeWidth={1.6}
        opacity={0.7}
      />

      {/* Zwei Lüftungsdüsen. */}
      {[
        { x: 44, y: 152 },
        { x: 236, y: 152 },
      ].map((d) => (
        <g key={d.x}>
          <rect
            x={d.x}
            y={d.y}
            width={40}
            height={14}
            rx={4}
            fill="#12181e"
            stroke={KALT.linieMatt}
            strokeWidth={1.6}
          />
          {[4, 8].map((o) => (
            <line
              key={o}
              x1={d.x + 4}
              y1={d.y + o + 1}
              x2={d.x + 36}
              y2={d.y + o + 1}
              stroke={KALT.linieMatt}
              strokeWidth={1.2}
            />
          ))}
        </g>
      ))}

      {/*
        Das Kombiinstrument hinter dem Lenkrad — zwei Runduhren mit Zeiger.

        Klein und matt: als sie größer waren und nachts warm leuchteten, saßen
        im Lenkradkranz zwei Augen. Ein Instrument ist ein Kreis mit einem
        Strich darin, mehr braucht es nicht.
      */}
      {[76, 114].map((cx, i) => (
        <g key={cx} opacity={nacht ? 0.85 : 0.7}>
          <circle
            cx={cx}
            cy={186}
            r={11}
            fill="#12181e"
            stroke={KALT.linieMatt}
            strokeWidth={1.4}
          />
          <path
            d={`M${cx} ${186} L${cx + (i === 0 ? -5 : 6)} ${180}`}
            stroke={KALT.linieMatt}
            strokeWidth={1.4}
            strokeLinecap="round"
          />
        </g>
      ))}
    </g>
  )
}

/** Das Lenkrad, angeschnitten. Wir sitzen daneben, nicht dahinter. */
function Lenkrad() {
  return (
    <g fill="none" stroke={KALT.linie} strokeWidth={5} strokeLinecap="round">
      <circle cx={95} cy={216} r={52} opacity={0.92} />
      <path
        d="M95 216 L52 200 M95 216 L138 200 M95 216 V268"
        strokeWidth={4}
        opacity={0.7}
      />
    </g>
  )
}

/**
 * **Das iPad mit den Aufträgen von heute**, flach auf dem Armaturenbrett.
 *
 * Kein Text auf dem Schirm: eine gezeichnete Auftragsliste wäre erfundene
 * Copy. Drei Zeilen als Andeutung reichen — man erkennt ein Gerät, das
 * benutzt wird, und mehr soll man auch nicht erkennen.
 */
function IPad({ nacht }: { nacht: boolean }) {
  const gehaeuse = 'M172 196 L250 180 L262 152 L192 164 Z'
  const schirm = 'M180 192 L246 178 L255 157 L197 167 Z'
  return (
    <g>
      <path d={gehaeuse} fill={KALT.linieMatt} fillOpacity={0.55} />
      <path
        d={gehaeuse}
        fill="none"
        stroke={KALT.linie}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <path d={schirm} fill="url(#am-ipad)" />
      {/* Drei angedeutete Zeilen — eine Liste, kein Text. */}
      {['M200 172 L246 163', 'M203 179 L243 171', 'M206 186 L236 180'].map((d) => (
        <path
          key={d}
          d={d}
          stroke={KALT.linie}
          strokeWidth={2.2}
          strokeLinecap="round"
          opacity={0.55}
        />
      ))}
      {/* Nachts ist der Schirm die hellste Stelle im Wagen. */}
      {nacht && <path d={schirm} fill={WARM.linie} opacity={0.1} />}
    </g>
  )
}
