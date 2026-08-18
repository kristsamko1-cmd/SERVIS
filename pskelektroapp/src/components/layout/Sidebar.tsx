import {
  BarChart3,
  Building2,
  Car,
  ClipboardList,
  FolderKanban,
  Gauge,
  HardHat,
  Laptop,
  LayoutDashboard,
  Package,
  QrCode,
  Settings,
  Smartphone,
  Users,
  Warehouse,
  Wrench,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'

const navLinks = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/projekty', label: 'Projekty', icon: FolderKanban },
  { to: '/stavby', label: 'Stavby', icon: Building2 },
  { to: '/zamestnanci', label: 'Zamestnanci', icon: Users },
  { to: '/naradie', label: 'Náradie', icon: Wrench },
  { to: '/inventar', label: 'Inventár', icon: Package },
  { to: '/sklad', label: 'Sklad', icon: Warehouse },
  { to: '/auta', label: 'Autá', icon: Car },
  { to: '/notebooky', label: 'Notebooky', icon: Laptop },
  { to: '/telefony', label: 'Telefóny', icon: Smartphone },
  { to: '/meracie-pristroje', label: 'Meracie prístroje', icon: Gauge },
  { to: '/rezervacie', label: 'Rezervácie', icon: ClipboardList },
  { to: '/qr-scanner', label: 'QR Scanner', icon: QrCode },
  { to: '/reporty', label: 'Reporty', icon: BarChart3 },
  { to: '/nastavenia', label: 'Nastavenia', icon: Settings },
]

export function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-border/50 bg-surface/40 backdrop-blur-xl h-screen sticky top-0">
      <div className="p-5 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
            <HardHat size={20} className="text-primary-foreground" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">PSK Elektro</p>
            <p className="text-sm font-bold">Asset Management</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                isActive
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-muted hover:text-foreground hover:bg-surface-hover',
              )
            }
          >
            <link.icon size={18} />
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border/50">
        <div className="glass rounded-lg p-3">
          <p className="text-xs text-muted">Demo režim</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Mock dáta · pripravené na Supabase</p>
        </div>
      </div>
    </aside>
  )
}

export const mobileNavLinks = [
  { to: '/', label: 'Domov', icon: LayoutDashboard, end: true },
  { to: '/naradie', label: 'Náradie', icon: Wrench },
  { to: '/qr-scanner', label: 'QR', icon: QrCode },
  { to: '/projekty', label: 'Projekty', icon: FolderKanban },
  { to: '/zamestnanci', label: 'Tím', icon: Users },
]
