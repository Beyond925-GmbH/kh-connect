import { motion } from 'motion/react'
import { Bild } from './Bild'
import { STAHL, STUFEN, WARM, type MassstabZustand } from './kanon'

/**
 * Z1 — **die Leiter der Genauigkeit.** Drei Stufen übereinander, grob nach
 * fein, und rechts an jeder Stufe der Spalt, den sie erlaubt: erst
 * handbreit, dann ein Strich, dann fast nichts.
 *
 * **Warum diese Bühne den Einstieg trägt und nicht mehr die technische
 * Zeichnung.** Das Blatt war der erste Screen des Tages — und verlangte
 * genau das, was der Tag erst beibringen soll: dass Maße nicht gleich
 * wichtig sind. Wer „h7“ nicht kennt, konnte die Aufgabe („such das Maß ohne
 * Spielraum“) nur lösen, indem er das Maß antippt, das anders aussieht. Das
 * ist Rätselraten, keine Einsicht.
 *
 * Die Leiter dreht die Reihenfolge um: **erst die Größenordnung, dann die
 * Schreibweise.** Einsortiert werden vier Dinge aus vier Welten (Regalbrett,
 * Handy-Fuge, Bremsscheibe, der eigene Bolzen) — und was man dabei lernt,
 * ist die Pointe des ganzen Tages: genau ist nicht überall gleich genau.
 *
 * **Die Bühne ist hier nicht die Bedienung.** Getippt wird im Panel, die
 * Leiter ist das Ergebnisbrett: sie füllt sich, während man antwortet, und
 * steht am Ende als Übersicht da. Der Spalt rechts ist der einzige Ort, an
 * dem der Unterschied zwischen 1 mm und 0,01 mm wirklich zu *sehen* ist —
 * er ist bewusst nicht maßstäblich (0,01 mm wäre bei dieser Blattgröße
 * unsichtbar), sondern gestaffelt.
 */

/** Der Rahmen der Zeichnung. Breiter als hoch — die Leiter liegt quer. */
const BREITE = 360
const HOEHE = 216

/** Oberkante der ersten Stufe und der Abstand zur nächsten. */
const OBEN = 28
const TAKT = 64
const BAND = 56

/** Waagerechte Anker: Text, Pillen, Spaltgrafik. */
const X = { rand: 10, text: 26, pille: 186, spalt: 274 } as const

/** Die Spaltgrafik: zwei Stahlblöcke, dazwischen die erlaubte Luft. */
const BLOCK = { breite: 64, hoehe: 18 } as const

