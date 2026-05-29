import type { Client } from '../../../../Crm.Domain/entities/Client';

/**
 * One row for GET /api/clients — client record plus optional active pipeline deal.
 * Active = newest deal whose stage is not won/lost (see ListClientsService).
 */
export interface ClientListItem {
  client: Client;
  /** Deal title when an open pipeline deal exists; null otherwise. */
  activeDealTitle: string | null;
}
