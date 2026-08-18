import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { RequireAuth } from '@/app/RequireAuth'
import { ConstructionSiteDetailPage } from '@/pages/ConstructionSiteDetailPage'
import { ConstructionSitesPage } from '@/pages/ConstructionSitesPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { EmployeeDetailPage } from '@/pages/EmployeeDetailPage'
import { EmployeesPage } from '@/pages/EmployeesPage'
import { InventoryPage } from '@/pages/InventoryPage'
import { LoginPage } from '@/pages/LoginPage'
import { MeasuringDevicesPage } from '@/pages/MeasuringDevicesPage'
import { NotebooksPage } from '@/pages/NotebooksPage'
import { PhonesPage } from '@/pages/PhonesPage'
import { ProjectDetailPage } from '@/pages/ProjectDetailPage'
import { ProjectsPage } from '@/pages/ProjectsPage'
import { QrScannerPage } from '@/pages/QrScannerPage'
import { ReportsPage } from '@/pages/ReportsPage'
import { ReservationsPage } from '@/pages/ReservationsPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { ToolDetailPage } from '@/pages/ToolDetailPage'
import { ToolsPage } from '@/pages/ToolsPage'
import { VehicleDetailPage } from '@/pages/VehicleDetailPage'
import { VehiclesPage } from '@/pages/VehiclesPage'
import { WarehousePage } from '@/pages/WarehousePage'

export const router = createBrowserRouter([
  {
    path: '/prihlasenie',
    element: <LoginPage />,
  },
  {
    element: <RequireAuth />,
    children: [
      {
        path: '/',
        element: <AppShell />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'projekty', element: <ProjectsPage /> },
          { path: 'projekty/:projectId', element: <ProjectDetailPage /> },
          { path: 'stavby', element: <ConstructionSitesPage /> },
          { path: 'stavby/:siteId', element: <ConstructionSiteDetailPage /> },
          { path: 'zamestnanci', element: <EmployeesPage /> },
          { path: 'zamestnanci/:employeeId', element: <EmployeeDetailPage /> },
          { path: 'naradie', element: <ToolsPage /> },
          { path: 'naradie/:toolId', element: <ToolDetailPage /> },
          { path: 'inventar', element: <InventoryPage /> },
          { path: 'sklad', element: <WarehousePage /> },
          { path: 'auta', element: <VehiclesPage /> },
          { path: 'auta/:vehicleId', element: <VehicleDetailPage /> },
          { path: 'notebooky', element: <NotebooksPage /> },
          { path: 'telefony', element: <PhonesPage /> },
          { path: 'meracie-pristroje', element: <MeasuringDevicesPage /> },
          { path: 'rezervacie', element: <ReservationsPage /> },
          { path: 'qr-scanner', element: <QrScannerPage /> },
          { path: 'reporty', element: <ReportsPage /> },
          { path: 'nastavenia', element: <SettingsPage /> },
        ],
      },
    ],
  },
])
