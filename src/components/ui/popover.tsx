import { Popover as BasePopover } from '@base-ui/react/popover'
import { cn } from '@/lib/utils'

/**
 * Das Glossar-Popover hinter jedem `<Begriff>`. Ein Dialog wäre für eine
 * zweizeilige Erklärung zu schwer — sie soll neben dem Wort stehen, nicht den
 * Screen übernehmen.
 *
 * Auf dunklem Grund braucht es einen *helleren* Grund als die Umgebung, sonst
 * verschwimmt es mit dem Panel darunter: `kh-raised` plus eine orange Kante
 * oben, damit klar ist, wozu es gehört.
 */

const Popover = BasePopover.Root
const PopoverTrigger = BasePopover.Trigger
const PopoverClose = BasePopover.Close

function PopoverContent({
  className,
  children,
  sideOffset = 12,
  ...props
}: React.ComponentProps<typeof BasePopover.Popup> & { sideOffset?: number }) {
  return (
    <BasePopover.Portal>
      <BasePopover.Positioner
        sideOffset={sideOffset}
        className="z-50 max-w-[min(26rem,90vw)]"
      >
        <BasePopover.Popup
          className={cn(
            'rounded-kh border-t-4 border-kh-orange bg-kh-raised p-5 shadow-[0_18px_50px_rgba(0,0,0,0.65)] outline-none ring-1 ring-white/10',
            'transition-all duration-150 data-[ending-style]:scale-[0.97] data-[ending-style]:opacity-0 data-[starting-style]:scale-[0.97] data-[starting-style]:opacity-0',
            className,
          )}
          {...props}
        >
          {children}
        </BasePopover.Popup>
      </BasePopover.Positioner>
    </BasePopover.Portal>
  )
}

function PopoverTitle({
  className,
  ...props
}: React.ComponentProps<typeof BasePopover.Title>) {
  return (
    <BasePopover.Title
      className={cn('kh-titel-klein text-kh-orange', className)}
      {...props}
    />
  )
}

function PopoverDescription({
  className,
  ...props
}: React.ComponentProps<typeof BasePopover.Description>) {
  return (
    <BasePopover.Description
      className={cn('mt-2 text-[1.0625rem] leading-[1.45] text-kh-paper/85', className)}
      {...props}
    />
  )
}

export {
  Popover,
  PopoverTrigger,
  PopoverClose,
  PopoverContent,
  PopoverTitle,
  PopoverDescription,
}
