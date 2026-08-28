import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import {
  FEHLERZEILE,
  FEHLER_CODE,
  PROGRAMM,
  STEUERUNG,
  type Programmzeile,
} from '@/khpl/buehne/zerspanung/kanon'
import { Werkzeugweg } from '@/khpl/buehne/zerspanung/Werkzeugweg'
import { AhaKarte } from '@/khpl/komponenten/AhaKarte'
import { Lage } from '@/khpl/komponenten/Lage'
import { Rueckmeldung } from '@/khpl/komponenten/Rueckmeldung'
import { Wechsel } from '@/khpl/komponenten/Wechsel'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { useSichtfeld } from '@/khpl/shell/SichtfeldKontext'
import { merkeAntwort, useFortschritt } from '@/khpl/store/fortschritt'
import { Begriff } from './Begriff'

/**
 * Z3 — Zeile für Zeile. **Der Fehler mit Preis.**
 *
 * **Erst die Freude, dann der Fehler — in dieser Reihenfolge**
 * (khpl-tag-zerspanung.md §6 Z3). Der Besucher geht das Programm Zeile für
 * Zeile durch, und mit jeder Fahrzeile zeichnet sich ein Stück Kontur: aus
 * Text wird eine Form, und man hat sie selbst entstehen lassen. Erst wenn die
 * Kontur steht, wird sie zur Aufgabe.
 *
 * Die Reihenfolge ist nicht Geschmack. Die Interviews sagen einhellig, dass
 * das Programmieren der **beliebteste** Teil des Berufs ist — ein Screen, auf
 * dem es primär als Fehlerquelle vorkommt, verkauft den Beruf unter Wert.
 *
 * **Die eine Entscheidung dieses Screens sitzt im Fuß.** Sobald das Programm
 * durchgelesen ist, stehen dort zwei Wege: die falsche Zeile suchen — oder
 * *Start drücken*. Wer blind startet, lässt die falsche Zeile fahren: das
 * Werkzeug geht am Teil vorbei ins Leere, es wird kein Span abgenommen, und
 * der Rohling hängt ungedreht im Futter. Genau deshalb wird an einer CNC nie
 * ohne Simulation gestartet, und genau das ist die Lektion.
 *
 * ⚠️ **Der Steuerungsdialekt steht sichtbar dabei** (§6 Z3, §11): Heidenhain
 * schreibt Klartext, Siemens ShopTurn ist grafisch. „So sieht jedes
 * CNC-Programm aus“ wäre falsch. Programm, Fehlerzeile und Dialekt kommen aus
 * `buehne/zerspanung/kanon.ts`; der Code ist **fachlich abzunehmen**.
 *
 * ⚠️ **Gemeldeter Spec-Widerspruch, aufgelöst zugunsten des Belegs.** §6 Z3
 * trägt an einer Stelle noch die Folge der ersten Fassung („eine Zustellung zu
 * tief“ → „fährt das Werkzeug in die Spannbacke“). Derselbe Abschnitt und §11
 * ersetzen den eingebauten Fehler aber ausdrücklich durch das **fehlende
 * Minuszeichen** (`BELEGT`, `belege/zerspanung.md` 7), und damit fährt das
 * Werkzeug **vom Teil weg**: `Z+` zeigt an der Drehbank von der Spannung fort.
 * Ein Screen, der dazu „in die Spannbacke“ sagt, behauptet eine falsche
 * Konsequenz — genau der Fehlertyp, den die Spec bei `19,987` an sich selbst
 * gefunden hat.
 *
 * Gebaut ist deshalb die Fassung, die zum belegten Fehler gehört: der
 * **Luftschnitt**. `FEHLER_CODE`, `LUFTSCHNITT_TEXT` und der Weg auf der Bühne
 * (`weg.ts` `FEHLWEG`) kommen jetzt aus derselben Zeile und gehören zur selben
 * Physik. Was der Screen dabei **nicht** verliert, ist seine Lektion: das
 * Programm einmal durchgehen, bevor man es laufen lässt.
 *
 * ⚠️ **Der große Knall ist damit weg, und das entspricht den Interviews**
 * (§6 Z3, §12): Kein Befragter nennt einen Crash; genannt werden nicht
 * haltbare Toleranzen, Termindruck und ein defekter Späneförderer. Der
 * Satz aus §6 Z3, der den Preis dieses Tages als „Werkzeug und Spannung“
 * beschreibt, gehört zur gestrichenen Fassung und ist **zur Abnahme
 * gemeldet**, nicht heimlich weitergebaut.
 */

