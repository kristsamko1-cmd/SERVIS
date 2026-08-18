import { Bell, LogOut } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useAuth } from '@/app/AuthContext'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { NotificationPanel } from '@/components/shared/NotificationPanel'
import { SearchDialog, SearchTrigger } from '@/components/shared/SearchDialog'
import { hasSupabaseConfig } from '@/lib/supabase'
import { authService } from '@/services/authService'
import { mockAuthService } from '@/services/mockAuthService'
import { useNotifications } from '@/hooks/useFleetData'

export function TopNavbar() {
  const { profile } = useAuth()
  const [searchOpen, setSearchOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const { data: notifications = [] } = useNotifications()
  const unreadCount = notifications.filter((n) => !n.read).length

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center gap-3 px-4 sm:px-6 h-16 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <SearchTrigger onClick={() => setSearchOpen(true)} />
        <div className="flex items-center gap-2 ml-auto">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Notifikácie"
              onClick={() => setNotifOpen((v) => !v)}
              className="relative"
            >
              <Bell size={18} />
              {unreadCount > 0 ? (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
              ) : null}
            </Button>
            <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Odhlásiť"
            onClick={async () => {
              try {
                if (hasSupabaseConfig) {
                  await authService.signOut()
                } else {
                  await mockAuthService.signOut()
                  window.location.href = '/prihlasenie'
                }
                toast.success('Odhlásenie prebehlo úspešne.')
              } catch (error) {
                toast.error(error instanceof Error ? error.message : 'Odhlásenie zlyhalo.')
              }
            }}
          >
            <LogOut size={18} />
          </Button>
          <div className="hidden sm:flex items-center gap-3 pl-2 border-l border-border/50 ml-1">
            <Avatar name={profile?.name ?? 'U'} size="sm" />
            <div className="hidden md:block">
              <p className="text-sm font-medium leading-none">{profile?.name ?? 'Používateľ'}</p>
              <p className="text-xs text-muted mt-0.5">{profile?.role ?? ''}</p>
            </div>
          </div>
        </div>
      </header>
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
