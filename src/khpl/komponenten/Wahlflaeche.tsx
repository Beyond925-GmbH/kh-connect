import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * Die Fläche, die man antippt, um etwas zu wählen.
 *
 * **Warum es die gibt.** Derselbe Gedanke — „hier tippst du, um dich zu
 * entscheiden“ — war an sechs Stellen sechsmal gebaut: die Antworten der vier
 * Fragen, die Werkzeugkacheln der Helmwahl, die zehn Punkte der M1-Liste, die
 * drei Winkel in M4, die Abstecher-Karten im Wege-Dialog und die drei
 * Karrierewege in M9. Ruhezustand `bg-white/5` gegen `bg-white/6`, Kante
 * `kh-line` gegen `kh-line-strong`, Mindesthöhe 52 gegen 56 gegen 60 gegen 68
 * gegen 104 gegen 112 — jede Stelle für sich plausibel, zusammen sechs
 * Dialekte einer Sprache. Auf einem Gerät, das jemand zwei Minuten lang
 * bedient, ist das der Unterschied zwischen „ein Produkt“ und „mehrere
 * Screens“.
 *
 * **Was hier geteilt wird und was nicht.** Geteilt ist die *Fläche*: Radius,
 * Kante, Grund, Mindesthöhe, der gewählte Zustand und die Rückmeldung beim
 * Drücken. Nicht geteilt ist, was darin steht — eine Werkzeugkachel trägt ein
 * Symbol über einer Beschriftung, eine Abstecher-Karte zwei Textzeilen und
 * einen Pfeil. Diese Kompositionen zusammenzuzwingen hätte die Kachel zu
 * einem Formular mit acht Schaltern gemacht; die Stellen behalten ihren
 * Inhalt und teilen sich den Grund.
 *
 * **Der gewählte Zustand ist Signalfarbe — als Fläche nur, wo die Wahl auch
 * gilt.** Limette heißt „du“ (R3): jede Wahl ist eine Handlung des Besuchers
 * und trägt darum seine Farbe. Aber die satte Füllung sieht nach „richtig“
 * aus — und wo das Antippen **vorläufig** ist (M1, M4: die Prüfung danach
 * färbt erst die echten Treffer), wäre das ein Versprechen, das die
 * Auswertung noch einlösen muss. Dafür gibt es `ton="vorlaeufig"`: limetter
 * Rand, kaum Füllung, helle Schrift — „du hast getippt, geprüft ist noch
 * nichts“. `ton="orange"` ist der alte Ausweg für dieselben Stellen und
 * bleibt funktionsfähig, bis die Aufrufer migriert sind (Orange gehört nach
 * R3 der Welt, nicht der Wahl).
 */
export const wahlflaeche = cva(
  [
    'relative flex w-full rounded-kh border-2 text-left',
    'transition-[background-color,border-color,color,transform] duration-150',
    'active:scale-[0.97]',
    'disabled:pointer-events-none disabled:opacity-40',
  ].join(' '),
  {
    variants: {
      /**
       * Die drei Bauformen. Sie unterscheiden sich in Höhe und Innenaufbau,
       * nicht in der Fläche.
       *
       *   `zeile`  — eine Zeile Text, waagerecht. Listen und Antworten.
       *   `kachel` — Symbol über Beschriftung, mittig. Raster.
       *   `karte`  — Titel, Zeile darunter, Pfeil. Wege und Angebote.
       */
      form: {
        zeile: 'min-h-[56px] items-center gap-3 px-3.5 py-2 text-[1.0625rem]',
        kachel:
          'min-h-[104px] flex-col items-center justify-center gap-2 px-2 py-3 text-center',
        karte: 'min-h-[104px] flex-col justify-between gap-2 p-4',
      },
      ton: {
        signal: '',
        orange: '',
        vorlaeufig: '',
      },
      gewaehlt: { true: '', false: '' },
      /** Die nicht gewählten Flächen, nachdem die Wahl gefallen ist. */
      gedaempft: { true: 'opacity-35', false: '' },
    },
    compoundVariants: [
      {
        gewaehlt: false,
        className: 'border-kh-line-strong bg-white/6 text-kh-paper',
      },
      {
        gewaehlt: true,
        ton: 'signal',
        className: 'border-kh-signal bg-kh-signal font-semibold text-[#0E0D0B]',
      },
      {
        gewaehlt: true,
        ton: 'orange',
        className: 'border-kh-orange bg-kh-orange font-semibold text-[#0E0D0B]',
      },
      {
        gewaehlt: true,
        ton: 'vorlaeufig',
        className: 'border-kh-signal bg-kh-signal/10 font-semibold text-kh-paper',
      },
    ],
    defaultVariants: { form: 'zeile', ton: 'signal', gewaehlt: false, gedaempft: false },
  },
)

export type WahlflaecheProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof wahlflaeche>

/**
 * Der Normalfall als Komponente. Wo `motion` gebraucht wird (M1 zieht jeden
 * Chip beim Antippen einmal zusammen, M9 lässt die Karten einfliegen), nimmt
 * die Stelle stattdessen `wahlflaeche({ … })` als `className` — deshalb ist
 * die `cva` oben mit exportiert.
 */
export function Wahlflaeche({
  form,
  ton,
  gewaehlt,
  gedaempft,
  className,
  ...props
}: WahlflaecheProps) {
  return (
    <button
      type="button"
      aria-pressed={gewaehlt ?? undefined}
      className={cn(wahlflaeche({ form, ton, gewaehlt, gedaempft }), className)}
      {...props}
    />
  )
}
