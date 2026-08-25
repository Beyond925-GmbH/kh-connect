import { useState } from 'react'
import { motion } from 'motion/react'
import { Werkstueck } from '@/khpl/buehne/zerspanung/Werkstueck'
import { AhaKarte } from '@/khpl/komponenten/AhaKarte'
import { Wechsel } from '@/khpl/komponenten/Wechsel'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { merkeAntwort, useFortschritt } from '@/khpl/store/fortschritt'
import { Begriff } from './Begriff'
import { useSchmal } from '@/khpl/shell/schmal'

/**
 * Z2 — Alles muss sitzen, bevor irgendwas läuft.
 *
 * **Die geführte Hälfte des Lernpaars** (Vorbild M5): vier Handgriffe in
 * fester Reihenfolge, je eine Karte, ein Satz, ein Tap. Man kann nichts falsch
 * machen — der Punkt ist nicht die Reihenfolge, sondern **wie viel passiert,
 * bevor irgendetwas passiert** (khpl-tag-zerspanung.md §6 Z2).
 *
 * Der Höhepunkt ist der Werkstücknullpunkt. Verschiebt er sich um einen
 * Zehntel, sind alle 400 Teile um einen Zehntel falsch — der Moment, in dem
 * ein Besucher versteht, warum jemand dafür dreieinhalb Jahre lernt. Deshalb
 * ist die vierte Karte die einzige, die farbig aus der Reihe tanzt.
 *
 * Und der Morgen hat einen Auftakt, den niemand rät: die Maschine läuft erst
 * einmal warm. `INTERVIEW` — „Warmlaufen macht man jeden Morgen.“
 *
 * ⚠️ **Die Rüstzeit erscheint ohne Zahlen.** Die Spec rechnet „zwei Stunden
 * fürs erste Teil, keine drei für die nächsten 399“ vor und kennzeichnet es
 * selbst als Rechenbeispiel: `belege/zerspanung.md` 3 belegt das **Prinzip**
 * nach REFA (Auftragszeit = Rüstzeit + Stückzahl × Stückzeit, in der
 * Kleinserie dominiert die Rüstzeit), nicht das Verhältnis. Der Einwurf sagt
 * deshalb, *dass* die erste Stunde die teuerste ist, und nennt keine Zahl —
 * „was `NICHT BELEGBAR` heißt, erscheint auf keinem Screen“ (§0b).
 *
 * **Die Bühne läuft flach** (`Werkstueck`). Ein Drehkörper in 3D ist erlaubt,
 * aber nicht Bedingung: „die Beweislast liegt bei 3D, nicht bei 2D“ (§7).
 */

// ---------------------------------------------------------------------------
// Die vier Handgriffe. Reihenfolge fest, Reihenfolge ist nicht die Aufgabe.
// ---------------------------------------------------------------------------

interface Handgriff {
  id: string
  name: string
  was: string
  /** Der Nullpunkt trägt den Screen — er darf aussehen wie der Höhepunkt. */
  hoehepunkt?: boolean
}

const HANDGRIFFE: readonly Handgriff[] = [
  {
    id: 'spannen',
    name: 'Rohling spannen',
    was: 'Das Stück Metall kommt ins Futter und wird fest gespannt. Es muss rund laufen — sonst stimmt hinterher kein einziges Maß.',
  },
  {
    id: 'bestuecken',
    name: 'Werkzeuge bestücken',
    was: 'Jedes Werkzeug bekommt seinen Platz im Revolver. Die Steuerung ruft es später nur noch über seine Nummer auf.',
  },
  {
    id: 'vermessen',
    name: 'Werkzeuglängen vermessen',
    was: 'Die Maschine muss wissen, wie weit jede Schneide vorsteht. Was sie nicht weiß, rechnet sie falsch.',
  },
  {
    id: 'nullpunkt',
    name: 'Werkstücknullpunkt setzen',
    // INTERVIEW (Einblicke Zerspanungsmechanikerin): „Man muss dann den
    // Nullpunkt holen vom Werkstück, damit die Maschine weiß, wo sich das
    // Werkstück grade befindet.“ Ein Nebensatz, der einen Fachbegriff
    // vollständig auflöst — der Screen versucht nicht, das zu verbessern.
    was: 'Den Nullpunkt holen — vom Werkstück, nicht von der Maschine. Damit sie weiß, wo sich das Werkstück gerade befindet.',
    hoehepunkt: true,
  },
]

