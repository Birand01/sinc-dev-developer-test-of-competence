import { Route, Routes } from 'react-router-dom'

import { DashboardPage } from '@/app/pages/dashboard/DashboardPage'
import { HomePage } from '@/app/pages/home/HomePage'
import { LoginPage } from '@/app/pages/login/LoginPage'
import { ProtectedRoute } from '@/features/auth/ProtectedRoute'
import { PublicOnlyRoute } from '@/features/auth/PublicOnlyRoute'

/**
 * URL → screen mapping for the CRM.
 * BrowserRouter lives in main.tsx; route definitions stay here as the app grows.
 *
 * Public routes: session gate only (Supabase Auth). Role checks stay on the Worker.
 */
export function AppRouter() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicOnlyRoute>
            <HomePage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
