import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Schnitt } from '@/khpl/buehne/anlagenmechanik/Schnitt'
import {
  FUELLDRUCK,
  SICHERHEITSVENTIL_BAR,
  SKALA_MAX,
  WAERMELAUF_DAUER,
  amKreis,
  bogen,
  druckverlust,
  winkel,
} from '@/khpl/buehne/anlagenmechanik/kanon'
import { AhaKarte } from '@/khpl/komponenten/AhaKarte'
import { Rueckmeldung } from '@/khpl/komponenten/Rueckmeldung'
import { Wechsel } from '@/khpl/komponenten/Wechsel'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { merkeAntwort, useFortschritt } from '@/khpl/store/fortschritt'
import { Fachwort } from './Fachwort'

/**
 * A6 — Es läuft. **Der Signaturmoment.** Kein Rätsel, kein Test: die
 * Belohnung.
 *
 * **Die Übung ist klein und physisch:** der Druck steigt, der
 * Besucher hält im Zielfenster an. Ein Regler, ein Fenster, sofortiges
 * Feedback — klein genug, um nicht mit A4 zu konkurrieren, groß genug, um kein
 * Lesescreen zu sein.
 *
 * **Das Manometer ist das Bild dieses Screens:** die runde
 * Anzeige mit dem wandernden Zeiger hat sich als der Moment erwiesen, an dem
 * Besucher hängen bleiben — sie bekommt deshalb die Fläche. Groß und mittig,
 * mit Zielfenster, Sicherheitsventil-Marke und dem Wert auf dem Blatt; der
 * Regler darunter bleibt das einzige Bedienteil, Rückmeldung und Faustformel
 * ordnen sich unter (`Manometer` unten in dieser Datei). Die Übung selbst ist
 * unverändert klein — größer geworden ist nur die Uhr, nicht die Aufgabe.
 *
 * **Die Faustformel steht mit auf dem Screen**, weil sie erklärt, warum es
 * keinen festen Wert gibt: Gebäudehöhe in Metern geteilt durch 10, plus
 * 0,3 bar. Ein hohes Haus braucht mehr Druck, damit oben noch Wasser ankommt.
 * Zielfenster, Faustformel und Ansprechdruck sind zeitstabile Größen; die
 * Werte selbst stehen als `FUELLDRUCK`
 * und `SICHERHEITSVENTIL_BAR` in `buehne/anlagenmechanik/kanon.ts`.
 *
 * **Dann läuft es** — und die Wärme läuft **den Weg entlang, den der Besucher
 * in A4 gezogen hat**: `pfad` kommt aus `answers.a4` und nicht aus dieser
 * Datei. Ohne das ist A6 eine Animation, mit ihm ist es sein Haus. Kein
 * anderer der vier Tage hat eine Belohnung, die sich über den ganzen
 * Bildschirm ausbreitet.
 *
 * **Der Verlust aus A4 hat hier seine Folge, keine Note:** wer
 * einen verlustreichen Weg gebaut hat, sieht die Wärme sichtbar langsamer
 * loslaufen. Die Zeichnung rechnet ihn aus demselben `pfad` über
 * `druckverlust`; dieser Screen benutzt ihn nur für den Takt, an dem er die
 * letzte Zeile umschaltet — **keine Zahl, keine Einheit, kein Balken**.
 *
 * **Bewegungsgefühl: Fluss.** Lange, durchgehende Kurven, Verläufe, die an
 * einer Linie entlangwandern — die bewusste Gegenbewegung zu den
 * Rastersprüngen der Zerspanung und zur Pendelmasse des Zimmerers.
 */

// ---------------------------------------------------------------------------
// Der Regler — Spanne, Schritt, Startwert
// ---------------------------------------------------------------------------

/**
 * Die Spanne des Manometers. Sie beginnt unter dem Zielfenster (die Anlage ist
 * leer und wird gefüllt) und endet über dem Ansprechdruck des
 * Sicherheitsventils — sonst wäre der Fall „zu viel" gar nicht erreichbar, und
 * genau er ist die Hälfte der Lektion.
 */
