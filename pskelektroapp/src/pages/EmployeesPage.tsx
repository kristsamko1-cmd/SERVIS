import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Avatar } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useEmployees } from '@/hooks/useFleetData'

export function EmployeesPage() {
  const { data: employees = [], isLoading } = useEmployees()
  const [search, setSearch] = useState('')

  const filtered = useMemo(
    () =>
      employees.filter(
        (e) =>
          !search ||
          e.name.toLowerCase().includes(search.toLowerCase()) ||
          e.position.toLowerCase().includes(search.toLowerCase()) ||
          e.department.toLowerCase().includes(search.toLowerCase()),
      ),
    [employees, search],
  )

  if (isLoading) {
    return (
      <section>
        <PageHeader title="Zamestnanci" />
        <Skeleton className="h-96" />
      </section>
    )
  }

  return (
    <section className="animate-in">
      <PageHeader title="Zamestnanci" description="Prehľad zamestnancov firmy a ich aktuálneho nasadenia." />

      <div className="relative max-w-sm mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <Input placeholder="Hľadať zamestnanca..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((employee) => (
          <Link key={employee.id} to={`/zamestnanci/${employee.id}`}>
            <Card className="p-5 hover:border-primary/30 transition-all group">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <Avatar name={employee.name} size="lg" />
                  <span
                    className={cn(
                      'absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-surface',
                      employee.isOnline ? 'bg-emerald-500' : 'bg-muted-foreground',
                    )}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold group-hover:text-primary transition-colors truncate">{employee.name}</h3>
                  <p className="text-sm text-primary/80">{employee.position}</p>
                  <p className="text-xs text-muted mt-1">{employee.department}</p>
                  <p className="text-xs text-muted-foreground mt-2 truncate">{employee.email}</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
