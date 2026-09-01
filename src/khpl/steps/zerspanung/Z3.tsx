import { useCallback, useState } from 'react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { StepFoto } from '@/khpl/buehne/Foto'
import { Werkzeugweg } from '@/khpl/buehne/zerspanung/Werkzeugweg'
import { PROGRAMM_SAETZE, UEBUNGS_SAETZE } from '@/khpl/buehne/zerspanung/kanon'
import { AhaKarte } from '@/khpl/komponenten/AhaKarte'
import { Klappliste } from '@/khpl/komponenten/Klappliste'
import { Lage } from '@/khpl/komponenten/Lage'
import { Rueckmeldung } from '@/khpl/komponenten/Rueckmeldung'
import { Wahlflaeche } from '@/khpl/komponenten/Wahlflaeche'
import { Wechsel } from '@/khpl/komponenten/Wechsel'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { merkeAntwort, useFortschritt } from '@/khpl/store/fortschritt'
import { Begriff } from './Begriff'

/**
 * Z3 — Die Sprache der Maschine. **Der komplette Neubau dieses Screens**,
 * nachdem die Vorfassung („Vier Sätze, ein Weg“ — vier NC-Sätze antippen,
 * dann die Fase im Code finden) am Stand wiederholt gescheitert ist: zu
 * verwirrend, zu schnell, zu viel Syntax auf einmal.
 *
 * Jetzt ist Z3 ein ruhiger, **vollständig selbstgetakteter** Erklär-Screen
 * in drei Kapiteln — nichts läuft von allein weiter, alles ist wiederholbar,
 * und es gibt **keine Abfrage** mehr:
 *
 *  1. **Maschine** — das echte Foto, drei antippbare Fragen: Was ist eine
 *     CNC-Maschine, warum ist die Tür zu, wer steuert sie. Mit Ankern aus
 *     dem Alltag (Fahrrad-Achse, Handy-Rahmen).
 *  2. **Befehle** — die Brücke: die Maschine braucht ihre Befehle in einer
 *     eigenen Sprache. Drei Zeilen, jede mit Code **und** Klartext; Antippen
 *     zeigt das Stück Weg auf der Bühne, „Abspielen“ fährt alle drei am
 *     Stück. Beliebig oft.
 *  3. **Programm** — „das war einfach, hier ein echtes“: das Programm für
 *     den Bolzen des Tages steht klein da (lesen muss es niemand), groß ist
 *     die **Bewegung** — Schruppen, Schlichten, Fase, mit sichtbar
 *     verschwindendem Material. Die laufende Zeile leuchtet im Listing mit:
 *     Code und Bewegung sind dieselbe Sache, das ist die eine Einsicht.
 *
 * **`answers.z3`** behält aus Kompatibilität die alte Form
 * `{ gesehen, gefunden, versuche }`: `gesehen` sind jetzt die besuchten
 * Kapitel, `gefunden` heißt „hat das Programm bis zum Ende laufen sehen“
 * (Z7 liest genau dieses Flag für seinen Rückblick), `versuche` ist ein
 * Altfeld und bleibt 0 — es gibt nichts mehr zu versuchen.
 */

/**
 * Die drei Befehle des zweiten Kapitels: Code aus dem Kanon (dieselben
 * Sätze, die die Bühne fährt), Klartext hier — eine Zeile je Befehl, in
 * Alltagsworten.
 */
const BEFEHLE = [
  {
    code: UEBUNGS_SAETZE[0].code,
    zeile: 'Fahr schnell an diese Stelle — noch ohne zu schneiden.',
  },
  {
    code: UEBUNGS_SAETZE[1].code,
    zeile: 'Geh langsam runter, bis die Schneide auf der richtigen Höhe steht.',
  },
  {
    code: UEBUNGS_SAETZE[2].code,
    zeile: 'Fahr eine gerade Linie am Teil entlang. Jetzt schneidet sie.',
  },
]

