import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Messschraube } from '@/khpl/buehne/zerspanung/Messschraube'
import { ERSTES_MASS, SOLL, mm } from '@/khpl/buehne/zerspanung/kanon'
import { AhaKarte } from '@/khpl/komponenten/AhaKarte'
import { Lage } from '@/khpl/komponenten/Lage'
import { Rueckmeldung } from '@/khpl/komponenten/Rueckmeldung'
import { Wahlflaeche } from '@/khpl/komponenten/Wahlflaeche'
import { Wechsel } from '@/khpl/komponenten/Wechsel'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { merkeAntwort, useFortschritt } from '@/khpl/store/fortschritt'
import { Begriff } from './Begriff'

/**
 * Z4 — Das erste Teil entscheidet. **Die Signaturübung dieses Tages:**
 * messen, urteilen, um Hundertstel korrigieren. Kein anderer der vier Tage
 * hat eine Übung, in der die Eingabe des Besuchers eine Zahl hinter dem
 * Komma ist.
 *
 * Drei Beats: *messen* (die Schraube zeigt 25,04) → *entscheiden* (passt
 * das? — gegen das Fenster aus Z1) → *korrigieren* (die Korrektur in
 * Hundertsteln eingeben und nachdrehen). Die Lektion steckt in der
 * Asymmetrie der Folgen, und sie ist die Denkweise des ganzen Berufs:
 *
 *  - **Zu groß ist kein Schrott.** Das erste Teil kommt absichtlich mit
 *    Aufmaß an — nachdrehen geht immer noch.
 *  - **Zu klein rettet keiner.** Wer überkorrigiert, wirft das Teil in die
 *    Späne und fängt mit dem nächsten Rohteil an. Kein Tadel — ein Preis.
 *  - **Die Maschine kennt nur eine Richtung: wegnehmen.** Der Regler geht
 *    deshalb nicht über null.
 *
 * Nach zwei Fehlversuchen bietet die App „Zeig mir wie“ an und stellt die
 * Korrektur auf die Fenstermitte.
 *
 * **Gerechnet wird in Hundertsteln als ganze Zahlen** (2504 statt 25,04):
 * `25.04 - 0.05` ist in Gleitkomma nicht 24,99, und an der Fensterkante
 * entschiede sonst die Rundung über Freigabe oder Ausschuss.
 *
 * **`answers.z4`** `{ freigegeben, versuche, korrektur }`.
 */

/** Alles in Hundertstel-Millimetern, als ganze Zahlen. */
const H_ERSTES = Math.round(ERSTES_MASS * 100)
const H_SOLL = { unten: Math.round(SOLL.unten * 100), oben: Math.round(SOLL.oben * 100) }

/** Fenstermitte — der Wert, auf den „Zeig mir wie“ stellt. */
const H_MITTE = Math.round((H_SOLL.unten + H_SOLL.oben) / 2)

/** Wie weit die Korrektur höchstens geht. Genug, um auch Schrott zu bauen. */
const H_MIN_KORREKTUR = -10

/** Nach zwei Fehlversuchen bietet die App die Lösung an. */
const HILFE_AB = 2

const hmm = (h: number) => mm(h / 100)

/** `−0,04 mm` — Korrekturen tragen ihr Vorzeichen. */
const korrekturText = (h: number) => (h === 0 ? '0,00' : `−${mm(Math.abs(h) / 100)}`)

type Phase = 'teil' | 'entscheiden' | 'korrigieren' | 'frei'

