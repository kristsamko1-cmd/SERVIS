import { getSupabaseClient } from '../lib/supabase'
import type { Project, ProjectPriority, ProjectStatus } from '../types'

type ProjectRow = {
  id: string
  name: string
  address: string
  investor?: string | null
  description?: string | null
  status: ProjectStatus
  priority?: ProjectPriority | null
  progress: number
  budget?: number | null
  deadline: string
  notes?: string | null
  created_at?: string | null
  updated_at: string
  archived_at?: string | null
  created_by?: string | null
  project_workers?: { user_id: string }[]
  tasks?: { id: string; status: string }[]
}

/** DB deployments without extended columns (investor, archived_at, …) return PostgREST/Postgres errors. */
function isRestSchemaColumnError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const e = error as { code?: string; message?: string }
  if (e.code === '42703') return true
  const msg = (e.message ?? '').toLowerCase()
  return (
    (msg.includes('column') && (msg.includes('does not exist') || msg.includes('neexistuje'))) ||
    msg.includes('could not find') ||
    msg.includes('schema cache')
  )
}

function mapProject(row: ProjectRow): Project {
  const tasks = row.tasks ?? []

  return {
    id: row.id,
    name: row.name,
    address: row.address,
    investor: row.investor ?? '',
    description: row.description ?? '',
    status: row.status,
    priority: row.priority ?? 'Stredná',
    progress: row.progress,
    budget: row.budget ?? 0,
    deadline: row.deadline,
    notes: row.notes ?? '',
    workerIds: (row.project_workers ?? []).map((worker) => worker.user_id),
    taskCount: tasks.length,
    completedTaskCount: tasks.filter((task) => task.status === 'Hotové').length,
    lastActivityAt: row.updated_at,
    createdAt: row.created_at ?? row.updated_at,
    updatedAt: row.updated_at,
    archivedAt: row.archived_at,
    createdBy: row.created_by,
  }
}

export type ProjectInput = Omit<
  Project,
  'id' | 'createdAt' | 'updatedAt' | 'lastActivityAt' | 'taskCount' | 'completedTaskCount'
>

export const projectService = {
  async list(includeArchived = false): Promise<Project[]> {
    const db = getSupabaseClient()
    const { data, error } = await db
      .from('projects')
      .select('*, project_workers(user_id), tasks(id, status)')
      .order('updated_at', { ascending: false })
    if (error) throw error
    let rows = (data ?? []) as ProjectRow[]
    if (!includeArchived) {
      rows = rows.filter((row) => row.archived_at == null)
    }
    return rows.map((row) => mapProject(row))
  },

  async create(project: ProjectInput): Promise<void> {
    const db = getSupabaseClient()
    const { data: userData } = await db.auth.getUser()
    const fullRow = {
      name: project.name,
      address: project.address,
      investor: project.investor,
      description: project.description,
      status: project.status,
      priority: project.priority,
      progress: project.progress,
      budget: project.budget,
      deadline: project.deadline,
      notes: project.notes,
      created_by: userData.user?.id ?? null,
    }
    let { data, error } = await db.from('projects').insert(fullRow).select('id').single()
    if (error && isRestSchemaColumnError(error)) {
      const retry = await db
        .from('projects')
        .insert({
          name: project.name,
          address: project.address,
          status: project.status,
          progress: project.progress,
          deadline: project.deadline,
        })
        .select('id')
        .single()
      data = retry.data
      error = retry.error
    }
    if (error) throw error
    if (!data?.id) throw new Error('Nepodarilo sa získať ID novej stavby.')

    if (project.workerIds.length > 0) {
      const { error: workerError } = await db.from('project_workers').insert(
        project.workerIds.map((userId) => ({
          project_id: data.id,
          user_id: userId,
        })),
      )
      if (workerError) throw workerError
    }
  },

  async update(projectId: string, payload: Partial<ProjectInput>): Promise<void> {
    const db = getSupabaseClient()
    const updatedAt = new Date().toISOString()
    const fullPatch: Record<string, unknown> = {
      updated_at: updatedAt,
      ...(payload.name !== undefined && { name: payload.name }),
      ...(payload.address !== undefined && { address: payload.address }),
      ...(payload.investor !== undefined && { investor: payload.investor }),
      ...(payload.description !== undefined && { description: payload.description }),
      ...(payload.status !== undefined && { status: payload.status }),
      ...(payload.priority !== undefined && { priority: payload.priority }),
      ...(payload.progress !== undefined && { progress: payload.progress }),
      ...(payload.budget !== undefined && { budget: payload.budget }),
      ...(payload.deadline !== undefined && { deadline: payload.deadline }),
      ...(payload.notes !== undefined && { notes: payload.notes }),
    }
    let { error } = await db.from('projects').update(fullPatch).eq('id', projectId)
    if (error && isRestSchemaColumnError(error)) {
      const minimalPatch: Record<string, unknown> = { updated_at: updatedAt }
      if (payload.name !== undefined) minimalPatch.name = payload.name
      if (payload.address !== undefined) minimalPatch.address = payload.address
      if (payload.status !== undefined) minimalPatch.status = payload.status
      if (payload.progress !== undefined) minimalPatch.progress = payload.progress
      if (payload.deadline !== undefined) minimalPatch.deadline = payload.deadline
      const retry = await db.from('projects').update(minimalPatch).eq('id', projectId)
      error = retry.error
    }
    if (error) throw error

    if (payload.workerIds) {
      const { error: deleteError } = await db.from('project_workers').delete().eq('project_id', projectId)
      if (deleteError) throw deleteError

      if (payload.workerIds.length > 0) {
        const { error: workerError } = await db.from('project_workers').insert(
          payload.workerIds.map((userId) => ({
            project_id: projectId,
            user_id: userId,
          })),
        )
        if (workerError) throw workerError
      }
    }
  },

  async archive(projectId: string): Promise<void> {
    const db = getSupabaseClient()
    const updatedAt = new Date().toISOString()
    const { error } = await db
      .from('projects')
      .update({ archived_at: new Date().toISOString(), status: 'Dokončené', updated_at: updatedAt })
      .eq('id', projectId)
    if (error && isRestSchemaColumnError(error)) {
      const { error: e2 } = await db
        .from('projects')
        .update({ status: 'Dokončené', updated_at: updatedAt })
        .eq('id', projectId)
      if (e2) throw e2
    } else if (error) {
      throw error
    }
  },

  async remove(projectId: string): Promise<void> {
    const db = getSupabaseClient()
    const { error } = await db.from('projects').delete().eq('id', projectId)
    if (error) throw error
  },

  async getById(projectId: string): Promise<Project | null> {
    const db = getSupabaseClient()
    const { data, error } = await db
      .from('projects')
      .select('*, project_workers(user_id), tasks(id, status)')
      .eq('id', projectId)
      .maybeSingle()
    if (error) throw error
    return data ? mapProject(data as ProjectRow) : null
  },
}
