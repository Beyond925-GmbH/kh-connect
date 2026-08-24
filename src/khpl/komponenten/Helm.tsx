import { helmFarbe } from '@/khpl/match/helm'

/**
 * Der Helm. Gezeichnet, nicht fotografiert.
 *
 * Ein Foto ginge nicht: es müsste in vier Farben existieren, in derselben
 * Perspektive, freigestellt — vier Aufnahmen, die es nicht gibt und für die
 * niemand einen Termin macht. Als SVG ist die Farbe ein Attribut.
 *
 * Er ist bewusst grob: zwei Bögen, ein Schirm, ein Lichtstreifen. Alles, was
 * an Detail dazukäme, konkurriert mit den Fotos der Bühne, und die sind das
 * Beste, was die App hat.
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

  return (
    <svg
      viewBox="0 0 200 150"
      className={className}
      role="img"
      aria-label={`Bauhelm in ${f.name}`}
    >
      <defs>
        {/* Ein Verlauf statt zweier Flächen: der Helm soll rund wirken, ohne
            dass irgendwo eine Kante steht, die es an einem Helm nicht gibt. */}
        <linearGradient id={`helm-${f.id}`} x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0%" stopColor={f.farbe} />
          <stop offset="100%" stopColor={f.farbe} stopOpacity="0.72" />
        </linearGradient>
      </defs>

      {/*
        Der Schirm, zuerst — die Kuppel liegt darüber.

        Schmal und flach. Beides ist der Unterschied zwischen einem Bauhelm und
        einer Melone: ein Schirm, der weit aussteht und sich nach unten wölbt,
        macht aus jeder Kuppel einen Hut. Er steht hier nur rund ein Fünftel
        über die Kuppel hinaus.
      */}
      <path
        d="M36 100 C36 96 66 93 100 93 C134 93 164 96 164 100 C164 105 134 109 100 109 C66 109 36 105 36 100 Z"
        fill={f.farbe}
        opacity="0.7"
      />
      {/*
        Die Kuppel — flacher Scheitel, senkrechte Flanken.

        Der erste Anlauf war ein Halbrund, und ein Halbrund über einem Schirm
        ist eine Melone, egal in welcher Farbe. Ein Bauhelm hat eine gerade
        Flanke, die auf dem Schirm aufsitzt, und darüber eine Schulter statt
        einer Rundung: `L 48 72` fährt die Flanke senkrecht hoch, erst dann
        biegt die Kurve zum Scheitel ein.
      */}
      <path
        d="M48 100 L48 74 C48 55 68 44 100 44 C132 44 152 55 152 74 L152 100 Z"
        fill={`url(#helm-${f.id})`}
      />
      {/* Die drei Rippen. Sie sind das, was einen Helm auf zwei Meter Abstand
          als Helm lesbar macht — die Mittelrippe allein reichte nicht. */}
      <g fill="#0E0D0B" opacity="0.14">
        <path d="M96 45 L104 45 L104 100 L96 100 Z" />
        <path d="M70 52 C67 68 66 84 66 100 L72 100 C72 84 73 68 76 54 Z" />
        <path d="M130 52 C133 68 134 84 134 100 L128 100 C128 84 127 68 124 54 Z" />
      </g>
      {/* Das Licht. Liegt links oben, wie auf jedem Foto der Bühne. */}
      <path
        d="M56 98 L56 76 C56 62 68 52 84 48 C70 58 64 74 64 98 Z"
        fill="#FFFFFF"
        opacity="0.22"
      />
    </svg>
  )
}
