import type { SupabaseClient } from '../../../Crm.Infrastructure/src/supabase/index';

/**
 * Hono context types for the Worker.
 *
 * Bindings — secrets from .dev.vars / Wrangler (available as c.env.*).
 * Variables — per-request values set by auth middleware (available as c.get(...)).
 */
export type Env = {
  Bindings: {
    SUPABASE_URL: string;
    SUPABASE_ANON_KEY: string;
    SUPABASE_SERVICE_ROLE_KEY: string;
  };
  Variables: {
    /** auth.users.id from verified JWT */
    userId: string;
    /** Raw access token (no "Bearer " prefix) */
    accessToken: string;
    /** User-scoped Supabase client; RLS applies to all queries */
    supabase: SupabaseClient;
  };
};
