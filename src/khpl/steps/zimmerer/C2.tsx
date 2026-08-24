import { Suspense, lazy, useState } from 'react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Dachstuhl3DFallback } from '@/khpl/buehne/Dachstuhl3DFallback'
import {
  ACHSMASS_CM,
  ACHSMASS_MAX_CM,
  ACHSMASS_MIN_CM,
  PLATTENBREITE_CM,
} from '@/khpl/buehne/zimmerer/kanon'
import { AhaKarte } from '@/khpl/komponenten/AhaKarte'
import { Wechsel } from '@/khpl/komponenten/Wechsel'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { merkeAntwort, useFortschritt } from '@/khpl/store/fortschritt'
import { Begriff } from './Begriff'

/**
 * C2 — Zweiundsechzig Komma fünf. **Der eine Schätzmoment dieses Tages**
 * (khpl-tage.md 1, Mechanismus 3; khpl-tag-zimmerer.md 6, C2).
 *
 * Drei Takte wie in M2: Vorgabe zeigen → schätzen → auflösen. Die Übung steht
 * vor der Erklärung, die Überraschung **ist** der Lerninhalt.
 *
 * **Der Unterschied zu M2 liegt in der Art der Zahl.** Dort löst die Übung mit
 * einer Zahl auf, die *größer* ist als erwartet (Arbeitszeit schlägt Material).
 * Hier ist die Zahl weder groß noch klein, sondern **fremdbestimmt**: das Maß
 * kommt nicht vom Zimmerer, es kommt vom Plattenformat. Im Bau hängt alles an
 * etwas anderem.
 *
 * ⚠️ **Die Begründung ist die Korrektur** (`belege/zimmerer.md` 1). Die erste
 * Fassung der Spec ließ C2 mit der **Dämmstoffbreite** auflösen — das stimmt
 * nicht, und zwar genau andersherum: die Dämmung richtet sich nach dem Raster.
 * Klemmfilze sind schmaler als 62,5 cm, weil sie ins lichte Gefach passen
 * müssen. Beim Auflösen legt sich deshalb eine **Bauplatte** auf, keine
 * Dämmmatte — auf der Bühne (`aufgeloest`) wie im Text.
 *
 * ⚠️ 62,5 cm ist **kein genormtes Pflichtmaß**: 83,3 cm und 125 cm kommen
 * ebenfalls vor, bei Öffnungen gibt die Statik Sondermaße vor. Der Screen sagt
 * „meist“, nicht „immer“ — als eigene Zeile unter der Herleitung, nicht als
 * Fußnote.
 *
 * **Kein Fehlerfall.** Geschätzt wird, nicht gewusst.
 *
 * `answers.c2` `{ schaetzung: number; aufgeloest: boolean }`
 */

const Wandelement3D = lazy(() => import('@/khpl/buehne/zimmerer/Wandelement3D'))

// ---------------------------------------------------------------------------
// Zahlen — alle aus `buehne/zimmerer/kanon.ts`, keine hier notiert.
// `kanon.ts` ist three-frei, der Import zieht nichts in den Erststart.
// ---------------------------------------------------------------------------

/**
 * Rasterung des Reglers. 2,5 cm trifft die 62,5 exakt und lässt zwischen 30 und
 * 120 cm 36 Stufen — fein genug, dass Ziehen sich wie Schätzen anfühlt, grob
 * genug, dass man die Lösung nicht versehentlich streift.
 */
const SCHRITT_CM = 2.5

/**
 * Startwert: bewusst nicht auf der Lösung und nicht am Rand — und bewusst
 * *zu weit*. Eine gute Armlänge ist das, was man schätzt, wenn man nur die
 * Wand kennt und nicht die Platte.
 */
const START_CM = 90

const cm = (n: number) => `${n.toLocaleString('de-DE', { maximumFractionDigits: 1 })} cm`

