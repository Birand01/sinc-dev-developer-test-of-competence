import { useQuery } from '@tanstack/react-query'

import { getMe } from '@/features/auth/api/getMe'
import { useAuth } from '@/features/auth/context/AuthContext'
import { authQueryKeys } from '@/features/auth/lib/queryKeys'

/**
 * CRM profile for the signed-in user (GET /api/me).
 *
 * Runs only when Supabase session exists — avoids 401 while logged out.
 * Pair with useAuth(): session = gate, me = identity/role for UI.
 */
export function useMe() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()

  return useQuery({
    queryKey: authQueryKeys.me,
    queryFn: getMe,
    enabled: isAuthenticated && !isAuthLoading,
  })
}
