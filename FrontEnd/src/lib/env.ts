/** Vite exposes only `VITE_*` vars to the client bundle (see .env.example). */

type EnvKey = keyof ImportMetaEnv

function readEnv(key: EnvKey): string {
  const raw = import.meta.env[key]
  if (typeof raw !== 'string' || !raw.trim()) {
    throw new Error(
      `Missing ${key}. Copy FrontEnd/.env.example to FrontEnd/.env and set your values.`,
    )
  }
  return raw.trim()
}

/** Supabase Auth + Realtime (browser-safe anon key; RLS applies). */
export function getSupabaseUrl(): string {
  return readEnv('VITE_SUPABASE_URL').replace(/\/$/, '')
}

export function getSupabaseAnonKey(): string {
  return readEnv('VITE_SUPABASE_ANON_KEY')
}

/** CRM Worker base URL for REST (`/api/me`, clients, deals, …). */
export function getApiBaseUrl(): string {
  return readEnv('VITE_API_BASE_URL').replace(/\/$/, '')
}
