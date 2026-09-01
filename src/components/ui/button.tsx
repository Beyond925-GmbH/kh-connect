import * as React from 'react'
import { useRender } from '@base-ui/react/use-render'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * Knöpfe im System „Baustelle“.
 *
 * Der Vorgänger war der `mehr erfahren`-Knopf der Website: 4 px Radius,
 * Barlow 200, ein Hover, der um ein Pixel steigt. Auf einem Touchscreen ist ein
 * Hover-Effekt kein Feedback — er wird nie ausgelöst. Das Einzige, was ein
 * Finger merkt, ist, was beim **Drücken** passiert.
 *
 * Deshalb hier: Pillenform, halbfette Schrift, und jede Variante hat einen
 * sichtbaren `:active`-Zustand, der einsinkt. Der gefüllte Knopf trägt
 * zusätzlich einen harten Schatten nach unten — er sieht aus wie eine Taste,
 * die man herunterdrücken kann, und beim Drücken fährt der Schatten ein.
 *
 * **Farbregel: Orange = die Welt, Limette = du.** Orange gehört den
 * Fakten, Maßen und Zeichnungen — Knöpfe sind immer eine Handlung des
 * Besuchers und damit limette. Und **genau ein gefülltes limettes Element pro
 * Screen heißt „hier geht's weiter“**; die Varianten sind danach benannt:
 *
 *   `weiter` — die eine Handlung, die den Screen verlässt: die gefüllte Pille
 *   `aktion` — die Handlung *innerhalb* einer Übung (prüfen, auflösen):
 *              Limette-Kontur, damit sie neben dem gefüllten Weiter nie
 *              selbst wie der Weg nach vorn aussieht
 *   `neben`  — Abstecher, Zweitwege, alles Gleichrangige daneben
 *   `leise`  — „Zeig mir wie“, Abbrechen, Rückwege
 */
const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2.5 rounded-kh-pill whitespace-nowrap',
    'font-semibold tracking-[0.01em]',
    'transition-[transform,box-shadow,background-color,border-color,color] duration-100',
    'outline-none select-none',
    'disabled:pointer-events-none disabled:opacity-40',
    '[&_svg]:shrink-0',
  ].join(' '),
  {
    variants: {
      variant: {
        weiter: [
          'bg-kh-signal text-[#0E0D0B] border-2 border-kh-signal',
          'shadow-[0_4px_0_0_#5E7300]',
          'active:translate-y-[4px] active:shadow-[0_0_0_0_#5E7300]',
        ].join(' '),
        aktion: [
          'border-2 border-kh-signal text-kh-signal',
          'active:scale-[0.97] active:bg-kh-signal/15',
        ].join(' '),
        neben: [
          'bg-white/6 text-kh-paper border-2 border-kh-line-strong',
          'active:scale-[0.97] active:bg-white/12',
        ].join(' '),
        leise: 'text-kh-mute border-2 border-transparent active:scale-[0.97]',
      },
      /* Kompakter als die erste Fassung (60/68 px): die Knoepfe frassen im
         angehefteten Fuss so viel Hoehe, dass Uebungen darueber scrollen
         mussten. 52 px bleibt oberhalb der 44-pt-Untergrenze von iOS und
         unter Hallenbedingungen gut treffbar; die alte 60-px-Regel aus flow
         8.5 galt der *Leiste*, nicht jedem Knopf im Panel. */
      size: {
        sm: 'h-11 px-4 text-[0.9375rem]',
        default: 'h-[52px] px-6 text-[1.0625rem]',
        lg: 'h-[58px] px-7 text-[1.125rem]',
        icon: 'size-[52px] px-0',
      },
    },
    defaultVariants: { variant: 'weiter', size: 'default' },
  },
)

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  render?: useRender.RenderProp
}

function Button({ className, variant, size, render, ...props }: ButtonProps) {
  return useRender({
    render: render ?? <button type="button" />,
    props: { className: cn(buttonVariants({ variant, size, className })), ...props },
  })
}

export { Button, buttonVariants }
