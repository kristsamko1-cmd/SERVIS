import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { AuthProvider } from './app/AuthContext'
import { queryClient } from './lib/queryClient'
import { router } from './app/router'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster richColors position="top-right" />
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
