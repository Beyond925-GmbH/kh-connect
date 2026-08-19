import { Menu as BaseMenu } from '@base-ui/react/menu'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const Menu = BaseMenu.Root
const MenuTrigger = BaseMenu.Trigger
const MenuRadioGroup = BaseMenu.RadioGroup

function MenuContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof BaseMenu.Popup>) {
  return (
    <BaseMenu.Portal>
      <BaseMenu.Positioner side="bottom" align="end" sideOffset={8} className="z-50">
        <BaseMenu.Popup
          className={cn(
            'min-w-48 origin-[var(--transform-origin)] rounded-kh border border-kh-line bg-kh-raised p-1 shadow-xl outline-none transition-all duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0',
            className,
          )}
          {...props}
        >
          {children}
        </BaseMenu.Popup>
      </BaseMenu.Positioner>
    </BaseMenu.Portal>
  )
}

function MenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof BaseMenu.RadioItem>) {
  return (
    <BaseMenu.RadioItem
      className={cn(
        'flex cursor-default items-center gap-3 rounded-kh px-3 py-2.5 text-[15px] text-kh-paper/85 outline-none select-none data-[highlighted]:bg-white/8 data-[highlighted]:text-kh-orange',
        className,
      )}
      {...props}
    >
      {children}
      <BaseMenu.RadioItemIndicator className="ml-auto flex">
        <Check className="size-4 text-kh-orange" />
      </BaseMenu.RadioItemIndicator>
    </BaseMenu.RadioItem>
  )
}

export { Menu, MenuTrigger, MenuContent, MenuRadioGroup, MenuRadioItem }
