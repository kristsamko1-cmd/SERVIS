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
import { useEmployees, useVehicles } from '@/hooks/useFleetData'

export function VehiclesPage() {
  const { data: vehicles = [], isLoading } = useVehicles()
  const { data: employees = [] } = useEmployees()
  const [search, setSearch] = useState('')

  const employeeMap = useMemo(() => new Map(employees.map((e) => [e.id, e.name])), [employees])

  const filtered = useMemo(
    () =>
      vehicles.filter(
        (v) =>
          !search ||
          v.licensePlate.toLowerCase().includes(search.toLowerCase()) ||
          v.brand.toLowerCase().includes(search.toLowerCase()) ||
          v.model.toLowerCase().includes(search.toLowerCase()),
      ),
    [vehicles, search],
  )

  if (isLoading) {
    return (
      <section>
        <PageHeader title="Autá" />
        <Skeleton className="h-96" />
      </section>
    )
  }

  return (
    <section className="animate-in">
      <PageHeader title="Vozový park" description="Správa firemných vozidiel, servisov a STK." />

      <div className="relative max-w-sm mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <Input placeholder="Hľadať ŠPZ, značku..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ŠPZ</TableHead>
              <TableHead>Vozidlo</TableHead>
              <TableHead>Vodič</TableHead>
              <TableHead>Km</TableHead>
              <TableHead>STK</TableHead>
              <TableHead>Stav</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((vehicle) => (
              <TableRow key={vehicle.id}>
                <TableCell>
                  <Link to={`/auta/${vehicle.id}`} className="font-mono font-bold hover:text-primary">
                    {vehicle.licensePlate}
                  </Link>
                </TableCell>
                <TableCell>
                  {vehicle.brand} {vehicle.model}
                  <span className="text-xs text-muted block">{vehicle.year}</span>
                </TableCell>
                <TableCell>{vehicle.driverId ? employeeMap.get(vehicle.driverId) : '—'}</TableCell>
                <TableCell>{vehicle.mileage.toLocaleString('sk-SK')} km</TableCell>
                <TableCell className="text-sm">{formatDate(vehicle.stkExpiry)}</TableCell>
                <TableCell>
                  <StatusBadge status={vehicle.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="md:hidden grid gap-3">
        {filtered.map((vehicle) => (
          <Link key={vehicle.id} to={`/auta/${vehicle.id}`}>
            <Card className="p-4 hover:border-primary/30">
              <div className="flex justify-between">
                <div>
                  <p className="font-mono font-bold text-lg">{vehicle.licensePlate}</p>
                  <p className="text-sm text-muted">
                    {vehicle.brand} {vehicle.model}
                  </p>
                </div>
                <StatusBadge status={vehicle.status} />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
