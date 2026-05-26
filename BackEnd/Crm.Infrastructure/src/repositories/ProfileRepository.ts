import type { SupabaseClient } from '@supabase/supabase-js';
import type { Profile } from '../../../Crm.Domain/entities/Profile';
import { toProfile, type ProfileRow } from '../mappers/profileMapper';

/**
 * Data access for public.profiles (Supabase Postgres).
 *
 * Project flow: Api receives JWT → createSupabaseUserClient → ProfileRepository
 * → Supabase query (RLS filters rows) → profileMapper.toProfile → domain Profile
 * for Application rules and JSON responses. Does not contain HTTP or business rules.
 *
 * select('*') notes: extra DB columns are not exposed to the API because toProfile
 * only maps id, full_name, role, created_at. Join ambiguity does not apply here
 * (single-table query). Without Supabase codegen, explicit column strings do not
 * add full compile-time safety either.
 */
export class ProfileRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  /** Returns the profile or null if not found / not visible under RLS. */
  async getById(id: string): Promise<Profile | null> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to load profile ${id}: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    return toProfile(data as ProfileRow);
  }
}
