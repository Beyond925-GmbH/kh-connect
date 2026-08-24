import { motion } from 'motion/react'
import { StepFoto } from '@/khpl/buehne/Foto'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { Begriff } from './Begriff'

/**
 * Z1.1 — Wer zeichnet das? · Abstecher von Z1, mündet in Z2.
 *
 * Lesescreen ohne Übung, mit Begriffs-Popovern (`CAD`, `CAM`) — und der
 * Screen, der `technik: 1` mit trägt (khpl-tag-zerspanung.md §6 Z1.1).
 *
 * **Die Kette ist der Inhalt, nicht die Dekoration.** Der Fachtext sagt in
 * einem Satz, dass der Zerspaner am Ende einer Kette steht, die am Rechner
 * anfängt. Ein Satz, der drei Stationen aufzählt, wird als Satz gelesen und
 * als nichts erinnert; dieselben drei Stationen untereinander sind auf einen
 * Blick eine Reihenfolge — und die letzte trägt die Marke, um die es hier
 * geht: **hier stehst du.**
 *
 * `interaktionOffen={false}`: die Kette ist Darstellung, keine Aufgabe. Ohne
 * die Angabe gälte jeder Step mit `interaktion` als offene Übung, und der Fuß
 * würde einen Ausweg anbieten, den es hier nicht zu nehmen gibt.
 *
 * **Keine Aha-Karte.** Der Kandidat („Geht das auch ohne Computer?“ —
 * konventionelle Maschinen, Handräder) ist INTERVIEW-gedeckt, steht aber in
 * §12 ausdrücklich unter „Nicht aufgenommen — Material für spätere
 * Ausbaustufen“. Er lebt im Glossareintrag `CNC` weiter, nicht auf dem Screen.
 */

const KETTE = [
  {
    id: 'cad',
    was: 'Konstruieren',
    zeile: 'Jemand baut das Teil am Rechner — als Modell und als Zeichnung.',
  },
  {
    id: 'cam',
    was: 'Wege rechnen',
    zeile: 'Eine Software rechnet daraus die Bahnen, die das Werkzeug fahren muss.',
  },
  {
    id: 'maschine',
    was: 'Einrichten und fahren',
    zeile: 'Das Programm kommt an die Maschine. Ab hier ist es Handarbeit.',
  },
] as const

export function Z11() {
  return (
    <StepShell
      id="Z1.1"
      titelZusatz="Abstecher"
      interaktionOffen={false}
      buehne={<StepFoto id="Z1.1" />}
      fachtext={
        <p>
          Jemand hat das konstruiert — <Begriff id="cad">CAD</Begriff>, und daraus wird{' '}
          <Begriff id="cam">CAM</Begriff>, und daraus das Programm. Der Zerspaner steht am
          Ende einer Kette, die am Rechner anfängt, und ein Teil davon ist sein Job.
        </p>
      }
      interaktion={
        <motion.ol
          initial="aus"
          animate="an"
          variants={{
            an: { transition: { staggerChildren: 0.12, delayChildren: 0.25 } },
          }}
          className="relative flex flex-col gap-2.5 pl-6"
        >
          {/* Die Linie, an der die Kette hängt. Sie läuft von der ersten bis
              zur letzten Station und macht aus drei Kästen eine Reihenfolge. */}
          <span
            aria-hidden
            className="absolute top-3 bottom-3 left-[7px] w-[2px] rounded-full bg-kh-line-strong"
          />
          {KETTE.map((glied, i) => {
            const letztes = i === KETTE.length - 1
            return (
              <motion.li
                key={glied.id}
                variants={{ aus: { opacity: 0, x: -10 }, an: { opacity: 1, x: 0 } }}
                className="relative"
              >
                <span
                  aria-hidden
                  className={`absolute top-[0.4rem] left-[-1.4rem] size-4 rounded-full border-2 ${
                    letztes
                      ? 'border-kh-orange bg-kh-orange'
                      : 'border-kh-line-strong bg-kh-surface'
                  }`}
                />
                <p
                  className={`text-[1.0625rem] font-semibold ${
                    letztes ? 'text-kh-orange' : 'text-kh-paper'
                  }`}
                >
                  {glied.was}
                  {letztes && (
                    <span className="kh-etikett ml-2 align-[0.1em]">Hier stehst du</span>
                  )}
                </p>
                <p className="text-[1rem] leading-snug text-kh-paper/70">{glied.zeile}</p>
              </motion.li>
            )
          })}
        </motion.ol>
      }
      fuss={<StepFuss id="Z1.1" />}
    />
  )
}