/** Nach zwei Fehlversuchen bietet die App die Lösung an (flow 6.6). */
const HILFE_AB = 2

/**
 * Wie lange eine Programmzeile mindestens dransteht, bevor die nächste
 * gefahren wird, in Millisekunden.
 *
 * **Der Takt ist die Reparatur des Wisch-Problems.** Vorher folgte `gelesen`
 * dem Finger unmittelbar: Ein Wisch über die volle Breite sprang in einem
 * Zeigerereignis auf 14/14, und sämtliche Klammer-Kommentare — die gesamte
 * Erklärebene des Screens — waren übersprungen, ohne dass jemand sie je
 * gesehen hätte. Jetzt setzt der Finger nur das **Ziel**; abgearbeitet wird
 * Zeile für Zeile, wie es eine Steuerung täte. Wer weit zieht, sieht das
 * Programm ablaufen statt es zu überspringen — und der Werkzeugweg zeichnet
 * sich dazu in seinen gleichmäßigen Schritten (§7).
 */
const ZEILEN_TAKT_MS = 800

const TREFFER_TEXT =
  'Gefunden. Ohne das Minus fährt das Werkzeug vom Teil weg statt an ihm entlang.'

const LUFTSCHNITT_TEXT =
  'Ohne das Minus fährt das Werkzeug am Teil vorbei ins Leere. Kein Span, keine Form, der Durchlauf umsonst. Deshalb startet niemand ohne Simulation.'

/** Wie die Zeile auf dem Steuerungsbildschirm steht — vor und nach der Korrektur. */
function codeVon(zeile: Programmzeile, index: number, korrigiert: boolean): string {
  return index === FEHLERZEILE && !korrigiert ? FEHLER_CODE : zeile.code
}

