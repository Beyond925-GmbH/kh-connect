import { motion } from 'motion/react'
import { ArrowLeft, ArrowRight, Check, Clock } from 'lucide-react'
import { BerufBild } from '@/khpl/komponenten/BerufBild'
import { useMatch } from '@/khpl/match/useMatch'
import type { BerufDef } from '@/khpl/berufe/typen'
import {
  betreteBeruf,
  useAktiverBeruf,
  useBesuchteBerufe,
  useSitzung,
  zeigeVorschlag,
} from '@/khpl/store/fortschritt'
import { useStaffAusgang } from './staffAusgang'

/**
 * S4 — alle vier Berufe nebeneinander.
 *
 * Der Screen, auf den jeder Weg im Trichter zurückführt: aus dem Vorschlag,
 * aus dem Sheet, vom Ende eines Tages. Er ist deshalb der einzige, der ohne
 * Vorgeschichte funktionieren muss — er darf nie voraussetzen, dass jemand
 * eine Frage beantwortet hat.
 *
 * **Sortiert wird nur, wenn es etwas zu sortieren gibt.** Mit Antworten steht
 * der beste Treffer vorn und trägt ein Etikett; ohne Antworten bleibt die
 * Reihenfolge der Registry. Eine gewürfelte Reihenfolge wäre schlimmer als
 * eine feste: sie sähe nach Empfehlung aus.
 */
export function Berufsliste() {
  const { rangfolge, kaltstart, bester } = useMatch()
  const aktiv = useAktiverBeruf()
  const besuchte = useBesuchteBerufe()
  const sitzung = useSitzung()
  const staffTap = useStaffAusgang()

  const berufe = rangfolge.map((t) => t.beruf)
  const empfohlen = kaltstart ? null : bester?.beruf.id

  /** Zurück zum Vorschlag — nur wenn es einen gibt und er nicht gerade kam. */
  const zurueck = !kaltstart && !aktiv

  return (
    <div
      data-testid="berufsliste"
      className="kh-screen flex flex-col overflow-hidden bg-kh-ink"
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_0%,rgba(255,122,26,0.16),transparent_60%)]"
      />

      <header className="relative flex shrink-0 items-center gap-3 px-4 pt-4 landscape:px-8 landscape:pt-6">
        {zurueck && (
          <button
            type="button"
            onClick={zeigeVorschlag}
            data-testid="berufe-zurueck"
            aria-label="Zurück zum Vorschlag"
            className="grid size-[52px] shrink-0 place-items-center rounded-kh-pill bg-white/6 text-kh-paper transition-transform active:scale-90"
          >
            <ArrowLeft className="size-6" strokeWidth={2.25} />
          </button>
        )}
        <div className="min-w-0">
          <h1 className="kh-titel">Vier Berufe</h1>
          <p className="text-[1rem] text-kh-mute">
            {sitzung.aktiverBeruf
              ? 'Wechsle, wann du willst — dein Fortschritt bleibt.'
              : 'Such dir einen aus. Umentscheiden geht jederzeit.'}
          </p>
        </div>
        {/* Die Dehnfuge trägt wie in der Step-Leiste die Staff-Geste. */}
        <span
          className="min-w-0 flex-1 self-stretch"
          onClick={staffTap}
          data-testid="staff-flaeche"
          aria-hidden
        />
      </header>

      <div
        data-scroll
        // Quer füllen die vier Karten den Screen (`auto-rows-fr`), statt oben zu
        // kleben und die untere Hälfte leer zu lassen. Hochkant bleibt es bei
        // `auto-rows-min` mit Scrollen — dort passen vier Karten in voller Höhe
        // ohnehin nicht nebeneinander.
        className="relative mt-4 grid min-h-0 flex-1 auto-rows-min grid-cols-1 gap-3 overflow-y-auto overscroll-contain px-4 pb-5 landscape:auto-rows-fr landscape:grid-cols-2 landscape:px-8 landscape:pb-8"
      >
        {berufe.map((b, i) => (
          <Karte
            key={b.id}
            beruf={b}
            index={i}
            empfohlen={b.id === empfohlen}
            angefangen={besuchte.includes(b.id)}
            aktiv={b.id === aktiv}
          />
        ))}
      </div>
    </div>
  )
}

function Karte({
  beruf,
  index,
  empfohlen,
  angefangen,
  aktiv,
}: {
  beruf: BerufDef
  index: number
  empfohlen: boolean
  angefangen: boolean
  aktiv: boolean
}) {
  const bald = beruf.graph === null

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      onClick={() => betreteBeruf(beruf.id)}
      data-testid={`beruf-${beruf.id}`}
      className={`relative flex min-h-[9.5rem] overflow-hidden rounded-kh-lg border-2 text-left transition-transform active:scale-[0.98] ${
        empfohlen ? 'border-kh-orange' : 'border-kh-line'
      }`}
    >
      <div aria-hidden className="absolute inset-0">
        <BerufBild beruf={beruf} className={bald ? 'opacity-40' : 'opacity-70'} />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0E0D0B] via-[#0E0D0B]/85 to-[#0E0D0B]/45" />
      </div>

      <div className="relative flex min-w-0 flex-1 flex-col justify-end gap-1.5 p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {empfohlen && (
            <span className="rounded-kh-pill bg-kh-orange px-2.5 py-1 text-[0.75rem] font-bold tracking-[0.1em] text-[#0E0D0B] uppercase">
              Passt zu dir
            </span>
          )}
          {angefangen && (
            <span className="flex items-center gap-1 rounded-kh-pill bg-kh-signal px-2.5 py-1 text-[0.75rem] font-bold tracking-[0.1em] text-[#0E0D0B] uppercase">
              <Check className="size-3.5" strokeWidth={3.5} aria-hidden />
              {aktiv ? 'du bist hier' : 'angefangen'}
            </span>
          )}
          {bald && (
            <span className="flex items-center gap-1 rounded-kh-pill bg-white/12 px-2.5 py-1 text-[0.75rem] font-bold tracking-[0.1em] text-kh-paper/70 uppercase">
              <Clock className="size-3.5" strokeWidth={2.5} aria-hidden />
              bald
            </span>
          )}
        </div>

        <h2 className="kh-titel-klein">{beruf.kurz}</h2>
        <p className="text-[0.9375rem] leading-snug text-kh-paper/70">{beruf.zeile}</p>
      </div>

      <span
        aria-hidden
        className="relative grid w-14 shrink-0 place-items-center self-stretch"
      >
        <ArrowRight
          className={`size-6 ${empfohlen ? 'text-kh-orange' : 'text-kh-paper/45'}`}
          strokeWidth={2.5}
        />
      </span>
    </motion.button>
  )
}
