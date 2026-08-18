import { useMemo } from 'react'
import { AlertTriangle, Calendar } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate } from '@/lib/utils'
import { useAssets, useEmployees, useInventory, useMeasuringDevices, useReservations, useVehicles } from '@/hooks/useFleetData'

function getResourceName(
  type: string,
  id: string,
  assets: { id: string; name: string }[],
  vehicles: { id: string; licensePlate: string; brand: string; model: string }[],
  inventory: { id: string; name: string }[],
  devices: { id: string; name: string }[],
) {
  if (type === 'náradie') return assets.find((a) => a.id === id)?.name ?? id
  if (type === 'auto') {
    const v = vehicles.find((x) => x.id === id)
    return v ? `${v.licensePlate} · ${v.brand} ${v.model}` : id
  }
  if (type === 'notebook') return inventory.find((i) => i.id === id)?.name ?? id
  if (type === 'merací prístroj') return devices.find((d) => d.id === id)?.name ?? id
  return id
}

export function ReservationsPage() {
  const { data: reservations = [], isLoading } = useReservations()
  const { data: employees = [] } = useEmployees()
  const { data: assets = [] } = useAssets()
  const { data: vehicles = [] } = useVehicles()
  const { data: inventory = [] } = useInventory()
  const { data: devices = [] } = useMeasuringDevices()

  const employeeMap = useMemo(() => new Map(employees.map((e) => [e.id, e.name])), [employees])

  const conflicts = useMemo(() => {
    const active = reservations.filter((r) => r.status === 'Aktívna')
    const found: string[] = []
    for (let i = 0; i < active.length; i++) {
      for (let j = i + 1; j < active.length; j++) {
        const a = active[i]
        const b = active[j]
        if (a.resourceId === b.resourceId && a.startDate <= b.endDate && b.startDate <= a.endDate) {
          found.push(`${a.id}-${b.id}`)
        }
      }
    }
    return found.length
  }, [reservations])

  if (isLoading) {
    return (
      <section>
        <PageHeader title="Rezervácie" />
        <Skeleton className="h-96" />
      </section>
    )
  }

  const activeReservations = reservations.filter((r) => r.status === 'Aktívna')

  return (
    <section className="animate-in">
      <PageHeader title="Rezervácie" description="Kalendár rezervácií náradia, áut a vybavenia." />

      {conflicts > 0 ? (
        <Card className="p-4 mb-6 border-danger/30 bg-danger/5">
          <div className="flex items-center gap-2 text-danger">
            <AlertTriangle size={18} />
            <p className="text-sm font-medium">Detekované konflikty rezervácií: {conflicts}</p>
          </div>
        </Card>
      ) : null}

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar size={16} className="text-primary" /> Aktívne rezervácie
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeReservations.map((res) => (
              <div key={res.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-lg bg-surface/50 border border-border/30">
                <div>
                  <p className="font-medium">
                    {getResourceName(res.resourceType, res.resourceId, assets, vehicles, inventory, devices)}
                  </p>
                  <p className="text-xs text-muted mt-1">
                    {res.resourceType} · {employeeMap.get(res.employeeId)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm">
                    {formatDate(res.startDate)} – {formatDate(res.endDate)}
                  </p>
                  <StatusBadge status={res.status} className="mt-1" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Kalendár</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
              {['Po', 'Ut', 'St', 'Št', 'Pi', 'So', 'Ne'].map((d) => (
                <span key={d} className="text-muted-foreground py-1">
                  {d}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }).map((_, i) => {
                const day = i - 2
                const hasReservation = day >= 18 && day <= 25 && day > 0 && day <= 31
                return (
                  <div
                    key={i}
                    className={`aspect-square rounded-md flex items-center justify-center text-xs ${
                      day > 0 && day <= 31
                        ? hasReservation
                          ? 'bg-primary/20 text-primary font-bold'
                          : 'hover:bg-surface-hover'
                        : ''
                    } ${day === 18 ? 'ring-2 ring-primary' : ''}`}
                  >
                    {day > 0 && day <= 31 ? day : ''}
                  </div>
                )
              })}
            </div>
            <p className="text-xs text-muted mt-4">August 2026 · žlté dni = rezervácie</p>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
