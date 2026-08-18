import { motion } from 'motion/react'

/**
 * Bühne für M3 — ein Abbundplan als Zeichnung.
 *
 * Flow 13 hält fest: für „Planung, CAD, Abbundplan“ gibt es im Bestand nur
 * einen Notbehelf (die CNC-Anlage), das naheliegende Motiv — ein Plan auf dem
 * Tisch oder am Bildschirm — fehlt. Ein Foto von einer Fräse erklärt aber
 * keinen Plan. Eine Zeichnung schon, und ein Abbundplan **ist** eine Zeichnung:
 * das ist hier nicht Ersatz für ein Foto, sondern die richtige Form.
 *
 * Gezeigt ist ein Sparren mit Kerve, so wie er im Plan steht — Länge, Winkel,
 * Querschnitt, Nummer. Genau die vier Angaben, aus denen M4 gleich seine
 * Aufgabe baut.
 */
export function Abbundplan() {
  const strich = {
    initial: { pathLength: 0, opacity: 0 },
    animate: { pathLength: 1, opacity: 1 },
  }

  return (
    <div className="size-full bg-kh-band-soft">
      <svg
        viewBox="0 0 900 600"
        preserveAspectRatio="xMidYMid slice"
        className="size-full"
        role="img"
        aria-label="Abbundplan: ein Sparren mit Länge, Winkel, Querschnitt und Nummer"
      >
        <defs>
          <pattern id="raster" width="30" height="30" patternUnits="userSpaceOnUse">
            <path
              d="M30 0 L0 0 0 30"
              fill="none"
              stroke="var(--color-kh-ink)"
              strokeWidth="0.5"
              opacity="0.07"
            />
          </pattern>
          <marker
            id="pfeil"
            markerWidth="8"
            markerHeight="8"
            refX="4"
            refY="4"
            orient="auto"
          >
            <path d="M0 1 L7 4 L0 7 z" fill="var(--color-kh-grey)" />
          </marker>
        </defs>

        <rect width="900" height="600" fill="url(#raster)" />

        {/* Der Sparren: Untergurt von der Traufe (links unten) zum First. */}
        <motion.g
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <path
            d="M140 430 L640 130 L700 232 L200 532 Z"
            fill="var(--color-kh-orange)"
            opacity="0.16"
          />
          <path
            d="M140 430 L640 130 L700 232 L200 532 Z"
            fill="none"
            stroke="var(--color-kh-ink)"
            strokeWidth="2.5"
            opacity="0.75"
          />
          {/* Kerve am Sparrenfuß — die Aussparung, mit der er auf der Fußpfette sitzt. */}
          <path
            d="M164 474 L214 444 L236 481 L186 511 Z"
            fill="var(--color-kh-band-soft)"
            stroke="var(--color-kh-ink)"
            strokeWidth="2"
            opacity="0.75"
          />
        </motion.g>

        {/* Maßkette Länge */}
        <motion.g variants={strich} initial="initial" animate="animate">
          <motion.path
            d="M120 470 L680 134"
            stroke="var(--color-kh-grey)"
            strokeWidth="1.5"
            markerStart="url(#pfeil)"
            markerEnd="url(#pfeil)"
            variants={strich}
            transition={{ duration: 0.9, delay: 0.35 }}
          />
        </motion.g>
        <motion.text
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          x="400"
          y="286"
          fontSize="26"
          fontWeight="700"
          textAnchor="middle"
          fill="var(--color-kh-ink)"
          transform="rotate(-31 400 286)"
        >
          4 820 mm
        </motion.text>

        {/* Winkel am First */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.25 }}
        >
          <path
            d="M600 154 A 56 56 0 0 1 620 196"
            fill="none"
            stroke="var(--color-kh-grey)"
            strokeWidth="1.5"
          />
          <text x="628" y="172" fontSize="24" fontWeight="700" fill="var(--color-kh-ink)">
            45°
          </text>
        </motion.g>

        {/* Querschnitt und Nummer */}
        <motion.g
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.4 }}
        >
          <text x="96" y="560" fontSize="22" fill="var(--color-kh-grey)">
            KVH 80 / 200
          </text>
        </motion.g>

        <motion.g
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.55, type: 'spring', stiffness: 220, damping: 18 }}
          style={{ transformOrigin: '760px 480px' }}
        >
          <rect
            x="690"
            y="440"
            width="140"
            height="80"
            rx="4"
            fill="var(--color-kh-orange)"
            opacity="0.92"
          />
          <text
            x="760"
            y="474"
            fontSize="15"
            textAnchor="middle"
            fill="#fff"
            letterSpacing="2"
          >
            TEIL
          </text>
          <text
            x="760"
            y="506"
            fontSize="30"
            fontWeight="700"
            textAnchor="middle"
            fill="#fff"
          >
            14 / 68
          </text>
        </motion.g>
      </svg>
    </div>
  )
}
