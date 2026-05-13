import { getSupabaseClient } from '../lib/supabase'
import type { Task, TaskPriority, TaskStatus, TaskUpdate } from '../types'

type TaskRow = {
  id: string
  project_id: string
  title: string
  description: string
  assigned_user_id?: string | null
  priority: TaskPriority
  status: TaskStatus
  deadline: string
  progress: number
  comments_count?: number | null
  pinned?: boolean | null
  urgent?: boolean | null
  created_by?: string | null
  created_at?: string | null
  updated_at?: string | null
}

function mapTask(row: TaskRow): Task {
  return {
    id: row.id,
    projectId: row.project_id,
    title: row.title,
    description: row.description,
    assignedUserId: row.assigned_user_id,
    priority: row.priority,
    status: row.status,
    deadline: row.deadline,
    progress: row.progress,
    commentsCount: row.comments_count ?? 0,
    pinned: row.pinned ?? false,
    urgent: row.urgent ?? false,
    createdBy: row.created_by,
    createdAt: row.created_at ?? '',
    updatedAt: row.updated_at ?? row.created_at ?? '',
  }
}

export type TaskInput = Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>

export const taskService = {
  async list(): Promise<Task[]> {
    const db = getSupabaseClient()
    const { data, error } = await db
      .from('tasks')
      .select('*')
      .is('deleted_at', null)
      .order('pinned', { ascending: false })
      .order('deadline', { ascending: true })
    if (error) throw error
    return (data ?? []).map((row) => mapTask(row as TaskRow))
  },

  async listUpdates(): Promise<TaskUpdate[]> {
    const db = getSupabaseClient()
    const { data, error } = await db.from('task_updates').select('*').order('created_at', { ascending: false })
    if (error) throw error

    return (data ?? []).map((row) => ({
      id: row.id,
      taskId: row.task_id,
      message: row.message,
      createdAt: row.created_at,
    }))
  },

  async create(task: TaskInput): Promise<void> {
    const db = getSupabaseClient()
    const { data: userData } = await db.auth.getUser()
    const { error } = await db.from('tasks').insert({
      project_id: task.projectId,
      title: task.title,
      description: task.description,
      assigned_user_id: task.assignedUserId,
      priority: task.priority,
      status: task.status,
      deadline: task.deadline,
      progress: task.progress,
      comments_count: task.commentsCount,
      pinned: task.pinned,
      urgent: task.urgent,
      created_by: userData.user?.id ?? null,
    })
    if (error) throw error
  },

  async update(taskId: string, payload: Partial<TaskInput>): Promise<void> {
    const db = getSupabaseClient()
    const { error } = await db
      .from('tasks')
      .update({
        title: payload.title,
        description: payload.description,
        assigned_user_id: payload.assignedUserId,
        priority: payload.priority,
        status: payload.status,
        deadline: payload.deadline,
        progress: payload.progress,
        comments_count: payload.commentsCount,
        pinned: payload.pinned,
        urgent: payload.urgent,
        updated_at: new Date().toISOString(),
      })
      .eq('id', taskId)
    if (error) throw error

    if (payload.status || typeof payload.progress === 'number') {
      await this.addUpdate(taskId, `Aktualizácia úlohy: ${payload.status ?? ''} ${payload.progress ?? ''}%`.trim())
    }
  },

  async addUpdate(taskId: string, message: string): Promise<void> {
    const db = getSupabaseClient()
    const { error } = await db.from('task_updates').insert({ task_id: taskId, message })
    if (error) throw error
  },

  async remove(taskId: string): Promise<void> {
    const db = getSupabaseClient()
    const { error } = await db.from('tasks').update({ deleted_at: new Date().toISOString() }).eq('id', taskId)
    if (error) throw error
  },

  async listByProject(projectId: string): Promise<Task[]> {
    const db = getSupabaseClient()
    const { data, error } = await db
      .from('tasks')
      .select('*')
      .eq('project_id', projectId)
      .is('deleted_at', null)
      .order('pinned', { ascending: false })
      .order('deadline', { ascending: true })
    if (error) throw error
    return (data ?? []).map((row) => mapTask(row as TaskRow))
  },

  async listUpdatesByProject(projectId: string): Promise<TaskUpdate[]> {
    const db = getSupabaseClient()
    const { data, error } = await db
      .from('task_updates')
      .select('id, task_id, message, created_at, tasks!inner(project_id)')
      .eq('tasks.project_id', projectId)
      .order('created_at', { ascending: false })
    if (error) throw error

    return (data ?? []).map((row) => ({
      id: row.id,
      taskId: row.task_id,
      message: row.message,
      createdAt: row.created_at,
    }))
  },
}
