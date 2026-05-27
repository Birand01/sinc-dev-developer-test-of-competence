import { createMiddleware } from 'hono/factory';
import { createSupabaseAdminClient } from '../../../Crm.Infrastructure/src/supabase/supabaseAdmin';
import { createSupabaseUserClient } from '../../../Crm.Infrastructure/src/supabase/supabaseUser';
import type { Env } from '../types/env';

/**
 * Auth gate for all /api/* routes.
 *
 * 1. Read Authorization: Bearer <jwt>
 * 2. Verify token via Supabase Auth (admin client — no DB query yet)
 * 3. Store userId + RLS-scoped supabase client on context for handlers
 *
 * Returns 401 if header missing, token invalid, or user not found.
 */
export const auth = createMiddleware<Env>(async (c, next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  // Admin client only for auth.getUser — validates JWT signature/expiry
  const supabaseAdmin = createSupabaseAdminClient(
    c.env.SUPABASE_URL,
    c.env.SUPABASE_SERVICE_ROLE_KEY,
  );

  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  // Handlers read these via c.get('userId') / c.get('supabase')
  c.set('userId', user.id);
  c.set('accessToken', token);
  c.set(
    'supabase',
    createSupabaseUserClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY, token),
  );

  await next();
});
