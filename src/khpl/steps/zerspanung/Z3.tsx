import { useState } from 'react'
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
 * *Start drücken*. Wer blind startet, fährt das Werkzeug in die Spannbacke.
 * Der Preis dieses Tages ist nicht Material und nicht Zeit, sondern Werkzeug,
 * Spannung und Vertrauen: danach muss alles neu vermessen werden. Genau
 * deshalb wird an einer CNC nie ohne Simulation gestartet, und genau das ist
 * die Lektion.
 *
 * ⚠️ **Der Crash ist der Extremfall, nicht der Alltag.** Kein Befragter nennt
 * ihn; genannt werden nicht haltbare Toleranzen, Termindruck und ein defekter
 * Späneförderer. Der Screen darf ihn zeigen, weil er die Lektion trägt — der
 * Fachtext erzählt ihn nicht als Normalfall, und der Einwurf danach rückt ihn
 * gerade.
 *
 * ⚠️ **Der Steuerungsdialekt steht sichtbar dabei** (§6 Z3, §11): Heidenhain
 * schreibt Klartext, Siemens ShopTurn ist grafisch. „So sieht jedes
 * CNC-Programm aus“ wäre falsch. Programm, Fehlerzeile und Dialekt kommen aus
 * `buehne/zerspanung/kanon.ts`; der Code ist **fachlich abzunehmen**.
 *
 * ⚠️ **Gemeldeter Widerspruch in der Spec, nicht gelöst** (khpl-tage.md §3).
 * §11 ersetzt den eingebauten Fehler durch das fehlende Minuszeichen
 * (`G1 Z35.` fährt vom Teil **weg**, ins Leere); §6 Z3 trägt aber weiter die
 * Folge der alten Fassung („fährt das Werkzeug in die Spannbacke“, das Bild
 * friert am Aufprall). Beide sind so gebaut, wie sie validiert sind — und
 * physikalisch unvereinbar: derselbe Fehler kann nicht zugleich ins Leere und
 * in die Backe führen. Kandidaten zur Abstimmung: die Folge des blinden
 * Starts an den Minus-Fehler anpassen (Luftschnitt, das Teil bleibt ungedreht)
 * oder einen Fehler wählen, der wirklich in die Backe fährt. `KOLLISION_TEXT`,
 * `AUFPRALL` (Werkzeugweg.tsx) und `FEHLER_CODE` müssen danach zur selben
 * Physik gehören.
 */

/** Nach zwei Fehlversuchen bietet die App die Lösung an (flow 6.6). */
const HILFE_AB = 2

const TREFFER_TEXT =
  'Gefunden. Ohne das Minus fährt das Werkzeug vom Teil weg statt an ihm entlang.'

const KOLLISION_TEXT =
  'Das Werkzeug ist in die Spannbacke gefahren. Schneide hin, Spannung hin — und alles, was du gerüstet hast, musst du neu vermessen. Deshalb geht an einer CNC niemand ohne Simulation auf Start.'

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
  const [kollision, setKollision] = useState(() => !!gespeichert?.kollision)
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
          ? { treffer: false, text: KOLLISION_TEXT }
          : null,
  )

  const gelesenFertig = gelesen >= PROGRAMM.length
  const erledigt = gefunden || kollision
  const takt = kollision
    ? 'kollision'
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
    setKollision(true)
    setMarkiert(FEHLERZEILE)
    setErgebnis({ treffer: false, text: KOLLISION_TEXT })
    merkeAntwort('z3', { zeilen: gelesen, gefunden: false, kollision: true })
  }

  const zeigMirWie = () => {
    setVorschlag(true)
    setErgebnis(null)
  }

  return (
    <StepShell
      id="Z3"
      interaktionOffen={!erledigt}
      // Code und Klammer nebeneinander brauchen quer die breite Spalte.
      karteBreit
      buehne={
        <Werkstueck
          zustand="werkzeugweg"
          // `gelesen` ist die Zahl der abgearbeiteten Zeilen und damit zugleich
          // der Index der nächsten: gezeichnet ist die Kontur bis
          // ausschließlich dieser Zeile.
          zeile={gelesen}
          markierteZeile={markiert}
          kollision={kollision}
        />
      }
      fachtext={
        <p>
          Das Programm sagt der Maschine, wohin das Werkzeug fährt. Der Zerspaner schreibt
          es nicht immer selbst — aber er muss es <em>lesen</em> können, bevor er Start
          drückt. Jede Zeile ist ein Weg: ein Maß, ein{' '}
          <Begriff id="vorschub">Vorschub</Begriff>, eine{' '}
          <Begriff id="drehzahl">Drehzahl</Begriff>.
        </p>
      }
      interaktion={
        <div className="flex flex-col gap-3" data-wisch="aus">
          <Programmliste
            gelesen={gelesen}
            takt={takt}
            markiert={markiert}
            vorschlag={vorschlag}
            korrigiert={erledigt}
            onZeile={tippeZeile}
          />

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
                  {kollision
                    ? 'Die Zeile ist korrigiert. Jetzt darfst du starten.'
                    : 'Ein Zeichen, und das Werkzeug fährt am Teil entlang statt daran vorbei. Jetzt darfst du starten.'}
                </p>
              </div>
            )}
          </Wechsel>
        </div>
      }
      aha={
        <>
          <AhaKarte
            sichtbar={erledigt}
            eyebrow="Warum drückt hier niemand einfach Start?"
          >
            Weil ein Programm einmal durchzugehen billiger ist als ein Werkzeug. An einer
            CNC wird erst simuliert und dann gestartet — das ist keine Vorsicht, das ist
            das Verfahren.
          </AhaKarte>
          <AhaKarte sichtbar={kollision} eyebrow="Passiert das jeden Tag?">
            Selten. Was im Alltag wirklich anstrengt, sind Toleranzen, die sich nicht
            halten lassen, und Termindruck — nicht der große Knall.
          </AhaKarte>
          <AhaKarte sichtbar={versuche > 0} eyebrow="Und wenn du ihn nicht findest?">
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
          // Nach der Kollision kein Stempel: der Screen ist zu Ende, aber
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

  return (
    <ol className="kh-feld flex flex-col px-2 py-2" data-testid="z3-programm">
      {PROGRAMM.map((zeile, i) => {
        const dran = i === gelesen && takt === 'lesen'
        const offen = i >= gelesen && takt === 'lesen'
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
          <li key={zeile.code + i}>
            {waehlbar ? (
              <motion.button
                type="button"
                onClick={() => onZeile(i)}
                whileTap={{ scale: 0.985 }}
                data-testid={`z3-zeile-${i}`}
                // 52 px wie die kleinsten Ziele des Dachdecker-Tages: sechs
                // Zeilen dicht untereinander, und ein Fehltipp erzeugt hier
                // eine „falsch“-Rückmeldung.
                className={`${grund} min-h-[52px] w-full text-left`}
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
      <li className="mt-1.5 border-t border-kh-line px-2 pt-1.5 text-[0.8125rem] leading-snug text-kh-mute/70">
        {STEUERUNG}
      </li>
    </ol>
  )
}

/**
 * Die Klammer hinter der Zeile, die als Nächstes drankommt — im echten
 * Programm ein Kommentar.
 *
 * Sie steht **unter** der Liste und nicht in ihr: vierzehn Zeilen mit
 * Erklärung daneben passen auf kein Hochkant-Panel, und die Erklärung, die
 * zählt, ist immer nur die eine.
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