export function Z4() {
  const gespeichert = useFortschritt().answers.z4
  const fertig = !!gespeichert?.freigegeben

  const [phase, setPhase] = useState<Phase>(() => (fertig ? 'frei' : 'teil'))
  /** Was gerade zwischen den Messflächen liegt, in Hundertsteln. */
  const [wert, setWert] = useState<number | null>(() => {
    if (!fertig) return null
    const h = H_ERSTES + Math.round((gespeichert?.korrektur ?? -0.05) * 100)
    return h >= H_SOLL.unten && h <= H_SOLL.oben ? h : H_MITTE
  })
  const [misst, setMisst] = useState(false)
  const [korrektur, setKorrektur] = useState(0)
  const [versuche, setVersuche] = useState(() => gespeichert?.versuche ?? 0)
  const [meldung, setMeldung] = useState<string | null>(null)

  const messen = () => {
    setWert(H_ERSTES)
    setMisst(true)
    window.setTimeout(() => setMisst(false), 1200)
    setPhase('entscheiden')
  }

  const entscheide = (passt: boolean) => {
    if (!passt) {
      setMeldung(null)
      setPhase('korrigieren')
      return
    }
    setMeldung(
      `Vergleich die zwei Zahlen: erlaubt ist ${hmm(H_SOLL.unten)} bis ${hmm(H_SOLL.oben)} — dein Teil liegt vier Hundertstel drüber. Gut, dass es erst eines ist.`,
    )
  }

  const nachdrehen = () => {
    if (wert === null || korrektur === 0) return
    const neu = wert + korrektur
    const n = versuche + 1
    setVersuche(n)

    if (neu < H_SOLL.unten) {
      setMeldung(
        `${hmm(neu)} — jetzt ist er zu klein, und zu klein rettet keiner. Das Teil geht in die Späne, das nächste Rohteil kommt wieder mit ${hmm(H_ERSTES)} an.`,
      )
      setWert(H_ERSTES)
      setKorrektur(0)
      merkeAntwort('z4', { freigegeben: false, versuche: n, korrektur: 0 })
      return
    }
    if (neu > H_SOLL.oben) {
      setMeldung(
        `${hmm(neu)} — immer noch drüber. Zu groß ist kein Schrott: nachdrehen geht noch einmal.`,
      )
      setWert(neu)
      setKorrektur(0)
      merkeAntwort('z4', { freigegeben: false, versuche: n, korrektur: 0 })
      return
    }

    setWert(neu)
    setMisst(true)
    window.setTimeout(() => setMisst(false), 1200)
    setPhase('frei')
    merkeAntwort('z4', {
      freigegeben: true,
      versuche: n,
      korrektur: (neu - H_ERSTES) / 100,
    })
  }

  const zeigMirWie = () => {
    if (wert === null) return
    setKorrektur(H_MITTE - wert)
    setMeldung(null)
  }

  const frei = phase === 'frei'

  return (
    <StepShell
      id="Z4"
      auftrag={
        frei
          ? null
          : phase === 'teil'
            ? 'Hol das erste Teil aus der Maschine.'
            : phase === 'entscheiden'
              ? 'Entscheide: passt das Maß?'
              : 'Gib die Korrektur ein — in Hundertsteln.'
      }
      ansage={null}
      interaktionOffen={!frei}
      buehne={
        <Messschraube zustand={{ wert: wert === null ? null : wert / 100, misst }} />
      }
      warum={
        <p>
          Ob ein Teil gut ist, entscheidet nicht die Maschine, sondern die Messung.
          Deshalb wird das erste Teil einer Serie immer geprüft, bevor die übrigen 199
          laufen dürfen.
        </p>
      }
      interaktion={
        <Wechsel takt={phase}>
          {phase === 'teil' ? (
            <Lage>
              Die Tür geht auf, das erste Teil ist noch warm. Ob die Serie starten darf,
              entscheidet nicht die Maschine — sondern deine{' '}
              <Begriff id="messschraube">Messschraube</Begriff>.
            </Lage>
          ) : phase === 'entscheiden' ? (
            <div className="flex flex-col gap-3">
              <Fenster wert={wert} />
              <div className="grid gap-2 landscape:grid-cols-2">
                <Wahlflaeche onClick={() => entscheide(true)} data-testid="z4-passt">
                  Passt — Serie starten
                </Wahlflaeche>
                <Wahlflaeche
                  onClick={() => entscheide(false)}
                  data-testid="z4-passt-nicht"
                >
                  Passt nicht
                </Wahlflaeche>
              </div>
              <Rueckmeldung
                ok={meldung ? false : null}
                text={meldung}
                testid="z4-rueckmeldung"
              />
            </div>
          ) : phase === 'korrigieren' ? (
            <div className="flex flex-col gap-3">
              <Lage>
                Vier Hundertstel drüber — mit Absicht: das{' '}
                <Begriff id="aufmass">Aufmaß</Begriff>. Sag der Steuerung, wie viel sie
                noch wegnehmen soll.
              </Lage>
              <Fenster wert={wert} />
              <div className="flex items-center gap-3">
                <Button
                  variant="neben"
                  size="icon"
                  onClick={() => setKorrektur((k) => Math.max(H_MIN_KORREKTUR, k - 1))}
                  disabled={korrektur <= H_MIN_KORREKTUR}
                  data-testid="z4-minus"
                  aria-label="Einen Hundertstel mehr wegnehmen"
                >
                  <Minus className="size-5" strokeWidth={2.5} />
                </Button>
                <div className="min-w-[9.5rem] text-center">
                  <span data-testid="z4-korrektur" className="kh-zahl">
                    {korrekturText(korrektur)}
                  </span>
                  <span className="ml-2 text-[1rem] text-kh-mute">mm</span>
                </div>
                <Button
                  variant="neben"
                  size="icon"
                  onClick={() => setKorrektur((k) => Math.min(0, k + 1))}
                  disabled={korrektur >= 0}
                  data-testid="z4-plus"
                  aria-label="Einen Hundertstel weniger wegnehmen"
                >
                  <Plus className="size-5" strokeWidth={2.5} />
                </Button>
              </div>
              {/* Warum der Regler bei null endet: die eine Richtung. */}
              <p className="text-[0.9375rem] text-kh-mute">
                Mehr als null geht nicht — eine Drehmaschine kennt nur eine Richtung:
                wegnehmen.
              </p>
              <Rueckmeldung
                ok={meldung ? false : null}
                text={meldung}
                testid="z4-rueckmeldung"
              />
            </div>
          ) : (
            <Freigabe wert={wert} />
          )}
        </Wechsel>
      }
      aha={
        <AhaKarte sichtbar={frei} eyebrow="Wie viel ist ein Hundertstel?">
          Ein menschliches Haar ist rund sechs Hundertstel Millimeter dick. Die Toleranz
          dieses Sitzes: gut zwei. Du arbeitest genauer, als dein Auge sehen kann —
          deshalb entscheidet hier die Messschraube und nie das Hinschauen.
        </AhaKarte>
      }
      fuss={
        <StepFuss
          id="Z4"
          uebungOffen={!frei}
          aktion={
            phase === 'teil' ? (
              <Button variant="aktion" onClick={messen} data-testid="z4-messen">
                Teil entnehmen und messen
              </Button>
            ) : phase === 'korrigieren' ? (
              <div className="flex items-center gap-2">
                {versuche >= HILFE_AB && (
                  <Button
                    variant="leise"
                    onClick={zeigMirWie}
                    data-testid="z4-zeig-mir-wie"
                  >
                    Zeig mir wie
                  </Button>
                )}
                <Button
                  variant="aktion"
                  onClick={nachdrehen}
                  disabled={korrektur === 0}
                  data-testid="z4-nachdrehen"
                  className="disabled:grayscale"
                >
                  Nachdrehen und messen
                </Button>
              </div>
            ) : null
          }
          geschafft={frei ? 'Serie freigegeben' : null}
        />
      }
    />
  )
}

