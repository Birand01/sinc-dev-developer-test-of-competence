import type { Client } from '../../../../Crm.Domain/entities/Client';

/** Body for POST /api/clients (API contract). */
export interface CreateClientInput {
  fullName: string;
  email: string;
  phone?: string;
  country?: string;
  targetCountry?: string;
}

/** Filters for GET /api/clients (`q`, `ownerId` query params). */
export interface ClientListFilters {
  /** Search full_name or email (case-insensitive). */
  q?: string;
  /** Maps to clients.created_by (sales/manager who created the record). */
  ownerId?: string;
}

/**
 * Port for CRM clients (clients table).
 * Implemented by Crm.Infrastructure; consumed by Application use-cases.
 */
export interface IClientRepository {
  getById(id: string): Promise<Client | null>;
  list(filters?: ClientListFilters): Promise<Client[]>;
  /** `createdBy` is the authenticated profile id (clients.created_by). */
  create(input: CreateClientInput, createdBy: string): Promise<Client>;
}
