import { motion } from 'framer-motion'
import { ArrowDownLeft, ArrowUpRight, Calendar, Scan, UserPlus, Wrench } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate, formatTime } from '@/lib/utils'
import { useEmployees } from '@/hooks/useFleetData'
import type { ActivityEntry, HistoryAction } from '@/types/entities'

const actionIcons: Record<HistoryAction, React.ReactNode> = {
  Prevzal: <ArrowUpRight size={14} className="text-emerald-400" />,
  Odovzdal: <ArrowDownLeft size={14} className="text-blue-400" />,
  Rezervoval: <Calendar size={14} className="text-amber-400" />,
  Priradené: <Wrench size={14} className="text-primary" />,
  Servis: <Wrench size={14} className="text-orange-400" />,
  Naskenované: <Scan size={14} className="text-info" />,
  Pridané: <UserPlus size={14} className="text-emerald-400" />,
  Upravené: <Wrench size={14} className="text-muted" />,
}

export function ActivityTimeline({ activities, loading }: { activities?: ActivityEntry[]; loading?: boolean }) {
  const employeesQuery = useEmployees()
  const employeeMap = new Map((employeesQuery.data ?? []).map((e) => [e.id, e.name]))

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Posledná aktivita</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Posledná aktivita</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />
          <div className="space-y-1">
            {(activities ?? []).map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative flex gap-4 py-3 pl-10"
              >
                <div className="absolute left-2 top-4 h-[18px] w-[18px] rounded-full bg-surface border border-border flex items-center justify-center">
                  {actionIcons[activity.action]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">{employeeMap.get(activity.employeeId) ?? 'Neznámy'}</span>
                    <span className="text-muted"> {activity.action.toLowerCase()} </span>
                    <span className="font-medium text-primary">{activity.entityName}</span>
                  </p>
                  {activity.siteName ? (
                    <p className="text-xs text-muted-foreground mt-0.5">{activity.siteName}</p>
                  ) : null}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-muted">{formatDate(activity.timestamp)}</p>
                  <p className="text-xs text-muted-foreground">{formatTime(activity.timestamp)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
