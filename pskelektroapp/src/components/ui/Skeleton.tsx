import { cn } from '@/lib/utils'

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('animate-pulse rounded-lg bg-surface-elevated/60', className)} {...props} />
}

export function LoadingState({ text = 'Načítavam...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
      <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      <p className="text-sm text-muted">{text}</p>
    </div>
  )
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon ? <div className="mb-4 text-muted">{icon}</div> : null}
      <h3 className="text-lg font-medium mb-1">{title}</h3>
      {description ? <p className="text-sm text-muted max-w-sm mb-4">{description}</p> : null}
      {action}
    </div>
  )
}
