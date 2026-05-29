import type { ClientListItem } from '../../dto/clients/ClientListItem';
import type { Client } from '../../../../Crm.Domain/entities/Client';
import type {
  ClientListFilters,
  IClientRepository,
} from '../../interfaces/repositories/IClientRepository';
import type { IDealRepository } from '../../interfaces/repositories/IDealRepository';

/**
 * Use-case: list CRM clients with optional search, owner filter, and active deal title.
 * Used by GET /api/clients; HTTP status mapping stays in Crm.Api.
 */
export class ListClientsService {
  constructor(
    private readonly clientRepository: IClientRepository,
    private readonly dealRepository: IDealRepository,
  ) {}

  async execute(filters?: ClientListFilters): Promise<ClientListItem[]> {
    const clients = await this.clientRepository.list(filters);
    if (clients.length === 0) {
      return [];
    }

    const activeDealTitleByClientId =
      await this.dealRepository.getActiveDealTitleByClientIds(
        clients.map((client) => client.id),
      );

    return clients.map((client) => toClientListItem(client, activeDealTitleByClientId));
  }
}

function toClientListItem(
  client: Client,
  activeDealTitleByClientId: Map<string, string>,
): ClientListItem {
  return {
    client,
    activeDealTitle: activeDealTitleByClientId.get(client.id) ?? null,
  };
}