export function Z2() {
  const schmal = useSchmal()
  const gespeichert = useFortschritt().answers.z2
  const [gesetzt, setGesetzt] = useState(() =>
    gespeichert?.fertig ? HANDGRIFFE.length : (gespeichert?.geruestet.length ?? 0),
  )

  const dran: Handgriff | undefined = HANDGRIFFE[gesetzt]
  const fertig = dran === undefined
  const danach: Handgriff | undefined = HANDGRIFFE[gesetzt + 1]

  const erledige = () => {
    const n = gesetzt + 1
    setGesetzt(n)
    merkeAntwort('z2', {
      geruestet: HANDGRIFFE.slice(0, n).map((h) => h.id),
      fertig: n === HANDGRIFFE.length,
    })
  }

  return (
    <StepShell
      id="Z2"
      interaktionOffen={!fertig}
      // Die Rückmeldung auf jeden Handgriff — Backen fahren zu, der Nullpunkt
      // leuchtet — passiert auf der Bühne. Hochkant blieb ihr sonst ein
      // Streifen, in dem vom Höhepunkt des Screens nichts zu sehen war.
      buehnePlatz
      buehne={
        <Werkstueck
          zustand="rohling"
          ruestschritte={gesetzt}
          nullpunkt={gesetzt >= HANDGRIFFE.length}
        />
      }
      fachtext={
        // Auf dem Handy hochkant fällt der Warmlauf-Absatz weg: mit beiden
        // Absätzen lag der Handgriff — die Übung — unter der Scrollkante
        // (s. `schmal.ts`). Der Satz, der den Beruf trägt, bleibt.
        schmal ? (
          <p>
            <Begriff id="ruesten">Rüsten</Begriff>:{' '}
            <Begriff id="rohling">Rohling</Begriff> spannen, Werkzeuge bestücken, den{' '}
            <Begriff id="werkstuecknullpunkt">Werkstücknullpunkt</Begriff> setzen. Die
            Maschine zerspant; der Mensch richtet ein.
          </p>
        ) : (
          <>
            <p>
              Zuerst läuft die Maschine warm — dafür gibt es ein eigenes Programm, und das
              macht man jeden Morgen. Eine Maschine ist kein Schalter; sie ist eher wie
              ein Auto im Winter.
            </p>
            <p className="mt-3">
              <Begriff id="ruesten">Rüsten</Begriff>:{' '}
              <Begriff id="rohling">Rohling</Begriff> spannen, Werkzeuge bestücken,
              Werkzeuglängen vermessen, den{' '}
              <Begriff id="werkstuecknullpunkt">Werkstücknullpunkt</Begriff> setzen. Das
              ist der eigentliche Beruf. Die Maschine zerspant; der Mensch richtet ein.
            </p>
          </>
        )
      }
      interaktion={
        <Wechsel takt={fertig ? 'fertig' : dran.id}>
          {fertig ? (
            <div className="flex flex-col items-start gap-2">
              {/*
                `pt-1.5` ist kein Abstand, sondern Platz für die Pünktchen.
                `kh-titel-klein` setzt `line-height: 1`, Anton ragt damit über
                seine Zeilenbox hinaus — und die aufklappende Hülle von
                `Wechsel` fährt auf eine gemessene Höhe und hat `overflow:
                clip`. Ohne die Zeile Luft stand hier „GERUSTET“.
              */}
              <p className="kh-titel-klein pt-1.5 text-kh-signal">
                Die Maschine ist gerüstet.
              </p>
              <p className="text-[1.0625rem] leading-snug text-kh-paper/80">
                Und noch ist kein einziges Teil entstanden. Verschiebt sich der Nullpunkt
                jetzt um einen Zehntelmillimeter, sind alle 400 Teile um einen Zehntel
                falsch.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-start gap-2">
              <Handgriffkarte
                griff={dran}
                nummer={gesetzt + 1}
                gesamt={HANDGRIFFE.length}
                onErledigen={erledige}
              />
              {danach && (
                <p
                  data-testid="z2-danach"
                  className="pl-1 text-[0.9375rem] text-kh-paper/45"
                >
                  Danach: {danach.name}
                </p>
              )}
            </div>
          )}
        </Wechsel>
      }
      aha={
        <>
          <AhaKarte sichtbar={fertig} eyebrow="Warum ist das erste Teil das teuerste?">
            Beim Rüsten entsteht kein einziges Teil — und bei kleinen Stückzahlen ist es
            trotzdem der größte Zeitblock des ganzen Auftrags. Deshalb ist Rüstzeit das,
            worüber in der Halle geredet wird.
          </AhaKarte>
          <AhaKarte sichtbar={gesetzt > 0} eyebrow="Und wenn du nicht weiterweißt?">
            Dann fragst du. Am Anfang steht beim Einrichten ohnehin jemand daneben, und
            Fragen sind hier ausdrücklich erwünscht — allein an der Maschine steht in
            diesem Beruf niemand.
          </AhaKarte>
        </>
      }
      fuss={
        <StepFuss id="Z2" uebungOffen={!fertig} geschafft={fertig ? 'Gerüstet' : null} />
      }
    />
  )
}

/**
 * Die Karte für den nächsten Handgriff — die ganze Übung von Z2.
 *
 * Sie ist **selbst der Knopf** (Muster: `Bauteilkarte` in M5). Links die
 * Nummer statt einer Zeichnung: dieser Screen erklärt keine Bauteile, er zählt
 * Handgriffe — und die Zahl ist genau die Aussage, um die es geht. Vier Stück,
 * bevor irgendetwas läuft.
 */
function Handgriffkarte({
  griff,
  nummer,
  gesamt,
  onErledigen,
}: {
  griff: Handgriff
  nummer: number
  gesamt: number
  onErledigen: () => void
}) {
  return (
    <motion.button
      type="button"
      onClick={onErledigen}
      data-testid="z2-erledigen"
      whileTap={{ scale: 0.975 }}
      className={`flex w-full items-center gap-3.5 rounded-kh border-2 p-3 text-left ${
        griff.hoehepunkt
          ? 'border-kh-orange bg-kh-orange/16'
          : 'border-kh-orange/50 bg-kh-orange/10'
      }`}
    >
      <span
        aria-hidden
        className="grid size-[76px] shrink-0 place-items-center rounded-kh bg-black/35 font-display text-[2.25rem] leading-none text-kh-paper/80 tabular-nums sm:size-[86px]"
      >
        {nummer}
      </span>
      <span className="min-w-0 flex-1">
        <span className="kh-etikett block text-kh-paper/45">
          {griff.hoehepunkt
            ? `Handgriff ${nummer} von ${gesamt} · der wichtigste`
            : `Handgriff ${nummer} von ${gesamt} · Tippen`}
        </span>
        <span className="kh-titel-klein mt-0.5 block text-kh-orange">{griff.name}</span>
        <span className="mt-1 block text-[1rem] leading-snug text-kh-paper/80">
          {griff.was}
        </span>
      </span>
    </motion.button>
  )
}