/**
 * Die drei Fragen des ersten Kapitels. Als Klappliste, nicht als Textwand:
 * der Besucher holt sich jede Antwort selbst — das ist das Erkunden, aus dem
 * dieser Screen besteht. Antworten in einfachster Sprache, mit Dingen, die
 * ein:e Vierzehnjährige:r in der Hand hatte.
 */
const MASCHINEN_FRAGEN = [
  {
    frage: 'Was ist das für eine Maschine?',
    antwort:
      'Eine CNC-Maschine. Das heißt: Ein Computer steuert das Werkzeug, nicht deine Hand. Fast jedes Teil aus Metall wird heute so gemacht — die Achse in deinem Fahrrad, der Rahmen von deinem Handy, tausend Teile in jedem Auto.',
  },
  {
    frage: 'Warum ist da eine Scheibe davor?',
    antwort:
      'Dahinter dreht sich alles viel schneller, als dein Auge mitkommt. Das Werkzeug schält Metall ab, Span für Span. Die Späne fliegen, und eine milchige Flüssigkeit kühlt alles — deshalb bleibt die Tür zu, solange die Maschine läuft.',
  },
  {
    frage: 'Woher weiß sie, was sie tun soll?',
    antwort:
      'Von dir. Die Maschine denkt sich nichts aus. Sie bekommt eine Liste mit Befehlen — das Programm — und arbeitet sie ab, Befehl für Befehl. Nicht mehr und nicht weniger.',
  },
]

type Phase = 'maschine' | 'befehle' | 'programm'

