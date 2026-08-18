import type {
  EventType,
  LegacyProjectStatus,
  LegacyUserRole,
  ProjectPriority,
  TaskPriority,
  TaskStatus,
} from '../types/legacy'

export const roles: LegacyUserRole[] = ['Projektový manažér', 'Elektrikár', 'Pomocník']
export const projectStatuses: LegacyProjectStatus[] = ['Plánované', 'Prebieha', 'Dokončené', 'Archivované']
export const projectPriorities: ProjectPriority[] = ['Nízka', 'Stredná', 'Vysoká']
export const taskStatuses: TaskStatus[] = ['Nové', 'Prebieha', 'Hotové', 'Zrušené']
export const taskPriorities: TaskPriority[] = ['Nízka', 'Stredná', 'Vysoká']
export const eventTypes: EventType[] = ['Montáž', 'Obhliadka', 'Stretnutie', 'Termín', 'Revízia']

export const todayIso = () => new Date().toISOString().slice(0, 10)

export const formatDate = (value: string) => new Date(value).toLocaleDateString('sk-SK')

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('sk-SK', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value)
