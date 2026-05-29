import type { ListClientsParams } from '@/features/clients/types'

/** React Query keys for client list reads — include filters in the key. */
export const clientsQueryKeys = {
  list: (params: ListClientsParams = {}) =>
    ['clients', 'list', params] as const,
}