export function Z3() {
  const gespeichert = useFortschritt().answers.z3
  const vorbei = !!(gespeichert?.gefunden || gespeichert?.kollision)

  const [gelesen, setGelesen] = useState(() =>
    vorbei ? PROGRAMM.length : (gespeichert?.zeilen ?? 0),
  )
  /** Bis zu welcher Zeile der Finger den Vorschub bestellt hat. */
  const [ziel, setZiel] = useState(() => (vorbei ? PROGRAMM.length : 0))
  /** Wann die letzte Zeile gefahren ist — für den Takt (`ZEILEN_TAKT_MS`). */
  const letzterSchritt = useRef(0)
  const [gefunden, setGefunden] = useState(() => !!gespeichert?.gefunden)
  /**
   * Blind gestartet. Das Antwortfeld heißt nach der Spec-Signatur weiter
   * `kollision` (§6 Z3) — was daraus in der Welt wird, ist der Luftschnitt.
   */
  const [luftschnitt, setLuftschnitt] = useState(() => !!gespeichert?.kollision)
  const [versuche, setVersuche] = useState(0)
  /** Die zuletzt angetippte Zeile — auch die falsche bleibt markiert stehen. */
  const [markiert, setMarkiert] = useState<number | null>(() =>
    vorbei ? FEHLERZEILE : null,
  )
  /** „Zeig mir wie“ zeigt auf die Zeile, tippt sie aber nicht selbst an. */
  const [vorschlag, setVorschlag] = useState(false)
  const [ergebnis, setErgebnis] = useState<{ treffer: boolean; text: string } | null>(
    () =>
      gespeichert?.gefunden
        ? { treffer: true, text: TREFFER_TEXT }
        : gespeichert?.kollision
          ? { treffer: false, text: LUFTSCHNITT_TEXT }
          : null,
  )

  const gelesenFertig = gelesen >= PROGRAMM.length
  const erledigt = gefunden || luftschnitt
  const takt = luftschnitt
    ? 'luftschnitt'
    : gefunden
      ? 'gefunden'
      : gelesenFertig
        ? 'suchen'
        : 'lesen'

  /**
   * Wohin der Finger den Vorschub bestellt — **nur das Ziel, nicht der
   * Stand.** Nur vorwärts: Ein zurückgezogener Finger nimmt keine Zeile
   * zurück; ein Programm läuft ab, es lässt sich nicht rückwärts fahren.
   */
  const fahreBis = (anteil: number) => {
    const n = Math.min(
      PROGRAMM.length,
      Math.max(ziel, Math.round(anteil * PROGRAMM.length)),
    )
    if (n !== ziel) setZiel(n)
  }

  /**
   * Der Vorschub selbst: eine Zeile je Takt, dem Ziel hinterher.
   *
   * Geschrieben wird **je Zeile einmal**, nicht je Zeigerereignis — und weil
   * `letzterSchritt` beim Mount auf null steht, fährt die erste bestellte
   * Zeile ohne Wartezeit los: Der erste Zug soll sofort etwas tun.
   */
  useEffect(() => {
    if (takt !== 'lesen' || gelesen >= ziel) return
    const warten = Math.max(
      0,
      ZEILEN_TAKT_MS - (performance.now() - letzterSchritt.current),
    )
    const id = window.setTimeout(() => {
      letzterSchritt.current = performance.now()
      const n = Math.min(PROGRAMM.length, gelesen + 1)
      setGelesen(n)
      merkeAntwort('z3', { zeilen: n, gefunden: false, kollision: false })
    }, warten)
    return () => window.clearTimeout(id)
  }, [gelesen, ziel, takt])

  const tippeZeile = (index: number) => {
    if (takt !== 'suchen') return
    setMarkiert(index)
    if (index === FEHLERZEILE) {
      setGefunden(true)
      setErgebnis({ treffer: true, text: TREFFER_TEXT })
      merkeAntwort('z3', { zeilen: gelesen, gefunden: true, kollision: false })
      return
    }
    setVersuche((n) => n + 1)
    setErgebnis({
      treffer: false,
      text: 'Diese Zeile stimmt. Achte auf die Vorzeichen — ins Material geht es nach Minus.',
    })
  }

  const startDruecken = () => {
    setLuftschnitt(true)
    setMarkiert(FEHLERZEILE)
    setErgebnis({ treffer: false, text: LUFTSCHNITT_TEXT })
    merkeAntwort('z3', { zeilen: gelesen, gefunden: false, kollision: true })
  }

  const zeigMirWie = () => {
    setVorschlag(true)
    setErgebnis(null)
  }

  return (
    <StepShell
      id="Z3"
      auftrag={
        erledigt ? null : takt === 'lesen' ? 'Zieh das Werkzeug am Teil entlang.' : null
      }
      /*
        Die Ansage gehört zu dieser Geste und nicht zu diesem Screen: Wer an
        diesem Tag in Z2 schon frei gezogen hat, bekommt sie hier nicht noch
        einmal (`komponenten/gesten.ts`).
      */
      ansage={
        takt === 'lesen'
          ? {
              geste: 'ziehen-frei',
              text: 'Du fährst das Werkzeug selbst — zieh nach rechts, am Teil entlang.',
              haken:
                'Die Maschine arbeitet Zeile für Zeile — auch wenn du schneller ziehst.',
            }
          : null
      }
      interaktionOffen={!erledigt}
      // Kein `karteBreit`: der Code ist rund zwanzig Zeichen breit, und jedes
      // Rem mehr Panel ging quer direkt von der Bühne ab — bei 52 rem begann
      // das SVG hinter der Panelkante und der halbe Werkzeugweg war verdeckt.
      buehneInteraktiv={takt === 'lesen'}
      buehne={
        <Vorschubflaeche
          aktiv={takt === 'lesen'}
          anteil={gelesen / PROGRAMM.length}
          onFahren={fahreBis}
        >
          <Werkzeugweg
            // `gelesen` ist die Zahl der abgearbeiteten Zeilen und damit
            // zugleich der Index der nächsten. Die Bühne rechnet **bis
            // ausschließlich** dieser Zeile (`weg.ts`), damit das Stück Kontur
            // in dem Moment erscheint, in dem der Besucher die Zeile
            // abschickt — und nicht schon, während die Klammer sie erst
            // ankündigt.
            zeile={gelesen}
            markierteZeile={markiert}
            luftschnitt={luftschnitt}
          />
        </Vorschubflaeche>
      }
      /*
        R10, wörtlich der Referenzfall der Designregeln: 14 Zeilen G-Code
        brauchen den ausdrücklichen Freibrief, dass niemand sie können muss —
        „Lesen können muss man es“ war eine Anforderung, keine Lizenz. Die
        Lektion (einmal durchgehen, bevor jemand startet) bleibt.
      */
      warum={
        <p>
          Das Programm sagt der Maschine, wohin das Werkzeug fährt — mit einem Maß und
          einer <Begriff id="drehzahl">Drehzahl</Begriff> je Zeile. 14 Zeilen, und du
          musst keine davon können: einmal durchgehen reicht, bevor jemand Start drückt.
        </p>
      }
      interaktion={
        <div className="flex min-h-0 flex-1 flex-col gap-3" data-wisch="aus">
          {/*
            Klammer, Anweisung und Rückmeldung stehen **über** der Liste:
            vierzehn Zeilen laufen auf iPad quer wie auf dem Handy unter die
            Scrollkante, und was dort unten stand, war ausgerechnet der Zustand
            des Steps — „Zeile x von 14“, die Aufgabe, das Urteil. Der Zustand
            darf nie unter der Kante liegen; die Liste darf es, sie holt ihre
            aktive Zeile selbst in den Sichtbereich (s. `Programmliste`).
          */}
          <Wechsel takt={takt}>
            {takt === 'lesen' ? (
              <div className="flex flex-col gap-3">
                {/*
                  R10, wörtlich der Referenzfall der Designregeln — und er
                  steht hier, wo er auf dem ersten Blick sichtbar ist, nicht
                  im `warum`, das auf Übungs-Steps nie rendert (`Lage.tsx`).
                */}
                <Lage>
                  14 Zeilen sagen der Maschine, wohin das Werkzeug fährt. Du musst keine
                  davon können — zieh, und sieh zu, was jede tut.
                </Lage>
                <Klammer zeile={PROGRAMM[gelesen]} nummer={gelesen + 1} />
              </div>
            ) : takt === 'suchen' ? (
              <div className="flex flex-col gap-3">
                <p className="text-[1.0625rem] font-semibold text-kh-paper">
                  Die Kontur steht. Aber eine der Fahrzeilen ist falsch — tipp sie an.
                </p>
                <Rueckmeldung
                  ok={ergebnis ? ergebnis.treffer : null}
                  text={ergebnis ? ergebnis.text : null}
                  testid="z3-rueckmeldung"
                />
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Rueckmeldung
                  ok={ergebnis ? ergebnis.treffer : null}
                  text={ergebnis ? ergebnis.text : null}
                  testid="z3-rueckmeldung"
                />
                <p className="text-[1.0625rem] leading-snug text-kh-paper/80">
                  {luftschnitt
                    ? 'Die Zeile ist korrigiert. Jetzt darfst du starten.'
                    : 'Ein Zeichen, und das Werkzeug fährt am Teil entlang statt daran vorbei. Jetzt darfst du starten.'}
                </p>
              </div>
            )}
          </Wechsel>

          <Programmliste
            gelesen={gelesen}
            takt={takt}
            markiert={markiert}
            vorschlag={vorschlag}
            korrigiert={erledigt}
            onZeile={tippeZeile}
          />
        </div>
      }
      aha={
        <>
          <AhaKarte
            sichtbar={erledigt}
            eyebrow="Warum drückt hier niemand einfach Start?"
          >
            Weil ein Programm einmal durchzugehen billiger ist als ein Durchlauf, der
            nichts bringt. An einer CNC wird erst simuliert und dann gestartet — das ist
            keine Vorsicht, das ist das Verfahren.
          </AhaKarte>
          {/* Ab dem zweiten Einwurf zugeklappt (R5). */}
          <AhaKarte sichtbar={luftschnitt} zugeklappt eyebrow="Passiert das jeden Tag?">
            Ein falsches Vorzeichen findet jeder mal. Was im Alltag wirklich anstrengt,
            ist anderes: Toleranzen, die sich nicht halten lassen, Termindruck — und ein
            Späneförderer, der ausfällt.
          </AhaKarte>
          <AhaKarte
            sichtbar={versuche > 0}
            zugeklappt
            eyebrow="Und wenn du ihn nicht findest?"
          >
            Dann sucht ihn jemand mit dir. Fehlersuche ist in der Halle nichts, was man
            allein macht — dafür gibt es Kollegen, und danach gefragt wird gern.
          </AhaKarte>
        </>
      }
      fuss={
        <StepFuss
          id="Z3"
          uebungOffen={!erledigt}
          aktion={
            takt === 'lesen' ? null : takt === 'suchen' ? (
              <div className="flex items-center gap-2">
                {versuche >= HILFE_AB && !vorschlag && (
                  <Button
                    variant="leise"
                    onClick={zeigMirWie}
                    data-testid="z3-zeig-mir-wie"
                  >
                    Zeig mir wie
                  </Button>
                )}
                {/*
                  Der verlockende Weg. Er ist die Handlung in der Fiktion —
                  und die Falle, die die Lektion des Screens trägt.
                */}
                <Button variant="aktion" onClick={startDruecken} data-testid="z3-start">
                  Start drücken
                </Button>
              </div>
            ) : null
          }
          // Nach dem Luftschnitt kein Stempel: der Screen ist zu Ende, aber
          // „geschafft“ wäre er nicht. Gelbgrün heißt in diesem System genau
          // eine Sache, und das hier ist sie nicht.
          geschafft={gefunden ? 'Fehler gefunden' : null}
        />
      }
    />
  )
}