export function Z3() {
  const gespeichert = useFortschritt().answers.z3
  /**
   * Am Kapitelnamen geprüft, nicht an `gefunden`: ein Stand aus der
   * Quiz-Fassung (`gesehen: ['n10', …]`, `gefunden: true`) soll den Neubau
   * von vorn zeigen — sonst landete dieser Besucher im fertigen dritten
   * Kapitel und sähe die Maschine und ihre Befehle nie.
   */
  const wiederbesuch = !!gespeichert?.gesehen.includes('programm')

  const [phase, setPhase] = useState<Phase>(() =>
    wiederbesuch ? 'programm' : 'maschine',
  )
  const [fertig, setFertig] = useState(wiederbesuch)
  /** Der angetippte Befehl im zweiten Kapitel — die Bühne zeigt sein Stück Weg. */
  const [markiert, setMarkiert] = useState<number | null>(null)
  /** Zähler der gestarteten Fahrten — jede Erhöhung spielt von vorn. */
  const [fahrt, setFahrt] = useState(0)
  /** Läuft gerade eine Fahrt? Solange ja, ist der Abspielknopf gesperrt. */
  const [faehrt, setFaehrt] = useState(false)
  /** Das aktuelle Kapitel wurde mindestens einmal ganz gesehen. */
  const [gespielt, setGespielt] = useState(wiederbesuch)
  /** Der Satz, den die Bühne gerade fährt — er leuchtet im Panel mit. */
  const [laufSatz, setLaufSatz] = useState<number | null>(null)

  const zuDenBefehlen = () => {
    setPhase('befehle')
    setGespielt(false)
    setFahrt(0)
    merkeAntwort('z3', { gesehen: ['maschine'], gefunden: false, versuche: 0 })
  }

  const zumProgramm = () => {
    setPhase('programm')
    setGespielt(false)
    setFahrt(0)
    setMarkiert(null)
    merkeAntwort('z3', {
      gesehen: ['maschine', 'befehle'],
      gefunden: false,
      versuche: 0,
    })
  }

  const abspielen = () => {
    setMarkiert(null)
    setFaehrt(true)
    setFahrt((n) => n + 1)
  }

  /** Beide Callbacks memoisiert — die Bühne hängt ihre Effekte daran auf. */
  const fahrtBeendet = useCallback(() => {
    setFaehrt(false)
    setGespielt(true)
    setLaufSatz(null)
    // Nur die erste vollständige Programmfahrt zählt — jedes „Nochmal
    // abspielen“ danach würde sonst denselben Stand erneut melden.
    if (phase === 'programm' && !fertig) {
      setFertig(true)
      merkeAntwort('z3', {
        gesehen: ['maschine', 'befehle', 'programm'],
        gefunden: true,
        versuche: 0,
      })
    }
  }, [phase, fertig])
  const merkeLaufSatz = useCallback((satz: number | null) => setLaufSatz(satz), [])

  return (
    <StepShell
      id="Z3"
      auftrag={
        fertig
          ? null
          : phase === 'maschine'
            ? 'Tipp die drei Fragen an.'
            : phase === 'befehle'
              ? gespielt
                ? null
                : 'Schau dir die drei Befehle an — dann spiel sie ab.'
              : 'Spiel das ganze Programm ab.'
      }
      ansage={null}
      interaktionOffen={!fertig}
      buehne={
        phase === 'maschine' ? (
          <StepFoto id="Z3" />
        ) : (
          <Werkzeugweg
            key={phase}
            zustand={{ kapitel: phase, markiert, fahrt, gefahren: gespielt }}
            onSchritt={merkeLaufSatz}
            onGefahren={fahrtBeendet}
          />
        )
      }
      warum={
        <p>
          Niemand führt hier das Werkzeug mit der Hand. Die{' '}
          <Begriff id="cnc">CNC</Begriff>-Steuerung liest das Programm Befehl für Befehl
          und macht daraus Bewegung.
        </p>
      }
      interaktion={
        <Wechsel takt={phase}>
          {phase === 'maschine' ? (
            <div className="flex flex-col gap-3">
              <Lage>
                Dein Rohteil ist gespannt, die Tür ist zu. Bevor es losgeht: Lern die
                Maschine kennen, an der du heute stehst.
              </Lage>
              <Klappliste kennung="z3-maschine" abschnitte={MASCHINEN_FRAGEN} />
            </div>
          ) : phase === 'befehle' ? (
            <div className="flex flex-col gap-3">
              <Lage>
                Die Maschine liest ihr Programm wie eine Liste: ein Befehl, eine Bewegung.
                Hier sind drei. Links steht der Code, darunter, was er heißt.
              </Lage>

              <ul className="flex flex-col gap-2" data-testid="z3-befehle">
                {BEFEHLE.map((b, i) => (
                  <li key={b.code} className="flex">
                    <Wahlflaeche
                      onClick={() => setMarkiert(markiert === i ? null : i)}
                      gewaehlt={!faehrt && markiert === i}
                      ton="vorlaeufig"
                      data-testid={`z3-befehl-${i}`}
                      // Während der Fahrt markiert die Bühne, welcher Befehl
                      // gerade dran ist — Orange als Linie: die Maschine
                      // arbeitet, nicht der Besucher.
                      className={`flex-col items-start gap-0.5 py-2.5 ${
                        faehrt && laufSatz === i ? 'border-kh-orange' : ''
                      }`}
                    >
                      <span className="font-mono text-[1.0625rem] font-semibold tracking-wide">
                        {b.code}
                      </span>
                      <span className="text-[0.9375rem] text-kh-mute">{b.zeile}</span>
                    </Wahlflaeche>
                  </li>
                ))}
              </ul>

              <p className="text-[0.9375rem] text-kh-mute">
                G0 heißt: schnell hinfahren, nichts schneiden. G1 heißt: langsam fahren —
                und sobald die Schneide im Metall ist, schneidet sie dabei. Die Zahlen
                sagen nur, wohin.
              </p>

              <Rueckmeldung
                ok={gespielt ? true : null}
                text={
                  gespielt
                    ? 'Genau diese drei Befehle — die Maschine hat nichts dazuerfunden. Und weil sich das Teil dabei rasend schnell dreht, wird es rundherum dünner, obwohl das Werkzeug nur oben ansetzt.'
                    : null
                }
                testid="z3-befehle-gespielt"
              />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Lage>
                Drei Befehle kannst du jetzt lesen. Ein echtes Programm hat ein paar mehr
                — das hier macht deinen Bolzen aus Z1.
              </Lage>

              {/* Absichtlich klein und grau: das Listing ist Kulisse, nicht
                  Lesestoff. Groß ist die Bewegung auf der Bühne — nur die
                  gerade laufende Zeile leuchtet mit. */}
              <div
                className="kh-feld columns-2 gap-x-5 px-4 py-3 font-mono text-[0.8125rem] leading-[1.55]"
                data-testid="z3-programm"
              >
                {PROGRAMM_SAETZE.map((s, i) => (
                  <span
                    key={s.code}
                    className={`block ${
                      laufSatz === i ? 'font-semibold text-kh-orange' : 'text-kh-mute'
                    }`}
                  >
                    {s.code}
                  </span>
                ))}
              </div>

              {!fertig && (
                <p className="text-[0.9375rem] text-kh-mute">
                  Du musst das nicht lesen können. Schau auf die Maschine: Sie macht aus
                  jeder Zeile ein Stück Weg.
                </p>
              )}

              {fertig && (
                <>
                  <Rueckmeldung
                    ok
                    text="Fertig — dein Bolzen. Jede Zeile war ein Stück Weg: erst grob Material weg, dann der feine letzte Schnitt mit der Schräge vorn."
                    testid="z3-fertig"
                  />
                  <motion.p
                    initial={{ opacity: 0, transform: 'translateY(8px)' }}
                    animate={{ opacity: 1, transform: 'translateY(0px)' }}
                    transition={{ duration: 0.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    data-testid="z3-pointe"
                    className="kh-titel-klein text-kh-orange"
                  >
                    Die Maschine macht nur, was da steht. Was da steht, entscheidest du.
                  </motion.p>
                  <Button
                    variant="neben"
                    size="sm"
                    onClick={abspielen}
                    disabled={faehrt}
                    data-testid="z3-nochmal"
                    className="self-start"
                  >
                    Nochmal abspielen
                  </Button>
                </>
              )}
            </div>
          )}
        </Wechsel>
      }
      aha={
        <AhaKarte sichtbar={fertig} eyebrow="Tippt das jemand alles von Hand?">
          Kurze Programme tippt man direkt an der Maschine ein. Lange rechnet ein Programm
          am Computer aus. Aber lesen können muss es hier jede:r — sonst merkt niemand,
          wenn ein Befehl falsch ist.
        </AhaKarte>
      }
      fuss={
        <StepFuss
          id="Z3"
          uebungOffen={!fertig}
          aktion={
            phase === 'maschine' ? (
              <Button
                variant="aktion"
                onClick={zuDenBefehlen}
                data-testid="z3-zu-befehlen"
              >
                Zeig mir ihre Sprache
              </Button>
            ) : phase === 'befehle' ? (
              gespielt ? (
                <div className="flex items-center gap-2">
                  <Button
                    variant="neben"
                    onClick={abspielen}
                    disabled={faehrt}
                    data-testid="z3-nochmal-befehle"
                  >
                    Nochmal
                  </Button>
                  <Button
                    variant="aktion"
                    onClick={zumProgramm}
                    data-testid="z3-zum-programm"
                  >
                    Jetzt ein echtes Programm
                  </Button>
                </div>
              ) : (
                <Button
                  variant="aktion"
                  onClick={abspielen}
                  disabled={faehrt}
                  data-testid="z3-abspielen"
                  className="disabled:grayscale"
                >
                  Die drei Befehle abspielen
                </Button>
              )
            ) : !fertig ? (
              <Button
                variant="aktion"
                onClick={abspielen}
                disabled={faehrt}
                data-testid="z3-abspielen"
                className="disabled:grayscale"
              >
                Programm abspielen
              </Button>
            ) : null
          }
          geschafft={fertig ? 'Programm verstanden' : null}
        />
      }
    />
  )
}
