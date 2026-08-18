import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDate } from '@/lib/utils'
import { useEmployees, useProjects } from '@/hooks/useFleetData'

export function ProjectsPage() {
  const { data: projects = [], isLoading } = useProjects()
  const { data: employees = [] } = useEmployees()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const employeeMap = useMemo(() => new Map(employees.map((e) => [e.id, e.name])), [employees])

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.client.toLowerCase().includes(search.toLowerCase())
      const matchStatus = !statusFilter || p.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [projects, search, statusFilter])

  if (isLoading) {
    return (
      <section>
        <PageHeader title="Projekty" />
        <Skeleton className="h-96" />
      </section>
    )
  }

  return (
    <section className="animate-in">
      <PageHeader title="Projekty" description="Správa projektov EPS, HSP, EZS a elektroinštalácií." />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <Input
            placeholder="Hľadať projekt alebo klienta..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-lg border border-border bg-surface/50 px-3 text-sm"
        >
          <option value="">Všetky stavy</option>
          <option value="Príprava">Príprava</option>
          <option value="Realizácia">Realizácia</option>
          <option value="Dokončené">Dokončené</option>
          <option value="Pozastavené">Pozastavené</option>
        </select>
      </div>

      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Projekt</TableHead>
              <TableHead>Klient</TableHead>
              <TableHead>Manažér</TableHead>
              <TableHead>Termín</TableHead>
              <TableHead>Stav</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((project) => (
              <TableRow key={project.id}>
                <TableCell>
                  <Link to={`/projekty/${project.id}`} className="font-medium hover:text-primary transition-colors">
                    {project.name}
                  </Link>
                  <p className="text-xs text-muted mt-0.5">{project.address}</p>
                </TableCell>
                <TableCell className="text-muted">{project.client}</TableCell>
                <TableCell>{employeeMap.get(project.managerId) ?? '—'}</TableCell>
                <TableCell className="text-muted text-sm">
                  {formatDate(project.startDate)} – {formatDate(project.endDate)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={project.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="md:hidden grid gap-3">
        {filtered.map((project) => (
          <Link key={project.id} to={`/projekty/${project.id}`}>
            <Card className="p-4 hover:border-primary/30 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{project.name}</p>
                  <p className="text-xs text-muted mt-1">{project.client}</p>
                </div>
                <StatusBadge status={project.status} />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
