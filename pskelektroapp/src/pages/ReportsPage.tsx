import { useState } from 'react'
import { Download, FileSpreadsheet, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input, Label, Select } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAssets, useEmployees, useProjects, useConstructionSites } from '@/hooks/useFleetData'

export function ReportsPage() {
  const { data: assets = [] } = useAssets()
  const { data: employees = [] } = useEmployees()
  const { data: projects = [] } = useProjects()
  const { data: sites = [] } = useConstructionSites()

  const [employeeFilter, setEmployeeFilter] = useState('')
  const [projectFilter, setProjectFilter] = useState('')
  const [siteFilter, setSiteFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('2026-01-01')
  const [dateTo, setDateTo] = useState('2026-12-31')

  const filteredAssets = assets.filter((a) => {
    if (categoryFilter && a.categoryId !== categoryFilter) return false
    if (employeeFilter && a.currentUserId !== employeeFilter) return false
    return true
  })

  const exportReport = (format: 'pdf' | 'excel' | 'csv') => {
    toast.success(`Export ${format.toUpperCase()} pripravený (demo režim).`)
  }

  return (
    <section className="animate-in">
      <PageHeader
        title="Reporty"
        description="Filtrovanie a export dát systému."
        actions={
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => exportReport('pdf')}>
              <FileText size={16} /> PDF
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportReport('excel')}>
              <FileSpreadsheet size={16} /> Excel
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportReport('csv')}>
              <Download size={16} /> CSV
            </Button>
          </div>
        }
      />

      <Card className="p-6 mb-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Zamestnanec</Label>
            <Select value={employeeFilter} onChange={(e) => setEmployeeFilter(e.target.value)}>
              <option value="">Všetci</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Projekt</Label>
            <Select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}>
              <option value="">Všetky</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Stavba</Label>
            <Select value={siteFilter} onChange={(e) => setSiteFilter(e.target.value)}>
              <option value="">Všetky</option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Kategória náradia</Label>
            <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="">Všetky</option>
              <option value="cat-1">Vŕtačky a kladivá</option>
              <option value="cat-2">Meracie prístroje</option>
              <option value="cat-3">Rezacie nástroje</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Dátum od</Label>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Dátum do</Label>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Náhľad reportu – Náradie</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Názov</TableHead>
                <TableHead>Interné č.</TableHead>
                <TableHead>Stav</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssets.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>{a.name}</TableCell>
                  <TableCell className="font-mono">{a.internalNumber}</TableCell>
                  <TableCell>{a.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  )
}
