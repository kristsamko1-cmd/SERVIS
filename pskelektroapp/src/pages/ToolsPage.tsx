import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { QrCode, Search } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDateTime } from '@/lib/utils'
import { useAssetCategories, useAssets, useEmployees } from '@/hooks/useFleetData'

export function ToolsPage() {
  const { data: assets = [], isLoading } = useAssets()
  const { data: categories = [] } = useAssetCategories()
  const { data: employees = [] } = useEmployees()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories])
  const employeeMap = useMemo(() => new Map(employees.map((e) => [e.id, e.name])), [employees])

  const filtered = useMemo(() => {
    return assets.filter((a) => {
      const matchSearch =
        !search ||
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.manufacturer.toLowerCase().includes(search.toLowerCase()) ||
        a.internalNumber.toLowerCase().includes(search.toLowerCase()) ||
        a.serialNumber.toLowerCase().includes(search.toLowerCase())
      const matchStatus = !statusFilter || a.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [assets, search, statusFilter])

  if (isLoading) {
    return (
      <section>
        <PageHeader title="Náradie" />
        <Skeleton className="h-96" />
      </section>
    )
  }

  return (
    <section className="animate-in">
      <PageHeader
        title="Náradie"
        description="Správa zdieľaného náradia firmy — najdôležitejší modul systému."
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <Input
            placeholder='Hľadať "Hilti", sériové číslo...'
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
          <option value="Voľné">Voľné</option>
          <option value="Rezervované">Rezervované</option>
          <option value="Na stavbe">Na stavbe</option>
          <option value="V servise">V servise</option>
          <option value="Stratené">Stratené</option>
        </select>
      </div>

      <div className="hidden lg:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Názov</TableHead>
              <TableHead>Kategória</TableHead>
              <TableHead>Interné č.</TableHead>
              <TableHead>Používateľ</TableHead>
              <TableHead>Stav</TableHead>
              <TableHead>QR</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((asset) => (
              <TableRow key={asset.id}>
                <TableCell>
                  <Link to={`/naradie/${asset.id}`} className="font-medium hover:text-primary">
                    {asset.name}
                  </Link>
                  <p className="text-xs text-muted">{asset.manufacturer} {asset.model}</p>
                </TableCell>
                <TableCell className="text-muted">{categoryMap.get(asset.categoryId) ?? '—'}</TableCell>
                <TableCell className="font-mono text-sm">{asset.internalNumber}</TableCell>
                <TableCell>{asset.currentUserId ? employeeMap.get(asset.currentUserId) : '—'}</TableCell>
                <TableCell>
                  <StatusBadge status={asset.status} />
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1 text-xs text-muted font-mono">
                    <QrCode size={12} /> {asset.qrCode}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="lg:hidden grid gap-3">
        {filtered.map((asset) => (
          <Link key={asset.id} to={`/naradie/${asset.id}`}>
            <Card className="p-4 hover:border-primary/30">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{asset.name}</p>
                  <p className="text-xs text-muted font-mono mt-1">{asset.internalNumber}</p>
                  {asset.borrowedAt ? (
                    <p className="text-xs text-muted-foreground mt-1">Od {formatDateTime(asset.borrowedAt)}</p>
                  ) : null}
                </div>
                <StatusBadge status={asset.status} />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
