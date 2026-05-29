import type {
  ClientsListResponse,
  ListClientsParams,
} from '@/features/clients/types'
import { apiFetch } from '@/lib/apiClient'

/**
 * Fetch CRM clients from the Worker (GET /api/clients).
 *
 * Optional filters: ?q= search, ?ownerId= assigned owner profile id.
 */
export function getClients(
  params: ListClientsParams = {},
): Promise<ClientsListResponse> {
  const search = new URLSearchParams()
  if (params.q?.trim()) search.set('q', params.q.trim())
  if (params.ownerId?.trim()) search.set('ownerId', params.ownerId.trim())

  const query = search.toString()
  const path = query ? `/api/clients?${query}` : '/api/clients'

  return apiFetch<ClientsListResponse>(path)
}
