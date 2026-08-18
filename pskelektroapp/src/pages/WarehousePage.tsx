import { useMemo, useState } from 'react'
import { AlertTriangle, Search } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { useWarehouseItems } from '@/hooks/useFleetData'

export function WarehousePage() {
  const { data: items = [], isLoading } = useWarehouseItems()
  const [search, setSearch] = useState('')

  const filtered = useMemo(
    () =>
      items.filter(
        (i) =>
          !search ||
          i.name.toLowerCase().includes(search.toLowerCase()) ||
          i.sku.toLowerCase().includes(search.toLowerCase()) ||
          i.category.toLowerCase().includes(search.toLowerCase()),
      ),
    [items, search],
  )

  const lowStock = items.filter((i) => i.quantity <= i.minQuantity)

  if (isLoading) {
    return (
      <section>
        <PageHeader title="Sklad" />
        <Skeleton className="h-96" />
      </section>
    )
  }

  return (
    <section className="animate-in">
      <PageHeader title="Sklad" description="Skladové zásoby a materiál pre montáže." />

      {lowStock.length > 0 ? (
        <Card className="p-4 mb-6 border-warning/30 bg-warning/5">
          <div className="flex items-center gap-2 text-warning">
            <AlertTriangle size={18} />
            <p className="text-sm font-medium">{lowStock.length} položiek pod minimálnym stavom</p>
          </div>
        </Card>
      ) : null}

      <div className="relative max-w-sm mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <Input placeholder="Hľadať materiál..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Názov</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Kategória</TableHead>
            <TableHead>Množstvo</TableHead>
            <TableHead>Min.</TableHead>
            <TableHead>Lokácia</TableHead>
            <TableHead>Doplnené</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell className="font-mono text-sm">{item.sku}</TableCell>
              <TableCell className="text-muted">{item.category}</TableCell>
              <TableCell>
                <span
                  className={cn(
                    'font-semibold',
                    item.quantity <= item.minQuantity ? 'text-warning' : 'text-foreground',
                  )}
                >
                  {item.quantity} {item.unit}
                </span>
              </TableCell>
              <TableCell className="text-muted">
                {item.minQuantity} {item.unit}
              </TableCell>
              <TableCell className="font-mono">{item.location}</TableCell>
              <TableCell className="text-muted text-sm">{formatDate(item.lastRestocked)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  )
}
