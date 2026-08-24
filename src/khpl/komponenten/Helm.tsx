import { helmFarbe } from '@/khpl/match/helm'

/**
 * Der Helm. Gezeichnet, nicht fotografiert.
 *
 * Ein Foto ginge nicht: es müsste in vier Farben existieren, in derselben
 * Perspektive, freigestellt — vier Aufnahmen, die es nicht gibt und für die
 * niemand einen Termin macht. Als SVG ist die Farbe ein Attribut.
 *
 * Die Konstruktion folgt dem, was einen Bauhelm auf Abstand lesbar macht:
 * eine gedrungene Kuppel (deutlich breiter als hoch — ein Halbrund in voller
 * Höhe wäre eine Melone), ein Schirm, der rundum sichtbar unter ihr
 * hervorsteht, und Rippen, die als Meridiane zum Scheitel zusammenlaufen
 * statt parallel herunterzufallen. Licht und Schatten sind Weiß- und
 * Schwarz-Überlagerungen auf der Grundfarbe, damit dieselben Pfade für alle
 * vier Farben funktionieren — auch für Weiß und Anthrazit.
 */
export function Helm({
  farbe,
  className,
}: {
  /** Id aus `HELM_FARBEN`. Unbekanntes fällt auf Weiß zurück. */
  farbe: string | undefined
  className?: string
}) {
  const f = helmFarbe(farbe)

  // Die Kuppel: 148 breit, 84 hoch, Unterkante als flacher Bogen, damit sie
  // in der Wölbung des Schirms sitzt statt auf einer Geraden zu enden.
  const kuppel =
    'M26 102 C26 58 58 30 100 30 C142 30 174 58 174 102 ' +
    'C174 109 142 114 100 114 C58 114 26 109 26 102 Z'
  // Der Schirm als Band: dieselbe Ellipse zweimal, die untere hängt tiefer —
  // die Differenz ist die sichtbare Materialstärke.
  const schirmUnten =
    'M8 113 C8 101 49 93 100 93 C151 93 192 101 192 113 ' +
    'C192 126 151 135 100 135 C49 135 8 126 8 113 Z'
  const schirmOben =
    'M8 111 C8 100 49 92 100 92 C151 92 192 100 192 111 ' +
    'C192 120 151 127 100 127 C49 127 8 120 8 111 Z'

  return (
    <svg
      viewBox="0 0 200 150"
      className={className}
      role="img"
      aria-label={`Bauhelm in ${f.name}`}
    >
      <defs>
        {/* Licht von oben: hell am Scheitel, neutral in der Mitte, leicht
            abgedunkelt an der Unterkante. Als Overlay statt Farbverlauf,
            damit es auf allen vier Grundfarben stimmt. */}
        <linearGradient id={`helm-licht-${f.id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.3" />
          <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.12" />
        </linearGradient>
        <radialGradient id={`helm-glanz-${f.id}`} cx="0.34" cy="0.16" r="0.55">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
        <filter id={`helm-schatten-${f.id}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>

      {/* Schirm: Unterseite (abgedunkelt), dann Oberseite, dann ein
          Kantenlicht auf der Vorderkante. */}
      <path d={schirmUnten} fill={f.farbe} />
      <path d={schirmUnten} fill="#0E0D0B" opacity="0.38" />
      <path d={schirmOben} fill={f.farbe} />
      <path d={schirmOben} fill="#0E0D0B" opacity="0.08" />
      <path
        d="M30 122 C52 126 76 128 100 128 C124 128 148 126 170 122"
        fill="none"
        stroke="#FFFFFF"
        opacity="0.14"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Kontaktschatten: die Kuppel wirft weichen Schatten auf den Schirm —
          ohne ihn schweben die beiden Formen nebeneinander. */}
      <ellipse
        cx="100"
        cy="112"
        rx="76"
        ry="8"
        fill="#0E0D0B"
        opacity="0.3"
        filter={`url(#helm-schatten-${f.id})`}
      />

      <path d={kuppel} fill={f.farbe} />
      <path d={kuppel} fill={`url(#helm-licht-${f.id})`} />

      {/* Die drei Rippen laufen als Meridiane zum Scheitel zusammen — sie
          folgen der Wölbung. Parallel fallende Rippen machten aus der Kuppel
          einen Glockenkorpus (der erste Anlauf hat es bewiesen). */}
      <g fill="#0E0D0B" opacity="0.15">
        <path d="M96 30 L104 30 C105 58 105 86 105 111 L95 111 C95 86 95 58 96 30 Z" />
        <path d="M74 35 C66 35 56 64 54 105 L64 107 C65 70 72 43 80 36 Z" />
        <path d="M126 35 C134 35 144 64 146 105 L136 107 C135 70 128 43 120 36 Z" />
      </g>

      {/* Glanz: breiter weicher Schein links oben plus ein schmaler
          Glanzpunkt — das macht aus der Fläche Kunststoff. */}
      <path d={kuppel} fill={`url(#helm-glanz-${f.id})`} />
      <path
        d="M52 62 C56 50 64 42 74 37"
        fill="none"
        stroke="#FFFFFF"
        opacity="0.5"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  )
}