/** Gemessen gegen erlaubt — die zwei Zahlen, zwischen denen der Beat spielt. */
function Fenster({ wert }: { wert: number | null }) {
  return (
    <div className="kh-feld flex items-baseline justify-between gap-3 px-4 py-3">
      <div>
        <p className="kh-etikett">Gemessen</p>
        <p
          data-testid="z4-gemessen"
          className="font-display text-[1.7rem] leading-none text-kh-paper tabular-nums"
        >
          {wert === null ? '–' : hmm(wert)}
        </p>
      </div>
      <div className="text-right">
        <p className="kh-etikett">Erlaubt</p>
        <p className="text-[1.125rem] leading-tight text-kh-paper/80 tabular-nums">
          {hmm(H_SOLL.unten)} – {hmm(H_SOLL.oben)}
        </p>
      </div>
    </div>
  )
}

function Freigabe({ wert }: { wert: number | null }) {
  return (
    <div className="flex flex-col gap-3">
      <Rueckmeldung
        ok
        text={`${wert === null ? '' : hmm(wert)} — im erlaubten Fenster. Die Serie ist freigegeben.`}
        testid="z4-frei"
      />
      <motion.p
        initial={{ opacity: 0, transform: 'translateY(8px)' }}
        animate={{ opacity: 1, transform: 'translateY(0px)' }}
        transition={{ duration: 0.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        data-testid="z4-pointe"
        className="kh-titel-klein text-kh-orange"
      >
        Ab jetzt baut die Maschine dein Teil.
      </motion.p>
    </div>
  )
}