const MIN_BAR = 0.8
const MAX_BAR = 2.8
/** Ein Zehntel bar. Feiner wäre auf einem Manometer keine ablesbare Größe. */
const SCHRITT_BAR = 0.1

/** Nach zwei Fehlversuchen bietet die App die Lösung an. */
const HILFE_AB = 2

/** Mitte des Zielfensters — der Wert, auf den „Zeig mir wie" stellt. */
const MITTE_BAR = (FUELLDRUCK.min + FUELLDRUCK.max) / 2

const bar = (n: number) => `${n.toFixed(1).replace('.', ',')} bar`

const TREFFER_TEXT = 'Druck steht. Die Anlage darf starten.'

interface Folge {
  treffer: boolean
  text: string
}

/**
 * Was der eingestellte Druck bewirkt — **eine Folge in der Anlage, kein
 * Punktabzug**.
 */
function bewerte(druck: number): Folge {
  if (druck < FUELLDRUCK.min) {
    return {
      treffer: false,
      text: 'Zu wenig. Die Anlage zieht Luft, es gluckert in den Rohren — und oben im Haus wird es nicht warm.',
    }
  }
  if (druck > SICHERHEITSVENTIL_BAR) {
    return {
      treffer: false,
      text: `Das Sicherheitsventil öffnet bei ${bar(SICHERHEITSVENTIL_BAR)} und lässt Wasser ab. Kein Defekt — das ist seine Aufgabe.`,
    }
  }
  if (druck > FUELLDRUCK.max) {
    return {
      treffer: false,
      text: 'Mehr als nötig. Beim Aufheizen dehnt sich das Wasser noch aus, und dann steht der Zeiger am Anschlag.',
    }
  }
  return { treffer: true, text: TREFFER_TEXT }
}

