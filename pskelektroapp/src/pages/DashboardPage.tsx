import {
  Building2,
  CalendarCheck,
  Car,
  Package,
  Users,
  Wrench,
} from 'lucide-react'
import { ActivityTimeline } from '@/components/dashboard/ActivityTimeline'
import {
  EmployeeWorkloadChart,
  ProjectsMonthlyChart,
  ToolUsageChart,
  WarehouseStockChart,
} from '@/components/dashboard/Charts'
import { PageHeader, StatCard } from '@/components/shared/PageHeader'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useActivities,
  useChartData,
  useDashboardStats,
} from '@/hooks/useFleetData'

export function DashboardPage() {
  const statsQuery = useDashboardStats()
  const activitiesQuery = useActivities()
  const toolUsageQuery = useChartData('toolUsage')
  const projectsQuery = useChartData('projectsMonthly')
  const workloadQuery = useChartData('employeeWorkload')
  const warehouseQuery = useChartData('warehouseStock')

  const loading = statsQuery.isLoading

  if (loading) {
    return (
      <section>
        <PageHeader title="Dashboard" description="Načítavam prehľad systému..." />
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      </section>
    )
  }

  const stats = statsQuery.data!

  return (
    <section className="animate-in">
      <PageHeader
        title="Dashboard"
        description="Prehľad stavieb, zamestnancov, náradia a aktivity firmy."
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <StatCard label="Aktívne stavby" value={stats.activeSites} icon={<Building2 size={20} />} delay={0} />
        <StatCard label="Online" value={stats.employeesOnline} icon={<Users size={20} />} delay={0.04} />
        <StatCard label="Náradie" value={stats.toolsCount} icon={<Wrench size={20} />} delay={0.08} />
        <StatCard label="Inventár" value={stats.inventoryCount} icon={<Package size={20} />} delay={0.12} />
        <StatCard label="Vozidlá" value={stats.vehiclesCount} icon={<Car size={20} />} delay={0.16} />
        <StatCard label="Rezervácie" value={stats.activeReservations} icon={<CalendarCheck size={20} />} delay={0.2} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <ToolUsageChart data={toolUsageQuery.data} loading={toolUsageQuery.isLoading} />
        <ProjectsMonthlyChart data={projectsQuery.data} loading={projectsQuery.isLoading} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <EmployeeWorkloadChart data={workloadQuery.data} loading={workloadQuery.isLoading} />
        <WarehouseStockChart data={warehouseQuery.data} loading={warehouseQuery.isLoading} />
      </div>

      <ActivityTimeline activities={activitiesQuery.data} loading={activitiesQuery.isLoading} />
    </section>
  )
}
