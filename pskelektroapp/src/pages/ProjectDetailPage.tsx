import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, FileText, MapPin, Users, Wrench } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingState } from '@/components/ui/skeleton'
import { formatDate } from '@/lib/utils'
import { useAssets, useEmployees, useProject, useVehicles } from '@/hooks/useFleetData'

export function ProjectDetailPage() {
  const { projectId = '' } = useParams()
  const projectQuery = useProject(projectId)
  const { data: employees = [] } = useEmployees()
  const { data: assets = [] } = useAssets()
  const { data: vehicles = [] } = useVehicles()

  if (projectQuery.isLoading) return <LoadingState />
  const project = projectQuery.data
  if (!project) {
    return (
      <section>
        <p className="text-muted">Projekt nebol nájdený.</p>
        <Link to="/projekty" className="text-primary text-sm mt-2 inline-block">
          ← Späť na projekty
        </Link>
      </section>
    )
  }

  const employeeMap = new Map(employees.map((e) => [e.id, e]))
  const projectTools = assets.filter((a) => project.toolIds.includes(a.id))
  const projectVehicles = vehicles.filter((v) => project.vehicleIds.includes(v.id))
  const workers = project.workerIds.map((id) => employeeMap.get(id)).filter(Boolean)

  return (
    <section className="animate-in">
      <Link to="/projekty" className="inline-flex items-center gap-1 text-sm text-muted hover:text-primary mb-4 transition-colors">
        <ArrowLeft size={16} /> Späť na projekty
      </Link>

      <PageHeader
        title={project.name}
        description={project.client}
        actions={<StatusBadge status={project.status} />}
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin size={16} className="text-primary" /> Informácie
              </CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted text-xs uppercase tracking-wider mb-1">Adresa</p>
                <p>{project.address}</p>
              </div>
              <div>
                <p className="text-muted text-xs uppercase tracking-wider mb-1">Termín</p>
                <p>
                  {formatDate(project.startDate)} – {formatDate(project.endDate)}
                </p>
              </div>
              <div>
                <p className="text-muted text-xs uppercase tracking-wider mb-1">Projektový manažér</p>
                <p>{employeeMap.get(project.managerId)?.name ?? '—'}</p>
              </div>
              <div>
                <p className="text-muted text-xs uppercase tracking-wider mb-1">GPS</p>
                <p>{project.gps ? `${project.gps.lat}, ${project.gps.lng}` : '—'}</p>
              </div>
            </CardContent>
          </Card>

          {project.notes ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Poznámky</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted">{project.notes}</p>
              </CardContent>
            </Card>
          ) : null}

          {project.documents.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText size={16} className="text-primary" /> Dokumenty
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {project.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                    <span className="text-sm">{doc.name}</span>
                    <span className="text-xs text-muted">{formatDate(doc.uploadedAt)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users size={16} className="text-primary" /> Pracovníci ({workers.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {workers.map((worker) =>
                worker ? (
                  <Link
                    key={worker.id}
                    to={`/zamestnanci/${worker.id}`}
                    className="block text-sm hover:text-primary transition-colors"
                  >
                    {worker.name}
                    <span className="text-muted text-xs block">{worker.position}</span>
                  </Link>
                ) : null,
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Wrench size={16} className="text-primary" /> Náradie ({projectTools.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {projectTools.map((tool) => (
                <Link key={tool.id} to={`/naradie/${tool.id}`} className="flex items-center justify-between text-sm hover:text-primary">
                  <span>{tool.name}</span>
                  <StatusBadge status={tool.status} />
                </Link>
              ))}
            </CardContent>
          </Card>

          {projectVehicles.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Vozidlá</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {projectVehicles.map((v) => (
                  <Link key={v.id} to={`/auta/${v.id}`} className="block text-sm hover:text-primary">
                    {v.licensePlate} · {v.brand} {v.model}
                  </Link>
                ))}
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </section>
  )
}
