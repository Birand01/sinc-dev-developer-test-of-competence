import type { Client } from '../../../Crm.Domain/entities/Client';
import type {
  CreateClientInput,
  IClientRepository,
} from '../interfaces/repositories/IClientRepository';

/**
 * Use-case: create a new CRM client (lead) record.
 * Used by POST /api/clients; HTTP status mapping stays in Crm.Api.
 */
export class CreateClientService {
  constructor(private readonly clientRepository: IClientRepository) {}

  async execute(input: CreateClientInput, createdBy: string): Promise<Client> {
    return this.clientRepository.create(input, createdBy);
  }
}
