import type { Client } from '../../../Crm.Domain/entities/Client';

/** Row shape returned by Supabase from public.clients (snake_case columns). */
export type ClientRow = {
  id: string;
  profile_id: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  country: string | null;
  target_country: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

/** Maps a Supabase clients row to the domain Client entity. */
export function toClient(row: ClientRow): Client {
  return {
    id: row.id,
    profileId: row.profile_id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    country: row.country,
    targetCountry: row.target_country,
    createdBy: row.created_by,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}
