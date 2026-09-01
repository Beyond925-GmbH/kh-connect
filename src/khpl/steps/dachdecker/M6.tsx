import { useState } from 'react'
import { motion } from 'motion/react'
import { Check } from 'lucide-react'
import { StepFoto } from '@/khpl/buehne/Foto'
import { Wechsel } from '@/khpl/komponenten/Wechsel'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'

/**
 * M6 — Halb zwölf.
 *
 * **Verschnaufpause mit Inhalt.** Ruhiger Screen,
 * Brotzeit-Motiv, keine Aufgabe. Der Regiehinweis vom Board gibt die Haltung
 * vor: „Schau einmal vom iPad hoch.“ Dieser Screen darf langsamer sein als alle
 * anderen — kein Drängen, kein Fortschrittsdruck.
 *
 * Erzählerisch die Zäsur zwischen Lernen (M5) und Können (M7).
 *
 * **Zwei Korrekturen an der letzten Fassung.**
 *
 *  1. **Das Foto ist zurück.** Zwischendurch stand hier der halb errichtete
 *     Dachstuhl mit Mittagslicht darüber. Die Begründung war gut („von hier
 *     siehst du, was heute Morgen noch nicht da war“) und das Ergebnis
 *     trotzdem falsch: derselbe graue Rohbau wie in M5 und M7, nur wärmer
 *     getönt. Drei 3D-Screens hintereinander, dazwischen die Pause — der
 *     Bruch, den dieser Screen erzählen soll, war optisch keiner. Die Brotzeit
 *     ist ein Foto von Menschen, und genau darum geht es hier.
 *  2. **Es gibt etwas zu entdecken.** Vorher: drei Zeilen Text und eine
 *     Aha-Karte, die niemand aufklappte. Ein Screen ohne Aufgabe ist richtig,
 *     ein Screen ohne *irgendetwas* ist eine Wartezeit. Jetzt liegen drei
 *     Fragen da, jede einen Tap von ihrer Antwort entfernt — man muss keine
 *     davon antippen, und wer eine antippt, bekommt etwas, das er vorher nicht
 *     wusste. Die Antwort **ersetzt** die vorige, sie stapelt sich nicht
 *     darunter.
 *
 * Der Idle-Timer ist hier auf die dreifache Geduld gesetzt (siehe
 * `KioskGuard`): ein Overlay, das nach einer Minute fragt, ob man noch da ist,
 * wäre genau der Druck, den dieser Screen nicht ausüben soll.
 *
 * Die Arbeitszeiten sind geprüft — BRTV Bau § 3. Der Text sagt bewusst „wer
 * um sieben anfängt“ und nicht „Arbeitsbeginn ist sieben Uhr“: der BRTV regelt
 * nur, dass die Arbeitszeit **an der Arbeitsstelle** beginnt; sieben Uhr ist
 * betriebsüblich, nicht tariflich. Diese Unterscheidung bleibt
 * bestehen — und sie ist jetzt selbst eine der drei
 * Fragen, statt in einer Fußnote zu stehen.
 */

/**
 * Die drei Fragen. Alle Zahlen darin kommen aus derselben geprüften Quelle
 * (BRTV Bau § 3).
 *
 * Bewusst drei und nicht sechs: mehr Karten heißt hier nicht mehr Inhalt,
 * sondern eine Liste — und eine Liste tippt niemand durch, der gerade Pause
 * machen soll.
 */
const FRAGEN = [
  {
    id: 'freitag',
    frage: 'Wann ist freitags Schluss?',
    antwort:
      'Im Sommer nach sieben Stunden, im Winter nach sechs. Wer um sieben anfängt, ist am frühen Nachmittag zu Hause — und das Wochenende hat noch nicht mal angefangen.',
  },
  {
    id: 'winter',
    frage: 'Und im Winter?',
    antwort:
      'Dezember bis März sind es 38 Stunden die Woche statt 41. Im Sommer sammelst du die Mehrstunden auf einem Arbeitszeitkonto an — wie auf einem Sparbuch, nur für Stunden —, im Winter werden sie wieder abgebaut. Gekürzt wird nichts: Übers ganze Jahr sind es im Schnitt 40 Stunden die Woche.',
  },
  {
    id: 'beginn',
    frage: 'Ab wann zählt die Arbeitszeit?',
    antwort:
      'Ab der Baustelle, nicht ab der Werkstatt. So steht es im Tarifvertrag — das sind die Regeln, die für alle Baubetriebe gelten. Dass es um sieben losgeht, machen die meisten Betriebe so. Vorgeschrieben ist es nicht.',
  },
] as const

