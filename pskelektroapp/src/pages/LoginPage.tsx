import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HardHat } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/app/AuthContext'
import { Button } from '@/components/ui/button'
import { Input, Label, Select } from '@/components/ui/input'
import { hasSupabaseConfig } from '@/lib/supabase'
import { authService } from '@/services/authService'
import { mockAuthService, userRoles } from '@/services/mockAuthService'
import type { UserRole } from '@/types/entities'

type Mode = 'login' | 'register'

export function LoginPage() {
  const { session, refreshProfile, isMockMode } = useAuth()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('pm@pskelektro.sk')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<UserRole>('Technik')
  const [password, setPassword] = useState('demo123')
  const [submitting, setSubmitting] = useState(false)

  if (session) return <Navigate to="/" replace />

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-card rounded-2xl p-8 space-y-6"
        onSubmit={async (event) => {
          event.preventDefault()
          try {
            setSubmitting(true)
            if (isMockMode || !hasSupabaseConfig) {
              if (mode === 'login') {
                await mockAuthService.signIn(email, password)
              } else {
                await mockAuthService.signUp(email, password, fullName, role)
              }
            } else if (mode === 'login') {
              await authService.signIn(email, password)
            } else {
              await authService.signUp(email, password, fullName, role as import('@/types/legacy').LegacyUserRole)
            }
            await refreshProfile()
            toast.success(mode === 'login' ? 'Prihlásenie prebehlo úspešne.' : 'Registrácia je hotová.')
          } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Autentifikácia zlyhala.')
          } finally {
            setSubmitting(false)
          }
        }}
      >
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
            <HardHat size={24} className="text-primary-foreground" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">PSK Elektro</p>
            <h1 className="text-2xl font-bold">{mode === 'login' ? 'Prihlásenie' : 'Registrácia'}</h1>
          </div>
        </div>

        <p className="text-sm text-muted">
          Fire Asset & Project Management System
          {isMockMode ? ' · Demo režim s mock dátami' : ''}
        </p>

        <div className="flex rounded-lg border border-border overflow-hidden">
          {(['login', 'register'] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                mode === m ? 'bg-primary text-primary-foreground' : 'text-muted hover:bg-surface-hover'
              }`}
              onClick={() => setMode(m)}
            >
              {m === 'login' ? 'Login' : 'Registrácia'}
            </button>
          ))}
        </div>

        {mode === 'register' ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="name">Meno a priezvisko</Label>
              <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Rola</Label>
              <Select id="role" value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
                {userRoles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </Select>
            </div>
          </>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Heslo</Label>
          <Input
            id="password"
            type="password"
            value={password}
            minLength={6}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {isMockMode ? (
          <p className="text-xs text-muted-foreground bg-surface/50 rounded-lg p-3 border border-border/50">
            Demo účty: admin@pskelektro.sk, pm@pskelektro.sk, tech@pskelektro.sk · heslo: ľubovoľné
          </p>
        ) : null}

        <Button type="submit" className="w-full" size="lg" disabled={submitting}>
          {submitting ? 'Spracúvam...' : mode === 'login' ? 'Prihlásiť sa' : 'Vytvoriť účet'}
        </Button>
      </motion.form>
    </div>
  )
}
