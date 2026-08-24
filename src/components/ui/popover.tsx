import { Popover as BasePopover } from '@base-ui/react/popover'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Das Glossar-Popover hinter jedem `<Begriff>`. Ein Dialog wäre für eine
 * zweizeilige Erklärung zu schwer — sie soll neben dem Wort stehen, nicht den
 * Screen übernehmen.
 *
 * **Es muss aussehen, als hinge es am Wort.** Die erste Fassung war eine
 * hellgraue Platte ohne Spitze: sie öffnete sich irgendwo neben dem Absatz,
 * auf M1 halb über den Bildschirmrand hinaus und quer über die Checkliste, die
 * sie erklären sollte. Nichts zeigte auf den Begriff, nichts sagte, wie man
 * sie wieder loswird, und sie war die einzige Fläche im ganzen System, die
 * *heller* ist als ihre Umgebung.
 *
 * Deshalb jetzt:
 *
 *  - **Ein Zeiger.** `BasePopover.Arrow` sitzt am Rand und dreht sich mit der
 *    Seite, auf der geöffnet wird. Ohne ihn ist ein Popover eine Karte, die
 *    zufällig erschienen ist.
 *  - **Derselbe Grund wie das Panel** (`kh-panel`, dunkel mit Lichtkante oben)
 *    statt `kh-raised`. Getrennt wird durch die Kante und den Schatten, nicht
 *    dadurch, dass die Erklärung heller leuchtet als der Screen.
 *  - **Ein Schließer.** Am Messestand probiert niemand aus, ob ein Tap
 *    daneben etwas schließt.
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
        // `collisionPadding`: die Platte darf nicht mehr bis an die
        // Bildschirmkante rutschen. Auf M1 hing sie dort halb im Nichts.
        collisionPadding={16}
        className="z-50 max-w-[min(24rem,86vw)]"
      >
        <BasePopover.Popup
          className={cn(
            'kh-panel relative p-5 pr-12 shadow-[0_18px_50px_rgba(0,0,0,0.65)] outline-none ring-1 ring-white/10',
            'transition-all duration-150 data-[ending-style]:scale-[0.97] data-[ending-style]:opacity-0 data-[starting-style]:scale-[0.97] data-[starting-style]:opacity-0',
            className,
          )}
          {...props}
        >
          {/* Die Spitze zeigt **zum Anker**. `data-side` ist die Seite, auf
              der die Platte steht: `bottom` = darunter, die Spitze zeigt also
              nach oben — und das ist die Ausrichtung des Pfads. */}
          <BasePopover.Arrow className="data-[side=left]:rotate-90 data-[side=right]:-rotate-90 data-[side=top]:rotate-180">
            <svg width="20" height="10" viewBox="0 0 20 10" fill="none" aria-hidden>
              <path d="M0 10 L10 0 L20 10 Z" fill="#0E0D0B" fillOpacity="0.9" />
              <path d="M0 10 L10 0 L20 10" stroke="rgb(255 255 255 / 0.14)" />
            </svg>
          </BasePopover.Arrow>
          {children}
          {/* Der Schließer steht **hinter** dem Inhalt im DOM. Davor bekam er
              beim Öffnen den Fokus, und weil der Fokusring des Systems
              Signalfarbe ist, öffnete jedes Glossar mit einem grün
              umrandeten X — auf einem Touchgerät ein Zustand ohne Anlass. */}
          <BasePopover.Close
            aria-label="Schließen"
            className="absolute top-2.5 right-2.5 grid size-9 place-items-center rounded-kh-pill text-kh-mute transition-transform active:scale-90 active:text-kh-paper"
          >
            <X className="size-4.5" strokeWidth={2.25} />
          </BasePopover.Close>
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
