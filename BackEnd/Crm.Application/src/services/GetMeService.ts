import type { Profile } from '../../../Crm.Domain/entities/Profile';
import type { IProfileRepository } from '../interfaces/repositories/IProfileRepository';

/**
 * Use-case: return the authenticated user's profile.
 * Used by GET /api/me; HTTP status mapping stays in Crm.Api.
 */
export class GetMeService {
  constructor(private readonly profileRepository: IProfileRepository) {}

  async execute(userId: string): Promise<Profile | null> {
    return this.profileRepository.getById(userId);
  }
}
