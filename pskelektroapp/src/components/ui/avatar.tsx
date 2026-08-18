import { cn } from '@/lib/utils'

export function Avatar({
  name,
  src,
  size = 'md',
  className,
}: {
  name: string
  src?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-16 w-16 text-xl' }

  if (src) {
    return <img src={src} alt={name} className={cn('rounded-full object-cover', sizes[size], className)} />
  }

  return (
    <div
      className={cn(
        'rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/20 flex items-center justify-center font-semibold text-primary',
        sizes[size],
        className,
      )}
    >
      {initials}
    </div>
  )
}
