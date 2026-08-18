import { Dialog as BaseDialog } from '@base-ui/react/dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

const Dialog = BaseDialog.Root
const DialogTrigger = BaseDialog.Trigger
const DialogClose = BaseDialog.Close

function DialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof BaseDialog.Popup>) {
  return (
    <BaseDialog.Portal>
      <BaseDialog.Backdrop className="fixed inset-0 z-50 bg-black/50 transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
      <BaseDialog.Popup
        className={cn(
          'fixed top-1/2 left-1/2 z-50 max-h-[85vh] w-[min(44rem,92vw)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-kh bg-kh-surface p-10 shadow-2xl dark:ring-1 dark:ring-kh-rule outline-none transition-all duration-200 data-[ending-style]:scale-[0.98] data-[ending-style]:opacity-0 data-[starting-style]:scale-[0.98] data-[starting-style]:opacity-0',
          className,
        )}
        {...props}
      >
        {children}
        <BaseDialog.Close className="absolute top-4 right-4 grid size-10 place-items-center rounded-kh text-kh-grey transition-colors hover:bg-kh-band">
          <X className="size-5" />
          <span className="sr-only">Schließen</span>
        </BaseDialog.Close>
      </BaseDialog.Popup>
    </BaseDialog.Portal>
  )
}

function DialogTitle({ className, ...props }: React.ComponentProps<typeof BaseDialog.Title>) {
  return <BaseDialog.Title className={cn('kh-h1 mb-4', className)} {...props} />
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof BaseDialog.Description>) {
  return <BaseDialog.Description className={cn('font-light', className)} {...props} />
}

export { Dialog, DialogTrigger, DialogClose, DialogContent, DialogTitle, DialogDescription }
