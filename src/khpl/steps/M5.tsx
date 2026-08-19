import { Suspense, lazy, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { RotateCw } from 'lucide-react'
import { Dachstuhl3DFallback } from '@/khpl/buehne/Dachstuhl3DFallback'
import { M5_ENDE } from '@/khpl/buehne/aufbauabschnitte'
import { AhaKarte } from '@/khpl/komponenten/AhaKarte'
import { Begriff } from '@/khpl/komponenten/Begriff'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'

/**
 * M5 — Aufrichten.
 *
 * **Erste Hälfte des einzigen Lernpaars** (khpl-flow.md 7 M5). Der Dachstuhl
 * baut sich animiert auf, Bauteil für Bauteil, jedes wird beim Einfliegen
 * benannt. **Kein aktives Tun — zuschauen und mitlesen. Das Tun kommt in M7.**
 *
 * Die Animation endet, bevor der erste Sparren fliegt. Genau dort setzt die
 * Spec den Aha-Moment („Er ist der stärkste grüne Text des Boards und sitzt
 * genau richtig, bevor der erste Sparren fliegt“) — beim Anhalten ist der Satz
 * also wörtlich wahr. Was danach kommt, macht der Besucher in M7 selbst; das
 * ist das Versprechen, mit dem der Fachtext hier endet.
 *
 * Tonlage `ENTSCHIEDEN` (flow 7 M5): **nur diese eine Zahl.** Die ebenfalls
 * belegten Todeszahlen bleiben aus dem UI heraus — der Punkt ist „deshalb wird
 * gesichert“, nicht „das ist ein gefährlicher Beruf“. Letzteres arbeitet gegen
 * das Ziel der Anwendung.
 */

const Dachstuhl3D = lazy(() => import('@/khpl/buehne/Dachstuhl3D'))

export function M5() {
  const [phase, setPhase] = useState('')
  const [steht, setSteht] = useState(false)

  return (
    <StepShell
      id="M5"
      buehneInteraktiv
      // Zuschauen, nicht lösen: hier ist nichts offen, was den Karriere-Link
      // verdrängen müsste.
      interaktionOffen={false}
      buehne={
        <Suspense fallback={<Dachstuhl3DFallback />}>
          <Dachstuhl3D
            zielT={M5_ENDE}
            startT={0}
            dauer={26}
            onPhase={setPhase}
            onAngekommen={() => setSteht(true)}
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
        <div className="flex flex-col items-start gap-2">
          <AnimatePresence initial={false}>
            {/* Steht der Unterbau, fliegt nichts mehr ein — dann verschwindet auch
                die Anzeige, statt eine leere Karte stehen zu lassen. */}
            {!steht && <Phasenanzeige key="phase" label={phase} />}
          </AnimatePresence>
          <DrehHinweis />
        </div>
      }
      aha={
        <AhaKarte sichtbar={steht} eyebrow="Bevor der erste Sparren fliegt">
          Erst steht die Sicherung. Nicht, weil es Vorschrift ist, sondern weil die Hälfte
          der tödlichen Abstürze am Bau aus weniger als fünf Metern Höhe passiert. Hoch
          genug ist tiefer, als man denkt.
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
      // Die Phasenanzeige ist kein Kästchen im Panel, sondern eine Marke: ein
      // Punkt, der mitläuft, und der Name daneben. Sie kommentiert eine
      // Animation und darf deshalb nicht aussehen wie ein Absatz.
      className="flex w-fit items-center gap-3 rounded-kh-pill border-2 border-kh-orange/40 bg-kh-orange/12 py-2.5 pr-5 pl-3"
    >
      <span
        aria-hidden
        className="size-3 shrink-0 animate-puls rounded-full bg-kh-orange"
      />
      <span className="min-w-0">
        <span className="kh-etikett block text-kh-paper/50">Kommt aufs Dach</span>
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            data-testid="m5-phase"
            className="kh-titel-klein text-kh-orange"
          >
            {label}
          </motion.p>
        </AnimatePresence>
      </span>
    </motion.div>
  )
}

/**
 * Freies Drehen läuft in M5 die ganze Zeit mit (Kamerasteuerung, `ansicht`
 * default `null`) — anders als in B3.2 gibt es dafür aber keine Aufforderung.
 * Ohne einen Hinweis findet das kaum jemand von allein.
 */
function DrehHinweis() {
  return (
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 1 }}
      className="flex items-center gap-1.5 text-[0.9rem] text-kh-paper/50"
    >
      <RotateCw className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
      Zieh, um dich umzuschauen
    </motion.p>
  )
}
