import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useEmployees, useInventory } from '@/hooks/useFleetData'
import type { InventoryCategory } from '@/types/entities'

const categories: InventoryCategory[] = [
  'Notebook',
  'Telefón',
  'Monitor',
  'Tablet',
  'Tlačiareň',
  'Licencia',
  'SIM karta',
  'Kancelárske vybavenie',
]

export function InventoryPage() {
  const { data: items = [], isLoading } = useInventory()
  const { data: employees = [] } = useEmployees()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  const employeeMap = useMemo(() => new Map(employees.map((e) => [e.id, e.name])), [employees])

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        !search ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.serialNumber.toLowerCase().includes(search.toLowerCase())
      const matchCategory = !categoryFilter || item.category === categoryFilter
      return matchSearch && matchCategory
    })
  }, [items, search, categoryFilter])

  if (isLoading) {
    return (
      <section>
        <PageHeader title="Inventár" />
        <Skeleton className="h-96" />
      </section>
    )
  }

  return (
    <section className="animate-in">
      <PageHeader title="Inventár firmy" description="Notebooky, telefóny, monitory, licencie a ďalšie vybavenie." />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <Input placeholder="Hľadať..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-10 rounded-lg border border-border bg-surface/50 px-3 text-sm"
        >
          <option value="">Všetky kategórie</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Názov</TableHead>
            <TableHead>Kategória</TableHead>
            <TableHead>Sériové č.</TableHead>
            <TableHead>Používateľ</TableHead>
            <TableHead>Stav</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell className="text-muted">{item.category}</TableCell>
              <TableCell className="font-mono text-sm">{item.serialNumber}</TableCell>
              <TableCell>{item.assignedUserId ? employeeMap.get(item.assignedUserId) : '—'}</TableCell>
              <TableCell>
                <StatusBadge status={item.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
        {categories.map((cat) => {
          const count = items.filter((i) => i.category === cat).length
          return (
            <Card key={cat} className="p-4 text-center">
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-xs text-muted mt-1">{cat}</p>
            </Card>
          )
        })}
      </div>
    </section>
  )
}

export function InventoryCategoryPage({ category }: { category: InventoryCategory }) {
  const { data: items = [], isLoading } = useInventory()
  const { data: employees = [] } = useEmployees()
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    return items
      .filter((i) => i.category === category)
      .filter(
        (i) =>
          !search ||
          i.name.toLowerCase().includes(search.toLowerCase()) ||
          i.serialNumber.toLowerCase().includes(search.toLowerCase()),
      )
  }, [items, category, search])

  const employeeMap = new Map(employees.map((e) => [e.id, e.name]))

  if (isLoading) return <Skeleton className="h-96" />

  return (
    <section className="animate-in">
      <PageHeader title={category} description={`Prehľad položiek kategórie ${category}.`} />
      <div className="relative max-w-sm mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <Input placeholder="Hľadať..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <Card key={item.id} className="p-4">
            <div className="flex justify-between items-start mb-2">
              <p className="font-medium">{item.name}</p>
              <StatusBadge status={item.status} />
            </div>
            <p className="text-xs font-mono text-muted">{item.serialNumber}</p>
            <p className="text-xs text-muted-foreground mt-2">
              {item.assignedUserId ? employeeMap.get(item.assignedUserId) : 'Nepriradené'}
            </p>
          </Card>
        ))}
      </div>
    </section>
  )
}
