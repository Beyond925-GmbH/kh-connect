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
      <BaseDialog.Backdrop className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
      <BaseDialog.Popup
        className={cn(
          'fixed top-1/2 left-1/2 z-50 max-h-[85dvh] w-[min(42rem,92vw)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-kh-lg border-t-4 border-kh-orange bg-kh-raised p-8 shadow-[0_28px_80px_rgba(0,0,0,0.7)] ring-1 ring-white/10 outline-none transition-all duration-200 data-[ending-style]:scale-[0.97] data-[ending-style]:opacity-0 data-[starting-style]:scale-[0.97] data-[starting-style]:opacity-0 sm:p-10',
          className,
        )}
        {...props}
      >
        {children}
        <BaseDialog.Close className="absolute top-4 right-4 grid size-12 place-items-center rounded-kh-pill bg-white/8 text-kh-paper transition-transform active:scale-90">
          <X className="size-5" strokeWidth={2.25} />
          <span className="sr-only">Schließen</span>
        </BaseDialog.Close>
      </BaseDialog.Popup>
    </BaseDialog.Portal>
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof BaseDialog.Title>) {
  return <BaseDialog.Title className={cn('kh-titel mb-4', className)} {...props} />
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof BaseDialog.Description>) {
  return (
    <BaseDialog.Description
      className={cn('text-[1.125rem] leading-[1.5] text-kh-paper/85', className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogDescription,
}
