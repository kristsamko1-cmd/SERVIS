import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingState } from '@/components/ui/skeleton'
import { formatDate } from '@/lib/utils'
import { useEmployees, useProjects, useVehicle } from '@/hooks/useFleetData'

export function VehicleDetailPage() {
  const { vehicleId = '' } = useParams()
  const vehicleQuery = useVehicle(vehicleId)
  const { data: employees = [] } = useEmployees()
  const { data: projects = [] } = useProjects()

  if (vehicleQuery.isLoading) return <LoadingState />
  const vehicle = vehicleQuery.data
  if (!vehicle) {
    return (
      <section>
        <p className="text-muted">Vozidlo nebolo nájdené.</p>
        <Link to="/auta" className="text-primary text-sm mt-2 inline-block">
          ← Späť
        </Link>
      </section>
    )
  }

  const driver = employees.find((e) => e.id === vehicle.driverId)
  const project = projects.find((p) => p.id === vehicle.projectId)

  return (
    <section className="animate-in">
      <Link to="/auta" className="inline-flex items-center gap-1 text-sm text-muted hover:text-primary mb-4">
        <ArrowLeft size={16} /> Späť na vozidlá
      </Link>

      <PageHeader
        title={vehicle.licensePlate}
        description={`${vehicle.brand} ${vehicle.model} (${vehicle.year})`}
        actions={<StatusBadge status={vehicle.status} />}
      />

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informácie</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted text-xs uppercase tracking-wider mb-1">Vodič</p>
              <p>{driver?.name ?? '—'}</p>
            </div>
            <div>
              <p className="text-muted text-xs uppercase tracking-wider mb-1">Kilometre</p>
              <p>{vehicle.mileage.toLocaleString('sk-SK')} km</p>
            </div>
            <div>
              <p className="text-muted text-xs uppercase tracking-wider mb-1">Projekt</p>
              <p>{project?.name ?? '—'}</p>
            </div>
            <div>
              <p className="text-muted text-xs uppercase tracking-wider mb-1">GPS</p>
              <p>{vehicle.gps ? `${vehicle.gps.lat}, ${vehicle.gps.lng}` : '—'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Servis & dokumenty</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted text-xs uppercase tracking-wider mb-1">Posledný servis</p>
              <p>{formatDate(vehicle.lastServiceDate)}</p>
            </div>
            <div>
              <p className="text-muted text-xs uppercase tracking-wider mb-1">Ďalší servis</p>
              <p>{formatDate(vehicle.nextServiceDate)}</p>
            </div>
            <div>
              <p className="text-muted text-xs uppercase tracking-wider mb-1">STK do</p>
              <p>{formatDate(vehicle.stkExpiry)}</p>
            </div>
            <div>
              <p className="text-muted text-xs uppercase tracking-wider mb-1">Poistka do</p>
              <p>{formatDate(vehicle.insuranceExpiry)}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
