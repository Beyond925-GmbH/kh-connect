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
 *    zufällig erschienen ist. Base UI setzt nur die Position **entlang** der
 *    Kante — an welcher Kante die Spitze klebt, müssen die
 *    `data-side`-Klassen sagen, sonst rendert sie oben links mitten im Titel
 *    (so gesehen auf A2 und M3). Kann sie nach einer Kollisions-Verschiebung
 *    nicht mehr auf den Begriff zeigen, wird sie ausgeblendet statt ins
 *    Leere zu deuten.
 *  - **Derselbe Grund wie das Panel** — dunkel, Lichtkante oben — aber
 *    **deckend** statt der 90 % + Blur von `kh-panel`: unter dem
 *    halbtransparenten Grund schimmerten Textfetzen der Karte durch, die das
 *    Popover gerade erklärt.
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
            'relative rounded-kh-lg border-t border-white/14 bg-[#12110e] p-5 pr-12 shadow-[0_18px_50px_rgba(0,0,0,0.65)] outline-none ring-1 ring-white/10',
            'transition-all duration-150 data-[ending-style]:scale-[0.97] data-[ending-style]:opacity-0 data-[starting-style]:scale-[0.97] data-[starting-style]:opacity-0',
            className,
          )}
          {...props}
        >
          {/* Die Spitze zeigt **zum Anker**. `data-side` ist die Seite, auf
              der die Platte steht: `bottom` = darunter, die Spitze zeigt also
              nach oben — und das ist die Ausrichtung des Pfads. Die
              Kanten-Offsets setzen sie **an** die dem Anker zugewandte Kante;
              Base UI liefert nur die Position entlang der Kante und clampt
              sie in die Platte. `data-uncentered` heißt: die geclampte
              Spitze zeigt nicht mehr auf den Begriff — dann lieber keine. */}
          <BasePopover.Arrow
            className={cn(
              'top-[-8px] data-[side=top]:top-auto data-[side=top]:bottom-[-8px] data-[side=top]:rotate-180',
              'data-[side=left]:top-auto data-[side=left]:right-[-13px] data-[side=left]:rotate-90',
              'data-[side=right]:top-auto data-[side=right]:left-[-13px] data-[side=right]:-rotate-90',
              'data-[uncentered]:invisible',
            )}
          >
            <svg width="20" height="10" viewBox="0 0 20 10" fill="none" aria-hidden>
              <path d="M0 10 L10 0 L20 10 Z" fill="#12110E" />
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
