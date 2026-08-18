import { Accordion as BaseAccordion } from '@base-ui/react/accordion'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

const Accordion = BaseAccordion.Root

function AccordionItem({ className, ...props }: React.ComponentProps<typeof BaseAccordion.Item>) {
  return <BaseAccordion.Item className={cn('border-b border-kh-rule', className)} {...props} />
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof BaseAccordion.Trigger>) {
  return (
    <BaseAccordion.Header>
      <BaseAccordion.Trigger
        className={cn(
          'group flex w-full items-center justify-between gap-4 py-5 text-left text-lg font-bold text-kh-grey transition-colors hover:text-kh-orange',
          className,
        )}
        {...props}
      >
        {children}
        <Plus className="size-5 shrink-0 text-kh-orange transition-transform duration-200 group-data-[panel-open]:rotate-45" />
      </BaseAccordion.Trigger>
    </BaseAccordion.Header>
  )
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof BaseAccordion.Panel>) {
  return (
    <BaseAccordion.Panel
      className={cn(
        'h-[var(--accordion-panel-height)] overflow-hidden transition-[height] duration-250 ease-out data-[ending-style]:h-0 data-[starting-style]:h-0',
        className,
      )}
      {...props}
    >
      <div className="pb-5 font-light">{children}</div>
    </BaseAccordion.Panel>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
