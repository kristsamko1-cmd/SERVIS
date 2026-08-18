import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useConstructionSites } from '@/hooks/useFleetData'
import { StatusBadge } from '@/components/ui/badge'

export function ConstructionSitesPage() {
  const { data: sites = [], isLoading } = useConstructionSites()
  const [search, setSearch] = useState('')

  const filtered = useMemo(
    () =>
      sites.filter(
        (s) =>
          !search ||
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.address.toLowerCase().includes(search.toLowerCase()),
      ),
    [sites, search],
  )

  if (isLoading) {
    return (
      <section>
        <PageHeader title="Stavby" />
        <Skeleton className="h-96" />
      </section>
    )
  }

  return (
    <section className="animate-in">
      <PageHeader title="Stavby" description="Prehľad aktívnych a dokončených stavieb." />

      <div className="relative max-w-sm mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <Input placeholder="Hľadať stavbu..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((site) => (
          <Link key={site.id} to={`/stavby/${site.id}`}>
            <Card className="p-5 h-full hover:border-primary/30 transition-all group">
              <div className="flex items-start justify-between mb-3">
                <StatusBadge status={site.status} />
                <span className="text-xs text-muted">{site.workerIds.length} pracovníkov</span>
              </div>
              <h3 className="font-semibold group-hover:text-primary transition-colors">{site.name}</h3>
              <p className="text-sm text-muted mt-2">{site.address}</p>
              <p className="text-xs text-muted-foreground mt-3">{site.projectIds.length} projektov</p>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
