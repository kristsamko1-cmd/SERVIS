import { Navigate, Outlet } from 'react-router-dom'
import { LoadingState } from '../components/ui/LoadingState'
import { useAuth } from './AuthContext'

export function RequireAuth() {
  const { session, loading } = useAuth()

  if (loading) return <LoadingState />
  if (!session) return <Navigate to="/prihlasenie" replace />

  return <Outlet />
}
