import { cn } from '@/lib/utils'

/** Campaign hashtags (#fun, #diy, #heavymetal …) as a pill. */
function Hashtag({
  className,
  active,
  ...props
}: React.ComponentProps<'span'> & { active?: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-kh px-3 py-1.5 text-[15px] font-light transition-colors',
        active ? 'bg-kh-orange text-white' : 'bg-kh-band text-kh-grey',
        className,
      )}
      {...props}
    />
  )
}

export { Hashtag }
