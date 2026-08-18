import { Bell, CheckCircle2 } from 'lucide-react'
import { useNotifications } from '@/hooks/useFleetData'
import { formatDateTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

const typeIcons: Record<string, string> = {
  servis: '🔧',
  stk: '🚗',
  rezervácia: '📅',
  vybavenie: '📦',
  projekt: '⚠️',
}

export function NotificationPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: notifications = [] } = useNotifications()
  const unread = notifications.filter((n) => !n.read)

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 glass-card rounded-xl shadow-2xl z-50 animate-in overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-primary" />
            <span className="font-medium text-sm">Notifikácie</span>
            {unread.length > 0 ? (
              <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full font-bold">
                {unread.length}
              </span>
            ) : null}
          </div>
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="px-4 py-8 text-sm text-muted text-center">Žiadne notifikácie</p>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  'px-4 py-3 border-b border-border/30 hover:bg-surface-hover/50 transition-colors',
                  !notification.read && 'bg-primary/5',
                )}
              >
                <div className="flex gap-3">
                  <span className="text-lg shrink-0">{typeIcons[notification.type] ?? '📌'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium">{notification.title}</p>
                      {notification.read ? (
                        <CheckCircle2 size={14} className="text-muted shrink-0 mt-0.5" />
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-xs text-muted mt-0.5">{notification.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{formatDateTime(notification.createdAt)}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}
