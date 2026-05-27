import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  ClientListFilters,
  CreateClientInput,
  IClientRepository,
} from '../../../Crm.Application/src/interfaces/repositories/IClientRepository';
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
export class ClientRepository implements IClientRepository {
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

  /**
   * Lists clients visible under RLS, optionally filtered by creator or search text.
   * `ownerId` → clients.created_by; `q` → case-insensitive match on full_name or email.
   */
  async list(filters?: ClientListFilters): Promise<Client[]> {
    let query = this.supabase.from('clients').select('*').order('created_at', {
      ascending: false,
    });

    if (filters?.ownerId) {
      query = query.eq('created_by', filters.ownerId);
    }

    const q = filters?.q?.trim();
    if (q) {
      const pattern = `%${q.replace(/[%_]/g, '\\$&')}%`;
      query = query.or(`full_name.ilike.${pattern},email.ilike.${pattern}`);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to list clients: ${error.message}`);
    }

    if (!data?.length) {
      return [];
    }

    return data.map((row) => toClient(row as ClientRow));
  }

  /**
   * Inserts a new lead/client row. profile_id stays null until the person has a login.
   * RLS clients_insert_staff: only sales or manager can insert.
   */
  async create(input: CreateClientInput, createdBy: string): Promise<Client> {
    const { data, error } = await this.supabase
      .from('clients')
      .insert({
        full_name: input.fullName,
        email: input.email,
        phone: input.phone ?? null,
        country: input.country ?? null,
        target_country: input.targetCountry ?? null,
        created_by: createdBy,
        profile_id: null,
      })
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to create client: ${error.message}`);
    }

    return toClient(data as ClientRow);
  }
}
