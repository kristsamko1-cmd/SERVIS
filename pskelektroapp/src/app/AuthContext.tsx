/* eslint-disable react-refresh/only-export-components */
import type { Session } from '@supabase/supabase-js'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { hasSupabaseConfig } from '@/lib/supabase'
import { authService } from '@/services/authService'
import { mockAuthService, type MockSession } from '@/services/mockAuthService'
import { userService } from '@/services/userService'
import type { UserRole } from '@/types/entities'

export interface AuthProfile {
  id: string
  email: string
  name: string
  role: UserRole
}

interface AuthContextValue {
  session: Session | MockSession | null
  profile: AuthProfile | null
  loading: boolean
  isManager: boolean
  isAdmin: boolean
  canEdit: boolean
  refreshProfile: () => Promise<void>
  isMockMode: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

function fallbackProfile(session: Session | MockSession): AuthProfile {
  const meta = session.user.user_metadata as { full_name?: string; role?: UserRole }
  return {
    id: session.user.id,
    email: session.user.email ?? '',
    name: meta.full_name ?? 'Používateľ',
    role: meta.role ?? 'Technik',
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | MockSession | null>(null)
  const [profile, setProfile] = useState<AuthProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const isMockMode = !hasSupabaseConfig

  const refreshProfile = useCallback(async () => {
    if (isMockMode) {
      const nextSession = await mockAuthService.getSession()
      setSession(nextSession)
      setProfile(nextSession ? mockAuthService.getProfileFromSession(nextSession) : null)
      return
    }

    const nextSession = await authService.getSession()
    setSession(nextSession)
    if (nextSession?.user.id) {
      setProfile(fallbackProfile(nextSession))
      void userService
        .getCurrentProfile(nextSession.user.id)
        .then((nextProfile) => {
          if (nextProfile) {
            setProfile({
              id: nextProfile.id,
              email: nextProfile.email,
              name: nextProfile.name,
              role: nextProfile.role as UserRole,
            })
          }
        })
        .catch(() => setProfile(fallbackProfile(nextSession)))
    } else {
      setProfile(null)
    }
  }, [isMockMode])

  useEffect(() => {
    let cancelled = false

    if (isMockMode) {
      void mockAuthService.getSession().then((nextSession) => {
        if (cancelled) return
        setSession(nextSession)
        setProfile(nextSession ? mockAuthService.getProfileFromSession(nextSession) : null)
        setLoading(false)
      })
      return () => {
        cancelled = true
      }
    }

    void import('@/lib/supabase').then(({ getSupabaseClient }) => {
      const db = getSupabaseClient()
      const { data } = db.auth.onAuthStateChange((_event, nextSession) => {
        if (cancelled) return
        setSession(nextSession)
        if (nextSession?.user.id) {
          setProfile(fallbackProfile(nextSession))
          void userService
            .getCurrentProfile(nextSession.user.id)
            .then((nextProfile) => {
              if (!cancelled && nextProfile) {
                setProfile({
                  id: nextProfile.id,
                  email: nextProfile.email,
                  name: nextProfile.name,
                  role: nextProfile.role as UserRole,
                })
              }
            })
            .catch(() => {
              if (!cancelled) setProfile(fallbackProfile(nextSession))
            })
        } else {
          setProfile(null)
        }
        setLoading(false)
      })

      return () => {
        cancelled = true
        data.subscription.unsubscribe()
      }
    })

    const safety = window.setTimeout(() => {
      if (!cancelled) setLoading(false)
    }, 12_000)

    return () => {
      cancelled = true
      window.clearTimeout(safety)
    }
  }, [isMockMode])

  const value = useMemo(
    () => ({
      session,
      profile,
      loading,
      isManager: profile?.role === 'Projektový manažér' || profile?.role === 'Administrátor',
      isAdmin: profile?.role === 'Administrátor',
      canEdit: Boolean(profile),
      refreshProfile,
      isMockMode,
    }),
    [loading, profile, session, refreshProfile, isMockMode],
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
