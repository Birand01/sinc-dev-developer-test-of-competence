import type { ListClientsParams } from '@/features/clients/types'

/**
 * React Query keys for client reads — include filters/id in the key.
 *
 * Detail keys must include clientId so React Query does not mix cache entries
 * when the same endpoint is called with different ids, e.g.
 * - ['clients', 'detail', 'abc-123'] → one client
 * - ['clients', 'detail', 'def-456'] → another client
 *
 * List keys use ['clients', 'list', params] and do not collide with detail keys.
 */
export const clientsQueryKeys = {
  list: (params: ListClientsParams = {}) =>
    ['clients', 'list', params] as const,
  /** Per-client detail; clientId in the key avoids cross-client cache bleed. */
  detail: (clientId: string) => ['clients', 'detail', clientId] as const,
}