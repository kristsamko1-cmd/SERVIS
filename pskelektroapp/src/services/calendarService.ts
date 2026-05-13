import { getSupabaseClient } from '../lib/supabase'
import type { CalendarEvent, EventType } from '../types'

export const calendarService = {
  async list(): Promise<CalendarEvent[]> {
    const db = getSupabaseClient()
    const { data, error } = await db.from('calendar_events').select('*').order('date', { ascending: true })
    if (error) throw error

    return (data ?? []).map((row) => ({
      id: row.id,
      projectId: row.project_id ?? null,
      title: row.title,
      type: row.type as EventType,
      date: row.date,
      location: row.location,
      createdAt: row.created_at,
    }))
  },

  async create(event: Omit<CalendarEvent, 'id' | 'createdAt'>): Promise<void> {
    const db = getSupabaseClient()
    const { error } = await db.from('calendar_events').insert({
      project_id: event.projectId,
      title: event.title,
      type: event.type,
      date: event.date,
      location: event.location,
    })
    if (error) throw error
  },
}