// ---------------------------------------------------------------------------
// Die Ziehfläche über der Bühne
// ---------------------------------------------------------------------------

/**
 * Der **Vorschub in der Hand des Besuchers**.
 *
 * ---
 *
 * **Was hier ersetzt wurde.** Der Screen hatte vierzehn Zeilen G-Code und
 * darunter einen Knopf „Nächste Zeile". Vierzehnmal derselbe Knopf. Inhaltlich
 * war der Beat richtig gedacht — mit jeder Fahrzeile zeichnet sich ein Stück
 * Kontur, aus Text wird eine Form —, aber die Handlung dazu war Blättern, und
 * Blättern ist keine Handlung.
 *
 * Jetzt zieht der Besucher das Werkzeug mit dem Finger am Teil entlang, und
 * **der Code schreibt sich dabei mit**. Das ist dieselbe Geste wie in A4 und
 * Z2 (`ziehen-frei`) und dreht die Aussage des Screens vom Lesen aufs Tun:
 * nicht „hier steht, was die Maschine macht", sondern „was du machst, steht
 * gleich als Programm da". Für die Frage „Was mache ich in dem Beruf
 * eigentlich?" ist das der ehrlichste Screen des Tages — Programmieren ist
 * laut allen Interviews der beliebteste Teil der Arbeit, und ein Blätterknopf
 * verkauft ihn unter Wert.
 *
 * **Waagerecht, weil die Maschine waagerecht fährt.** Die Kontur läuft in
 * `Z`-Richtung von rechts nach links ins Material; die Ziehrichtung ist
 * dieselbe, die das Werkzeug nimmt.
 *
 * **Der Anteil wird aus der Zeigerposition gelesen, nicht aus der
 * Bewegungsstrecke.** Wer den Finger absetzt und weiter rechts wieder
 * aufsetzt, springt dorthin — das ist bei einem Kiosk mit ausgestrecktem Arm
 * die gnädigere Variante, und rückwärts geht ohnehin nichts (`fahreBis`).
 */
