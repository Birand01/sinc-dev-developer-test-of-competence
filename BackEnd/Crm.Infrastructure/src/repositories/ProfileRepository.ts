import type { SupabaseClient } from '@supabase/supabase-js';
import type { IProfileRepository } from '../../../Crm.Application/src/interfaces/repositories/IProfileRepository';
import type { Profile } from '../../../Crm.Domain/entities/Profile';
import { mapMaybeSingle, throwIfSupabaseError } from '../helpers/repositoryHelpers';
import { toProfile, type ProfileRow } from '../mappers/profileMapper';
/**
 * Data access for public.profiles (Supabase Postgres).
 *
 * Project flow: Api receives JWT → createSupabaseUserClient → ProfileRepository
 * → Supabase query (RLS filters rows) → profileMapper.toProfile → domain Profile
 * for Application use-cases (IProfileRepository). Does not contain HTTP or business rules.
 *
 * select('*') notes: extra DB columns are not exposed to the API because toProfile
 * only maps id, full_name, role, created_at. Join ambiguity does not apply here
 * (single-table query). Without Supabase codegen, explicit column strings do not
 * add full compile-time safety either.
 */
export class ProfileRepository implements IProfileRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  /** Returns the profile or null if not found / not visible under RLS. */
  async getById(id: string): Promise<Profile | null> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    throwIfSupabaseError(error, `Failed to load profile ${id}`);
    return mapMaybeSingle(data as ProfileRow | null, toProfile);
  }
}
