import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: string
  description?: string
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <header className={cn('flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8', className)}>
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
        {description ? <p className="text-muted mt-1 text-sm sm:text-base">{description}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2 flex-wrap">{actions}</div> : null}
    </header>
  )
}

export function StatCard({
  label,
  value,
  icon,
  trend,
  delay = 0,
}: {
  label: string
  value: string | number
  icon: React.ReactNode
  trend?: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="glass-card rounded-xl p-5 group hover:border-primary/20 transition-all"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">{label}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {trend ? <p className="text-xs text-muted mt-1">{trend}</p> : null}
        </div>
        <div className="p-2.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/15 transition-colors">
          {icon}
        </div>
      </div>
    </motion.div>
  )
}
