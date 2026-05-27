import type { Client } from '../../../Crm.Domain/entities/Client';
import type { IClientRepository } from '../interfaces/repositories/IClientRepository';

/**
 * Use-case: load a single client by id.
 * Used by GET /api/clients/:clientId (client slice); HTTP status mapping stays in Crm.Api.
 */
export class GetClientByIdService {
  constructor(private readonly clientRepository: IClientRepository) {}

  async execute(clientId: string): Promise<Client | null> {
    return this.clientRepository.getById(clientId);
  }
}
