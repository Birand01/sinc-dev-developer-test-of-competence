import type { Profile } from '../../../../Crm.Domain/entities/Profile';

/**
 * Port for reading user profiles.
 * Implemented by Crm.Infrastructure; consumed by Application use-cases.
 */
export interface IProfileRepository {
  getById(id: string): Promise<Profile | null>;
}
