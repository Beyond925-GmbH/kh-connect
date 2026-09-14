import { SOLL, mm } from '@/khpl/buehne/zerspanung/kanon'

/** Vergrößerte Messskala. Zahlen bleiben echte Millimeterwerte. */
export function Massbereich({
  wert,
  vorschau = false,
}: {
  wert: number
  vorschau?: boolean
}) {
  const min = 24.94
  const max = 25.06
  const x = (v: number) => 30 + ((v - min) / (max - min)) * 280
  const ok = wert >= SOLL.unten - 0.00001 && wert <= SOLL.oben + 0.00001
  return (
    <div
      className="rounded-kh border border-kh-line bg-black/25 p-3"
      data-testid="massbereich"
    >
      <svg
        viewBox="0 0 340 112"
        className="max-h-32 w-full"
        role="img"
        aria-label={`${vorschau ? 'Nach dem Schnitt' : 'Gemessen'}: ${mm(wert)} Millimeter. ${ok ? 'Im erlaubten Bereich.' : wert > SOLL.oben ? 'Zu dick.' : 'Zu dünn.'}`}
      >
        <rect x="30" y="45" width="280" height="22" rx="6" fill="#49505a" />
        <rect
          x={x(SOLL.unten)}
          y="40"
          width={x(SOLL.oben) - x(SOLL.unten)}
          height="32"
          fill="#b8e561"
        />
        <path d={`M${x(wert)} 30v52`} stroke="#fff" strokeWidth="4" />
        <path d={`M${x(wert) - 6} 24h12l-6 8Z`} fill="#fff" />
        <text x="30" y="101" fill="#e6e8ed" fontSize="13">
          zu dünn
        </text>
        <text x="310" y="101" textAnchor="end" fill="#e6e8ed" fontSize="13">
          zu dick
        </text>
        <text
          x={x((SOLL.unten + SOLL.oben) / 2)}
          y="20"
          textAnchor="middle"
          fill="#b8e561"
          fontSize="13"
        >
          passt
        </text>
      </svg>
      <p className="text-center text-sm text-kh-mute">
        {vorschau ? 'Vorschau' : 'Gemessen'}:{' '}
        <strong className="text-kh-paper">{mm(wert)} mm</strong> · Ziel: {mm(SOLL.unten)}–
        {mm(SOLL.oben)} mm
      </p>
    </div>
  )
}
