import { Outlet } from 'react-router-dom'
import { NavLink } from 'react-router-dom'
import { mobileNavLinks, Sidebar } from './Sidebar'
import { TopNavbar } from './TopNavbar'
import { cn } from '@/lib/utils'

export function AppShell() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 overflow-x-hidden">
          <Outlet />
        </main>
        <nav
          className="lg:hidden fixed bottom-0 inset-x-0 z-40 flex items-center justify-around h-16 border-t border-border/50 bg-surface/90 backdrop-blur-xl px-2"
          aria-label="Mobilná navigácia"
        >
          {mobileNavLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-colors min-w-[56px]',
                  isActive ? 'text-primary' : 'text-muted',
                )
              }
            >
              <link.icon size={20} />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}
