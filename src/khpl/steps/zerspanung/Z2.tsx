import { useState } from 'react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { StepFoto } from '@/khpl/buehne/Foto'
import { DREHZAHL, WASCHMASCHINE } from '@/khpl/buehne/zerspanung/kanon'
import { AhaKarte } from '@/khpl/komponenten/AhaKarte'
import { RATEN_HAKEN } from '@/khpl/komponenten/gesten'
import { Rueckmeldung } from '@/khpl/komponenten/Rueckmeldung'
import { Wahlflaeche } from '@/khpl/komponenten/Wahlflaeche'
import { Wechsel } from '@/khpl/komponenten/Wechsel'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { merkeAntwort, useFortschritt } from '@/khpl/store/fortschritt'
import { Begriff } from './Begriff'

/**
 * Z2 — Fest, sonst fliegt es. **Rüsten**, in zwei Beats:
 *
 *  1. *Spannen* — drei Spannmittel, eines passt zu rundem Stangenmaterial.
 *     Ein Fehlgriff kostet keinen Punkt, sondern zeigt seine Folge in der
 *     Welt: ein Teil, das sich durchdreht, oder eines, das gar nicht
 *     stillhalten soll.
 *  2. *Drehzahl schätzen* — **der eine Schätzmoment dieses Tages**
 *     (Mechanismus 3, wie M2 und C2). Der Anker ist ein Gerät, das jeder
 *     kennt: der Schleudergang der Waschmaschine.
 *
 * **Fachlich:** die Auflösung „rund 2.500 U/min“ ist abgeleitet, nicht
 * gesetzt — Hartmetall auf Baustahl schneidet mit rund 200 m/min, bei Ø 25
 * sind das n = 200.000 / (π · 25) ≈ 2.546 (Herleitung in
 * `buehne/zerspanung/kanon.ts`). 200 m/min sind 12 km/h: Radfahrtempo.
 *
 * **`answers.z2`** `{ gespannt, versuche, schaetzung, aufgeloest }`.
 */

const SPANNMITTEL = [
  {
    id: 'schraubstock',
    label: 'Maschinenschraubstock',
    zeile: 'Zwei gerade Backen pressen zu.',
    folge:
      'Zwei gerade Backen auf einem runden Teil: Kontakt auf zwei schmalen Linien. Beim ersten Span dreht sich die Stange durch — Riefen im Material, gespannt ist nichts.',
  },
  {
    id: 'futter',
    label: 'Dreibackenfutter',
    zeile: 'Drei Backen greifen von außen rund.',
    folge: '',
  },
  {
    id: 'pratzen',
    label: 'Spannpratzen',
    zeile: 'Klammern drücken aufs Maschinenbett.',
    folge:
      'Spannpratzen halten Platten auf einem Frästisch fest. Hier soll nichts stillstehen: das Teil selbst muss sich drehen — mitsamt seiner Spannung.',
  },
] as const

const RICHTIG = 'futter'

/** Spanne des Reglers. Weit genug, dass die echte Zahl überraschen kann. */
const MIN = 200
const MAX = 6000
const SCHRITT = 100

const uMin = (n: number) => n.toLocaleString('de-DE')

