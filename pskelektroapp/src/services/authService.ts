import type { Session } from '@supabase/supabase-js'
import { getSupabaseClient } from '../lib/supabase'
import type { UserRole } from '../types'

export const authService = {
  async signIn(email: string, password: string): Promise<void> {
    const db = getSupabaseClient()
    const { error } = await db.auth.signInWithPassword({ email, password })
    if (error) throw error
  },

  async signUp(email: string, password: string, fullName: string, role: UserRole): Promise<void> {
    const db = getSupabaseClient()
    const { data, error } = await db.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role } },
    })
    if (error) throw error

    if (data.user) {
      const { error: profileError } = await db.from('users').upsert({
        id: data.user.id,
        email,
        full_name: fullName,
        role,
      })
      if (profileError) throw profileError
    }
  },

  async signOut(): Promise<void> {
    const db = getSupabaseClient()
    const { error } = await db.auth.signOut()
    if (error) throw error
  },

  async getSession(): Promise<Session | null> {
    const db = getSupabaseClient()
    const { data, error } = await db.auth.getSession()
    if (error) throw error
    return data.session
  },
}