export function Massstab({ zustand }: { zustand: MassstabZustand }) {
  return (
    <Bild testid="massstab-buehne">
      {() => (
        <svg
          viewBox={`0 0 ${BREITE} ${HOEHE}`}
          preserveAspectRatio="xMidYMid meet"
          className="size-full"
        >
          <defs>
            {/* Der Stahl der Blöcke: hell an der Oberkante, dunkel unten —
                dieselbe Lichtrichtung wie auf dem Foto darunter. */}
            <linearGradient id="mass-stahl" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#39434c" />
              <stop offset="55%" stopColor={STAHL.flaeche} />
              <stop offset="100%" stopColor="#1b2127" />
            </linearGradient>
            {/* Schnittschraffur, wie auf jeder technischen Zeichnung. Sie
                macht aus zwei Rechtecken zwei angeschnittene Werkstücke. */}
            <pattern
              id="mass-schraffur"
              width="6"
              height="6"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <line x1="0" y1="0" x2="0" y2="6" stroke={STAHL.linie} strokeWidth="0.6" />
            </pattern>
            {/* Die Glut im Spalt. Ohne sie ist der Hundertstel-Spalt ein
                Strich, den man übersieht — mit ihr glimmt er. */}
            <filter id="mass-glut" x="-60%" y="-400%" width="220%" height="900%">
              <feGaussianBlur stdDeviation="2.2" />
            </filter>
            {/* Das Blatt selbst: es liegt auf dem Foto und muss decken. */}
            <linearGradient id="mass-blatt" x1="0" y1="0" x2="0.4" y2="1">
              <stop offset="0%" stopColor="#161c22" stopOpacity="0.965" />
              <stop offset="100%" stopColor="#0c1014" stopOpacity="0.965" />
            </linearGradient>
          </defs>

          {/* **Das Blatt.** Erste Fassung setzte die drei Stufen einzeln aufs
              Foto — die Überschrift stand dann auf einem Messschieber und war
              nicht zu lesen, und durch die halbdurchsichtigen Zeilen lief das
              Werkzeug hindurch. Eine deckende Grundplatte darunter ist das,
              was in echt auch dazwischen liegt: ein Blatt auf der Werkbank. */}
          <rect
            x={4}
            y={2}
            width={BREITE - 8}
            height={HOEHE - 4}
            rx={8}
            fill="url(#mass-blatt)"
            stroke={STAHL.linieMatt}
            strokeWidth={1}
          />

          {/* Die Überschrift der rechten Spalte — ohne sie sind die drei
              Blockpaare nur Grafik. Sie steht über der Leiter, nicht in ihr. */}
          <text
            x={X.spalt + BLOCK.breite}
            y={19}
            textAnchor="end"
            fill={STAHL.linie}
            fontSize={8}
            letterSpacing="0.12em"
          >
            ERLAUBTE LUFT
          </text>

          {STUFEN.map((stufe, i) => {
            const y = OBEN + i * TAKT
            const ihre = zustand.platziert.filter((p) => p.stufe === stufe.id)
            const belegt = ihre.length > 0

            return (
              <motion.g
                key={stufe.id}
                initial={false}
                animate={{ opacity: belegt ? 1 : 0.5 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <rect
                  x={X.rand}
                  y={y}
                  width={BREITE - 2 * X.rand}
                  height={BAND}
                  rx={6}
                  fill="#ffffff"
                  fillOpacity={belegt ? 0.055 : 0.025}
                  stroke={belegt ? STAHL.linie : STAHL.linieMatt}
                  strokeWidth={1.2}
                />

                <text
                  x={X.text}
                  y={y + 24}
                  fill={STAHL.glanz}
                  fontSize={14}
                  fontWeight={700}
                  letterSpacing="0.02em"
                >
                  {stufe.name}
                </text>
                <text x={X.text} y={y + 40} fill={STAHL.linie} fontSize={9}>
                  {`${stufe.zahl} · ${stufe.anker}`}
                </text>

                {ihre.map((p, j) => (
                  <Pille
                    key={p.kurz}
                    kurz={p.kurz}
                    y={pillenHoehe(y, j, ihre.length)}
                    hell={p.kurz === zustand.zuletzt}
                  />
                ))}

                <Spalt y={y + BAND / 2} breite={stufe.spalt} />
              </motion.g>
            )
          })}
        </svg>
      )}
    </Bild>
  )
}

/** Eine Stufe hält höchstens zwei Dinge — eines mittig, zwei gestapelt. */
function pillenHoehe(y: number, j: number, anzahl: number): number {
  const mitte = y + BAND / 2 + 3
  return anzahl === 1 ? mitte : mitte + (j === 0 ? -10 : 10)
}

/**
 * Ein einsortiertes Ding: ein warmer Punkt und sein Name. Bewusst ohne
 * Kästchen — die Namen sind unterschiedlich lang, und ein Rahmen, dessen
 * Breite man in SVG schätzen muss, sitzt irgendwann daneben.
 */
function Pille({ kurz, y, hell }: { kurz: string; y: number; hell: boolean }) {
  return (
    <motion.g
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <circle cx={X.pille} cy={y - 3} r={2.8} fill={WARM.linie} />
      <text
        x={X.pille + 9}
        y={y}
        fontSize={10}
        fontWeight={hell ? 700 : 500}
        fill={hell ? STAHL.glanz : STAHL.linie}
      >
        {kurz}
      </text>
    </motion.g>
  )
}

/**
 * Die erlaubte Luft, gezeichnet: zwei Stahlblöcke, dazwischen der Spalt.
 *
 * **Der Spalt selbst ist warm ausgelegt** — sonst ist er bei einem
 * Hundertstel schlicht nichts, und drei Blockpaare sähen gleich aus. Die
 * Orangelinie ist die einzige Stelle des Screens, an der der Unterschied
 * zwischen 1 mm und 0,01 mm wirklich zu *sehen* ist: dick, dünn, Haarstrich.
 *
 * **Nicht maßstäblich, und das ist Absicht.** Maßstäblich wäre der
 * Hundertstel-Spalt bei dieser Blattgröße unsichtbar; gestaffelt zeigt er
 * die Größenordnung, um die es geht.
 */
function Spalt({ y, breite }: { y: number; breite: number }) {
  const oben = y - breite / 2 - BLOCK.hoehe
  const unten = y + breite / 2

  const bloecke = [oben, unten]

  return (
    <g>
      {bloecke.map((oy) => (
        <g key={oy}>
          <rect
            x={X.spalt}
            y={oy}
            width={BLOCK.breite}
            height={BLOCK.hoehe}
            fill="url(#mass-stahl)"
          />
          <rect
            x={X.spalt}
            y={oy}
            width={BLOCK.breite}
            height={BLOCK.hoehe}
            fill="url(#mass-schraffur)"
            opacity={0.28}
          />
          <rect
            x={X.spalt}
            y={oy}
            width={BLOCK.breite}
            height={BLOCK.hoehe}
            fill="none"
            stroke={STAHL.linie}
            strokeWidth={1}
          />
        </g>
      ))}
      <rect
        x={X.spalt}
        y={y - breite / 2}
        width={BLOCK.breite}
        height={breite}
        fill={WARM.linie}
        filter="url(#mass-glut)"
        opacity={0.85}
      />
      <rect
        x={X.spalt}
        y={y - breite / 2}
        width={BLOCK.breite}
        height={breite}
        fill={WARM.linie}
      />
    </g>
  )
}
