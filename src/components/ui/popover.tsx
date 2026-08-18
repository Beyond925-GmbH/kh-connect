import { Popover as BasePopover } from '@base-ui/react/popover'
import { cn } from '@/lib/utils'

/**
 * Base UI popover in the site's styling — opaque surface, 4px radius, 1px rule.
 * Used by the glossary chips (`<Begriff>`), where a dialog would be too heavy
 * for a two-line explanation.
 */

const Popover = BasePopover.Root
const PopoverTrigger = BasePopover.Trigger
const PopoverClose = BasePopover.Close

function PopoverContent({
  className,
  children,
  sideOffset = 10,
  ...props
}: React.ComponentProps<typeof BasePopover.Popup> & { sideOffset?: number }) {
  return (
    <BasePopover.Portal>
      <BasePopover.Positioner
        sideOffset={sideOffset}
        className="z-50 max-w-[min(26rem,92vw)]"
      >
        <BasePopover.Popup
          className={cn(
            'rounded-kh border border-kh-rule bg-kh-surface p-5 shadow-xl outline-none',
            'transition-all duration-150 data-[ending-style]:scale-[0.98] data-[ending-style]:opacity-0 data-[starting-style]:scale-[0.98] data-[starting-style]:opacity-0',
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
    <BasePopover.Title className={cn('kh-h3 text-kh-orange', className)} {...props} />
  )
}

function PopoverDescription({
  className,
  ...props
}: React.ComponentProps<typeof BasePopover.Description>) {
  return (
    <BasePopover.Description className={cn('mt-2 font-light', className)} {...props} />
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