export function C2() {
  const gespeichert = useFortschritt().answers.c2
  const [wert, setWert] = useState(() => gespeichert?.schaetzung ?? START_CM)
  const [aufgeloest, setAufgeloest] = useState(() => !!gespeichert?.aufgeloest)

  const aufloesen = () => {
    setAufgeloest(true)
    merkeAntwort('c2', { schaetzung: wert, aufgeloest: true })
  }

  return (
    <StepShell
      id="C2"
      // Der Regler sitzt im Panel, das Ständerwerk auf der Bühne — und es
      // folgt dem Regler live. Deshalb `buehneInteraktiv`: das Panel bleibt
      // schmal, und der Sichtfeld-Messer sagt der Kamera, wie viel Fläche ihr
      // bleibt. Wer zieht, muss sehen, was sich bewegt.
      buehneInteraktiv
      interaktionOffen={!aufgeloest}
      buehne={
        <Suspense fallback={<Dachstuhl3DFallback text="Das Rähmwerk wird gelegt" />}>
          <Wandelement3D
            zustand="staenderwerk"
            achsmassCm={aufgeloest ? ACHSMASS_CM : wert}
            aufgeloest={aufgeloest}
          />
        </Suspense>
      }
      fachtext={
        aufgeloest ? undefined : (
          <p>
            Die <Begriff id="staenderwerk">Ständer</Begriff> stehen nicht nach Gefühl,
            sondern im Raster — und das Raster kommt nicht vom Zimmerer.
          </p>
        )
      }
      interaktion={
        <Wechsel takt={aufgeloest ? 'aufgeloest' : 'schaetzen'}>
          {aufgeloest ? (
            <Aufloesung schaetzung={wert} />
          ) : (
            <Schaetzung wert={wert} onWert={setWert} />
          )}
        </Wechsel>
      }
      aha={
        <>
          <AhaKarte
            sichtbar={aufgeloest}
            eyebrow="Und die Dämmung — richtet die sich nicht danach?"
          >
            Andersherum. Die Dämmfilze werden passend zum Raster hergestellt: sie sind
            schmaler als 62,5 Zentimeter, weil sie zwischen die Ständer klemmen müssen.
            Das Maß kommt von der Platte, nicht von der Wolle.
          </AhaKarte>
          <AhaKarte
            sichtbar={aufgeloest}
            eyebrow="Warum entscheidet das nicht der Zimmerer?"
          >
            Weil im Bau alles an etwas anderem hängt. Das Skelett der Wand steht in dem
            Abstand, in dem das gemessen ist, was sie später zudeckt.
          </AhaKarte>
        </>
      }
      fuss={
        <StepFuss
          id="C2"
          uebungOffen={!aufgeloest}
          aktion={
            aufgeloest ? null : (
              <Button variant="aktion" onClick={aufloesen} data-testid="c2-aufloesen">
                Und jetzt das echte Maß
              </Button>
            )
          }
          geschafft={aufgeloest ? 'Raster sitzt' : null}
        />
      }
    />
  )
}

/**
 * Der Schätztakt. Die Zahl trägt Anton und steht in Warnwestengelb: solange
 * geschätzt wird, gehört sie dem Besucher. Nach der Auflösung wechselt sie auf
 * Markenorange — das ist dann das Maß des Gewerks, nicht mehr das eigene.
 * (Dieselbe Farbdramaturgie wie in M2.)
 */
function Schaetzung({ wert, onWert }: { wert: number; onWert: (n: number) => void }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[1.125rem] font-semibold text-kh-paper sm:text-[1.25rem]">
        Ein Ständer steht. Wie weit steht der nächste?
      </p>

      <span data-testid="c2-zahl" className="kh-zahl">
        {cm(wert)}
      </span>

      <div className="relative" data-wisch="aus">
        <input
          type="range"
          min={ACHSMASS_MIN_CM}
          max={ACHSMASS_MAX_CM}
          step={SCHRITT_CM}
          value={wert}
          onChange={(e) => onWert(Number(e.target.value))}
          data-testid="c2-regler"
          aria-label="Wie weit steht der nächste Ständer?"
          className="kh-regler w-full"
        />
        <div className="flex justify-between text-[0.9375rem] text-kh-mute/70 tabular-nums">
          <span>{cm(ACHSMASS_MIN_CM)}</span>
          <span>{cm(ACHSMASS_MAX_CM)}</span>
        </div>
      </div>
    </div>
  )
}

