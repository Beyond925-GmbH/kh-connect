import { cn } from '@/lib/utils'

/**
 * The rotated orange circle used on the campaign page
 * ("JETZT ALS WEBAPP INSTALLIEREN"). Reused here as a UI device.
 */
function Sticker({
  className,
  children,
  note,
  ...props
}: React.ComponentProps<'div'> & { note?: string }) {
  return (
    <div
      className={cn(
        'flex size-[9.5rem] -rotate-12 flex-col items-center justify-center rounded-full bg-kh-orange p-5 text-center text-white sm:size-[11rem]',
        className,
      )}
      {...props}
    >
      <span className="text-[13px] leading-[1.15] font-bold tracking-tight uppercase text-balance sm:text-[15px]">
        {children}
      </span>
      {note && <span className="mt-1.5 text-[11px] font-light sm:text-xs">{note}</span>}
    </div>
  )
}

export { Sticker }
