import type { EventType, ProjectPriority, ProjectStatus, TaskPriority, TaskStatus, UserRole } from '../types'

export const roles: UserRole[] = ['Projektový manažér', 'Elektrikár', 'Pomocník']
export const projectStatuses: ProjectStatus[] = ['Plánované', 'Rozpracované', 'Čaká sa', 'Dokončené']
export const projectPriorities: ProjectPriority[] = ['Nízka', 'Stredná', 'Vysoká']
export const taskStatuses: TaskStatus[] = ['Na spravenie', 'Rozpracované', 'Čaká sa', 'Hotové']
export const taskPriorities: TaskPriority[] = ['Nízka', 'Stredná', 'Vysoká']
export const eventTypes: EventType[] = ['Montáž', 'Obhliadka', 'Stretnutie', 'Termín', 'Revízia']

export const todayIso = () => new Date().toISOString().slice(0, 10)

export const formatDate = (value: string) => new Date(value).toLocaleDateString('sk-SK')

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('sk-SK', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value)
