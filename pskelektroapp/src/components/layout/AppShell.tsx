import { Outlet } from 'react-router-dom'
import { CalendarDays, FolderKanban, LayoutDashboard, ListChecks } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopNavbar } from './TopNavbar'
import { useRealtimeInvalidation } from '../../hooks/useRealtimeInvalidation'

const mobileLinks = [
  { to: '/', label: 'Domov', icon: LayoutDashboard },
  { to: '/stavby', label: 'Stavby', icon: FolderKanban },
  { to: '/ulohy', label: 'Úlohy', icon: ListChecks },
  { to: '/kalendar', label: 'Kalendár', icon: CalendarDays },
]

export function AppShell() {
  useRealtimeInvalidation()

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="content-area">
        <TopNavbar />
        <main className="page-wrap">
          <Outlet />
        </main>
        <nav className="bottom-nav" aria-label="Mobilná navigácia">
          {mobileLinks.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === '/'}>
              <link.icon size={20} />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}
