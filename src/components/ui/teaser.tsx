import { cn } from '@/lib/utils'

/**
 * The site's teaser unit: letterbox photo (3.84:1, square corners),
 * bold grey heading, light body copy, orange button.
 * Teen adjustment: the photo zooms slightly on hover.
 */
function Teaser({ className, ...props }: React.ComponentProps<'article'>) {
  return <article className={cn('group flex flex-col', className)} {...props} />
}

function TeaserImage({
  src,
  alt,
  className,
}: {
  src: string
  alt: string
  className?: string
}) {
  return (
    <div className={cn('mb-5 overflow-hidden bg-kh-band-soft', className)}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="aspect-[384/100] w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04] dark:brightness-90"
      />
    </div>
  )
}

function TeaserTitle({ className, ...props }: React.ComponentProps<'h2'>) {
  return <h2 className={cn('kh-h2 mb-2', className)} {...props} />
}

function TeaserBody({ className, ...props }: React.ComponentProps<'p'>) {
  return <p className={cn('mb-4 font-light', className)} {...props} />
}

export { Teaser, TeaserImage, TeaserTitle, TeaserBody }
