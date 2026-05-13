import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { Skeleton } from '../components/ui/Skeleton'
import { formatDate } from '../lib/constants'
import { useProjects } from '../hooks/useAppData'

export function ArchivePage() {
  const projectsQuery = useProjects(true)
  const archivedProjects = (projectsQuery.data ?? []).filter((project) => project.archivedAt || project.status === 'Dokončené')

  if (projectsQuery.isLoading) {
    return (
      <section>
        <Skeleton rows={6} />
      </section>
    )
  }

  return (
    <section>
      <header className="page-header">
        <div>
          <h1>Archív</h1>
          <p className="muted">Dokončené a archivované stavby s dokumentáciou.</p>
        </div>
      </header>

      {archivedProjects.length === 0 ? (
        <EmptyState title="Archív je prázdny" text="Archivované stavby sa zobrazia po dokončení zákaziek." />
      ) : (
        <div className="project-grid">
          {archivedProjects.map((project) => (
            <Card key={project.id} title={project.name}>
              <p className="muted">{project.address}</p>
              <p>Úlohy: {project.completedTaskCount}/{project.taskCount}</p>
              <p>Archivované: {project.archivedAt ? formatDate(project.archivedAt) : 'po dokončení'}</p>
              <Link className="ghost-btn large-btn" to={`/stavby/${project.id}`}>
                Otvoriť detail
              </Link>
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}
