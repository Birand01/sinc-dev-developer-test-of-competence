import type { SupabaseClient } from '@supabase/supabase-js';
import type { Client } from '../../../Crm.Domain/entities/Client';
import { toClient, type ClientRow } from '../mappers/clientMapper';

/**
 * Data access for public.clients (Supabase Postgres).
 *
 * Project flow: Api → createSupabaseUserClient → ClientRepository → query (RLS)
 * → clientMapper.toClient → domain Client. CRM student/lead record; may link to
 * a Profile via profile_id when the client has a login.
 *
 * select('*'): toClient only maps known fields; join ambiguity N/A (single table).
 */
export class ClientRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Returns the client or null if not found / not visible under RLS.
   * maybeSingle: 0 rows → null; 1 row → data; 2+ rows → error (like FirstOrDefault
   * for a unique id, but rejects duplicate rows instead of silently taking the first).
   */
  async getById(id: string): Promise<Client | null> {
    const { data, error } = await this.supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to load client ${id}: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    return toClient(data as ClientRow);
  }
}
