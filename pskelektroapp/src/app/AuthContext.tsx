/* eslint-disable react-refresh/only-export-components */
import type { Session } from '@supabase/supabase-js'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
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

  const refreshProfile = useCallback(async () => {
    const nextSession = await authService.getSession()
    setSession(nextSession)
    if (nextSession?.user.id) {
      setProfile(fallbackProfile(nextSession))
      void userService
        .getCurrentProfile(nextSession.user.id)
        .then((nextProfile) => setProfile(nextProfile ?? fallbackProfile(nextSession)))
        .catch(() => setProfile(fallbackProfile(nextSession)))
    } else {
      setProfile(null)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    const db = getSupabaseClient()

    const loadPublicProfile = (nextSession: Session) => {
      void userService
        .getCurrentProfile(nextSession.user.id)
        .then((nextProfile) => {
          if (!cancelled) setProfile(nextProfile ?? fallbackProfile(nextSession))
        })
        .catch(() => {
          if (!cancelled) setProfile(fallbackProfile(nextSession))
        })
    }

    const { data } = db.auth.onAuthStateChange((_event, nextSession) => {
      if (cancelled) return
      setSession(nextSession)
      if (nextSession?.user.id) {
        setProfile(fallbackProfile(nextSession))
        loadPublicProfile(nextSession)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    const safety = window.setTimeout(() => {
      if (!cancelled) setLoading(false)
    }, 12_000)

    return () => {
      cancelled = true
      window.clearTimeout(safety)
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
    [loading, profile, session, refreshProfile],
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
