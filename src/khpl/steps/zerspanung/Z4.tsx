import { useState } from 'react'
import { Check } from 'lucide-react'
import { motion } from 'motion/react'
import { StepFoto } from '@/khpl/buehne/Foto'
import { Wechsel } from '@/khpl/komponenten/Wechsel'
import { StepFuss } from '@/khpl/shell/StepFuss'
import { StepShell } from '@/khpl/shell/StepShell'
import { merkeAntwort, useFortschritt } from '@/khpl/store/fortschritt'

/**
 * Z4 — Der stillste Raum der Firma. **Die Zäsur.**
 *
 * Was hier ursprünglich stand — „vier Minuten nichts tun“, die Maschine läuft
 * — ist weg: **kein einziges der vier Gespräche beschreibt dieses Warten**
 * (khpl-tag-zerspanung.md §6 Z4). Sie beschreiben einen durchgehenden
 * Kreislauf; wer wartet, macht in Wahrheit schon das nächste Teil. Es wäre ein
 * Screen geworden, auf dem nichts passiert, mit einer Begründung, die nicht
 * stimmt.
 *
 * **Der Messraum ist der echte Ortswechsel in einem Tag, der sonst keinen
 * hat.** Leise, klimatisiert, sauber, neben einer Halle mit neunzig Maschinen
 * — „Wir haben neunzig Maschinen, immer ein Messraum“ (`INTERVIEW`,
 * Zerspanungsmechaniker Ausbildung, 30.06.2026). Er tut für diesen Tag, was
 * die Brotzeit für den Dachdecker tut: er nimmt das Tempo raus. Und er setzt
 * Z5 auf — wer hier war, weiß beim Messen, dass es Genauigkeiten gibt, die
 * eine Mikrometerschraube nicht mehr hergibt.
 *
 * **Es gibt etwas zu entdecken**, nach dem Muster von M6: drei Fragen, je
 * einen Tap von der Antwort entfernt, die Antwort **ersetzt** die vorige. Man
 * muss keine antippen. Alle drei sind belegt (§11).
 *
 * **Die ehrliche Kehrseite des Tages sitzt hier** (khpl-tage.md §1,
 * Mechanismus 8) — auf dem Weg zurück in die Halle, als *ein* Satz und nicht
 * als Warnung.
 *
 * ⚠️ **Dreifache Idle-Geduld, gemeldet statt gebaut.** Wie M6 dürfte dieser
 * Screen langsamer sein als alle anderen; der Idle-Timer sitzt im `KioskGuard`
 * und damit in der eingefrorenen Hülle. Eine Zäsur, über der nach einer Minute
 * „Bist du noch da?“ steht, übt genau den Druck aus, den sie wegnehmen soll —
 * die Änderung betrifft alle vier Tage und gehört nicht in einen
 * (khpl-tage.md §6.2).
 *
 * **Für die Zusammenführung**, damit die Meldung nicht bloß eine Haltung ist:
 * `GEDULD` in `shell/KioskGuard.tsx` kennt heute nur `M5`, `M6`, `M8` und die
 * drei `B9.x`. Kein einziges `Z` steht darin, und im Durchspielen setzt der
 * Kiosk beim Lesen zurück — auf **Z4** (drei Antworttexte), **Z6**
 * (Rückblick) und **Z7.1–Z7.3** (je vier Faktenblöcke). Fällig ist dort
 * `Z4: 3, Z6: 3, 'Z7.1': 3, 'Z7.2': 3, 'Z7.3': 3` — dieselbe Zeile, die
 * `M6` und `B9.x` schon haben, und dieselbe Begründung.
 */

// ---------------------------------------------------------------------------
// Text und Zahlen — gebündelt oben (flow 8.4).
// ---------------------------------------------------------------------------

/**
 * Die drei Entdeckungen. Alle `BELEGT` (`belege/zerspanung.md` 4 und 5, §11):
 *
 *  - 20 °C: DIN EN ISO 1:2022 legt die Bezugstemperatur fest, VDI/VDE 2627
 *    erlaubt in Klasse 3 19–21 °C. Stahl dehnt sich um 11,5 · 10⁻⁶ je Kelvin
 *    — rund 1,15 µm je Grad auf 100 mm Länge.
 *  - Tausendstel: das Voreinstellgerät **zeigt** 0,001 mm an; die reale
 *    Messunsicherheit liegt bei wenigen Mikrometern. Der Unterschied zwischen
 *    Anzeige und Genauigkeit ist selbst der Inhalt — deshalb steht hier
 *    „zeigt an“ und nirgends „misst auf ein Tausendstel genau“.
 *  - Türverriegelung: DIN EN ISO 16090-1 und ISO 14119. Nicht gegen
 *    Hineingreifen allein, sondern gegen herausgeschleuderte Teile.
 *
 * Bewusst drei und nicht sechs: mehr Karten heißt hier nicht mehr Inhalt,
 * sondern eine Liste — und eine Liste tippt niemand durch, der gerade
 * durchatmen soll.
 */
