import { cn } from '@/lib/utils'

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition-colors',
        className,
      )}
      {...props}
    />
  )
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const colors: Record<string, string> = {
    Voľné: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    Rezervované: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    'Na stavbe': 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    'V servise': 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    Stratené: 'bg-red-500/15 text-red-400 border-red-500/30',
    Aktívna: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    Aktívne: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    Realizácia: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    Príprava: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    Dokončené: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    Pozastavené: 'bg-red-500/15 text-red-400 border-red-500/30',
    Priradené: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    Servis: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    Kalibrácia: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    Aktívny: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  }
  return <Badge className={cn(colors[status] ?? 'bg-surface-elevated text-muted border-border', className)}>{status}</Badge>
}
