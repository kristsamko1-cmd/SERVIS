/** @deprecated Legacy types for Supabase services — will be migrated to entities */

export type LegacyUserRole = 'Projektový manažér' | 'Elektrikár' | 'Pomocník'

export interface UserProfile {
  id: string
  email: string
  name: string
  role: LegacyUserRole
}

export interface Worker {
  id: string
  name: string
  email: string
  role: LegacyUserRole
}

export type LegacyProjectStatus = 'Plánované' | 'Prebieha' | 'Dokončené' | 'Archivované'
export type ProjectPriority = 'Nízka' | 'Stredná' | 'Vysoká'
export type TaskStatus = 'Nové' | 'Prebieha' | 'Hotové' | 'Zrušené'
export type TaskPriority = 'Nízka' | 'Stredná' | 'Vysoká'
export type EventType = 'Montáž' | 'Obhliadka' | 'Stretnutie' | 'Termín' | 'Revízia'

export interface LegacyProject {
  id: string
  name: string
  address: string
  client: string
  status: LegacyProjectStatus
  priority: ProjectPriority
  progress: number
  startDate: string
  endDate: string
  managerId: string
  archived: boolean
  createdAt: string
  updatedAt: string
}

export interface Task {
  id: string
  projectId: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  assigneeId: string | null
  deadline: string
  urgent: boolean
  createdAt: string
  updatedAt: string
}

export interface TaskUpdate {
  id: string
  taskId: string
  authorId: string
  content: string
  createdAt: string
}

export interface CalendarEvent {
  id: string
  title: string
  type: EventType
  date: string
  projectId: string | null
  description: string
  createdAt: string
}

export interface ProjectNote {
  id: string
  projectId: string
  authorId: string
  content: string
  createdAt: string
}

export interface ProjectPhoto {
  id: string
  projectId: string
  url: string
  caption: string
  uploadedAt: string
}
