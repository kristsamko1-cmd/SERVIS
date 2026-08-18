import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDate } from '@/lib/utils'
import { useEmployees, useMeasuringDevices } from '@/hooks/useFleetData'

export function MeasuringDevicesPage() {
  const { data: devices = [], isLoading } = useMeasuringDevices()
  const { data: employees = [] } = useEmployees()
  const employeeMap = new Map(employees.map((e) => [e.id, e.name]))

  if (isLoading) {
    return (
      <section>
        <PageHeader title="Meracie prístroje" />
        <Skeleton className="h-96" />
      </section>
    )
  }

  return (
    <section className="animate-in">
      <PageHeader title="Meracie prístroje" description="Kalibrácia a priradenie meracích prístrojov." />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Názov</TableHead>
            <TableHead>Výrobca / Model</TableHead>
            <TableHead>Sériové č.</TableHead>
            <TableHead>Kalibrácia</TableHead>
            <TableHead>Používateľ</TableHead>
            <TableHead>Stav</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {devices.map((device) => (
            <TableRow key={device.id}>
              <TableCell className="font-medium">{device.name}</TableCell>
              <TableCell className="text-muted">
                {device.manufacturer} {device.model}
              </TableCell>
              <TableCell className="font-mono text-sm">{device.serialNumber}</TableCell>
              <TableCell className="text-sm">
                {formatDate(device.calibrationDate)} → {formatDate(device.nextCalibrationDate)}
              </TableCell>
              <TableCell>{device.assignedUserId ? employeeMap.get(device.assignedUserId) : '—'}</TableCell>
              <TableCell>
                <StatusBadge status={device.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="grid sm:grid-cols-3 gap-4 mt-6">
        {devices.map((device) => (
          <Card key={device.id} className="p-4">
            <p className="font-medium text-sm">{device.name}</p>
            <p className="text-xs font-mono text-muted mt-1">{device.qrCode}</p>
            <StatusBadge status={device.status} className="mt-2" />
          </Card>
        ))}
      </div>
    </section>
  )
}
