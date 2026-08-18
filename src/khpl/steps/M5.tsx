import { Suspense, lazy, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { HardHat } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dachstuhl3DFallback } from '@/khpl/buehne/Dachstuhl3D'
import { M5_ENDE, M5_SICHERUNG } from '@/khpl/buehne/aufbauabschnitte'
import { AhaKarte } from '@/khpl/komponenten/AhaKarte'
import { Begriff } from '@/khpl/komponenten/Begriff'
import { StepFuss, useStepNavigation } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'

/**
 * M5 — Aufrichten.
 *
 * **Erste Hälfte des einzigen Lernpaars** (khpl-flow.md 7 M5). Der Dachstuhl
 * baut sich animiert auf, Bauteil für Bauteil, jedes wird beim Einfliegen
 * benannt. Kein aktives Tun — zuschauen und mitlesen. Das Tun kommt in M7.
 *
 * Eine Ausnahme, und die ist der Punkt des Steps: **die Animation hält an,
 * bevor der erste Sparren fliegt.** Genau dort setzt die Spec den Aha-Moment
 * („Er ist der stärkste grüne Text des Boards und sitzt genau richtig, bevor
 * der erste Sparren fliegt“) — und ein Satz über Sicherung, den man wegtippen
 * muss, bevor es weitergeht, ist unübersehbar, während eine Karte am Rand
 * überblättert wird. Ein Tap, in der Rolle, ohne Prüfung.
 *
 * Tonlage `ENTSCHIEDEN` (flow 7 M5): **nur diese eine Zahl.** Die ebenfalls
 * belegten Todeszahlen bleiben aus dem UI heraus — der Punkt ist „deshalb wird
 * gesichert“, nicht „das ist ein gefährlicher Beruf“. Letzteres arbeitet gegen
 * das Ziel der Anwendung.
 */

const Dachstuhl3D = lazy(() => import('@/khpl/buehne/Dachstuhl3D'))

type Abschnitt = 'unterbau' | 'sicherung' | 'sparren' | 'fertig'

export function M5() {
  const { weiter } = useStepNavigation('M5')
  const [abschnitt, setAbschnitt] = useState<Abschnitt>('unterbau')
  const [phase, setPhase] = useState('')

  const zielT =
    abschnitt === 'unterbau' || abschnitt === 'sicherung' ? M5_SICHERUNG : M5_ENDE

  return (
    <StepShell
      id="M5"
      aufteilung="buehne"
      // Zuschauen, nicht lösen: hier ist nichts offen, was den Karriere-Link
      // verdrängen müsste.
      interaktionOffen={false}
      wischen={false}
      onWeiter={weiter}
      buehne={
        <Suspense fallback={<Dachstuhl3DFallback />}>
          <Dachstuhl3D
            zielT={zielT}
            startT={0}
            dauer={26}
            // Weiter weg als im Prototyp: die Textkarte oben links und der Fuß
            // unten rechts nehmen der Szene rund die Hälfte der Fläche.
            kameraAbstand={1.35}
            onPhase={setPhase}
            onAngekommen={() =>
              setAbschnitt((a) =>
                a === 'unterbau' ? 'sicherung' : a === 'sparren' ? 'fertig' : a,
              )
            }
          />
        </Suspense>
      }
      fachtext={
        <p>
          Baustelle einrichten, Sicherheitsbesprechung,{' '}
          <Begriff id="absturzsicherung">Absturzsicherung</Begriff> und{' '}
          <Begriff id="psa">PSA</Begriff> prüfen. Dann hebt der Kran die{' '}
          <Begriff id="sparrenpaar">Sparrenpaare</Begriff> ein: ausrichten, verschrauben,
          nächstes. Schau zu — gleich bist du dran.
        </p>
      }
      interaktion={
        <AnimatePresence mode="wait" initial={false}>
          {abschnitt === 'sicherung' ? (
            <Sicherungskarte
              key="sicherung"
              onWeiterbauen={() => setAbschnitt('sparren')}
            />
          ) : abschnitt === 'fertig' ? null : (
            // Steht das Dach, fliegt nichts mehr ein — dann verschwindet auch
            // die Anzeige, statt eine leere Karte stehen zu lassen.
            <Phasenanzeige key="phase" label={phase} />
          )}
        </AnimatePresence>
      }
      aha={
        <AhaKarte
          sichtbar={abschnitt === 'sparren' || abschnitt === 'fertig'}
          eyebrow={null}
        >
          Der Moment, in dem aus Einzelteilen ein Haus entsteht. Kaum ein Bürojob gibt dir
          um zehn Uhr morgens das Gefühl, gerade etwas gebaut zu haben.
        </AhaKarte>
      }
      fuss={<StepFuss id="M5" />}
    />
  )
}

/** „Jedes wird beim Einfliegen benannt“ (flow 7 M5). */
function Phasenanzeige({ label }: { label: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="w-fit rounded-kh bg-kh-page px-5 py-3 shadow-[0_2px_24px_rgba(0,0,0,0.12)]"
    >
      <p className="text-[13px] tracking-[0.14em] text-kh-grey/70 uppercase">
        Es fliegt ein
      </p>
      <AnimatePresence mode="wait" initial={false}>
        <motion.p
          key={label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22 }}
          data-testid="m5-phase"
          className="kh-h3 text-kh-orange"
        >
          {label}
        </motion.p>
      </AnimatePresence>
    </motion.div>
  )
}

function Sicherungskarte({ onWeiterbauen }: { onWeiterbauen: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      data-testid="m5-sicherung"
      className="flex flex-col gap-3 rounded-kh border-l-4 border-kh-orange bg-kh-page p-5 shadow-[0_2px_24px_rgba(0,0,0,0.16)]"
    >
      <div className="flex items-center gap-2">
        <HardHat
          className="size-5 shrink-0 text-kh-orange"
          strokeWidth={1.75}
          aria-hidden
        />
        <p className="text-[13px] font-normal tracking-[0.14em] text-kh-orange uppercase">
          Bevor der erste Sparren fliegt
        </p>
      </div>
      <p className="text-[16px] leading-[1.5] text-kh-ink">
        Erst steht die Sicherung. Nicht, weil es Vorschrift ist, sondern weil die Hälfte
        der tödlichen Abstürze am Bau aus weniger als fünf Metern Höhe passiert. Hoch
        genug ist tiefer, als man denkt.
      </p>
      <div className="flex justify-end">
        <Button
          onClick={onWeiterbauen}
          data-testid="m5-weiterbauen"
          className="h-[60px] px-7 text-[16px]"
        >
          Gesichert. Weiter aufrichten
        </Button>
      </div>
    </motion.div>
  )
}
