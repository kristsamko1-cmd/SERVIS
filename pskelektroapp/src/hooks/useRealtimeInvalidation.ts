import { useEffect } from 'react'
import { getSupabaseClient } from '../lib/supabase'
import { queryClient } from '../lib/queryClient'

const realtimeTables = ['projects', 'project_workers', 'tasks', 'task_updates', 'project_notes', 'project_photos', 'calendar_events']

export function useRealtimeInvalidation() {
  useEffect(() => {
    const db = getSupabaseClient()
    const channel = db.channel('app-realtime')

    realtimeTables.forEach((table) => {
      channel.on('postgres_changes', { event: '*', schema: 'public', table }, () => {
        void queryClient.invalidateQueries()
      })
    })

    void channel.subscribe()

    return () => {
      void db.removeChannel(channel)
    }
  }, [])
}
