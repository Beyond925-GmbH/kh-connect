import { useCallback, useEffect, useMemo, useRef } from 'react'
import { Achse, Bild } from './Bild'
import { STRICH } from './stil'
import { BACKEN_STIRN, Futter, Rohteil } from './Maschine'
import { NENNMASS, PROGRAMM, ZEILEN_DAUER } from './kanon'
import { RUECKZUG, SCHNITT, alsPfad, koerperPfad, schnittAnteil, schnittBis } from './weg'

/**
 * Z3 — der Werkzeugweg. **Der Screen, an dem dieser Tag hängt.**
 *
 * „Mit jeder Zeile zeichnet sich ein Stück Kontur, und das ist der Reiz des
 * Screens — aus Text wird eine Form, und man hat sie selbst entstehen lassen"
 * (khpl-tag-zerspanung.md §6 Z3). Hier ist der Satz gebaut, und er besteht aus
 * drei Dingen, die zusammen laufen müssen:
 *
 *  1. **Der Weg** wächst aus dem Programm heraus — Punkte aus `weg.ts`, nicht
 *     danebengelegt. Fahrbefehle zeichnen, Rüstzeilen nicht.
 *  2. **Das Teil** entsteht unter dem Weg. Beim Längsdrehen ist alles über der
 *     Schneide weg — die Mantellinie *ist* der Schneidweg, und deshalb ist die
 *     Kontur am Ende dieselbe wie die Zeichnung in Z1. Nicht ähnlich: dieselbe.
 *  3. **Der Rohling** bleibt als Schatten stehen. Man sieht, was abgetragen
 *     wurde, nicht nur, was übrig ist.
 *
 * **Gleichmäßige Schritte, keine Zeilenschritte** (§7). Der Weg zeichnet sich
 * mit konstanter Geschwindigkeit; `G1 Z-35.` dauert deshalb länger als die
 * Fase davor, weil die Strecke länger ist. Das ist nicht Zierde, sondern
 * Vorschub: eine Zeile, die weiter fährt, braucht mehr Zeit.
 *
 * **Der Zeichenstand läuft über Refs, nicht über State.** Sechzig Bilder je
 * Sekunde durch React zu schicken, um zwei Pfadattribute zu ändern, wäre der
 * teure Weg zum selben Bild.
 */

/** x ∈ [-50, 20], y ∈ [-30, 22]. Dieselbe Millimeterwelt wie Zeichnung und Maschine. */
const SICHT = '-50 -30 70 52'

/** Wie lange der ganze Schnittweg braucht, wenn er von null an durchläuft. */
const GESAMT_DAUER = ZEILEN_DAUER * Math.max(1, SCHNITT.length - 1)

/**
 * Wo das Werkzeug aufsetzt, wenn blind bis ans Ende gefahren wird: an der
 * Stirnfläche der Spannbacke, ein gutes Stück hinter dem Teil. Der Halter ist
 * breiter als die Schneide, und deshalb trifft er, bevor die Spitze vorbei
 * ist.
 */
const AUFPRALL = [BACKEN_STIRN, -NENNMASS / 2 - 1.5] as const

