import * as React from 'react'
import { useRender } from '@base-ui/react/use-render'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * Matches the site's `mehr erfahren` button:
 * #FF9F2A bg, white, Barlow 200, 16px, radius 4px, padding 16px 32px.
 * Teen adjustment: 54px tall (was 50) and a 1px hover lift.
 */
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-kh font-light whitespace-nowrap transition-all duration-150 outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-kh-orange text-white border border-kh-orange hover:bg-kh-orange-hover hover:border-kh-orange-hover hover:-translate-y-px',
        outline:
          'bg-transparent text-kh-orange border border-kh-orange hover:bg-kh-orange hover:text-white hover:-translate-y-px',
        dark:
          'bg-kh-ink text-kh-page border border-kh-ink hover:bg-kh-grey hover:border-kh-grey hover:-translate-y-px',
        ghost: 'text-kh-grey hover:text-kh-orange',
      },
      size: {
        sm: 'h-11 px-5 text-[15px]',
        default: 'h-[54px] px-8 text-base',
        lg: 'h-[60px] px-10 text-lg',
        icon: 'size-[54px] px-0',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
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
