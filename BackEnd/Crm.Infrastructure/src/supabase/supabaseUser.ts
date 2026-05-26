import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase user-scoped client factory.
 *
 * Uses the anon key + caller JWT so Postgres RLS policies apply.
 * Pass the raw access token (no "Bearer " prefix).
 */
export function createSupabaseUserClient(
  supabaseUrl: string,
  anonKey: string,
  accessToken: string,
): SupabaseClient {
  return createClient(supabaseUrl, anonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
