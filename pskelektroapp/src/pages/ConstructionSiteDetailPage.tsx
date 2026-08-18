import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, MapPin } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingState } from '@/components/ui/skeleton'
import { useConstructionSite, useEmployees, useProjects } from '@/hooks/useFleetData'

export function ConstructionSiteDetailPage() {
  const { siteId = '' } = useParams()
  const siteQuery = useConstructionSite(siteId)
  const { data: projects = [] } = useProjects()
  const { data: employees = [] } = useEmployees()

  if (siteQuery.isLoading) return <LoadingState />
  const site = siteQuery.data
  if (!site) {
    return (
      <section>
        <p className="text-muted">Stavba nebola nájdená.</p>
        <Link to="/stavby" className="text-primary text-sm mt-2 inline-block">
          ← Späť
        </Link>
      </section>
    )
  }

  const siteProjects = projects.filter((p) => site.projectIds.includes(p.id))
  const workers = site.workerIds.map((id) => employees.find((e) => e.id === id)).filter(Boolean)

  return (
    <section className="animate-in">
      <Link to="/stavby" className="inline-flex items-center gap-1 text-sm text-muted hover:text-primary mb-4">
        <ArrowLeft size={16} /> Späť na stavby
      </Link>
      <PageHeader title={site.name} description={site.address} actions={<StatusBadge status={site.status} />} />

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin size={16} className="text-primary" /> Detaily
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-3">
            <p>
              <span className="text-muted">GPS: </span>
              {site.gps ? `${site.gps.lat}, ${site.gps.lng}` : '—'}
            </p>
            <p>
              <span className="text-muted">Projektov: </span>
              {siteProjects.length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Projekty</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {siteProjects.map((p) => (
              <Link key={p.id} to={`/projekty/${p.id}`} className="block text-sm hover:text-primary py-1">
                {p.name}
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Pracovníci na stavbe</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {workers.map((w) =>
              w ? (
                <Link key={w.id} to={`/zamestnanci/${w.id}`} className="text-sm hover:text-primary">
                  {w.name}
                  <span className="block text-xs text-muted">{w.position}</span>
                </Link>
              ) : null,
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
