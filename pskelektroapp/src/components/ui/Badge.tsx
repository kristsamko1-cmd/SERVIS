import type { ProjectPriority, ProjectStatus, TaskPriority, TaskStatus } from '../../types'

type BadgeVariant = ProjectStatus | TaskStatus | TaskPriority | ProjectPriority | 'Info' | 'Urgentné'

interface BadgeProps {
  value: BadgeVariant
}

const variantClassMap: Record<BadgeVariant, string> = {
  Plánované: 'badge-info',
  Rozpracované: 'badge-primary',
  'Čaká sa': 'badge-warning',
  Dokončené: 'badge-success',
  'Na spravenie': 'badge-info',
  Hotové: 'badge-success',
  Nízka: 'badge-success',
  Stredná: 'badge-warning',
  Vysoká: 'badge-danger',
  Urgentné: 'badge-danger',
  Info: 'badge-info',
}

export function Badge({ value }: BadgeProps) {
  return <span className={`badge ${variantClassMap[value]}`}>{value}</span>
}
