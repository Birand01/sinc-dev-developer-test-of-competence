import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

import { useAuth } from '@/features/auth/AuthContext'
import { AUTHENTICATED_HOME } from '@/features/auth/constants'

type PublicOnlyRouteProps = {
  children: ReactNode
}

/**
 * Gate for public routes (landing, login alias).
 * Mirror of ProtectedRoute: session required vs session forbidden.
 *
 * Does NOT check CRM role (client | sales | manager) — Worker enforces that on API calls.
 * 1. isLoading → wait (same as ProtectedRoute — no redirect flash on refresh)
 * 2. isAuthenticated → CRM app entry (dashboard)
 * 3. else → render children (HomePage login panel)
 */
export function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
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

  if (isAuthenticated) {
    return <Navigate to={AUTHENTICATED_HOME} replace />
  }

  return children
}
