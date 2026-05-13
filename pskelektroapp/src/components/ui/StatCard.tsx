import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: string
  icon: ReactNode
}

export function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div>
        <p className="muted">{label}</p>
        <h3>{value}</h3>
      </div>
    </div>
  )
}
