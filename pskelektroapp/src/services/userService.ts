import { getSupabaseClient } from '../lib/supabase'
import type { UserProfile, Worker } from '../types'

type UserRow = {
  id: string
  email: string
  full_name: string
  role: UserProfile['role']
  updated_at?: string | null
}

function mapUser(row: UserRow): UserProfile {
  return {
    id: row.id,
    email: row.email,
    name: row.full_name,
    role: row.role,
    online: row.updated_at ? Date.now() - new Date(row.updated_at).getTime() < 1000 * 60 * 15 : false,
  }
}

export const userService = {
  async listWorkers(): Promise<Worker[]> {
    const db = getSupabaseClient()
    const { data, error } = await db
      .from('users')
      .select('id, email, full_name, role')
      .order('full_name', { ascending: true })
    if (error) throw error
    return (data ?? []).map(mapUser)
  },

  async getCurrentProfile(userId: string): Promise<UserProfile | null> {
    const db = getSupabaseClient()
    const { data, error } = await db
      .from('users')
      .select('id, email, full_name, role')
      .eq('id', userId)
      .maybeSingle()
    if (error) throw error
    return data ? mapUser(data) : null
  },
}
