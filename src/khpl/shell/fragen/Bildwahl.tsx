import { motion } from 'motion/react'
import type { Frage } from '@/khpl/match/fragen'

/**
 * Die Bildfrage: drei Motive, eines antippen.
 *
 * **Das Bild ist die Antwort, der Satz die Unterschrift.** Die Kacheln füllen
 * den Screen randlos aus — quer als drei Spalten, hochkant als drei Bänder.
 * Es gibt keine Wahlfläche neben dem Bild und keinen Rahmen darum: wer eine
 * dritte Fläche baut („Bild + Text + Knopf“), hat wieder ein Formular mit
 * Illustration.
 *
 * **Quittung wie überall im Trichter:** der Tap ist die Entscheidung. Die
 * gewählte Kachel bekommt die Signalkante und wächst leicht, die anderen
 * fallen in Grau zurück — dieselbe Sprache wie `Wahlflaeche`, nur auf
 * Fotografie übersetzt.
 */
export function Bildwahl({
  frage,
  gewaehlt,
  onWahl,
}: {
  frage: Frage
  gewaehlt: string | null
  onWahl: (antwortId: string) => void
}) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-4 landscape:gap-5">
      <header className="flex shrink-0 flex-col gap-1.5">
        <span className="kh-etikett flex items-center gap-2">
          <span aria-hidden className="h-[3px] w-7 rounded-full bg-kh-orange" />
          {frage.etikett}
        </span>
        {/* Eine Stufe unter `kh-plakat`: die Plakatgröße nähme hochkant den
            Bändern ein Drittel ihrer Höhe weg — hier ist das Bild der Star. */}
        <h1 className="font-display text-[clamp(1.8rem,1.2rem+2.6vw,3.2rem)] leading-[0.96] text-balance uppercase">
          {frage.frage}
        </h1>
      </header>

      <div className="grid min-h-0 flex-1 grid-rows-3 gap-2.5 landscape:grid-cols-3 landscape:grid-rows-1 landscape:gap-3">
        {frage.antworten.map((a, i) => {
          const ist = gewaehlt === a.id
          const gedaempft = Boolean(gewaehlt) && !ist
          return (
            /*
              Zwei Elemente, zwei Aufgaben — und das ist keine Kosmetik.

              Vorher lagen **Auftritt und Quittung auf derselben Kachel**:
              Motion schrieb je Frame ein `transform` in den Stil, und
              daneben stand `transition-[transform,opacity,filter]`. Damit
              startet jeder dieser Frames eine neue 300-ms-CSS-Überblendung
              auf den gerade geschriebenen Wert — die Kachel läuft dem
              Animationswert dauerhaft hinterher. Gemessen: nach 400 ms
              (Motion ist fertig) stand sie noch bei 23 von 26 px, und die
              restlichen 23 px fielen danach in 300 ms auf einmal. Das ist
              das Zucken, das man sieht: erst kriecht die Kachel, dann
              springt sie.

              Der Auftritt gehört deshalb dem Rahmen (Motion, transform +
              opacity), die Quittung der Kachel darin (CSS). Kein Element
              hat noch zwei Herren.
            */
            <motion.div
              key={a.id}
              initial={{ opacity: 0, transform: 'translateY(26px)' }}
              animate={{ opacity: 1, transform: 'translateY(0px)' }}
              transition={{
                duration: 0.4,
                delay: 0.08 * i,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={`flex min-h-0 ${ist ? 'z-10' : ''}`}
            >
              <button
                type="button"
                data-testid={`antwort-${a.id}`}
                onClick={() => onWahl(a.id)}
                aria-pressed={ist}
                className={`group relative min-h-0 min-w-0 flex-1 overflow-hidden rounded-kh-lg text-left transition-[transform,opacity,filter] duration-300 ${
                  ist
                    ? 'scale-[1.015] ring-4 ring-kh-signal'
                    : gedaempft
                      ? 'scale-[0.99] opacity-35 grayscale'
                      : 'active:scale-[0.985]'
                }`}
              >
                <img
                  src={a.bild}
                  alt=""
                  draggable={false}
                  // `eager`: alle drei Motive stehen beim Auftritt im Bild.
                  // Lädt eines davon erst während der Bewegung nach, blitzt es
                  // mitten in der Animation auf — und genau das liest sich als
                  // Ruckeln, obwohl die Bewegung selbst sauber läuft.
                  loading="eager"
                  decoding="async"
                  className={`absolute inset-0 size-full object-cover transition-transform duration-500 ${
                    ist ? 'scale-105' : ''
                  }`}
                  style={a.fokus ? { objectPosition: a.fokus } : undefined}
                />
                {/* Der Fuß trägt die Unterschrift — steil genug, dass Barlow 600
                    auch auf einem hellen Motiv steht. */}
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-[#0E0D0B]/85 via-[#0E0D0B]/25 to-transparent"
                />
                <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 landscape:p-5">
                  <span className="text-[clamp(1.0625rem,0.95rem+0.5vw,1.375rem)] leading-tight font-semibold text-kh-paper drop-shadow-[0_1px_8px_rgba(0,0,0,0.7)]">
                    {a.text}
                  </span>
                  <span
                    aria-hidden
                    className={`mb-1 size-3 shrink-0 rounded-full transition-colors ${
                      ist ? 'bg-kh-signal' : 'bg-kh-orange'
                    }`}
                  />
                </span>
              </button>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
