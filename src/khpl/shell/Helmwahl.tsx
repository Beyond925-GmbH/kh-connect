import { useState } from 'react'
import { motion } from 'motion/react'
import {
  ArrowRight,
  Drill,
  Hammer,
  PencilRuler,
  Ruler,
  Tablet,
  Wrench,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Helm } from '@/khpl/komponenten/Helm'
import { HELM_FARBEN, WERKZEUGE, type WerkzeugIcon } from '@/khpl/match/helm'
import { merkeHelm, useSitzung, zeigeFragen } from '@/khpl/store/fortschritt'

/**
 * S1 — „Dein Helm“. Der erste Screen nach dem Tap auf den Splash.
 *
 * Zwei Wahlen, zehn Sekunden. Er hat drei Aufgaben, und die dritte ist die,
 * an der er hängt:
 *
 *  1. **Merkmalssignal.** Das Werkzeug ist die stärkste einzelne Frage im
 *     Trichter — „wonach greifst du zuerst“ beantwortet auch, wer mit
 *     „was ist dir wichtig“ nichts anfangen kann.
 *  2. **Einsatz.** Wer etwas gewählt hat, liest den Vorschlag danach als
 *     Ergebnis und nicht als Werbung.
 *  3. **Die Sprache der App beibringen.** Hier lernt der Besucher an einer
 *     Wahl ohne Folgen, wie ein Tap sich anfühlt und wie Bestätigung
 *     aussieht. Ein Screen, der das kostenlos erledigt, bevor die erste
 *     Übung kommt, ist die Sekunden wert.
 *
 * Ohne Wahl geht es trotzdem weiter: „Überspringen“ ist auf jedem Screen des
 * Trichters vorhanden, und `matching.ts` kennt den Kaltstart.
 */

const ICONS: Record<WerkzeugIcon, typeof Hammer> = {
  hammer: Hammer,
  ruler: Ruler,
  'pencil-ruler': PencilRuler,
  wrench: Wrench,
  drill: Drill,
  tablet: Tablet,
}

export function Helmwahl() {
  const sitzung = useSitzung()
  const [farbe, setFarbe] = useState(sitzung.helm?.farbe ?? HELM_FARBEN[0].id)
  const [werkzeug, setWerkzeug] = useState(sitzung.helm?.werkzeug ?? '')

  const weiter = () => {
    if (werkzeug) merkeHelm({ farbe, werkzeug })
    zeigeFragen()
  }

  return (
    <div
      data-testid="helmwahl"
      className="kh-screen flex flex-col overflow-hidden bg-kh-ink"
    >
      {/* Ein warmer Schein aus der unteren linken Ecke, wie auf dem Splash —
          er bindet den einzigen Screen ohne Foto an die übrigen. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(90%_70%_at_15%_100%,rgba(255,122,26,0.22),transparent_60%)]"
      />

      <div className="relative flex min-h-0 flex-1 flex-col gap-4 p-5 landscape:flex-row landscape:gap-8 landscape:p-8">
        {/* Der Helm. Quer links neben der Wahl, hochkant darüber — er ist das
            Ergebnis und muss im Blick bleiben, während man wählt. */}
        <div className="flex shrink-0 flex-col items-center justify-center gap-3 landscape:w-[34%]">
          <motion.div
            key={farbe}
            initial={{ scale: 0.9, opacity: 0, rotate: -4 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 22 }}
            className="w-[12rem] landscape:w-full landscape:max-w-[15rem]"
          >
            <Helm
              farbe={farbe}
              className="h-auto w-full drop-shadow-[0_14px_34px_rgba(0,0,0,0.6)]"
            />
          </motion.div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 landscape:max-w-[40rem]">
          <header className="flex shrink-0 flex-col gap-1.5">
            <span className="kh-etikett flex items-center gap-2">
              <span aria-hidden className="h-[3px] w-7 rounded-full bg-kh-orange" />
              Bevor du anfängst
            </span>
            <h1 className="kh-titel">Dein Helm</h1>
          </header>

          <div
            data-scroll
            className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto overscroll-contain pr-0.5 landscape:justify-center"
          >
            <section>
              <h2 className="text-[1rem] font-semibold text-kh-mute">Welche Farbe?</h2>
              <div className="mt-2 flex flex-wrap gap-2.5">
                {HELM_FARBEN.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    aria-pressed={farbe === f.id}
                    data-testid={`helm-farbe-${f.id}`}
                    onClick={() => setFarbe(f.id)}
                    className={`size-[60px] rounded-kh-pill border-4 transition-transform active:scale-90 ${
                      farbe === f.id
                        ? 'border-kh-paper scale-105'
                        : 'border-transparent opacity-70'
                    }`}
                    style={{ backgroundColor: f.farbe }}
                  >
                    <span className="sr-only">{f.name}</span>
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-[1rem] font-semibold text-kh-mute">
                Wonach greifst du zuerst?
              </h2>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {WERKZEUGE.map((w) => {
                  const Icon = ICONS[w.icon]
                  const gewaehlt = werkzeug === w.id
                  return (
                    <button
                      key={w.id}
                      type="button"
                      aria-pressed={gewaehlt}
                      data-testid={`werkzeug-${w.id}`}
                      onClick={() => setWerkzeug(gewaehlt ? '' : w.id)}
                      className={`flex min-h-[84px] flex-col items-center justify-center gap-1.5 rounded-kh border-2 px-2 py-2.5 text-center transition-transform active:scale-[0.96] ${
                        gewaehlt
                          ? 'border-kh-signal bg-kh-signal/12'
                          : 'border-kh-line bg-white/5'
                      }`}
                    >
                      <Icon
                        className={`size-7 ${gewaehlt ? 'text-kh-signal' : 'text-kh-paper/70'}`}
                        strokeWidth={2}
                        aria-hidden
                      />
                      <span className="text-[0.8125rem] leading-tight font-semibold text-kh-paper/85">
                        {w.name}
                      </span>
                    </button>
                  )
                })}
              </div>
            </section>
          </div>

          <div className="flex shrink-0 items-center justify-between gap-3 border-t border-kh-line pt-3">
            <Button
              variant="leise"
              size="sm"
              onClick={zeigeFragen}
              data-testid="helm-ueberspringen"
            >
              Überspringen
            </Button>
            <Button onClick={weiter} variant="weiter" data-testid="helm-weiter">
              Passt
              <ArrowRight className="size-5" strokeWidth={2.5} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