export function Z2() {
  const gespeichert = useFortschritt().answers.z2
  const [gespannt, setGespannt] = useState(() => !!gespeichert?.gespannt)
  const [versuche, setVersuche] = useState(() => gespeichert?.versuche ?? 0)
  const [daneben, setDaneben] = useState<string | null>(null)
  const [schaetzung, setSchaetzung] = useState(() => gespeichert?.schaetzung ?? MIN)
  const [aufgeloest, setAufgeloest] = useState(() => !!gespeichert?.aufgeloest)

  const spanne = (id: string) => {
    if (id === RICHTIG) {
      setDaneben(null)
      setGespannt(true)
      merkeAntwort('z2', { gespannt: true, versuche, schaetzung, aufgeloest })
      return
    }
    const n = versuche + 1
    setVersuche(n)
    setDaneben(id)
    merkeAntwort('z2', { gespannt: false, versuche: n, schaetzung, aufgeloest })
  }

  const aufloesen = () => {
    setAufgeloest(true)
    merkeAntwort('z2', { gespannt: true, versuche, schaetzung, aufgeloest: true })
  }

  const takt = aufgeloest ? 'aufgeloest' : gespannt ? 'drehzahl' : 'spannen'
  const fehlgriff = SPANNMITTEL.find((s) => s.id === daneben)

  return (
    <StepShell
      id="Z2"
      auftrag={
        aufgeloest
          ? null
          : gespannt
            ? 'Schätz, wie schnell sich das Futter gleich dreht.'
            : 'Wähl aus, womit du das Rohteil spannst.'
      }
      // Die Ansage kommt erst mit dem Regler — im Spann-Beat gäbe es noch
      // nichts zu ziehen, und eine Ansage vor der falschen Übung wäre eine
      // Irreführung.
      ansage={
        gespannt && !aufgeloest
          ? {
              geste: 'ziehen-regler',
              text: 'Du legst fest, wie schnell sich das Futter mit dem Rohteil dreht.',
              haken: RATEN_HAKEN,
            }
          : null
      }
      interaktionOffen={!aufgeloest}
      buehne={<StepFoto id="Z2" />}
      warum={
        <>
          <p>
            <Begriff id="ruesten">Rüsten</Begriff> heißt: alles, was vor dem ersten Span
            passiert. Spannen, Werkzeuge messen, Programm laden.
          </p>
          <p>
            Zuletzt wird der <Begriff id="nullpunkt">Nullpunkt</Begriff> angetastet — der
            Punkt, von dem aus die Maschine jedes Maß rechnet.
          </p>
        </>
      }
      interaktion={
        <Wechsel takt={takt}>
          {takt === 'spannen' ? (
            <div className="flex flex-col gap-3">
              <div className="grid gap-2 landscape:grid-cols-3">
                {SPANNMITTEL.map((s) => (
                  <Wahlflaeche
                    key={s.id}
                    onClick={() => spanne(s.id)}
                    data-testid={`z2-spannmittel-${s.id}`}
                    className="flex-col items-start gap-0.5 py-2.5"
                  >
                    <span className="font-semibold">{s.label}</span>
                    <span className="text-[0.9375rem] text-kh-mute">{s.zeile}</span>
                  </Wahlflaeche>
                ))}
              </div>
              <Rueckmeldung
                ok={fehlgriff ? false : null}
                text={fehlgriff ? fehlgriff.folge : null}
                testid="z2-rueckmeldung"
              />
            </div>
          ) : takt === 'drehzahl' ? (
            <div className="flex flex-col gap-3">
              <Rueckmeldung
                ok
                text="Drei Backen, ein Griff, alles mittig — das Futter zentriert rundes Material von selbst."
                testid="z2-gespannt"
              />
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <span data-testid="z2-schaetzung" className="kh-zahl">
                  {uMin(schaetzung)}
                </span>
                <span className="text-[1.0625rem] text-kh-mute">
                  Umdrehungen je Minute
                </span>
              </div>
              <input
                type="range"
                min={MIN}
                max={MAX}
                step={SCHRITT}
                value={schaetzung}
                onChange={(e) => setSchaetzung(Number(e.target.value))}
                data-testid="z2-regler"
                aria-label="Geschätzte Drehzahl"
                className="kh-regler w-full"
              />
              <p className="text-[0.9375rem] text-kh-mute">
                Zum Vergleich: der Schleudergang deiner Waschmaschine schafft{' '}
                {uMin(WASCHMASCHINE)}.
              </p>
            </div>
          ) : (
            <Aufloesung schaetzung={schaetzung} />
          )}
        </Wechsel>
      }
      aha={
        <AhaKarte sichtbar={aufgeloest} eyebrow="Warum ist die Tür aus Panzerglas?">
          Bei dieser Drehzahl wird ein schlecht gespanntes Teil zum Geschoss. Deshalb ist
          die Tür verriegelt, solange sich etwas dreht — und deshalb ist Spannen der
          wichtigste Handgriff des Rüstens.
        </AhaKarte>
      }
      fuss={
        <StepFuss
          id="Z2"
          uebungOffen={!aufgeloest}
          aktion={
            takt === 'drehzahl' ? (
              <Button variant="aktion" onClick={aufloesen} data-testid="z2-aufloesen">
                Und jetzt die echte Zahl
              </Button>
            ) : null
          }
          geschafft={aufgeloest ? 'Gerüstet' : null}
        />
      }
    />
  )
}

function Aufloesung({ schaetzung }: { schaetzung: number }) {
  return (
    <motion.div
      initial="aus"
      animate="an"
      variants={{ an: { transition: { staggerChildren: 0.45 } } }}
      className="flex flex-col gap-3"
    >
      <motion.div variants={TAKT}>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span data-testid="z2-echt" className="kh-zahl text-kh-orange">
            rund {uMin(DREHZAHL)}
          </span>
          <span className="text-[1.0625rem] text-kh-mute">Umdrehungen je Minute</span>
        </div>
        <p className="mt-1.5 text-[1rem] text-kh-mute">
          Du hast {uMin(schaetzung)} gesagt — die Waschmaschine schafft beim Schleudern{' '}
          {uMin(WASCHMASCHINE)}.
        </p>
      </motion.div>
      <motion.p
        variants={TAKT}
        className="text-[1.0625rem] leading-[1.45] text-kh-paper/90"
      >
        Die Zahl ist keine Einstellung nach Gefühl: am Rand läuft der Stahl mit
        Radfahrtempo an der Schneide vorbei — daraus rechnet sich die Drehzahl, für jeden
        Durchmesser neu.
      </motion.p>
    </motion.div>
  )
}

const TAKT = {
  aus: { opacity: 0, transform: 'translateY(12px)' },
  an: { opacity: 1, transform: 'translateY(0px)' },
}