export function Werkzeugweg({
  zeile = PROGRAMM.length - 1,
  markierteZeile = null,
  kollision = false,
}: {
  zeile?: number
  markierteZeile?: number | null
  kollision?: boolean
}) {
  const wegRef = useRef<SVGPathElement>(null)
  const koerperRef = useRef<SVGPathElement>(null)
  const werkzeugRef = useRef<SVGGElement>(null)
  const stand = useRef(0)

  const reduziert = useMemo(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )

  const zeichne = useCallback((anteil: number) => {
    wegRef.current?.setAttribute('d', alsPfad(schnittBis(anteil)))
    koerperRef.current?.setAttribute('d', koerperPfad(anteil))
    werkzeugRef.current?.setAttribute('transform', spitzenVersatz(anteil))
  }, [])

  useEffect(() => {
    const ziel = schnittAnteil(zeile)

    // Bei der Kollision friert das Bild: der Weg steht sofort bis zur Zeile
    // da, an der es geknallt hat, und das Werkzeug steckt in der Backe. Kein
    // Nachzeichnen — wer hier ankommt, hat schon zugesehen.
    if (kollision) {
      stand.current = ziel
      zeichne(ziel)
      werkzeugRef.current?.setAttribute(
        'transform',
        `translate(${AUFPRALL[0]} ${AUFPRALL[1]})`,
      )
      return
    }

    if (reduziert) {
      stand.current = ziel
      zeichne(ziel)
      return
    }

    let bild = 0
    let vorher = performance.now()
    const takt = (jetzt: number) => {
      const dt = Math.min((jetzt - vorher) / 1000, 0.1)
      vorher = jetzt
      const rest = ziel - stand.current
      const schritt = Math.sign(rest) * Math.min(Math.abs(rest), dt / GESAMT_DAUER)
      stand.current += schritt
      zeichne(stand.current)
      if (Math.abs(ziel - stand.current) > 1e-4) bild = requestAnimationFrame(takt)
    }
    bild = requestAnimationFrame(takt)
    return () => cancelAnimationFrame(bild)
  }, [zeile, kollision, reduziert, zeichne])

  const markiert = useMemo(() => {
    if (markierteZeile === null) return null
    const bis = SCHNITT.findIndex((p, i) => i > 0 && p.zeile === markierteZeile)
    return bis > 0 ? alsPfad([SCHNITT[bis - 1], SCHNITT[bis]]) : null
  }, [markierteZeile])

  const angefahren = zeile >= (SCHNITT[0]?.zeile ?? Infinity)
  const zurueckgezogen = RUECKZUG.length === 2 && zeile >= RUECKZUG[1].zeile && !kollision

  return (
    <Bild viewBox={SICHT}>
      <g
        style={{
          opacity: kollision ? 0.6 : 1,
          transition: 'opacity 0.25s cubic-bezier(0.2, 0, 0, 1)',
        }}
      >
        <Futter />

        {/* Der Rohling als Schatten: was abgetragen wird, bleibt sichtbar. */}
        <g opacity={0.34}>
          <Rohteil von={-46} bis={2} />
        </g>

        <Achse von={-48} bis={16} />

        {/* Das Teil, das unter dem Weg entsteht.

            `d` steht schon beim Rendern und nicht erst im ersten Takt: Der
            Effekt läuft nach dem Anstrich, und ein Screen, auf den man
            zurückspringt, hätte sonst ein Bild lang gar keine Kontur. Rendert
            React später neu, schreibt es genau den Stand hin, der ohnehin
            schon im Attribut steht — der Takt läuft ungestört weiter. */}
        <path
          ref={koerperRef}
          d={koerperPfad(stand.current)}
          className="fill-kh-paper/16 stroke-kh-paper"
          strokeWidth={STRICH.voll}
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {zurueckgezogen && (
          <path
            d={alsPfad(RUECKZUG)}
            fill="none"
            stroke="currentColor"
            strokeWidth={STRICH.fein}
            strokeDasharray="7 4"
            vectorEffect="non-scaling-stroke"
            className="text-kh-mute"
          />
        )}

        {/* Der gefahrene Schnittweg — dieselbe Strichstärke wie die Kontur in
            Z1, weil es dieselbe Kontur ist (§6 Z3). */}
        <path
          ref={wegRef}
          d={alsPfad(schnittBis(stand.current))}
          fill="none"
          stroke="currentColor"
          strokeWidth={STRICH.voll}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          className="text-kh-orange"
        />

        {markiert && (
          <path
            d={markiert}
            fill="none"
            stroke="currentColor"
            strokeWidth={STRICH.voll * 3}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            className="text-kh-orange/35"
          />
        )}

        <g
          ref={werkzeugRef}
          transform={
            kollision
              ? `translate(${AUFPRALL[0]} ${AUFPRALL[1]})`
              : spitzenVersatz(stand.current)
          }
          style={{ opacity: angefahren ? 1 : 0, transition: 'opacity 0.3s' }}
        >
          <Schneide />
        </g>
      </g>

      {kollision && <Aufprall />}
    </Bild>
  )
}

/** Wo die Schneide steht, wenn der Weg zu `anteil` gefahren ist. */
function spitzenVersatz(anteil: number): string {
  const punkte = schnittBis(anteil)
  const spitze = punkte[punkte.length - 1] ?? { z: 0, r: 0 }
  return `translate(${spitze.z} ${-spitze.r})`
}

/**
 * Die Schneide am Ende des Wegs — die Spitze sitzt genau auf dem Punkt, den
 * das Programm gerade anfährt. Sie zeigt nach rechts oben aus dem Material
 * heraus, weil dort der Revolver steht (siehe `Maschine`).
 */
function Schneide() {
  return (
    <g>
      <polygon points="0,0 5,-2.4 3,-5.6" className="fill-kh-paper" />
      <path
        d="M 3.4 -4.4 L 13 -14"
        stroke="currentColor"
        strokeWidth={4}
        strokeLinecap="round"
        className="text-kh-raised"
      />
      <path
        d="M 3.4 -4.4 L 13 -14"
        fill="none"
        stroke="currentColor"
        strokeWidth={STRICH.fein}
        vectorEffect="non-scaling-stroke"
        className="text-kh-line-strong"
      />
    </g>
  )
}

/**
 * Der Aufprall. **Kein Rot** — Rot kommt in diesem Produkt nicht vor
 * (khpl-tage.md §3); der Preis dieses Fehlers ist ohnehin kein Alarm, sondern
 * ein stehendes Bild: Werkzeug hin, Spannung hin, und alles muss neu
 * vermessen werden.
 */
function Aufprall() {
  const strahlen = Array.from({ length: 9 }, (_, i) => {
    const w = (i / 9) * Math.PI * 2 + 0.4
    const [innen, aussen] = [2.4, i % 2 === 0 ? 7.5 : 5]
    return `M ${AUFPRALL[0] + Math.cos(w) * innen} ${AUFPRALL[1] + Math.sin(w) * innen} L ${AUFPRALL[0] + Math.cos(w) * aussen} ${AUFPRALL[1] + Math.sin(w) * aussen}`
  }).join(' ')

  return (
    <g className="text-kh-orange">
      <path
        d={strahlen}
        stroke="currentColor"
        strokeWidth={STRICH.voll}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx={AUFPRALL[0]} cy={AUFPRALL[1]} r={1.6} fill="currentColor" />
    </g>
  )
}
