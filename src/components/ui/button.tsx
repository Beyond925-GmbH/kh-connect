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
 * **Eine gefüllte orange Fläche pro Screen, und die führt nach vorn.** Die
 * Regel aus `Verzweigung` gilt weiter; die Varianten sind danach benannt:
 *
 *   `weiter` — die eine Handlung, die den Screen verlässt
 *   `aktion` — die Handlung *innerhalb* einer Übung (prüfen, auflösen)
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
          'bg-kh-orange text-[#0E0D0B] border-2 border-kh-orange',
          'shadow-[0_5px_0_0_#8A4A00]',
          'active:translate-y-[5px] active:shadow-[0_0_0_0_#8A4A00]',
        ].join(' '),
        aktion: [
          'bg-kh-signal text-[#0E0D0B] border-2 border-kh-signal',
          'shadow-[0_5px_0_0_#5E7300]',
          'active:translate-y-[5px] active:shadow-[0_0_0_0_#5E7300]',
        ].join(' '),
        neben: [
          'bg-white/6 text-kh-paper border-2 border-kh-line-strong',
          'active:scale-[0.97] active:bg-white/12',
        ].join(' '),
        leise: 'text-kh-mute border-2 border-transparent active:scale-[0.97]',
      },
      size: {
        sm: 'h-12 px-5 text-[1rem]',
        default: 'h-[60px] px-7 text-[1.0625rem]',
        lg: 'h-[68px] px-9 text-[1.1875rem]',
        icon: 'size-[60px] px-0',
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
