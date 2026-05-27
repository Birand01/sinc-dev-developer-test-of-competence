import type { Client } from '../../../../Crm.Domain/entities/Client';
import type {
  ClientListFilters,
  IClientRepository,
} from '../../interfaces/repositories/IClientRepository';

/**
 * Use-case: list CRM clients with optional search and owner filter.
 * Used by GET /api/clients; HTTP status mapping stays in Crm.Api.
 */
export class ListClientsService {
  constructor(private readonly clientRepository: IClientRepository) {}

  async execute(filters?: ClientListFilters): Promise<Client[]> {
    return this.clientRepository.list(filters);
  }
}
