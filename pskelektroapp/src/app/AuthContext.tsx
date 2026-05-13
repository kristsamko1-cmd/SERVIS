/* eslint-disable react-refresh/only-export-components */
import type { Session } from '@supabase/supabase-js'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getSupabaseClient } from '../lib/supabase'
import { authService } from '../services/authService'
import { userService } from '../services/userService'
import type { UserProfile } from '../types'

interface AuthContextValue {
  session: Session | null
  profile: UserProfile | null
  loading: boolean
  isManager: boolean
  canEdit: boolean
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function fallbackProfile(session: Session): UserProfile {
  return {
    id: session.user.id,
    email: session.user.email ?? '',
    name: (session.user.user_metadata.full_name as string | undefined) ?? 'Používateľ',
    role: 'Projektový manažér',
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshProfile = async () => {
    const nextSession = await authService.getSession()
    setSession(nextSession)
    if (nextSession?.user.id) {
      const nextProfile = await userService.getCurrentProfile(nextSession.user.id)
      setProfile(nextProfile ?? fallbackProfile(nextSession))
    } else {
      setProfile(null)
    }
  }

  useEffect(() => {
    void Promise.resolve().then(() => refreshProfile().finally(() => setLoading(false)))

    const db = getSupabaseClient()
    const { data } = db.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession)
      if (nextSession?.user.id) {
        const nextProfile = await userService.getCurrentProfile(nextSession.user.id)
        setProfile(nextProfile ?? fallbackProfile(nextSession))
      } else {
        setProfile(null)
      }
    })

    return () => {
      data.subscription.unsubscribe()
    }
  }, [])

  const value = useMemo(
    () => ({
      session,
      profile,
      loading,
      isManager: profile?.role === 'Projektový manažér',
      canEdit: Boolean(profile),
      refreshProfile,
    }),
    [loading, profile, session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth musí byť použitý vo vnútri AuthProvider')
  }
  return context
}
