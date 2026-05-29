import { Route, Routes } from 'react-router-dom'

import { HomePage } from '@/app/pages/home/HomePage'
import { LoginPage } from '@/app/pages/login/LoginPage'
import { staffRoutes } from '@/app/staffRoutes'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from '@/features/auth/routes/ProtectedRoute'
import { PublicOnlyRoute } from '@/features/auth/routes/PublicOnlyRoute'

/**
 * URL → screen mapping for the CRM.
 * BrowserRouter lives in main.tsx; route definitions stay here as the app grows.
 *
 * Public routes: session gate only (Supabase Auth). Role checks stay on the Worker.
 * Staff paths + pages: staffRoutes.tsx (shared with AppLayout nav).
 *
 * Nested routing: parent <Route> renders AppLayout; child routes render inside its <Outlet />.
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
      {/* Layout parent: no path — wraps all staff URLs. Renders AppLayout shell once. */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/* Child routes: matched page renders inside AppLayout's <Outlet />. */}
        {staffRoutes.map(({ path, page: Page }) => (
          <Route key={path} path={path} element={<Page />} />
        ))}
      </Route>
    </Routes>
  )
}
