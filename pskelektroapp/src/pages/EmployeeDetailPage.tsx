import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Mail, Phone, Wrench } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Avatar } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingState } from '@/components/ui/skeleton'
import { formatDate } from '@/lib/utils'
import {
  useAssets,
  useConstructionSites,
  useEmployee,
  useEmployees,
  useInventory,
  useProjects,
  useVehicles,
} from '@/hooks/useFleetData'

export function EmployeeDetailPage() {
  const { employeeId = '' } = useParams()
  const employeeQuery = useEmployee(employeeId)
  const { data: employees = [] } = useEmployees()
  const { data: sites = [] } = useConstructionSites()
  const { data: projects = [] } = useProjects()
  const { data: assets = [] } = useAssets()
  const { data: inventory = [] } = useInventory()
  const { data: vehicles = [] } = useVehicles()

  if (employeeQuery.isLoading) return <LoadingState />
  const employee = employeeQuery.data
  if (!employee) {
    return (
      <section>
        <p className="text-muted">Zamestnanec nebol nájdený.</p>
        <Link to="/zamestnanci" className="text-primary text-sm mt-2 inline-block">
          ← Späť
        </Link>
      </section>
    )
  }

  const supervisor = employees.find((e) => e.id === employee.supervisorId)
  const site = sites.find((s) => s.id === employee.currentSiteId)
  const project = projects.find((p) => p.id === employee.currentProjectId)
  const assignedTools = assets.filter((a) => employee.assignedEquipmentIds.includes(a.id))
  const assignedInventory = inventory.filter((i) => employee.assignedEquipmentIds.includes(i.id))
  const assignedVehicle = vehicles.find((v) => v.driverId === employee.id)

  return (
    <section className="animate-in">
      <Link to="/zamestnanci" className="inline-flex items-center gap-1 text-sm text-muted hover:text-primary mb-4">
        <ArrowLeft size={16} /> Späť na zamestnancov
      </Link>

      <Card className="p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <Avatar name={employee.name} size="lg" className="h-20 w-20 text-2xl" />
          <div className="flex-1">
            <PageHeader title={employee.name} description={employee.position} />
            <div className="flex flex-wrap gap-4 text-sm text-muted mt-2">
              <span className="flex items-center gap-1.5">
                <Mail size={14} /> {employee.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone size={14} /> {employee.phone}
              </span>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profil</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted text-xs uppercase tracking-wider mb-1">Oddelenie</p>
              <p>{employee.department}</p>
            </div>
            <div>
              <p className="text-muted text-xs uppercase tracking-wider mb-1">Pracovný pomer</p>
              <p>{employee.employmentType}</p>
            </div>
            <div>
              <p className="text-muted text-xs uppercase tracking-wider mb-1">Dátum nástupu</p>
              <p>{formatDate(employee.startDate)}</p>
            </div>
            <div>
              <p className="text-muted text-xs uppercase tracking-wider mb-1">Nadriadený</p>
              <p>{supervisor?.name ?? '—'}</p>
            </div>
            <div>
              <p className="text-muted text-xs uppercase tracking-wider mb-1">Aktuálna stavba</p>
              <p>{site?.name ?? '—'}</p>
            </div>
            <div>
              <p className="text-muted text-xs uppercase tracking-wider mb-1">Aktuálny projekt</p>
              <p>{project?.name ?? '—'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Wrench size={16} className="text-primary" /> Priradené vybavenie
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {assignedTools.map((t) => (
              <Link key={t.id} to={`/naradie/${t.id}`} className="block hover:text-primary py-1">
                {t.name} · {t.internalNumber}
              </Link>
            ))}
            {assignedInventory.map((i) => (
              <p key={i.id}>
                {i.name} · {i.serialNumber}
              </p>
            ))}
            {assignedVehicle ? (
              <Link to={`/auta/${assignedVehicle.id}`} className="block hover:text-primary py-1">
                {assignedVehicle.licensePlate} · {assignedVehicle.brand} {assignedVehicle.model}
              </Link>
            ) : null}
            {assignedTools.length === 0 && assignedInventory.length === 0 && !assignedVehicle ? (
              <p className="text-muted">Žiadne priradené vybavenie</p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
