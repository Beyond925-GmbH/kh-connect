import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Schnitt } from '@/khpl/buehne/anlagenmechanik/Schnitt'
import {
  FUELLDRUCK,
  SICHERHEITSVENTIL_BAR,
  WAERMELAUF_DAUER,
  druckverlust,
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
 * **Die Übung ist klein und physisch** (Spec 6, A6): der Druck steigt, der
 * Besucher hält im Zielfenster an. Ein Regler, ein Fenster, sofortiges
 * Feedback — klein genug, um nicht mit A4 zu konkurrieren, groß genug, um kein
 * Lesescreen zu sein.
 *
 * **Die Faustformel steht mit auf dem Screen**, weil sie erklärt, warum es
 * keinen festen Wert gibt: Gebäudehöhe in Metern geteilt durch 10, plus
 * 0,3 bar. Ein hohes Haus braucht mehr Druck, damit oben noch Wasser ankommt.
 * Zielfenster, Faustformel und Ansprechdruck sind `BELEGT` und zeitstabil
 * (`belege/anlagenmechanik.md` 5); die Werte selbst stehen als `FUELLDRUCK`
 * und `SICHERHEITSVENTIL_BAR` in `buehne/anlagenmechanik/kanon.ts`.
 *
 * **Dann läuft es** — und die Wärme läuft **den Weg entlang, den der Besucher
 * in A4 gezogen hat**: `pfad` kommt aus `answers.a4` und nicht aus dieser
 * Datei. Ohne das ist A6 eine Animation, mit ihm ist es sein Haus. Kein
 * anderer der vier Tage hat eine Belohnung, die sich über den ganzen
 * Bildschirm ausbreitet.
 *
 * ⚠️ **Der Verlust aus A4 hat hier seine Folge, keine Note** (Spec 6, A4): wer
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

/** Nach zwei Fehlversuchen bietet die App die Lösung an (khpl-tage.md 3). */
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
 * Punktabzug**. Alle vier Fälle stehen in Spec 6 (A6) und
 * `belege/anlagenmechanik.md` 5.
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
          <p>
            Anlage füllen, entlüften, Druck aufbauen, Regelung parametrieren, starten —
            die <Fachwort id="inbetriebnahme">Inbetriebnahme</Fachwort>. Dreh auf, bis der
            Druck stimmt.
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
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
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
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <span
                  data-testid="a6-druck"
                  // Die Zahl wechselt auf Warnwestengelb, sobald sie im
                  // Fenster steht — das ist das sofortige Feedback, das die
                  // Spec verlangt, und es kostet keinen zweiten Screen.
                  className={`kh-zahl ${imFenster ? '' : 'text-kh-paper'}`}
                >
                  {bar(druck)}
                </span>
                <span className="text-[1.0625rem] text-kh-mute">
                  Zielfenster {bar(FUELLDRUCK.min)} bis {bar(FUELLDRUCK.max)}
                </span>
              </div>

              <Manometer
                druck={druck}
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
          // Ausweg bleibt — *Weiter* ist auf jedem Step jederzeit aktiv
          // (khpl-tage.md 3), und die Wanderung ist mit einem verlustreichen
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
 * Regler mit Skala. Über dem Griff liegt die Skala, auf der zwei Dinge stehen:
 * das Zielfenster und der Punkt, an dem das Sicherheitsventil öffnet.
 *
 * **Kein Rot**, obwohl am echten Manometer dort eine rote Marke sitzt: Rot
 * kommt im ganzen System nicht vor (khpl-tage.md 3). Der Ansprechdruck steht
 * deshalb in Markenorange — und weil er auf diesem Screen keine Handlung ist,
 * bleibt er ein Strich und keine Fläche.
 */
function Manometer({
  druck,
  onDruck,
  onGezogen,
}: {
  druck: number
  onDruck: (n: number) => void
  onGezogen: () => void
}) {
  const anteil = (n: number) => ((n - MIN_BAR) / (MAX_BAR - MIN_BAR)) * 100

  return (
    <div className="flex flex-col gap-1.5">
      <div
        className="relative h-3.5 w-full rounded-full border border-kh-line bg-white/10"
        aria-hidden
      >
        <div
          className="absolute inset-y-0 rounded-full bg-white/25"
          style={{
            left: `${anteil(FUELLDRUCK.min)}%`,
            width: `${anteil(FUELLDRUCK.max) - anteil(FUELLDRUCK.min)}%`,
          }}
        />
        <span
          style={{ left: `${anteil(SICHERHEITSVENTIL_BAR)}%` }}
          className="absolute top-[-5px] bottom-[-5px] w-[4px] -translate-x-1/2 rounded-full bg-kh-orange"
        />
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

      <div className="flex justify-between text-[0.9375rem] text-kh-mute/70 tabular-nums">
        <span>{bar(MIN_BAR)}</span>
        <span className="text-kh-orange">
          Sicherheitsventil {bar(SICHERHEITSVENTIL_BAR)}
        </span>
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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="kh-feld px-3.5 py-2.5"
      data-testid="a6-faustformel"
    >
      <p className="kh-etikett">Faustformel</p>
      {/* „bar" bekommt seinen Körper-Anker (R12): der Luftdruck, der ohnehin
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
