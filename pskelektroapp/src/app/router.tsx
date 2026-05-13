import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { RequireAuth } from './RequireAuth'
import { ArchivePage } from '../pages/ArchivePage'
import { CalendarPage } from '../pages/CalendarPage'
import { DashboardPage } from '../pages/DashboardPage'
import { LoginPage } from '../pages/LoginPage'
import { ProjectDetailPage } from '../pages/ProjectDetailPage'
import { ProjectsPage } from '../pages/ProjectsPage'
import { TasksPage } from '../pages/TasksPage'

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
          { path: 'stavby', element: <ProjectsPage /> },
          { path: 'stavby/:projectId', element: <ProjectDetailPage /> },
          { path: 'ulohy', element: <TasksPage /> },
          { path: 'kalendar', element: <CalendarPage /> },
          { path: 'archiv', element: <ArchivePage /> },
        ],
      },
    ],
  },
])
