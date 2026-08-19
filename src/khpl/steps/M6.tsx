import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { StepFoto } from '@/khpl/buehne/Foto'
import { AhaKarte } from '@/khpl/komponenten/AhaKarte'
import { StepFuss, useStepNavigation } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'

/**
 * M6 — Halb zwölf.
 *
 * **Verschnaufpause mit Inhalt** (khpl-flow.md 7 M6). Ruhiger Screen,
 * Brotzeit-Motiv, keine Aufgabe. Der Regiehinweis vom Board gibt die Haltung
 * vor: „Schau einmal vom iPad hoch.“ Dieser Screen darf langsamer sein als alle
 * anderen — kein Drängen, kein Fortschrittsdruck.
 *
 * Erzählerisch die Zäsur zwischen Lernen (M5) und Können (M7).
 *
 * Der Idle-Timer ist hier auf die dreifache Geduld gesetzt (siehe
 * `KioskGuard`): ein Overlay, das nach einer Minute fragt, ob man noch da ist,
 * wäre genau der Druck, den dieser Screen nicht ausüben soll.
 *
 * Arbeitszeiten `GEPRÜFT` — BRTV Bau § 3 (flow 10). Der Text sagt bewusst „wer
 * um sieben anfängt“ und nicht „Arbeitsbeginn ist sieben Uhr“: der BRTV regelt
 * nur, dass die Arbeitszeit **an der Arbeitsstelle** beginnt; sieben Uhr ist
 * betriebsüblich, nicht tariflich. Diese Unterscheidung bleibt auch nach der
 * Freigabe bestehen (flow 7 M6).
 */
export function M6() {
  const { weiter } = useStepNavigation('M6')
  const [aha, setAha] = useState(false)

  // Deutlich später als auf anderen Screens. Wer hier ankommt, soll erst
  // einmal nichts tun müssen.
  useEffect(() => {
    const id = window.setTimeout(() => setAha(true), 3200)
    return () => window.clearTimeout(id)
  }, [])

  return (
    <StepShell
      id="M6"
      interaktionOffen={false}
      onWeiter={weiter}
      buehne={<StepFoto id="M6" />}
      fachtext={
        <>
          <p>
            Brotzeit auf dem Rohbau. Von hier siehst du, was heute Morgen noch nicht da
            war. Kein Bildschirm, keine Aufgabe. Zehn Minuten.
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
      aha={
        <AhaKarte sichtbar={aha} eyebrow="Was kaum jemand weiß">
          Freitags ist im Sommer nach sieben Stunden Schluss, im Winter nach sechs. Wer um
          sieben anfängt, ist am frühen Nachmittag zu Hause — und das Wochenende hat noch
          nicht mal angefangen.
        </AhaKarte>
      }
      fuss={<StepFuss id="M6" />}
    />
  )
}
