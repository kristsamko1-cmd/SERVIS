import { Bell, LogOut, Moon, Search, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useAuth } from '../../app/AuthContext'
import { authService } from '../../services/authService'

export function TopNavbar() {
  const { profile } = useAuth()
  const [lightMode, setLightMode] = useState(false)
  const initials = profile?.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  useEffect(() => {
    document.documentElement.classList.toggle('light-mode', lightMode)
  }, [lightMode])

  return (
    <header className="topbar">
      <button type="button" className="search-wrap command-trigger" onClick={() => toast.info('Command palette: Ctrl + K')}>
        <Search size={17} />
        <span>Hľadať stavbu, úlohu alebo poznámku...</span>
        <kbd>Ctrl K</kbd>
      </button>
      <div className="top-actions">
        <button
          type="button"
          className="icon-btn"
          aria-label="Prepnúť tému"
          onClick={() => setLightMode((current) => !current)}
        >
          {lightMode ? <Moon size={17} /> : <Sun size={17} />}
        </button>
        <button type="button" className="icon-btn notification-dot" aria-label="Notifikácie">
          <Bell size={17} />
        </button>
        <button
          type="button"
          className="icon-btn"
          aria-label="Odhlásiť"
          onClick={async () => {
            try {
              await authService.signOut()
              toast.success('Odhlásenie prebehlo úspešne.')
            } catch (error) {
              toast.error(error instanceof Error ? error.message : 'Odhlásenie zlyhalo.')
            }
          }}
        >
          <LogOut size={17} />
        </button>
        <div className="user-pill">
          <span className="user-avatar">{initials ?? 'U'}</span>
          <div>
            <strong>{profile?.name ?? 'Používateľ'}</strong>
            <p className="muted">{profile?.role ?? profile?.email ?? 'Neznáma rola'}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
