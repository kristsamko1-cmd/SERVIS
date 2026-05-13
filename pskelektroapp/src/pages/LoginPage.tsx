import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Zap } from 'lucide-react'
import { useAuth } from '../app/AuthContext'
import { roles } from '../lib/constants'
import { authService } from '../services/authService'
import type { UserRole } from '../types'

type Mode = 'login' | 'register'

export function LoginPage() {
  const { session, refreshProfile } = useAuth()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<UserRole>('Elektrikár')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (session) return <Navigate to="/" replace />

  return (
    <section className="login-page">
      <form
        className="login-card"
        onSubmit={async (event) => {
          event.preventDefault()
          try {
            setSubmitting(true)
            if (mode === 'login') {
              await authService.signIn(email, password)
              toast.success('Prihlásenie prebehlo úspešne.')
            } else {
              await authService.signUp(email, password, fullName, role)
              toast.success('Registrácia je hotová. Ak máte potvrdenie e-mailom, skontrolujte schránku.')
            }
            await refreshProfile()
          } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Autentifikácia zlyhala.')
          } finally {
            setSubmitting(false)
          }
        }}
      >
        <div className="login-brand">
          <span className="login-logo">
            <Zap size={22} />
          </span>
          <div>
            <p className="muted">PSK Elektro</p>
            <h1>{mode === 'login' ? 'Prihlásenie' : 'Registrácia'}</h1>
          </div>
        </div>
        <p className="muted">Interný systém pre stavby, úlohy, reporty a termíny.</p>

        <div className="segmented">
          <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>
            Login
          </button>
          <button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>
            Registrácia
          </button>
        </div>

        {mode === 'register' ? (
          <>
            <label className="form-field">
              Meno a priezvisko
              <input type="text" value={fullName} onChange={(event) => setFullName(event.target.value)} required />
            </label>
            <label className="form-field">
              Rola
              <select value={role} onChange={(event) => setRole(event.target.value as UserRole)}>
                {roles.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </>
        ) : null}

        <label className="form-field">
          E-mail
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>

        <label className="form-field">
          Heslo
          <input
            type="password"
            value={password}
            minLength={6}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>

        <button className="primary-btn large-btn" type="submit" disabled={submitting}>
          {submitting ? 'Spracúvam...' : mode === 'login' ? 'Prihlásiť sa' : 'Vytvoriť účet'}
        </button>
      </form>
    </section>
  )
}
