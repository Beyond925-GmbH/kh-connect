/**
 * Bühne für M6 — Brotzeit auf dem Rohbau.
 *
 * Flow 13 führt „Brotzeit auf dem Rohbau“ als Priorität 6 der Fotoliste; im
 * Bestand gibt es keine einzige Pausenszene (INVENTAR: „Team ja, Pause nein“).
 * Ein Arbeitsfoto an dieser Stelle wäre das Gegenteil dessen, was der Screen
 * soll — der Regiehinweis vom Board lautet „Schau einmal vom iPad hoch“, und
 * die Umsetzung verlangt ausdrücklich kein Drängen.
 *
 * Deshalb eine ruhige Zeichnung statt eines Notbehelfs: Mittagslicht, ein
 * Sparrenfeld im Gegenlicht, Thermoskanne und Brotdose auf dem Bundbalken.
 * Sie ist bewusst still — keine Animation, kein Blickfang.
 */
export function Brotzeit() {
  return (
    <div className="size-full">
      <svg
        viewBox="0 0 900 600"
        preserveAspectRatio="xMidYMid slice"
        className="size-full"
        role="img"
        aria-label="Mittagspause auf dem Rohbau: Thermoskanne und Brotdose auf einem Balken"
      >
        <defs>
          <linearGradient id="m6-himmel" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#BBD4E6" />
            <stop offset="55%" stopColor="#E7DCC9" />
            <stop offset="100%" stopColor="#F4E3C6" />
          </linearGradient>
        </defs>

        <rect width="900" height="600" fill="url(#m6-himmel)" />

        {/* Mittagssonne, hoch und blass — halb zwölf. */}
        <circle cx="690" cy="120" r="54" fill="#FFF3DC" opacity="0.9" />
        <circle cx="690" cy="120" r="86" fill="#FFF3DC" opacity="0.35" />

        {/* Ferne Dächer, damit klar ist: hier oben sitzt jemand. */}
        <g fill="#C9BCA8" opacity="0.55">
          <path d="M0 402 L70 352 L140 402 Z" />
          <path d="M120 410 L190 356 L260 410 Z" />
          <path d="M810 404 L870 360 L900 382 L900 404 Z" />
        </g>
        <rect x="0" y="400" width="900" height="14" fill="#BFB2A0" opacity="0.5" />

        {/* Sparrenfeld im Gegenlicht — der Dachstuhl, an dem heute gebaut wird. */}
        <g stroke="#7A5433" strokeWidth="13" strokeLinecap="round" opacity="0.9">
          <path d="M60 600 L210 300" />
          <path d="M360 600 L210 300" />
          <path d="M250 600 L400 300" />
          <path d="M550 600 L400 300" />
        </g>

        {/* Der Bundbalken, auf dem die Brotzeit steht. */}
        <rect x="0" y="452" width="900" height="30" rx="3" fill="#8F5F36" />
        <rect x="0" y="452" width="900" height="7" rx="3" fill="#A9743F" />

        {/* Thermoskanne */}
        <g>
          <rect x="596" y="352" width="46" height="100" rx="7" fill="#4E5A63" />
          <rect x="596" y="352" width="16" height="100" rx="7" fill="#5E6C77" />
          <rect x="590" y="336" width="58" height="22" rx="6" fill="#37424A" />
          <rect
            x="600"
            y="392"
            width="38"
            height="14"
            rx="3"
            fill="#FF9F2A"
            opacity="0.85"
          />
        </g>

        {/* Brotdose, Deckel halb offen */}
        <g>
          <rect x="668" y="404" width="118" height="48" rx="6" fill="#D8D3CB" />
          <rect x="668" y="404" width="118" height="12" rx="4" fill="#EDE8E0" />
          <path d="M672 404 L742 372 L788 380 L786 404 Z" fill="#C7C1B7" />
          <rect x="686" y="416" width="36" height="24" rx="3" fill="#C79A5E" />
          <rect x="730" y="416" width="30" height="24" rx="3" fill="#B8874B" />
        </g>

        {/* Apfel */}
        <circle cx="828" cy="432" r="21" fill="#B4483C" />
        <path
          d="M828 411 q6 -12 16 -14"
          stroke="#6B5638"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />

        {/* Ein Paar Arbeitshandschuhe, abgelegt. */}
        <g fill="#C8B08A" opacity="0.95">
          <rect x="120" y="424" width="74" height="28" rx="10" />
          <rect x="150" y="410" width="58" height="26" rx="10" />
        </g>
      </svg>
    </div>
  )
}
