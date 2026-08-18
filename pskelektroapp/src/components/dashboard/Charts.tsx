import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { ChartDataPoint } from '@/types/entities'

const tooltipStyle = {
  backgroundColor: '#1B1B1B',
  border: '1px solid #2e2e2e',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '12px',
}

function ChartSkeleton() {
  return <Skeleton className="h-[220px] w-full" />
}

export function ToolUsageChart({ data, loading }: { data?: ChartDataPoint[]; loading?: boolean }) {
  if (loading) return <ChartSkeleton />
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Využitie náradia</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="toolGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFC107" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#FFC107" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2e2e2e" />
            <XAxis dataKey="label" stroke="#737373" fontSize={12} />
            <YAxis stroke="#737373" fontSize={12} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey="value" stroke="#FFC107" fill="url(#toolGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function ProjectsMonthlyChart({ data, loading }: { data?: ChartDataPoint[]; loading?: boolean }) {
  if (loading) return <ChartSkeleton />
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Projekty mesačne</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2e2e2e" />
            <XAxis dataKey="label" stroke="#737373" fontSize={12} />
            <YAxis stroke="#737373" fontSize={12} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="value" fill="#FFC107" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function EmployeeWorkloadChart({ data, loading }: { data?: ChartDataPoint[]; loading?: boolean }) {
  if (loading) return <ChartSkeleton />
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Vyťaženosť zamestnancov</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#2e2e2e" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} stroke="#737373" fontSize={12} />
            <YAxis type="category" dataKey="label" stroke="#737373" fontSize={11} width={70} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, 'Vyťaženosť']} />
            <Bar dataKey="value" fill="#FFC107" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function WarehouseStockChart({ data, loading }: { data?: ChartDataPoint[]; loading?: boolean }) {
  if (loading) return <ChartSkeleton />
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Stav skladu</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2e2e2e" />
            <XAxis dataKey="label" stroke="#737373" fontSize={12} />
            <YAxis stroke="#737373" fontSize={12} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="value" fill="#FFC107" radius={[4, 4, 0, 0]} opacity={0.85} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
