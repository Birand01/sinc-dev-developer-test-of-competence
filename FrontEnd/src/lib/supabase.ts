import { createClient, type SupabaseClient } from '@supabase/supabase-js'

import { getSupabaseAnonKey, getSupabaseUrl } from '@/lib/env'

let client: SupabaseClient | null = null

/** Singleton Supabase client — login, session, and optional Realtime subscriptions. */
export function getSupabase(): SupabaseClient {
  if (!client) {
    client = createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  }
  return client
}

/** Access token for `Authorization: Bearer` on Worker API calls. */
export async function getAccessToken(): Promise<string | null> {
  const { data } = await getSupabase().auth.getSession()
  return data.session?.access_token ?? null
}
