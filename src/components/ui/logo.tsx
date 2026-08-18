import { useTheme } from '@/lib/theme'
import { cn } from '@/lib/utils'

/**
 * The wordmark is near-black artwork on transparency, so it disappears on a
 * dark ground. It is swapped for a re-inked copy of the same file rather than
 * filtered: no CSS filter round-trips the orange mark faithfully — `invert()`
 * alone turns it blue, and correcting the hue drags it to red or olive.
 * `public/brand/kh-paderborn-lippe2-dark.png` recolours only the wordmark and
 * leaves the octagon and every antialiased edge byte-identical.
 */
function Logo({ className, ...props }: React.ComponentProps<'img'>) {
  const { resolved } = useTheme()

  return (
    <img
      src={
        resolved === 'dark'
          ? '/brand/kh-paderborn-lippe2-dark.png'
          : '/brand/kh-paderborn-lippe2.png'
      }
      alt="Kreishandwerkerschaft Paderborn-Lippe"
      width={150}
      height={38}
      className={cn('h-[38px] w-auto', className)}
      {...props}
    />
  )
}

export { Logo }
