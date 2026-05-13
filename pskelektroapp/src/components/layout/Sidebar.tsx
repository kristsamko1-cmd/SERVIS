import { Archive, CalendarDays, FolderKanban, LayoutDashboard, ListChecks, Plus } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../app/AuthContext'

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/stavby', label: 'Stavby', icon: FolderKanban },
  { to: '/ulohy', label: 'Úlohy', icon: ListChecks },
  { to: '/kalendar', label: 'Kalendár', icon: CalendarDays },
  { to: '/archiv', label: 'Archív', icon: Archive },
]

export function Sidebar() {
  const { isManager } = useAuth()

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-dot" />
        <div>
          <p className="muted">PSK Elektro</p>
          <strong>Interný systém</strong>
        </div>
      </div>

      <nav className="nav">
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} end={link.to === '/'} className="nav-link">
            <link.icon size={19} />
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      {isManager ? (
        <NavLink to="/stavby?nova=1" className="quick-nav">
          <Plus size={18} />
          Nová stavba
        </NavLink>
      ) : null}
    </aside>
  )
}