/**
 * Der Auflösungstakt — er **ersetzt** die Schätzung, statt sich darunter zu
 * stapeln (`Wechsel`). Erst die Zahl, dann der Abstand zur eigenen, dann die
 * Herleitung, die den Screen trägt: die Platte ist das Maß.
 */
function Aufloesung({ schaetzung }: { schaetzung: number }) {
  const anteil = (n: number) =>
    ((n - ACHSMASS_MIN_CM) / (ACHSMASS_MAX_CM - ACHSMASS_MIN_CM)) * 100
  const von = Math.min(anteil(schaetzung), anteil(ACHSMASS_CM))
  const bis = Math.max(anteil(schaetzung), anteil(ACHSMASS_CM))
  const abstand = Math.abs(ACHSMASS_CM - schaetzung)

  return (
    <div className="flex flex-col gap-3">
      <motion.span
        initial={{ opacity: 0, y: 18, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 380, damping: 26 }}
        data-testid="c2-zahl"
        className="kh-zahl text-kh-orange"
      >
        {cm(ACHSMASS_CM)}
      </motion.span>

      {/* Der Abstand zwischen der eigenen und der echten Zahl ist die Aussage
          des Screens — deshalb steht er als Zahl da und muss nicht aus zwei
          Positionen auf einer Skala abgelesen werden. */}
      <div className="flex flex-col gap-2" data-testid="c2-vergleich">
        <div className="relative h-4 w-full rounded-full border border-kh-line bg-white/10">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.25, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{ left: `${von}%`, width: `${bis - von}%`, transformOrigin: 'left' }}
            className="absolute inset-y-0 bg-kh-orange/30"
            aria-hidden
          />
          <span
            style={{ left: `${anteil(schaetzung)}%` }}
            className="absolute top-[-7px] bottom-[-7px] w-[6px] -translate-x-1/2 rounded-full bg-kh-paper/70"
            aria-hidden
          />
          <motion.span
            initial={{ opacity: 0, scaleY: 0.3 }}
            animate={{ opacity: 1, scaleY: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 24 }}
            style={{ left: `${anteil(ACHSMASS_CM)}%` }}
            className="absolute top-[-10px] bottom-[-10px] w-[7px] -translate-x-1/2 rounded-full bg-kh-orange shadow-[0_0_12px_rgba(255,159,42,0.6)]"
            aria-hidden
          />
        </div>
        <p className="text-[1rem] tabular-nums">
          <span className="text-kh-mute">Deine Schätzung </span>
          <span className="font-semibold text-kh-paper/85">{cm(schaetzung)}</span>
          {abstand > 0 && (
            <>
              <span className="text-kh-mute"> — </span>
              <span className="font-semibold text-kh-orange">{cm(abstand)} daneben</span>
            </>
          )}
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="kh-feld flex flex-col gap-1.5 px-3.5 py-3"
        data-testid="c2-herleitung"
      >
        <p className="kh-etikett">Woher das Maß kommt</p>
        <p className="text-[1.0625rem] leading-[1.45] text-kh-paper/90">
          Eine Bauplatte ist {cm(PLATTENBREITE_CM)} breit. Die Hälfte davon ist{' '}
          {cm(ACHSMASS_CM)} — so trifft jeder Plattenstoß genau die Mitte eines Ständers,
          und es bleibt fast kein Verschnitt übrig. Das heißt{' '}
          <Begriff id="achsmass">Achsmaß</Begriff>: von Ständermitte zu Ständermitte.
        </p>
        <p className="text-[1rem] leading-snug text-kh-mute">
          Meist. Nicht immer — 83,3 und {cm(PLATTENBREITE_CM)} kommen auch vor, und rund
          um Öffnungen gibt die Statik das Maß vor.
        </p>
      </motion.div>
    </div>
  )
}
