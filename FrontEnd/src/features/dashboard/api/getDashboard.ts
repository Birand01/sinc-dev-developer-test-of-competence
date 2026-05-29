import type { DashboardResponse } from '@/features/dashboard/types'
import { apiFetch } from '@/lib/apiClient'

/**
 * Fetch manager/sales dashboard aggregates from the Worker.
 *
 * Requires JWT. 403 — client role; 401 — missing/invalid token.
 */
export function getDashboard(): Promise<DashboardResponse> {
  return apiFetch<DashboardResponse>('/api/dashboard')
}
