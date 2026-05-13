import { getSupabaseClient } from '../lib/supabase'
import type { ProjectNote, ProjectPhoto } from '../types'

export interface NoteInput {
  title: string
  content: string
  missingItems: string
  problem: string
  orderItems: string
}

export const projectDetailService = {
  async listNotes(projectId: string): Promise<ProjectNote[]> {
    const db = getSupabaseClient()
    const { data, error } = await db
      .from('project_notes')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
    if (error) throw error

    return (data ?? []).map((row) => ({
      id: row.id,
      projectId: row.project_id,
      title: row.title,
      content: row.content,
      missingItems: row.missing_items ?? '',
      problem: row.problem ?? '',
      orderItems: row.order_items ?? '',
      authorId: row.author_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at ?? row.created_at,
    }))
  },

  async listPhotos(projectId: string): Promise<ProjectPhoto[]> {
    const db = getSupabaseClient()
    const { data, error } = await db
      .from('project_photos')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
    if (error) throw error

    return (data ?? []).map((row) => ({
      id: row.id,
      projectId: row.project_id,
      title: row.title,
      url: row.url,
      fileType: row.file_type ?? (String(row.url).toLowerCase().includes('.pdf') ? 'document' : 'image'),
      createdAt: row.created_at,
    }))
  },

  async uploadFile(projectId: string, file: File): Promise<void> {
    const db = getSupabaseClient()
    const safeName = file.name.replace(/[^\w.-]+/g, '-')
    const filePath = `${projectId}/${Date.now()}-${safeName}`
    const { error } = await db.storage.from('project-photos').upload(filePath, file, { upsert: false })
    if (error) throw error

    const { data: publicFile } = db.storage.from('project-photos').getPublicUrl(filePath)
    const { error: insertError } = await db.from('project_photos').insert({
      project_id: projectId,
      title: file.name,
      url: publicFile.publicUrl,
      file_type: file.type.startsWith('image/') ? 'image' : 'document',
    })
    if (insertError) throw insertError
  },

  async createNote(projectId: string, input: NoteInput): Promise<void> {
    const db = getSupabaseClient()
    const { data: userData } = await db.auth.getUser()
    const { error } = await db.from('project_notes').insert({
      project_id: projectId,
      title: input.title,
      content: input.content,
      missing_items: input.missingItems,
      problem: input.problem,
      order_items: input.orderItems,
      author_id: userData.user?.id ?? null,
    })
    if (error) throw error
  },
}
