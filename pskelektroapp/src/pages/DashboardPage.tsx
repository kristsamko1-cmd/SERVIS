import { Activity, AlertTriangle, CalendarClock, FolderKanban, ListChecks, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { ProgressBar } from '../components/ui/ProgressBar'
import { Skeleton } from '../components/ui/Skeleton'
import { StatCard } from '../components/ui/StatCard'
import { formatDate, todayIso } from '../lib/constants'
import { useCalendarEvents, useProjects, useTasks } from '../hooks/useAppData'

export function DashboardPage() {
  const projectsQuery = useProjects()
  const tasksQuery = useTasks()
  const eventsQuery = useCalendarEvents()
  const projects = projectsQuery.data ?? []
  const tasks = tasksQuery.data ?? []
  const events = eventsQuery.data ?? []
  const today = todayIso()
  const loading = projectsQuery.isLoading || tasksQuery.isLoading
  const activeProjects = projects.filter((project) => project.status !== 'Dokončené')
  const openTasks = tasks.filter((task) => task.status !== 'Hotové')
  const urgentTasks = tasks.filter((task) => task.urgent || task.priority === 'Vysoká')
  const averageProgress = projects.length
    ? Math.round(projects.reduce((total, project) => total + project.progress, 0) / projects.length)
    : 0

  if (loading) {
    return (
      <section>
        <header className="page-header">
          <div>
            <h1>Dashboard</h1>
            <p className="muted">Načítavam operatívny prehľad.</p>
          </div>
        </header>
        <Skeleton rows={8} />
      </section>
    )
  }

  return (
    <section>
      <header className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="muted">Rýchly prehľad stavieb, úloh, termínov a poslednej aktivity.</p>
        </div>
      </header>

      <div className="stats-grid">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <StatCard label="Aktívne stavby" value={String(activeProjects.length)} icon={<FolderKanban size={18} />} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}>
          <StatCard label="Otvorené úlohy" value={String(openTasks.length)} icon={<ListChecks size={18} />} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <StatCard label="Najbližšie termíny" value={String(events.filter((event) => event.date >= today).length)} icon={<CalendarClock size={18} />} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
          <StatCard label="Priemerný progres" value={`${averageProgress}%`} icon={<TrendingUp size={18} />} />
        </motion.div>
      </div>

      <div className="grid-2">
        <Card title="Aktívne stavby">
          {activeProjects.length === 0 ? (
            <EmptyState title="Žiadne aktívne stavby" text="Nové stavby vytvoríte v sekcii Stavby." />
          ) : (
            activeProjects.slice(0, 5).map((project) => (
              <div key={project.id} className="row-item">
                <div>
                  <strong>{project.name}</strong>
                  <p className="muted">{project.address}</p>
                </div>
                <div className="row-right">
                  <span>{project.progress}%</span>
                  <ProgressBar value={project.progress} />
                </div>
              </div>
            ))
          )}
        </Card>

        <Card title="Dnešné a urgentné úlohy">
          {openTasks.length === 0 ? (
            <EmptyState title="Bez otvorených úloh" text="Všetky úlohy sú hotové alebo čakajú na nové zadanie." />
          ) : (
            openTasks
              .filter((task) => task.deadline <= today || task.urgent || task.priority === 'Vysoká')
              .slice(0, 6)
              .map((task) => (
                <div key={task.id} className="row-item">
                  <div>
                    <strong>{task.title}</strong>
                    <p className="muted">Deadline: {formatDate(task.deadline)}</p>
                  </div>
                  <span className="status-inline">
                    {urgentTasks.some((item) => item.id === task.id) ? <AlertTriangle size={15} /> : null}
                    {task.status}
                  </span>
                </div>
              ))
          )}
        </Card>
      </div>

      <div className="grid-2">
        <Card title="Graf progresu">
          <div className="chart-bars">
            {activeProjects.slice(0, 8).map((project) => (
              <div key={project.id} className="chart-row">
                <span>{project.name}</span>
                <div className="chart-track">
                  <div style={{ width: `${project.progress}%` }} />
                </div>
                <strong>{project.progress}%</strong>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Posledná aktivita">
          {[...projects]
            .sort((first, second) => new Date(second.updatedAt).getTime() - new Date(first.updatedAt).getTime())
            .slice(0, 6)
            .map((project) => (
              <div key={project.id} className="row-item">
                <span className="status-inline">
                  <Activity size={15} />
                  {project.name}
                </span>
                <span className="muted">{formatDate(project.updatedAt)}</span>
              </div>
            ))}
        </Card>
      </div>
    </section>
  )
}
