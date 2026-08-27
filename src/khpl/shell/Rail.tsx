import { motion } from 'motion/react'
import { railIndex, type StepGraph } from '@/khpl/flow/steps'
import { wegzustand } from '@/khpl/flow/uebergaenge'
import type { Fortschritt } from '@/khpl/store/fortschritt'

/**
 * Die Progress-Rail aus khpl-ui-shell.md 4 — ein Segment pro **Hauptschritt**.
 * Abstecher bekommen kein Segment; sie erscheinen nur im Sheet „Dein Weg“.
 *
 * Die Segmentzahl kommt aus `graph.haupt.length`, nie aus einer Konstanten
 * (ui-shell 9, Punkt 1) — und ist seit den vier Berufen zusätzlich je Beruf
 * verschieden. Ein Tap öffnet S3.
 *
 * **Der Beruf steht in der Pille, nicht daneben.** Mit vier Berufen muss auf
 * jedem Screen beantwortet sein, in welchem man gerade steckt; ein eigener
 * Knopf dafür passt hochkant nicht mehr in die Leiste (60 px Zurück + Rail +
 * Karriere-Link sind dort schon eng). Als Kleinzeile über dem Zählstand kostet
 * die Antwort keine Breite und keinen Tap.
 *
 * **Der Zählstand ist jetzt das lauteste Element der Leiste.** Vorher stand
 * dort „4 / 10“ in 15 px Barlow 200 neben zehn 10-px-Strichen; das einzige
 * Element, das „du kommst voran“ sagt, war das unauffälligste auf dem Screen.
 * Jetzt trägt die Ziffer Anton und ist so groß wie ein Knopf — und die
 * Segmente sind Blöcke, keine Striche. Zurückgelegtes ist Orange, das
 * aktuelle Segment glüht, alles davor liegt als leere Kerbe da.
 *
 * Die Leiste schwebt seit dem Umbau über der Bühne und hat keinen eigenen
 * Grund. Deshalb sitzt die ganze Rail auf einer eigenen dunklen Pille: auf
 * einem hellen Foto wäre sie sonst weg.
 */
export function Rail({
  graph,
  beruf,
  fortschritt,
  onOeffnen,
}: {
  graph: StepGraph
  /** Kurzname des aktiven Berufs — „Zimmerer“. */
  beruf: string
  fortschritt: Fortschritt
  onOeffnen: () => void
}) {
  const jetzt = railIndex(graph, fortschritt.currentStepId)
  const gesamt = graph.haupt.length

  return (
    <button
      type="button"
      onClick={onOeffnen}
      data-testid="rail"
      aria-label={`Dein Weg öffnen — ${beruf}, Schritt ${jetzt + 1} von ${gesamt}`}
      className="group flex h-[52px] min-w-0 shrink items-center gap-3 rounded-kh-pill bg-black/35 pr-4 pl-3 backdrop-blur-md transition-transform active:scale-95"
    >
      <span className="flex min-w-0 flex-col items-start justify-center leading-none">
        {/* 45 % Deckkraft auf einer 35-%-Schwarzpille über einem hellen Foto
            liegt unter 3:1 — auf dem Messebild war der Beruf schlicht weg,
            und er ist die eine Angabe, die mit vier Berufen auf jedem Screen
            beantwortet sein muss. */}
        <span className="max-w-[9rem] truncate text-[0.6875rem] font-semibold tracking-[0.14em] text-kh-paper/70 uppercase">
          {beruf}
        </span>
        <span className="flex items-baseline gap-0.5 font-display leading-none">
          <motion.span
            key={jetzt}
            initial={{ opacity: 0, transform: 'translateY(-8px)' }}
            animate={{ opacity: 1, transform: 'translateY(0px)' }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="text-[1.5rem] text-kh-orange tabular-nums"
          >
            {jetzt + 1}
          </motion.span>
          <span className="text-[1.125rem] text-kh-paper/45 tabular-nums">/{gesamt}</span>
        </span>
      </span>

      {/*
        Unter 640 px Breite tragen nur noch die Ziffern.

        Zehn Segmente sind 11 px breit, das aktuelle 26, dazwischen 3 px — mit
        Etikett und Innenabstand rund 258 px. Daneben stehen der 60-px-Zurück-
        Knopf und, auf jedem dritten Step, „Karriere-Wege" mit rund 160 px. Auf
        einem 390-px-Handy geht das nicht auf: die Segmente haben kein
        `shrink-0`, wurden also unter ihre gesetzte Breite gedrückt und liefen
        über das Etikett — auf M6 stand die Skala quer über „DACHDECKER", und
        von zehn Kerben waren acht zu sehen. Eine Skala, die falsch zählt, ist
        schlechter als keine; „6/10" daneben sagt dasselbe und stimmt.
      */}
      <span className="flex items-center gap-[3px] max-sm:hidden" aria-hidden>
        {graph.haupt.map((s, i) => {
          const zustand = i === jetzt ? 'aktuell' : wegzustand(graph, s.id, fortschritt)
          return (
            <motion.span
              key={s.id}
              data-segment={zustand}
              // Nur die Breite animiert: das aktuelle Segment fährt beim
              // Schrittwechsel aus, statt umzuspringen. Die Farbe wechselt
              // sofort — ein Balken, der langsam die Farbe wechselt, sieht
              // nach Ladezustand aus.
              animate={{ width: zustand === 'aktuell' ? 26 : 11 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              // Kommende Segmente sind **leere Kerben**, keine grauen Punkte:
              // eine flache Fläche in Weiß/18 las sich als Dekoration, und
              // damit sah die Leiste aus wie ein Muster statt wie eine Skala.
              // Der Innenring gibt ihnen eine Kante, die Füllung bleibt leer.
              className={`h-3 rounded-full ${
                zustand === 'aktuell'
                  ? 'bg-kh-orange shadow-[0_0_14px_rgba(255,159,42,0.85)]'
                  : zustand === 'besucht'
                    ? 'bg-kh-orange/55'
                    : 'bg-white/8 ring-1 ring-white/30 ring-inset'
              }`}
            />
          )
        })}
      </span>
    </button>
  )
}