export function A6() {
  const antworten = useFortschritt().answers
  const gespeichert = antworten.a6
  const fertig = !!gespeichert?.druckGetroffen
  // Dieselbe Frage, dieselbe Antwort wie auf der Bühne (`Haus`, `Anlage`) —
  // sonst stellt die Zeichnung sofort und der Screen wartet weiter.
  const reduziert = useReducedMotion() ?? false

  /**
   * Der Weg aus A4 — **seiner, nicht irgendeiner.** Fehlt er (übersprungen
   * oder Wiedereinstieg über „Dein Weg"), bleibt er leer: die Zeichnung zeigt
   * dann den Regelweg der Anlage, und der Screen funktioniert trotzdem.
   */
  const pfad = antworten.a4?.pfad ?? []
  /**
   * Sein Preis, in der Währung dieses Screens: die Wärme braucht länger.
   * Ungemerkt — `druckverlust` zählt eine Handvoll Rasterknoten ab, und ein
   * `useMemo` über einem Array, das bei jedem Rendern neu entsteht, merkt sich
   * ohnehin nichts.
   */
  const verlust = druckverlust(pfad)

  const [druck, setDruck] = useState(() => (fertig ? MITTE_BAR : MIN_BAR))
  const [versuche, setVersuche] = useState(() => gespeichert?.versuche ?? 0)
  const [folge, setFolge] = useState<Folge | null>(() =>
    fertig ? { treffer: true, text: TREFFER_TEXT } : null,
  )
  const [laeuft, setLaeuft] = useState(fertig)
  const [angekommen, setAngekommen] = useState(fertig || reduziert)

  const imFenster = druck >= FUELLDRUCK.min && druck <= FUELLDRUCK.max

  /**
   * Die Wanderung der Wärme. Die Zeichnung meldet sie über
   * `onWaermeAngekommen`; solange sie das nicht tut (Stub-Fassung), zählt
   * dieser Wecker mit — der Screen darf nicht an einer Zeichnung hängen, die
   * es noch nicht gibt. Wer zuerst kommt, gewinnt.
   */
  useEffect(() => {
    if (!laeuft || angekommen) return
    const uhr = setTimeout(
      () => setAngekommen(true),
      WAERMELAUF_DAUER * (1 + verlust) * 1000,
    )
    return () => clearTimeout(uhr)
  }, [laeuft, angekommen, verlust])

  const starten = () => {
    const f = bewerte(druck)
    setFolge(f)
    const n = versuche + 1
    setVersuche(n)
    merkeAntwort('a6', { druckGetroffen: f.treffer, versuche: n })
    if (f.treffer) setLaeuft(true)
  }

  const zeigMirWie = () => {
    setDruck(MITTE_BAR)
    setFolge(null)
  }

  return (
    <StepShell
      id="A6"
      auftrag={laeuft ? null : 'Dreh auf, bis der Druck stimmt.'}
      ansage={{
        geste: 'ziehen-regler',
        text: 'Du füllst die Anlage und baust Druck auf — zum ersten Mal läuft sie.',
        haken: 'Zu wenig Druck, und oben kommt nichts an.',
      }}
      interaktionOffen={!laeuft}
      // Das große Manometer braucht Breite: quer darf das Panel auf 52 rem
      // wachsen, damit die Uhr nicht in einer schmalen Textspalte klemmt.
      // Konstant, nicht nur beim Füllen — sonst spränge die Panelbreite genau
      // in dem Moment, in dem der Screen die Bühne freigibt.
      karteBreit
      buehne={
        <Schnitt
          zustand={{
            szene: 'inbetriebnahme',
            druckBar: druck,
            imFenster,
            pfad,
            // Der Zielwert, nicht der Zwischenstand: die Zeichnung fährt ihn
            // im Fluss an und meldet sich, wenn die Wärme oben ist.
            waerme: laeuft ? 1 : 0,
          }}
          onWaermeAngekommen={() => setAngekommen(true)}
        />
      }
      warum={
        laeuft ? undefined : (
          /*
            Ohne den Schlusssatz „Dreh auf, bis der Druck stimmt": er stand
            wortgleich schon im Auftragsband — genau ein Anweisungssatz pro
            Screen. Und „einstellen" statt „parametrieren": das Werkstatt-
            wort fiele hier unerklärt.
          */
          <p>
            Anlage füllen, entlüften, Druck aufbauen, Regelung einstellen, starten — die{' '}
            <Fachwort id="inbetriebnahme">Inbetriebnahme</Fachwort>.
          </p>
        )
      }
      interaktion={
        /*
          Zwei Takte, kein Stapel: solange gefüllt wird, steht hier das
          Manometer mit seiner Aufgabe. Läuft die Anlage, wird das alles
          **ersetzt** — ein Regler unter einer laufenden Heizung ist nur noch
          Möbel, und der Screen soll in diesem Moment die Bühne freigeben.
        */
        <Wechsel takt={laeuft ? 'laeuft' : 'fuellen'}>
          {laeuft ? (
            <div className="flex flex-col gap-3">
              <Rueckmeldung ok text={TREFFER_TEXT} testid="a6-rueckmeldung" />
              {/* Eine Zeile, die stehen bleibt und ihren Text wechselt, sobald
                  die Wärme oben ist — kein zweites Feld, das dazukommt. Ein
                  eingebetteter `Wechsel` wäre hier eine Höhenanimation in
                  einer Höhenanimation für zwanzig Pixel. */}
              {angekommen ? (
                <motion.p
                  key="oben"
                  initial={{ opacity: 0, transform: 'translateY(6px)' }}
                  animate={{ opacity: 1, transform: 'translateY(0px)' }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  data-testid="a6-angekommen"
                  className="kh-titel-klein text-kh-orange"
                >
                  Oben wird es warm.
                </motion.p>
              ) : (
                <p className="text-[1.0625rem] text-kh-mute">
                  Die Wärme läuft los — deine Leitung entlang, in den Verteiler, in die
                  Steigleitungen.
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {/* Kein Kopf mehr über der Uhr: Wert und Zielfenster stehen auf
                  dem Zifferblatt selbst (`Manometer`) — alles, was der
                  Besucher ablesen muss, an einem Ort, und die Uhr bekommt die
                  volle Höhe des Panels. */}
              <Manometer
                druck={druck}
                imFenster={imFenster}
                reduziert={reduziert}
                onDruck={setDruck}
                onGezogen={() => setFolge(null)}
              />

              {/*
                Die Folge steht direkt unter dem Regler und **vor** der
                Faustformel: auf einem Handy hochkant endet das Panel unter dem
                Regler, und wer „Anlage starten" drückt, muss die Antwort der
                Anlage sehen, ohne zu scrollen. Die Faustformel ist Erklärung —
                sie darf als Scroll-Rest unter dem Verlauf liegen, eine
                Rückmeldung nicht.
              */}
              <Rueckmeldung
                ok={folge ? folge.treffer : null}
                text={folge ? folge.text : null}
                testid="a6-rueckmeldung"
              />

              <Faustformel />
            </div>
          )}
        </Wechsel>
      }
      aha={
        <AhaKarte sichtbar={laeuft} eyebrow="Woher nimmt die Wärmepumpe die Wärme?">
          Sie macht keine Wärme — sie <em>holt</em> sie, aus der Luft draußen. Auch Luft
          bei null Grad steckt voller Wärme; richtig leer wäre sie erst bei minus 273
          Grad. Heutige Geräte schaffen das bis etwa minus 20 Grad. Sie brauchen dann mehr
          Strom für dieselbe Wärme, aber sie hören nicht auf zu heizen.
        </AhaKarte>
      }
      fuss={
        <StepFuss
          id="A6"
          // Solange die Wärme unterwegs ist, bleibt der Fuß leise: kein oranger
          // Knopf mitten in den Moment, für den der Tag gebaut ist. Aber der
          // Ausweg bleibt — *Weiter* ist auf jedem Step jederzeit aktiv,
          // und die Wanderung ist mit einem verlustreichen
          // Weg die längste Wartezeit des Produkts. Deshalb steht hier das
          // leise „Überspringen" statt gar nichts.
          uebungOffen={!laeuft || !angekommen}
          aktion={
            laeuft ? null : (
              <div className="flex items-center gap-2">
                <Button variant="aktion" onClick={starten} data-testid="a6-starten">
                  Anlage starten
                </Button>
                {versuche >= HILFE_AB && (
                  <Button
                    variant="leise"
                    onClick={zeigMirWie}
                    data-testid="a6-zeig-mir-wie"
                  >
                    Zeig mir wie
                  </Button>
                )}
              </div>
            )
          }
          geschafft={laeuft ? 'In Betrieb' : null}
        />
      }
    />
  )
}

// ---------------------------------------------------------------------------
// Das Manometer
// ---------------------------------------------------------------------------

/**
 * Skala und Zeigergeometrie (`SKALA_MAX`, `winkel`, `amKreis`, `bogen`) kommen
 * aus `kanon.ts`: die kleine Uhr im Kellerschnitt (`Haus.tsx`, `Manometer`)
 * rechnet mit denselben vier Symbolen, und zwei Kopien derselben Skala wären
 * irgendwann zwei Zeiger, die sich widersprechen.
 *
 * Die Maße des Blatts, von außen nach innen: Rand, Skala, Striche, Zahlen —
 * und die Nabe in der Mitte, aus der der Zeiger kommt. Alles in Einheiten der
 * `viewBox` (200 × 168); die untere Hälfte des Blatts bleibt frei, dort liegen
 * Zielfenster-Zeile und Messwert (der Zeiger steht für die Reglerspanne
 * 0,8–2,8 bar immer in der oberen Hälfte).
 */
const NABE = { x: 100, y: 88 } as const
const R_BLATT = 78
const R_SKALA = 64
const R_ZAHL = 47
const R_ZEIGER = 52

/** Ein Skalenstrich als Pfad — von `vonR` bis zur Skalenlinie. */
function strich(barWert: number, vonR: number, bisR: number = R_SKALA): string {
  const a = amKreis(NABE.x, NABE.y, vonR, winkel(barWert))
  const b = amKreis(NABE.x, NABE.y, bisR, winkel(barWert))
  return `M${a.x} ${a.y} L${b.x} ${b.y}`
}

/** Die ganzen bar tragen einen langen Strich … */
const SKALA_HAUPT = [0, 1, 2, 3, 4]
/** … die halben nur einen kurzen. Zwei fehlen: bei 2,5 sitzt die
 *  Sicherheitsventil-Marke, und 1,5 läge vollständig unter dem
 *  Zielfenster-Bogen — ein Strich, den niemand sieht, ist keiner. */
const SKALA_FEIN = [0.5, 3.5]
/**
 * Beziffert sind nur 1, 2 und 3: die Enden 0 und 4 lägen genau auf der Höhe
 * der Wertplatte in der unteren Blatthälfte, und eine dünne graue „0" direkt
 * neben einer fetten „0,8 bar" liest sich als eine Zeile (Sichtprüfung). Die
 * Endstriche bleiben — wo die Skala anfängt und aufhört, zeigt der Strich.
 */
const SKALA_BEZIFFERT = [1, 2, 3]

/**
 * **Die Uhr, die den Screen trägt** (Abnahme, A6) — ein rundes Manometer mit
 * wanderndem Zeiger, so groß, wie das Panel es hergibt, und darunter der
 * Regler als einziges Bedienteil. Auf dem Blatt steht alles, was der Besucher
 * ablesen muss: das Zielfenster als heller Bogen, der Ansprechdruck des
 * Sicherheitsventils als Marke, der eingestellte Wert als Zahl.
 *
 * **Kein Rot**, obwohl am echten Manometer dort eine rote Marke sitzt: Rot
 * kommt im ganzen System nicht vor. Der Ansprechdruck steht
 * deshalb in Markenorange — und weil er auf diesem Screen keine Handlung ist,
 * bleibt er ein Strich und keine Fläche. Das Zielfenster bleibt weiß wie auf
 * der alten Leiste; Warnwestengelb gehört dem Treffer: Zeiger, Nabe und Zahl
 * wechseln darauf, sobald der Druck im Fenster steht — sofortiges Feedback
 * ohne zweiten Screen.
 *
 * Die Breite der Uhr ist je Ausrichtung doppelt gedeckelt: `26/30 rem`, damit
 * sie auf der Stele nicht ins Groteske wächst, und ein Anteil der
 * **Bildschirmhöhe** (hochkant `23vh`, quer `60vh`), damit die Spalte unter
 * ihr Platz behält. Der hochkante Deckel ist der wichtige — erst er greift
 * dort überhaupt (schmale Flächen erreichen die rem-Grenze nie), und er hält
 * das Panel unter der Höhe, ab der die `max-h-[72%]`-Reißleine der
 * `StepShell` die Rückmeldung unter die Scrollkante schöbe: wer „Anlage
 * starten" drückt, muss die Antwort ohne Scrollen sehen (Kommentar am
 * Einsatzort, nachgemessen auf 390 × 844). Quer bindet meist das rem-Maß;
 * der vh-Anteil fängt flache Handys ab. Dass die Bühne hinter dem hohen
 * Füll-Panel klein wird, ist der bewusste Handel dieses Screens — die
 * Kamera hält trotzdem das ganze Haus (`Haus.tsx`, `blickfeld`).
 */
function Manometer({
  druck,
  imFenster,
  reduziert,
  onDruck,
  onGezogen,
}: {
  druck: number
  /** Der Druck steht im Zielfenster — Zeiger und Zahl wechseln die Farbe. */
  imFenster: boolean
  /** `prefers-reduced-motion`: der Zeiger springt, statt zu schwingen. */
  reduziert: boolean
  onDruck: (n: number) => void
  onGezogen: () => void
}) {
  return (
    <div className="mx-auto flex w-full max-w-[min(26rem,23vh)] flex-col gap-2 landscape:max-w-[min(30rem,60vh)]">
      <div className="relative">
        {/* Zeichnung ohne eigene Vorlesestimme: Wert und Zielfenster stehen
            als echter Text auf dem Blatt, den Regler liest der Slider vor. */}
        <svg viewBox="0 0 200 168" className="w-full" aria-hidden>
          {/* Das Blatt — dieselbe Familie wie `kh-feld` (weiße Fläche bei
              5 %, Linienrand, `index.css`): eine leise helle Fläche, kein
              zweites Panel im Panel. */}
          <circle
            cx={NABE.x}
            cy={NABE.y}
            r={R_BLATT}
            className="fill-white/5 stroke-kh-line"
            strokeWidth={1.5}
          />

          {/* Skala 0–4 bar. */}
          <path
            d={bogen(NABE.x, NABE.y, R_SKALA, winkel(0), winkel(SKALA_MAX))}
            fill="none"
            className="stroke-kh-line-strong"
            strokeWidth={2}
          />
          {SKALA_HAUPT.map((n) => (
            <path
              key={n}
              d={strich(n, 56)}
              className="stroke-kh-line-strong"
              strokeWidth={1.5}
            />
          ))}
          {SKALA_FEIN.map((n) => (
            <path
              key={n}
              d={strich(n, 60)}
              className="stroke-kh-line"
              strokeWidth={1.5}
            />
          ))}
          {SKALA_BEZIFFERT.map((n) => {
            const p = amKreis(NABE.x, NABE.y, R_ZAHL, winkel(n))
            return (
              <text
                key={n}
                x={p.x}
                y={p.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={10}
                className="fill-kh-mute"
              >
                {n}
              </text>
            )
          })}

          {/* Das Zielfenster — der helle Bogen, in dem der Zeiger stehen
              bleiben soll. **Bewusst weiß, nicht warm** wie auf der kleinen
              Uhr der Bühne: dort erzählt Warm die Temperaturgeschichte, hier
              im Panel ist das Fenster die Aufgabe — und die trug schon auf
              der alten Reglerleiste ein weißes Band, während Orange dem
              Sicherheitsventil gehört. */}
          <path
            d={bogen(
              NABE.x,
              NABE.y,
              R_SKALA,
              winkel(FUELLDRUCK.min),
              winkel(FUELLDRUCK.max),
            )}
            fill="none"
            className="stroke-white/40"
            strokeWidth={6}
            strokeLinecap="round"
          />

          {/* Der Ansprechdruck des Sicherheitsventils — die orange Marke. */}
          <path
            d={strich(SICHERHEITSVENTIL_BAR, 56, 70)}
            className="stroke-kh-orange"
            strokeWidth={3}
            strokeLinecap="round"
          />

          {/* Der Zeiger. Er fährt jeden Zehntelschritt weich an — mit
              reduzierter Bewegung steht er sofort. **Gedreht, nicht als Pfad
              interpoliert:** eine `d`-Animation zieht die Spitze über die
              Sehne, und auf dem großen Sprung von „Zeig mir wie" (0,8 → 1,5)
              schrumpft der Zeiger dabei sichtbar. Die Nabe ist der
              Drehpunkt (`transform-box: view-box`). */}
          <motion.g
            initial={false}
            animate={{ rotate: winkel(druck) }}
            transition={
              reduziert ? { duration: 0 } : { duration: 0.35, ease: [0.22, 1, 0.36, 1] }
            }
            style={{
              transformBox: 'view-box',
              transformOrigin: `${NABE.x}px ${NABE.y}px`,
            }}
          >
            <path
              d={`M${NABE.x} ${NABE.y} L${NABE.x + R_ZEIGER} ${NABE.y}`}
              fill="none"
              className={imFenster ? 'stroke-kh-signal' : 'stroke-kh-paper'}
              strokeWidth={3}
              strokeLinecap="round"
            />
          </motion.g>
          <circle
            cx={NABE.x}
            cy={NABE.y}
            r={4.5}
            className={imFenster ? 'fill-kh-signal' : 'fill-kh-paper'}
          />
        </svg>

        {/* Ziel und Messwert stehen auf dem Blatt, wie bei einer echten
            Anzeige — in der unteren Hälfte, die der Zeiger nie überstreicht. */}
        <div className="pointer-events-none absolute inset-x-0 top-[56%] flex flex-col items-center gap-1">
          <span className="text-[0.9375rem] text-kh-mute">
            Zielfenster {bar(FUELLDRUCK.min)} bis {bar(FUELLDRUCK.max)}
          </span>
          <span
            data-testid="a6-druck"
            // Die Zahl wechselt auf Warnwestengelb, sobald sie im Fenster
            // steht — sofortiges Feedback an genau der Stelle. Kein
            // `kh-zahl`: dessen Viewport-Größe sprengte das Blatt, die Familie
            // (Anton, Tabellenziffern) ist dieselbe.
            className={`font-display text-[clamp(2.1rem,1.3rem+2.2vw,3rem)] leading-none tabular-nums ${
              imFenster ? 'text-kh-signal' : 'text-kh-paper'
            }`}
          >
            {bar(druck)}
          </span>
        </div>
      </div>

      <input
        type="range"
        min={MIN_BAR}
        max={MAX_BAR}
        step={SCHRITT_BAR}
        value={druck}
        onChange={(e) => {
          // Auf ein Zehntel gerundet: `input[type=range]` rechnet den Wert aus
          // `min + n · step` und liefert dabei Gleitkommareste (1,7999…). Am
          // Fensterrand entschiede sonst die Rundung darüber, ob die Anlage
          // startet.
          onDruck(Math.round(Number(e.target.value) * 10) / 10)
          onGezogen()
        }}
        data-testid="a6-regler"
        aria-label="Fülldruck der Anlage"
        className="kh-regler w-full"
      />

      {/* Beide Enden des Reglers stehen dran — sonst läse sich die orange
          Zeile am rechten Rand als Endanschlag, und dass der Regler ÜBER den
          Ansprechdruck hinausfährt (bis 2,8 bar), ist die halbe Lektion.
          Das Sicherheitsventil steht deshalb in der Mitte, als Hinweis statt
          als Achsenbeschriftung; wo es auf der Skala sitzt, zeigt die Marke
          auf dem Blatt. */}
      <div className="flex justify-between text-[0.9375rem] text-kh-mute/70 tabular-nums">
        <span>{bar(MIN_BAR)}</span>
        <span className="text-kh-orange">
          Sicherheitsventil {bar(SICHERHEITSVENTIL_BAR)}
        </span>
        <span>{bar(MAX_BAR)}</span>
      </div>
    </div>
  )
}

/**
 * Die Faustformel. Sie steht hier und nicht in einer Aha-Karte, weil sie die
 * Aufgabe erklärt, statt sie zu ergänzen: ohne sie ist das Zielfenster eine
 * gesetzte Zahl, mit ihr ist es eine, die man selbst ausrechnen könnte.
 */
function Faustformel() {
  return (
    <motion.div
      initial={{ opacity: 0, transform: 'translateY(8px)' }}
      animate={{ opacity: 1, transform: 'translateY(0px)' }}
      transition={{ duration: 0.4, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="kh-feld px-3.5 py-2.5"
      data-testid="a6-faustformel"
    >
      <p className="kh-etikett">Faustformel</p>
      {/* „bar" bekommt seinen Körper-Anker: der Luftdruck, der ohnehin
          auf jedem liegt, ist ungefähr 1 bar. */}
      <p className="mt-1 text-[1.0625rem] leading-[1.45] text-kh-paper/90">
        Gebäudehöhe in Metern geteilt durch zehn, plus 0,3 bar — je höher das Haus, desto
        mehr Druck, sonst kommt oben kein Wasser an. Für ein Einfamilienhaus landet man
        damit bei {bar(FUELLDRUCK.min)} bis {bar(FUELLDRUCK.max)}; darüber öffnet
        irgendwann das <Fachwort id="sicherheitsventil">Sicherheitsventil</Fachwort>. Zum
        Anfassen: 1 bar ist ungefähr der Luftdruck, der gerade auf dir liegt — die Anlage
        braucht nur ein bisschen mehr.
      </p>
    </motion.div>
  )
}