type FrageId = (typeof FRAGEN)[number]['id']

export function M6() {
  const [offen, setOffen] = useState<FrageId | null>(null)
  const [gelesen, setGelesen] = useState<FrageId[]>([])

  const waehle = (id: FrageId) => {
    setOffen((vorher) => (vorher === id ? null : id))
    setGelesen((g) => (g.includes(id) ? g : [...g, id]))
  }

  const antwort = FRAGEN.find((f) => f.id === offen)

  return (
    <StepShell
      id="M6"
      // Mittagspause. Der eine Screen des Tages, der ausdrücklich nichts
      // verlangt — eine Auftragszeile wäre hier der Fehler.
      auftrag={null}
      ansage={null}
      interaktionOffen={false}
      buehne={<StepFoto id="M6" />}
      warum={
        <>
          <p>
            Brotzeit oben auf dem halbfertigen Haus. Von hier siehst du, was heute Morgen
            noch nicht da war. Kein Bildschirm, keine Aufgabe. Zehn Minuten.
          </p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 1.2 }}
            // Der eine Satz, der auf diesem Screen zählt — deshalb steht er
            // in Anton und nicht als vierte Zeile Fließtext.
            className="kh-titel-klein mt-4 text-kh-orange"
          >
            Schau einmal vom iPad hoch.
          </motion.p>
        </>
      }
      interaktion={
        // Höhe wächst mit der Einblendung: die Chips kommen erst nach zwei
        // Sekunden Ruhe, aber vorher stand das Panel schon auf voller Höhe —
        // zwei Sekunden lang ein leeres dunkles Rechteck unter dem Fachtext.
        // So bleibt das Panel erst klein und öffnet sich dann mit dem Inhalt.
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.6, delay: 2, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col gap-2.5 overflow-hidden"
        >
          {/* Die Anleitung stand unter den drei Fragen — also hinter dem, was
              sie erklärt. Wer schon getippt hat, braucht sie nicht mehr; wer
              noch nicht getippt hat, hat sie nicht gelesen. Jetzt steht sie
              davor, und sobald eine Antwort offen ist, macht sie ihr Platz. */}
          {!antwort && (
            <p className="px-1 text-[1rem] text-kh-paper/55">
              Drei Sachen, die kaum jemand über diesen Beruf weiß. Tipp an, was dich
              interessiert.
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            {FRAGEN.map((f) => {
              const aktiv = offen === f.id
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => waehle(f.id)}
                  aria-pressed={aktiv}
                  data-testid={`m6-frage-${f.id}`}
                  className={`flex min-h-[52px] items-center gap-2 rounded-kh-pill border-2 px-4 text-left text-[1.0625rem] font-semibold transition-transform active:scale-95 ${
                    aktiv
                      ? 'border-kh-orange bg-kh-orange text-[#0E0D0B]'
                      : 'border-kh-line-strong bg-white/5 text-kh-paper'
                  }`}
                >
                  {/* Der Haken markiert Gelesenes, ohne es wegzunehmen: wer
                      alle drei aufgedeckt hat, sieht, dass er durch ist —
                      und kann trotzdem noch mal nachlesen. */}
                  {gelesen.includes(f.id) && !aktiv && (
                    <Check
                      className="size-4 shrink-0 text-kh-signal"
                      strokeWidth={3}
                      aria-hidden
                    />
                  )}
                  {f.frage}
                </button>
              )
            })}
          </div>

          {/*
            Eine Antwortfläche, nicht drei aufgeklappte Kästen. Wer die zweite
            Frage antippt, bekommt die zweite Antwort an derselben Stelle —
            das Panel bleibt so hoch, wie es war.
          */}
          <Wechsel takt={offen ?? 'nichts'}>
            {antwort ? (
              <p
                data-auswaehlbar
                data-testid="m6-antwort"
                className="kh-feld px-4 py-3 text-[1.0625rem] leading-[1.45] text-kh-paper/90"
              >
                {antwort.antwort}
              </p>
            ) : null}
          </Wechsel>
        </motion.div>
      }
      fuss={<StepFuss id="M6" />}
    />
  )
}
