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
import { Werkstueck } from '@/khpl/buehne/zerspanung/Werkstueck'
import { AhaKarte } from '@/khpl/komponenten/AhaKarte'
import { Rueckmeldung } from '@/khpl/komponenten/Rueckmeldung'
import { Wechsel } from '@/khpl/komponenten/Wechsel'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
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

  const naechsteZeile = () => {
    const n = Math.min(PROGRAMM.length, gelesen + 1)
    setGelesen(n)
    merkeAntwort('z3', { zeilen: n, gefunden: false, kollision: false })
  }

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
      auftrag={erledigt ? null : 'Geh das Programm durch, Zeile für Zeile.'}
      ansage={null}
      interaktionOffen={!erledigt}
      // Kein `karteBreit`: der Code ist rund zwanzig Zeichen breit, und jedes
      // Rem mehr Panel ging quer direkt von der Bühne ab — bei 52 rem begann
      // das SVG hinter der Panelkante und der halbe Werkzeugweg war verdeckt.
      buehne={
        <Werkstueck
          zustand="werkzeugweg"
          // `gelesen` ist die Zahl der abgearbeiteten Zeilen und damit zugleich
          // der Index der nächsten. Die Bühne rechnet **bis ausschließlich**
          // dieser Zeile (`weg.ts`), damit das Stück Kontur in dem Moment
          // erscheint, in dem der Besucher die Zeile abschickt — und nicht
          // schon, während die Klammer sie erst ankündigt.
          zeile={gelesen}
          markierteZeile={markiert}
          luftschnitt={luftschnitt}
        />
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
              <Klammer zeile={PROGRAMM[gelesen]} nummer={gelesen + 1} />
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
            takt === 'lesen' ? (
              <Button
                variant="aktion"
                onClick={naechsteZeile}
                data-testid="z3-naechste-zeile"
              >
                {gelesen === 0 ? 'Erste Zeile' : 'Nächste Zeile'}
              </Button>
            ) : takt === 'suchen' ? (
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