const FRAGEN = [
  {
    id: 'grad',
    frage: 'Warum genau 20 Grad?',
    antwort:
      'Weil das die Temperatur ist, auf die sich alle geeinigt haben — sie steht in der Norm, und jedes Maß auf jeder Zeichnung meint sie. Stahl dehnt sich mit der Wärme: auf zehn Zentimeter Länge sind das gut ein Tausendstel Millimeter je Grad. Bei einer Toleranz von einundzwanzig Tausendsteln frisst ein warmer Raum davon einen ordentlichen Teil. Ein Messraum ohne feste Temperatur misst das Wetter mit.',
  },
  {
    id: 'tausendstel',
    frage: 'Wie genau ist das Gerät hier?',
    antwort:
      'Es zeigt drei Zahlen hinterm Komma an — Tausendstel Millimeter. Anzeigen und Messen sind aber zweierlei: wirklich sicher sind wenige Tausendstel, nicht eines. Wer den Unterschied kennt, weiß, warum in diesem Raum niemand die Tür offen stehen lässt.',
  },
  {
    id: 'tuer',
    frage: 'Warum ist die Maschinentür verriegelt?',
    antwort:
      'Nicht nur, damit niemand hineingreift. Bei mehreren tausend Umdrehungen in der Minute wird alles, was sich löst — ein Werkstück, eine Schneide —, zum Geschoss. Die Verriegelung ist der Grund, warum man daneben stehen und zusehen kann.',
  },
] as const

type FrageId = (typeof FRAGEN)[number]['id']

export function Z4() {
  const gespeichert = useFortschritt().answers.z4
  const [offen, setOffen] = useState<FrageId | null>(null)
  const [gelesen, setGelesen] = useState<string[]>(() => gespeichert?.gelesen ?? [])

  const waehle = (id: FrageId) => {
    setOffen((vorher) => (vorher === id ? null : id))
    if (gelesen.includes(id)) return
    const neu = [...gelesen, id]
    setGelesen(neu)
    merkeAntwort('z4', { gelesen: neu })
  }

  const antwort = FRAGEN.find((f) => f.id === offen)

  return (
    <StepShell
      id="Z4"
      interaktionOffen={false}
      buehne={<StepFoto id="Z4" />}
      fachtext={
        <>
          <p>
            Zwei Türen weiter, und die Halle ist weg. Hier ist es leise, sauber und immer
            gleich warm — und hier wird gemessen, was eine Mikrometerschraube nicht mehr
            hergibt.
          </p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.5 }}
            // Der eine Satz, der auf diesem Screen zählt — deshalb steht er in
            // Anton und nicht als dritte Zeile Fließtext.
            className="kh-titel-klein mt-4 text-kh-orange"
          >
            Neunzig Maschinen. Ein Messraum.
          </motion.p>
        </>
      }
      interaktion={
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          // Staffeln ja, warten lassen nein. Zwei Sekunden waren auf der Stele
          // zwei Sekunden leeres Panel unter einer Überschrift — und die drei
          // Fragen sind der einzige Inhalt dieses Schritts.
          transition={{ duration: 0.5, delay: 0.85 }}
          className="flex flex-col gap-2.5"
        >
          {!antwort && (
            <p className="px-1 text-[1rem] text-kh-paper/55">
              Drei Sachen, die man in diesem Raum lernt. Tipp an, was dich interessiert.
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
                  data-testid={`z4-frage-${f.id}`}
                  className={`flex min-h-[52px] items-center gap-2 rounded-kh-pill border-2 px-4 text-left text-[1.0625rem] font-semibold transition-transform active:scale-95 ${
                    aktiv
                      ? 'border-kh-orange bg-kh-orange text-[#0E0D0B]'
                      : 'border-kh-line-strong bg-white/5 text-kh-paper'
                  }`}
                >
                  {/* Der Haken markiert Gelesenes, ohne es wegzunehmen. */}
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

          {/* Eine Antwortfläche, nicht drei aufgeklappte Kästen: die zweite
              Antwort erscheint an derselben Stelle wie die erste, und das
              Panel bleibt so hoch, wie es war. */}
          <Wechsel takt={offen ?? 'nichts'}>
            {antwort ? (
              <p
                data-auswaehlbar
                data-testid="z4-antwort"
                className="kh-feld px-4 py-3 text-[1.0625rem] leading-[1.45] text-kh-paper/90"
              >
                {antwort.antwort}
              </p>
            ) : null}
          </Wechsel>

          {/*
            Die ehrliche Kehrseite dieses Tages — auf dem Weg zurück in die
            Halle, und mit den Worten von jemandem, der sie hinter sich hat:
            „dass man den ganzen Tag stehen muss. In der Schule sitzt man den
            ganzen Tag, auf der Arbeit steht man … das is anfangs anstrengend,
            auch durch die Sicherheitsschuhe, aber … man gewöhnt sich
            irgendwann dran.“ INTERVIEW — Einblicke Zerspanungsmechanikerin.

            Der zweite Teil nimmt dem ersten die Schärfe, ohne ihn zu
            beschönigen. Deshalb steht er dabei und nicht in einer Fußnote.
          */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.6 }}
            data-testid="z4-kehrseite"
            className="border-t border-kh-line pt-3 text-[1rem] leading-snug text-kh-paper/60"
          >
            Und zurück in die Halle: In der Schule sitzt du den ganzen Tag, auf der Arbeit
            stehst du — anfangs anstrengend, samt Sicherheitsschuhen, und irgendwann
            merkst du es nicht mehr.
          </motion.p>
        </motion.div>
      }
      fuss={<StepFuss id="Z4" />}
    />
  )
}
