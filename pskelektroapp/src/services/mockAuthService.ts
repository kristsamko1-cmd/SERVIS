import type { UserRole } from '@/types/entities'

const MOCK_SESSION_KEY = 'fleet_mock_session'

export interface MockSession {
  user: {
    id: string
    email: string
    user_metadata: { full_name: string; role: UserRole }
  }
}

export interface MockProfile {
  id: string
  email: string
  name: string
  role: UserRole
}

const demoUsers: MockProfile[] = [
  { id: 'user-admin', email: 'admin@pskelektro.sk', name: 'Lucia Molnárová', role: 'Administrátor' },
  { id: 'user-pm', email: 'pm@pskelektro.sk', name: 'Peter Novák', role: 'Projektový manažér' },
  { id: 'user-tech', email: 'tech@pskelektro.sk', name: 'Martin Horváth', role: 'Technik' },
  { id: 'user-lead', email: 'lead@pskelektro.sk', name: 'Michal Štúr', role: 'Vedúci montáže' },
]

function toSession(profile: MockProfile): MockSession {
  return {
    user: {
      id: profile.id,
      email: profile.email,
      user_metadata: { full_name: profile.name, role: profile.role },
    },
  }
}

export const mockAuthService = {
  async getSession(): Promise<MockSession | null> {
    const raw = localStorage.getItem(MOCK_SESSION_KEY)
    if (!raw) return null
    try {
      return JSON.parse(raw) as MockSession
    } catch {
      return null
    }
  },

  async signIn(email: string, _password: string): Promise<MockSession> {
    const profile = demoUsers.find((u) => u.email === email) ?? {
      id: `user-${Date.now()}`,
      email,
      name: email.split('@')[0] ?? 'Používateľ',
      role: 'Technik' as UserRole,
    }
    const session = toSession(profile)
    localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(session))
    return session
  },

  async signUp(email: string, _password: string, fullName: string, role: UserRole): Promise<MockSession> {
    const profile: MockProfile = { id: `user-${Date.now()}`, email, name: fullName, role }
    const session = toSession(profile)
    localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(session))
    return session
  },

  async signOut(): Promise<void> {
    localStorage.removeItem(MOCK_SESSION_KEY)
  },

  getProfileFromSession(session: MockSession): MockProfile {
    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.user_metadata.full_name,
      role: session.user.user_metadata.role,
    }
  },
}

export const userRoles: UserRole[] = ['Administrátor', 'Projektový manažér', 'Technik', 'Vedúci montáže']