function Vorschubflaeche({
  aktiv,
  anteil,
  onFahren,
  children,
}: {
  aktiv: boolean
  /** Wie weit das Programm schon gefahren ist, 0–1 — für den Griff. */
  anteil: number
  onFahren: (anteil: number) => void
  children: React.ReactNode
}) {
  const flaeche = useRef<HTMLDivElement>(null)
  /*
    **Die Ziehfläche liegt im gemessenen freien Feld, nicht über dem ganzen
    Screen.** Quer sitzt das Panel links über der halben Breite; eine
    Ziehfläche über die volle Breite hieße, dass die erste Hälfte der Geste
    unter der Karte stattfindet — und der Griff, der sie ankündigt, lag dort
    als limetter Splitter hinter dem Panel. `useSichtfeld` liefert dieselbe
    Messung, aus der die 3D-Kamera ihr Fenster nimmt.
  */
  const frei = useSichtfeld('roh')
  const rahmen = {
    left: `${(frei?.links ?? 0) * 100}%`,
    right: `${(frei?.rechts ?? 0) * 100}%`,
    top: `${(frei?.oben ?? 0) * 100}%`,
    bottom: `${(frei?.unten ?? 0) * 100}%`,
  }

  const fahre = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = flaeche.current?.getBoundingClientRect()
    if (!r || r.width === 0) return
    onFahren((e.clientX - r.left) / r.width)
  }

  return (
    <div className="relative size-full">
      {children}
      {aktiv && (
        <div
          ref={flaeche}
          className="absolute touch-none"
          style={rahmen}
          data-wisch="aus"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId)
            fahre(e)
          }}
          onPointerMove={(e) => e.buttons !== 0 && fahre(e)}
          data-testid="z3-vorschub"
        >
          {/*
            Der Griff. Er zeigt, dass die Fläche etwas kann, und wandert mit
            dem Fortschritt — ohne ihn sieht die Bühne aus wie ein Bild, und
            genau daran ist die freie Ziehgeste in der Abnahme von A4 schon
            einmal gescheitert.
          */}
          <motion.span
            aria-hidden
            initial={false}
            animate={{ left: `${Math.min(96, Math.max(4, anteil * 100))}%` }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            // Innerhalb des freien Felds, knapp unter seiner Mitte: dort
            // liegt in beiden Lagen die Zeichnung, und der Griff steht
            // darunter statt hinter der Karte.
            className="absolute top-[64%] grid size-14 -translate-x-1/2 place-items-center rounded-full bg-kh-signal/15 ring-2 ring-kh-signal"
          >
            <span className="size-3 rounded-full bg-kh-signal" />
          </motion.span>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Das Programm im Panel
// ---------------------------------------------------------------------------

/**
 * Die Zeilenliste.
 *
 * **Kein Monospace.** Der Hüllenvertrag lässt keine neue Schriftfamilie zu
 * (khpl-tage.md §3, `src/index.css` eingefroren), und eine Steuerung setzt
 * ihren Code ohnehin nicht in Courier: versal, halbfett, weit gesperrt und mit
 * Ziffern gleicher Breite sieht die Zeile aus wie auf dem Maschinenbildschirm
 * — und liest sich in einer Halle besser als jede Schreibmaschinenschrift.
 *
 * **Nur die Fahrzeilen sind antippbar**, und zwar erst in der Suchphase.
 * `kanon.ts` markiert sie mit `faehrt`: Werkzeugwechsel, Drehzahl und Kühlung
 * bewegen nichts und können deshalb auch nichts in die falsche Richtung
 * bewegen. Das halbiert die Zahl der Ziele und macht sie groß genug für einen
 * ausgestreckten Arm — ohne die Aufgabe zu verraten, denn welche der sechs es
 * ist, steht nirgends.
 *
 * **60 px hoch, mit Abstand dazwischen** (khpl-tage.md §3). Sechs Ziele
 * unmittelbar aneinander wären am Messekiosk ein Fehltipp mit Folgen: Er
 * erzeugt sofort eine „falsch“-Rückmeldung und zählt den Versuchszähler für
 * „Zeig mir wie“ hoch. Die Rüstzeilen bleiben kompakt — sie sind nicht
 * antippbar und brauchen keine Trefferfläche.
 */
function Programmliste({
  gelesen,
  takt,
  markiert,
  vorschlag,
  korrigiert,
  onZeile,
}: {
  gelesen: number
  takt: string
  markiert: number | null
  vorschlag: boolean
  korrigiert: boolean
  onZeile: (index: number) => void
}) {
  const suchen = takt === 'suchen'

  /**
   * Die Zeile, um die es gerade geht — beim Lesen die nächste, beim Suchen die
   * angetippte. Sie holt sich selbst in den Sichtbereich: Die Liste steht
   * unter Klammer und Anweisung, und ab Zeile elf liegt sie unter der
   * Scrollkante des Panels. `nearest` rückt nur nach, wenn die Zeile wirklich
   * draußen ist — wer selbst hochgescrollt hat, wird nicht zurückgezerrt,
   * solange die Zeile im Bild bleibt.
   */
  const aktiv = takt === 'lesen' ? gelesen : markiert
  const aktivRef = useRef<HTMLLIElement | null>(null)
  useEffect(() => {
    aktivRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [aktiv])

  return (
    // `flex-1 min-h-0 overflow-y-auto`: die Liste nimmt den Rest des Panels
    // und scrollt **selbst**, statt das ganze Panel mitzuziehen. So bleiben
    // Klammer und Anweisung darüber stehen, egal bei welcher Zeile man ist.
    //
    // **`min-h-[11rem]` ist die Untergrenze dazu.** Ohne sie gibt `flex-1`
    // allen Platz an Fachtext, Klammer und Rückmeldung ab und die Liste
    // bekommt, was übrig bleibt: auf dem Handy hochkant waren das im Takt
    // `suchen` 0 vollständige Zeilen, nach einem Fehlversuch 23,7 px. Die
    // Aufgabe des Screens ist, eine von sechs Fahrzeilen anzutippen — in
    // einem 24-px-Schlitz geht das nicht. Drei Zeilen sind das Minimum, in
    // dem man überhaupt vergleichen kann; reicht der Platz dafür nicht,
    // scrollt lieber das Panel.
    <ol
      className="kh-feld flex min-h-[11rem] flex-1 flex-col gap-1.5 overflow-y-auto overscroll-contain px-2 py-2"
      data-testid="z3-programm"
    >
      {PROGRAMM.map((zeile, i) => {
        const dran = i === gelesen && takt === 'lesen'
        // Abgeblendet ist, was **hinter** der aktuellen Zeile liegt. Die eine
        // Zeile, über die die Klammer darunter gerade spricht, steht voll
        // deckend in Orange da — sie zusätzlich auf 35 % zu nehmen, machte
        // ausgerechnet sie zur blassesten der Liste, und am Messekiosk liest
        // man sie mit ausgestrecktem Arm.
        const offen = i > gelesen && takt === 'lesen'
        const waehlbar = suchen && zeile.faehrt === true
        const zeigen = vorschlag && i === FEHLERZEILE
        const istMarkiert = markiert === i

        const inhalt = (
          <>
            <span
              aria-hidden
              className="w-6 shrink-0 text-right text-[0.8125rem] text-kh-mute/60 tabular-nums"
            >
              {i + 1}
            </span>
            <span
              className={`min-w-0 flex-1 truncate text-[0.9375rem] font-semibold tracking-[0.06em] tabular-nums ${
                dran || istMarkiert ? 'text-kh-orange' : 'text-kh-paper'
              }`}
            >
              {codeVon(zeile, i, korrigiert)}
            </span>
            {zeigen && !istMarkiert && <span className="kh-etikett shrink-0">Hier</span>}
          </>
        )

        const grund = `flex items-center gap-2.5 rounded-[6px] px-2 transition-colors ${
          offen ? 'opacity-35' : ''
        } ${istMarkiert ? 'bg-kh-orange/12' : ''} ${
          zeigen && !istMarkiert ? 'ring-2 ring-kh-orange/60 ring-inset' : ''
        }`

        return (
          <li key={zeile.code + i} ref={i === aktiv ? aktivRef : undefined}>
            {waehlbar ? (
              <motion.button
                type="button"
                onClick={() => onZeile(i)}
                whileTap={{ scale: 0.985 }}
                data-testid={`z3-zeile-${i}`}
                className={`${grund} min-h-[60px] w-full text-left`}
              >
                {inhalt}
              </motion.button>
            ) : (
              <div className={`${grund} min-h-[26px]`}>{inhalt}</div>
            )}
          </li>
        )
      })}

      {/*
        Welche Steuerung der Screen annimmt, gehört sichtbar dazu — sonst
        behauptet er, jedes CNC-Programm sähe so aus (§6 Z3).
      */}
      <li className="border-t border-kh-line px-2 pt-1.5 text-[0.8125rem] leading-snug text-kh-mute/70">
        {STEUERUNG}
      </li>
    </ol>
  )
}

/**
 * Die Klammer hinter der Zeile, die als Nächstes drankommt — im echten
 * Programm ein Kommentar.
 *
 * Sie steht **über** der Liste und nicht in ihr: vierzehn Zeilen mit
 * Erklärung daneben passen auf kein Hochkant-Panel, und die Erklärung, die
 * zählt, ist immer nur die eine. Und nicht darunter — dort liegt ab Zeile elf
 * die Scrollkante, und die Klammer ist der Zustand des Steps.
 */
function Klammer({
  zeile,
  nummer,
}: {
  zeile: Programmzeile | undefined
  nummer: number
}) {
  if (!zeile) return null
  return (
    <div className="flex flex-col gap-0.5">
      <span className="kh-etikett">
        Zeile {nummer} von {PROGRAMM.length}
        {zeile.faehrt ? ' · fährt' : ' · rüstet'}
      </span>
      <p className="text-[1.0625rem] leading-snug text-kh-paper/85">{zeile.kommentar}</p>
    </div>
  )
}
