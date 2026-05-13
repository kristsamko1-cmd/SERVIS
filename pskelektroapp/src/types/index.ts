export type UserRole = 'Projektový manažér' | 'Elektrikár' | 'Pomocník'
export type ProjectStatus = 'Plánované' | 'Rozpracované' | 'Čaká sa' | 'Dokončené'
export type ProjectPriority = 'Nízka' | 'Stredná' | 'Vysoká'
export type TaskStatus = 'Na spravenie' | 'Rozpracované' | 'Čaká sa' | 'Hotové'
export type TaskPriority = 'Nízka' | 'Stredná' | 'Vysoká'
export type EventType = 'Montáž' | 'Obhliadka' | 'Stretnutie' | 'Termín' | 'Revízia'

export interface Worker {
  id: string
  email: string
  name: string
  role: UserRole
  online?: boolean
}

export type UserProfile = Worker

export interface Project {
  id: string
  name: string
  address: string
  investor: string
  description: string
  status: ProjectStatus
  priority: ProjectPriority
  progress: number
  budget: number
  deadline: string
  notes: string
  workerIds: string[]
  taskCount: number
  completedTaskCount: number
  lastActivityAt: string
  createdAt: string
  updatedAt: string
  archivedAt?: string | null
  createdBy?: string | null
}

export interface Task {
  id: string
  projectId: string
  title: string
  description: string
  assignedUserId?: string | null
  priority: TaskPriority
  status: TaskStatus
  deadline: string
  progress: number
  commentsCount: number
  pinned: boolean
  urgent: boolean
  createdBy?: string | null
  createdAt: string
  updatedAt: string
}

export interface TaskUpdate {
  id: string
  taskId: string
  message: string
  createdAt: string
}

export interface ProjectNote {
  id: string
  projectId: string
  title: string
  content: string
  missingItems: string
  problem: string
  orderItems: string
  authorId?: string | null
  createdAt: string
  updatedAt: string
}

export interface ProjectPhoto {
  id: string
  projectId: string
  title: string
  url: string
  fileType: 'image' | 'document'
  createdAt: string
}

export interface CalendarEvent {
  id: string
  projectId?: string | null
  title: string
  type: EventType
  date: string
  location: string
  createdAt: string
}

export interface ActivityItem {
  id: string
  title: string
  description: string
  createdAt: string
}
