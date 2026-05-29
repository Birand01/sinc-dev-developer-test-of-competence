import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

import { useAuth } from '@/features/auth/AuthContext'

type ProtectedRouteProps = {
  children: ReactNode
}

/**
 * Gate for CRM screens that require a Supabase session.
 *
 * 1. isLoading → wait (avoid flashing redirect on refresh)
 * 2. !isAuthenticated → send to public home `/`
 * 3. else → render children (e.g. DashboardPage)
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoading, isAuthenticated } = useAuth()

  if (isLoading) {
    return (
      <div
        className="flex min-h-svh items-center justify-center"
        role="status"
        aria-live="polite"
      >
        <p className="text-muted-foreground text-sm">Loading…</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return children
}
