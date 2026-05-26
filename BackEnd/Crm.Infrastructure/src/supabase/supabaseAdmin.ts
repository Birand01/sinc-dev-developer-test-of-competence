import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase admin client factory.
 *
 * Uses the service_role key — full database access, RLS bypassed.
 * Server-side only; never expose this key to the frontend.
 *
 * Callers pass URL + key from Worker env (.dev.vars / Wrangler secrets).
 */
export function createSupabaseAdminClient(
  supabaseUrl: string,
  serviceRoleKey: string,
): SupabaseClient {
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
